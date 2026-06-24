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

/* ------------------------------- Écriture --------------------------------- */
fs.mkdirSync(OUT, { recursive: true });
const all = { ...wordmark(), ...squareMark() };
for (const [name, content] of Object.entries(all)) {
  fs.writeFileSync(path.join(OUT, name), content);
  console.log('écrit', name);
}
