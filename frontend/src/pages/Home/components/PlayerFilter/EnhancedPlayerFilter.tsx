import React, { useState } from "react";
import { Player } from "../../../../types/interfaces";

interface EnhancedPlayerFilterProps {
  players: Player[];
  selectedPlayers: Set<string>;
  onPlayerSelection: (playerName: string) => void;
  showNegativeOnly: boolean;
  onNegativeFilterChange: (show: boolean) => void;
}

export const EnhancedPlayerFilter = ({
  players,
  selectedPlayers,
  onPlayerSelection,
  showNegativeOnly,
  onNegativeFilterChange,
}: EnhancedPlayerFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const negativeWinratePlayers = players.filter((player) => {
    const totalGames = (player.wins || 0) + (player.losses || 0);
    if (totalGames >= 20) {
      const winrate = ((player.wins || 0) / totalGames) * 100;
      return winrate < 50;
    }
    return false;
  });

  const uniquePlayerNames = Array.from(
    new Set(players.map((p) => p.player_name))
  ).filter(Boolean);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filtrer par joueur
        </h3>
        <span
          className="transform transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <button
            onClick={() => onNegativeFilterChange(!showNegativeOnly)}
            className={`w-full p-2 rounded-lg transition-colors ${
              showNegativeOnly
                ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="flex items-center gap-2">
              Filtrer les 💩
              {negativeWinratePlayers.length > 0 && (
                <span className="text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                  {negativeWinratePlayers.length}
                </span>
              )}
            </span>
          </button>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {uniquePlayerNames.map((playerName) => (
              <label
                key={playerName}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedPlayers.has(playerName)}
                  onChange={() => onPlayerSelection(playerName)}
                  className="custom-checkbox"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {playerName}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
