import React from "react";

interface MainAccountFilterProps {
  isMainOnly: boolean;
  onMainAccountToggle: () => void;
}

export const MainAccountFilter = ({
  isMainOnly,
  onMainAccountToggle,
}: MainAccountFilterProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comptes principaux
        </h3>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isMainOnly}
            onChange={onMainAccountToggle}
            className="form-checkbox h-5 w-5 text-blue-500 custom-checkbox"
          />
        </label>
      </div>
    </div>
  );
};
