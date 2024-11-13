interface ChampionData {
  [key: string]: {
    key: string;
    name: string;
  };
}

// Cette map sera remplie au premier appel
let championMap: Map<string, string> | null = null;

export const getChampionNameById = async (championId: number): Promise<string> => {
  if (!championMap) {
    // Charger les données des champions si pas encore fait
    const response = await fetch(
      "https://ddragon.leagueoflegends.com/cdn/14.5.1/data/fr_FR/champion.json"
    );
    const data = await response.json();
    
    // Créer la map id -> nom
    championMap = new Map();
    Object.values(data.data as ChampionData).forEach((champion) => {
      championMap!.set(champion.key, champion.name);
    });
  }

  // Retourner le nom du champion ou une valeur par défaut
  return championMap.get(championId.toString()) || "Unknown";
};