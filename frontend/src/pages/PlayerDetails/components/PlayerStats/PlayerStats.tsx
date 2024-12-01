import React from "react";
import { Player } from "frontend/src/types/interfaces";

interface PlayerStatsProps {
  player: Player;
}

export const PlayerStats = ({ player }: PlayerStatsProps) => {
  const winRate =
    player.wins && player.losses
      ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1)
      : "0";

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-[448px]">
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
        <div className="space-y-2 text-gray-600 dark:text-gray-300">
          <p>
            <span className="font-semibold text-gray-700 dark:text-gray-200"></span>{" "}
            {player.tier} {player.rank}
          </p>
          <p>
            <span className="font-semibold text-gray-700 dark:text-gray-200"></span>{" "}
            {player.league_points} LP
          </p>
          <p>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              Victoires :
            </span>{" "}
            {player.wins}
          </p>
          <p>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              Défaites :
            </span>{" "}
            {player.losses}
          </p>
          <p>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              Winrate :
            </span>{" "}
            {winRate}%
          </p>
        </div>
      </div>
    </div>
  );
};
