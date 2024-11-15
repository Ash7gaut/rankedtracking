import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { api } from "../../../../utils/api";
import { Player } from "../../../../types/interfaces";

export const AddPlayerForm = () => {
  const [summonerName, setSummonerName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [role, setRole] = useState("");
  const [isNewPlayer, setIsNewPlayer] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [isMain, setIsMain] = useState(false);

  const { data: players } = useQuery<Player[]>("players", api.getPlayers);

  // Mapping des joueurs existants avec leurs rôles
  const playerRoles: { [key: string]: string } = {
    Mayd: "ADC",
    Benoit: "TOP",
    Zouzou: "JUNGLE",
    Cedric: "MID",
    Minh: "MID",
    napo: "SUPPORT",
    Ibra: "TOP",
    Katy: "ADC",
    Roke: "TOP",
    melio: "JUNGLE",
    David: "JUNGLE",
    powah: "SUPPORT",
    Benji: "ADC",
  };

  const existingPlayerNames = Array.from(
    new Set(players?.map((p) => p.player_name))
  ).filter(Boolean);

  // Mise à jour du gestionnaire de changement de joueur
  const handlePlayerNameChange = (name: string) => {
    setPlayerName(name);
    if (playerRoles[name]) {
      setRole(playerRoles[name]);
    } else {
      setRole("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.addPlayer(summonerName, playerName, role, isMain);
      setSummonerName("");
      setPlayerName("");
      setRole("");
      setIsMain(false);
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

        {/* Champ pour le nom du joueur modifié */}
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
            onChange={(e) => handlePlayerNameChange(e.target.value)}
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

        {/* Sélecteur de rôle */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          disabled={isLoading || (!!playerName && !!playerRoles[playerName])}
          required
        >
          <option value="">Sélectionner un rôle</option>
          <option value="TOP">Top</option>
          <option value="JUNGLE">Jungle</option>
          <option value="MID">Mid</option>
          <option value="ADC">ADC</option>
          <option value="SUPPORT">Support</option>
        </select>

        {/* Champ pour le nom d'invocateur */}
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
          disabled={
            isLoading || !summonerName.trim() || !playerName.trim() || !role
          }
        >
          {isLoading ? "Ajout..." : "Ajouter"}
        </button>
      </div>
      {error && <p className="mt-2 text-red-500 dark:text-red-400">{error}</p>}
    </form>
  );
};
