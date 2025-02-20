import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";
import { Timeline, TrendingUp, TrendingDown } from "@mui/icons-material";

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
      // Calculer la date d'il y a 7 jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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
        .gte("timestamp", sevenDaysAgo.toISOString())
        .order("timestamp", { ascending: false });

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

  // Calculer les statistiques globales
  const stats = changes.reduce(
    (acc, change) => {
      if (change.difference > 0) {
        acc.gains += change.difference;
        acc.wins++;
      } else if (change.difference < 0) {
        acc.losses += Math.abs(change.difference);
        acc.defeats++;
      }
      return acc;
    },
    { gains: 0, losses: 0, wins: 0, defeats: 0 }
  );

  return (
    <div className="flex flex-col h-[300vh]">
      <div className="flex items-center gap-3 mb-6">
        <Timeline className="w-6 h-6 text-blue-500" />
        <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Suivi des LP (7j)
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Gains
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{stats.gains} LP
            </span>
            <span className="text-sm text-green-600/70 dark:text-green-400/70">
              {stats.wins} victoires
            </span>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Pertes
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              -{stats.losses} LP
            </span>
            <span className="text-sm text-red-600/70 dark:text-red-400/70">
              {stats.defeats} défaites
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0">
        <div className="space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {changes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <Timeline className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-center">
                Aucun changement de LP détecté sur les 7 derniers jours
              </p>
            </div>
          ) : (
            changes.map((change) => (
              <div
                key={change.id}
                onClick={() => navigate(`/player/${change.player_id}`)}
                className="group bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl p-4 cursor-pointer transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {change.summoner_name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(change.timestamp).toLocaleString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <img
                      src={`/ranks/${(
                        change.previous_tier || "unranked"
                      ).toLowerCase()}.png`}
                      alt={change.previous_tier || "UNRANKED"}
                      className="w-4 h-4"
                    />
                    {getTierAbbreviation(change.previous_tier)}{" "}
                    {change.previous_rank} {change.previous_lp}LP →{" "}
                    <img
                      src={`/ranks/${(
                        change.tier || "unranked"
                      ).toLowerCase()}.png`}
                      alt={change.tier || "UNRANKED"}
                      className="w-4 h-4"
                    />
                    {getTierAbbreviation(change.tier)} {change.rank}{" "}
                    {change.current_lp}LP
                  </span>
                  <span
                    className={`font-medium ${
                      change.difference > 0
                        ? "text-green-600 dark:text-green-400"
                        : change.difference < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {change.difference > 0 ? "+" : ""}
                    {change.difference} LP
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
