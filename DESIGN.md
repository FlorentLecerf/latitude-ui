# Design System — Latitude

> Source de vérité du langage visuel partagé entre le **CRM**, l'**espace client**
> et le **diagnostic**. Implémenté physiquement dans `@latitude/ui`
> (`src/theme.css` + composants). Ne pas dévier sans mise à jour de ce fichier
> ET du package.

## Product Context
- **Ce que c'est :** cabinet de coaching Latitude (Florent Lecerf). Trois surfaces
  partagent une seule marque : CRM interne (coach), espace client sécurisé, et le
  diagnostic (lead magnet, 16 questions pour dirigeants).
- **Pour qui :** dirigeants / cadres en accompagnement (clients) + le coach (CRM).
- **Espace/industrie :** coaching exécutif premium.
- **Type :** web apps Next.js 16 + Tailwind v4 + Supabase.

## Memorable thing
**« Clarté premium, toujours humaine. »** Un cabinet de coaching pensé comme un
magazine : le terracotta ponctue, le serif donne la voix, l'espace donne le calme.
Sérieux et haut de gamme sans jamais être froid.

## Direction
- **Posture :** élévation éditoriale de la marque existante (on ne réinvente pas, on
  élève le craft).
- **Décoration :** intentionnelle — ombres chaudes, profondeur subtile, motion soignée.
  Jamais de décor gratuit.
- **Thème :** clair (crème) ET sombre (anthracite) sont tous deux natifs, basculables
  par toggle (`data-theme`). Le CRM penche sombre par défaut (outil de focus), le
  public penche clair (accueil, clarté). Les deux restent disponibles partout.

## Typography
- **Display / Hero :** `DM Serif Display` — utilisé comme **voix**, pas déco : grands
  titres, chiffres clés (score diagnostic, stats), accroches. C'est le parti pris
  signature face aux CRM tout-sans.
- **Corps / UI / labels :** `DM Sans` (400/500/600/700).
- **Données / tableaux :** `DM Sans` en `tabular-nums` (montants, pipeline alignés).
- **Chargement :** `next/font/google` dans chaque app (variables `--font-dm-sans`,
  `--font-dm-serif`). Le package les référence, ne les recharge pas.
- **Échelle modulaire (ratio 1.25, base 16px) :** 12 · 14 · 16 · 18 · 20 · 25 · 31 ·
  39 · 49 · 61px. Display = DM Serif à partir de 31px. line-height : 1.04–1.1 display,
  1.5 corps.

## Color
- **Approche :** restreinte. Terracotta = accent unique ; neutres réchauffés ; sémantiques accordées.
- **Terracotta (primary) :** `#E07855` · hover `#c96640` · deep `#A8492E` (texte accent sur clair) · tints `0.08`/`0.14`.
- **Neutres chauds — clair :** background `#FAFAF8` · surface `#FFFFFF` · warm `#F5F0EB` · foreground `#3A3A3A` · muted `#6E6E6E` · border `rgba(58,58,58,.08)`.
- **Neutres chauds — sombre :** background `#262523` · surface `#34322F` · warm `#2E2C29` · foreground `#F5F0EB` · muted `#D0C5B9` · border `rgba(255,255,255,.09)`.
- **Sémantiques (clair / sombre) :**
  - success `#3E6B42` / `#A8CFAC`
  - warning `#8C5A1F` / `#E8BF86`
  - error `#B23A2F` / `#E39B92` (brique, accordée au terracotta — jamais rouge criard)
  - info `#2F6B6B` / `#8FC2C2` (teal sourd, calme)
- **Règle d'or :** jamais de gris ni de noir purs. Tout porte une nuance chaude, ombres comprises.

## Spacing & density
- **Base 8px.** Layout via utilities Tailwind (`gap-6`, `p-8`…).
- **Deux densités :**
  - *Spacieuse* (espace client + diagnostic) — gap cartes 24px, padding carte 24px, contenu 32px. Calme, premium.
  - *Compacte* (CRM) — un cran plus serré mais toujours aéré.
- **Listes :** PAS de tableau Excel. Chaque ligne est une **carte séparée** (`ListRow`),
  gap 10px, fine (padding 11px/20px), ombre `sm`, hover qui soulève + bord terracotta.

## Layout
- **Approche :** hybride — grille disciplinée pour l'app (CRM, tableaux), éditorial pour le public (diagnostic, accueil).
- **Rayons :** sm 6 · md 10 · lg 16 · xl 24 · pill 9999.
- **Profondeur :** ombres chaudes (`rgba(58,50,40,…)` en clair, noires en sombre) —
  `sm` (1px), `md` (cartes), `lg` (survol / éléments flottants).

## Motion
- **Approche :** intentionnelle, jamais bouncy.
- **Easing :** `cubic-bezier(.22,.61,.36,1)`. **Durée de référence :** 220ms.
- Fades + translations subtiles à l'entrée, transitions d'état fluides, micro-lift au hover des cartes/lignes.

## Composants (`@latitude/ui`)
`Button` (primary/ghost/soft/outline/danger · size sm/md) · `Card` (+hover, +elevated, +padded) · `Badge` (ok/warn/err/info/neutral/accent) ·
`StatCard` · `List` + `ListHead` + `ListRow` + `Pill` · `ProgressBar` · `Logo` ·
`SectionLabel` · `ThemeToggle` (+ `useTheme`, `applyTheme`, `themeInitScript`).
Styles dans `src/theme.css` (classes `lt-*` + utilitaires hérités `.section-label`,
`.logo-mark`, `.font-serif`, `.scrollbar-discrete`).

## Décisions
| Date | Décision | Raison |
|------|----------|--------|
| 2026-06-08 | Système « Latitude, élevé » créé via /design-consultation | Codifier + élever la marque existante (terracotta + DM Serif + crème/anthracite), dé-dupliquée dans @latitude/ui. |
| 2026-06-08 | Thème clair + sombre natifs, toggle data-theme | Demande explicite : les deux versions disponibles partout. |
| 2026-06-08 | Listes = cartes séparées (pas tableau) | Préférence validée en preview : éviter l'effet Excel, lignes fines qui flottent. |
| 2026-06-08 | Serif comme voix (titres + chiffres clés) | Différenciation premium/éditoriale assumée. |
