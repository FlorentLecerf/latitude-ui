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
  --sortie "<dossier du Drive>" --nom "<Titre>" [--formats 4x5,9x16] [--planche | --miniatures]
```

- `--planche` ne sort que la planche d'images repères (deux par scène : le milieu et la fin), en
  trois secondes. **On la regarde toujours avant le rendu complet.**
- Formats : `4x5` (1080×1350, LinkedIn et fil Instagram) et `9x16` (1080×1920, Reels, TikTok,
  Shorts). En 9:16 la composition reste la même, centrée, et le fond remplit le cadre.
- Sorties : avec `--planche`, seulement `<nom>-planche.png` (à poser dans un dossier temporaire, pas sur
  le Drive) ; sans, `<nom>-4x5.mp4` et `<nom>-9x16.mp4`. H.264, 30 images par seconde, sans son.
- Miniatures : chaque format sort aussi `<nom>-<format>-miniature.jpg` (LinkedIn exige une miniature pour
  une vidéo). C'est la fin de la scène 1 ; `"miniature": N` dans le scénario prend la fin de la scène N.
  `--miniatures` ne sort qu'elles, sans refaire les MP4 (vidéo déjà rendue).
- Il faut le Mac : Chrome, ffmpeg (`brew install ffmpeg`) et bun. Un seul rendu à la fois.

## Le scénario

Un JSON, seul ou dans le premier bloc ```` ```json ```` d'un fichier Markdown :

```json
{
  "titre": "Vous déléguez déjà. Alors pourquoi tout vous revient encore ?",
  "fond": "courbe",
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
| `etiquettes` | `titre`, `items` (3 à 6), `chute` facultative | Une liste courte : des rangs numérotés qui glissent en place l'un après l'autre. |
| `chiffre` | `valeur`, `label`, `avant` et `contexte` facultatifs | Un grand chiffre qui compte jusqu'à sa valeur, son libellé. |
| `organigramme` | `titre`, `haut`, `bas` (2 à 5), `chute` facultative, `remontee` (0 à 15, défaut 12) | Un haut et des bas reliés, puis des points qui remontent des bas et s'entassent sur le haut. |
| `chute` | `texte`, `signature` facultative (aucune par défaut) | La dernière image : le décor s'inverse, la phrase qui reste. Toujours en dernier. |

### L'avatar (facultatif, sur n'importe quelle scène sauf la `chute`)

`"avatar": "perdu"` sur une scène fait entrer Florent dessiné, debout à droite, posé sur la bande du décor ; il
glisse depuis la droite, net, sans rebond. La colonne de texte se resserre (padding droit 470 px) avant que la scène
mesure ses textes : les corps se réduisent d'eux-mêmes, mais un texte écrit pour la pleine largeur doit être
raccourci d'un tiers. La pose est le nom d'un fichier `avatar-<pose>.png` du Drive
`03_MARKETING-CONTENU/Photos-Pro/AVATAR/` (constante `AVATARS` de `moteur.html`) ; un chemin absolu marche aussi.
Pose introuvable : le rendu s'arrête en le disant. Règle de Florent (19/11/2026) : pas d'avatar partout, il
n'entre que quand il sert le propos ; le décor suffit le reste du temps. Il ne va pas sur `organigramme` (le
schéma prend toute la largeur).

### Fonds : le style « performance »

Direction donnée par Florent le 17/11/2026, après avoir vu les premiers fonds : « ce n'est pas assez orienté
performance […] c'est trop lisse ». Latitude fait travailler le dirigeant sur lui pour améliorer sa performance,
donc celle de son entreprise : le décor **mesure** (quadrillage, règles graduées) et **monte** (une courbe, des
barres, une aiguille qui tient son cap). Sans champ `fond`, le moteur prend `courbe`. Il a validé la direction le
même jour sur planche (« c'est nettement mieux. En effet, on est plus orienté performance, ça me va bien ») et
demandé d'aller plus loin : « on peut encore accentuer davantage », « en créer d'autres pour avoir encore plus de
matière, plus de diversité, mais vraiment orienté performance […] toujours en adéquation avec le branding Latitude ».

| Fond | Ton par défaut | Ce que c'est |
|---|---|---|
| `courbe` | sombre | Deux séries qui grimpent au fil de la vidéo : la terracotta devant, l'autre qui la suit (le dirigeant, puis l'entreprise). Elle décolle à droite juste avant la chute. |
| `barres` | clair | Un histogramme qui se construit de gauche à droite ; la dernière barre, terracotta, monte bien plus haut que les autres. |
| `cap` | sombre | L'arc d'un grand cadran gradué qui tourne ; l'aiguille terracotta cherche, puis tient sa direction dans la zone visée. |
| `sommet` | sombre | Une crête dessinée comme un relevé (hachures, arêtes), basse dans la bande, le sommet dans la marge droite ; l'itinéraire terracotta la remonte et plante son fanion juste avant la chute. La montagne de la marque, en version mesurée. |
| `paliers` | clair | Un escalier : des marches larges, puis hautes et serrées dans la marge droite. Le trait terracotta les franchit une à une. |
| `tableau` | sombre | Un tableau de bord : quatre tuiles d'indicateurs qui vivent pendant la vidéo (une tendance, un anneau, des barres, une flèche). Aucun élément haut : le plus discret des six. |
| `photo` | sombre | Une vraie photo (`"photo": "<chemin>"`, `"cadrage": "50% 50%"`), en noir et blanc chaud, assombrie. HEIC accepté. |

- **Deux tons par fond** : `"ton": "clair"` ou `"ton": "sombre"` dans le scénario donne l'autre version des six
  décors (pas de `photo`). Six décors, douze ambiances.
- **L'objectif est tracé dès la première image** : la trajectoire en pointillé, le contour des barres, l'anneau
  terracotta là où le décor doit arriver. Le réalisé le rattrape pendant la vidéo et l'atteint juste avant la
  chute. C'est ce qui rend le décor présent dès l'accroche, là où se décide si on regarde la suite.
- **Le décor vit dans une bande au bas du cadre, sous les textes** (240 px réservés, `BANDE` dans `moteur.html`),
  et son élément le plus haut monte dans la marge droite (96 px) : il ne passe jamais derrière une phrase. Une courbe ou un trait qui traverse un texte le rend illisible, et
  Florent lit déjà la vidéo « un tout petit peu vite ».
- **Ce que le style change aussi dans les scènes** : une barre de progression en haut (un segment par scène) ;
  l'accent `*entre étoiles*` devient un aplat terracotta qui balaie les mots, texte blanc ; les bulles et les
  cartes ont des angles nets et un filet fin, sans ombre (la carte de référence de `DESIGN.md`) ; les étiquettes
  deviennent des rangs numérotés 01, 02, 03 ; rien ne rebondit ; la chute arrive par un volet en biais précédé
  d'une lame terracotta.
- **Aucun chiffre dans le décor** : les graduations n'ont pas de valeur, la courbe n'a pas d'unité. Un chiffre à
  l'écran est toujours un chiffre que Florent a donné, dans une scène `chiffre`.
- La typographie de la marque ne change pas (DM Serif Display pour la voix, DM Sans pour les repères).
- **Ajouter un fond** : partir de `socle()` (quadrillage et règles), dessiner l'objectif d'abord (`objectif()`,
  pointillés), puis le réalisé en terracotta, suivi par `repere()` ; tout se pose depuis `c.sol` (la ligne de base
  de la bande) et se colore avec `c.tr` et `c.fd`, pour tenir dans les deux tons. Vérifier en 4x5 et en 9x16.

Les cinq premiers fonds (`carte`, `carnet`, `aube`, `nuit`, `cretes`) et leur style (pastilles rondes, ombres
douces, rebonds, voile rond) ont été retirés du moteur le 17/11/2026, une fois la vidéo validée dans le style
performance. Ils restent dans l'historique git (avant ce retrait) si une forme devait être reprise.

La `chute` inverse toujours le ton : fond clair, chute anthracite ; fond sombre, chute crème.

### Scène sur mesure

Un schéma propre à une vidéo s'écrit dans `<scénario>.scenes.js`, posé à côté du scénario :

```js
window.SCENES_SUR_MESURE = {
  // sc : la scène du scénario ; s : son <section> (colonne flex, 888 px de large, 1 000 px de haut au-dessus de la bande du décor) ; ctx : { theme, format, H }
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

- **Un petit logo Latitude discret sur toute la vidéo, sans signature** (Florent, 18/11/2026, après avoir retiré le logo
  le 17/11 : la marque voyage dans l'image, comme PARADOX sur les vidéos de Laroche ; son nom est déjà l'auteur de la
  publication). Le moteur pose « Latitude. » au bout de la barre de progression, aux couleurs du ton (il s'inverse avec
  la chute). `"logo": false` dans le scénario l'enlève ; une signature ne s'affiche que si la `chute` porte
  `"signature": "…"` (le champ `signature` du haut du scénario n'est plus lu).
- **Orienté performance, jamais « lisse »** (Florent, 17/11/2026) : un nouveau fond ou une nouvelle scène
  mesure ou monte, avec des angles nets ; pas de dégradé pastel, pas de forme molle qui dérive, pas de rebond.
  Performance d'entreprise (courbe, indicateur, cap), pas performance sportive (chrono, dossard) : le séminaire
  se présente justement comme « pas une performance sportive ».
- Jamais de rouge (cf. `DESIGN.md`) ; le terracotta `#E07855` reste l'unique accent.
- Sully en photo : interdit. Une photo de fond vient du Drive `03_MARKETING-CONTENU/Photos-Pro`.
