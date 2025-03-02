import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { useNavigate, useParams } from "react-router-dom";

interface LinkedAccountsViewProps {
  playerName: string;
}

export const LinkedAccountsView = ({ playerName }: LinkedAccountsViewProps) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem("linkedAccountsExpanded");
    return stored ? JSON.parse(stored) : true;
  });
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fonction pour formater le nom d'invocateur pour l'URL Porofessor
  const formatSummonerNameForUrl = (name: string) => {
    // Remplacer les espaces par %20 et # par -
    return name.replace(/ /g, "%20").replace(/#/g, "-");
  };

  // Fonction pour déterminer la couleur du badge IN GAME
  const getInGameBadgeColor = (winRate: number) => {
    if (winRate < 50) return "bg-amber-800";
    return "bg-green-500";
  };

  useEffect(() => {
    localStorage.setItem("linkedAccountsExpanded", JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("player_name", playerName)
        .order("is_main", { ascending: false });

      if (error) {
        console.error("Erreur:", error);
      } else {
        setAccounts(data || []);
      }
      setLoading(false);
    };

    fetchLinkedAccounts();
  }, [playerName]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  const handleAccountClick = (accountId: string) => {
    navigate(`/player/${accountId}`);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={toggleMenu}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {playerName}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({accounts.length} compte{accounts.length > 1 ? "s" : ""})
          </span>
          {accounts.length > 1 && (
            <span className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">
              {isOpen ? "▼" : "▲"}
            </span>
          )}
        </div>
      </div>
      <div
        className={`space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {accounts.map((account) => {
          // Calcul du winrate pour chaque compte
          const totalGames = (account.wins || 0) + (account.losses || 0);
          const winRate =
            totalGames > 0 ? ((account.wins || 0) / totalGames) * 100 : 0;

          return (
            <div
              key={account.summoner_name}
              className={`relative cursor-pointer rounded-lg
                ${account.id.toString() === id ? "p-0.5 bg-blue-500" : "p-0"}`}
              onClick={() => handleAccountClick(account.id.toString())}
            >
              <div
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4
                hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                ${
                  account.in_game
                    ? "border-l-4 border-green-500/70 dark:border-green-500/50"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${account.profile_icon_id}.jpg`}
                      alt="Profile Icon"
                      className="w-12 h-12 rounded-full"
                    />

                    {/* Badge IN GAME */}
                    {account.in_game && (
                      <div className="absolute -bottom-2 -right-2">
                        <a
                          href={`https://porofessor.gg/fr/live/euw/${formatSummonerNameForUrl(
                            account.summoner_name
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${getInGameBadgeColor(
                            winRate
                          )} text-white px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse shadow-lg hover:brightness-110 transition-all duration-300 backdrop-blur-sm`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          IG
                        </a>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium dark:text-white">
                        {account.summoner_name}
                      </p>
                      {account.is_main && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          Main
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {account.tier ? (
                        <span className="flex items-center gap-2">
                          <img
                            src={`/ranks/${account.tier.toLowerCase()}.png`}
                            alt={account.tier}
                            className="w-4 h-4"
                          />
                          {account.tier} {account.rank} •{" "}
                          {account.league_points} LP
                        </span>
                      ) : (
                        "UNRANKED"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
