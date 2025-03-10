import React, { useState, useEffect } from "react";

const BackgroundBlobs = () => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur préfère les animations réduites
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  // Réduire la qualité des blobs pour les appareils à faible performance
  const blurAmount = isReducedMotion
    ? ["blur-[100px]", "blur-[90px]", "blur-[80px]", "blur-[70px]"]
    : ["blur-[170px]", "blur-[160px]", "blur-[140px]", "blur-[130px]"];

  return (
    <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
      {/* Blob bleu - dominant, position haute */}
      <div
        className={`absolute top-[-10%] right-[10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-r from-blue-800/25 to-blue-600/15 ${
          blurAmount[0]
        } ${isReducedMotion ? "" : "animate-pulse"}`}
        style={{
          animationDuration: "18s",
        }}
      ></div>

      {/* Blob violet - dominant, position basse */}
      <div
        className={`absolute bottom-[-5%] left-[0%] w-[75vw] h-[75vw] rounded-full bg-gradient-to-r from-violet-900/30 to-purple-700/20 ${
          blurAmount[1]
        } ${isReducedMotion ? "" : "animate-pulse"}`}
        style={{
          animationDuration: "20s",
        }}
      ></div>

      {/* Blob rouge - accent, plus petit */}
      <div
        className={`absolute top-[15%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-r from-red-700/20 to-pink-600/15 ${
          blurAmount[2]
        } ${isReducedMotion ? "" : "animate-pulse"}`}
        style={{
          animationDuration: "22s",
        }}
      ></div>

      {/* Blob jaune - accent, plus petit */}
      <div
        className={`absolute bottom-[10%] right-[0%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-400/15 ${
          blurAmount[3]
        } ${isReducedMotion ? "" : "animate-pulse"}`}
        style={{
          animationDuration: "25s",
        }}
      ></div>
    </div>
  );
};

export default BackgroundBlobs;
