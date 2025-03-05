import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import { motion } from "framer-motion";
import {
  Timeline,
  ArrowForward,
  TrendingUp,
  TrendingDown,
  FilterAlt,
  DateRange,
  Group,
  RestartAlt,
} from "@mui/icons-material";
import { LPTracker } from "../../components/LPTracker";
import { HeaderUniform } from "../../components/HeaderUniform";

interface Player {
  id: string;
  summoner_name: string;
  player_name: string;
  is_main: boolean;
}

interface LPStats {
  totalGains: number;
  totalLosses: number;
  winCount: number;
  lossCount: number;
  netChange: number;
  promotion: boolean;
  demotion: boolean;
}

const LPTracking = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<number>(7); // En jours
  const [showNegativeOnly, setShowNegativeOnly] = useState<boolean>(false);
  const [negativeWinratePlayers, setNegativeWinratePlayers] = useState<
    Set<string>
  >(new Set());
  const [lpStats, setLpStats] = useState<LPStats>({
    totalGains: 0,
    totalLosses: 0,
    winCount: 0,
    lossCount: 0,
    netChange: 0,
    promotion: false,
    demotion: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer tous les joueurs
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from("players")
          .select("id, summoner_name, player_name, is_main")
          .order("is_main", { ascending: false });

        if (error) throw error;
        setPlayers(data || []);

        // Récupérer les joueurs à winrate négatif
        const { data: statsData, error: statsError } = await supabase
          .from("players")
          .select("summoner_name, wins, losses")
          .not("wins", "is", null)
          .not("losses", "is", null);

        if (statsError) throw statsError;

        const negWinratePlayers = new Set<string>();
        statsData?.forEach((player) => {
          const totalGames = (player.wins || 0) + (player.losses || 0);
          if (totalGames > 0 && (player.wins || 0) / totalGames < 0.5) {
            negWinratePlayers.add(player.summoner_name);
          }
        });

        setNegativeWinratePlayers(negWinratePlayers);
      } catch (error) {
        console.error("Erreur lors de la récupération des joueurs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Récupérer les statistiques LP
  useEffect(() => {
    const fetchLPStats = async () => {
      try {
        // Calculer la date limite
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - timeRange);

        // Construire la requête
        let query = supabase
          .from("lp_tracker")
          .select(
            "difference, timestamp, previous_tier, tier, previous_rank, rank"
          )
          .gte("timestamp", dateLimit.toISOString());

        // Filtrer par joueurs sélectionnés si nécessaire
        if (selectedPlayers.length > 0) {
          // Récupérer d'abord tous les comptes liés aux joueurs sélectionnés
          const { data: linkedAccounts } = await supabase
            .from("players")
            .select("summoner_name, player_name")
            .in("player_name", selectedPlayers);

          if (linkedAccounts && linkedAccounts.length > 0) {
            const summonerNames = linkedAccounts.map(
              (acc) => acc.summoner_name
            );
            query = query.in("summoner_name", summonerNames);
          }
        }

        // Exécuter la requête
        const { data, error } = await query;

        if (error) throw error;

        // Calculer les statistiques
        const stats: LPStats = {
          totalGains: 0,
          totalLosses: 0,
          winCount: 0,
          lossCount: 0,
          netChange: 0,
          promotion: false,
          demotion: false,
        };

        data?.forEach((entry) => {
          // Calculer gains et pertes
          if (entry.difference > 0) {
            stats.totalGains += entry.difference;
            stats.winCount++;
          } else if (entry.difference < 0) {
            stats.totalLosses += Math.abs(entry.difference);
            stats.lossCount++;
          }

          // Calculer la différence nette
          stats.netChange += entry.difference;

          // Détecter les promotions et rétrogradations
          const tierOrder = [
            "IRON",
            "BRONZE",
            "SILVER",
            "GOLD",
            "PLATINUM",
            "EMERALD",
            "DIAMOND",
            "MASTER",
            "GRANDMASTER",
            "CHALLENGER",
          ];
          const previousTierIndex = tierOrder.indexOf(entry.previous_tier);
          const currentTierIndex = tierOrder.indexOf(entry.tier);

          if (currentTierIndex > previousTierIndex) {
            stats.promotion = true;
          } else if (currentTierIndex < previousTierIndex) {
            stats.demotion = true;
          }
        });

        setLpStats(stats);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des statistiques LP:",
          error
        );
      }
    };

    fetchLPStats();
  }, [selectedPlayers, timeRange]);

  const handlePlayerSelection = (playerName: string) => {
    setSelectedPlayers((prev) => {
      if (prev.includes(playerName)) {
        return prev.filter((p) => p !== playerName);
      } else {
        return [...prev, playerName];
      }
    });
  };

  const handleResetFilters = () => {
    setSelectedPlayers([]);
    setTimeRange(7);
    setShowNegativeOnly(false);
  };

  return (
    <div className="min-h-screen">
      <HeaderUniform title="Suivi LP" showHomeButton={true} />

      <div className="container mx-auto px-4 py-6">
        {/* Content with higher z-index */}
        <div className="relative z-10">
          {/* Filtres */}
          <div className="px-4 md:px-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FilterAlt className="text-blue-400" />
                  <h2 className="font-semibold text-lg">Filtres</h2>

                  <button
                    onClick={handleResetFilters}
                    className="ml-auto flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    <RestartAlt className="w-4 h-4" />
                    <span>Réinitialiser</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Filtre de période */}
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-white/80">
                      <DateRange className="w-4 h-4 text-white/60" />
                      <span>Période</span>
                    </label>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(Number(e.target.value))}
                      className="w-full bg-white/10 text-white rounded-lg border border-white/10 px-3 py-2 focus:border-blue-500/50 focus:outline-none transition-all"
                    >
                      <option value={1}>Dernières 24 heures</option>
                      <option value={3}>3 derniers jours</option>
                      <option value={7}>7 derniers jours</option>
                      <option value={14}>2 dernières semaines</option>
                      <option value={30}>30 derniers jours</option>
                    </select>
                  </div>

                  {/* Filtre de joueurs */}
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-white/80">
                      <Group className="w-4 h-4 text-white/60" />
                      <span>Joueurs</span>
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-white/10 rounded-lg border border-white/10">
                      {players.map((player) => (
                        <button
                          key={player.id}
                          onClick={() =>
                            handlePlayerSelection(player.player_name)
                          }
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            selectedPlayers.includes(player.player_name)
                              ? "bg-blue-500 text-white"
                              : "bg-white/10 text-white/80 hover:bg-white/20"
                          }`}
                        >
                          {player.player_name}
                          {player.is_main && " ★"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtre winrate négative */}
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showNegativeOnly}
                        onChange={() => setShowNegativeOnly(!showNegativeOnly)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/80"></div>
                      <span className="ml-3 text-white/80">
                        Winrate négative uniquement
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques globales */}
          <div className="px-4 md:px-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {/* Net Change */}
                <div
                  className={`bg-white/5 backdrop-blur-sm border ${
                    lpStats.netChange > 0
                      ? "border-green-500/30"
                      : lpStats.netChange < 0
                      ? "border-red-500/30"
                      : "border-white/10"
                  } rounded-xl p-6`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-full ${
                        lpStats.netChange > 0
                          ? "bg-green-500/20 text-green-400"
                          : lpStats.netChange < 0
                          ? "bg-red-500/20 text-red-400"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {lpStats.netChange > 0 ? (
                        <TrendingUp className="w-6 h-6" />
                      ) : lpStats.netChange < 0 ? (
                        <TrendingDown className="w-6 h-6" />
                      ) : (
                        <Timeline className="w-6 h-6" />
                      )}
                    </div>
                    <h3 className="font-medium text-white/90">Bilan LP</h3>
                  </div>
                  <div
                    className={`text-3xl font-bold ${
                      lpStats.netChange > 0
                        ? "text-green-400"
                        : lpStats.netChange < 0
                        ? "text-red-400"
                        : "text-white/80"
                    }`}
                  >
                    {lpStats.netChange > 0 ? "+" : ""}
                    {lpStats.netChange} LP
                  </div>
                </div>

                {/* Gains */}
                <div className="bg-green-900/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/20 text-green-400 rounded-full">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-green-300">Gains</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-400">
                    +{lpStats.totalGains} LP
                  </div>
                  <div className="text-sm text-green-300/70 mt-1">
                    {lpStats.winCount} victoires
                  </div>
                </div>

                {/* Pertes */}
                <div className="bg-red-900/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/20 text-red-400 rounded-full">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-red-300">Pertes</h3>
                  </div>
                  <div className="text-3xl font-bold text-red-400">
                    -{lpStats.totalLosses} LP
                  </div>
                  <div className="text-sm text-red-300/70 mt-1">
                    {lpStats.lossCount} défaites
                  </div>
                </div>

                {/* Événements */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/10 text-white/80 rounded-full">
                      <Timeline className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-white/90">Événements</h3>
                  </div>
                  <div className="space-y-2">
                    {lpStats.promotion && (
                      <div className="flex items-center gap-2 text-green-400">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span>Promotion(s)</span>
                      </div>
                    )}
                    {lpStats.demotion && (
                      <div className="flex items-center gap-2 text-red-400">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <span>Rétrogradation(s)</span>
                      </div>
                    )}
                    {!lpStats.promotion && !lpStats.demotion && (
                      <div className="flex items-center gap-2 text-white/60">
                        <div className="w-2 h-2 rounded-full bg-white/40"></div>
                        <span>Aucun changement de division</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Composant LPTracker */}
          <div className="px-4 md:px-8 mb-16">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <LPTracker
                  selectedPlayers={selectedPlayers}
                  showNegativeOnly={showNegativeOnly}
                  negativeWinratePlayers={negativeWinratePlayers}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LPTracking;
