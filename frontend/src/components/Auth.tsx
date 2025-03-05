import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.provider_token === "discord") {
        try {
          const { error: usernamesError } = await supabase
            .from("usernames")
            .upsert({
              user_id: session.user.id,
              username:
                session.user.user_metadata.full_name ||
                session.user.user_metadata.name,
              email: session.user.email,
              role: null,
            })
            .select()
            .single();

          if (usernamesError) {
            console.error(
              "Erreur lors de la création de l'entrée username:",
              usernamesError
            );
          }
        } catch (error) {
          console.error(
            "Erreur lors de la création de l'entrée username:",
            error
          );
        }
      }
    });

    // Cleanup de l'event listener
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const handleDiscordLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Erreur connexion Discord:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl text-white">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setMode("login")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === "login"
                ? "bg-blue-500/80 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setMode("register")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === "register"
                ? "bg-blue-500/80 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            Inscription
          </button>
        </div>

        {mode === "login" ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Connexion
              </h1>

              {errorMessage && (
                <div className="p-3 rounded-md bg-red-500/20 text-red-200 text-sm border border-red-500/30">
                  {errorMessage}
                </div>
              )}

              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:border-blue-500/50"
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:border-blue-500/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-white bg-blue-500/80 hover:bg-blue-600/80 rounded-lg focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Chargement..." : "Se connecter"}
              </button>
            </form>

            <div className="pt-4 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-white/60 bg-white/5 backdrop-blur-sm">
                    Ou continuer avec
                  </span>
                </div>
              </div>

              <button
                onClick={handleDiscordLogin}
                disabled={loading}
                className="w-full px-4 py-2 flex items-center justify-center gap-2 text-white bg-indigo-600/80 hover:bg-indigo-700/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
                </svg>
                <span>Connexion avec Discord</span>
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Inscription
            </h1>

            {errorMessage && (
              <div className="p-3 rounded-md bg-red-500/20 text-red-200 text-sm border border-red-500/30">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-md bg-green-500/20 text-green-200 text-sm border border-green-500/30">
                {successMessage}
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:border-blue-500/50"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:border-blue-500/50"
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:border-blue-500/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Chargement..." : "S'inscrire"}
            </button>
          </form>
        )}

        {errorMessage && (
          <p className="text-red-500 dark:text-red-400 text-center">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="text-green-500 dark:text-green-400 text-center">
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
}
