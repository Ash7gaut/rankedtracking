import React from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";
import { api } from "../../../../utils/api";

interface PlayerHeaderProps {
  playerId: string;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({ playerId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) {
      try {
        await api.deletePlayer(playerId);
        queryClient.invalidateQueries("players");
        navigate("/");
      } catch (error) {
        console.error("Error deleting player:", error);
      }
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Retour
      </button>
      <button
        onClick={handleDelete}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Supprimer
      </button>
    </div>
  );
};

export {};
