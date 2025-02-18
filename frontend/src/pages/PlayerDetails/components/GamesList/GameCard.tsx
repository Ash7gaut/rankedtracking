import React, { useState } from "react";
import { Game } from "frontend/src/types/interfaces";

interface GameCardProps {
  game: Game;
  championName: string;
  playerName: string;
}

export const GameCard = ({ game, championName, playerName }: GameCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatGameDuration = (seconds: number) => {
    if (!seconds && seconds !== 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
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
    return `${(damage / 1000).toFixed(1)}k dmg`;
  };

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
        className="flex-1 p-3 sm:p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3">
          <div className="flex items-center gap-3">
            <img
              src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${game.championId}.png`}
              alt={championName}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {championName}
              </h3>
              <p className={game.win ? "text-green-500" : "text-red-500"}>
                {game.win ? "Victoire" : "Défaite"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {formatGameDuration(game.gameDuration)} •{" "}
                {formatTimeAgo(game.gameCreation)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {formatKDA(game.kills, game.deaths, game.assists)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {game.cs} CS • {formatDamage(game.totalDamageDealtToChampions)}
            </p>
          </div>
        </div>

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
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 sm:mt-0">
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
          className="w-6 h-6 text-gray-400"
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
