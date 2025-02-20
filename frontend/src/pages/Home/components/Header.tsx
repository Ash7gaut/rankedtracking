import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import { Session } from "@supabase/supabase-js";
import { AccountMenu } from "../../../components/AccountMenu";
import { Refresh } from "@mui/icons-material";

interface HeaderProps {
  title: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header = ({ title, onRefresh, isRefreshing }: HeaderProps) => {
  const navigate = useNavigate();
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {title}
            </h1>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-full transition-all duration-300 ${
                isRefreshing
                  ? "bg-blue-100 dark:bg-blue-900/30 cursor-not-allowed"
                  : "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 hover:shadow-md"
              }`}
            >
              <Refresh
                className={`w-5 h-5 text-blue-600 dark:text-blue-400 ${
                  isRefreshing
                    ? "animate-spin"
                    : "transform hover:rotate-180 transition-transform duration-500"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <AccountMenu session={session} />
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
