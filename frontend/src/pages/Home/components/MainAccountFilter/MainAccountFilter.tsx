import React from "react";
import { Star } from "@mui/icons-material";

interface MainAccountFilterProps {
  isMainOnly: boolean;
  onMainAccountToggle: () => void;
}

export const MainAccountFilter = ({
  isMainOnly,
  onMainAccountToggle,
}: MainAccountFilterProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star
            className={`w-6 h-6 ${
              isMainOnly
                ? "text-yellow-500"
                : "text-gray-400 dark:text-gray-600"
            }`}
          />
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Comptes principaux
          </h3>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isMainOnly}
            onChange={onMainAccountToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Afficher uniquement les comptes principaux des joueurs pour un meilleur
        aperçu du classement.
      </p>
    </div>
  );
};
