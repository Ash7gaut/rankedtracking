import { useQuery } from "react-query";
import { supabase } from "../../../../utils/supabase";
import { getRankValue } from "../../../../utils/rankUtils";

interface RankProgressionProps {
  playerId: string;
}

export const RankProgression = ({ playerId }: RankProgressionProps) => {
  const { data: history } = useQuery(
    ["rankProgression", playerId],
    async () => {
      const { data, error } = await supabase
        .from("player_history")
        .select("*")
        .eq("player_id", playerId)
        .order("timestamp", { ascending: false })
        .limit(2);

      if (error) throw error;
      return data;
    }
  );

  if (!history || history.length < 2) return null;

  const [current, previous] = history;
  const currentValue = getRankValue(
    current.tier,
    current.rank,
    current.league_points
  );
  const previousValue = getRankValue(
    previous.tier,
    previous.rank,
    previous.league_points
  );
  const difference = currentValue - previousValue;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <span
          className={`text-lg font-semibold ${
            difference > 0
              ? "text-green-500"
              : difference < 0
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {difference > 0 ? "+" : ""}
          {difference} LP
        </span>
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        depuis la dernière mise à jour
      </span>
    </div>
  );
};
