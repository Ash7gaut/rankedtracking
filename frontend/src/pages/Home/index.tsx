import React from "react";
import { useQuery, useQueryClient } from "react-query";
import { api } from "../../utils/api";
import { Header } from "./components/Header";
import { AddPlayerForm } from "./components/AddPlayerForm/index";
import { PlayersList } from "./components/PlayersList/index";

const Home: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: players,
    isLoading,
    error,
    isFetching,
  } = useQuery("players", api.getPlayers, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  const handleRefresh = async () => {
    try {
      // Appeler la route de mise à jour
      await api.updateAllPlayers();
      // Rafraîchir les données après la mise à jour
      await queryClient.invalidateQueries("players");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  if (isLoading) return <div>Chargement...</div>;
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
