import React from "react";

const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
      {/* Blob violet */}
      <div
        className="absolute top-[-20%] right-[-15%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-r from-purple-700/30 to-indigo-600/30 blur-[150px] animate-pulse"
        style={{ animationDuration: "8s" }}
      ></div>

      {/* Blob bleu */}
      <div
        className="absolute top-[60%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-400/20 blur-[130px] animate-pulse"
        style={{ animationDuration: "10s" }}
      ></div>

      {/* Blob rose/violet */}
      <div
        className="absolute top-[30%] right-[5%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/20 blur-[120px] animate-pulse"
        style={{ animationDuration: "12s" }}
      ></div>
    </div>
  );
};

export default BackgroundBlobs;
