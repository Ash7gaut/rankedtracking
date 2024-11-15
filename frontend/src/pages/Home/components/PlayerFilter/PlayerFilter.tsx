import React, { useState } from "react";
import { Player } from "../../../../types/interfaces";

interface PlayerFilterProps {
  players: Player[];
  selectedPlayers: Set<string>;
  onPlayerSelection: (playerName: string) => void;
}

export const PlayerFilter = ({
  players,
  selectedPlayers,
  onPlayerSelection,
}: PlayerFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {uniquePlayerNames.map((playerName) => (
            <label
              key={playerName}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={selectedPlayers.has(playerName)}
                onChange={() => onPlayerSelection(playerName)}
                className="form-checkbox h-5 w-5 text-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">
                {playerName}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
