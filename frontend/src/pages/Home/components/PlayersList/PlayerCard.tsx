import { useNavigate } from "react-router-dom";
import { Player } from "frontend/src/types/interfaces";

interface PlayerCardProps {
  player: Player;
  rank?: number;
  isFirst?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  rank,
  isFirst,
}) => {
  const navigate = useNavigate();

  // Calcul du winrate modifié
  const winRate = (() => {
    if (!player.wins && !player.losses) return "0";
    if (player.wins && !player.losses) return "100";
    if (player.wins && player.losses) {
      return ((player.wins / (player.wins + player.losses)) * 100).toFixed(1);
    }
    return "0";
  })();

  const isNegativeWinrate = Number(winRate) < 50;

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

  return (
    <div className="relative">
      {rank && rank <= 3 && (
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 ${getBadgeColor(
            rank
          )} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg z-20`}
          style={{
            top: isFirst ? "-1.5rem" : "-1rem",
          }}
        >
          {rank}
        </div>
      )}

      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
        onClick={() => navigate(`/player/${player.id}`)}
      >
        {player.tier && (
          <div className="absolute inset-0 flex items-center justify-center opacity-15">
            <img
              src={`/ranks/${player.tier.toLowerCase()}.png`}
              alt={player.tier}
              className="w-72 h-72 object-contain"
            />
          </div>
        )}

        <div className="relative z-10 flex gap-6">
          <div className="flex-shrink-0">
            <img
              src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player.profile_icon_id}.jpg?image=e_upscale,q_auto:good,f_webp,w_auto&v=1729058249`}
              alt="Profile Icon"
              className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-600"
            />
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              {player.summoner_name}
              {isNegativeWinrate && <span title="Winrate négatif">💩</span>}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-700 dark:text-gray-200"></span>{" "}
                {player.tier} {player.rank}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-700 dark:text-gray-200"></span>{" "}
                {player.league_points} LP
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  W/L :
                </span>{" "}
                {player.wins}/{player.losses}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-700 dark:text-gray-200"></span>{" "}
                {winRate}% WR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
