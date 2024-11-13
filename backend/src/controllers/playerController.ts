import { Request, Response } from 'express';
import { riotService } from '../services/riotService.js';
import { supabase } from '../config/supabase.js';

interface ParamsWithId {
  id: string;
}

export const getPlayers = async (req: Request, res: Response) => {
  try {
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .order('league_points', { ascending: false });

    if (error) throw error;
    res.json(players);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des joueurs' });
  }
};

export const getPlayerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // 1. Récupérer le joueur
    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // 2. Mettre à jour les données du joueur
    try {
      const rankedStats = await riotService.getRankedStats(player.summoner_id);
      console.log('Ranked Stats pour', player.summoner_name, ':', rankedStats);

      const soloQStats = rankedStats.find(
        (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
      );
      console.log('SoloQ Stats trouvées:', soloQStats);

      // Préparer les données de mise à jour
      const updateData = {
        tier: soloQStats?.tier || null,
        rank: soloQStats?.rank || null,
        league_points: soloQStats?.leaguePoints || 0,
        wins: soloQStats?.wins || 0,
        losses: soloQStats?.losses || 0,
        last_update: new Date().toISOString()
      };
      console.log('Données à mettre à jour:', updateData);

      // Effectuer la mise à jour
      const { data: updatedPlayer, error: updateError } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      console.log('Joueur mis à jour:', updatedPlayer);
      res.json(updatedPlayer);
    } catch (updateError) {
      console.error(`Erreur lors de la mise à jour de ${player.summoner_name}:`, updateError);
      res.json(player);
    }
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Error fetching player' });
  }
};

export const addPlayer = async (req: Request, res: Response) => {
  try {
    const { summonerName } = req.body;
    
    const [gameName, tagLine] = summonerName.split('#');
    
    if (!gameName || !tagLine) {
      return res.status(400).json({ error: 'Format invalide. Utilisez le format: nom#tag' });
    }

    const summonerData = await riotService.getSummonerByName(gameName, tagLine);
    const rankedStats = await riotService.getRankedStats(summonerData.id);
    console.log('Ranked Stats pour nouveau joueur:', rankedStats);

    const soloQStats = rankedStats.find(
      (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
    );

    const playerData = {
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
    };
    console.log('Données du joueur à ajouter:', playerData);

    const { data, error } = await supabase
      .from('players')
      .upsert(playerData)
      .select()
      .single();

    if (error) throw error;
    console.log('Joueur ajouté:', data);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error adding player' });
  }
};

// Nouvelle fonction pour la mise à jour
export const updateAllPlayers = async (req: Request, res: Response) => {
  try {
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('*');

    if (fetchError) throw fetchError;

    const updatedPlayers = await Promise.all(
      players.map(async (player) => {
        try {
          const rankedStats = await riotService.getRankedStats(player.summoner_id);
          const soloQStats = rankedStats.find(
            (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
          );

          const updateData = {
            tier: soloQStats?.tier || null,
            rank: soloQStats?.rank || null,
            league_points: soloQStats?.leaguePoints || 0,
            wins: soloQStats?.wins || 0,
            losses: soloQStats?.losses || 0,
            last_update: new Date().toISOString()
          };

          const { data: updatedPlayer, error: updateError } = await supabase
            .from('players')
            .update(updateData)
            .eq('id', player.id)
            .select()
            .single();

          if (updateError) throw updateError;
          return updatedPlayer;
        } catch (error) {
          console.error(`Erreur lors de la mise à jour de ${player.summoner_name}:`, error);
          return player;
        }
      })
    );

    res.json(updatedPlayers);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des joueurs' });
  }
};

export const deletePlayer = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting player' });
  }
};

