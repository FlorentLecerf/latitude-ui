/* ============================================================================
   Génère les masters vectoriels de marque Latitude (brand/masters/*.svg).

   Le logo est typographique (cf. <Logo/> + .logo-mark dans src/) : « Latitude »
   en DM Serif Display suivi d'un point (glyphe `.`) recoloré terracotta. Ici on
   matérialise ce rendu en VRAIES outlines (chemins, indépendantes de la police),
   fidèles au web : kerning + letter-spacing -0.01em, le point = glyphe DM Serif.

   Usage :  cd brand/tools && npm i opentype.js && node generate-masters.js
   Sortie : ../masters/*.svg (déterministe — régénère à l'identique).
   ========================================================================== */
const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');

const FONT = path.join(__dirname, 'fonts', 'DMSerifDisplay-Regular.ttf');
const OUT = path.join(__dirname, '..', 'masters');
const font = opentype.parse(fs.readFileSync(FONT).buffer);

// Tokens (miroir de src/theme.css)
const ANTHRACITE = '#262523';
const TERRACOTTA = '#E07855';
const CREME = '#FAFAF8';

const FS = 1000;        // unités = em (précision)
const LS = -0.01;       // letter-spacing -0.01em (.logo-mark)

function bbox(paths) {
  let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
  for (const p of paths) {
    const b = p.getBoundingBox();
    x1 = Math.min(x1, b.x1); y1 = Math.min(y1, b.y1);
    x2 = Math.max(x2, b.x2); y2 = Math.max(y2, b.y2);
  }
  return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1 };
}

/* ----------------------------- Wordmark ----------------------------------- */
function wordmark() {
  const glyphs = font.getPaths('Latitude.', 0, 0, FS, { kerning: true, letterSpacing: LS });
  const b = bbox(glyphs);
  const vb = `${b.x1.toFixed(1)} ${b.y1.toFixed(1)} ${b.w.toFixed(1)} ${b.h.toFixed(1)}`;
  const text = glyphs.slice(0, -1).map(p => p.toPathData(2)).join(' ');
  const dot = glyphs[glyphs.length - 1].toPathData(2);
  const svg = (textC, dotC) =>
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Latitude">
  <title>Latitude</title>
  <path d="${text}" fill="${textC}"/>
  <path d="${dot}" fill="${dotC}"/>
</svg>
`;
  return {
    'wordmark-latitude.svg': svg(ANTHRACITE, TERRACOTTA),
    'wordmark-latitude-on-dark.svg': svg(CREME, TERRACOTTA),
    'wordmark-latitude-mono-anthracite.svg': svg(ANTHRACITE, ANTHRACITE),
    'wordmark-latitude-mono-creme.svg': svg(CREME, CREME),
  };
}

/* --------------------------- Marque carrée (A) ---------------------------- */
// « L. » centrée dans un carré 1000×1000 ; le point = glyphe DM Serif (variante A).
function squareMark() {
  const S = 1000, PAD = 140;
  const glyphs = font.getPaths('L.', 0, 0, FS, { kerning: true });
  const b = bbox(glyphs);
  const avail = S - 2 * PAD;
  const s = avail / Math.max(b.w, b.h);
  const tx = PAD + (avail - b.w * s) / 2 - b.x1 * s;
  const ty = PAD + (avail - b.h * s) / 2 - b.y1 * s;
  const L = glyphs.slice(0, -1).map(p => p.toPathData(2)).join(' ');
  const dot = glyphs[glyphs.length - 1].toPathData(2);
  const svg = (textC, dotC) =>
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="Latitude">
  <g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s.toFixed(4)})">
    <path d="${L}" fill="${textC}"/><path d="${dot}" fill="${dotC}"/>
  </g></svg>
`;
  return {
    'square-mark.svg': svg(ANTHRACITE, TERRACOTTA),
    'square-mark-on-dark.svg': svg(CREME, TERRACOTTA),
  };
}

/* --------------------------- Marque CRM (F1) ------------------------------ */
// Favicon du CRM, validé 13/07/2026 : tuile anthracite arrondie + « CRM » plein
// cadre en DM Sans ExtraBold (wght 800, instancié depuis la variable) + point
// terracotta = glyphe « . » DM Serif (ADN wordmark), élargi à 0.275em pour rester
// visible à 16 px. Contrairement aux autres masters, la tuile fait partie du
// dessin : c'est elle qui distingue l'onglet CRM de l'onglet site.
function crmMark() {
  const sans = opentype.parse(
    fs.readFileSync(path.join(__dirname, 'fonts', 'DMSans-ExtraBold.ttf')).buffer);
  const S = 1000, R = 180, PAD = 92;
  const crm = sans.getPaths('CRM', 0, 0, FS, { kerning: true, letterSpacing: -0.02 });
  const bC = bbox(crm);
  const dotGlyph = font.getPaths('.', 0, 0, FS, {});
  const bD = bbox(dotGlyph);
  const dotScale = (0.275 * FS) / bD.w;   // diamètre visé 0.275em (proportion validée)
  const GAP = 0.07 * FS;
  const totalW = bC.w + GAP + bD.w * dotScale;
  const s = (S - 2 * PAD) / totalW;
  const tx = PAD - bC.x1 * s;
  const ty = (S - bC.h * s) / 2 - bC.y1 * s;   // bloc de caps centré verticalement
  const dx = bC.x2 + GAP - bD.x1 * dotScale;   // point posé sur la ligne de base
  const crmD = crm.map(p => p.toPathData(2)).join(' ');
  const dotD = dotGlyph.map(p => p.toPathData(2)).join(' ');
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="Latitude CRM">
  <rect width="${S}" height="${S}" rx="${R}" fill="${ANTHRACITE}"/>
  <g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s.toFixed(4)})">
    <path d="${crmD}" fill="${CREME}"/>
    <g transform="translate(${dx.toFixed(1)} 0) scale(${dotScale.toFixed(4)})"><path d="${dotD}" fill="${TERRACOTTA}"/></g>
  </g></svg>
`;
  return { 'crm-mark.svg': svg };
}

/* ------------------------------- Écriture --------------------------------- */
fs.mkdirSync(OUT, { recursive: true });
const all = { ...wordmark(), ...squareMark(), ...crmMark() };
for (const [name, content] of Object.entries(all)) {
  fs.writeFileSync(path.join(OUT, name), content);
  console.log('écrit', name);
}
