import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";
import { AddPlayerForm } from "../Home/components/AddPlayerForm/AddPlayerForm";
import { api } from "../../utils/api";
import { LinkedAccounts, LinkedAccount } from "./components/LinkedAccounts";
import { BackgroundSelector } from "./components/BackgroundSelector";

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
  const [isBackgroundSelectorOpen, setIsBackgroundSelectorOpen] =
    useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const navigate = useNavigate();

  const loadProfileData = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      setEmail(session.user.email || "");

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

      if (userData?.username) {
        const { data: linkedAccountsData, error: linkedError } = await supabase
          .from("players")
          .select("*")
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
  }, [navigate]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

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
      if (!session) throw new Error("Session non trouvée");

      // 1. Vérifier si l'entrée existe dans usernames
      const { data: existingUser } = await supabase
        .from("usernames")
        .select()
        .eq("user_id", session.user.id)
        .single();

      // 2. Update ou Upsert selon le cas dans usernames
      const { error: updateError } = await supabase
        .from("usernames")
        [existingUser ? "update" : "upsert"]({
          user_id: session.user.id,
          username: username,
          email: session.user.email,
          role: userRole,
        })
        .eq("user_id", session.user.id);

      if (updateError) throw updateError;

      // 3. Mettre à jour le player_name dans la table players si l'ancien username existe
      if (existingUser?.username) {
        const { error: playersError } = await supabase
          .from("players")
          .update({ player_name: username })
          .eq("player_name", existingUser.username);

        if (playersError) throw playersError;
      }

      setSuccessMessage("Profil mis à jour !");
    } catch (error: any) {
      console.error("Erreur:", error);
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
        await api.deletePlayer(accountToDelete);
        await loadProfileData();
        setSuccessMessage("Compte supprimé avec succès");
      } catch (error: any) {
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

  // Charger le fond au chargement du profil
  useEffect(() => {
    const loadBackground = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("usernames")
          .select("background_url")
          .eq("user_id", session.user.id)
          .single();

        if (data?.background_url) {
          setBackgroundUrl(data.background_url);
        }
      }
    };
    loadBackground();
  }, []);

  const handleBackgroundSelect = async (url: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("usernames")
        .update({ background_url: url })
        .eq("user_id", session.user.id);

      if (error) throw error;

      setBackgroundUrl(url);
      setIsBackgroundSelectorOpen(false);
      setSuccessMessage("Fond de profil mis à jour !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du fond:", error);
      setErrorMessage("Erreur lors de la mise à jour du fond");
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto p-6">
      {/* Messages de succès/erreur */}
      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {/* Fond avec overlay */}
      {backgroundUrl && (
        <div className="fixed inset-0 -z-10">
          <img
            src={backgroundUrl}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* En-tête avec les boutons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          ← Retour
        </button>

        <button
          onClick={() => setIsBackgroundSelectorOpen(true)}
          className="px-4 py-2 text-sm bg-gray-100/10 backdrop-blur-sm text-white rounded-lg hover:bg-gray-100/20 transition-colors"
        >
          Changer le fond
        </button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profil
        </h1>
      </div>

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

        {linkedAccounts.length > 0 && (
          <LinkedAccounts
            accounts={linkedAccounts}
            username={username}
            onDelete={handleDelete}
            onRefresh={loadProfileData}
          />
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

      {/* Dialog du sélecteur de fond */}
      <BackgroundSelector
        isOpen={isBackgroundSelectorOpen}
        onClose={() => setIsBackgroundSelectorOpen(false)}
        onSelect={handleBackgroundSelect}
      />
    </div>
  );
};

export default Profile;
