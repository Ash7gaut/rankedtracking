import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdateCooldown } from "frontend/src/pages/PlayerDetails/hooks/useUpdateCooldown";
import { supabase } from "../../../utils/supabase";
import { Session } from "@supabase/supabase-js";
import { AccountMenu } from "../../../components/AccountMenu";

interface HeaderProps {
  title: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header = ({ title, onRefresh, isRefreshing }: HeaderProps) => {
  const navigate = useNavigate();
  const { isOnCooldown, remainingTime, startCooldown } = useUpdateCooldown();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
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

  const handleRefresh = async () => {
    if (isOnCooldown) return;
    await onRefresh();
    startCooldown();
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <button
              onClick={() => navigate("/add")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Ajouter un joueur
            </button>
            <AccountMenu session={session} />
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Connexion
          </button>
        )}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isOnCooldown}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRefreshing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Actualisation...
            </>
          ) : isOnCooldown ? (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {`${Math.floor(remainingTime / 60)}:${(remainingTime % 60)
                .toString()
                .padStart(2, "0")}`}
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualiser
            </>
          )}
        </button>
      </div>
    </div>
  );
};
