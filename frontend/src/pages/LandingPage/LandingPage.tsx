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
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [recentLPChanges, setRecentLPChanges] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselInterval = useRef<NodeJS.Timeout | null>(null);

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
        const { data, error } = await supabase
          .from("players")
          .select(
            "id, summoner_name, player_name, profile_icon_id, tier, rank, league_points, wins, losses, is_main"
          )
          .order("league_points", { ascending: false })
          .limit(3);

        if (error) throw error;
        setTopPlayers(data || []);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des meilleurs joueurs:",
          error
        );
      }
    };

    const fetchRecentLPChanges = async () => {
      try {
        const { data, error } = await supabase
          .from("lp_history")
          .select(
            "id, player_id, summoner_name, previous_lp, current_lp, difference, timestamp, tier, rank"
          )
          .order("timestamp", { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentLPChanges(data || []);
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
            "id, summoner_name, player_name, profile_icon_id, tier, rank, is_main"
          )
          .limit(12);

        if (error) throw error;
        setAllPlayers(data || []);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de tous les joueurs:",
          error
        );
      }
    };

    fetchTopPlayers();
    fetchRecentLPChanges();
    fetchAllPlayers();
  }, []);

  // Autoplay pour le carrousel
  useEffect(() => {
    if (allPlayers.length > 3) {
      carouselInterval.current = setInterval(() => {
        setCarouselIndex(
          (prevIndex) =>
            (prevIndex + 3) % (Math.ceil(allPlayers.length / 3) * 3)
        );
      }, 5000);
    }

    return () => {
      if (carouselInterval.current) {
        clearInterval(carouselInterval.current);
      }
    };
  }, [allPlayers.length]);

  const handleNextCarousel = () => {
    setCarouselIndex(
      (prevIndex) => (prevIndex + 3) % (Math.ceil(allPlayers.length / 3) * 3)
    );
  };

  const handlePrevCarousel = () => {
    setCarouselIndex(
      (prevIndex) =>
        (prevIndex - 3 + Math.ceil(allPlayers.length / 3) * 3) %
        (Math.ceil(allPlayers.length / 3) * 3)
    );
  };

  const getCarouselItems = () => {
    return allPlayers.slice(carouselIndex, carouselIndex + 3);
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

  const handleSearch = async (query: string) => {
    if (query.length >= 3) {
      try {
        // Récupérer les joueurs qui correspondent à la recherche
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .ilike("summoner_name", `%${query}%`)
          .order("league_points", { ascending: false });

        if (error) throw error;

        // Organiser les résultats pour privilégier les comptes principaux
        // et les meilleurs comptes par joueur
        const bestAccounts = new Map<string, PlayerSuggestion>();

        data?.forEach((player) => {
          // Si c'est un compte principal, il a priorité
          if (player.is_main) {
            bestAccounts.set(player.summoner_name, {
              id: player.id,
              name: player.summoner_name,
              profile_icon_id: player.profile_icon_id,
              tier: player.tier,
              rank: player.rank,
              league_points: player.league_points,
              is_main: player.is_main,
            });
          } else if (!bestAccounts.has(player.summoner_name)) {
            // Si ce joueur n'est pas déjà dans la liste
            bestAccounts.set(player.summoner_name, {
              id: player.id,
              name: player.summoner_name,
              profile_icon_id: player.profile_icon_id,
              tier: player.tier,
              rank: player.rank,
              league_points: player.league_points,
              is_main: player.is_main,
            });
          }
        });

        const uniqueSuggestions = Array.from(bestAccounts.values());
        setPlayerSuggestions(uniqueSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        setPlayerSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setPlayerSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPlayer = (playerName: string) => {
    navigate(`/profile/${encodeURIComponent(playerName)}`);
    setSearchQuery("");
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
                Profils
              </button>
              <button
                onClick={() => navigate("/lp-tracking")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Suivi LP
              </button>
              <button
                onClick={() => navigate("/add")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Ajouter un joueur
              </button>

              {/* Only show logout if user is logged in */}
              {session ? (
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Déconnexion
                </button>
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
                    Profils
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
                  <button
                    onClick={() => {
                      navigate("/add");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    Ajouter un joueur
                  </button>

                  {session ? (
                    <button
                      onClick={() => {
                        supabase.auth.signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-purple-300 hover:bg-white/10 transition-colors"
                    >
                      Déconnexion
                    </button>
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
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-xl"
              >
                <div className="flex items-center p-1">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch(e.target.value);
                      }}
                      placeholder="Rechercher un joueur..."
                      className="w-full pl-12 pr-4 py-3 bg-transparent text-white/90 placeholder-white/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Suggestions */}
                {showSuggestions && playerSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 bg-gray-800/90 backdrop-blur-md max-h-80 overflow-y-auto z-50 rounded-b-xl border-t border-white/10">
                    {playerSuggestions.map((player) => (
                      <div
                        key={player.id}
                        onClick={() => handleSelectPlayer(player.name)}
                        className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.5.1/img/profileicon/${player.profile_icon_id}.png`}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">
                            {player.name}
                          </div>
                          <div className="text-sm text-white/60">
                            {player.tier && player.rank
                              ? `${player.tier} ${player.rank} ${player.league_points} LP`
                              : "Classé non disponible"}
                          </div>
                        </div>
                        {player.is_main && (
                          <span className="px-2 py-1 text-xs bg-blue-900/60 text-blue-200 rounded-md">
                            Principal
                          </span>
                        )}
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
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/10 flex items-center">
                  <EmojiEvents className="text-yellow-400 mr-2" />
                  <h3 className="text-lg font-semibold">Top Joueurs</h3>
                </div>
                <div className="p-4 divide-y divide-white/5">
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
                            src={`https://ddragon.leagueoflegends.com/cdn/14.5.1/img/profileicon/${player.profile_icon_id}.png`}
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
                <div className="mt-4 pt-3 border-t border-white/10 text-center">
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
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/10 flex items-center">
                  <AccessTime className="text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold">
                    Derniers changements LP
                  </h3>
                </div>
                <div className="p-4 divide-y divide-white/5">
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
                            <span>
                              {change.previous_lp} → {change.current_lp} LP
                            </span>
                            <span className="text-xs">
                              {getTimeAgo(change.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-center">
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
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/10 flex items-center">
                  <Groups className="text-purple-400 mr-2" />
                  <h3 className="text-lg font-semibold">Liste des joueurs</h3>
                </div>
                <div className="p-4 relative min-h-[260px]">
                  {allPlayers.length === 0 ? (
                    <div className="py-4 text-center text-white/60">
                      Chargement...
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between mb-2">
                        <button
                          onClick={handlePrevCarousel}
                          className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          <ArrowBackIos className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNextCarousel}
                          className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          <ArrowForwardIos className="w-4 h-4" />
                        </button>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={carouselIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="divide-y divide-white/5"
                        >
                          {getCarouselItems().map((player) => (
                            <div
                              key={player.id}
                              className="py-3 flex items-center gap-3 hover:bg-white/5 hover:translate-x-1 cursor-pointer transition-all duration-200 rounded-lg px-2"
                              onClick={() => handlePlayerClick(player.id)}
                            >
                              <div className="flex-shrink-0 relative">
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/14.5.1/img/profileicon/${player.profile_icon_id}.png`}
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
                                      {player.tier} {player.rank}
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
                    </>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-center">
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
                  <h3 className="text-xl font-bold mb-2">Profils Détaillés</h3>
                  <p className="text-white/70">
                    Analysez en détail vos statistiques et suivez votre
                    progression au fil du temps.
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
                  Connectez-vous pour accéder à toutes les fonctionnalités ou
                  ajoutez simplement un joueur pour commencer à explorer ses
                  statistiques.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => navigate("/add-player")}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all duration-300"
                  >
                    Ajouter un joueur
                  </button>
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
