import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { api } from "../../../../utils/api";

interface AddPlayerFormProps {
  onSuccess?: () => void;
  defaultPlayerName?: string;
}

export const AddPlayerForm = ({
  onSuccess,
  defaultPlayerName,
}: AddPlayerFormProps) => {
  const [summonerName, setSummonerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMain, setIsMain] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!defaultPlayerName) {
        throw new Error("Nom du joueur non défini");
      }

      await api.addPlayer(summonerName, defaultPlayerName, "", isMain);

      setSummonerName("");
      setIsMain(false);
      queryClient.invalidateQueries("players");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Erreur complète:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'ajout du joueur, réessayez une seconde fois"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={summonerName}
          onChange={(e) => setSummonerName(e.target.value)}
          placeholder="Nom d'invocateur (nom#tag)"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isMain}
            onChange={(e) => setIsMain(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-500"
          />
          <span className="text-gray-700 dark:text-gray-300">
            Compte principal
          </span>
        </label>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={isLoading || !summonerName.trim()}
        >
          {isLoading ? "Ajout..." : "Ajouter"}
        </button>
      </div>
      {error && <p className="mt-2 text-red-500 dark:text-red-400">{error}</p>}
    </form>
  );
};
