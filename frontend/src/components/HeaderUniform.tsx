import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { Session } from "@supabase/supabase-js";
import { AccountMenu } from "./AccountMenu";
import {
  Search,
  Home as HomeIcon,
  ArrowBack,
  KeyboardArrowDown,
  BarChart as LeaderboardIcon,
  Person,
  ShowChart as SuiviLPIcon,
} from "@mui/icons-material";

interface HeaderUniformProps {
  title: string;
  showHomeButton?: boolean;
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

export const HeaderUniform = ({
  title,
  showHomeButton = false,
}: HeaderUniformProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
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

        setSuggestions(
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
        console.error("Error searching players:", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPlayer = (playerId: string, playerName: string) => {
    navigate(`/player/${playerId}`);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
        {/* Première rangée: Navigation et utilisateur */}
        <div className="flex flex-wrap items-center justify-between mb-4">
          {/* Zone gauche: Home + Retour + Titre */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/15 rounded-lg transition-all"
            >
              <HomeIcon className="text-white" />
            </Link>

            {showHomeButton && (
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 px-4 h-12 bg-white/10 hover:bg-white/15 rounded-lg transition-all"
              >
                <ArrowBack className="text-white" />
                <span className="text-white">Retour</span>
              </button>
            )}

            <h1 className="text-2xl font-bold text-white ml-2">{title}</h1>
          </div>

          {/* Zone droite: Menu utilisateur */}
          <div className="flex items-center">
            <AccountMenu session={session} />
          </div>
        </div>

        {/* Deuxième rangée: Onglets de navigation */}
        <div className="flex border-b border-white/10 mb-4">
          <Link
            to="/home"
            className={`flex items-center gap-2 px-6 py-3 ${
              isActive("/home") || isActive("/leaderboard")
                ? "border-b-2 border-white text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            <LeaderboardIcon className="w-5 h-5" />
            <span>Classement</span>
          </Link>

          <Link
            to="/players"
            className={`flex items-center gap-2 px-6 py-3 ${
              isActive("/players")
                ? "border-b-2 border-white text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Person className="w-5 h-5" />
            <span>Joueurs</span>
          </Link>

          <Link
            to="/lp-tracking"
            className={`flex items-center gap-2 px-6 py-3 ${
              isActive("/lp-tracking")
                ? "border-b-2 border-white text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            <SuiviLPIcon className="w-5 h-5" />
            <span>Suivi LP</span>
          </Link>
        </div>

        {/* Troisième rangée: Barre de recherche */}
        <div className="relative">
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher un joueur..."
              className="w-full px-10 py-3 bg-white/5 focus:bg-white/10 text-white border border-white/10 focus:border-white/20 rounded-lg outline-none transition-all"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <Search className="absolute left-3 text-white/60" />
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-2 w-full bg-gray-800/95 backdrop-blur-md border border-white/10 rounded-lg shadow-lg max-h-72 overflow-y-auto">
              {suggestions.map((player) => (
                <div
                  key={player.id}
                  className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors flex items-center gap-3"
                  onClick={() => handleSelectPlayer(player.id, player.name)}
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
                    <div className="font-medium text-white">{player.name}</div>
                    {player.tier ? (
                      <div className="text-xs text-white/60">
                        {player.tier} {player.rank} • {player.league_points} LP
                      </div>
                    ) : (
                      <div className="text-xs text-white/60">Non classé</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
