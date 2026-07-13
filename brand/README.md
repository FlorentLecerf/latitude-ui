# Assets de marque Latitude — architecture & mode d'emploi agents

Ce dossier est le **pont** entre le code (cette source de vérité, déployée) et la
**bibliothèque d'assets lourde** (Google Drive). Tout agent qui doit produire un
visuel de marque commence ici.

## Le logo, c'est du code (pas un fichier)

Le logo Latitude est **typographique** : le mot « Latitude » en **DM Serif** suivi
d'un **point terracotta** (`#E07855`), défini dans `src/components/primitives.tsx`
(`<Logo/>`) + `src/theme.css` (`.logo-mark`). Sur le web il est rendu par le
navigateur → toujours nickel. Pour tout usage **hors-app** (réseaux, favicon,
signature, print), on **matérialise** ce logo en fichiers via rendu déterministe.

- Tokens, typo, couleurs : voir [`../DESIGN.md`](../DESIGN.md).
- Marque carrée (favicon, avatars) : initiale **« L » en DM Serif + point terracotta**.

## Stockage à deux niveaux

| Quoi | Où | Pourquoi |
|------|-----|----------|
| Registre des formats (`format-registry.json`) | **ce repo** | texte versionné, lu nativement par tout agent |
| Masters vectoriels (SVG, outlines) | **ce repo** (`brand/masters/`) + miroir Drive `Logos/` | minuscules, sous la main |
| Sous-ensemble web (favicon, icônes PWA, OG) | **repos consommateurs** (`public/`, `app/`) | déployé avec le site |
| Bannières sociales, signature, posts, exports PNG, carte de visite, PDF | **Google Drive** `04_IDENTITE-MARQUE/` | lourd, marketing, accès humain |
| Charte visuelle humaine | **Drive** `Charte-Graphique/` | pour Florent / designers |

**Drive — source de vérité bibliothèque :** `04_IDENTITE-MARQUE`
(`drive.google.com/drive/folders/1QrVSgOUy_Xm1wPINSIxzzbxs9feYztR-`).
IDs des sous-dossiers dans `format-registry.json` → `drive.folders`.

## Comment les agents accèdent au Drive

⚠️ Un agent lit **ce repo** par défaut, **pas** le Drive. Il n'y va que si on lui
dit explicitement. Le connecteur Google Drive (compte PRO florent@latitude.coach)
est disponible **en session interactive** ; il peut être **absent en run
automatisé/headless (cron, cloud)**. Donc : le registre + les masters vivent ici
(toujours lisibles) ; seuls les dépôts d'exports lourds nécessitent Drive.

## Produire un format (procédure agent)

1. Lire `format-registry.json` → trouver l'entrée par `key` ou `label` correspondant
   à la destination demandée (« bannière LinkedIn » → `linkedin-perso-banner`).
2. Partir du master (`brand/masters/`) — wordmark ou marque carrée selon `usesSquareMark`.
3. Rendre à `width × height` (`unit`, `dpi` si print) via rendu déterministe
   (template HTML/CSS + navigateur headless, ex. gstack `/browse`).
4. Déposer selon `destination` : `repo` → `repoTarget` ; `drive` → `drive.folders[driveFolder]`.
5. Respecter `safeArea` quand présent (YouTube). Jamais de rouge (cf. DESIGN.md).

## Masters (`brand/masters/`)

Outlines vectorielles vraies (chemins, indépendantes de la police), générées depuis
DM Serif Display et **fidèles au `<Logo/>` web** (kerning + `letter-spacing -0.01em`,
le point = glyphe `.` recoloré terracotta).

| Fichier | Usage |
|---------|-------|
| `wordmark-latitude.svg` | wordmark canonique — anthracite + point terracotta (fond clair) |
| `wordmark-latitude-on-dark.svg` | wordmark crème + point terracotta (fond sombre) |
| `wordmark-latitude-mono-anthracite.svg` | aplat anthracite (tampon monochrome) |
| `wordmark-latitude-mono-creme.svg` | aplat crème (tampon monochrome sur sombre) |
| `square-mark.svg` | marque carrée « L. » — L anthracite + point terracotta (favicon/avatars) |
| `square-mark-on-dark.svg` | marque carrée « L. » — L crème + point terracotta (fond sombre) |
| `crm-mark.svg` | favicon CRM « CRM. » — tuile anthracite + CRM crème (DM Sans ExtraBold) + point terracotta |

Marque carrée = **variante A** retenue (le point est le glyphe DM Serif, même ADN que
le wordmark). Les masters sont transparents (pas de fond) : la tuile (fond rond crème
ou anthracite) est composée au moment de l'export favicon.

**Exception — `crm-mark.svg`** (validé 13/07/2026) : la tuile anthracite arrondie fait
partie du dessin, car c'est elle qui distingue l'onglet CRM de l'onglet site dans le
navigateur. « CRM » est en **DM Sans** wght 800 (instance statique dans `tools/fonts/`,
GSUB retirée pour opentype.js) ; le point reste le glyphe « . » DM Serif, élargi à
0.275em pour rester visible à 16 px. Un texte dans le L à 16 px est illisible (testé) :
à cette taille, seule une typo plein cadre fonctionne. Exports déposés dans
`latitude-crm/src/app/` : `favicon.ico` (16+32+48, tuile arrondie), `icon.png` (512,
tuile arrondie), `apple-icon.png` (180, **carré plein cadre** — iOS applique son propre
arrondi).

## État du chantier

- [x] Registre des formats posé.
- [x] Master vectoriel du wordmark (SVG outlines) — `brand/masters/`.
- [x] Marque carrée « L. » (variante A) — `brand/masters/square-mark*.svg`.
- [x] Signature e-mail v2 (11/07/2026) — `brand/signature-email/` : 2 snippets HTML + logo tuile crème
      rendu depuis le master, hébergé sur latitude-web. Brief : QG `editorial/signature-email-brief.md`.
- [x] Favicon CRM distinct (13/07/2026) — master `crm-mark.svg` + exports déposés dans
      `latitude-crm/src/app/` (favicon.ico, icon.png, apple-icon.png).
- [ ] Sous-dossiers Drive `Social/` + `Signature-Email/` — à créer (rangement Drive).
- [ ] Template de rendu + pipeline d'export généralisé (depuis les masters → formats du registre) —
      premier exemplaire : `signature-email/render-logo.html`.
