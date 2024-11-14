import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { api } from "../../../../utils/api";
import { Player } from "../../../../types/interfaces";

export const AddPlayerForm = () => {
  const [summonerName, setSummonerName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isNewPlayer, setIsNewPlayer] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Récupérer la liste des joueurs existants
  const { data: players } = useQuery<Player[]>("players", api.getPlayers);
  const existingPlayerNames = Array.from(
    new Set(players?.map((p) => p.player_name))
  ).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.addPlayer(summonerName, playerName);
      setSummonerName("");
      setPlayerName("");
      queryClient.invalidateQueries("players");
    } catch (err) {
      setError("Erreur lors de l'ajout du joueur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
      <div className="flex flex-col gap-4">
        {/* Choix du type d'ajout */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={isNewPlayer}
              onChange={() => setIsNewPlayer(true)}
              className="text-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Nouveau joueur
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!isNewPlayer}
              onChange={() => setIsNewPlayer(false)}
              className="text-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Joueur existant
            </span>
          </label>
        </div>

        {/* Champ pour le nom du joueur */}
        {isNewPlayer ? (
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Nom du joueur"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
        ) : (
          <select
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          >
            <option value="">Sélectionner un joueur</option>
            {existingPlayerNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}

        {/* Champ pour le nom d'invocateur */}
        <input
          type="text"
          value={summonerName}
          onChange={(e) => setSummonerName(e.target.value)}
          placeholder="Nom d'invocateur (nom#tag)"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        />

        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={isLoading || !summonerName.trim() || !playerName.trim()}
        >
          {isLoading ? "Ajout..." : "Ajouter"}
        </button>
      </div>
      {error && <p className="mt-2 text-red-500 dark:text-red-400">{error}</p>}
    </form>
  );
};
