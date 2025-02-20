import { useNavigate } from "react-router-dom";
import { Player } from "frontend/src/types/interfaces";
import { Person } from "@mui/icons-material";

interface PlayerCardProps {
  player: Player;
  rank?: number;
}

export const PlayerCard = ({ player, rank }: PlayerCardProps) => {
  const navigate = useNavigate();

  // Calcul du winrate avec vérification du nombre minimum de games et gestion des undefined
  const totalGames = (player.wins || 0) + (player.losses || 0);
  const winRate = (() => {
    if (!player.wins && !player.losses) return "0";
    if (player.wins && !player.losses) return "100";
    if (player.wins && player.losses) {
      return ((player.wins / (player.wins + player.losses)) * 100).toFixed(1);
    }
    return "0";
  })();

  const isNegativeWinrate = totalGames >= 20 && Number(winRate) < 50;

  const getBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-amber-600";
      default:
        return "";
    }
  };

  const getInGameBadgeColor = (winRate: number) => {
    if (winRate < 50) return "bg-amber-800";
    return "bg-green-500";
  };

  // Fonction pour formater le nom d'invocateur pour l'URL Porofessor
  const formatSummonerNameForUrl = (name: string) => {
    // Remplacer les espaces par %20 et # par -
    return name.replace(/ /g, "%20").replace(/#/g, "-");
  };

  return (
    <div className="relative h-[180px] group">
      {player.in_game && (
        <a
          href={`https://porofessor.gg/fr/live/euw/${formatSummonerNameForUrl(
            player.summoner_name
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`absolute top-3 right-3 ${getInGameBadgeColor(
            Number(winRate)
          )} text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse z-50 hover:brightness-110 transition-all duration-300 backdrop-blur-sm shadow-lg`}
          onClick={(e) => e.stopPropagation()}
        >
          IN GAME
        </a>
      )}

      {rank && rank <= 3 && (
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${getBadgeColor(
            rank
          )} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-xl z-20 text-sm ring-2 ring-white dark:ring-gray-800`}
          style={{ top: "0" }}
        >
          {rank}
        </div>
      )}

      <div
        className={`relative bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-5 cursor-pointer 
        hover:shadow-xl transition-all duration-300 overflow-hidden group 
        [&:hover_.icon-hover]:opacity-100 h-full 
        hover:scale-[1.02] hover:-translate-y-1
        ${
          player.in_game
            ? "border-l-4 border-green-500/70 dark:border-green-500/50"
            : "border border-gray-100 dark:border-gray-700"
        }`}
        onClick={() => navigate(`/player/${player.id}`)}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] group-hover:opacity-[0.09] transition-opacity duration-300">
          <img
            src={
              player.tier
                ? `/ranks/${player.tier.toLowerCase()}.png`
                : "/ranks/unranked.png"
            }
            alt="Rank"
            className="w-80 h-80 object-contain"
          />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex gap-5 mb-4">
            <div className="flex-shrink-0">
              <img
                src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player.profile_icon_id}.jpg?image=e_upscale,q_auto:good,f_webp,w_auto&v=1729058249`}
                alt="Profile Icon"
                className="w-16 h-16 rounded-full border-2 border-gray-200/70 dark:border-gray-600/50 shadow-md group-hover:shadow-lg transition-all duration-300"
              />
            </div>
            <div className="flex-grow min-w-0">
              <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <span className="truncate block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {player.summoner_name}
                  </span>
                </div>
                {isNegativeWinrate && (
                  <span
                    className="flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300"
                    title="Winrate négatif (20+ games)"
                  >
                    💩
                  </span>
                )}
              </h2>
              {player.player_name && (
                <a
                  href={`/profile/${encodeURIComponent(player.player_name)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/profile/${encodeURIComponent(player.player_name)}`
                    );
                  }}
                  className="inline-flex items-center gap-1 mb-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <Person className="w-4 h-4" />
                  {player.player_name}
                </a>
              )}
              <div className="text-gray-600 dark:text-gray-300 truncate flex items-center gap-2">
                <div className="bg-gray-100/70 dark:bg-gray-700/50 px-2 py-1 rounded-md flex items-center gap-2 min-w-0">
                  {player.tier ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <span>
                        {player.tier} {player.rank}
                      </span>
                    </div>
                  ) : (
                    "UNRANKED"
                  )}
                </div>
                <span className="flex-shrink-0 text-blue-600/90 dark:text-blue-400/90">
                  {player.league_points} LP
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
            <div className="text-gray-600 dark:text-gray-300 truncate bg-gray-50/50 dark:bg-gray-700/30 px-3 py-1.5 rounded-lg font-medium">
              W/L: {player.wins}/{player.losses}
            </div>
            <div
              className={`truncate text-right px-3 py-1.5 rounded-lg font-medium ${
                Number(winRate) >= 50
                  ? "text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20"
                  : "text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20"
              }`}
            >
              {winRate}% WR
            </div>
          </div>
        </div>

        <a
          href={`https://www.leagueofgraphs.com/fr/summoner/euw/${formatSummonerNameForUrl(
            player.summoner_name
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline z-20 group"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src="https://i.imgur.com/TCDG5tK.png"
            alt="League of Graphs"
            className="w-6 h-6 opacity-0 icon-hover duration-300 transform group-hover:rotate-12 transition-all"
          />
        </a>
      </div>
    </div>
  );
};
