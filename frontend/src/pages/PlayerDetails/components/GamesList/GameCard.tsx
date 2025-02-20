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
        className="flex-1 p-3 sm:p-4 cursor-pointer relative"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* En-tête avec champion et résultat */}
        <div className="flex items-center justify-between mb-4 relative">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${game.championId}.png`}
                alt={championName}
                className="w-14 h-14 rounded-lg"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  game.win ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {game.win ? "V" : "D"}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {championName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <AccessTime className="w-4 h-4" />
                <span>{formatGameDuration(game.gameDuration)}</span>
                <span>•</span>
                <span>{formatTimeAgo(game.gameCreation)}</span>
                {tier && rank && (
                  <>
                    <span>•</span>
                    <span className="font-medium flex items-center gap-1">
                      <img
                        src={`/ranks/${tier.toLowerCase()}.png`}
                        alt={tier}
                        className="w-4 h-4"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Timeline className="w-4 h-4" />
              KDA
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatKDA(game.kills, game.deaths, game.assists)}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <LocalFireDepartment className="w-4 h-4" />
              CS
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {game.cs} ({(game.cs / (game.gameDuration / 60)).toFixed(1)}/min)
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <BarChart className="w-4 h-4" />
              Dégâts
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatDamage(game.totalDamageDealtToChampions)}
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
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

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <People className="w-4 h-4" />
              Kill Part.
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {killParticipation.toFixed(0)}%
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${killParticipation}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu des champions */}
        <div className="flex gap-2 mb-4">
          <div className="flex -space-x-2">
            <div className="group relative">
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${game.championId}.png`}
                alt={championName}
                className="w-8 h-8 rounded-full border-2 border-blue-500 relative z-10"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                {championName} ({playerName})
              </div>
            </div>
            {game.allies?.map((ally) => (
              <div key={ally.summonerName} className="group relative">
                <img
                  src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ally.championId}.png`}
                  alt={ally.championName}
                  className="w-8 h-8 rounded-full border-2 border-blue-500 relative"
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                  {ally.championName} ({ally.summonerName})
                </div>
              </div>
            ))}
          </div>
          <div className="flex -space-x-2 ml-4">
            {game.enemies?.map((enemy) => (
              <div key={enemy.summonerName} className="group relative">
                <img
                  src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${enemy.championId}.png`}
                  alt={enemy.championName}
                  className="w-8 h-8 rounded-full border-2 border-red-500 relative"
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
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
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Alliés
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${mainPlayer.championId}.png`}
                      alt={mainPlayer.championName}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold truncate">
                          {mainPlayer.summonerName}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {formatKDA(
                            mainPlayer.kills,
                            mainPlayer.deaths,
                            mainPlayer.assists
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="truncate">
                          {mainPlayer.cs} CS •{" "}
                          {formatDamage(mainPlayer.totalDamageDealtToChampions)}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
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
                  {game.allies?.map((ally) => (
                    <div
                      key={ally.summonerName}
                      className="flex items-center gap-2"
                    >
                      <img
                        src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ally.championId}.png`}
                        alt={ally.championName}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {ally.summonerName}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                            {formatKDA(ally.kills, ally.deaths, ally.assists)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="truncate">
                            {ally.championName} • {ally.cs} CS •{" "}
                            {formatDamage(ally.totalDamageDealtToChampions)}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
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

              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Adversaires
                </h4>
                <div className="space-y-1.5">
                  {game.enemies?.map((enemy) => (
                    <div
                      key={enemy.summonerName}
                      className="flex items-center gap-2"
                    >
                      <img
                        src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${enemy.championId}.png`}
                        alt={enemy.championName}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {enemy.summonerName}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                            {formatKDA(
                              enemy.kills,
                              enemy.deaths,
                              enemy.assists
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="truncate">
                            {enemy.championName} • {enemy.cs} CS •{" "}
                            {formatDamage(enemy.totalDamageDealtToChampions)}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
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
