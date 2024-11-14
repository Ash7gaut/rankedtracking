import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { api } from "../../../../utils/api";

export const AddPlayerForm = () => {
  const [summonerName, setSummonerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.addPlayer(summonerName);
      setSummonerName("");
      queryClient.invalidateQueries("players");
    } catch (err) {
      setError("Erreur lors de l'ajout du joueur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-4">
        <input
          type="text"
          value={summonerName}
          onChange={(e) => setSummonerName(e.target.value)}
          placeholder="Nom d'invocateur"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        />
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
