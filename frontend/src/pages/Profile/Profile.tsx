import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";

interface LinkedAccount {
  summoner_name: string;
}

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const navigate = useNavigate();

  const loadProfileData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    if (email !== session.user.email) {
      setEmail(session.user.email || "");
    }

    const currentUsername = session.user.user_metadata?.username;
    if (username !== currentUsername) {
      setUsername(currentUsername || "");
    }

    if (currentUsername) {
      console.log("Recherche des comptes pour:", currentUsername);

      const { data, error } = await supabase
        .from("players")
        .select("summoner_name")
        .eq("player_name", currentUsername);

      if (error) {
        console.error("Erreur:", error);
      } else {
        if (JSON.stringify(data) !== JSON.stringify(linkedAccounts)) {
          setLinkedAccounts(data || []);
        }
      }
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

      if (!username.trim()) {
        setErrorMessage("Le pseudo ne peut pas être vide");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session non trouvée");
      }

      // 1. D'abord, supprimer l'ancien pseudo de la table usernames
      const { error: deleteError } = await supabase
        .from("usernames")
        .delete()
        .eq("user_id", session.user.id);

      if (deleteError) {
        console.error(
          "Erreur lors de la suppression de l'ancien pseudo:",
          deleteError
        );
        throw deleteError;
      }

      // 2. Vérifier si le nouveau pseudo est disponible
      const { data: existingUsername } = await supabase
        .from("usernames")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUsername) {
        setErrorMessage("Ce pseudo est déjà pris !");
        return;
      }

      // 3. Mettre à jour les métadonnées de l'utilisateur
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          username: username,
          full_name: username,
          name: username,
        },
      });

      if (userError) throw userError;

      // 4. Insérer le nouveau pseudo
      const { error: insertError } = await supabase.from("usernames").insert({
        username: username,
        user_id: session.user.id,
      });

      if (insertError) {
        console.error(
          "Erreur lors de l'insertion du nouveau pseudo:",
          insertError
        );
        throw insertError;
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

  return (
    <div className="max-w-2xl mx-auto p-4">
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

      <form onSubmit={updateProfile} className="space-y-6">
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

          {linkedAccounts.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Comptes LoL liés :
              </p>
              {linkedAccounts.map((account, index) => (
                <div
                  key={index}
                  className="pl-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-white"
                >
                  {account.summoner_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
