import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import {
  Search,
  EmojiEvents,
  Person,
  Timeline,
  Add,
  SportsEsports,
  Leaderboard,
  PersonAdd,
  KeyboardArrowRight,
  ShowChart,
  InsertChart,
  Equalizer,
  AccessTime,
  Groups,
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";
import { AccountMenu } from "../../components/AccountMenu";
import { Session } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

// Interface pour un joueur
interface Player {
  id: string;
  summoner_name: string;
  player_name: string;
  profile_icon_id: number;
  tier: string | null;
  rank: string | null;
  league_points: number;
  is_main: boolean;
  wins?: number;
  losses?: number;
  in_game?: boolean;
}

interface PlayerSuggestion {
  id: string;
  name: string;
  profile_icon_id: number;
  tier: string | null;
  rank: string | null;
  league_points: number;
  is_main: boolean;
}

const LandingPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [playerSuggestions, setPlayerSuggestions] = useState<
    PlayerSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [recentLPChanges, setRecentLPChanges] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [displayedPlayers, setDisplayedPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const carouselInterval = useRef<NodeJS.Timeout | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [inGamePlayers, setInGamePlayers] = useState<Player[]>([]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Récupérer les données pour les trois sections
  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        // Définir l'ordre des tiers pour le tri
        const tierOrder: Record<string, number> = {
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

        // Récupérer les données des joueurs
        const { data, error } = await supabase
          .from("players")
          .select(
            "id, summoner_name, player_name, profile_icon_id, tier, rank, league_points, wins, losses, is_main"
          )
          .not("tier", "is", null)
          .limit(20); // Récupérer plus de joueurs pour le tri côté client

        if (error) throw error;

        // Trier côté client pour garantir le bon ordre
        const sortedPlayers = (data || [])
          .sort((a, b) => {
            // D'abord par tier
            const aTierValue = a.tier ? tierOrder[a.tier] || 0 : 0;
            const bTierValue = b.tier ? tierOrder[b.tier] || 0 : 0;

            if (bTierValue !== aTierValue) {
              return bTierValue - aTierValue;
            }

            // Ensuite par rang (I est meilleur que IV)
            const getRankValue = (rank: string | null) => {
              if (!rank) return 0;
              switch (rank) {
                case "I":
                  return 4;
                case "II":
                  return 3;
                case "III":
                  return 2;
                case "IV":
                  return 1;
                default:
                  return 0;
              }
            };

            const aRankValue = getRankValue(a.rank);
            const bRankValue = getRankValue(b.rank);

            if (bRankValue !== aRankValue) {
              return bRankValue - aRankValue;
            }

            // Enfin par LP
            return (b.league_points || 0) - (a.league_points || 0);
          })
          .slice(0, 3); // Prendre les 3 meilleurs après le tri

        setTopPlayers(sortedPlayers);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des meilleurs joueurs:",
          error
        );
      }
    };

    const fetchRecentLPChanges = async () => {
      try {
        // Récupérer les changements de LP récents
        const { data, error } = await supabase
          .from("lp_tracker")
          .select(
            "id, player_id, summoner_name, previous_tier, previous_rank, previous_lp, current_lp, difference, timestamp, tier, rank"
          )
          .order("timestamp", { ascending: false })
          .not("difference", "eq", 0)
          .limit(3);

        if (error) throw error;

        // Récupérer les informations des joueurs pour ces changements
        const playerIds = (data || []).map((item) => item.player_id);
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("id, profile_icon_id, is_main")
          .in("id", playerIds);

        if (playersError) throw playersError;

        // Créer une map des informations de joueurs
        const playerMap = (playersData || []).reduce((acc, player) => {
          acc[player.id] = player;
          return acc;
        }, {} as Record<string, any>);

        // Combiner les données
        const processedData = (data || []).map((item) => ({
          ...item,
          profile_icon_id: playerMap[item.player_id]?.profile_icon_id || 1,
          is_main: playerMap[item.player_id]?.is_main || false,
        }));

        setRecentLPChanges(processedData);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des changements LP récents:",
          error
        );
      }
    };

    const fetchAllPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from("players")
          .select(
            "id, summoner_name, player_name, profile_icon_id, tier, rank, is_main, league_points"
          )
          .not("tier", "is", null)
          .order("is_main", { ascending: false })
          .order("league_points", { ascending: false })
          .limit(12);

        if (error) throw error;
        setAllPlayers(data || []);
        if (data && data.length > 0) {
          setDisplayedPlayers(data.slice(0, 3));
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de tous les joueurs:",
          error
        );
      }
    };

    const fetchInGamePlayers = async () => {
      try {
        const { data, error } = await supabase
          .from("players")
          .select(
            "id, summoner_name, player_name, profile_icon_id, tier, rank, is_main, league_points, wins, losses, in_game"
          )
          .eq("in_game", true)
          .limit(6);

        if (error) throw error;
        setInGamePlayers(data || []);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des joueurs en partie:",
          error
        );
      }
    };

    fetchTopPlayers();
    fetchRecentLPChanges();
    fetchAllPlayers();
    fetchInGamePlayers();

    // Mettre à jour les joueurs en partie toutes les 2 minutes
    const inGameInterval = setInterval(() => {
      fetchInGamePlayers();
    }, 2 * 60 * 1000);

    return () => {
      clearInterval(inGameInterval);
    };
  }, []);

  // Autoplay pour le carrousel
  useEffect(() => {
    if (allPlayers.length > 3) {
      carouselInterval.current = setInterval(() => {
        setCurrentPlayerIndex((prevIndex) => {
          const nextIndex = (prevIndex + 3) % allPlayers.length;
          const endIndex = Math.min(nextIndex + 3, allPlayers.length);
          setDisplayedPlayers(allPlayers.slice(nextIndex, endIndex));
          return nextIndex;
        });
      }, 5000);
    }

    return () => {
      if (carouselInterval.current) {
        clearInterval(carouselInterval.current);
      }
    };
  }, [allPlayers]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 1) {
      try {
        const { data, error } = await supabase
          .from("players")
          .select(
            "id, summoner_name, profile_icon_id, tier, rank, league_points, is_main"
          )
          .ilike("summoner_name", `%${query}%`)
          .limit(5);

        if (error) throw error;

        setPlayerSuggestions(
          data.map((player) => ({
            id: player.id,
            name: player.summoner_name,
            profile_icon_id: player.profile_icon_id,
            tier: player.tier,
            rank: player.rank,
            league_points: player.league_points,
            is_main: player.is_main,
          }))
        );
        setShowSuggestions(true);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
      }
    } else {
      setPlayerSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPlayer = (playerId: string) => {
    navigate(`/player/${playerId}`);
    setSearchQuery("");
    setPlayerSuggestions([]);
    setShowSuggestions(false);
  };

  const handlePlayerClick = (playerId: string) => {
    navigate(`/player/${playerId}`);
  };

  const handleLPChangeClick = (playerId: string) => {
    navigate(`/player/${playerId}`);
  };

  // Animation pour les éléments
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} h`;
    } else {
      return `${Math.floor(diffMins / 1440)} j`;
    }
  };

  const getTierColor = (tier?: string | null) => {
    if (!tier) return "text-white/60";
    switch (tier.toLowerCase()) {
      case "iron":
        return "text-gray-400";
      case "bronze":
        return "text-amber-700";
      case "silver":
        return "text-gray-300";
      case "gold":
        return "text-yellow-400";
      case "platinum":
        return "text-cyan-300";
      case "emerald":
        return "text-emerald-400";
      case "diamond":
        return "text-blue-400";
      case "master":
        return "text-purple-400";
      case "grandmaster":
        return "text-red-400";
      case "challenger":
        return "text-yellow-300";
      default:
        return "text-white/60";
    }
  };

  const getTierAbbreviation = (tier: string | null | undefined) => {
    if (!tier) return "U";

    switch (tier.toLowerCase()) {
      case "iron":
        return "I";
      case "bronze":
        return "B";
      case "silver":
        return "S";
      case "gold":
        return "G";
      case "platinum":
        return "P";
      case "emerald":
        return "E";
      case "diamond":
        return "D";
      case "master":
        return "M";
      case "grandmaster":
        return "GM";
      case "challenger":
        return "C";
      default:
        return "U";
    }
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative">
      {/* Le contenu avec un z-index plus élevé */}
      <div className="relative z-10">
        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">LeagueTracker</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigate("/leaderboard")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Classement
              </button>
              <button
                onClick={() => navigate("/players")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Joueurs
              </button>
              <button
                onClick={() => navigate("/lp-tracking")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Suivi LP
              </button>

              {/* Only show logout if user is logged in */}
              {session ? (
                <AccountMenu session={session} />
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Connexion
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 inset-x-0 z-50 p-2">
            <div className="rounded-lg shadow-lg bg-gray-800/90 backdrop-blur-lg ring-1 ring-white/10 ring-opacity-5 overflow-hidden">
              <div className="px-5 pt-4 pb-6 space-y-4">
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigate("/leaderboard");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    Classement
                  </button>
                  <button
                    onClick={() => {
                      navigate("/players");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    Joueurs
                  </button>
                  <button
                    onClick={() => {
                      navigate("/lp-tracking");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    Suivi LP
                  </button>

                  {session ? (
                    <>
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-purple-300 hover:bg-white/10 transition-colors"
                      >
                        Profil
                      </button>
                      <button
                        onClick={() => {
                          supabase.auth.signOut();
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-white/10 transition-colors"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        navigate("/login");
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-purple-300 hover:bg-white/10 transition-colors"
                    >
                      Connexion
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
          {/* Hero Section */}
          <section className="mb-24">
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
              >
                DÉCOUVREZ LE SITE DE LA
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-6xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
              >
                S2N LOL
              </motion.h1>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-block px-4 py-1 bg-gray-800/60 backdrop-blur-sm rounded-lg text-xl text-white font-semibold"
              >
                STATS
              </motion.span>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xl text-white/80 mt-6 mb-12 max-w-3xl mx-auto"
              >
                Suivez vos performances et celles de vos amis en temps réel.
                Obtenez des statistiques détaillées et améliorez votre jeu.
              </motion.p>
            </div>

            {/* Search Bar avec effet glassmorphism */}
            <div className="max-w-3xl mx-auto relative z-[10000]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl"
              >
                <div className="flex items-center p-1">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Rechercher un joueur..."
                      className="w-full pl-12 pr-4 py-3 bg-transparent text-white/90 placeholder-white/60 focus:outline-none"
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                      }
                    />
                  </div>
                </div>

                {/* Suggestions */}
                {showSuggestions && playerSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full bg-gray-800 max-h-80 overflow-y-auto z-[99999] rounded-b-xl border border-white/20 mt-1 shadow-2xl">
                    {playerSuggestions.map((player) => (
                      <div
                        key={player.id}
                        onClick={() => handleSelectPlayer(player.id)}
                        className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                      >
                        <div className="relative">
                          <img
                            src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player.profile_icon_id}.jpg?image=q_auto,f_webp,w_auto&v=1696473789633`}
                            alt={player.name}
                            className="w-10 h-10 rounded-full object-cover border border-white/20"
                          />
                          {player.is_main && (
                            <div
                              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
                              title="Compte principal"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {player.name}
                          </div>
                          {player.tier ? (
                            <div className="text-xs text-white/60">
                              {player.tier} {player.rank} •{" "}
                              {player.league_points} LP
                            </div>
                          ) : (
                            <div className="text-xs text-white/60">
                              Non classé
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </section>

          {/* InfoCards Section - Ajout de la nouvelle section */}
          <section className="mb-24">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-12 text-center"
            >
              Explorez notre communauté
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Carte 1: Top 3 Joueurs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex flex-col h-full"
              >
                <div className="p-4 border-b border-white/10 flex items-center">
                  <EmojiEvents className="text-yellow-400 mr-2" />
                  <h3 className="text-lg font-semibold">Top Joueurs</h3>
                </div>
                <div className="p-4 divide-y divide-white/5 flex-1">
                  {topPlayers.length === 0 ? (
                    <div className="py-4 text-center text-white/60">
                      Chargement...
                    </div>
                  ) : (
                    topPlayers.map((player, index) => (
                      <div
                        key={player.id}
                        className="py-3 flex items-center gap-3 hover:bg-white/5 hover:translate-x-1 cursor-pointer transition-all duration-200 rounded-lg px-2"
                        onClick={() => handlePlayerClick(player.id)}
                      >
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full">
                          {index + 1}
                        </div>
                        <div className="flex-shrink-0 relative">
                          <img
                            src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player.profile_icon_id}.jpg?image=e_upscale,q_auto:good,f_webp,w_auto&v=1729058249`}
                            alt={player.summoner_name}
                            className="w-10 h-10 rounded-full border border-white/10"
                          />
                          {player.is_main && (
                            <div
                              className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border border-white/20"
                              title="Compte principal"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {player.player_name || player.summoner_name}
                          </div>
                          <div className="text-sm text-white/60">
                            {player.summoner_name}
                          </div>
                          <div
                            className={`text-sm flex items-center gap-1 ${getTierColor(
                              player.tier
                            )}`}
                          >
                            {player.tier ? (
                              <>
                                <img
                                  src={`/ranks/${player.tier.toLowerCase()}.png`}
                                  alt={player.tier}
                                  className="w-4 h-4"
                                />
                                {player.tier} {player.rank} •{" "}
                                {player.league_points} LP
                              </>
                            ) : (
                              "Non classé"
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-auto p-4 pt-3 border-t border-white/10 text-center">
                  <button
                    onClick={() => navigate("/home")}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                  >
                    Voir tout le classement →
                  </button>
                </div>
              </motion.div>

              {/* Carte 2: Derniers changements LP */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex flex-col h-full"
              >
                <div className="p-4 border-b border-white/10 flex items-center">
                  <AccessTime className="text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold">
                    Derniers changements LP
                  </h3>
                </div>
                <div className="p-4 divide-y divide-white/5 flex-1">
                  {recentLPChanges.length === 0 ? (
                    <div className="py-4 text-center text-white/60">
                      Chargement...
                    </div>
                  ) : (
                    recentLPChanges.map((change) => (
                      <div
                        key={change.id}
                        className="py-3 flex items-center gap-3 hover:bg-white/5 hover:translate-x-1 cursor-pointer transition-all duration-200 rounded-lg px-2"
                        onClick={() => handleLPChangeClick(change.player_id)}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold rounded-full ${
                            change.difference > 0
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {change.difference > 0 ? "+" : ""}
                          {change.difference}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {change.summoner_name}
                          </div>
                          <div className="text-sm text-white/60 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              {change.previous_tier && (
                                <img
                                  src={`/ranks/${change.previous_tier.toLowerCase()}.png`}
                                  alt={change.previous_tier}
                                  className="w-4 h-4"
                                />
                              )}
                              {change.previous_tier} {change.previous_rank}{" "}
                              {change.previous_lp}LP →{" "}
                              {change.tier && (
                                <img
                                  src={`/ranks/${change.tier.toLowerCase()}.png`}
                                  alt={change.tier}
                                  className="w-4 h-4"
                                />
                              )}
                              {change.tier} {change.rank} {change.current_lp}LP
                            </span>
                            <span className="text-xs ml-2 whitespace-nowrap">
                              {getTimeAgo(change.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-auto p-4 pt-3 border-t border-white/10 text-center">
                  <button
                    onClick={() => navigate("/lp-tracking")}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                  >
                    Voir tous les changements LP →
                  </button>
                </div>
              </motion.div>

              {/* Carte 3: Carrousel de joueurs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex flex-col h-full"
              >
                <div className="p-4 border-b border-white/10 flex items-center">
                  <Groups className="text-purple-400 mr-2" />
                  <h3 className="text-lg font-semibold">Liste des joueurs</h3>
                </div>
                <div className="p-4 relative flex-1">
                  {allPlayers.length === 0 ? (
                    <div className="py-4 text-center text-white/60">
                      Chargement...
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPlayerIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="divide-y divide-white/5"
                      >
                        {displayedPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="py-3 flex items-center gap-3 hover:bg-white/5 hover:translate-x-1 cursor-pointer transition-all duration-200 rounded-lg px-2"
                            onClick={() => handlePlayerClick(player.id)}
                          >
                            <div className="flex-shrink-0 relative">
                              <img
                                src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player.profile_icon_id}.jpg?image=e_upscale,q_auto:good,f_webp,w_auto&v=1729058249`}
                                alt={player.summoner_name}
                                className="w-10 h-10 rounded-full border border-white/10"
                              />
                              {player.is_main && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-[#1a1d29] rounded-full" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {player.player_name || player.summoner_name}
                              </div>
                              <div className="text-sm text-white/60">
                                {player.summoner_name}
                              </div>
                              <div
                                className={`text-sm flex items-center gap-1 ${getTierColor(
                                  player.tier
                                )}`}
                              >
                                {player.tier ? (
                                  <>
                                    <img
                                      src={`/ranks/${player.tier.toLowerCase()}.png`}
                                      alt={player.tier}
                                      className="w-4 h-4"
                                    />
                                    {player.tier} {player.rank} •{" "}
                                    {player.league_points} LP
                                  </>
                                ) : (
                                  "Non classé"
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
                <div className="mt-auto p-4 pt-3 border-t border-white/10 text-center">
                  <button
                    onClick={() => navigate("/players")}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                  >
                    Voir tous les joueurs →
                  </button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Section Joueurs en partie */}
          <section className="mb-24">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-12 text-center"
            >
              Joueurs en partie
            </motion.h2>

            {inGamePlayers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {inGamePlayers.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative h-[180px] group"
                  >
                    <div
                      className="relative bg-white/5 backdrop-blur-sm border-l-4 border-green-500/70 dark:border-green-500/50 rounded-xl shadow-lg p-5 cursor-pointer 
                      hover:shadow-xl transition-all duration-300 overflow-hidden group 
                      [&:hover_.icon-hover]:opacity-100 h-full 
                      hover:scale-[1.02] hover:-translate-y-1"
                      onClick={() => navigate(`/player/${player.id}`)}
                    >
                      <a
                        href={`https://porofessor.gg/fr/live/euw/${player.summoner_name
                          .replace(/ /g, "%20")
                          .replace(/#/g, "-")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`absolute top-3 right-3 ${
                          ((player.wins || 0) /
                            ((player.wins || 0) + (player.losses || 0))) *
                            100 <
                          50
                            ? "bg-amber-800"
                            : "bg-green-500"
                        } text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse z-50 hover:brightness-110 transition-all duration-300 backdrop-blur-sm shadow-lg`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        IN GAME
                      </a>

                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] group-hover:opacity-[0.09] transition-opacity duration-300">
                        <img
                          src={
                            player.tier
                              ? `/ranks/${player.tier.toLowerCase()}.png`
                              : "/ranks/unranked.png"
                          }
                          alt="Rank"
                          className="w-80 h-80 object-contain"
                        />
                      </div>

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex gap-5 mb-4">
                          <div className="flex-shrink-0">
                            <img
                              src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player.profile_icon_id}.jpg?image=e_upscale,q_auto:good,f_webp,w_auto&v=1729058249`}
                              alt="Profile Icon"
                              className="w-16 h-16 rounded-full border-2 border-gray-200/70 dark:border-gray-600/50 shadow-md group-hover:shadow-lg transition-all duration-300"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h2 className="text-lg font-bold mb-2 text-gray-100 flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <span className="truncate block group-hover:text-blue-400 transition-colors duration-300">
                                  {player.summoner_name}
                                </span>
                              </div>
                            </h2>
                            {player.player_name && (
                              <a
                                href={`/profile/${encodeURIComponent(
                                  player.player_name
                                )}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/profile/${encodeURIComponent(
                                      player.player_name
                                    )}`
                                  );
                                }}
                                className="inline-flex items-center gap-1 mb-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <Person className="w-4 h-4" />
                                {player.player_name}
                              </a>
                            )}
                            <div className="text-gray-300 truncate flex items-center gap-2">
                              <div className="bg-white/5 px-2 py-1 rounded-md flex items-center gap-2 min-w-0">
                                {player.tier ? (
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span>
                                      {player.tier} {player.rank}
                                    </span>
                                  </div>
                                ) : (
                                  "UNRANKED"
                                )}
                              </div>
                              <span className="flex-shrink-0 text-blue-400/90">
                                {player.league_points} LP
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
                          <div className="text-gray-300 truncate bg-white/5 px-3 py-1.5 rounded-lg font-medium">
                            W/L: {player.wins || 0}/{player.losses || 0}
                          </div>
                          <div
                            className={`truncate text-right px-3 py-1.5 rounded-lg font-medium ${
                              !player.wins && !player.losses
                                ? "text-gray-400 bg-white/5"
                                : Number(
                                    (
                                      ((player.wins || 0) /
                                        ((player.wins || 0) +
                                          (player.losses || 0))) *
                                      100
                                    ).toFixed(1)
                                  ) >= 50
                                ? "text-green-400 bg-green-900/20"
                                : "text-red-400 bg-red-900/20"
                            }`}
                          >
                            {!player.wins && !player.losses
                              ? "0%"
                              : (
                                  ((player.wins || 0) /
                                    ((player.wins || 0) +
                                      (player.losses || 0))) *
                                  100
                                ).toFixed(1) + "%"}{" "}
                            WR
                          </div>
                        </div>
                      </div>

                      <a
                        href={`https://www.leagueofgraphs.com/fr/summoner/euw/${player.summoner_name
                          .replace(/ /g, "%20")
                          .replace(/#/g, "-")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 text-sm text-blue-400 hover:text-blue-300 hover:underline z-20 group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src="https://i.imgur.com/TCDG5tK.png"
                          alt="League of Graphs"
                          className="w-6 h-6 opacity-0 icon-hover duration-300 transform group-hover:rotate-12 transition-all"
                        />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center"
              >
                <div className="text-xl text-white/70 mb-4">
                  Aucun joueur en partie actuellement
                </div>
                <p className="text-white/50">
                  Les joueurs en partie apparaîtront ici lorsqu'ils seront en
                  jeu.
                </p>
              </motion.div>
            )}
          </section>

          {/* Services Section */}
          <section className="mb-24">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-12 text-center"
            >
              Tout ce dont vous avez besoin
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 overflow-hidden group hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate("/leaderboard")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-green-500/10 transition-all duration-300"></div>

                <div className="relative z-10 cursor-pointer">
                  <Equalizer className="text-blue-400 mb-4 w-10 h-10" />
                  <h3 className="text-xl font-bold mb-2">Classement</h3>
                  <p className="text-white/70">
                    Découvrez qui sont les meilleurs joueurs et où vous vous
                    situez par rapport à eux.
                  </p>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 overflow-hidden group hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate("/lp-tracking")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-pink-500/10 group-hover:to-blue-500/10 transition-all duration-300"></div>

                <div className="relative z-10 cursor-pointer">
                  <ShowChart className="text-pink-400 mb-4 w-10 h-10" />
                  <h3 className="text-xl font-bold mb-2">Suivi LP</h3>
                  <p className="text-white/70">
                    Suivez l'évolution de vos LP et identifiez vos périodes de
                    progression.
                  </p>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 overflow-hidden group hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate("/players")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>

                <div className="relative z-10 cursor-pointer">
                  <Person className="text-purple-400 mb-4 w-10 h-10" />
                  <h3 className="text-xl font-bold mb-2">Liste des joueurs</h3>
                  <p className="text-white/70">
                    Analysez en détail vos statistiques et suivez votre
                    progression au fil du temps.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* CTA Section avec glassmorphism */}
          <section className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 md:p-12 relative overflow-hidden"
            >
              {/* Subtle accent glow */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Prêt à suivre votre progression ?
                </h2>
                <p className="text-white/70 max-w-2xl mx-auto mb-8">
                  {session
                    ? "Accédez à toutes les fonctionnalités et suivez vos statistiques en détail."
                    : "Connectez-vous pour accéder à toutes les fonctionnalités ou ajoutez simplement un joueur pour commencer à explorer ses statistiques."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {session ? (
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 flex flex-col items-center">
                      <h3 className="text-xl font-semibold mb-2">
                        Votre Compte
                      </h3>
                      <p className="text-white/70 mb-2">
                        {session.user.user_metadata?.username ||
                          session.user.email}
                      </p>
                      <div className="mt-2 flex gap-4">
                        <button
                          onClick={() => navigate("/profile")}
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg"
                        >
                          Mon Profil
                        </button>
                        <button
                          onClick={() => navigate("/lp-tracking")}
                          className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all duration-300"
                        >
                          Suivi LP
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate("/login")}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg"
                    >
                      Se connecter
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </section>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-white/10 py-8 text-center text-white/60">
          <div className="max-w-7xl mx-auto px-4">
            © {new Date().getFullYear()} LOL STATS. Tous droits réservés.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
