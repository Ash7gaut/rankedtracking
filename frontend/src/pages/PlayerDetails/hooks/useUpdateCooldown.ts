import { useState, useEffect } from 'react';

const COOLDOWN_DURATION = 12000; // 2 minutes en millisecondes
const COOLDOWN_KEY = 'lastUpdateTimestamp';

export const useUpdateCooldown = () => {
  const [isOnCooldown, setIsOnCooldown] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const checkCooldown = () => {
      const lastUpdate = localStorage.getItem(COOLDOWN_KEY);
      if (!lastUpdate) {
        setIsOnCooldown(false);
        return;
      }

      const elapsed = Date.now() - parseInt(lastUpdate);
      if (elapsed < COOLDOWN_DURATION) {
        setIsOnCooldown(true);
        setRemainingTime(Math.ceil((COOLDOWN_DURATION - elapsed) / 1000));
      } else {
        setIsOnCooldown(false);
        setRemainingTime(0);
      }
    };

    // Vérifier le cooldown immédiatement
    checkCooldown();

    // Mettre à jour le timer chaque seconde
    const interval = setInterval(() => {
      checkCooldown();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startCooldown = () => {
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
    setIsOnCooldown(true);
    setRemainingTime(COOLDOWN_DURATION / 1000);
  };

  return {
    isOnCooldown,
    remainingTime,
    startCooldown
  };
};