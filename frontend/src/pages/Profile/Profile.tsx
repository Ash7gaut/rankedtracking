import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      setEmail(session.user.email || "");
      setUsername(session.user.user_metadata?.username || "");
    };

    getProfile();
  }, [navigate]);

  const checkUsername = async (username: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return false;

    const { data } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("username", username)
      .neq("user_id", session.user.id)
      .single();

    return data ? true : false;
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setLoading(true);

      if (!username.trim()) {
        setErrorMessage("Le pseudo ne peut pas être vide");
        return;
      }

      const isUsernameTaken = await checkUsername(username);
      if (isUsernameTaken) {
        setErrorMessage("Ce pseudo est déjà pris !");
        return;
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          username: username,
          full_name: username,
          name: username,
        },
      });

      if (error) throw error;

      setSuccessMessage("Données mises à jour !");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error: any) {
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
