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
  SportsEsports,
  Person,
} from "@mui/icons-material";
import { PageTransition } from "../../components/PageTransition";

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
        .select("background_url, role")
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "TOP":
        return "/roles/Role=Top.png";
      case "JUNGLE":
        return "/roles/Role=Jungle.png";
      case "MID":
        return "/roles/Role=Mid.png";
      case "ADC":
        return "/roles/Role=Bot.png";
      case "SUPPORT":
        return "/roles/Role=Support.png";
      default:
        return "/roles/Role=Mid.png";
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </PageTransition>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <button
              onClick={() => navigate("/")}
              className="mb-8 px-4 py-2 text-sm bg-gray-200/80 dark:bg-white/10 backdrop-blur-sm text-gray-800 dark:text-white rounded-lg hover:bg-gray-300/80 dark:hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <ArrowBack className="w-4 h-4" />
              Retour
            </button>
            <div className="bg-white/80 dark:bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-white/10 dark:border-gray-700/30 p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Joueur non trouvé
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Aucun compte n'a été trouvé pour {decodedPlayerName}
              </p>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const mainAccount =
    accounts.find((account) => account.is_main) || accounts[0];

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        {/* Fond avec overlay */}
        {userData?.background_url && (
          <div className="fixed inset-0 -z-10">
            <img
              src={userData.background_url}
              alt="Background"
              className="w-full h-full object-cover transition-all duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-blue-900/40 to-purple-900/40 backdrop-blur-[2px] transition-all duration-500 ease-in-out" />
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate("/")}
            className="mb-8 px-4 py-2 text-sm bg-gray-200/80 dark:bg-white/10 backdrop-blur-sm text-gray-800 dark:text-white rounded-lg hover:bg-gray-300/80 dark:hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <ArrowBack className="w-4 h-4" />
            Retour
          </button>

          <div className="grid gap-6">
            {/* En-tête du profil avec bannière */}
            <div className="bg-white/80 dark:bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-white/10 dark:border-gray-700/30 overflow-hidden">
              <div className="relative h-32 md:h-40">
                {userData?.background_url ? (
                  <>
                    <img
                      src={userData.background_url}
                      alt="Profile Background"
                      className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-blue-900/40 to-purple-900/40 backdrop-blur-[2px] transition-all duration-500 ease-in-out"></div>
                  </>
                ) : (
                  <div className="h-full bg-gradient-to-r from-blue-600/30 to-purple-600/30"></div>
                )}
              </div>
              <div className="relative px-8 pb-8">
                <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20">
                  <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-white/10 dark:border-gray-800/50 shadow-lg bg-gradient-to-br from-blue-500 to-purple-500">
                      <img
                        src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${mainAccount.profile_icon_id}.jpg`}
                        alt="Profile Icon"
                        className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                      />
                    </div>
                    {mainAccount.is_main && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1.5 shadow-lg">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {userData?.role && (
                      <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg">
                        <img
                          src={getRoleIcon(userData.role)}
                          alt={userData.role}
                          className="w-6 h-6"
                          title={userData.role}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                      {decodedPlayerName}
                    </h1>
                    {stats?.highestRank && (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2">
                          <EmojiEvents className="w-5 h-5 text-yellow-400" />
                          <span className="text-lg font-semibold text-gray-600 dark:text-gray-200">
                            Rang:
                          </span>
                        </div>
                        <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium">
                          {stats.highestRank.tier
                            ? `${stats.highestRank.tier} ${stats.highestRank.rank}`
                            : "Non classé"}
                        </span>
                        {stats.highestRank.tier && (
                          <span className="bg-gray-200/80 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium">
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
              <div className="bg-white/80 dark:bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-white/10 dark:border-gray-700/30 p-6 transition-all duration-300 hover:bg-white/90 dark:hover:bg-white/20 dark:hover:bg-gray-700/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Timeline className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Total des parties
                  </h2>
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {stats?.totalGames || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  sur {accounts.length} compte{accounts.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-white/10 dark:border-gray-700/30 p-6 transition-all duration-300 hover:bg-white/90 dark:hover:bg-white/20 dark:hover:bg-gray-700/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Victoires
                  </h2>
                </div>
                <p className="text-3xl font-bold text-green-400">
                  {stats?.totalWins || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {winRate ? `${winRate}% de winrate` : "Aucune partie jouée"}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-white/10 dark:border-gray-700/30 p-6 transition-all duration-300 hover:bg-white/90 dark:hover:bg-white/20 dark:hover:bg-gray-700/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Défaites
                  </h2>
                </div>
                <p className="text-3xl font-bold text-red-400">
                  {stats?.totalLosses || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  sur la saison
                </p>
              </div>
            </div>

            {/* Liste des comptes */}
            <div className="bg-white/80 dark:bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-white/10 dark:border-gray-700/30 p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <SportsEsports className="w-6 h-6 text-blue-400" />
                Comptes liés
              </h2>
              <div className="grid gap-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => navigate(`/player/${account.id}`)}
                    className="bg-gray-100/80 dark:bg-black/20 hover:bg-gray-200/80 dark:hover:bg-black/30 rounded-xl p-6 cursor-pointer transition-all border border-gray-300 dark:border-white/5 dark:border-gray-700/30 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 dark:border-gray-800/50 shadow-md bg-gradient-to-br from-blue-500 to-purple-500">
                          <img
                            src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${account.profile_icon_id}.jpg`}
                            alt="Profile Icon"
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                          />
                        </div>
                        {account.is_main && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-lg">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {account.in_game && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full px-2 py-0.5 text-xs text-white font-medium shadow-lg transition-transform duration-300 group-hover:scale-110">
                            IN GAME
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-400 transition-colors">
                            {account.summoner_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {account.tier ? (
                              <>
                                <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-2">
                                  <img
                                    src={`/ranks/${account.tier.toLowerCase()}.png`}
                                    alt={account.tier}
                                    className="w-4 h-4"
                                  />
                                  {account.tier} {account.rank}
                                </span>
                                <span className="bg-gray-200/80 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm">
                                  {account.league_points} LP
                                </span>
                              </>
                            ) : (
                              <span className="bg-gray-200/80 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm">
                                Non classé
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
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
                                    ? "text-green-400"
                                    : "text-red-400"
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
                              <div className="text-sm text-gray-400">
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
    </PageTransition>
  );
};

export default PlayerProfile;
