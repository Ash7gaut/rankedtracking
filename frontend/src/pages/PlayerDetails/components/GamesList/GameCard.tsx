import React from "react";
import { Game } from "frontend/src/types/interfaces";

interface GameCardProps {
  game: Game;
  championName: string;
  playerName: string;
}

export const GameCard = ({ game, championName, playerName }: GameCardProps) => {
  const formatGameDuration = (seconds: number) => {
    if (!seconds && seconds !== 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatKDA = (kills: number, deaths: number, assists: number) => {
    const kda = ((kills + assists) / Math.max(1, deaths)).toFixed(2);
    return `${kills}/${deaths}/${assists} (${kda})`;
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
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${
        game.win ? "border-l-4 border-green-500" : "border-l-4 border-red-500"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <img
            src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${game.championId}.png`}
            alt={championName}
            className="w-16 h-16 rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {championName}
            </h3>
            <p className={game.win ? "text-green-500" : "text-red-500"}>
              {game.win ? "Victoire" : "Défaite"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatGameDuration(game.gameDuration)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatKDA(game.kills, game.deaths, game.assists)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {game.cs} CS • {Math.round(game.totalDamageDealtToChampions / 1000)}
            k dégâts
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Alliés
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${mainPlayer.championId}.png`}
                    alt={mainPlayer.championName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                      {mainPlayer.summonerName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {mainPlayer.cs} CS •{" "}
                      {Math.round(
                        mainPlayer.totalDamageDealtToChampions / 1000
                      )}
                      k
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatKDA(
                    mainPlayer.kills,
                    mainPlayer.deaths,
                    mainPlayer.assists
                  )}
                </span>
              </div>
              {game.allies?.map((ally) => (
                <div
                  key={ally.summonerName}
                  className="flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ally.championId}.png`}
                      alt={ally.championName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {ally.summonerName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {ally.championName} • {ally.cs} CS
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatKDA(ally.kills, ally.deaths, ally.assists)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Adversaires
            </h4>
            <div className="space-y-2">
              {game.enemies?.map((enemy) => (
                <div
                  key={enemy.summonerName}
                  className="flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${enemy.championId}.png`}
                      alt={enemy.championName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {enemy.summonerName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {enemy.championName} • {enemy.cs} CS
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatKDA(enemy.kills, enemy.deaths, enemy.assists)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
