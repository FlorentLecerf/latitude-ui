# Bannières sociales — gabarits de rendu

Templates HTML/CSS **déterministes** des bannières de marque, rendus en PNG via navigateur
headless (cf. `../README.md` → « Produire un format »). Les dimensions par destination
vivent dans `../format-registry.json` ; les tokens (couleur, typo) dans `../../DESIGN.md`.

**Règle de stockage** : le **gabarit `.html` est versionné ici** ; le **PNG exporté est lourd
→ Drive** `04_IDENTITE-MARQUE/Social` (les `*.png` sont gitignorés). Le PNG dans ce dossier
n'est qu'un rendu local jetable.

## Gabarits

| Fichier | Format (registry) | Destination |
|---|---|---|
| `linkedin-perso.html` | `linkedin-perso-banner` (1584×396) | Drive `Social` |

## Rendre un gabarit

Depuis ce dossier. **Toujours `--force-device-scale-factor=2`** (supersampling) : `--window-size`
reste aux dimensions registry, mais le PNG sort en **2×** (ex. 3168×792 pour LinkedIn) → net sur
Retina, sinon le serif paraît pixelisé. Le ratio est identique, LinkedIn/Drive l'acceptent.

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --disable-gpu --force-device-scale-factor=2 --hide-scrollbars \
  --virtual-time-budget=4000 --window-size=1584,396 \
  --screenshot="linkedin-perso.png" "file://$PWD/linkedin-perso.html"
```

`--window-size` = `width,height` de l'entrée registry ; la sortie fait 2× ces valeurs.

## Source de vérité COPY

Le **contenu** (accroche, sous-titre, CTA, direction créative) est décidé en amont dans le
QG marque : `~/Agents/latitude-marque/editorial/visuels/`. Ce dossier ne fait que **fabriquer
le pixel** ; il ne décide pas la copy.

## linkedin-perso — état

- **Direction MIX A+B figée le 2026-06-30** : accroche reconnaissance-pouvoir
  (« Le vrai levier de votre entreprise, c'est vous. ») + sous-titre destination-loi
  (« Vous prenez de la hauteur, votre entreprise aussi. ») + CTA « Diagnostic gratuit ↓ ».
  Construction validée sur Sinek (croyance, pas accusation ni promesse creuse) + Max L&I
  (le client est le héros, le levier c'est lui). Détail : brief QG + journal latitude-marque.
