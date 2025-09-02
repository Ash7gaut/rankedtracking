import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";
import { AddPlayerForm } from "../Home/components/AddPlayerForm/AddPlayerForm";
import { api } from "../../utils/api";
import { LinkedAccounts, LinkedAccount } from "./components/LinkedAccounts";
import { BackgroundSelector } from "./components/BackgroundSelector";
import {
  Person,
  Wallpaper,
  CheckCircle,
  Error as ErrorIcon,
  Save,
  Group,
  Add,
  Refresh,
  Settings,
  AccountCircle,
  SportsEsports,
  Edit,
} from "@mui/icons-material";
import { HeaderUniform } from "../../components/HeaderUniform";
import { PageTransition } from "../../components/PageTransition";

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
  const [activeTab, setActiveTab] = useState("profile");
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
        .select("username, role, background_url")
        .eq("user_id", session.user.id)
        .single();

      if (userError) {
        console.error("Erreur:", userError);
      } else {
        setUsername(userData?.username || "");
        setUserRole(userData?.role || "");
        if (userData?.background_url) {
          setBackgroundUrl(userData.background_url);
        }
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "TOP":
        return "/roles/Role=Top.png";
      case "JUNGLE":
        return "/roles/Role=Jungle.png";
      case "MID":
        return "/roles/Role=Mid.png";
      case "ADC":
        return "/roles/Role=Bot.png";
      case "SUPPORT":
        return "/roles/Role=Support.png";
      default:
        return "/roles/Role=Mid.png";
    }
  };

  return (
    <PageTransition>
      <div className="relative">
        <div className="min-h-screen">
          <HeaderUniform title="Mon profil" showHomeButton={true} />
          <div className="container mx-auto px-4 py-8">
            {/* En-tête avec navigation */}
            <div className="flex justify-end items-center mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsBackgroundSelectorOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200/80 dark:bg-white/10 backdrop-blur-sm text-gray-800 dark:text-white rounded-lg hover:bg-gray-300/80 dark:hover:bg-white/20 transition-all"
                >
                  <Wallpaper className="w-5 h-5" />
                  <span className="hidden sm:inline">Changer le fond</span>
                </button>
              </div>
            </div>

            {/* Messages de succès/erreur */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100/90 dark:bg-green-500/20 backdrop-blur-sm border border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-200 rounded-lg flex items-center gap-3 animate-fadeIn">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100/90 dark:bg-red-500/20 backdrop-blur-sm border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200 rounded-lg flex items-center gap-3 animate-fadeIn">
                <ErrorIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Carte de profil principale */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Colonne de gauche - Informations de profil */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 dark:bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-white/10 dark:border-gray-700/30 overflow-hidden">
                  <div className="relative h-32">
                    {backgroundUrl ? (
                      <>
                        <img
                          src={backgroundUrl}
                          alt="Banner background"
                          className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-blue-900/40 to-purple-900/40 backdrop-blur-[2px] transition-all duration-500 ease-in-out"></div>
                      </>
                    ) : (
                      <div className="h-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-white/70 text-sm flex items-center gap-2">
                          <Wallpaper className="w-4 h-4" />
                          Cliquez pour ajouter un fond
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => setIsBackgroundSelectorOpen(true)}
                      className="absolute top-3 right-3 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition-all z-10 group"
                      title="Changer le fond"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="absolute -bottom-8 right-0 bg-black/70 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Synchronisé
                      </span>
                    </button>
                  </div>

                  <div className="px-6 pt-0 pb-6 -mt-12">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-4 border-white/10 dark:border-gray-800/50">
                          {username ? (
                            username.charAt(0).toUpperCase()
                          ) : (
                            <AccountCircle className="w-20 h-20" />
                          )}
                        </div>
                        {userRole && (
                          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg">
                            <img
                              src={getRoleIcon(userRole)}
                              alt={userRole}
                              className="w-6 h-6"
                              title={userRole}
                            />
                          </div>
                        )}
                      </div>

                      <h1 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">
                        {username || "Utilisateur"}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {email}
                      </p>

                      <div className="mt-6 w-full">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-gray-800 dark:text-white font-medium">
                            Comptes liés
                          </h3>
                          <span className="text-blue-700 dark:text-blue-300 text-sm">
                            {linkedAccounts.length}/5
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {linkedAccounts.map((account) => (
                            <div
                              key={account.id}
                              className={`relative group cursor-pointer ${
                                account.is_main ? "order-first" : ""
                              }`}
                              onClick={() => navigate(`/player/${account.id}`)}
                            >
                              <div
                                className={`absolute inset-0 rounded-full ${
                                  account.is_main
                                    ? "bg-blue-500"
                                    : "bg-gray-700"
                                } transform scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300`}
                              ></div>
                              <img
                                src={`https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${account.profile_icon_id}.jpg`}
                                alt={account.summoner_name}
                                className={`w-10 h-10 rounded-full border-2 ${
                                  account.is_main
                                    ? "border-blue-500"
                                    : "border-gray-700"
                                } group-hover:scale-105 transition-all duration-300`}
                                title={account.summoner_name}
                              />
                              {account.is_main && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border border-white dark:border-gray-800 flex items-center justify-center">
                                  <span className="text-white text-[8px]">
                                    ★
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Bouton d'ajout de compte */}
                          {linkedAccounts.length < 5 && !isAddPlayerOpen && (
                            <div className="relative group">
                              <button
                                onClick={() => username && handleAddPlayer()}
                                disabled={!username}
                                className={`mt-3 w-full px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium ${
                                  !username
                                    ? "bg-gray-400 cursor-not-allowed opacity-50 text-gray-200"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                              >
                                <Add className="w-5 h-5" />
                                Ajouter un compte
                              </button>
                              {!username && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  Définissez d'abord votre pseudo dans l'onglet
                                  Profil
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              )}
                            </div>
                          )}

                          {isAddPlayerOpen ? (
                            <div className="mt-6 animate-fadeIn">
                              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                      <SportsEsports className="w-5 h-5 text-blue-500" />
                                      Ajouter un compte League of Legends
                                    </h3>
                                    <button
                                      onClick={() => setIsAddPlayerOpen(false)}
                                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="p-6">
                                  <AddPlayerForm
                                    onSuccess={async () => {
                                      setIsAddPlayerOpen(false);
                                      await loadProfileData();
                                      setSuccessMessage(
                                        "Compte LoL ajouté avec succès !"
                                      );
                                    }}
                                    defaultPlayerName={username}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne de droite - Onglets et contenu */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 dark:bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-white/10 dark:border-gray-700/30 overflow-hidden h-full">
                  {/* Navigation par onglets */}
                  <div className="flex border-b border-gray-300 dark:border-gray-700/30">
                    <button
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                        activeTab === "profile"
                          ? "text-blue-700 dark:text-white border-b-2 border-blue-500"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <Person className="w-5 h-5" />
                      Profil
                    </button>
                    <div className="relative group">
                      <button
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                          !username
                            ? "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                            : activeTab === "accounts"
                            ? "text-blue-700 dark:text-white border-b-2 border-blue-500"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                        onClick={() => username && setActiveTab("accounts")}
                        disabled={!username}
                      >
                        <SportsEsports className="w-5 h-5" />
                        Comptes LoL
                      </button>
                      {!username && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Définissez d'abord votre pseudo dans l'onglet Profil
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </div>
                    <button
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                        activeTab === "settings"
                          ? "text-blue-700 dark:text-white border-b-2 border-blue-500"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="w-5 h-5" />
                      Paramètres
                    </button>
                  </div>

                  {/* Contenu des onglets */}
                  <div className="p-6">
                    {/* Onglet Profil */}
                    {activeTab === "profile" && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                          Informations personnelles
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                              Pseudo
                            </label>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full p-3 bg-gray-100 dark:bg-black/20 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                              placeholder="Votre pseudo"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                              Rôle principal
                            </label>
                            <select
                              value={userRole}
                              onChange={(e) => setUserRole(e.target.value)}
                              className="w-full p-3 bg-gray-100 dark:bg-black/20 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
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

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                            Email
                          </label>
                          <input
                            type="text"
                            value={email}
                            disabled
                            className="w-full p-3 bg-gray-100 dark:bg-black/20 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          />
                        </div>

                        <button
                          onClick={updateProfile}
                          disabled={loading}
                          className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Refresh className="w-5 h-5 animate-spin" />
                              Sauvegarde...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              Sauvegarder
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Onglet Comptes LoL */}
                    {activeTab === "accounts" && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            Comptes League of Legends
                          </h2>
                          <button
                            onClick={handleAddPlayer}
                            disabled={linkedAccounts.length >= 5}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2
                              ${
                                linkedAccounts.length >= 5
                                  ? "bg-gray-600/50 cursor-not-allowed text-gray-400"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                          >
                            <Add className="w-5 h-5" />
                            Ajouter
                          </button>
                        </div>

                        {linkedAccounts.length > 0 ? (
                          <div className="space-y-4">
                            <LinkedAccounts
                              accounts={linkedAccounts}
                              username={username}
                              onDelete={handleDelete}
                              onRefresh={loadProfileData}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 bg-gray-100/80 dark:bg-black/20 rounded-lg border border-gray-300 dark:border-gray-700/50">
                            <SportsEsports className="w-16 h-16 text-gray-500 dark:text-gray-600 mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              Vous n'avez pas encore ajouté de compte League of
                              Legends
                            </p>
                            <button
                              onClick={handleAddPlayer}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2"
                            >
                              <Add className="w-5 h-5" />
                              Ajouter un compte
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Onglet Paramètres */}
                    {activeTab === "settings" && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                          Paramètres du profil
                        </h2>

                        <div className="space-y-4">
                          <div className="p-4 bg-gray-100/80 dark:bg-black/20 rounded-lg border border-gray-300 dark:border-gray-700/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Wallpaper className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                <div>
                                  <h3 className="text-gray-800 dark:text-white font-medium">
                                    Fond de profil
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Personnalisez l'arrière-plan de votre profil
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 dark:text-white">
                Confirmer la suppression
              </h3>
              <p className="mb-6 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer le compte{" "}
                <span className="font-bold">{accountToDelete}</span> ?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog du sélecteur de fond */}
        <BackgroundSelector
          isOpen={isBackgroundSelectorOpen}
          onClose={() => setIsBackgroundSelectorOpen(false)}
          onSelect={handleBackgroundSelect}
        />
      </div>
    </PageTransition>
  );
};

export default Profile;
