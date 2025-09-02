import React from "react";
import { useNavigate } from "react-router-dom";

interface PlayerHeaderProps {
  playerId: string;
}

export const PlayerHeader = ({ playerId }: PlayerHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative -mx-6 -mt-6">
      {/* Contenu du header */}
      <div className="relative p-6">
        <div className="flex items-center gap-4">
          {/* ... reste du contenu du header ... */}
        </div>
      </div>
    </div>
  );
};

export {};
