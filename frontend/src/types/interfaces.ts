export interface Player {
  id: string;
  summoner_id: string;
  summoner_name: string;
  puuid: string;
  profile_icon_id: number;
  tier?: string;
  rank?: string;
  league_points?: number;
  wins?: number;
  losses?: number;
  last_update?: string;
}

export interface Match {
  id: string;
  gameId: string;
  champion: string;
  kills: number;
  deaths: number;
  assists: number;
  result: boolean;
  createdAt: string;
}

export interface Game {
  gameId: string;
  gameCreation: number;
  gameDuration: number;
  championId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  kda: number;
  allies: Array<{
    championId: number;
    championName: string;
    summonerName: string;
    totalDamageDealtToChampions: number;
  }>;
  enemies: Array<{
    championId: number;
    championName: string;
    summonerName: string;
    totalDamageDealtToChampions: number;
  }>;
}


/////


// Interfaces pour l'API Riot
export interface SummonerResponse {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface RankedStats {
  leagueId: string;
  queueType: string;
  tier: string | null;
  rank: string | null;
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export interface Participant {
  puuid: string;
  championId: number;
  championName: string;
  summonerName: string;
  teamId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
}

export interface MatchResponse {
  info: {
    gameCreation: number;
    gameDuration: number;
    queueId: number;
    participants: Array<{
      puuid: string;
      championId: number;
      championName: string;
      summonerName: string;
      teamId: number;
      win: boolean;
      kills: number;
      deaths: number;
      assists: number;
      totalDamageDealtToChampions: number;
      riotIdGameName?: string;
      riotIdTagline?: string;
    }>;
  };
}

export interface MatchDetails {
  gameId: string;
  gameCreation: number;
  championId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  allies: Array<{
    championId: number;
    championName: string;
    summonerName: string;
  }>;
  enemies: Array<{
    championId: number;
    championName: string;
    summonerName: string;
  }>;
}