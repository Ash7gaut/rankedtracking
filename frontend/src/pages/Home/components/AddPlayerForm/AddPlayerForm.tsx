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
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
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

      const fullSummonerName = `${gameName}#${tagLine}`;
      await api.addPlayer(fullSummonerName, defaultPlayerName, "", isMain);

      setGameName("");
      setTagLine("");
      setIsMain(false);
      queryClient.invalidateQueries("players");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Erreur complète:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'ajout du joueur, réessayez plusieurs fois"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1/2">
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Pseudo"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-0"
              disabled={isLoading}
              required
            />
          </div>
          <span className="text-lg text-gray-500 dark:text-gray-400 font-semibold">
            #
          </span>
          <div className="w-1/2">
            <input
              type="text"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              placeholder="Tag"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-0"
              disabled={isLoading}
              required
            />
          </div>
        </div>

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
          disabled={isLoading || !gameName.trim() || !tagLine.trim()}
        >
          {isLoading ? "Ajout..." : "Ajouter"}
        </button>
      </div>
      {error && <p className="mt-2 text-red-500 dark:text-red-400">{error}</p>}
    </form>
  );
};
