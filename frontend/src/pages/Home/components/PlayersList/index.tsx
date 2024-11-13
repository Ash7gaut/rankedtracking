import React from "react";
import { Player } from "frontend/src/types/interfaces";
import { PlayerCard } from "./PlayerCard";
import { compareRanks } from "../../../../utils/rankUtils";

interface PlayersListProps {
  players: Player[];
}

export const PlayersList: React.FC<PlayersListProps> = ({ players }) => {
  const sortedPlayers = [...players].sort(compareRanks);
  const [firstPlace, ...restPlayers] = sortedPlayers;

  console.log("First Place:", firstPlace); // Debug
  console.log("Rest Players:", restPlayers); // Debug

  return (
    <div className="space-y-6">
      {/* Premier joueur (podium) */}
      {firstPlace && (
        <div className="flex justify-center">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <PlayerCard player={firstPlace} rank={1} />
          </div>
        </div>
      )}

      {/* Reste des joueurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restPlayers.map((player, index) => (
          <PlayerCard key={player.id} player={player} rank={index + 2} />
        ))}
      </div>
    </div>
  );
};
