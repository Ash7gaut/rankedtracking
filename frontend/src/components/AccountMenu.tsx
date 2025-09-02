import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { Session } from "@supabase/supabase-js";
import { Person, Logout } from "@mui/icons-material";

interface AccountMenuProps {
  session: Session | null;
}

export const AccountMenu = ({ session }: AccountMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [username, setUsername] = useState<string>("");

  // Récupérer le pseudo depuis la table usernames
  useEffect(() => {
    if (session?.user.id) {
      const fetchUsername = async () => {
        const { data } = await supabase
          .from("usernames")
          .select("username")
          .eq("user_id", session.user.id)
          .single();

        if (data?.username) {
          setUsername(data.username);
        }
      };
      fetchUsername();
    }
  }, [session?.user.id]);

  const displayName = username || session?.user.email;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 100);
    setHoverTimeout(timeout);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      localStorage.clear();
      navigate("/login");
      window.location.reload();
    }
  };

  if (!session) return null;

  return (
    <div
      className="relative"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <Person className="w-5 h-5" />
        <span className="text-gray-900 dark:text-white">{displayName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 transition-opacity duration-150">
          <button
            onClick={() => {
              navigate("/profile");
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-2"
          >
            <Person className="w-5 h-5" />
            Profil
          </button>
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 flex items-center gap-2"
          >
            <Logout className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};
