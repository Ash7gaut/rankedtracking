import { useState } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;
      if (!user) throw new Error("Erreur de connexion");
      navigate("/");
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (registerPassword !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
      });

      if (error) throw error;
      if (!user) throw new Error("Erreur lors de l'inscription");

      const { error: insertError } = await supabase.from("usernames").insert({
        user_id: user.id,
        email: registerEmail.toLowerCase(),
        username: null,
      });

      if (insertError) {
        console.error(
          "Erreur lors de l'insertion dans usernames:",
          insertError
        );
        throw insertError;
      }

      setSuccessMessage("Compte créé avec succès !");
      navigate("/");
    } catch (error: any) {
      console.error("Erreur complète:", error);
      if (error.message.includes("duplicate")) {
        setErrorMessage("Cet email est déjà utilisé");
      } else {
        setErrorMessage(
          error.message || "Une erreur est survenue lors de l'inscription"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-row items-center justify-center gap-32 relative">
      <div className="absolute h-[600px] w-px bg-gray-200 dark:bg-gray-700"></div>

      <div className="h-[600px] flex items-center">
        <form
          onSubmit={handleLogin}
          className="space-y-4 w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Connexion
          </h1>

          {errorMessage && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 text-sm">
              {errorMessage}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Chargement..." : "Se connecter"}
          </button>
        </form>
      </div>

      <div className="h-[600px] flex items-center">
        <form
          onSubmit={handleRegister}
          className="space-y-4 w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Inscription
          </h1>

          {errorMessage && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-200 text-sm">
              {successMessage}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Chargement..." : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
}
