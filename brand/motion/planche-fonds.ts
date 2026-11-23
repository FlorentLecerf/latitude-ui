// La planche des fonds : tous les décors du moteur, dans leurs deux tons, à deux moments d'une même vidéo
// (la fin de l'accroche, quand le décor commence ; la fin des étiquettes, quand il est arrivé). C'est le catalogue
// qu'on regarde pour choisir un fond, et celui qui va sur le Drive (04_IDENTITE-MARQUE/Charte-Graphique/).
// À relancer chaque fois qu'un fond est ajouté ou retouché.
//
//   bun planche-fonds.ts --sortie <fichier.png> [--format 4x5|9x16]
//
// Disposition : une colonne par fond ; rangs 1 et 2 dans son ton par défaut, rangs 3 et 4 dans l'autre ton.
import { ouvrirChrome, preparer, image, ffmpeg } from "./rendre.ts";

// le texte d'exemple : celui de la première vidéo publiée (« Vous déléguez déjà », 17/11/2026), comme l'ancienne planche
const EXEMPLE = [
  { type: "accroche", lignes: ["Vous déléguez déjà.", "Alors pourquoi *tout vous revient* encore ?"], sous: "Ce que votre organigramme ne dit pas" },
  { type: "etiquettes", titre: "Les raisons de ne pas lâcher", items: ["La confiance", "Le contrôle", "La loyauté", "La fierté du métier"], chute: "Ce n'est jamais un problème d'organisation" },
];

const args = process.argv.slice(2), opt = (n: string) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : undefined; };
const sortie = opt("sortie"), format = opt("format") || "4x5";
if (!sortie) { console.error("usage : bun planche-fonds.ts --sortie <fichier.png> [--format 4x5|9x16]"); process.exit(1); }

const c = await ouvrirChrome();
try {
  // les fonds à deux tons, lus dans moteur.html, dans son ordre, avec leur ton par défaut (la photo n'y est pas)
  const moteur = await Bun.file(import.meta.dir + "/moteur.html").text();
  const fonds = [...moteur.matchAll(/^  ([a-z]+): \{ theme: "(clair|sombre)", tons: true/gm)].map((m) => ({ nom: m[1], theme: m[2] }));
  const rangs: Buffer[][] = [[], [], [], []];
  for (const f of fonds) {
    const autre = f.theme === "clair" ? "sombre" : "clair";
    for (const [k, ton] of [[0, f.theme], [2, autre]] as [number, string][]) {
      const info = await preparer(c, { titre: "planche", fond: f.nom, ton, logo: true, scenes: EXEMPLE }, format);
      rangs[k].push(await image(c, info.reperes[1]));
      rangs[k + 1].push(await image(c, info.reperes[3]));
    }
    console.log(`${f.nom} : ${f.theme}, puis ${autre}`);
  }
  const n = fonds.length, t = ffmpeg(["-framerate", "1", "-i", "-", "-vf", `scale=300:-1,tile=${n}x4:padding=8:margin=8:color=0x111111`, "-frames:v", "1", sortie]);
  for (const r of rangs) for (const b of r) await t.ecrire(b);
  await t.fermer();
  console.log(`planche : ${sortie} (${n} fonds × 2 tons × 2 moments)`);
} finally {
  c.fermer();
}
