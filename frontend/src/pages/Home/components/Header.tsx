import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import { Session } from "@supabase/supabase-js";
import { AccountMenu } from "../../../components/AccountMenu";

interface HeaderProps {
  title: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header = ({ title }: HeaderProps) => {
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
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        {session ? (
          <AccountMenu session={session} />
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Connexion
          </button>
        )}
      </div>
    </div>
  );
};
