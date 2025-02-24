import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./utils/supabase";
import { Session } from "@supabase/supabase-js";
import Home from "./pages/Home/Home";
import Login from "./pages/Login";
import PlayerDetails from "./pages/PlayerDetails/PlayerDetails";
import AddPlayer from "./pages/AddPlayer/AddPlayer";
import Profile from "./pages/Profile/Profile";
import PlayerProfile from "./pages/PlayerProfile/PlayerProfile";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true;
  });

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

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Composant pour protéger les routes
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!session) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <div
        className={`min-h-screen transition-colors duration-200 ${
          darkMode ? "dark bg-gray-900" : "bg-gray-200"
        }`}
      >
        <div className="container mx-auto px-4 py-8 max-w-full sm:max-w-[720px] md:max-w-[860px] lg:max-w-[1100px] xl:max-w-[1400px] 2xl:max-w-[1600px]">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="fixed bottom-4 z-10 right-4 p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/player/:id" element={<PlayerDetails />} />
            <Route path="/profile/:playerName" element={<PlayerProfile />} />

            {/* Routes protégées */}
            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <AddPlayer />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
