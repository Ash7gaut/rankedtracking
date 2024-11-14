import React from "react";
import { useQuery, useQueryClient } from "react-query";
import { api } from "../../utils/api";
import { Header } from "./components/Header";
import { AddPlayerForm } from "./components/AddPlayerForm/index";
import { PlayersList } from "./components/PlayersList/index";
import { Player } from "../../types/interfaces";

const Home: React.FC = () => {
  const queryClient = useQueryClient();

  // Utiliser l'API du backend qui communique déjà avec Supabase
  const {
    data: players,
    error,
    isFetching,
  } = useQuery<Player[]>("players", api.getPlayers, {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const handleRefresh = async () => {
    try {
      await api.updateAllPlayers();
      // Recharger les données via l'API après la mise à jour
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
      <AddPlayerForm />
      <PlayersList players={players || []} />
    </div>
  );
};

export default Home;
