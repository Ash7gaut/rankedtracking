import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

interface PlayerHeaderProps {
  playerId: string;
}

export const PlayerHeader = ({ playerId }: PlayerHeaderProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="relative -mx-6 -mt-6">
      {/* Contenu du header */}
      <div className="relative p-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all"
        >
          <ArrowBack className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="flex items-center gap-4">
          {/* ... reste du contenu du header ... */}
        </div>
      </div>
    </div>
  );
};

export {};
