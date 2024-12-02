import { useNavigate } from "react-router-dom";
import { Player } from "frontend/src/types/interfaces";

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
    <div className="relative h-[160px]">
      {player.in_game && (
        <a
          href={`https://porofessor.gg/fr/live/euw/${formatSummonerNameForUrl(
            player.summoner_name
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`absolute top-2 right-2 ${getInGameBadgeColor(
            Number(winRate)
          )} text-white px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse z-50 hover:brightness-110 transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          IN GAME
        </a>
      )}

      {rank && rank <= 3 && (
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 ${getBadgeColor(
            rank
          )} w-6 h-6 rounded-full flex items-center justify-center text-white font-bold shadow-lg z-20 text-sm`}
          style={{ top: "-0.75rem" }}
        >
          {rank}
        </div>
      )}

      <div
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group [&:hover_.icon-hover]:opacity-100 h-full ${
          player.in_game ? "border-l-4 border-green-500" : ""
        }`}
        onClick={() => navigate(`/player/${player.id}`)}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          <img
            src={
              player.tier
                ? `/ranks/${player.tier.toLowerCase()}.png`
                : "/ranks/unranked.png"
            }
            alt="Rank"
            className="w-48 h-48 object-contain"
          />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex gap-4 mb-4">
            <div className="flex-shrink-0">
              <img
                src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player.profile_icon_id}.jpg?image=e_upscale,q_auto:good,f_webp,w_auto&v=1729058249`}
                alt="Profile Icon"
                className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
              />
            </div>
            <div className="flex-grow min-w-0">
              <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2 truncate">
                <span className="truncate">{player.summoner_name}</span>
                {isNegativeWinrate && (
                  <span
                    className="flex-shrink-0"
                    title="Winrate négatif (20+ games)"
                  >
                    💩
                  </span>
                )}
              </h2>
              <div className="text-gray-600 dark:text-gray-300 truncate flex items-center gap-2">
                <span>
                  {player.tier ? (
                    <>
                      {player.tier} {player.rank}
                    </>
                  ) : (
                    "UNRANKED"
                  )}
                </span>
                <span>{player.league_points} LP</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mt-auto">
            <div className="text-gray-600 dark:text-gray-300 truncate">
              W/L: {player.wins}/{player.losses}
            </div>
            <div className="text-gray-600 dark:text-gray-300 truncate text-right">
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
          className="absolute bottom-2 right-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src="https://i.imgur.com/TCDG5tK.png"
            alt="League of Graphs"
            className="w-6 h-6 opacity-0 icon-hover duration-300"
          />
        </a>
      </div>
    </div>
  );
};
