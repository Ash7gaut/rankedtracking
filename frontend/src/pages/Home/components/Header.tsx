import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import { Session } from "@supabase/supabase-js";
import { AccountMenu } from "../../../components/AccountMenu";
import { Search, Star } from "@mui/icons-material";

interface HeaderProps {
  title: string;
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

export const Header = ({ title }: HeaderProps) => {
  const navigate = useNavigate();
  const [session, setSession] = React.useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 1) {
      const { data } = await supabase
        .from("players")
        .select("*")
        .ilike("player_name", `%${query}%`)
        .limit(10);

      // Map pour stocker le meilleur compte de chaque joueur
      const bestAccounts = new Map();

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

      data?.forEach((player) => {
        const currentBest = bestAccounts.get(player.player_name);

        // Si c'est un compte principal, on le prend automatiquement
        if (player.is_main) {
          bestAccounts.set(player.player_name, {
            id: player.id,
            name: player.player_name,
            profile_icon_id: player.profile_icon_id,
            tier: player.tier,
            rank: player.rank,
            league_points: player.league_points,
            is_main: player.is_main,
          });
          return;
        }

        // Si on n'a pas encore de compte pour ce joueur
        if (!currentBest) {
          bestAccounts.set(player.player_name, {
            id: player.id,
            name: player.player_name,
            profile_icon_id: player.profile_icon_id,
            tier: player.tier,
            rank: player.rank,
            league_points: player.league_points,
            is_main: player.is_main,
          });
          return;
        }

        // Si le compte actuel a un meilleur rang
        if (
          player.tier &&
          (!currentBest.tier ||
            tierOrder[player.tier] > tierOrder[currentBest.tier] ||
            (player.tier === currentBest.tier &&
              player.league_points > currentBest.league_points))
        ) {
          bestAccounts.set(player.player_name, {
            id: player.id,
            name: player.player_name,
            profile_icon_id: player.profile_icon_id,
            tier: player.tier,
            rank: player.rank,
            league_points: player.league_points,
            is_main: player.is_main,
          });
        }
      });

      const uniqueSuggestions = Array.from(bestAccounts.values());
      setSuggestions(uniqueSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPlayer = (playerName: string) => {
    navigate(`/profile/${encodeURIComponent(playerName)}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>

          <div className="relative flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher un joueur..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg divide-y divide-gray-100 dark:divide-gray-700">
                {suggestions.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectPlayer(player.name)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player.profile_icon_id}.jpg?image=e_upscale,q_auto:good,f_webp,w_auto&v=1729058249`}
                        alt="Profile Icon"
                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {player.name}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <img
                          src={`/ranks/${(
                            player.tier || "unranked"
                          ).toLowerCase()}.png`}
                          alt={player.tier || "UNRANKED"}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-600 dark:text-gray-300">
                          {player.tier
                            ? `${player.tier} ${player.rank} • ${player.league_points} LP`
                            : "UNRANKED"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <AccountMenu session={session} />
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
