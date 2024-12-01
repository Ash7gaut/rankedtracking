import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../utils/supabase";

interface PlayerHeaderProps {
  playerId: string;
}

export const PlayerHeader = ({ playerId }: PlayerHeaderProps) => {
  const navigate = useNavigate();
  const [backgroundUrl, setBackgroundUrl] = useState("");

  // Charger le fond du joueur
  useEffect(() => {
    const loadPlayerBackground = async () => {
      if (!playerId) return;

      const { data: player } = await supabase
        .from("players")
        .select("player_name")
        .eq("id", playerId)
        .single();

      if (player?.player_name) {
        const { data: username } = await supabase
          .from("usernames")
          .select("background_url")
          .eq("username", player.player_name)
          .single();

        if (username?.background_url) {
          setBackgroundUrl(username.background_url);
        }
      }
    };

    loadPlayerBackground();
  }, [playerId]);

  return (
    <div className="relative -mx-6 -mt-6">
      {/* Fond avec overlay */}

      <div className="absolute left-0 top-0 h-[100px] w-[800px] -z-10">
        <img
          src={backgroundUrl}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Contenu du header */}
      <div className="relative p-6">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
        >
          Retour
        </button>

        <div className="flex items-center gap-4">
          {/* ... reste du contenu du header ... */}
        </div>
      </div>
    </div>
  );
};

export {};
