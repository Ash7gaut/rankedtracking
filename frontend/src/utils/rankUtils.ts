import { Player } from "../types/interfaces";

const rankOrder = {
  'CHALLENGER': 0,
  'GRANDMASTER': 1,
  'MASTER': 2,
  'DIAMOND': 3,
  'EMERALD': 4,
  'PLATINUM': 5,
  'GOLD': 6,
  'SILVER': 7,
  'BRONZE': 8,
  'IRON': 9
};

const divisionOrder = {
  'I': 0,
  'II': 1,
  'III': 2,
  'IV': 3
};

export const compareRanks = (a: Player, b: Player): number => {
  // Si un joueur n'a pas de rang, le mettre à la fin
  if (!a.tier && b.tier) return 1;
  if (a.tier && !b.tier) return -1;
  if (!a.tier && !b.tier) return 0;

  // Comparer les tiers
  const tierDiff = rankOrder[a.tier as keyof typeof rankOrder] - rankOrder[b.tier as keyof typeof rankOrder];
  if (tierDiff !== 0) return tierDiff;

  // Pour Master+, comparer uniquement les LP
  if (['CHALLENGER', 'GRANDMASTER', 'MASTER'].includes(a.tier!)) {
    return (b.league_points || 0) - (a.league_points || 0);
  }

  // Comparer les divisions
  const divisionDiff = divisionOrder[a.rank as keyof typeof divisionOrder] - divisionOrder[b.rank as keyof typeof divisionOrder];
  if (divisionDiff !== 0) return divisionDiff;

  // Si même division, comparer les LP
  return (b.league_points || 0) - (a.league_points || 0);
};