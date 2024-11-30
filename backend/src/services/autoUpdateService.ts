import { supabase } from '../config/supabase.js';
import { riotService } from './riotService.js';

const UPDATE_INTERVAL = 5 * 60 * 1000;
const RATE_LIMIT_PER_2_MIN = 30;
const DELAY_BETWEEN_REQUESTS = 1000;
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

interface UpdateResult {
  success: boolean;
  player: string;
  error: string | null;
}

const updateAllPlayers = async () => {
  try {
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('*');

    if (fetchError) throw fetchError;

    const totalPlayers = players.length;
    let updatedCount = 0;
    console.log(`\nDébut de la mise à jour pour ${totalPlayers} joueurs...`);

    const batches = [];
    for (let i = 0; i < players.length; i += RATE_LIMIT_PER_2_MIN) {
      batches.push(players.slice(i, i + RATE_LIMIT_PER_2_MIN));
    }

    const updates: UpdateResult[] = [];
    for (const batch of batches) {
      for (const player of batch) {
        let retries = 0;
        let success = false;

        while (!success && retries < MAX_RETRIES) {
          try {
            await sleep(DELAY_BETWEEN_REQUESTS);

            const rankedStats = await riotService.getRankedStats(player.summoner_id);
            const activeGame = await riotService.getActiveGame(player.puuid);

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
            
            updatedCount++;
            console.log(`✅ ${player.summoner_name} mis à jour (${updatedCount}/${totalPlayers})${activeGame.inGame ? ' (IN GAME)' : ' (NOT IN GAME)'}`);
            updates.push({ success: true, player: player.summoner_name, error: null });
            success = true;
          } catch (error: any) {
            if (error.response?.status === 503) {
              console.log(`Service indisponible pour ${player.summoner_name}, nouvelle tentative dans 5 secondes...`);
              await sleep(5000);
              retries++;
              continue;
            }
            
            retries++;
            if (retries === MAX_RETRIES) {
              console.error(`❌ Échec de la mise à jour pour ${player.summoner_name}:`, error);
              updates.push({ 
                success: false, 
                player: player.summoner_name, 
                error: error.message || 'Unknown error'
              });
            }
          }
        }
      }
    }

    console.log(`\nMise à jour terminée : ${updatedCount}/${totalPlayers} joueurs mis à jour`);
    return updates;
  } catch (error) {
    console.error('Erreur globale:', error);
    throw error;
  }
};