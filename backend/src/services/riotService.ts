import axios from 'axios';
import dotenv from 'dotenv';
import { RankedStats, MatchDetails, SummonerResponse, MatchResponse, Participant } from '../types/interfaces';
dotenv.config();

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const RIOT_API_BASE_URL = 'https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id';
const LOL_API_BASE_URL = 'https://euw1.api.riotgames.com/lol';



export const riotService = {
  getSummonerByName: async (gameName: string, tagLine: string) => {
    try {
      const response = await axios.get(
        `${RIOT_API_BASE_URL}/${gameName}/${tagLine}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          }
        }
      );

      const accountData = response.data;

      // Obtenir les données du summoner à partir du PUUID
      const summonerResponse = await axios.get(
        `${LOL_API_BASE_URL}/summoner/v4/summoners/by-puuid/${accountData.puuid}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          }
        }
      );

      return {
        ...summonerResponse.data,
        riotId: `${accountData.gameName}#${accountData.tagLine}`
      };
    } catch (error) {
      console.error('Error in getSummonerByName:', error);
      throw error;
    }
  },

  getRankedStats: async (summonerId: string): Promise<RankedStats[]> => {
    try {
      console.log('Fetching ranked stats for summoner:', summonerId);
      const response = await axios.get<RankedStats[]>(
        `${LOL_API_BASE_URL}/league/v4/entries/by-summoner/${summonerId}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          }
        }
      );
      
      console.log('Raw response from Riot API:', response.data);
      
      if (!response.data || response.data.length === 0) {
        return [{
          leagueId: '',
          queueType: 'RANKED_SOLO_5x5',
          tier: null,
          rank: null,
          summonerId: summonerId,
          summonerName: '',
          leaguePoints: 0,
          wins: 0,
          losses: 0,
          veteran: false,
          inactive: false,
          freshBlood: false,
          hotStreak: false
        }];
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 10;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return riotService.getRankedStats(summonerId); // Retry after waiting
      }
      console.error('Error in getRankedStats:', error);
      throw error;
    }
  },

  getMatchHistory: async (puuid: string): Promise<string[]> => {
    try {
      const response = await axios.get(
        `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          },
          params: {
            start: 0,
            count: 20,
            queue: 420,
            type: 'ranked'
          }
        }
      );
      return response.data.slice(0, 5);
    } catch (error) {
      console.error('Error in getMatchHistory:', error);
      throw error;
    }
  },

  getMatchDetails: async (matchId: string, puuid: string): Promise<MatchDetails | null> => {
    try {
      const response = await axios.get<MatchResponse>(
        `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          }
        }
      );

      // Vérifier si c'est une partie classée solo/duo
      if (response.data.info.queueId !== 420) {
        return null;
      }

      const participant = response.data.info.participants.find(
        (p) => p.puuid === puuid
      );

      if (!participant) {
        throw new Error('Participant not found in match');
      }

      // Fonction pour formater le nom du joueur
      const formatPlayerName = (player: any) => {
        if (player.riotIdGameName) {
          return player.riotIdGameName + (player.riotIdTagline ? ` #${player.riotIdTagline}` : '');
        }
        return player.summonerName;
      };

      const allies = response.data.info.participants.filter(
        p => p.teamId === participant.teamId && p.puuid !== puuid
      );
      const enemies = response.data.info.participants.filter(
        p => p.teamId !== participant.teamId
      );

      return {
        gameId: matchId,
        gameCreation: response.data.info.gameCreation,
        gameDuration: response.data.info.gameDuration,
        championId: participant.championId,
        win: participant.win,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
        allies: allies.map(ally => ({
          championId: ally.championId,
          championName: ally.championName,
          summonerName: formatPlayerName(ally),
          totalDamageDealtToChampions: ally.totalDamageDealtToChampions
        })),
        enemies: enemies.map(enemy => ({
          championId: enemy.championId,
          championName: enemy.championName,
          summonerName: formatPlayerName(enemy),
          totalDamageDealtToChampions: enemy.totalDamageDealtToChampions
        }))
      };
    } catch (error) {
      console.error('Error in getMatchDetails:', error);
      throw error;
    }
  },

  getActiveGame: async (puuid: string) => {
    try {
      const response = await axios.get(
        `https://euw1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          }
        }
      );
      return { inGame: true, data: response.data };
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return { inGame: false, data: null };
      }
      throw error;
    }
  },
};