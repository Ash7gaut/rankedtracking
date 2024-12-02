import React from "react";
import { Player } from "frontend/src/types/interfaces";
import { PlayerCard } from "./PlayerCard";
import { compareRanks } from "../../../../utils/rankUtils";
import { useQuery } from "react-query";
import { supabase } from "../../../../utils/supabase";

interface PlayersListProps {
  players: Player[];
}

export const PlayersList = ({ players }: PlayersListProps) => {
  // Récupérer les données des utilisateurs avec leurs rôles
  const { data: users } = useQuery("users", async () => {
    const { data, error } = await supabase.from("usernames").select(`
        username,
        role,
        players (*)
      `);

    if (error) throw error;
    return data;
  });

  // Combiner les données des utilisateurs avec les joueurs
  const enrichedPlayers = players.map((player) => {
    const userInfo = users?.find((u) => u.username === player.player_name);
    return {
      ...player,
      role: userInfo?.role,
    };
  });

  const sortedPlayers = [...enrichedPlayers].sort(compareRanks);
  const [firstPlace, ...restPlayers] = sortedPlayers;

  return (
    <div className="space-y-4">
      {/* Premier joueur (podium) */}
      {firstPlace && (
        <div className="flex justify-center">
          <div className="w-[1000px]">
            <PlayerCard player={firstPlace} rank={1} />
          </div>
        </div>
      )}

      {/* Reste des joueurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {restPlayers.map((player, index) => (
          <div key={player.id}>
            <PlayerCard player={player} rank={index + 2} />
          </div>
        ))}
      </div>
    </div>
  );
};
