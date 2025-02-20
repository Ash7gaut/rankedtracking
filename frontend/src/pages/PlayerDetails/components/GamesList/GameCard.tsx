import React, { useState } from "react";
import { Game } from "frontend/src/types/interfaces";
import {
  AccessTime,
  Visibility,
  LocalFireDepartment,
  Timeline,
  BarChart,
  People,
} from "@mui/icons-material";

interface GameCardProps {
  game: Game;
  championName: string;
  playerName: string;
  tier?: string | null;
  rank?: string | null;
}

export const GameCard = ({
  game,
  championName,
  playerName,
  tier,
  rank,
}: GameCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatGameDuration = (duration: number): string => {
    if (!duration && duration !== 0) return "0:00";
    const minutes = Math.floor(duration / 60);
    const remainingSeconds = duration % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
  };

  const formatKDA = (kills: number, deaths: number, assists: number) => {
    return `${kills}/${deaths}/${assists}`;
  };

  const formatDamage = (damage: number) => {
    return `${(damage / 1000).toFixed(1)}k`;
  };

  // Calculer le meilleur score de dégâts de l'équipe
  const calculateMaxTeamDamage = () => {
    const alliesDamages =
      game.allies?.map((ally) => ally.totalDamageDealtToChampions) || [];
    return Math.max(game.totalDamageDealtToChampions, ...alliesDamages);
  };

  // Calculer le meilleur score de dégâts des ennemis
  const calculateMaxEnemyDamage = () => {
    return Math.max(
      ...(game.enemies?.map((enemy) => enemy.totalDamageDealtToChampions) || [
        0,
      ])
    );
  };

  // Calculer la participation aux kills
  const calculateKillParticipation = () => {
    const teamKills =
      game.allies?.reduce((sum, ally) => sum + ally.kills, game.kills) ||
      game.kills;
    return teamKills === 0
      ? 0
      : ((game.kills + game.assists) / teamKills) * 100;
  };

  const maxTeamDamage = calculateMaxTeamDamage();
  const maxEnemyDamage = calculateMaxEnemyDamage();
  const killParticipation = calculateKillParticipation();

  const mainPlayer = {
    championId: game.championId,
    championName: championName,
    summonerName: playerName,
    kills: game.kills,
    deaths: game.deaths,
    assists: game.assists,
    totalDamageDealtToChampions: game.totalDamageDealtToChampions,
    cs: game.cs,
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex ${
        game.win ? "border-l-4 border-green-500" : "border-l-4 border-red-500"
      }`}
    >
      <div
        className="flex-1 p-4 sm:p-6 cursor-pointer relative space-y-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* En-tête avec champion et résultat */}
        <div className="flex items-start justify-between relative">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${game.championId}.png`}
                alt={championName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  game.win ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {game.win ? "V" : "D"}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                {championName}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                <div className="flex items-center gap-1">
                  <AccessTime className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{formatGameDuration(game.gameDuration)}</span>
                </div>
                <span>•</span>
                <span>{formatTimeAgo(game.gameCreation)}</span>
                {tier && rank && (
                  <>
                    <span>•</span>
                    <span className="font-medium flex items-center gap-1">
                      <img
                        src={`/ranks/${tier.toLowerCase()}.png`}
                        alt={tier}
                        className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                      />
                      {tier} {rank}
                    </span>
                    {game.lpChange !== undefined && (
                      <>
                        <span>•</span>
                        <span
                          className={`font-medium ${
                            game.lpChange > 0
                              ? "text-green-500 dark:text-green-400"
                              : "text-red-500 dark:text-red-400"
                          }`}
                        >
                          {game.lpChange > 0 ? "+" : ""}
                          {game.lpChange} LP
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* KDA */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              <Timeline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              KDA
            </div>
            <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
              {formatKDA(game.kills, game.deaths, game.assists)}
            </div>
          </div>

          {/* CS */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              <LocalFireDepartment className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              CS
            </div>
            <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
              {game.cs} ({(game.cs / (game.gameDuration / 60)).toFixed(1)})
            </div>
          </div>

          {/* Dégâts */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              <BarChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Dégâts
            </div>
            <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
              {formatDamage(game.totalDamageDealtToChampions)}
              <div className="w-full h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1.5">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${
                      (game.totalDamageDealtToChampions / maxTeamDamage) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Kill Participation */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              <People className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Kill Part.
            </div>
            <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
              {killParticipation.toFixed(0)}%
              <div className="w-full h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1.5">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${killParticipation}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu des champions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 sm:gap-8">
          {/* Équipe alliée */}
          <div className="flex justify-center gap-2 sm:gap-3">
            <div className="group relative">
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${game.championId}.png`}
                alt={championName}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 relative z-10 object-cover"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-900 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                {championName} ({playerName})
              </div>
            </div>
            {game.allies?.map((ally) => (
              <div key={ally.summonerName} className="group relative">
                <img
                  src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ally.championId}.png`}
                  alt={ally.championName}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 relative object-cover"
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-900 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                  {ally.championName} ({ally.summonerName})
                </div>
              </div>
            ))}
          </div>
          {/* Équipe ennemie */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {game.enemies?.map((enemy) => (
              <div key={enemy.summonerName} className="group relative">
                <img
                  src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${enemy.championId}.png`}
                  alt={enemy.championName}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-red-500 relative object-cover"
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-900 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                  {enemy.championName} ({enemy.summonerName})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section détaillée (dépliable) */}
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            isExpanded ? "max-h-[1000px]" : "max-h-0"
          }`}
        >
          <div className="mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Alliés
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${mainPlayer.championId}.png`}
                      alt={mainPlayer.championName}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-semibold truncate">
                        {mainPlayer.summonerName}
                      </span>
                      <div className="mt-1 grid grid-cols-3 gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Timeline className="w-3.5 h-3.5" />
                          {formatKDA(
                            mainPlayer.kills,
                            mainPlayer.deaths,
                            mainPlayer.assists
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <LocalFireDepartment className="w-3.5 h-3.5" />
                          {mainPlayer.cs} CS
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart className="w-3.5 h-3.5" />
                          {formatDamage(mainPlayer.totalDamageDealtToChampions)}
                        </div>
                      </div>
                      <div className="mt-1.5 w-full h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              (mainPlayer.totalDamageDealtToChampions /
                                maxTeamDamage) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alliés */}
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {game.allies?.map((ally) => (
                      <div
                        key={ally.summonerName}
                        className="flex items-center gap-4"
                      >
                        <img
                          src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ally.championId}.png`}
                          alt={ally.championName}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-semibold truncate">
                            {ally.summonerName}
                          </span>
                          <div className="mt-1 grid grid-cols-3 gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Timeline className="w-3.5 h-3.5" />
                              {formatKDA(ally.kills, ally.deaths, ally.assists)}
                            </div>
                            <div className="flex items-center gap-1">
                              <LocalFireDepartment className="w-3.5 h-3.5" />
                              {ally.cs} CS
                            </div>
                            <div className="flex items-center gap-1">
                              <BarChart className="w-3.5 h-3.5" />
                              {formatDamage(ally.totalDamageDealtToChampions)}
                            </div>
                          </div>
                          <div className="mt-1.5 w-full h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${
                                  (ally.totalDamageDealtToChampions /
                                    maxTeamDamage) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Adversaires
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    {game.enemies?.map((enemy) => (
                      <div
                        key={enemy.summonerName}
                        className="flex items-center gap-4"
                      >
                        <img
                          src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${enemy.championId}.png`}
                          alt={enemy.championName}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-semibold truncate">
                            {enemy.summonerName}
                          </span>
                          <div className="mt-1 grid grid-cols-3 gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Timeline className="w-3.5 h-3.5" />
                              {formatKDA(
                                enemy.kills,
                                enemy.deaths,
                                enemy.assists
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <LocalFireDepartment className="w-3.5 h-3.5" />
                              {enemy.cs} CS
                            </div>
                            <div className="flex items-center gap-1">
                              <BarChart className="w-3.5 h-3.5" />
                              {formatDamage(enemy.totalDamageDealtToChampions)}
                            </div>
                          </div>
                          <div className="mt-1.5 w-full h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{
                                width: `${
                                  (enemy.totalDamageDealtToChampions /
                                    maxEnemyDamage) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-10 bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <svg
          className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};
