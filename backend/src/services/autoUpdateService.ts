import cron from 'node-cron';
import { supabase } from '../config/supabase';
import { riotService } from './riotService';

export const startAutoUpdateService = () => {
  console.log('Service de mise à jour automatique initialisé');

  cron.schedule('*/5 * * * *', async () => {
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

      console.log('Mise à jour automatique terminée:', updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour automatique:', error);
    }
  });
};