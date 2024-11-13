import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { api } from "../../utils/api";
import { Player } from "frontend/src/types/interfaces";
import { PlayerHeader } from "./components/PlayerHeader";
import { PlayerProfile } from "./components/PlayerProfile";
import { PlayerStats } from "./components/PlayerStats";
import { GamesList } from "./components/GamesList";
import { useChampionNames } from "./hooks/useChampionNames";

const PlayerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: player,
    isLoading,
    error,
  } = useQuery<Player>(["player", id], () => api.getPlayerById(id!));

  const { data: games, isLoading: gamesLoading } = useQuery(
    ["games", player?.puuid],
    () => api.getPlayerGames(player!.puuid),
    {
      enabled: !!player?.puuid,
    }
  );

  const championNames = useChampionNames(games);

  if (isLoading)
    return <div className="text-gray-900 dark:text-white">Chargement...</div>;
  if (error)
    return (
      <div className="text-gray-900 dark:text-white">Erreur de chargement</div>
    );
  if (!player)
    return (
      <div className="text-gray-900 dark:text-white">Joueur non trouvé</div>
    );

  return (
    <div className="p-6">
      <PlayerHeader playerId={id!} />
      <PlayerProfile player={player} />
      <PlayerStats player={player} />
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
