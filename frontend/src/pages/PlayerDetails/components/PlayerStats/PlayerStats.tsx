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
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Image de fond du rang */}
      {player.tier && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <img
            src={`/ranks/${player.tier.toLowerCase()}.png`}
            alt={player.tier}
            className="w-100 h-100 object-contain"
          />
        </div>
      )}

      {/* Contenu des statistiques */}
      <div className="relative z-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Statistiques
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Elo Actuel */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Elo Actuel
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <img
                src={`/ranks/${player.tier?.toLowerCase() || "unranked"}.png`}
                alt={player.tier || "UNRANKED"}
                className="w-8 h-8"
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {player.tier ? `${player.tier} ${player.rank}` : "UNRANKED"}
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {player.league_points} LP
            </span>
          </div>

          {/* Peak Elo */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Peak Elo
            </h3>
            <PeakElo playerId={player.id} />
          </div>

          {/* Winrate */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Winrate
            </h3>
            <div className="mt-2">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {winRate}%
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {player.wins}W {player.losses}L
            </span>
          </div>

          {/* Progression */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Progression
            </h3>
            <RankProgression playerId={player.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
