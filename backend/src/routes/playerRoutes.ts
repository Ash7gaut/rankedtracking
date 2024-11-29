import express from 'express';
import type { Request, Response, RequestHandler } from 'express';
import { riotService } from '../services/riotService.js';
import { supabase } from '../config/supabase.js';
import { updateAllPlayers } from '../controllers/playerController.js';
import { MatchDetails } from '../types/interfaces.js';
import { addPlayer } from '../controllers/playerController.js';

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

// Gestionnaire pour ajouter un joueur
// const handleAddPlayer: RequestHandler = async (req, res) => {
//   try {
//     const { summonerName, playerName, role, isMain } = req.body;
//     // Log pour débugger les valeurs reçues
//     console.log('Received data:', { 
//       summonerName, 
//       playerName, 
//       role, 
//       isMain,
//       roleType: typeof role,
//       isMainType: typeof isMain 
//     });
    
//     const [gameName, tagLine] = summonerName.split('#');
    
//     if (!gameName || !tagLine) {
//       res.status(400).json({ error: 'Format invalide. Utilisez le format: nom#tag' });
//       return;
//     }

//     const summonerData = await riotService.getSummonerByName(gameName, tagLine);
//     const rankedStats = await riotService.getRankedStats(summonerData.id);
//     const soloQStats = rankedStats.find(
//       (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
//     );

//     const formattedRole = role.toUpperCase() as 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
//     const formattedIsMain = isMain === true;

//     const playerData = {
//       summoner_id: summonerData.id,
//       summoner_name: summonerData.riotId,
//       player_name: playerName,
//       role: formattedRole,
//       is_main: formattedIsMain,
//       puuid: summonerData.puuid,
//       profile_icon_id: summonerData.profileIconId,
//       tier: soloQStats?.tier || null,
//       rank: soloQStats?.rank || null,
//       league_points: soloQStats?.leaguePoints || 0,
//       wins: soloQStats?.wins || 0,
//       losses: soloQStats?.losses || 0,
//       last_update: new Date().toISOString()
//     };

//     const { data, error } = await supabase
//       .from('players')
//       .upsert(playerData)
//       .select()
//       .single();

//     if (error) {
//       console.error('Supabase error:', error);
//       throw error;
//     }
    
//     console.log('Inserted data:', data);
//     res.json(data);
//   } catch (error) {
//     console.error('Error adding player:', error);
//     res.status(500).json({ error: 'Error adding player' });
//   }
// };

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
    const matchIds = await riotService.getMatchHistory(puuid);
    const games = await Promise.all(
      matchIds.map(matchId => riotService.getMatchDetails(matchId, puuid))
    );

    // Filtrer les parties et prendre les 5 premières parties classées
    const rankedGames = games
      .filter((game): game is MatchDetails => game !== null)
      .slice(0, 5);

    res.json(rankedGames);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error fetching games' });
  }
};

// Routes
router.get('/', handleGetPlayers);
router.post('/', addPlayer as RequestHandler);
router.get('/:id', handleGetPlayerById);
router.delete('/:id', handleDeletePlayer);
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

export default router;