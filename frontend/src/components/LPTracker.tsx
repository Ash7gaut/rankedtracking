import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

interface LPChange {
  id: string;
  player_id: string;
  previous_lp: number;
  current_lp: number;
  timestamp: string;
  tier: string;
  rank: string;
  summoner_name: string;
}

interface LPTrackerProps {
  selectedPlayers?: string[];
}

export const LPTracker = ({ selectedPlayers }: LPTrackerProps) => {
  const navigate = useNavigate();
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
          timestamp,
          tier,
          rank,
          summoner_name
        `
        )
        .order("timestamp", { ascending: false })
        .limit(50);

      if (!error && data) {
        const uniqueData = data.filter(
          (change, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.id === change.id &&
                t.player_id === change.player_id &&
                t.timestamp === change.timestamp
            )
        );

        setChanges(uniqueData);
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4 h-[calc(250vh-200px)]">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Suivi des LP (7 derniers jours)
      </h2>
      <div className="space-y-2 h-[calc(235vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
        {changes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Aucun changement de LP détecté
          </p>
        ) : (
          changes.map((change) => {
            const lpDifference = change.current_lp - change.previous_lp;

            return (
              <div
                key={change.id}
                className="flex items-center justify-between p-2 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => navigate(`/player/${change.player_id}`)}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {change.summoner_name || "Unknown"}
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
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {change.previous_lp} LP ⇒ {change.current_lp} LP
                  </span>
                </div>
                <div
                  className={`font-bold ${
                    lpDifference > 0
                      ? "text-green-500"
                      : lpDifference < 0
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {lpDifference > 0 ? "+" : ""}
                  {lpDifference} LP
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
