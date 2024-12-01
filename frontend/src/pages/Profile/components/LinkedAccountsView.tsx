import { useEffect, useState } from "react";
import { LinkedAccount } from "./LinkedAccounts";
import { supabase } from "../../../utils/supabase";

interface LinkedAccountsViewProps {
  playerName: string;
}

export const LinkedAccountsView = ({ playerName }: LinkedAccountsViewProps) => {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {playerName}
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({accounts.length} compte{accounts.length > 1 ? "s" : ""})
        </span>
      </div>
      <div className="space-y-2">
        {accounts.map((account) => (
          <div key={account.summoner_name} className="relative">
            <div
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4
              ${account.is_main ? "border-2 border-blue-500" : ""}`}
            >
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
