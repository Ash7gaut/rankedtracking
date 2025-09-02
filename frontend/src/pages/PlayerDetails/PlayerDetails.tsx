import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { api } from "../../utils/api";
import { supabase } from "../../utils/supabase";
import { Player } from "frontend/src/types/interfaces";
import { PlayerHeader } from "./components/PlayerHeader/PlayerHeader";
import { PlayerProfileHeader } from "./components/PlayerProfileHeader";
import { PlayerStats } from "./components/PlayerStats/PlayerStats";
import { GamesList } from "./components/GamesList/GamesList";
import { PlayerHistory } from "../Home/components/PlayerHistory/PlayerHistory";
import { useChampionNames } from "./hooks/useChampionNames";
import { HeaderUniform } from "../../components/HeaderUniform";

const PlayerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    data: player,
    error,
    isFetching,
  } = useQuery<Player>(["player", id], () => api.getPlayerById(id!), {
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const { data: games, isLoading: gamesLoading } = useQuery(
    ["games", player?.puuid],
    () => api.getPlayerGames(player!.puuid),
    {
      enabled: !!player?.puuid,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  // Récupérer le background_url du joueur
  useEffect(() => {
    const loadPlayerBackground = async () => {
      if (!player?.player_name) return;

      try {
        const { data, error } = await supabase
          .from("usernames")
          .select("background_url")
          .eq("username", player.player_name)
          .single();

        if (!error && data?.background_url) {
          // Précharger l'image
          const img = new Image();
          img.src = data.background_url;
          img.onload = () => {
            setBackgroundUrl(data.background_url);
            setImageLoaded(true);
            setImageError(false);
          };
          img.onerror = () => {
            console.error("Erreur lors du chargement de l'image de fond");
            setImageError(true);
            // Quand même définir l'URL pour permettre les retentatives
            setBackgroundUrl(data.background_url);
          };
        } else {
          // Pas d'image de fond définie ou erreur
          setBackgroundUrl(null);
          setImageLoaded(false);
          setImageError(false);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du fond:", err);
        setBackgroundUrl(null);
        setImageLoaded(false);
        setImageError(false);
      }
    };

    if (player) {
      loadPlayerBackground();
    }
  }, [player]);

  const championNames = useChampionNames(games);

  if (error)
    return (
      <div className="text-gray-900 dark:text-white">Erreur de chargement</div>
    );
  if (!player) return null;

  return (
    <div className="relative overflow-x-hidden min-h-screen">
      <HeaderUniform
        title={player.summoner_name || "Détails du joueur"}
        showHomeButton={true}
      />
      <div
        className={`container mx-auto px-4 py-8 ${
          isFetching ? "opacity-70" : ""
        } transition-opacity duration-300`}
      >
        <PlayerHeader playerId={id!} />

        {/* Carte d'informations du joueur avec background */}
        <div className="relative overflow-hidden rounded-xl shadow-lg mb-8 transition-all duration-500 ease-in-out">
          {backgroundUrl && !imageError && (
            <div
              className={`absolute inset-0 z-0 transition-all duration-700 ${
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            >
              <img
                src={backgroundUrl}
                alt="Player Background"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
            </div>
          )}
          {/* Fallback background gradient si pas d'image ou erreur */}
          {(!backgroundUrl || imageError) && (
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40"></div>
          )}
          <div
            className={`relative z-10 backdrop-blur-sm p-6 border border-white/10 dark:border-gray-700/30 transition-all duration-500 ${
              backgroundUrl
                ? imageLoaded
                  ? "opacity-100 transform-none"
                  : "opacity-0 translate-y-4"
                : "opacity-100 transform-none"
            }`}
          >
            <PlayerProfileHeader player={player} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <PlayerStats player={player} />
          </div>
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <PlayerHistory playerId={id!} />
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <GamesList
            games={games || []}
            isLoading={gamesLoading}
            championNames={championNames}
            playerName={player.summoner_name}
            tier={player.tier}
            rank={player.rank}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerDetails;
