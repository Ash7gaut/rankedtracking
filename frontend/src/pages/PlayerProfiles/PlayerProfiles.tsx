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
  ExpandMore,
  ExpandLess,
  PersonOutline,
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
  user_id: string;
  username: string;
  email?: string;
}

// Interface pour représenter les profils groupés
interface ProfileGroup {
  playerName: string;
  accounts: Player[];
  expanded: boolean;
}

const PlayerProfiles = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, main, rank
  const [profileGroups, setProfileGroups] = useState<ProfileGroup[]>([]);
  const [filteredProfileGroups, setFilteredProfileGroups] = useState<
    ProfileGroup[]
  >([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      try {
        // Récupérer tous les joueurs
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select(
            "id, summoner_name, player_name, profile_icon_id, tier, rank, league_points, wins, losses, is_main, puuid, role"
          )
          .order("is_main", { ascending: false })
          .order("league_points", { ascending: false });

        if (playersError) {
          console.error(
            "Erreur lors de la récupération des joueurs:",
            playersError
          );
          throw playersError;
        }

        // Récupérer tous les utilisateurs
        const { data: usersData, error: usersError } = await supabase
          .from("usernames")
          .select("user_id, username, email");

        if (usersError) {
          console.error(
            "Erreur lors de la récupération des utilisateurs:",
            usersError
          );
          throw usersError;
        }

        console.log("Joueurs récupérés:", playersData?.length || 0);

        if (playersData && playersData.length > 0) {
          setPlayers(playersData);

          // Regrouper les joueurs par player_name
          const groupedByPlayerName: { [key: string]: Player[] } = {};
          playersData.forEach((player) => {
            if (!groupedByPlayerName[player.player_name]) {
              groupedByPlayerName[player.player_name] = [];
            }
            groupedByPlayerName[player.player_name].push(player);
          });

          // Convertir en tableau de ProfileGroup
          const groups: ProfileGroup[] = Object.keys(groupedByPlayerName).map(
            (playerName) => ({
              playerName,
              accounts: groupedByPlayerName[playerName],
              expanded: false,
            })
          );

          setProfileGroups(groups);
          setFilteredProfileGroups(groups);
        } else {
          console.log("Aucun joueur récupéré");
        }

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
    if (profileGroups.length === 0) return;

    let result = [...profileGroups];

    // Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (group) =>
          group.playerName.toLowerCase().includes(query) ||
          group.accounts.some((account) =>
            account.summoner_name.toLowerCase().includes(query)
          )
      );
    }

    // Filtre
    if (filter === "main") {
      result = result.filter((group) =>
        group.accounts.some((account) => account.is_main)
      );
    }

    setFilteredProfileGroups(result);
  }, [profileGroups, searchQuery, filter]);

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

  // Trouver le compte avec le plus haut Elo dans un groupe
  const getHighestEloAccount = (accounts: Player[]): Player => {
    if (!accounts.length) return accounts[0];

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

    // D'abord, essayer de trouver un compte principal
    const mainAccount = accounts.find((acc) => acc.is_main);
    if (mainAccount) return mainAccount;

    // Sinon, trouver le compte avec le plus haut Elo
    return accounts.reduce((highest, current) => {
      // Si le compte n'a pas de tier, il est moins prioritaire
      if (!current.tier) return highest;
      if (!highest.tier) return current;

      // Comparer les tiers
      if (tierOrder[current.tier] > tierOrder[highest.tier]) return current;
      if (tierOrder[current.tier] < tierOrder[highest.tier]) return highest;

      // Si les tiers sont égaux, comparer les ranks
      const rankOrder: { [key: string]: number } = {
        I: 3,
        II: 2,
        III: 1,
        IV: 0,
      };

      if (!current.rank || !highest.rank) {
        return (current.league_points || 0) > (highest.league_points || 0)
          ? current
          : highest;
      }

      if (rankOrder[current.rank] > rankOrder[highest.rank]) return current;
      if (rankOrder[current.rank] < rankOrder[highest.rank]) return highest;

      // Si les ranks sont égaux, comparer les LP
      return (current.league_points || 0) > (highest.league_points || 0)
        ? current
        : highest;
    }, accounts[0]);
  };

  const toggleProfileExpanded = (index: number) => {
    setFilteredProfileGroups((prev) =>
      prev.map((group, i) =>
        i === index ? { ...group, expanded: !group.expanded } : group
      )
    );
  };

  const navigateToProfile = (playerName: string) => {
    navigate(`/profile/${playerName}`);
  };

  return (
    <div className="min-h-screen">
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
                    placeholder="Rechercher un profil ou un compte..."
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
                    <option value="all">Tous les profils</option>
                    <option value="main">Avec compte principal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des profils */}
          <div className="px-4 md:px-8 mb-16">
            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProfileGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-white/60">
                  <Info className="w-16 h-16 mb-4 opacity-60" />
                  <p className="text-xl font-medium mb-2">
                    Aucun profil trouvé
                  </p>
                  <p>Essayez de modifier vos critères de recherche</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProfileGroups.map((profileGroup, index) => {
                    const highestAccount = getHighestEloAccount(
                      profileGroup.accounts
                    );
                    const mainAccount = profileGroup.accounts.find(
                      (acc) => acc.is_main
                    );
                    const totalAccounts = profileGroup.accounts.length;

                    return (
                      <motion.div
                        key={profileGroup.playerName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toggleProfileExpanded(index)}
                        className="relative bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl p-6 cursor-pointer transition-all duration-300 group overflow-hidden"
                      >
                        {/* Subtle glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${highestAccount.profile_icon_id}.jpg?image=e_upscale,q_auto:good,f_webp,w_auto&v=1729058249`}
                                  alt={profileGroup.playerName}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-white/20 group-hover:border-white/40 transition-all"
                                />
                                {highestAccount.tier && (
                                  <div
                                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center border border-white/20"
                                    title={`${highestAccount.tier} ${highestAccount.rank}`}
                                  >
                                    <img
                                      src={`/ranks/${highestAccount.tier.toLowerCase()}.png`}
                                      alt={highestAccount.tier}
                                      className="w-4 h-4"
                                    />
                                  </div>
                                )}
                                {mainAccount && (
                                  <div
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white/20"
                                    title="Ce profil a un compte principal"
                                  ></div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                  {profileGroup.playerName}
                                </h3>
                                <p className="text-white/60">
                                  {totalAccounts} compte
                                  {totalAccounts > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>

                            <div className="text-white/60">
                              {profileGroup.expanded ? (
                                <ExpandLess />
                              ) : (
                                <ExpandMore />
                              )}
                            </div>
                          </div>

                          {/* Affichage des meilleurs comptes */}
                          <div className="mb-4">
                            {highestAccount.tier ? (
                              <div className="flex items-center gap-2">
                                <EmojiEvents
                                  className={`w-5 h-5 ${getTierColor(
                                    highestAccount.tier
                                  )}`}
                                />
                                <span
                                  className={`font-medium ${getTierColor(
                                    highestAccount.tier
                                  )}`}
                                >
                                  {highestAccount.tier} {highestAccount.rank}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-400">
                                <EmojiEvents className="w-5 h-5" />
                                <span>Aucun compte classé</span>
                              </div>
                            )}
                          </div>

                          {/* Voir profil */}
                          <div
                            className="flex justify-center mt-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToProfile(profileGroup.playerName);
                            }}
                          >
                            <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                              Voir le profil
                              <ArrowForward className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Liste des comptes (expanded) */}
                          {profileGroup.expanded && (
                            <div className="mt-6 pt-4 border-t border-white/10">
                              <h4 className="font-medium text-white/80 mb-3">
                                Comptes liés
                              </h4>
                              <div className="space-y-2">
                                {profileGroup.accounts.map((player) => (
                                  <motion.div
                                    key={player.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/player/${player.id}`);
                                    }}
                                    className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="relative">
                                        <img
                                          src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player.profile_icon_id}.jpg?image=e_upscale,q_auto:good,f_webp,w_auto&v=1729058249`}
                                          alt={player.summoner_name}
                                          className="w-8 h-8 rounded-full object-cover border border-white/20"
                                        />
                                        {player.is_main && (
                                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                                        )}
                                      </div>
                                      <span className="font-medium text-white">
                                        {player.summoner_name}
                                      </span>
                                    </div>
                                    {player.tier ? (
                                      <div className="flex items-center">
                                        <img
                                          src={`/ranks/${player.tier.toLowerCase()}.png`}
                                          alt={player.tier}
                                          className="w-4 h-4 mr-1"
                                        />
                                        <span
                                          className={`text-sm ${getTierColor(
                                            player.tier
                                          )}`}
                                        >
                                          {player.tier} {player.rank}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">
                                        Non classé
                                      </span>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
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
