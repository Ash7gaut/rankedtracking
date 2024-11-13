import { useState, useEffect } from 'react';

export const useRefreshTimer = (dataUpdatedAt: number) => {
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(900);

  useEffect(() => {
    // Réinitialiser le timer quand les données sont mises à jour
    setSecondsUntilRefresh(900);
  }, [dataUpdatedAt]);

  useEffect(() => {
    // Timer uniquement pour l'affichage
    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return secondsUntilRefresh;
};