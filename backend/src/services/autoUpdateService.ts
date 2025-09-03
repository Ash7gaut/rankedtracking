import { supabase } from '../config/supabase.js';
import { riotService } from './riotService.js';

const UPDATE_INTERVAL = 5.5 * 60 * 1000;
const RATE_LIMIT_PER_2_MIN = 100;
const REQUESTS_PER_PLAYER = 4;
const SAFE_BATCH_SIZE = Math.floor(RATE_LIMIT_PER_2_MIN / (REQUESTS_PER_PLAYER * 2));
const DELAY_BETWEEN_REQUESTS = 3000;
const BATCH_COOLDOWN = 30000;
const MAX_RETRIES = 4;
const RETRY_DELAY = 10000;

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

const calculateLPDifference = (
  previousTier: string,
  previousRank: string,
  previousLP: number,
  newTier: string,
  newRank: string,
  newLP: number
): number => {
  const tiers = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
  const ranks = ['IV', 'III', 'II', 'I'];

  // Même tier et rank = calcul simple
  if (previousTier === newTier && previousRank === newRank) {
    return newLP - previousLP;
  }

  // Promotion de division dans le même tier
  if (previousTier === newTier && ranks.indexOf(previousRank) < ranks.indexOf(newRank)) {
    return (100 - previousLP) + newLP;
  }

  // Rétrogradation de division dans le même tier
  if (previousTier === newTier && ranks.indexOf(previousRank) > ranks.indexOf(newRank)) {
    return -(previousLP + (100 - newLP));
  }

  // Promotion de tier
  if (tiers.indexOf(previousTier) < tiers.indexOf(newTier)) {
    return (100 - previousLP) + newLP;
  }

  // Rétrogradation de tier
  if (tiers.indexOf(previousTier) > tiers.indexOf(newTier)) {
    return -(previousLP + (100 - newLP));
  }

  // Cas par défaut
  return newLP - previousLP;
};

const updatePlayer = async (player: any, totalPlayers: number, updatedCount: number): Promise<UpdateResult> => {
  const [gameName, tagLine] = player.summoner_name.split('#');
  console.log(`\nMise à jour des données pour ${gameName}#${tagLine}`);

  let summonerData;
  try {
    // Essayer d'abord par Riot ID
    summonerData = await retryWithDelay(
      () => riotService.getSummonerByName(gameName, tagLine),
      `récupération par Riot ID de ${player.summoner_name}`
    );
  } catch (error: any) {
    // Si 404, tenter par PUUID
    if (error?.response?.status === 404) {
      console.log(`Riot ID introuvable pour ${player.summoner_name}, tentative de récupération par PUUID...`);
      try {
        summonerData = await retryWithDelay(
          () => riotService.getSummonerByPUUID(player.puuid),
          `récupération par PUUID de ${player.puuid}`
        );
      } catch (puuidError) {
        console.log(`❌ Impossible de récupérer les données pour ${player.summoner_name} (PUUID: ${player.puuid})`);
        return {
          success: false,
          player: player.summoner_name,
          error: "Impossible de récupérer les données par Riot ID ou PUUID"
        };
      }
    } else {
      // Autre erreur
      console.log(`❌ Erreur lors de la récupération de ${player.summoner_name}:`, error.message);
      return {
        success: false,
        player: player.summoner_name,
        error: error.message || 'Erreur inconnue'
      };
    }
  }

  // Vérification de la validité des données
  if (!summonerData || !summonerData.gameName || !summonerData.tagLine) {
    console.log(`❌ Données invalides reçues pour ${player.summoner_name}, conservation des anciennes données`);
    return { 
      success: false, 
      player: player.summoner_name, 
      error: "Données invalides reçues de l'API" 
    };
  }

  const currentRiotId = `${summonerData.gameName}#${summonerData.tagLine}`;
  
  // Vérification supplémentaire pour éviter les undefined#undefined
  if (currentRiotId === "undefined#undefined") {
    console.log(`❌ Riot ID invalide reçu pour ${player.summoner_name}, conservation des anciennes données`);
    return { 
      success: false, 
      player: player.summoner_name, 
      error: "Riot ID invalide reçu" 
    };
  }

  // On regroupe les requêtes restantes
  const [rankedStats, activeGame] = await Promise.all([
    retryWithDelay(
      () => riotService.getRankedStats(summonerData.puuid),
      `stats ranked de ${currentRiotId}`
    ),
    retryWithDelay(
      () => riotService.getActiveGame(summonerData.puuid),
      `statut en jeu de ${currentRiotId}`
    )
  ]);

  const soloQStats = rankedStats.find(
    (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
  );

  const totalGames = (soloQStats?.wins || 0) + (soloQStats?.losses || 0);

  const updateData = {
    summoner_id: summonerData.puuid, // On met maintenant le PUUID dans la colonne summoner_id
    puuid: summonerData.puuid,
    summoner_name: currentRiotId,
    profile_icon_id: summonerData.profileIconId,
    tier: soloQStats?.tier || null,
    rank: soloQStats?.rank || null,
    league_points: soloQStats?.leaguePoints || 0,
    wins: soloQStats?.wins || 0,
    losses: soloQStats?.losses || 0,
    in_game: activeGame.inGame || false,
    last_update: new Date().toISOString()
  };

  // Vérifier si on doit sauvegarder l'historique (toutes les 12 heures)
  const shouldSaveHistory = async () => {
    const SIX_HOURS = 12 * 60 * 60 * 1000; // 12 heures en millisecondes
    
    // Récupérer la dernière entrée d'historique pour ce joueur
    const { data: lastHistory, error } = await supabase
      .from('player_history')
      .select('timestamp')
      .eq('player_id', player.id)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erreur en vérifiant l\'historique:', error);
      return false;
    }

    // Si pas d'historique ou si le dernier est vieux de plus de 6 heures
    if (!lastHistory?.length) return true;
    
    const lastUpdate = new Date(lastHistory[0].timestamp).getTime();
    const now = new Date().getTime();
    
    return (now - lastUpdate) >= SIX_HOURS;
  };

  // Avant de mettre à jour le joueur, sauvegarder l'état actuel dans l'historique si nécessaire
  if (updateData.tier || updateData.rank || updateData.league_points) {
    const saveHistory = await shouldSaveHistory();
    
    if (saveHistory) {
      const { error: historyError } = await supabase
        .from('player_history')
        .insert({
          player_id: player.id,
          tier: updateData.tier,
          rank: updateData.rank,
          league_points: updateData.league_points,
          wins: updateData.wins,
          losses: updateData.losses
        });

      if (historyError) throw historyError;
      console.log(`✅ Historique sauvegardé pour ${player.summoner_name}`);
    }
  }

  if (player.league_points !== updateData.league_points || 
      player.tier !== updateData.tier || 
      player.rank !== updateData.rank) {

    const lpDifference = calculateLPDifference(
      player.tier,
      player.rank,
      player.league_points,
      updateData.tier,
      updateData.rank,
      updateData.league_points
    );

    // Vérifier les entrées dans l'heure précédente
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: existingEntry } = await supabase
      .from('lp_tracker')
      .select('*')
      .eq('player_id', player.id)
      .eq('current_lp', updateData.league_points)
      .eq('tier', updateData.tier)
      .eq('rank', updateData.rank)
      .gte('timestamp', oneHourAgo)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (!existingEntry?.length) {
      const { error: trackerError } = await supabase
        .from('lp_tracker')
        .insert({
          player_id: player.id,
          previous_lp: player.league_points,
          current_lp: updateData.league_points,
          difference: lpDifference,
          previous_tier: player.tier,
          previous_rank: player.rank,
          tier: updateData.tier,
          rank: updateData.rank,
          summoner_name: player.summoner_name
        });

      if (trackerError) console.error('Erreur lors du tracking des LP:', trackerError);
    }
  }

  // Vérification finale des données avant mise à jour
  if (Object.values(updateData).some(value => value === undefined)) {
    console.log(`❌ Données incomplètes pour ${player.summoner_name}, conservation des anciennes données`);
    return { 
      success: false, 
      player: player.summoner_name, 
      error: "Données incomplètes" 
    };
  }

  const { error: updateError } = await supabase
    .from('players')
    .update(updateData)
    .eq('id', player.id);

  if (updateError) throw updateError;
  
  console.log(`✅ ${currentRiotId} mis à jour (${updatedCount + 1}/${totalPlayers})${activeGame.inGame ? ' (IN GAME)' : ' (NOT IN GAME)'}`);
  return { success: true, player: currentRiotId, error: null };

};

const updateAllPlayers = async () => {
  try {
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('*');

    if (fetchError) throw fetchError;

    const totalPlayers = players.length;
    console.log(`\nDébut de la mise à jour pour ${totalPlayers} joueurs...`);

    // Création de lots plus petits pour respecter le rate limit
    const batches = [];
    for (let i = 0; i < players.length; i += SAFE_BATCH_SIZE) {
      batches.push(players.slice(i, i + SAFE_BATCH_SIZE));
    }

    console.log(`Traitement en ${batches.length} lots de ${SAFE_BATCH_SIZE} joueurs maximum`);

    const updates: UpdateResult[] = [];
    let updatedCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\nTraitement du lot ${i + 1}/${batches.length}`);

      for (const player of batch) {
        const result = await updatePlayer(player, totalPlayers, updatedCount);
        updates.push(result);
        if (result.success) updatedCount++;
        
        // Petit délai entre chaque joueur
        await sleep(DELAY_BETWEEN_REQUESTS);
      }

      // Si ce n'est pas le dernier lot, on attend le cooldown
      if (i < batches.length - 1) {
        const remainingPlayers = totalPlayers - (i + 1) * SAFE_BATCH_SIZE;
        console.log(`\nPause de ${BATCH_COOLDOWN/1000} secondes pour respecter le rate limit...`);
        console.log(`Reste ${remainingPlayers} joueurs à traiter`);
        await sleep(BATCH_COOLDOWN);
      }
    }

    console.log(`\nMise à jour terminée : ${updatedCount}/${totalPlayers} joueurs mis à jour`);
    return updates;
  } catch (error) {
    console.error('Erreur globale:', error);
    throw error;
  }
};

const retryWithDelay = async (fn: () => Promise<any>, context: string, retries = MAX_RETRIES): Promise<any> => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      await sleep(DELAY_BETWEEN_REQUESTS);
      return await fn();
    } catch (error: any) {
      lastError = error;
      console.log(`Tentative ${i + 1}/${retries} échouée pour ${context}`);
      
      if (error?.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after']) || 10;
        console.log(`Rate limit atteint pour ${context}, attente de ${retryAfter} secondes...`);
        await sleep(retryAfter * 1000);
        continue;
      }
      
      if (error?.response?.status === 503) {
        const waitTime = Math.min(RETRY_DELAY * Math.pow(2, i), 30000); // max 30s
        console.log(`Service indisponible pour ${context}, nouvelle tentative dans ${waitTime/1000}s... (${retries - i - 1} essais restants)`);
        await sleep(waitTime);
        continue;
      }

      if (error?.response?.status === 404) {
        console.log(`Données non trouvées pour ${context}`);
        throw error;
      }

      // Pour les autres erreurs, on attend un peu plus longtemps
      const waitTime = RETRY_DELAY * (i + 1);
      console.log(`Erreur ${error?.response?.status || 'inconnue'} pour ${context}, nouvelle tentative dans ${waitTime/1000}s...`);
      await sleep(waitTime);
    }
  }

  console.error(`Toutes les tentatives ont échoué pour ${context}`);
  throw lastError;
};