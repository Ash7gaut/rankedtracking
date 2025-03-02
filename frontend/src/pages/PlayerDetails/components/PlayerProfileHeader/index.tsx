import { Player } from "frontend/src/types/interfaces";
import { LinkedAccountsView } from "../../../Profile/components/LinkedAccountsView";
import { Link } from "react-router-dom";
import { Person } from "@mui/icons-material";

interface PlayerProfileHeaderProps {
  player: Player;
}

export const PlayerProfileHeader = ({ player }: PlayerProfileHeaderProps) => {
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

  // Calcul du winrate
  const totalGames = (player.wins || 0) + (player.losses || 0);
  const winRate = totalGames > 0 ? ((player.wins || 0) / totalGames) * 100 : 0;
  const winRateFormatted = winRate.toFixed(1);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="flex items-center gap-8">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-50 group-hover:opacity-70 blur transition duration-300"></div>
          <img
            src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player.profile_icon_id}.jpg?image=e_upscale,q_auto:good,f_webp,w_auto&v=1729058249`}
            alt="Profile Icon"
            className="relative w-24 h-24 rounded-full border-2 border-white dark:border-gray-700 shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300"
          />

          {/* Badge IN GAME */}
          {player.in_game && (
            <div className="absolute -bottom-2 right-0 transition-transform duration-300 group-hover:scale-110">
              <a
                href={`https://porofessor.gg/fr/live/euw/${formatSummonerNameForUrl(
                  player.summoner_name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${getInGameBadgeColor(
                  Number(winRateFormatted)
                )} text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse shadow-lg hover:brightness-110 transition-all duration-300 backdrop-blur-sm`}
                onClick={(e) => e.stopPropagation()}
              >
                IG
              </a>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {player.summoner_name}
          </h1>
          {player.player_name && (
            <Link
              to={`/profile/${encodeURIComponent(player.player_name)}`}
              className="inline-flex items-center gap-2 mt-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <Person className="w-4 h-4" />
              {player.player_name}
            </Link>
          )}
          {player.tier && (
            <div className="mt-2 flex items-center gap-3">
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-2">
                <img
                  src={`/ranks/${player.tier.toLowerCase()}.png`}
                  alt={player.tier}
                  className="w-4 h-4"
                />
                {player.tier} {player.rank}
              </span>
              <span className="bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm">
                {player.league_points} LP
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="w-full md:w-auto">
        <LinkedAccountsView playerName={player.player_name || ""} />
      </div>
    </div>
  );
};
