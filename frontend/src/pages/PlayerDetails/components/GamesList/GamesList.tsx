import React from "react";
import { Game } from "frontend/src/types/interfaces";
import { GameCard } from "./GameCard";

interface GamesListProps {
  games: Game[];
  isLoading: boolean;
  championNames: { [key: number]: string };
  playerName: string;
}

export const GamesList = ({
  games,
  isLoading,
  championNames,
  playerName,
}: GamesListProps) => {
  if (isLoading) {
    return <div>Chargement des parties...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Dernières parties
      </h2>
      {games && games.length > 0 ? (
        <div className="space-y-4">
          {games.map((game) => {
            return (
              <GameCard
                key={game.gameId}
                game={game}
                playerName={playerName}
                championName={championNames[game.championId] || "Unknown"}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-gray-600 dark:text-gray-400">
          Aucune partie récente trouvée
        </div>
      )}
    </div>
  );
};
