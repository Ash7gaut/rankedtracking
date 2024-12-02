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
  difference: number;
  previous_tier: string;
  previous_rank: string;
}

interface LPTrackerProps {
  selectedPlayers?: string[];
  showNegativeOnly?: boolean;
  negativeWinratePlayers?: Set<string>;
}

// Fonction utilitaire pour obtenir l'abréviation du tier
const getTierAbbreviation = (tier: string) => {
  const abbreviations: { [key: string]: string } = {
    IRON: "I",
    BRONZE: "B",
    SILVER: "S",
    GOLD: "G",
    PLATINUM: "P",
    DIAMOND: "D",
    MASTER: "M",
    GRANDMASTER: "GM",
    CHALLENGER: "C",
  };
  return abbreviations[tier] || tier;
};

export const LPTracker = ({
  selectedPlayers = [],
  showNegativeOnly = false,
  negativeWinratePlayers = new Set(),
}: LPTrackerProps) => {
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
          difference,
          timestamp,
          tier,
          rank,
          summoner_name,
          previous_tier,
          previous_rank
        `
        )
        .order("timestamp", { ascending: false })
        .limit(50);

      if (!error && data) {
        let filteredData = data;

        // Filtre simple : si un joueur est sélectionné, on montre tous ses comptes
        if (selectedPlayers.length > 0) {
          const { data: linkedAccounts } = await supabase
            .from("players")
            .select("summoner_name, player_name")
            .in("player_name", selectedPlayers);

          if (linkedAccounts) {
            const linkedSummonerNames = linkedAccounts.map(
              (acc) => acc.summoner_name
            );
            filteredData = filteredData.filter((change) =>
              linkedSummonerNames.includes(change.summoner_name)
            );
          }
        }

        setChanges(filteredData);
      }
    };

    fetchChanges();

    const subscription = supabase
      .channel("lp_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lp_tracker" },
        (payload) => {
          const newChange = payload.new as LPChange;

          // Appliquer les mêmes filtres aux nouvelles données
          const shouldAdd =
            (selectedPlayers.length === 0 ||
              selectedPlayers.includes(newChange.summoner_name)) &&
            (!showNegativeOnly ||
              negativeWinratePlayers.has(newChange.summoner_name));

          if (shouldAdd) {
            setChanges((prev) => [newChange, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedPlayers, showNegativeOnly, negativeWinratePlayers]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4 h-[calc(250vh-200px)]">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Suivi des LP (7 derniers jours)
      </h2>
      <div className="space-y-2 h-[calc(235vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-700 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
        {changes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Aucun changement de LP détecté
          </p>
        ) : (
          changes.map((change) => {
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
                    {getTierAbbreviation(change.previous_tier)}{" "}
                    {change.previous_rank} {change.previous_lp}LP ⇒{" "}
                    {getTierAbbreviation(change.tier)} {change.rank}{" "}
                    {change.current_lp}LP
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
            );
          })
        )}
      </div>
    </div>
  );
};
