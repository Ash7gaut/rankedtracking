import { Request, Response } from 'express';
import { riotService } from '../services/riotService.js';
import { supabase } from '../config/supabase.js';
import { Player } from '../types/interfaces.js';

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
      const rankedStats = await riotService.getRankedStats(player.puuid);
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
    const { summonerName, playerName, role, isMain } = req.body;
    console.log('Données reçues dans le contrôleur:', { 
      summonerName, 
      playerName, 
      role, 
      isMain,
      typeIsMain: typeof isMain
    });
    
    const [gameName, tagLine] = summonerName.split('#');
    
    if (!gameName || !tagLine) {
      return res.status(400).json({ error: 'Format invalide. Utilisez le format: nom#tag' });
    }

    const summonerData = await riotService.getSummonerByName(gameName, tagLine);
    const rankedStats = await riotService.getRankedStats(summonerData.puuid);
    const soloQStats = rankedStats.find(
      (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
    );

    const playerData = {
      summoner_id: summonerData.id,
      summoner_name: summonerData.riotId,
      player_name: playerName,
      role: role.toUpperCase(),
      is_main: isMain === true,
      puuid: summonerData.puuid,
      profile_icon_id: summonerData.profileIconId,
      tier: soloQStats?.tier || null,
      rank: soloQStats?.rank || null,
      league_points: soloQStats?.leaguePoints || 0,
      wins: soloQStats?.wins || 0,
      losses: soloQStats?.losses || 0,
      last_update: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('players')
      .upsert(playerData)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error adding player' });
  }
};

export const updateAllPlayers = async (req: Request, res: Response) => {
  try {
    console.log("Début de l'auto-update");
    
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('*');

    if (fetchError) throw fetchError;
    console.log(`${players.length} joueurs à mettre à jour`);

    const updates = await Promise.all(players.map(async (player) => {
      try {
        console.log(`Mise à jour de ${player.summoner_name}`);
        const [gameName, tagLine] = player.summoner_name.split('#');
        
        if (!gameName || !tagLine) {
          console.error(`Format invalide pour ${player.summoner_name}`);
          return null;
        }

        const summonerData = await riotService.getSummonerByName(gameName, tagLine);
        console.log('Données complètes du joueur:', {
          id: summonerData.id,
          riotId: summonerData.riotId,
          accountId: summonerData.accountId,
          puuid: summonerData.puuid,
          name: summonerData.name,
          profileIconId: summonerData.profileIconId,
          revisionDate: summonerData.revisionDate,
          summonerLevel: summonerData.summonerLevel,
          gameName: summonerData.gameName,
          tagLine: summonerData.tagLine,
          // Log de l'objet complet au cas où il y aurait d'autres champs
          fullObject: summonerData
        });
        
        const rankedStats = await riotService.getRankedStats(summonerData.puuid);
        const soloQStats = rankedStats.find(
          (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
        );

        const { data, error } = await supabase
          .from('players')
          .update({
            summoner_id: summonerData.id,
            summoner_name: summonerData.riotId,
            profile_icon_id: summonerData.profileIconId,
            puuid: summonerData.puuid,
            tier: soloQStats?.tier || null,
            rank: soloQStats?.rank || null,
            league_points: soloQStats?.leaguePoints || 0,
            wins: soloQStats?.wins || 0,
            losses: soloQStats?.losses || 0,
            last_update: new Date().toISOString()
          })
          .eq('id', player.id)
          .select()
          .single();

        if (error) {
          console.error(`Erreur mise à jour ${player.summoner_name}:`, error);
          return null;
        }

        console.log(`✅ ${player.summoner_name} mis à jour`);
        return data;
      } catch (error) {
        console.error(`Erreur pour ${player.summoner_name}:`, error);
        return null;
      }
    }));

    const successfulUpdates = updates.filter(update => update !== null);
    console.log(`Mise à jour terminée: ${successfulUpdates.length}/${players.length} joueurs mis à jour`);

    res.json({
      message: 'Mise à jour terminée',
      updated: successfulUpdates.length,
      total: players.length
    });
  } catch (error) {
    console.error('Erreur générale:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

export const deletePlayer = async (req: Request, res: Response): Promise<void> => {
  const { summonerName } = req.body;

  try {
    if (!summonerName) {
      res.status(400).json({ error: "Le nom d'invocateur est requis" });
      return;
    }

    console.log('Tentative de suppression du joueur:', summonerName);

    // D'abord, vérifions si le joueur existe
    const { data: player, error: findError } = await supabase
      .from('players')
      .select('*')
      .ilike('summoner_name', summonerName) 
      .single();

    if (findError) {
      console.error('Erreur lors de la recherche du joueur:', findError);
      res.status(500).json({ error: 'Erreur lors de la recherche du joueur' });
      return;
    }

    if (!player) {
      console.log('Joueur non trouvé:', summonerName);
      res.status(404).json({ error: 'Joueur non trouvé' });
      return;
    }

    console.log('Joueur trouvé, ID:', player.id);

    // 1. Supprimer les entrées dans lp_tracker
    const { error: trackerError } = await supabase
      .from('lp_tracker')
      .delete()
      .eq('player_id', player.id);

    if (trackerError) {
      console.error('Erreur lors de la suppression des LP:', trackerError);
      res.status(500).json({ error: 'Erreur lors de la suppression des LP' });
      return;
    }

    // 2. Supprimer les entrées dans player_history
    const { error: historyError } = await supabase
      .from('player_history')
      .delete()
      .eq('player_id', player.id);

    if (historyError) {
      console.error('Erreur lors de la suppression de l\'historique:', historyError);
      res.status(500).json({ error: 'Erreur lors de la suppression de l\'historique' });
      return;
    }

    // 3. Supprimer les entrées dans player_stats_monthly
    const { error: statsError } = await supabase
      .from('player_stats_monthly')
      .delete()
      .eq('player_id', player.id);

    if (statsError) {
      console.error('Erreur lors de la suppression des statistiques mensuelles:', statsError);
      res.status(500).json({ error: 'Erreur lors de la suppression des statistiques mensuelles' });
      return;
    }

    // 4. Enfin, supprimer le joueur
    const { error: deleteError } = await supabase
      .from('players')
      .delete()
      .eq('id', player.id);

    if (deleteError) {
      console.error('Erreur Supabase lors de la suppression:', deleteError);
      res.status(500).json({ error: 'Erreur lors de la suppression' });
      return;
    }

    console.log('Joueur supprimé avec succès:', summonerName);
    res.status(200).json({ message: 'Joueur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

export const updatePlayer = async (player: Player) => {
  try {
    const [summonerData, rankedStats] = await Promise.all([
      riotService.getSummonerByName(player.summoner_name.split('#')[0], player.summoner_name.split('#')[1]),
      riotService.getRankedStats(player.puuid)
    ]);
    
    const soloQStats = rankedStats.find(
      (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
    );

    const updateData = {
      summoner_name: summonerData.riotId,
      profile_icon_id: summonerData.profileIconId,
      tier: soloQStats?.tier || "UNRANKED",
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
};

export const autoUpdatePlayers = async (req: Request, res: Response) => {
  try {
    // 1. Récupérer tous les joueurs
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('*');

    if (fetchError) throw fetchError;

    // 2. Pour chaque joueur
    const updates = await Promise.all(players.map(async (player) => {
      try {
        const [gameName, tagLine] = player.summoner_name.split('#');
        
        if (!gameName || !tagLine) {
          console.error(`Format invalide pour ${player.summoner_name}`);
          return null;
        }

        // 3. Récupérer les mêmes données que dans addPlayer
        const summonerData = await riotService.getSummonerByName(gameName, tagLine);
        console.log('Summoner Data:', summonerData);

        const rankedStats = await riotService.getRankedStats(summonerData.puuid);
        console.log('Ranked Stats:', rankedStats);

        const soloQStats = rankedStats.find(
          (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
        );

        // 4. Préparer les données de la même manière
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

        // 5. Utiliser upsert comme dans addPlayer
        const { data, error } = await supabase
          .from('players')
          .upsert(playerData)
          .eq('id', player.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Erreur mise à jour ${player.summoner_name}:`, error);
        return null;
      }
    }));

    // Filtrer les mises à jour réussies
    const successfulUpdates = updates.filter(update => update !== null);

    res.json({
      message: 'Auto-update completed',
      updated: successfulUpdates.length,
      total: players.length
    });
  } catch (error) {
    console.error('Error in auto-update:', error);
    res.status(500).json({ error: 'Error during auto-update' });
  }
};

