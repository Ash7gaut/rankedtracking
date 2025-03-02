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

  // Séparer les joueurs classés des joueurs non classés
  const rankedPlayers = enrichedPlayers.filter((player) => player.tier);
  const unrankedPlayers = enrichedPlayers.filter((player) => !player.tier);

  // Trier les joueurs classés
  const sortedRankedPlayers = [...rankedPlayers].sort(compareRanks);

  // Extraire le premier joueur pour le podium (s'il existe)
  const [firstPlace, ...restRankedPlayers] = sortedRankedPlayers;

  return (
    <div className="space-y-8">
      {/* Section des joueurs classés */}
      <div className="space-y-4">
        {/* Premier joueur (podium) */}
        {firstPlace && (
          <div className="flex justify-center">
            <div className="w-[1700px]">
              <PlayerCard player={firstPlace} rank={1} />
            </div>
          </div>
        )}

        {/* Reste des joueurs classés */}
        {restRankedPlayers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {restRankedPlayers.map((player, index) => (
              <div key={player.id}>
                <PlayerCard player={player} rank={index + 2} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section des joueurs non classés (si présents) */}
      {unrankedPlayers.length > 0 && (
        <div className="space-y-4">
          {/* Ligne de séparation avec titre "UNRANKED" */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-gray-800 text-lg font-semibold text-gray-500 dark:text-gray-400">
                UNRANKED
              </span>
            </div>
          </div>

          {/* Joueurs non classés */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {unrankedPlayers.map((player) => (
              <div key={player.id}>
                <PlayerCard player={player} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
