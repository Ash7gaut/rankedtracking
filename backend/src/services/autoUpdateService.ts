import { supabase } from '../config/supabase.js';
import { riotService } from './riotService.js';

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes en millisecondes

export const startAutoUpdateService = () => {
  console.log('Service de mise à jour automatique initialisé');

  // Première mise à jour immédiate
  updateAllPlayers().catch(error => {
    console.error('Erreur lors de la première mise à jour:', error);
  });

  // Puis toutes les 5 minutes
  setInterval(() => {
    updateAllPlayers().catch(error => {
      console.error('Erreur lors de la mise à jour périodique:', error);
    });
  }, UPDATE_INTERVAL);
};

const updateAllPlayers = async () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Démarrage de la mise à jour automatique...`);
  
  try {
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('*');

    if (fetchError) throw fetchError;

    console.log(`[${timestamp}] Mise à jour de ${players.length} joueurs...`);

    const updates = await Promise.all(
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

          const { error: updateError } = await supabase
            .from('players')
            .update(updateData)
            .eq('id', player.id);

          if (updateError) throw updateError;
          
          console.log(`[${timestamp}] ✅ ${player.summoner_name} mis à jour`);
          return { success: true, player: player.summoner_name };
        } catch (error) {
          console.error(`[${timestamp}] ❌ Erreur pour ${player.summoner_name}:`, error);
          return { success: false, player: player.summoner_name, error };
        }
      })
    );

    const successCount = updates.filter(u => u.success).length;
    console.log(`[${timestamp}] Mise à jour terminée: ${successCount}/${players.length} joueurs mis à jour`);
  } catch (error) {
    console.error(`[${timestamp}] Erreur globale:`, error);
  }
};