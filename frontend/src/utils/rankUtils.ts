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

export const getRankValue = (tier?: string | null, rank?: string | null, lp: number = 0): number => {
  if (!tier) return 0;

  const baseValue = (9 - (rankOrder[tier as keyof typeof rankOrder] || 0)) * 400;
  
  // Pour Master+, on ajoute directement les LP
  if (['CHALLENGER', 'GRANDMASTER', 'MASTER'].includes(tier)) {
    return baseValue + lp;
  }

  // Pour les autres rangs, on ajoute la division et les LP
  const divisionValue = rank ? (3 - (divisionOrder[rank as keyof typeof divisionOrder] || 0)) * 100 : 0;
  return baseValue + divisionValue + lp;
};

export const compareRanks = (a: Player, b: Player): number => {
  const aValue = getRankValue(a.tier, a.rank, a.league_points);
  const bValue = getRankValue(b.tier, b.rank, b.league_points);
  return bValue - aValue;
};