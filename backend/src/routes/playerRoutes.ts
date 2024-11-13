import express from 'express';
import type { Request, Response, RequestHandler } from 'express';
import { riotService } from '../services/riotService.js';
import { supabase } from '../config/supabase.js';
import { updateAllPlayers } from '../controllers/playerController.js';

const router = express.Router();

// Gestionnaire pour obtenir tous les joueurs
const handleGetPlayers: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabase.from('players').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching players' });
  }
};

// Gestionnaire pour obtenir un joueur par ID
const handleGetPlayerById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching player' });
  }
};

// Gestionnaire pour ajouter un joueur
const handleAddPlayer: RequestHandler = async (req, res) => {
  try {
    const { summonerName } = req.body;
    console.log('Received summonerName:', summonerName);
    
    // Séparer le nom et le tag
    const [gameName, tagLine] = summonerName.split('#');
    console.log('Parsed name:', gameName, 'tag:', tagLine);
    
    if (!gameName || !tagLine) {
      res.status(400).json({ error: 'Format invalide. Utilisez le format: nom#tag' });
      return;
    }

    console.log('Calling Riot API...');
    const summonerData = await riotService.getSummonerByName(gameName, tagLine);
    console.log('Summoner data:', summonerData);

    console.log('Getting ranked stats...');
    const rankedStats = await riotService.getRankedStats(summonerData.id);
    console.log('Ranked stats:', rankedStats);

    const soloQStats = rankedStats.find(
      (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
    );
    console.log('SoloQ stats:', soloQStats);

    console.log('Upserting to Supabase...');
    const { data, error } = await supabase
      .from('players')
      .upsert({
        summoner_id: summonerData.id,
        summoner_name: summonerData.riotId,
        puuid: summonerData.puuid,
        profile_icon_id: summonerData.profileIconId,
        tier: soloQStats?.tier || null,
        rank: soloQStats?.rank || null,
        league_points: soloQStats?.leaguePoints || 0,
        wins: soloQStats?.wins || 0,
        losses: soloQStats?.losses || 0,
        last_update: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Success! Data:', data);
    res.json(data);
  } catch (error: any) {
    console.error('Detailed error:', error.response?.data || error);
    res.status(500).json({ 
      error: 'Error adding player',
      details: error.response?.data || error.message 
    });
  }
};

const handleDeletePlayer: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
  res.status(204).send();
};


// const handleUpdateAllPlayers: RequestHandler = async (req, res) => {
//   await updateAllPlayers();
//   res.status(200).send();
// };

interface MatchResponse {
  info: {
    gameCreation: number;
    participants: Array<{
      puuid: string;
      championId: number;
      win: boolean;
      kills: number;
      deaths: number;
      assists: number;
    }>;
  };
}

// Gestionnaire pour récupérer les dernières games
const handleGetPlayerGames: RequestHandler = async (req, res) => {
  const { puuid } = req.params;
  
  try {
    // Récupérer les IDs des dernières parties
    const matchIds: string[] = await riotService.getMatchHistory(puuid);
    
    // Récupérer les détails des 5 dernières parties
    const games = await Promise.all(
      matchIds.slice(0, 5).map((matchId: string) => 
        riotService.getMatchDetails(matchId, puuid)
      )
    );

    res.json(games);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error fetching games' });
  }
};

// ... reste du code ...

// Routes
router.get('/', handleGetPlayers);
router.post('/', handleAddPlayer);
router.get('/:id', handleGetPlayerById);
router.delete('/:id', handleDeletePlayer);
router.get('/:puuid/games', handleGetPlayerGames);
router.post('/update-all', updateAllPlayers); // Nouvelle route pour la mise à jour

export default router;