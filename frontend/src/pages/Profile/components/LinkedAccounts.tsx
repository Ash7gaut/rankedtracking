import { useState } from "react";
import { supabase } from "../../../utils/supabase";
import {
  Star,
  StarBorder,
  Delete,
  ExpandMore,
  ErrorOutline,
  SportsEsports,
  Refresh,
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

export interface LinkedAccount {
  id: number;
  summoner_name: string;
  profile_icon_id: number;
  tier?: string;
  rank?: string;
  league_points?: number;
  is_main: boolean;
  in_game: boolean;
  wins?: number;
  losses?: number;
}

interface LinkedAccountsProps {
  accounts: LinkedAccount[];
  username: string;
  onDelete: (summonerName: string) => void;
  onRefresh: () => void;
}

export const LinkedAccounts = ({
  accounts: initialAccounts,
  username,
  onDelete,
  onRefresh,
}: LinkedAccountsProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const accounts = [...initialAccounts].sort((a, b) => {
    if (a.is_main && !b.is_main) return -1;
    if (!a.is_main && b.is_main) return 1;
    return 0;
  });

  const handleSetMain = async (
    summonerName: string,
    currentIsMain: boolean
  ) => {
    try {
      setLoading(summonerName);
      setErrorMessage("");

      if (currentIsMain) {
        const { error } = await supabase
          .from("players")
          .update({ is_main: false })
          .eq("summoner_name", summonerName)
          .eq("player_name", username);

        if (error) throw error;
      } else {
        const { error: error1 } = await supabase
          .from("players")
          .update({ is_main: false })
          .eq("player_name", username);

        if (error1) throw error1;

        const { error: error2 } = await supabase
          .from("players")
          .update({ is_main: true })
          .eq("summoner_name", summonerName)
          .eq("player_name", username);

        if (error2) throw error2;
      }

      setOpenMenuId(null);
      onRefresh();
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMessage("Erreur lors de la mise à jour du compte principal");
    } finally {
      setLoading(null);
    }
  };

  // Fonction pour formater le nom d'invocateur pour l'URL Porofessor
  const formatSummonerNameForUrl = (name: string) => {
    // Remplacer les espaces par %20 et # par -
    return name.replace(/ /g, "%20").replace(/#/g, "-");
  };

  // Fonction pour déterminer la couleur du badge IN GAME
  const getInGameBadgeColor = (winRate: number) => {
    if (winRate < 50) return "bg-amber-800";
    return "bg-green-500";
  };

  const getTierColor = (tier?: string) => {
    if (!tier) return "text-gray-500";

    const tierLower = tier.toLowerCase();
    if (tierLower.includes("iron")) return "text-gray-500";
    if (tierLower.includes("bronze")) return "text-amber-700";
    if (tierLower.includes("silver")) return "text-gray-400";
    if (tierLower.includes("gold")) return "text-yellow-500";
    if (tierLower.includes("platinum")) return "text-teal-500";
    if (tierLower.includes("diamond")) return "text-blue-400";
    if (tierLower.includes("master")) return "text-purple-500";
    if (tierLower.includes("grandmaster")) return "text-red-500";
    if (tierLower.includes("challenger")) return "text-yellow-300";

    return "text-gray-500";
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-100/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg flex items-center gap-2">
          <ErrorOutline className="text-red-600 dark:text-red-400 w-5 h-5" />
          <p className="text-sm text-red-800 dark:text-red-300">
            {errorMessage}
          </p>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-gray-100/80 dark:bg-black/20 rounded-lg border border-gray-300 dark:border-gray-700/50">
          <SportsEsports className="w-16 h-16 text-gray-500 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vous n'avez pas encore ajouté de compte League of Legends
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {accounts.map((account) => {
            // Calcul du winrate pour chaque compte
            const totalGames = (account.wins || 0) + (account.losses || 0);
            const winRate =
              totalGames > 0 ? ((account.wins || 0) / totalGames) * 100 : 0;

            return (
              <div key={account.summoner_name} className="relative group">
                <div
                  className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm p-4 
                  transition-all border ${
                    account.is_main
                      ? "border-blue-500 dark:border-blue-500"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  } ${
                    account.in_game
                      ? "border-l-4 border-green-500/70 dark:border-green-500/50"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${account.profile_icon_id}.jpg`}
                          alt="Profile Icon"
                          className={`w-12 h-12 rounded-full border-2 ${
                            account.is_main
                              ? "border-blue-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        {account.is_main && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {/* Badge IN GAME */}
                        {account.in_game && (
                          <div className="absolute -bottom-2 -right-2">
                            <a
                              href={`https://porofessor.gg/fr/live/euw/${formatSummonerNameForUrl(
                                account.summoner_name
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${getInGameBadgeColor(
                                winRate
                              )} text-white px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse shadow-lg hover:brightness-110 transition-all duration-300 backdrop-blur-sm`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              IG
                            </a>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 dark:text-white">
                            {account.summoner_name}
                          </p>
                          {account.is_main && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                              Principal
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm font-medium ${getTierColor(
                            account.tier
                          )}`}
                        >
                          {account.tier
                            ? `${account.tier} ${account.rank} • ${account.league_points} LP`
                            : "NON CLASSÉ"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Tooltip
                        title="Supprimer ce compte"
                        arrow
                        placement="top"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(account.summoner_name);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                          <Delete className="w-5 h-5" />
                        </button>
                      </Tooltip>

                      <Tooltip
                        title={
                          account.is_main
                            ? "Retirer comme compte principal"
                            : "Définir comme compte principal"
                        }
                        arrow
                        placement="top"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetMain(
                              account.summoner_name,
                              account.is_main
                            );
                          }}
                          disabled={loading === account.summoner_name}
                          className="p-2 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                          {loading === account.summoner_name ? (
                            <CircularProgress
                              size={20}
                              thickness={5}
                              className="text-blue-500"
                            />
                          ) : account.is_main ? (
                            <Star className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <StarBorder className="w-5 h-5" />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
