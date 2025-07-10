import { supabase } from '../config/supabase.js';

const migrateSummonerIdToPUUID = async () => {
  const { data: players, error } = await supabase
    .from('players')
    .select('id, summoner_name, puuid, summoner_id');

  if (error) {
    console.error('Erreur lors de la récupération des joueurs:', error);
    return;
  }

  for (const player of players) {
    if (!player.puuid) {
      console.log(`Pas de PUUID pour ${player.summoner_name}, ignoré.`);
      continue;
    }
    if (player.summoner_id === player.puuid) {
      console.log(`Déjà migré pour ${player.summoner_name}`);
      continue;
    }
    const { error: updateError } = await supabase
      .from('players')
      .update({ summoner_id: player.puuid })
      .eq('id', player.id);

    if (updateError) {
      console.error(`Erreur pour ${player.summoner_name}:`, updateError);
    } else {
      console.log(`✅ ${player.summoner_name} migré: ${player.summoner_id} → ${player.puuid}`);
    }
  }
  console.log('Migration terminée !');
};

migrateSummonerIdToPUUID(); 