import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

interface LPChange {
  id: string;
  player_id: string;
  previous_lp: number;
  current_lp: number;
  difference: number;
  timestamp: string;
  tier: string;
  rank: string;
  players: {
    summoner_name: string;
  } | null;
}

export const LPTracker = () => {
  const [changes, setChanges] = useState<LPChange[]>([]);

  useEffect(() => {
    const fetchChanges = async () => {
      const { data, error } = await supabase
        .from("lp_tracker")
        .select(
          `
          id,
          player_id,
          previous_lp,
          current_lp,
          difference,
          timestamp,
          tier,
          rank,
          players(summoner_name)
        `
        )
        .order("timestamp", { ascending: false });

      if (!error && data) {
        const typedData = data.map((item) => ({
          ...item,
          players:
            item.players && (item.players as any)[0]
              ? { summoner_name: (item.players as any)[0].summoner_name }
              : null,
        })) as LPChange[];

        setChanges(typedData);
      }
    };

    fetchChanges();

    const subscription = supabase
      .channel("lp_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lp_tracker" },
        (payload) => {
          setChanges((prev) => [payload.new as LPChange, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Suivi des LP (7 derniers jours)
      </h2>
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
        {changes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Aucun changement de LP détecté
          </p>
        ) : (
          changes.map((change) => (
            <div
              key={change.id}
              className="flex items-center justify-between p-2 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-white">
                  {change.players?.summoner_name}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(change.timestamp).toLocaleString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {change.tier} {change.rank}
                </span>
              </div>
              <div
                className={`font-bold ${
                  change.difference > 0
                    ? "text-green-500"
                    : change.difference < 0
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {change.difference > 0 ? "+" : ""}
                {change.difference} LP
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
