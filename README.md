# @latitude/ui

Système de design partagé de **Latitude Coaching** : tokens, thèmes clair/sombre et
composants React pour le **CRM**, l'**espace client** et le **diagnostic**.

La source de vérité du langage visuel est [`DESIGN.md`](./DESIGN.md). Ce package en
est l'implémentation physique (Tailwind v4, CSS-first).

## Adopter le design Latitude dans un projet (checklist agent)

Quand on te demande d'« appliquer » ou d'« aligner » le nouveau design sur un projet,
**pars toujours d'ici**. Règle d'or : **utiliser ce package, ne jamais redéfinir
couleurs / typo / composants en local.**

1. **Lis [`DESIGN.md`](./DESIGN.md)** — le langage visuel (couleurs, typo, espace, motion).
2. **Branche le package** : dépendance `github:FlorentLecerf/latitude-ui`,
   `transpilePackages: ["@latitude/ui"]`, et dans `globals.css` :
   `@import "tailwindcss"; @import "@latitude/ui/theme.css"; @source "../../node_modules/@latitude/ui/src";`
   (ça remplace les anciens tokens locaux — `theme.css` en est un superset, rien ne casse).
3. **Thème clair/sombre** : `themeInitScript()` dans le layout (anti-flash) + un
   `<ThemeToggle />`. Défaut par surface (public → `"light"`, outil → `"dark"`). Retire
   au fil de l'eau les classes `.crm`/`.espace`/`.reserver` pour passer la surface sous
   contrôle du toggle.
4. **Refonds écran par écran** en assemblant les composants (voir plus bas). Mise en page
   spécifique d'un écran = dans le projet ; primitive réutilisable = **ici**, dans le
   package (via PR).
5. **Principes non négociables** (cf. DESIGN.md) :
   - jamais de gris/noir purs (neutres chauds) ;
   - profondeur = ombres chaudes `var(--shadow-sm|md|lg)` ;
   - le serif (`font-serif` / DM Serif) porte titres + chiffres clés ;
   - listes = **cartes séparées** (`ListRow`), jamais un tableau « Excel » ;
   - motion intentionnelle (`var(--ease)`, ~220ms), jamais bouncy ;
   - densité spacieuse côté client/public, plus compacte côté outil.
6. **Vérifie en vrai** : `bun run build` + un coup d'œil visuel réel (les maquettes ne
   suffisent pas). Puis PR → preview Vercel → merge.

## Installation (app Next.js 16 + Tailwind v4)

Le package se consomme en **dépendance git** (dev local : lien direct vers le repo voisin).

```jsonc
// package.json de l'app
{
  "dependencies": {
    "@latitude/ui": "github:FlorentLecerf/latitude-ui"   // prod
    // dev local : "@latitude/ui": "file:../latitude-ui"
  }
}
```

Le package livre son **source TSX** : transpile-le côté app.

```ts
// next.config.ts
const nextConfig = {
  transpilePackages: ["@latitude/ui"],
};
```

## Câblage CSS

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "@latitude/ui/theme.css";

/* Tailwind doit scanner les classes utilisées par le package */
@source "../../node_modules/@latitude/ui/src";
```

`theme.css` apporte les tokens (clair + sombre), le mapping Tailwind
(`bg-surface`, `text-muted`, `bg-primary`…) et toutes les classes composants. C'est
un **superset** des anciens `globals.css` : les classes existantes
(`.section-label`, `.logo-mark`, `.font-serif`, `.scrollbar-discrete`) sont préservées.

## Thème clair / sombre

```tsx
// layout.tsx — anti-flash (pose data-theme avant hydratation)
import { themeInitScript } from "@latitude/ui";

<head>
  <script dangerouslySetInnerHTML={{ __html: themeInitScript("light") }} />
</head>
```

```tsx
// n'importe quel composant client
import { ThemeToggle } from "@latitude/ui";
<ThemeToggle />
```

Compat ascendante : tant qu'une page porte encore les classes `.crm` / `.espace` /
`.reserver`, elle reste en anthracite quel que soit le toggle. Retire ces classes au
fil de la migration pour passer la surface sous contrôle du toggle.

## Composants

```tsx
import {
  Button, Card, Badge, StatCard, ProgressBar, ProgressRing,
  List, ListHead, ListRow, Pill, Logo, SectionLabel, ThemeToggle,
} from "@latitude/ui";
```

Liste de cartes (pas un tableau Excel) :

```tsx
<List cols="1.6fr 1.4fr 1fr .8fr">
  <ListHead>
    <span>Prospect</span><span>Étape</span><span>Source</span><span className="lt-r">Valeur</span>
  </ListHead>
  <ListRow clickable>
    <span className="lt-nm">Camille Roux</span>
    <span><Pill>Entretien planifié</Pill></span>
    <span className="lt-mut">Diagnostic</span>
    <span className="lt-r" style={{ fontVariantNumeric: "tabular-nums" }}>2 400 €</span>
  </ListRow>
</List>
```

## Projets non-React (vitrine HTML statique)

`latitude-web` est en **HTML statique** : il ne peut pas consommer les composants React
ni `theme.css` (Tailwind v4). Il s'aligne en **recopiant les tokens** de `DESIGN.md`
dans son propre CSS (mêmes hex terracotta/neutres, mêmes fontes DM Sans / DM Serif).
Le package reste la **référence des valeurs** ; la vitrine les duplique à la main.
