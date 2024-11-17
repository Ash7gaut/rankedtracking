import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { api } from "../../utils/api";
import { Header } from "./components/Header";
import { PlayersList } from "./components/PlayersList/index";
import { SkeletonCard } from "./components/PlayersList/SkeletonCard";
import { PlayerFilter } from "./components/PlayerFilter/PlayerFilter";
import { RoleFilter } from "./components/RoleFilter/RoleFilter";
import { MainAccountFilter } from "./components/MainAccountFilter/MainAccountFilter";
import { Player } from "../../types/interfaces";

const Home = () => {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
    new Set()
  );
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isMainOnly, setIsMainOnly] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: players, error } = useQuery<Player[]>(
    "players",
    api.getPlayers,
    {
      retry: 2,
      retryDelay: 1000,
      onSettled: () => setIsInitialLoading(false),
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      staleTime: 0,
      initialDataUpdatedAt: 0,
      refetchInterval: 30000,
    }
  );

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
    const matchesMainAccount = !isMainOnly || player.is_main;
    return matchesPlayer && matchesRole && matchesMainAccount;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await api.updateAllPlayers();
      await queryClient.invalidateQueries("players");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div>
      <Header
        title="Classement"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {isInitialLoading && (
        <>
          <div className="flex flex-col items-center justify-center mt-20 mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Chargement des données, cela peut prendre jusqu'à 1 minute...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </>
      )}

      {!isInitialLoading && (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[300px]">
              <PlayerFilter
                players={players || []}
                selectedPlayers={selectedPlayers}
                onPlayerSelection={handlePlayerSelection}
              />
            </div>
            <div className="flex-1 min-w-[300px]">
              <RoleFilter
                selectedRole={selectedRole}
                onRoleSelection={handleRoleSelection}
              />
            </div>
            <div className="flex-1 min-w-[300px]">
              <MainAccountFilter
                isMainOnly={isMainOnly}
                onMainAccountToggle={() => setIsMainOnly(!isMainOnly)}
              />
            </div>
          </div>
          {error ? (
            <div className="text-red-500 dark:text-red-400">
              Erreur de chargement des données
            </div>
          ) : (
            <PlayersList players={filteredPlayers || []} />
          )}
        </>
      )}
    </div>
  );
};

export default Home;
