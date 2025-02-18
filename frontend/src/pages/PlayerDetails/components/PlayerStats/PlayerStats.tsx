import React from "react";
import { Player } from "frontend/src/types/interfaces";
import { PeakElo } from "./PeakElo";
import { RankProgression } from "./RankProgression";

interface PlayerStatsProps {
  player: Player;
}

export const PlayerStats = ({ player }: PlayerStatsProps) => {
  const winRate =
    player.wins && player.losses
      ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1)
      : "0";

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
      {/* Image de fond du rang */}
      {player.tier && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 overflow-hidden">
          <img
            src={`/ranks/${player.tier.toLowerCase()}.png`}
            alt={player.tier}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Contenu des statistiques */}
      <div className="relative z-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
          Statistiques
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Elo Actuel */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Elo Actuel
            </h3>
            <div className="mt-1.5 sm:mt-2 flex items-center gap-2">
              <img
                src={`/ranks/${player.tier?.toLowerCase() || "unranked"}.png`}
                alt={player.tier || "UNRANKED"}
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
              <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {player.tier ? `${player.tier} ${player.rank}` : "UNRANKED"}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {player.league_points} LP
            </span>
          </div>

          {/* Peak Elo */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Peak Elo
            </h3>
            <PeakElo playerId={player.id} />
          </div>

          {/* Winrate */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Winrate
            </h3>
            <div className="mt-1.5 sm:mt-2">
              <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {winRate}%
              </span>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {player.wins}W {player.losses}L
            </span>
          </div>

          {/* Progression */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Progression
              </h3>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                toutes les 12h ⏲
              </span>
            </div>
            <RankProgression playerId={player.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
