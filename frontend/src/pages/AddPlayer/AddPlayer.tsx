import { AddPlayerForm } from "../Home/components/AddPlayerForm";
import { useNavigate } from "react-router-dom";

export const AddPlayer = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ajouter un joueur
        </h1>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Retour
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <AddPlayerForm />
      </div>
    </div>
  );
};

export default AddPlayer;
