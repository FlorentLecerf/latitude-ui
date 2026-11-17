# Vidéos animées — moteur de motion design

Le gabarit des vidéos animées de Latitude : du texte, des bulles, des étiquettes et des schémas qui
bougent, rendus image par image par le Chrome installé puis montés en MP4 par ffmpeg. Aucun outil
payant, aucun abonnement. Même logique que `../banners/` : **le gabarit est versionné ici, le MP4
exporté est lourd et va sur le Drive**, jamais dans un dépôt.

| Fichier | Rôle |
|---|---|
| `moteur.html` | La scène : types de scènes, fonds, thèmes, calcul des durées. Aucune animation CSS, tout est calculé par `window.image(t)`, donc chaque image est exacte et rejouable. |
| `rendre.ts` | Le rendu : charge le moteur, lui donne le scénario, capture 30 images par seconde, monte le MP4. |

Polices : `../tools/fonts/` (DM Serif Display, DM Sans 500 et 700). Couleurs : `../../DESIGN.md`.

## Qui écrit quoi

- **Le scénario** (les textes, l'ordre des scènes, le fond) est du contenu : il s'écrit dans
  `latitude-marque/editorial/videos/<AAAA-MM-JJ-slug>-animation.md`, par la commande `/video-animee`
  de ce dépôt-là. Rien d'éditorial ne vit ici.
- **Ce dossier** ne porte que la fabrication. Un nouveau type de scène ou un nouveau fond utile à
  plusieurs vidéos s'ajoute dans `moteur.html` ; un schéma qui ne sert qu'à une vidéo s'écrit en
  scène sur mesure, à côté du scénario (voir plus bas).

## Rendre une vidéo

```sh
bun "/Users/lecerf/Projets Claude AI/latitude-ui/brand/motion/rendre.ts" <scenario.md> \
  --sortie "<dossier du Drive>" --nom "<Titre>" [--formats 4x5,9x16] [--planche]
```

- `--planche` ne sort que la planche d'images repères (deux par scène : le milieu et la fin), en
  trois secondes. **On la regarde toujours avant le rendu complet.**
- Formats : `4x5` (1080×1350, LinkedIn et fil Instagram) et `9x16` (1080×1920, Reels, TikTok,
  Shorts). En 9:16 la composition reste la même, centrée, et le fond remplit le cadre.
- Sorties : avec `--planche`, seulement `<nom>-planche.png` (à poser dans un dossier temporaire, pas sur
  le Drive) ; sans, `<nom>-4x5.mp4` et `<nom>-9x16.mp4`. H.264, 30 images par seconde, sans son.
- Il faut le Mac : Chrome, ffmpeg (`brew install ffmpeg`) et bun. Un seul rendu à la fois.

## Le scénario

Un JSON, seul ou dans le premier bloc ```` ```json ```` d'un fichier Markdown :

```json
{
  "titre": "Vous déléguez déjà. Alors pourquoi tout vous revient encore ?",
  "fond": "carte",
  "signature": "Florent Lecerf",
  "scenes": [
    { "type": "accroche", "lignes": ["Vous déléguez déjà.", "Alors pourquoi *tout vous revient* encore ?"], "sous": "Ce que votre organigramme ne dit pas" },
    { "type": "chute", "texte": "Déléguer *sans cap,* c'est déplacer du travail." }
  ]
}
```

- `*un passage entre étoiles*` passe en terracotta (un seul par scène, c'est un accent).
- La typographie est posée par le moteur : apostrophes courbes, espaces insécables devant `? ! : ; »`.
- Les durées sont calculées d'après la longueur des textes ; `"duree": 6` sur une scène force la sienne.
- Le rythme de toutes les vidéos se règle à un seul endroit, le bloc `RYTHME` de `moteur.html` (vitesse de
  lecture comptée, pause en fin de scène). Trop vite ou trop lent : c'est lui qu'on bouge, pas les scènes.
- Les corps de texte se réduisent seuls pour tenir dans le cadre ; un texte trop long reste trop long :
  on le coupe, on ne compte pas sur la réduction.

### Types de scènes

| Type | Champs | Ce qu'on voit |
|---|---|---|
| `accroche` | `lignes` (1 à 3), `sous` facultatif | Les grosses lettres du début, qui montent mot par mot ; le sous-titre en petites capitales. |
| `phrase` | `texte`, `taille` facultative | Une phrase seule, pour un pivot entre deux scènes. |
| `bulle` | `texte`, `legende` facultative | Une parole tapée lettre à lettre dans une bulle, puis qui l'a dite ou quand. |
| `dialogue` | `repliques` (2 à 4 : `qui` = `lui` ou `moi`, `texte`), `legende` facultative | Un échange : l'autre à gauche en bulle claire, Florent à droite en bulle terracotta. |
| `etiquettes` | `titre`, `items` (3 à 6), `chute` facultative | Une liste courte, chaque point en étiquette qui saute en place. |
| `chiffre` | `valeur`, `label`, `avant` et `contexte` facultatifs | Un grand chiffre qui compte jusqu'à sa valeur, son libellé. |
| `organigramme` | `titre`, `haut`, `bas` (2 à 5), `chute` facultative, `remontee` (0 à 15, défaut 12) | Un haut et des bas reliés, puis des points qui remontent des bas et s'entassent sur le haut. |
| `chute` | `texte`, `signature` facultative (`false` pour aucune) | La dernière image : le décor s'inverse, la phrase qui reste, le nom. Toujours en dernier. |

### Fonds

| Fond | Thème | Ce que c'est |
|---|---|---|
| `carte` | clair | Crème chaud, courbes de niveau qui dérivent. |
| `carnet` | clair | Papier clair pointillé, comme un carnet de notes. |
| `aube` | clair | Dégradé chaud, parallèles, lueur terracotta qui monte du bas. |
| `nuit` | sombre | Anthracite, courbes de niveau crème. |
| `cretes` | sombre | Lignes de crêtes en couches au bas du cadre, soleil terracotta. |
| `photo` | sombre | Une vraie photo (`"photo": "<chemin>"`, `"cadrage": "50% 50%"`), en noir et blanc chaud, assombrie. HEIC accepté. |

La `chute` inverse toujours le thème : fond clair, chute anthracite ; fond sombre, chute crème.

### Scène sur mesure

Un schéma propre à une vidéo s'écrit dans `<scénario>.scenes.js`, posé à côté du scénario :

```js
window.SCENES_SUR_MESURE = {
  // sc : la scène du scénario ; s : son <section> (colonne flex, 888 px de large) ; ctx : { theme, format, H }
  balance(sc, s, ctx) {
    const { el, svgEl, mots, monte, p, E } = window.M;
    const titre = mots(el("h2", "serif", s), sc.titre);
    return { d: 6, jouer(t) { monte(titre, t, 0.1); /* tout se calcule depuis t, en secondes */ } };
  },
};
```

Couleurs à prendre dans les variables du thème (`var(--encre)`, `var(--doux)`, `var(--carte)`,
`var(--bord)`, `var(--plein)`, `var(--terra)`), jamais en dur : la scène doit tenir sur fond clair et sombre.

## Règles

- **Pas de logo Latitude dans une vidéo animée** (Florent, 17/11/2026 : « on peut enlever le logo
  Latitude. Je trouve que ça fait trop pro »). La seule marque est la signature « Florent Lecerf » de la chute.
- Jamais de rouge (cf. `DESIGN.md`) ; le terracotta `#E07855` reste l'unique accent.
- Sully en photo : interdit. Une photo de fond vient du Drive `03_MARKETING-CONTENU/Photos-Pro`.
