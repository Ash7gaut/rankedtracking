import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { supabase } from "./utils/supabase";
import { Session } from "@supabase/supabase-js";
import Home from "./pages/Home/Home";
import Login from "./pages/Login";
import PlayerDetails from "./pages/PlayerDetails/PlayerDetails";
import AddPlayer from "./pages/AddPlayer/AddPlayer";
import Profile from "./pages/Profile/Profile";
import PlayerProfile from "./pages/PlayerProfile/PlayerProfile";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/PageTransition";
import LandingPage from "./pages/LandingPage/LandingPage";
import PlayerProfiles from "./pages/PlayerProfiles/PlayerProfiles";
import LPTracking from "./pages/LPTracking/LPTracking";
import BackgroundBlobs from "./components/BackgroundBlobs";
import ParticlesBackground from "./components/ParticlesBackground";
import ScrollToTop from "./components/ScrollToTop";

// Composant pour gérer les transitions entre les routes
const AnimatedRoutes = () => {
  const location = useLocation();
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

  // Composant pour protéger les routes
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!session) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <AnimatePresence mode="wait">
      <ScrollToTop />
      <Routes location={location} key={location.pathname}>
        {/* Routes publiques */}
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          }
        />
        <Route
          path="/home"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/player/:id"
          element={
            <PageTransition>
              <PlayerDetails />
            </PageTransition>
          }
        />
        <Route
          path="/profile/:playerName"
          element={
            <PageTransition>
              <PlayerProfile />
            </PageTransition>
          }
        />
        <Route
          path="/players"
          element={
            <PageTransition>
              <PlayerProfiles />
            </PageTransition>
          }
        />
        <Route
          path="/lp-tracking"
          element={
            <PageTransition>
              <LPTracking />
            </PageTransition>
          }
        />

        {/* Routes protégées */}
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <PageTransition>
                <AddPlayer />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PageTransition>
              <Profile />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true;
  });

  const [animationMode, setAnimationMode] = useState(() => {
    const saved = localStorage.getItem("animationMode");
    return saved ? JSON.parse(saved) : "blobs"; // Valeurs possibles: "blobs", "particles", "both", "none"
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("animationMode", JSON.stringify(animationMode));
  }, [animationMode]);

  const cycleAnimationMode = () => {
    const modes = ["blobs", "particles", "both", "none"];
    const currentIndex = modes.indexOf(animationMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setAnimationMode(modes[nextIndex]);
  };

  const getAnimationIcon = () => {
    switch (animationMode) {
      case "blobs":
        return "🔵";
      case "particles":
        return "✨";
      case "both":
        return "🌈";
      case "none":
        return "🔄";
      default:
        return "🔵";
    }
  };

  return (
    <BrowserRouter>
      <div
        className={`min-h-screen transition-colors duration-200 ${
          darkMode ? "dark bg-gray-900" : "bg-gray-200"
        }`}
      >
        {(animationMode === "blobs" || animationMode === "both") && (
          <BackgroundBlobs />
        )}
        {(animationMode === "particles" || animationMode === "both") && (
          <ParticlesBackground />
        )}

        <div className="container mx-auto px-4 py-8 max-w-full sm:max-w-[720px] md:max-w-[860px] lg:max-w-[1100px] xl:max-w-[1400px] 2xl:max-w-[1600px]">
          <div className="fixed bottom-4 z-10 right-4 flex flex-col gap-3">
            <button
              onClick={cycleAnimationMode}
              className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="Changer l'animation d'arrière-plan"
            >
              {getAnimationIcon()}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="Changer le mode clair/sombre"
            >
              {darkMode ? "🌞" : "🌙"}
            </button>
          </div>
          <AnimatedRoutes />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
