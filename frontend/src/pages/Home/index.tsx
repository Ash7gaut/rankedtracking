import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { api } from "../../utils/api";
import { Header } from "./components/Header";
import { PlayersList } from "./components/PlayersList/index";
import { PlayerFilter } from "./components/PlayerFilter/PlayerFilter";
import { RoleFilter } from "./components/RoleFilter/RoleFilter";
import { Player } from "../../types/interfaces";

const Home = () => {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
    new Set()
  );
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: players,
    error,
    isFetching,
  } = useQuery<Player[]>("players", api.getPlayers);

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

  const handleRoleSelection = (role: string | null) => {
    setSelectedRole(role);
  };

  const filteredPlayers = players?.filter((player) => {
    const matchesPlayer =
      selectedPlayers.size === 0 || selectedPlayers.has(player.player_name);
    const matchesRole = !selectedRole || player.role === selectedRole;
    return matchesPlayer && matchesRole;
  });

  const handleRefresh = async () => {
    try {
      await api.updateAllPlayers();
      queryClient.invalidateQueries("players");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  return (
    <div>
      <Header
        title="Classement"
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />
      <div className="space-y-4">
        <PlayerFilter
          players={players || []}
          selectedPlayers={selectedPlayers}
          onPlayerSelection={handlePlayerSelection}
        />
        <RoleFilter
          selectedRole={selectedRole}
          onRoleSelection={handleRoleSelection}
        />
        {error ? (
          <div className="text-red-500 dark:text-red-400">
            Erreur de chargement des données
          </div>
        ) : (
          <PlayersList players={filteredPlayers || []} />
        )}
      </div>
    </div>
  );
};

export default Home;
