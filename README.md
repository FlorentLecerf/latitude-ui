# @latitude/ui

Système de design partagé de **Latitude Coaching** : tokens, thèmes clair/sombre et
composants React pour le **CRM**, l'**espace client** et le **diagnostic**.

La source de vérité du langage visuel est [`DESIGN.md`](./DESIGN.md). Ce package en
est l'implémentation physique (Tailwind v4, CSS-first).

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
  Button, Card, Badge, StatCard, ProgressBar,
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
