import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";
import { AddPlayerForm } from "../Home/components/AddPlayerForm";
import { api } from "../../utils/api";

interface LinkedAccount {
  summoner_name: string;
}

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadProfileData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      setEmail(session.user.email || "");

      // Récupérer le username depuis la table usernames
      const { data: userData, error: userError } = await supabase
        .from("usernames")
        .select("username, role")
        .eq("user_id", session.user.id)
        .single();

      if (userError) {
        console.error("Erreur:", userError);
      } else {
        setUsername(userData?.username || "");
        setUserRole(userData?.role || "");
      }

      // Pour les comptes liés, utiliser le username récupéré
      if (userData?.username) {
        const { data: linkedAccountsData, error: linkedError } = await supabase
          .from("players")
          .select("summoner_name")
          .eq("player_name", userData.username);

        if (linkedError) {
          console.error("Erreur:", linkedError);
        } else {
          setLinkedAccounts(linkedAccountsData || []);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Session non trouvée");
      }

      if (!username.trim()) {
        setErrorMessage("Le pseudo ne peut pas être vide");
        return;
      }

      // 1. Récupérer l'ancien username
      const { data: oldUserData } = await supabase
        .from("usernames")
        .select("username")
        .eq("user_id", session.user.id)
        .single();

      const oldUsername = oldUserData?.username;

      // 2. Mettre à jour les métadonnées de l'utilisateur
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          username: username,
          role: userRole,
        },
      });

      if (userError) throw userError;

      // 3. Mettre à jour la table usernames
      const { error: updateError } = await supabase
        .from("usernames")
        .update({
          username: username,
          role: userRole,
        })
        .eq("user_id", session.user.id);

      if (updateError) throw updateError;

      // 4. Mettre à jour les comptes LoL liés (en utilisant l'ancien username)
      if (oldUsername) {
        const { error: playersError } = await supabase
          .from("players")
          .update({ player_name: username })
          .eq("player_name", oldUsername);

        if (playersError) {
          console.error(
            "Erreur lors de la mise à jour des comptes LoL:",
            playersError
          );
          throw playersError;
        }
      }

      setSuccessMessage("Données mises à jour !");
      await loadProfileData();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error: any) {
      console.error("Erreur complète:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (summonerName: string) => {
    setAccountToDelete(summonerName);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (accountToDelete) {
      try {
        console.log("1. Début suppression pour:", accountToDelete);
        const response = await api.deletePlayer(accountToDelete);
        console.log("2. Réponse API:", response);

        await loadProfileData();
        setSuccessMessage("Compte supprimé avec succès");
        navigate("/");
      } catch (error: any) {
        console.error("3. Erreur:", error);
        setErrorMessage(
          error.response?.data?.message ||
            "Erreur lors de la suppression du compte"
        );
      }
    }
    setShowDeleteConfirm(false);
    setAccountToDelete(null);
  };

  const handleAddPlayer = () => {
    if (linkedAccounts.length >= 5) {
      setErrorMessage("Vous ne pouvez pas ajouter plus de 5 comptes");
      return;
    }
    setIsAddPlayerOpen(true);
    setErrorMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profil
        </h1>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          ← Retour
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="text"
            value={email}
            disabled
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pseudo
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rôle
            </label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Sélectionner un rôle</option>
              <option value="TOP">Top</option>
              <option value="JUNGLE">Jungle</option>
              <option value="MID">Mid</option>
              <option value="ADC">ADC</option>
              <option value="SUPPORT">Support</option>
            </select>
          </div>
        </div>

        <button
          onClick={updateProfile}
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Comptes liés ({linkedAccounts.length}/5)
          </h2>
          <button
            onClick={handleAddPlayer}
            className={`px-4 py-2 rounded transition-colors ${
              linkedAccounts.length >= 5
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white`}
            disabled={linkedAccounts.length >= 5}
          >
            Ajouter un compte
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 text-red-500 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {linkedAccounts.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Comptes LoL liés :
            </p>
            {linkedAccounts.map((account, index) => (
              <div
                key={index}
                className="pl-4 py-2 bg-gray-50 dark:bg-gray-800 rounded text-gray-900 dark:text-white text-sm flex justify-between items-center"
              >
                <span>{account.summoner_name}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(account.summoner_name)}
                  className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
                  title="Supprimer ce compte"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {isAddPlayerOpen && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <AddPlayerForm
              onSuccess={() => {
                setIsAddPlayerOpen(false);
                loadProfileData();
                setSuccessMessage("Compte LoL ajouté avec succès !");
              }}
              defaultPlayerName={username}
            />
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Êtes-vous sûr de vouloir supprimer ce compte ?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
