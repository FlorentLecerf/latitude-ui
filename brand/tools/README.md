# brand/tools — génération des masters

Outillage qui **régénère** les masters vectoriels (`../masters/*.svg`) depuis la
police DM Serif Display. Le logo Latitude étant typographique (cf. `<Logo/>` +
`.logo-mark` dans `src/`), les masters sont une **matérialisation déterministe** de
ce rendu en vraies outlines (chemins, indépendants de la police).

## Régénérer

```bash
cd brand/tools
npm install opentype.js      # seule dépendance (non versionnée)
node generate-masters.cjs    # écrit ../masters/*.svg
```

> Extension `.cjs` volontaire : le repo est en `"type": "module"`, le script est en
> CommonJS. La génération est **déterministe** — même police + même script ⇒ SVG au
> bit près.

## Contenu

| Fichier | Rôle |
|---------|------|
| `generate-masters.cjs` | génère wordmark (4 traitements) + marque carrée « L. » (clair/sombre) |
| `fonts/DMSerifDisplay-Regular.ttf` | police source (OFL, redistribuable) |
| `fonts/OFL.txt` | licence SIL Open Font License de la police |

## Ce que le script encode (fidélité au web)

- `letter-spacing: -0.01em` + kerning, comme `.logo-mark`.
- Le point = **glyphe `.` de DM Serif** recoloré terracotta (`#E07855`), pas un cercle.
- Marque carrée = **variante A** (« L. », point = glyphe), centrée dans un carré 1000×1000.
- Tokens couleur en miroir de `src/theme.css` (anthracite `#262523`, crème `#FAFAF8`).

Pour modifier un master (taille du point, marge du carré, variante couleur), édite
`generate-masters.cjs` puis relance — ne touche jamais les SVG à la main.
