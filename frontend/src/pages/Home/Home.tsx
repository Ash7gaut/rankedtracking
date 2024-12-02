import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { api } from "../../utils/api";
import { Header } from "./components/Header";
import { PlayersList } from "./components/PlayersList/PlayerList";
import { SkeletonCard } from "./components/PlayersList/SkeletonCard";
import { PlayerFilter } from "./components/PlayerFilter/PlayerFilter";
import { MainAccountFilter } from "./components/MainAccountFilter/MainAccountFilter";
import { NegativeWinrateFilter } from "./components/NegativeWinrateFilter/NegativeWinrateFilter";
import { Player } from "../../types/interfaces";
import { LPTracker } from "../../components/LPTracker";

const Home = () => {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
    new Set()
  );
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isMainOnly, setIsMainOnly] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNegativeOnly, setShowNegativeOnly] = useState(false);

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

    const totalGames = (player.wins || 0) + (player.losses || 0);
    const isNegative =
      totalGames >= 20 && ((player.wins || 0) / totalGames) * 100 < 50;
    const matchesNegative = !showNegativeOnly || isNegative;

    return (
      matchesPlayer && matchesRole && matchesMainAccount && matchesNegative
    );
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

  const selectedPlayerIds = players
    ? Array.from(selectedPlayers)
        .map(
          (playerName) => players.find((p) => p.player_name === playerName)?.id
        )
        .filter((id): id is string => id !== undefined)
    : [];

  return (
    <div>
      <Header
        title="Classement"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {!isInitialLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <PlayerFilter
                  players={players || []}
                  selectedPlayers={selectedPlayers}
                  onPlayerSelection={handlePlayerSelection}
                />
              </div>
              <div className="flex-1 min-w-[300px]">
                <NegativeWinrateFilter
                  players={players || []}
                  onFilterChange={setShowNegativeOnly}
                  isActive={showNegativeOnly}
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
          </div>

          <div className="lg:col-span-1">
            <LPTracker selectedPlayers={selectedPlayerIds} />
          </div>
        </div>
      )}

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
    </div>
  );
};

export default Home;
