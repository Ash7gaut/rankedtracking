import { useState, useEffect, useCallback } from "react";
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const linkDiscordAccount = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: `${window.location.origin}/profile`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de la liaison avec Discord:", error);
      setErrorMessage("Erreur lors de la liaison avec Discord");
    }
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
          onClick={linkDiscordAccount}
          className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] text-white rounded hover:bg-[#4752C4]"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 71 55"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
              fill="#ffffff"
            />
          </svg>
          Lier compte Discord
        </button>

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
