import express from 'express';
import type { Request, Response, RequestHandler } from 'express';
import { riotService } from '../services/riotService.js';
import { supabase } from '../config/supabase.js';
import { updateAllPlayers } from '../controllers/playerController.js';
import { MatchDetails } from '../types/interfaces.js';
import { addPlayer } from '../controllers/playerController.js';
import { deletePlayer } from '../controllers/playerController.js';

const router = express.Router();

// Gestionnaire pour obtenir tous les joueurs
const handleGetPlayers: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('tier')
      .order('rank')
      .order('league_points', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching players:', error);
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


const handleDeletePlayer: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
  res.status(204).send();
};


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
    // Récupérer d'abord le player_id à partir du puuid
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('puuid', puuid)
      .single();

    if (playerError) throw playerError;

    const matchIds = await riotService.getMatchHistory(puuid);
    const games = await Promise.all(
      matchIds.map(matchId => riotService.getMatchDetails(matchId, puuid))
    );

    // Filtrer les parties et prendre les 5 premières parties classées
    const rankedGames = games
      .filter((game): game is MatchDetails => game !== null)
      .slice(0, 5);

    // Pour chaque partie, récupérer le changement de LP correspondant
    const gamesWithLP = await Promise.all(
      rankedGames.map(async (game) => {
        // Chercher un changement de LP dans l'heure suivant la partie
        const gameTime = new Date(game.gameCreation);
        const oneHourLater = new Date(gameTime.getTime() + 60 * 60 * 1000);

        const { data: lpChange } = await supabase
          .from('lp_tracker')
          .select('difference')
          .eq('player_id', player.id)
          .gte('timestamp', gameTime.toISOString())
          .lt('timestamp', oneHourLater.toISOString())
          .order('timestamp', { ascending: true })
          .limit(1);

        return {
          ...game,
          lpChange: lpChange?.[0]?.difference || undefined
        };
      })
    );

    res.json(gamesWithLP);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error fetching games' });
  }
};

// Gestionnaire pour obtenir l'historique d'un joueur
const handleGetPlayerHistory: RequestHandler = async (req, res) => {
  const { id } = req.params;
  console.log("Fetching history for player ID:", id);
  
  try {
    const { data, error } = await supabase
      .from('player_history')
      .select('*')
      .eq('player_id', id)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    console.log("History data found:", data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching player history:', error);
    res.status(500).json({ error: 'Error fetching player history' });
  }
};

// Routes
router.get('/:id/history', handleGetPlayerHistory);
router.get('/', handleGetPlayers);
router.post('/', addPlayer as RequestHandler);
router.get('/:id', handleGetPlayerById);
router.get('/:puuid/games', handleGetPlayerGames);
router.post('/update-all', updateAllPlayers);
router.get('/players/:name', async (req, res) => {
  const { name } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('summoner_name', name)
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
});

router.post('/delete', deletePlayer as RequestHandler);

export default router;