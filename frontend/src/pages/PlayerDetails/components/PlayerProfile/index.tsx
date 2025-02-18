import { Player } from "frontend/src/types/interfaces";
import { LinkedAccountsView } from "../../../Profile/components/LinkedAccountsView";

interface PlayerProfileProps {
  player: Player;
}

export const PlayerProfile = ({ player }: PlayerProfileProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-6">
        <img
          src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player.profile_icon_id}.jpg?image=e_upscale,q_auto:good,f_webp,w_auto&v=1729058249`}
          alt="Profile Icon"
          className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-600"
        />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {player.summoner_name}
        </h1>
      </div>
      <div className="w-full md:w-auto">
        <LinkedAccountsView playerName={player.player_name || ""} />
      </div>
    </div>
  );
};
