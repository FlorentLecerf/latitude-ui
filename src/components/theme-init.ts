/* Server-safe (PAS de "use client") : peut être appelé depuis un layout serveur.
   themeInitScript n'est qu'un générateur de string, aucune API navigateur. */

export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "lt-theme";

/**
 * Script anti-FOUC à injecter dans le <head> AVANT l'hydratation, pour poser
 * data-theme dès le premier paint (sinon flash de thème au chargement).
 *
 *   <Script id="lt-theme-init" strategy="beforeInteractive">
 *     {themeInitScript("dark")}
 *   </Script>
 *
 * @param fallback thème par défaut si rien n'est stocké ("light" | "dark").
 */
export function themeInitScript(fallback: Theme = "light"): string {
  return `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'${fallback}';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','${fallback}');}})();`;
}
