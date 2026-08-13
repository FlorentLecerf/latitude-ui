/* Server-safe (PAS de "use client") : peut être appelé depuis un layout serveur.
   themeInitScript n'est qu'un générateur de string, aucune API navigateur. */

export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "lt-theme";

/**
 * Script anti-FOUC à injecter dans le <head>, en script inline BLOQUANT, pour
 * poser data-theme dès le premier paint (sinon flash de thème au chargement).
 *
 *   <head>
 *     <script dangerouslySetInnerHTML={{ __html: themeInitScript("dark") }} />
 *   </head>
 *
 * ⚠️ NE PAS passer par <Script strategy="beforeInteractive"> de next/script :
 * en App Router, Next met le script en file (self.__next_s) et ne l'exécute
 * qu'après chargement du bundle — donc APRÈS le premier paint. Le flash reste
 * (constaté ~0,5 s sur diag.latitude.coach, corrigé le 13/08/2026).
 * Penser aussi à `suppressHydrationWarning` sur <html>.
 *
 * @param fallback thème par défaut si rien n'est stocké ("light" | "dark").
 */
export function themeInitScript(fallback: Theme = "light"): string {
  return `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'${fallback}';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','${fallback}');}})();`;
}
