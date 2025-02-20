import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { supabase } from "../../utils/supabase";
import { Player } from "../../types/interfaces";
import {
  ArrowBack,
  Star,
  EmojiEvents,
  Timeline,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";

const PlayerProfile = () => {
  const { playerName } = useParams<{ playerName: string }>();
  const navigate = useNavigate();
  const decodedPlayerName = decodeURIComponent(playerName || "");

  const { data: accounts, isLoading } = useQuery<Player[]>(
    ["playerAccounts", decodedPlayerName],
    async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("player_name", decodedPlayerName)
        .order("is_main", { ascending: false });

      if (error) throw error;
      return data || [];
    }
  );

  const { data: userData } = useQuery(
    ["userBackground", decodedPlayerName],
    async () => {
      const { data, error } = await supabase
        .from("usernames")
        .select("background_url")
        .eq("username", decodedPlayerName)
        .single();

      if (error) throw error;
      return data;
    },
    {
      enabled: !!decodedPlayerName,
    }
  );

  // Calculer les statistiques globales
  const stats = accounts?.reduce(
    (acc, account) => {
      const totalGames = (account.wins || 0) + (account.losses || 0);
      acc.totalGames += totalGames;
      acc.totalWins += account.wins || 0;
      acc.totalLosses += account.losses || 0;

      // Trouver le rang le plus élevé
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
      if (
        !acc.highestRank ||
        tierOrder.indexOf(account.tier || "") >
          tierOrder.indexOf(acc.highestRank.tier || "")
      ) {
        acc.highestRank = {
          tier: account.tier || null,
          rank: account.rank || null,
          lp: account.league_points || null,
        };
      }
      return acc;
    },
    {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      highestRank: null as {
        tier: string | null;
        rank: string | null;
        lp: number | null;
      } | null,
    }
  );

  const winRate = stats
    ? stats.totalGames > 0
      ? ((stats.totalWins / stats.totalGames) * 100).toFixed(1)
      : null
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate("/")}
            className="mb-8 px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700"
          >
            <ArrowBack className="w-4 h-4" />
            Retour
          </button>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Joueur non trouvé
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Aucun compte n'a été trouvé pour {decodedPlayerName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const mainAccount =
    accounts.find((account) => account.is_main) || accounts[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="mb-8 px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700"
        >
          <ArrowBack className="w-4 h-4" />
          Retour
        </button>

        <div className="grid gap-6">
          {/* En-tête du profil avec bannière */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <div className="relative h-32 md:h-40">
              {userData?.background_url ? (
                <>
                  <img
                    src={userData.background_url}
                    alt="Profile Background"
                    className="absolute inset-0 w-full h-full object-cover transform scale-110 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40"></div>
                </>
              ) : (
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
              )}
            </div>
            <div className="relative px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20">
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-white dark:bg-gray-700">
                    <img
                      src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${mainAccount.profile_icon_id}.jpg`}
                      alt="Profile Icon"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {mainAccount.is_main && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1.5 shadow-lg">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {decodedPlayerName}
                  </h1>
                  {stats?.highestRank && (
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2">
                        <EmojiEvents className="w-5 h-5 text-yellow-500" />
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          Rang:
                        </span>
                      </div>
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium">
                        {stats.highestRank.tier
                          ? `${stats.highestRank.tier} ${stats.highestRank.rank}`
                          : "Non classé"}
                      </span>
                      {stats.highestRank.tier && (
                        <span className="bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium">
                          {stats.highestRank.lp} LP
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Timeline className="w-6 h-6 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total des parties
                </h2>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalGames || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                sur {accounts.length} compte{accounts.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Victoires
                </h2>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats?.totalWins || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {winRate ? `${winRate}% de winrate` : "Aucune partie jouée"}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown className="w-6 h-6 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Défaites
                </h2>
              </div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats?.totalLosses || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                sur la saison
              </p>
            </div>
          </div>

          {/* Liste des comptes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-500" />
              Comptes liés
            </h2>
            <div className="grid gap-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => navigate(`/player/${account.id}`)}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${account.profile_icon_id}.jpg`}
                        alt="Profile Icon"
                        className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-600 shadow-md"
                      />
                      {account.is_main && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-lg">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {account.in_game && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full px-2 py-0.5 text-xs text-white font-medium shadow-lg">
                          IN GAME
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {account.summoner_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium text-sm">
                            {account.tier
                              ? `${account.tier} ${account.rank}`
                              : "Non classé"}
                          </span>
                          {account.tier && (
                            <span className="bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm">
                              {account.league_points} LP
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {account.wins || 0}W {account.losses || 0}L
                        </div>
                        {account.wins !== undefined &&
                          account.losses !== undefined &&
                          (account.wins + account.losses > 0 ? (
                            <div
                              className={`text-sm font-medium ${
                                (account.wins /
                                  (account.wins + account.losses)) *
                                  100 >=
                                50
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {(
                                (account.wins /
                                  (account.wins + account.losses)) *
                                100
                              ).toFixed(1)}
                              % WR
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Aucune partie
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
