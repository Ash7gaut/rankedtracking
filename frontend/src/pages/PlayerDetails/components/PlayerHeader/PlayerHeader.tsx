import React from "react";
import { useNavigate } from "react-router-dom";

interface PlayerHeaderProps {
  playerId: string;
}

export const PlayerHeader = ({ playerId }: PlayerHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Retour
      </button>
    </div>
  );
};

export {};
