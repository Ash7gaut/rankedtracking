import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { api } from "../../utils/api";
import { Header } from "./components/Header";
import { PlayersList } from "./components/PlayersList/index";
import { PlayerFilter } from "./components/PlayerFilter/PlayerFilter";
import { Player } from "../../types/interfaces";

const Home = () => {
  const queryClient = useQueryClient();
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
    new Set()
  );

  const {
    data: players,
    error,
    isFetching,
  } = useQuery<Player[]>("players", api.getPlayers, {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const handlePlayerSelection = (playerName: string) => {
    setSelectedPlayers((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(playerName)) {
        newSelection.delete(playerName);
      } else {
        newSelection.add(playerName);
      }
      return newSelection;
    });
  };

  const filteredPlayers = players?.filter((player) => {
    if (selectedPlayers.size === 0) return true;
    console.log(
      "Filtering player:",
      player.player_name,
      "Selected:",
      selectedPlayers
    );
    return selectedPlayers.has(player.player_name);
  });

  const handleRefresh = async () => {
    try {
      await api.updateAllPlayers();
      queryClient.invalidateQueries("players");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  if (error) return <div>Erreur de chargement: {(error as Error).message}</div>;

  return (
    <div>
      <Header
        title="LoL Friends Stats"
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />
      {players && (
        <PlayerFilter
          players={players}
          selectedPlayers={selectedPlayers}
          onPlayerSelection={handlePlayerSelection}
        />
      )}
      <PlayersList players={filteredPlayers || []} />
    </div>
  );
};

export default Home;
