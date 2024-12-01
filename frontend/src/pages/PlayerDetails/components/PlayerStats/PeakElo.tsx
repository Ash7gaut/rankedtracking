import { useQuery } from "react-query";
import { supabase } from "../../../../utils/supabase";
import { getRankValue } from "../../../../utils/rankUtils";

interface PeakEloProps {
  playerId: string;
}

export const PeakElo = ({ playerId }: PeakEloProps) => {
  const { data: peakElo } = useQuery(["peakElo", playerId], async () => {
    const { data, error } = await supabase
      .from("player_history")
      .select("*")
      .eq("player_id", playerId);

    if (error) throw error;

    // Trouver le peak elo en comparant les valeurs numériques
    return data.reduce((peak, current) => {
      const currentValue = getRankValue(
        current.tier,
        current.rank,
        current.league_points
      );
      const peakValue = getRankValue(peak.tier, peak.rank, peak.league_points);
      return currentValue > peakValue ? current : peak;
    }, data[0]);
  });

  if (!peakElo) return null;

  return (
    <div className="mt-2 flex items-center gap-2">
      <img
        src={`/ranks/${peakElo.tier?.toLowerCase() || "unranked"}.png`}
        alt={peakElo.tier || "UNRANKED"}
        className="w-8 h-8"
      />
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {peakElo.tier} {peakElo.rank}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {peakElo.league_points} LP
        </span>
      </div>
    </div>
  );
};
