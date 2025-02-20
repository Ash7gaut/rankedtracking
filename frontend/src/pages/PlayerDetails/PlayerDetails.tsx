import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { api } from "../../utils/api";
import { Player } from "frontend/src/types/interfaces";
import { PlayerHeader } from "./components/PlayerHeader/PlayerHeader";
import { PlayerProfile } from "./components/PlayerProfile";
import { PlayerStats } from "./components/PlayerStats/PlayerStats";
import { GamesList } from "./components/GamesList/GamesList";
import { PlayerHistory } from "../Home/components/PlayerHistory/PlayerHistory";
import { useChampionNames } from "./hooks/useChampionNames";

const PlayerDetails = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: player,
    error,
    isFetching,
  } = useQuery<Player>(["player", id], () => api.getPlayerById(id!), {
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const { data: games, isLoading: gamesLoading } = useQuery(
    ["games", player?.puuid],
    () => api.getPlayerGames(player!.puuid),
    {
      enabled: !!player?.puuid,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const championNames = useChampionNames(games);

  if (error)
    return (
      <div className="text-gray-900 dark:text-white">Erreur de chargement</div>
    );
  if (!player) return null;

  return (
    <div className="relative overflow-x-hidden min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div
        className={`container mx-auto px-4 py-8 ${
          isFetching ? "opacity-70" : ""
        } transition-opacity duration-300`}
      >
        <PlayerHeader playerId={id!} />
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <PlayerProfile player={player} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <PlayerStats player={player} />
          </div>
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <PlayerHistory playerId={id!} />
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <GamesList
            games={games || []}
            isLoading={gamesLoading}
            championNames={championNames}
            playerName={player.summoner_name}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerDetails;
