import { useState, useEffect, KeyboardEvent, useRef } from "react";
import { getAllChampions, getSkinsByChampion } from "../../../data/backgrounds";

interface BackgroundSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export const BackgroundSelector = ({
  isOpen,
  onClose,
  onSelect,
}: BackgroundSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChampion, setSelectedChampion] = useState<string>("");
  const [preloadedSkins, setPreloadedSkins] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Obtenir la liste des champions
  const champions = getAllChampions();

  // Précharger les 10 premiers skins au chargement
  useEffect(() => {
    const firstChampion = champions[0];
    if (firstChampion) {
      const firstChampionSkins = getSkinsByChampion(firstChampion).slice(0, 10);
      setPreloadedSkins(firstChampionSkins);
    }
  }, [champions]);

  // Gérer les clics en dehors du modal
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Gérer la recherche quand on appuie sur Entrée
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm) {
      const matchedChampion = champions.find(
        (champion) => champion.toLowerCase() === searchTerm.toLowerCase()
      );
      if (matchedChampion) {
        setSelectedChampion(matchedChampion);
        setSearchTerm("");
      }
    }
  };

  // Récupérer les skins du champion sélectionné ou afficher les skins préchargés
  const skins = selectedChampion
    ? getSkinsByChampion(selectedChampion)
    : preloadedSkins;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] overflow-y-auto"
      onClick={handleOutsideClick}
    >
      <div className="fixed inset-0 bg-black/50" />

      <div className="relative min-h-full flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg p-6"
        >
          <div className="flex flex-col gap-4 mb-4">
            {/* Barre de recherche des champions */}
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Entrez le nom d'un champion et appuyez sur Entrée..."
                className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={onClose}
                className="ml-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {skins.map((url, index) => (
              <div
                key={index}
                className="relative cursor-pointer group"
                onClick={() => onSelect(url)}
              >
                <img
                  src={url}
                  alt={`Skin ${index + 1} ${
                    selectedChampion ? `de ${selectedChampion}` : ""
                  }`}
                  className="w-full h-40 object-cover rounded transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
