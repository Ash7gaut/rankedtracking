import { Star } from "@mui/icons-material";
import { Player } from "../../../../types/interfaces";

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function PlayerCard({
  player,
  isSelected = false,
  onClick,
}: PlayerCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
            <img
              src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${player.profile_icon_id}.jpg`}
              alt={`${player.summoner_name}'s profile icon`}
              className="w-full h-full object-cover"
            />
          </div>
          {player.is_main && (
            <div className="absolute -top-1 -right-1">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {player.summoner_name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {player.tier && player.rank && (
              <div className="flex items-center gap-1.5">
                <img
                  src={`/ranked-emblems/${player.tier.toLowerCase()}.png`}
                  alt={player.tier}
                  className="w-5 h-5"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {player.tier} {player.rank}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
