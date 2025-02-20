import { Player } from "frontend/src/types/interfaces";
import { LinkedAccountsView } from "../../../Profile/components/LinkedAccountsView";

interface PlayerProfileProps {
  player: Player;
}

export const PlayerProfile = ({ player }: PlayerProfileProps) => {
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
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {player.summoner_name}
          </h1>
          {player.tier && (
            <div className="mt-2 flex items-center gap-3">
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium text-sm">
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
