// Rend chaque slide d'un carrousel en PNG 1080 × 1350 (Chrome headless, rendu déterministe).
// Usage : bun rendre-carrousel.ts <slug> [sombre|clair]   →  sortie/<slug>/<slug>-01.png …
import { $ } from "bun";
import { mkdirSync, readFileSync } from "fs";
const [slug, ton = "sombre"] = process.argv.slice(2);
if (!slug) { console.error("usage : bun rendre-carrousel.ts <slug> [sombre|clair]"); process.exit(1); }
const total = (readFileSync(`data/${slug}.js`, "utf8").match(/type:/g) || []).length;
const out = `sortie/${slug}`; mkdirSync(out, { recursive: true });
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
for (let n = 1; n <= total; n++) {
  const png = `${out}/${slug}-${String(n).padStart(2, "0")}.png`;
  const url = `file://${process.cwd()}/carrousel-performance.html#d=${slug}&n=${n}&ton=${ton}`;
  await $`${chrome} --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=4000 --window-size=1080,1350 --screenshot=${png} ${url}`.quiet();
  console.log(png);
}
