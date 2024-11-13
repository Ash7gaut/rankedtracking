import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/index";
import PlayerDetails from "./pages/PlayerDetails/index";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Récupérer la préférence sauvegardée ou utiliser la préférence système
    const saved = localStorage.getItem("darkMode");
    return saved
      ? JSON.parse(saved)
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Sauvegarder la préférence
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    // Appliquer la classe dark au HTML
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <BrowserRouter>
      <div
        className={`min-h-screen transition-colors duration-200 ${
          darkMode ? "dark bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/player/:id" element={<PlayerDetails />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
