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
  - error `#B23A2F` / `#FF8A93` (clair : brique ; sombre : rouge vif tiré vers le rose depuis le 10/11/2026 — la brique pâle `#E39B92` se confondait avec le terracotta en texte seul). Le rouge dit « non, perdu, supprimé, en échec » ; le terracotta dit « à toi d'agir ». Fond d'étiquette sombre `rgba(190,47,62,.28)`.
  - info `#2F6B6B` / `#8FC2C2` (teal sourd, calme)
- **Règle d'or :** jamais de gris ni de noir purs. Tout porte une nuance chaude, ombres comprises.
- **Échelle de chaleur** (maturité % d'un prospect + température diagnostic) — tokens `--heat-{froid,tiede,chaud,ultra}-{bg,fg,hue}`, classes `.lt-heat--*` : froid (bleu-gris dormant) → tiède (ambre) → chaud (orange) → **ultra = terracotta PLEIN, texte blanc** = « opportunité à actionner ». **Jamais de rouge** (le rouge = perdu/négatif, signal opposé). `hue` = couleur représentative pour anneaux/accents.

## Spacing & density
- **Base 8px.** Layout via utilities Tailwind (`gap-6`, `p-8`…).
- **Deux densités :**
  - *Spacieuse* (espace client + diagnostic) — gap cartes 24px, padding carte 24px, contenu 32px. Calme, premium.
  - *Compacte* (CRM) — un cran plus serré mais toujours aéré.
- **Listes :** PAS de tableau Excel. Chaque ligne est une **carte séparée** (`ListRow`),
  gap 10px, fine (padding 11px/20px), ombre `sm`, hover qui soulève + bord terracotta.

## Layout
- **Approche :** hybride — grille disciplinée pour l'app (CRM, tableaux), éditorial pour le public (diagnostic, accueil).
- **Rayons (resserrés le 04/11/2026) :** sm 6 · md 10 · lg 10 · xl 12 · 2xl 12 · pill 9999. Rien ne dépasse 12 px.
- **Profondeur :** **la carte de référence est la tuile de l'écran Appels** (Florent,
  04/11/2026) : PAS d'ombre portée, filet fin (`--border`), rayon 10 px (`--radius-md`),
  sans halo. Le survol teinte le bord en terracotta (45 %), rien ne bouge. `Card`,
  `StatCard` et `StatTile` la partagent. Les ombres chaudes
  (`--shadow-sm/md/lg`) restent dispo pour le flottant réel (modales, overlays),
  pas pour les cartes de contenu.

## Motion
- **Approche :** intentionnelle, jamais bouncy.
- **Easing :** `cubic-bezier(.22,.61,.36,1)`. **Durée de référence :** 220ms.
- Fades + translations subtiles à l'entrée, transitions d'état fluides, micro-lift au hover des cartes/lignes.

## Composants (`@latitude/ui`)
`Button` (primary/ghost/soft/outline/danger · size sm/md ; `danger` = suppression : rouge teinté + filet, jamais terracotta) · `Card` (+hover, +elevated, +padded) · `Badge` (ok/warn/err/info/neutral/accent) ·
`StatCard` · `StatTile` (+ `InfoDot`, `StatTileAside`, `FunnelArrow`, `FunnelDivider` : LA carte de chiffre — 88 px, titre et chiffre centrés, chiffre calé en bas, ⓘ à droite du titre hors du centrage — prop `info`, il EXPLIQUE en une phrase —, rien sous le chiffre ; règles du 12/11 et du 17/11/2026) · `List` + `ListHead` + `ListRow` + `Pill` · `ProgressBar` · `Logo` ·
`SectionLabel` · `ThemeToggle` (+ `useTheme`, `applyTheme`, `themeInitScript`).
Styles dans `src/theme.css` (classes `lt-*` + utilitaires hérités `.section-label`,
`.logo-mark`, `.font-serif`, `.scrollbar-discrete`).

## Assets de marque (hors-app)
Le logo est **typographique** (« Latitude » DM Serif + point terracotta, cf. `<Logo/>`),
donc il n'existe pas en fichier. Pour les usages hors-app (réseaux sociaux, favicon,
signature, carte de visite), les visuels sont **matérialisés par rendu déterministe**
depuis ce master. Le registre des formats (dimensions par destination) et le mode
d'emploi agents vivent dans [`brand/`](brand/README.md). Masters + exports lourds sur
Google Drive `04_IDENTITE-MARQUE`. Marque carrée (favicon/avatars) = « L » DM Serif + point.

## Supports marketing : style performance, registre fin (DA validée le 23/11/2026)
Tout visuel marketing (bannières, images d'aperçu, vidéos animées, carrousels, illustrations, site) suit ce
registre. Gabarit de référence : `brand/banners/linkedin-perso-performance.html`. Florent, 23/11 : « ce style
"barre fine" intègre la DA de Latitude », tout ce qui a été produit depuis le positionnement « performance » est à
reprendre dans ce style.
- **Registre** : celui des graphiques des rapports financiers haut de gamme, pas un tableau de bord ni une infographie.
  Ce qui a été rejeté : « pas assez raffiné, ça fait de gros points, […] pas assez fin au niveau des traits, pas assez
  premium », « on dirait un truc d'amateur ».
- **Traits fins** : 1 à 1,5 px pour les filets et la série secondaire, 2,5 px au plus pour la série terracotta.
  Courbes lisses, jamais de points sur la courbe, un seul repère (anneau fin) au point qui compte.
- **Mesure discrète** : quelques filets horizontaux très légers, une échelle graduée fine en bas ; pas de quadrillage
  plein, pas de règle épaisse, pas de barre de progression (code propre à la vidéo, sans sens sur une image fixe).
- **Le graphique dit la thèse** : « Le dirigeant » (terracotta) monte en tête ; « L'entreprise » (gris crème) le suit,
  toujours en dessous et en retard, puis le rejoint en pointillé à la cible (objectif = anneau fin en pointillé, trait
  vertical pointillé jusqu'à l'échelle). Légendes en petites capitales espacées, collées à leur courbe (« L'entreprise »
  écrite le long de la sienne).
- **Typo** : DM Serif pour l'accroche, accent terracotta en couleur de texte (pas d'aplat) ; DM Sans en petites
  capitales espacées pour les repères.
- **Appel à l'action** : bouton pilule, contour terracotta 1,5 px, fond terracotta à 10 %, texte en petites capitales
  grasses, de taille mesurée, centré sous la première ligne du titre.
- **Fond** : sombre par défaut (anthracite), lueur terracotta très douce derrière le graphique ; clair possible.
- Aucun chiffre dans le décor (les graduations n'ont pas de valeur).

## Décisions
| Date | Décision | Raison |
|------|----------|--------|
| 2026-11-23 | Style performance, **registre fin** : DA de tous les supports marketing (section ci-dessus), gabarit `brand/banners/linkedin-perso-performance.html` | Bannière LinkedIn validée par Florent après quatre allers-retours ; tout ce qui a été produit depuis le positionnement « performance » (vidéos animées, carrousels, illustrations) est à reprendre dans ce registre. |
| 2026-11-02 | `StatTile` : tuile de chiffre 64 px, libellé + chiffre (24 px) centrés, décomposition sur le CÔTÉ, information hors tunnel en pointillé et écartée par `FunnelDivider` | Maquette des cartes de l'écran Appels validée par Florent ; tout écran de chiffres refait la reprend. |
| 2026-11-17 | ⓘ option A (i droit DM Sans 600, cercle fin 12 px) ; `StatTile` reçoit `info` (le bouton ⓘ, posé à droite du dernier mot sur une largeur nulle : le titre et le chiffre restent sur le même axe) ; bas de tuile 22 px ; `StatTileTitle` retiré | Florent, maquette Conversion v3.3 : le ⓘ EXPLIQUE (une phrase), le survol de la carte détaille, le chiffre ouvre la liste ; carte sans phrase = pas de ⓘ. Le ⓘ dans le flux du titre centré décalait le mot. |
| 2026-11-13 | `StatTile` devient LA carte de chiffre : 88 px au moins (plus 64), chiffre calé en bas, titre sur plusieurs lignes jamais coupé, ⓘ de 15 px (`InfoDot`, `StatTileTitle`) à côté du titre | Règle « Cartes de chiffres » validée par Florent le 12/11 sur maquette : une seule carte et un seul geste dans tout le CRM. Le CRM posait ces mesures par-dessus la tuile ; elles remontent ici, le CRM garde le geste (détail au survol, fenêtre au clic). |
| 2026-06-24 | Architecture assets de marque : registre + masters dans le repo, bibliothèque lourde sur Drive `04_IDENTITE-MARQUE`, génération par rendu déterministe (cf. `brand/`) | Logo = code typographique ; séparer le registre machine (repo, lu par les agents) des exports lourds (Drive). |
| 2026-06-08 | Système « Latitude, élevé » créé via /design-consultation | Codifier + élever la marque existante (terracotta + DM Serif + crème/anthracite), dé-dupliquée dans @latitude/ui. |
| 2026-06-08 | Thème clair + sombre natifs, toggle data-theme | Demande explicite : les deux versions disponibles partout. |
| 2026-06-08 | Listes = cartes séparées (pas tableau) | Préférence validée en preview : éviter l'effet Excel, lignes fines qui flottent. |
| 2026-06-08 | Serif comme voix (titres + chiffres clés) | Différenciation premium/éditoriale assumée. |
