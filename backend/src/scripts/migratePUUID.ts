import { supabase } from '../config/supabase.js';
import { riotService } from '../services/riotService.js';

interface Player {
  id: string;
  summoner_name: string;
  puuid: string;
  summoner_id: string;
  player_name: string;
  role: string;
  is_main: boolean;
  profile_icon_id: number;
  tier?: string;
  rank?: string;
  league_points?: number;
  wins?: number;
  losses?: number;
  last_update?: string;
}

interface MigrationResult {
  playerId: string;
  oldPUUID: string;
  newPUUID: string;
  summonerName: string;
  success: boolean;
  error?: string;
}

const migratePUUIDs = async (): Promise<void> => {
  console.log('🚀 Début de la migration des PUUID...');
  console.log('📅 Date:', new Date().toISOString());
  console.log('=====================================');
  
  try {
    // 1. Récupérer tous les joueurs
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('*');

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération des joueurs: ${fetchError.message}`);
    }

    if (!players || players.length === 0) {
      console.log('❌ Aucun joueur trouvé dans la base de données');
      return;
    }

    console.log(`📊 ${players.length} joueurs trouvés, début de la migration...`);
    console.log('');

    const results: MigrationResult[] = [];
    let successCount = 0;
    let errorCount = 0;
    let unchangedCount = 0;

    // 2. Traiter chaque joueur
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      console.log(`[${i + 1}/${players.length}] 🔄 Migration de ${player.summoner_name}...`);
      
      try {
        // Extraire le gameName et tagLine du summoner_name
        const [gameName, tagLine] = player.summoner_name.split('#');
        
        if (!gameName || !tagLine) {
          console.log(`  ❌ Format invalide pour ${player.summoner_name}`);
          results.push({
            playerId: player.id,
            oldPUUID: player.puuid,
            newPUUID: '',
            summonerName: player.summoner_name,
            success: false,
            error: 'Format Riot ID invalide'
          });
          errorCount++;
          continue;
        }

        // Récupérer les nouvelles données avec la nouvelle clé API
        const summonerData = await riotService.getSummonerByName(gameName, tagLine);
        
        if (!summonerData || !summonerData.puuid) {
          console.log(`  ❌ Impossible de récupérer les données pour ${player.summoner_name}`);
          results.push({
            playerId: player.id,
            oldPUUID: player.puuid,
            newPUUID: '',
            summonerName: player.summoner_name,
            success: false,
            error: 'Impossible de récupérer les nouvelles données'
          });
          errorCount++;
          continue;
        }

        const newPUUID = summonerData.puuid;
        
        // Debug: Afficher les PUUID pour comparaison
        console.log(`  🔍 Comparaison PUUID pour ${player.summoner_name}:`);
        console.log(`     Ancien: ${player.puuid}`);
        console.log(`     Nouveau: ${newPUUID}`);
        console.log(`     Identiques: ${player.puuid === newPUUID ? 'OUI' : 'NON'}`);
        
        // Vérifier si le PUUID a changé
        if (player.puuid === newPUUID) {
          console.log(`  ✅ PUUID inchangé pour ${player.summoner_name}`);
          results.push({
            playerId: player.id,
            oldPUUID: player.puuid,
            newPUUID: newPUUID,
            summonerName: player.summoner_name,
            success: true
          });
          unchangedCount++;
          continue;
        }

        console.log(`  🔄 PUUID changé: ${player.puuid.substring(0, 8)}... → ${newPUUID.substring(0, 8)}...`);

        // 3. Mettre à jour le joueur avec le nouveau PUUID
        const { error: updateError } = await supabase
          .from('players')
          .update({
            puuid: newPUUID,
            last_update: new Date().toISOString()
          })
          .eq('id', player.id);

        if (updateError) {
          console.log(`  ❌ Erreur lors de la mise à jour de ${player.summoner_name}: ${updateError.message}`);
          results.push({
            playerId: player.id,
            oldPUUID: player.puuid,
            newPUUID: newPUUID,
            summonerName: player.summoner_name,
            success: false,
            error: `Erreur de mise à jour: ${updateError.message}`
          });
          errorCount++;
          continue;
        }

        console.log(`  ✅ ${player.summoner_name} migré avec succès`);
        results.push({
          playerId: player.id,
          oldPUUID: player.puuid,
          newPUUID: newPUUID,
          summonerName: player.summoner_name,
          success: true
        });
        successCount++;

        // Attendre un peu pour éviter de surcharger l'API Riot
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.log(`  ❌ Erreur pour ${player.summoner_name}: ${error.message}`);
        results.push({
          playerId: player.id,
          oldPUUID: player.puuid,
          newPUUID: '',
          summonerName: player.summoner_name,
          success: false,
          error: error.message
        });
        errorCount++;
      }
    }

    // 4. Afficher le résumé détaillé
    console.log('');
    console.log('📋 RÉSUMÉ DE LA MIGRATION');
    console.log('==========================');
    console.log(`✅ Succès: ${successCount}/${results.length}`);
    console.log(`❌ Échecs: ${errorCount}/${results.length}`);
    console.log(`🔄 PUUID changés: ${successCount}/${results.length}`);
    console.log(`📊 PUUID inchangés: ${unchangedCount}/${results.length}`);
    console.log('');

    if (errorCount > 0) {
      console.log('❌ ÉCHECS DÉTAILLÉS:');
      console.log('===================');
      const failed = results.filter(r => !r.success);
      failed.forEach((result, index) => {
        console.log(`${index + 1}. ${result.summonerName}: ${result.error}`);
      });
      console.log('');
    }

    if (successCount > 0) {
      console.log('🔄 PUUID CHANGÉS:');
      console.log('=================');
      const changed = results.filter(r => r.oldPUUID !== r.newPUUID && r.success);
      changed.forEach((result, index) => {
        console.log(`${index + 1}. ${result.summonerName}`);
        console.log(`   ${result.oldPUUID.substring(0, 8)}... → ${result.newPUUID.substring(0, 8)}...`);
      });
      console.log('');
    }

    console.log('🎉 Migration terminée !');
    console.log('📅 Date de fin:', new Date().toISOString());

  } catch (error: any) {
    console.error('💥 Erreur lors de la migration:', error.message);
    throw error;
  }
};

// Fonction pour vérifier l'état de la migration
const checkMigrationStatus = async (): Promise<void> => {
  console.log('🔍 Vérification de l\'état de la migration...');
  console.log('📅 Date:', new Date().toISOString());
  console.log('=====================================');
  
  try {
    const { data: players, error } = await supabase
      .from('players')
      .select('summoner_name, puuid, summoner_id, last_update, tier, rank, league_points');

    if (error) throw error;

    console.log(`📊 ${players?.length || 0} joueurs dans la base de données`);
    console.log('');
    
    if (players && players.length > 0) {
      console.log('📈 DERNIERS JOUEURS MIS À JOUR:');
      console.log('==============================');
      players
        .sort((a, b) => new Date(b.last_update || 0).getTime() - new Date(a.last_update || 0).getTime())
        .slice(0, 10)
        .forEach((player, index) => {
          const lastUpdate = player.last_update ? new Date(player.last_update).toLocaleString('fr-FR') : 'Jamais';
          const rank = player.tier && player.rank ? `${player.tier} ${player.rank}` : player.tier || 'UNRANKED';
          console.log(`${index + 1}. ${player.summoner_name}`);
          console.log(`   PUUID: ${player.puuid.substring(0, 8)}...`);
          console.log(`   Summoner ID: ${player.summoner_id.substring(0, 8)}...`);
          console.log(`   Rang: ${rank} ${player.league_points || 0}LP`);
          console.log(`   Dernière mise à jour: ${lastUpdate}`);
          console.log('');
        });
    }

    // Statistiques générales
    const rankedPlayers = players?.filter(p => p.tier && p.tier !== 'UNRANKED').length || 0;
    const unrankedPlayers = (players?.length || 0) - rankedPlayers;
    
    console.log('📊 STATISTIQUES GÉNÉRALES:');
    console.log('==========================');
    console.log(`Total joueurs: ${players?.length || 0}`);
    console.log(`Joueurs classés: ${rankedPlayers}`);
    console.log(`Joueurs non classés: ${unrankedPlayers}`);

  } catch (error: any) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
};

// Fonction pour forcer la mise à jour de tous les joueurs
const forceUpdateAllPlayers = async (): Promise<void> => {
  console.log('🔄 Début de la mise à jour forcée de tous les joueurs...');
  console.log('📅 Date:', new Date().toISOString());
  console.log('=====================================');
  
  try {
    const { data: players, error } = await supabase
      .from('players')
      .select('*');

    if (error) throw error;

    if (!players || players.length === 0) {
      console.log('❌ Aucun joueur trouvé');
      return;
    }

    console.log(`📊 ${players.length} joueurs à mettre à jour...`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      console.log(`[${i + 1}/${players.length}] 🔄 Mise à jour de ${player.summoner_name}...`);

      try {
        const [gameName, tagLine] = player.summoner_name.split('#');
        
        if (!gameName || !tagLine) {
          console.log(`  ❌ Format invalide`);
          errorCount++;
          continue;
        }

        // Récupérer toutes les données à jour
        const [summonerData, rankedStats] = await Promise.all([
          riotService.getSummonerByName(gameName, tagLine),
          riotService.getRankedStats(player.puuid)
        ]);

        const soloQStats = rankedStats.find(
          (queue: any) => queue.queueType === 'RANKED_SOLO_5x5'
        );

        // Mettre à jour avec toutes les données
        const { error: updateError } = await supabase
          .from('players')
          .update({
            summoner_id: summonerData.id,
            profile_icon_id: summonerData.profileIconId,
            tier: soloQStats?.tier || null,
            rank: soloQStats?.rank || null,
            league_points: soloQStats?.leaguePoints || 0,
            wins: soloQStats?.wins || 0,
            losses: soloQStats?.losses || 0,
            last_update: new Date().toISOString()
          })
          .eq('id', player.id);

        if (updateError) {
          console.log(`  ❌ Erreur: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`  ✅ Mis à jour avec succès`);
          successCount++;
        }

        // Attendre pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.log(`  ❌ Erreur: ${error.message}`);
        errorCount++;
      }
    }

    console.log('');
    console.log('📋 RÉSUMÉ DE LA MISE À JOUR:');
    console.log('=============================');
    console.log(`✅ Succès: ${successCount}/${players.length}`);
    console.log(`❌ Échecs: ${errorCount}/${players.length}`);
    console.log('🎉 Mise à jour terminée !');

  } catch (error: any) {
    console.error('💥 Erreur lors de la mise à jour:', error.message);
  }
};

// Exécuter la migration si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      checkMigrationStatus();
      break;
    case 'update':
      forceUpdateAllPlayers();
      break;
    case 'migrate':
    default:
      migratePUUIDs();
      break;
  }
}

export { migratePUUIDs, checkMigrationStatus, forceUpdateAllPlayers }; 