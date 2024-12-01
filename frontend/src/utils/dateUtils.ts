export const formatTimeAgo = (timestamp: number): string => {
  const now = new Date().getTime();
  const diff = now - timestamp;

  // Conversion en minutes/heures/jours
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  }
  
  if (hours > 0) {
    return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }
  
  if (minutes > 0) {
    return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  return 'à l\'instant';
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}; 