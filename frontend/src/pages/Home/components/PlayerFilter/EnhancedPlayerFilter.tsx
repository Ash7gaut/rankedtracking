import React, { useState } from "react";
import { Player } from "../../../../types/interfaces";
import { FilterAlt, Person, Warning } from "@mui/icons-material";

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

  const isFilterActive = selectedPlayers.size > 0 || showNegativeOnly;

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FilterAlt
            className={`w-6 h-6 ${
              isFilterActive
                ? "text-blue-500"
                : "text-gray-400 dark:text-gray-600"
            }`}
          />
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Filtrer les joueurs
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <span
            className="block transform transition-transform duration-300"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            ▼
          </span>
        </button>
      </div>

      {/* Aperçu des 3 premiers joueurs */}
      {!isOpen && uniquePlayerNames.length > 0 && (
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {uniquePlayerNames.slice(0, 3).map((playerName) => (
              <label
                key={playerName}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedPlayers.has(playerName)
                    ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800"
                    : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPlayers.has(playerName)}
                  onChange={() => onPlayerSelection(playerName)}
                  className="sr-only peer"
                />
                <Person
                  className={`w-5 h-5 flex-shrink-0 ${
                    selectedPlayers.has(playerName)
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                />
                <span
                  className={`font-medium truncate ${
                    selectedPlayers.has(playerName)
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {playerName}
                </span>
              </label>
            ))}
          </div>
          {uniquePlayerNames.length > 3 && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
          )}
        </div>
      )}

      {isOpen && (
        <div className="space-y-6">
          <div className="relative">
            <button
              onClick={() => onNegativeFilterChange(!showNegativeOnly)}
              className={`w-full p-3 rounded-xl transition-all duration-300 flex items-center justify-between ${
                showNegativeOnly
                  ? "bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800"
                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Warning
                  className={`w-5 h-5 ${
                    showNegativeOnly
                      ? "text-red-500 dark:text-red-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                />
                <span
                  className={`font-medium ${
                    showNegativeOnly
                      ? "text-red-700 dark:text-red-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Winrate négatif
                </span>
              </div>
              {negativeWinratePlayers.length > 0 && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    showNegativeOnly
                      ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {negativeWinratePlayers.length}
                </span>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 px-1">
              <span>Sélectionner les joueurs</span>
              <span>{selectedPlayers.size} sélectionné(s)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2">
              {uniquePlayerNames.map((playerName) => (
                <label
                  key={playerName}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedPlayers.has(playerName)
                      ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800"
                      : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlayers.has(playerName)}
                    onChange={() => onPlayerSelection(playerName)}
                    className="sr-only peer"
                  />
                  <Person
                    className={`w-5 h-5 flex-shrink-0 ${
                      selectedPlayers.has(playerName)
                        ? "text-blue-500 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                  <span
                    className={`font-medium truncate ${
                      selectedPlayers.has(playerName)
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {playerName}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
