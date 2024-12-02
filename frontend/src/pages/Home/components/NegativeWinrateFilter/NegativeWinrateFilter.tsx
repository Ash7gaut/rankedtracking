import React from "react";
import { Player } from "../../../../types/interfaces";

interface NegativeWinrateFilterProps {
  players: Player[];
  onFilterChange: (showNegative: boolean) => void;
  isActive: boolean;
}

export const NegativeWinrateFilter = ({
  players,
  onFilterChange,
  isActive,
}: NegativeWinrateFilterProps) => {
  const negativeWinratePlayers = players.filter((player) => {
    const totalGames = (player.wins || 0) + (player.losses || 0);
    if (totalGames >= 20) {
      const winrate = ((player.wins || 0) / totalGames) * 100;
      return winrate < 50;
    }
    return false;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
      <button
        onClick={() => onFilterChange(!isActive)}
        className={`w-full flex items-center justify-between p-2 rounded ${
          isActive
            ? "bg-red-100 dark:bg-red-900"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          Filtrer les 💩
          {negativeWinratePlayers.length > 0 && (
            <span className="text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
              {negativeWinratePlayers.length}
            </span>
          )}
        </span>
      </button>
    </div>
  );
};
