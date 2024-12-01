import { useState } from "react";
import { supabase } from "../../../utils/supabase";

export interface LinkedAccount {
  id: number;
  summoner_name: string;
  profile_icon_id: number;
  tier?: string;
  rank?: string;
  league_points?: number;
  is_main: boolean;
}

interface LinkedAccountsProps {
  accounts: LinkedAccount[];
  username: string;
  onDelete: (summonerName: string) => void;
  onRefresh: () => void;
}

export const LinkedAccounts = ({
  accounts,
  username,
  onDelete,
  onRefresh,
}: LinkedAccountsProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSetMain = async (
    summonerName: string,
    currentIsMain: boolean
  ) => {
    try {
      if (currentIsMain) {
        const { error } = await supabase
          .from("players")
          .update({ is_main: false })
          .eq("summoner_name", summonerName)
          .eq("player_name", username);

        if (error) throw error;
      } else {
        const { error: error1 } = await supabase
          .from("players")
          .update({ is_main: false })
          .eq("player_name", username);

        if (error1) throw error1;

        const { error: error2 } = await supabase
          .from("players")
          .update({ is_main: true })
          .eq("summoner_name", summonerName)
          .eq("player_name", username);

        if (error2) throw error2;
      }

      setOpenMenuId(null);
      onRefresh();
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMessage("Erreur lors de la mise à jour du compte principal");
    }
  };

  return (
    <div className="space-y-2">
      {errorMessage && (
        <div className="text-red-500 text-sm mb-2">{errorMessage}</div>
      )}

      {accounts.map((account) => (
        <div key={account.summoner_name} className="relative">
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 cursor-pointer 
            hover:bg-gray-50 dark:hover:bg-gray-700 transition-all
            ${account.is_main ? "border-2 border-blue-500" : ""}`}
            onClick={() =>
              setOpenMenuId(
                openMenuId === account.summoner_name
                  ? null
                  : account.summoner_name
              )
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${account.profile_icon_id}.jpg`}
                  alt="Profile Icon"
                  className="w-12 h-12 rounded-full"
                />
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
                    {account.tier
                      ? `${account.tier} ${account.rank} • ${account.league_points} LP`
                      : "UNRANKED"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(account.summoner_name);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    openMenuId === account.summoner_name ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {openMenuId === account.summoner_name && (
            <div className="absolute z-10 w-full mt-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 min-w-[200px] right-0">
                <button
                  onClick={() =>
                    handleSetMain(account.summoner_name, account.is_main)
                  }
                  className="w-full px-6 py-3 text-left text-sm text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    {account.is_main ? (
                      <>
                        <span className="text-blue-500">✓</span>
                        <span>Retirer comme compte principal</span>
                      </>
                    ) : (
                      <span>Définir comme compte principal</span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
