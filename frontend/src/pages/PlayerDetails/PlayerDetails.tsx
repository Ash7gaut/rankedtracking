import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { api } from "../../utils/api";
import { Player } from "frontend/src/types/interfaces";
import { PlayerHeader } from "./components/PlayerHeader/PlayerHeader";
import { PlayerProfile } from "./components/PlayerProfile";
import { PlayerStats } from "./components/PlayerStats/PlayerStats";
import { GamesList } from "./components/GamesList/GamesList";
import { useChampionNames } from "./hooks/useChampionNames";
import { LinkedAccountsView } from "../Profile/components/LinkedAccountsView";

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
    <div
      className={`p-6 ${
        isFetching ? "opacity-70" : ""
      } transition-opacity duration-300`}
    >
      <PlayerHeader playerId={id!} />
      <PlayerProfile player={player} />
      <PlayerStats player={player} />
      <LinkedAccountsView playerName={player.player_name || ""} />
      <GamesList
        games={games || []}
        isLoading={gamesLoading}
        championNames={championNames}
        playerName={player.summoner_name}
      />
    </div>
  );
};

export default PlayerDetails;
