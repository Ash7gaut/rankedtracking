import React from "react";
import Auth from "../../components/Auth";
import BackgroundBlobs from "../../components/BackgroundBlobs";

const Login = () => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Fond avec blobs */}
      <BackgroundBlobs />

      {/* Contenu */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-16 pb-8 px-4">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              LoL Stats Tracker
            </span>
          </h1>
          <p className="text-white/70 max-w-md mx-auto">
            Suivez vos performances et progressez dans League of Legends
          </p>
        </div>
        <Auth />
      </div>
    </div>
  );
};

export default Login;
