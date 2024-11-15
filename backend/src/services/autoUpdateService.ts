import { supabase } from '../config/supabase.js';
import { riotService } from './riotService.js';

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes en millisecondes

// Limites de l'API Riot
const RATE_LIMIT_PER_SECOND = 20;  // 20 requêtes par seconde
const RATE_LIMIT_PER_2_MIN = 100;  // 100 requêtes par 2 minutes
const DELAY_BETWEEN_REQUESTS = 1000 / RATE_LIMIT_PER_SECOND; // ~50ms entre chaque requête
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    // Diviser les joueurs en lots de 100 (limite par 2 minutes)
    const batches = [];
    for (let i = 0; i < players.length; i += RATE_LIMIT_PER_2_MIN) {
      batches.push(players.slice(i, i + RATE_LIMIT_PER_2_MIN));
    }

    const updates = [];
    for (const batch of batches) {
      console.log(`[${timestamp}] Traitement d'un nouveau lot de ${batch.length} joueurs`);
      
      for (const player of batch) {
        let retries = 0;
        let success = false;

        while (!success && retries < MAX_RETRIES) {
          try {
            await sleep(DELAY_BETWEEN_REQUESTS);

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
            updates.push({ success: true, player: player.summoner_name });
            success = true;
          } catch (error: any) {
            retries++;
            if (error?.response?.status === 429) {
              const retryAfter = error?.response?.headers?.['retry-after'] || 10;
              console.log(`[${timestamp}] Rate limit atteint pour ${player.summoner_name}, attente de ${retryAfter}s (tentative ${retries}/${MAX_RETRIES})`);
              await sleep(retryAfter * 1000);
            } else if (retries === MAX_RETRIES) {
              console.error(`[${timestamp}] ❌ Échec définitif pour ${player.summoner_name}:`, error);
              updates.push({ success: false, player: player.summoner_name, error });
            }
          }
        }
      }

      // Attendre 2 minutes avant le prochain lot
      if (batches.indexOf(batch) < batches.length - 1) {
        console.log(`[${timestamp}] Attente de 2 minutes avant le prochain lot...`);
        await sleep(120000); // 2 minutes
      }
    }

    const successCount = updates.filter(u => u.success).length;
    const failedUpdates = updates.filter(u => !u.success);
    
    console.log(`[${timestamp}] Mise à jour terminée: ${successCount}/${players.length} joueurs mis à jour`);
    
    if (failedUpdates.length > 0) {
      console.log(`[${timestamp}] Joueurs non mis à jour :`);
      failedUpdates.forEach(update => {
        console.log(`[${timestamp}] ❌ ${update.player} - Erreur: ${update.error}`);
      });
    }
  } catch (error) {
    console.error(`[${timestamp}] Erreur globale:`, error);
  }
};