import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { api } from "../../../../utils/api";
import { CircularProgress, Tooltip } from "@mui/material";
import { Help, SportsEsports, Star } from "@mui/icons-material";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <SportsEsports className="w-4 h-4" />
              Compte Riot Games
            </label>
            <Tooltip
              title="Entrez votre nom d'invocateur et votre tag comme ils apparaissent dans le client League of Legends"
              arrow
              placement="top"
            >
              <Help className="w-4 h-4 text-gray-400 cursor-help" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3/5">
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Pseudo"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                disabled={isLoading}
                required
              />
            </div>
            <span className="text-lg text-gray-500 dark:text-gray-400 font-semibold">
              #
            </span>
            <div className="w-2/5">
              <input
                type="text"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                placeholder="Tag"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Exemple: Pseudo#EUW
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-100/80 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center h-5">
            <input
              id="isMain"
              type="checkbox"
              checked={isMain}
              onChange={(e) => setIsMain(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <Star
              className={`w-4 h-4 ${
                isMain ? "text-yellow-500" : "text-gray-400"
              }`}
            />
            <label
              htmlFor="isMain"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Définir comme compte principal
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={isLoading || !gameName.trim() || !tagLine.trim()}
        >
          {isLoading ? (
            <>
              <CircularProgress
                size={16}
                thickness={6}
                className="text-white"
              />
              <span>Ajout en cours...</span>
            </>
          ) : (
            "Ajouter le compte"
          )}
        </button>
      </div>
    </form>
  );
};
