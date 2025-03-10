import React, { useState, useEffect } from "react";

const BackgroundBlobs = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Fonction pour suivre la position de la souris
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener("mousemove", handleMouseMove);

    // Nettoyer l'écouteur
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Calculer les décalages en fonction de la position de la souris
  const blueOffset = {
    x: mousePosition.x * 3,
    y: mousePosition.y * -3,
  };

  const violetOffset = {
    x: mousePosition.x * -4,
    y: mousePosition.y * 4,
  };

  const redOffset = {
    x: mousePosition.x * 3,
    y: mousePosition.y * 3,
  };

  const yellowOffset = {
    x: mousePosition.x * -4,
    y: mousePosition.y * -4,
  };

  return (
    <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
      {/* Blob bleu - dominant, position haute */}
      <div
        className="absolute transition-transform duration-2000 ease-out top-[-10%] right-[10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-r from-blue-800/25 to-blue-600/15 blur-[170px] animate-pulse"
        style={{
          animationDuration: "18s",
          transform: `translate(${blueOffset.x}%, ${blueOffset.y}%)`,
        }}
      ></div>

      {/* Blob violet - dominant, position basse */}
      <div
        className="absolute transition-transform duration-2000 ease-out bottom-[-5%] left-[0%] w-[75vw] h-[75vw] rounded-full bg-gradient-to-r from-violet-900/30 to-purple-700/20 blur-[160px] animate-pulse"
        style={{
          animationDuration: "20s",
          transform: `translate(${violetOffset.x}%, ${violetOffset.y}%)`,
        }}
      ></div>

      {/* Blob rouge - accent, plus petit */}
      <div
        className="absolute transition-transform duration-2000 ease-out top-[15%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-r from-red-700/20 to-pink-600/15 blur-[140px] animate-pulse"
        style={{
          animationDuration: "22s",
          transform: `translate(${redOffset.x}%, ${redOffset.y}%)`,
        }}
      ></div>

      {/* Blob jaune - accent, plus petit */}
      <div
        className="absolute transition-transform duration-2000 ease-out bottom-[10%] right-[15%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-400/15 blur-[130px] animate-pulse"
        style={{
          animationDuration: "25s",
          transform: `translate(${yellowOffset.x}%, ${yellowOffset.y}%)`,
        }}
      ></div>
    </div>
  );
};

export default BackgroundBlobs;
