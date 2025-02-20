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
      {/* Image de fond avec un meilleur effet */}
      {player.tier && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 dark:to-black/10" />
          <img
            src={`/ranks/${player.tier.toLowerCase()}.png`}
            alt={player.tier}
            className="w-full h-full object-contain opacity-[0.07] dark:opacity-[0.05] transform scale-150"
          />
        </div>
      )}

      {/* Cartes de stats avec un design plus moderne */}
      <div className="relative z-10">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Statistiques
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Elo Actuel */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Elo Actuel
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-full transform scale-150" />
                <img
                  src={`/ranks/${player.tier?.toLowerCase() || "unranked"}.png`}
                  alt={player.tier || "UNRANKED"}
                  className="w-10 h-10 relative z-10"
                />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white block">
                  {player.tier ? `${player.tier} ${player.rank}` : "UNRANKED"}
                </span>
                <span className="text-sm text-blue-500 dark:text-blue-400 font-semibold">
                  {player.league_points} LP
                </span>
              </div>
            </div>
          </div>

          {/* Winrate avec un design circulaire amélioré */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Winrate
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                {/* Cercle de fond */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-gray-200 dark:text-gray-600"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="26"
                    cx="32"
                    cy="32"
                  />
                  {/* Cercle de progression */}
                  <circle
                    className={`${
                      Number(winRate) >= 50 ? "text-green-500" : "text-red-500"
                    }`}
                    strokeWidth="4"
                    strokeDasharray={`${Number(winRate) * 1.64} 164`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="26"
                    cx="32"
                    cy="32"
                  />
                </svg>
                {/* Texte au centre */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {winRate}%
                  </span>
                </div>
              </div>
              {/* Stats de W/L */}
              <div className="flex flex-col">
                <span className="text-green-500 font-medium">
                  {player.wins} Victoires
                </span>
                <span className="text-red-500 font-medium">
                  {player.losses} Défaites
                </span>
              </div>
            </div>
          </div>

          {/* Peak Elo */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Peak Elo
            </h3>
            <PeakElo playerId={player.id} />
          </div>

          {/* Progression */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Progression
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
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
