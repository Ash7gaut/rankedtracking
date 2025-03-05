import { AddPlayerForm } from "../Home/components/AddPlayerForm/AddPlayerForm";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

export const AddPlayer = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Ajouter un joueur
          </h1>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all"
          >
            <ArrowBack className="w-5 h-5" />
            <span>Retour</span>
          </button>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
          <AddPlayerForm />
        </div>
      </div>
    </div>
  );
};

export default AddPlayer;
