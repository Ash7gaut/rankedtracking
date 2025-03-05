import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import { motion } from "framer-motion";
import {
  Search,
  Info,
  EmojiEvents,
  ArrowForward,
  FilterList,
  Timeline,
} from "@mui/icons-material";
import { HeaderUniform } from "../../components/HeaderUniform";

// Types
interface Player {
  id: string;
  summoner_name: string;
  player_name: string;
  profile_icon_id: number;
  tier?: string;
  rank?: string;
  league_points?: number;
  wins?: number;
  losses?: number;
  is_main: boolean;
  puuid: string;
  role?: string;
}

interface User {
  id: string;
  username: string;
  role?: string;
}

const PlayerProfiles = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, main, rank

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      try {
        // Récupérer tous les joueurs
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("*")
          .order("is_main", { ascending: false })
          .order("league_points", { ascending: false });

        if (playersError) throw playersError;

        // Récupérer tous les utilisateurs
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, username, role");

        if (usersError) throw usersError;

        setPlayers(playersData || []);
        setFilteredPlayers(playersData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    // Appliquer le filtre et la recherche
    let result = [...players];

    // Filtre
    if (filter === "main") {
      result = result.filter((player) => player.is_main);
    } else if (filter === "rank") {
      result = result.filter((player) => player.tier);
      result.sort((a, b) => {
        const tierOrder: { [key: string]: number } = {
          CHALLENGER: 9,
          GRANDMASTER: 8,
          MASTER: 7,
          DIAMOND: 6,
          EMERALD: 5,
          PLATINUM: 4,
          GOLD: 3,
          SILVER: 2,
          BRONZE: 1,
          IRON: 0,
        };

        if (!a.tier) return 1;
        if (!b.tier) return -1;

        if (tierOrder[a.tier] !== tierOrder[b.tier]) {
          return tierOrder[b.tier] - tierOrder[a.tier];
        }

        if (!a.rank || !b.rank) return 0;

        const rankOrder: { [key: string]: number } = {
          I: 3,
          II: 2,
          III: 1,
          IV: 0,
        };

        if (rankOrder[a.rank] !== rankOrder[b.rank]) {
          return rankOrder[b.rank] - rankOrder[a.rank];
        }

        return (b.league_points || 0) - (a.league_points || 0);
      });
    }

    // Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (player) =>
          player.summoner_name.toLowerCase().includes(query) ||
          player.player_name.toLowerCase().includes(query)
      );
    }

    setFilteredPlayers(result);
  }, [players, searchQuery, filter]);

  const calculateWinRate = (wins?: number, losses?: number) => {
    if (!wins && !losses) return "N/A";
    const totalGames = (wins || 0) + (losses || 0);
    if (totalGames === 0) return "0%";
    return `${Math.round(((wins || 0) * 100) / totalGames)}%`;
  };

  const getTierColor = (tier?: string) => {
    const tierColors: { [key: string]: string } = {
      CHALLENGER: "text-yellow-500",
      GRANDMASTER: "text-red-500",
      MASTER: "text-purple-500",
      DIAMOND: "text-blue-400",
      EMERALD: "text-emerald-500",
      PLATINUM: "text-teal-400",
      GOLD: "text-yellow-400",
      SILVER: "text-gray-400",
      BRONZE: "text-amber-600",
      IRON: "text-gray-500",
    };
    return tier ? tierColors[tier] || "text-gray-400" : "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HeaderUniform title="Profils Détaillés" showHomeButton={true} />

      <div className="container mx-auto px-4 py-6">
        {/* Content with higher z-index */}
        <div className="relative z-10">
          {/* Filtres et recherche */}
          <div className="px-4 md:px-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un joueur..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 text-white placeholder-white/60 rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <FilterList className="text-white/60" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white/10 text-white rounded-lg border border-white/10 px-3 py-2 focus:border-blue-500/50 focus:outline-none transition-all"
                  >
                    <option value="all">Tous les comptes</option>
                    <option value="main">Comptes principaux</option>
                    <option value="rank">Par classement</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des joueurs */}
          <div className="px-4 md:px-8 mb-16">
            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 h-56"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-white/10 h-12 w-12"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/10 rounded w-3/4"></div>
                          <div className="h-3 bg-white/10 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-3 mt-6">
                        <div className="h-3 bg-white/10 rounded"></div>
                        <div className="h-3 bg-white/10 rounded w-5/6"></div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="h-6 bg-white/10 rounded"></div>
                          <div className="h-6 bg-white/10 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-white/60">
                  <Info className="w-16 h-16 mb-4 opacity-60" />
                  <p className="text-xl font-medium mb-2">
                    Aucun joueur trouvé
                  </p>
                  <p>Essayez de modifier vos critères de recherche</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlayers.map((player) => {
                    const userInfo = users.find(
                      (u) => u.username === player.player_name
                    );
                    const winRate = calculateWinRate(
                      player.wins,
                      player.losses
                    );
                    const totalGames =
                      (player.wins || 0) + (player.losses || 0);

                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate(`/player/${player.id}`)}
                        className="relative bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl p-6 cursor-pointer transition-all duration-300 group overflow-hidden"
                      >
                        {/* Subtle glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>

                        <div className="relative z-10">
                          {/* Étiquette de compte principal */}
                          {player.is_main && (
                            <div className="absolute top-0 right-0 bg-blue-500/80 text-white text-xs font-medium px-2 py-1 rounded-bl-lg rounded-tr-lg">
                              Compte Principal
                            </div>
                          )}

                          {/* En-tête avec avatar et nom */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <img
                                src={`https://ddragon.leagueoflegends.com/cdn/14.5.1/img/profileicon/${player.profile_icon_id}.png`}
                                alt={player.summoner_name}
                                className="w-14 h-14 rounded-full object-cover border-2 border-white/20 group-hover:border-white/40 transition-all"
                              />
                              {player.tier && (
                                <div
                                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center border border-white/20"
                                  title={`${player.tier} ${player.rank}`}
                                >
                                  <img
                                    src={`/ranks/${player.tier.toLowerCase()}.png`}
                                    alt={player.tier}
                                    className="w-4 h-4"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                {player.summoner_name}
                              </h3>
                              <p className="text-sm text-white/60">
                                {player.player_name}
                              </p>
                              {userInfo?.role && (
                                <span className="inline-block mt-1 text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded">
                                  {userInfo.role}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Informations de rang */}
                          {player.tier ? (
                            <div className="flex items-center gap-2 mb-4">
                              <EmojiEvents
                                className={`w-5 h-5 ${getTierColor(
                                  player.tier
                                )}`}
                              />
                              <span
                                className={`font-medium ${getTierColor(
                                  player.tier
                                )}`}
                              >
                                {player.tier} {player.rank} •{" "}
                                {player.league_points} LP
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mb-4 text-gray-400">
                              <EmojiEvents className="w-5 h-5" />
                              <span>Non classé</span>
                            </div>
                          )}

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4 mt-auto">
                            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 text-center">
                              <div className="text-sm text-white/60 mb-1">
                                Victoires / Défaites
                              </div>
                              <div className="font-medium">
                                {player.wins || 0} / {player.losses || 0}
                              </div>
                            </div>
                            <div
                              className={`backdrop-blur-sm rounded-lg p-3 text-center ${
                                totalGames === 0
                                  ? "bg-white/5 text-white/80"
                                  : winRate !== "N/A" && parseInt(winRate) >= 50
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              <div className="text-sm text-white/60 mb-1">
                                Win Rate
                              </div>
                              <div className="font-medium">{winRate}</div>
                            </div>
                          </div>

                          {/* Icône pour indiquer que c'est cliquable */}
                          <div className="absolute bottom-3 right-3 text-white/40 group-hover:text-white/80 transition-colors">
                            <ArrowForward className="w-5 h-5" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfiles;
