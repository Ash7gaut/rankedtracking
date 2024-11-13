import { useState, useEffect } from "react";
import { Game } from "../../../types/interfaces";
import { getChampionNameById } from "../../../utils/championUtils";

export const useChampionNames = (games: Game[] | undefined) => {
  const [championNames, setChampionNames] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (games) {
      games.forEach(async (game) => {
        const name = await getChampionNameById(game.championId);
        setChampionNames((prev) => ({
          ...prev,
          [game.championId]: name,
        }));
      });
    }
  }, [games]);

  return championNames;
};