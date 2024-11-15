import { supabase } from '../config/supabase.js';
import { riotService } from './riotService.js';

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_PER_SECOND = 20;
const RATE_LIMIT_PER_2_MIN = 100;
const DELAY_BETWEEN_REQUESTS = 1000 / RATE_LIMIT_PER_SECOND;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const startAutoUpdateService = () => {
  console.log('Service de mise à jour automatique initialisé');
  updateAllPlayers().catch(error => {
    console.error('Erreur lors de la première mise à jour:', error);
  });

  setInterval(() => {
    updateAllPlayers().catch(error => {
      console.error('Erreur lors de la mise à jour périodique:', error);
    });
  }, UPDATE_INTERVAL);
};

const updateAllPlayers = async () => {
  try {
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('*');

    if (fetchError) throw fetchError;

    const batches = [];
    for (let i = 0; i < players.length; i += RATE_LIMIT_PER_2_MIN) {
      batches.push(players.slice(i, i + RATE_LIMIT_PER_2_MIN));
    }

    const updates = [];
    for (const batch of batches) {
      for (const player of batch) {
        let retries = 0;
        let success = false;

        while (!success && retries < MAX_RETRIES) {
          try {
            await sleep(DELAY_BETWEEN_REQUESTS);

            const [rankedStats, activeGame] = await Promise.all([
              riotService.getRankedStats(player.summoner_id),
              riotService.getActiveGame(player.puuid)
            ]);

            const soloQStats = rankedStats.find(
              (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
            );

            const updateData = {
              tier: soloQStats?.tier || null,
              rank: soloQStats?.rank || null,
              league_points: soloQStats?.leaguePoints || 0,
              wins: soloQStats?.wins || 0,
              losses: soloQStats?.losses || 0,
              in_game: activeGame.inGame || false,
              last_update: new Date().toISOString()
            };

            const { error: updateError } = await supabase
              .from('players')
              .update(updateData)
              .eq('id', player.id);

            if (updateError) throw updateError;
            
            console.log(`✅ ${player.summoner_name} mis à jour${activeGame.inGame ? ' (IN GAME)' : ' (NOT IN GAME)'}`);
            updates.push({ success: true, player: player.summoner_name });
            success = true;
          } catch (error: any) {
            retries++;
            if (error?.response?.status === 429) {
              const retryAfter = error?.response?.headers?.['retry-after'] || 10;
              await sleep(retryAfter * 1000);
            } else if (retries === MAX_RETRIES) {
              console.error(`❌ Échec pour ${player.summoner_name}:`, error);
              updates.push({ success: false, player: player.summoner_name, error });
            }
          }
        }
      }

      if (batches.indexOf(batch) < batches.length - 1) {
        await sleep(120000);
      }
    }

    const successCount = updates.filter(u => u.success).length;
    console.log(`✅ ${successCount}/${players.length} joueurs mis à jour`);
    
    const failedUpdates = updates.filter(u => !u.success);
    if (failedUpdates.length > 0) {
      failedUpdates.forEach(update => {
        console.log(`❌ ${update.player} - Erreur: ${update.error}`);
      });
    }
  } catch (error) {
    console.error('Erreur globale:', error);
  }
};