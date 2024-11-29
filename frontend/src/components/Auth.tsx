import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      setLoading(true);

      if (isLogin) {
        // Login
        const {
          data: { user },
          error,
        } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        // Affichons les détails de l'erreur si elle existe
        if (error) {
          console.log("Erreur de connexion:", error);
          throw new Error(error.message);
        }

        if (!user) throw new Error("Erreur de connexion");

        console.log("Utilisateur connecté:", user);

        // Vérifier si l'utilisateur est approuvé
        const { data: approvalData, error: approvalError } = await supabase
          .from("user_approvals")
          .select("is_approved")
          .eq("user_id", user.id)
          .single();

        console.log("Données d'approbation:", approvalData);
        console.log("Erreur d'approbation:", approvalError);

        if (approvalError && approvalError.code !== "PGRST116") {
          console.log(
            "Erreur lors de la vérification de l'approbation:",
            approvalError
          );
          throw approvalError;
        }

        if (!approvalData?.is_approved) {
          await supabase.auth.signOut();
          setErrorMessage(
            "Votre compte est en attente d'approbation par un administrateur. Vous recevrez un email une fois votre compte approuvé."
          );
          return;
        }

        navigate("/");
      } else {
        // Inscription
        const {
          data: { user },
          error,
        } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.log("Erreur d'inscription:", error);
          throw error;
        }

        if (!user) throw new Error("Erreur lors de l'inscription");

        // Créer une entrée dans user_approvals
        const { error: approvalError } = await supabase
          .from("user_approvals")
          .insert([{ user_id: user.id }]);

        if (approvalError) {
          console.log(
            "Erreur lors de la création de l'approbation:",
            approvalError
          );
          throw approvalError;
        }

        alert(
          "Inscription réussie ! Votre compte est en attente d'approbation par un administrateur."
        );
        setIsLogin(true);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {isLogin ? "Connexion" : "Inscription"}
        </h1>

        {errorMessage && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 text-sm">
            {errorMessage}
          </div>
        )}

        {!isLogin && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Après inscription, un administrateur devra approuver votre compte.
          </p>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setErrorMessage("");
          }}
          className="w-full text-sm text-blue-500 hover:text-blue-600"
        >
          {isLogin
            ? "Pas encore de compte ? S'inscrire"
            : "Déjà un compte ? Se connecter"}
        </button>
      </form>
    </div>
  );
}
