import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Composant qui ramène automatiquement la page au sommet
 * lors d'un changement de route
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Remonter en haut de la page immédiatement (sans animation)
    // pour éviter les conflits avec les animations de transition
    window.scrollTo(0, 0);

    // Alternative avec animation fluide si préférée
    // setTimeout(() => {
    //   window.scrollTo({
    //     top: 0,
    //     behavior: "smooth"
    //   });
    // }, 0);
  }, [pathname]);

  return null; // Ce composant ne rend rien
};

export default ScrollToTop;
