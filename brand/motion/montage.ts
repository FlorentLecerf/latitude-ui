#!/usr/bin/env bun
// Monte une vidéo face caméra de Florent : coupes, sous-titres calés au mot, titre d'accroche, incrustations du moteur.
// L'agent fait le montage lui-même, avec ffmpeg, whisper.cpp et le Chrome installé ; rien ne passe par un logiciel de montage.
//
//   bun montage.ts <montage.json> --sortie <dossier> [--nom <base>] [--transcription]
//
//   --transcription  coupe et transcrit seulement, puis affiche les sous-titres avec leurs temps (sur la vidéo coupée) :
//                    on relit le texte (corrections) et on choisit les moments des incrustations avant le rendu
//
// Le fichier de montage (JSON, seul ou dans le premier bloc ```json d'un Markdown) :
// {
//   "source": "/chemin/du/rush.mov",                      la prise de Florent, 9x16
//   "coupes": [[0, 1.3], [94.35, 95.25]],                  passages à retirer, en secondes de la PRISE
//   "titre": { "lignes": ["Tout était prêt.", "*Sauf moi.*"], "jusqua": 5, "fin": 4 },   accroche en haut, *accent* terracotta :
//            les « jusqua » premières secondes, puis de retour sur les « fin » dernières (0 : pas de retour)
//   "sous_titres": { "decalage": 0.3, "corrections": { "boîtes en": "watts en" } },   false pour s'en passer
//   "incrustations": [ { "fond": "plafond", "debut": 20.5, "duree": 6 } ],          en secondes de la vidéo COUPÉE
//   "miniature": 1.0                                        instant de la miniature (défaut : 1 s, le titre à l'écran)
// }
// Une incrustation est le décor seul d'un fond du moteur (« "fond" », deux tons), sur fond transparent, posé en bas du
// cadre sous les sous-titres. "plein": "<scénario.md>" pose à la place une courte vidéo animée en plein écran (le son
// de Florent continue dessous).
//
// Sorties : <nom>.mp4 (H.264, son AAC) et <nom>-miniature.jpg. Le travail intermédiaire (prise coupée, transcription,
// images des sous-titres, incrustations) reste dans <sortie>/.travail-<nom>/ et sert de cache d'un passage à l'autre.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { ouvrirChrome, lireScenario, rendreIncrustation, preparer, image, ffmpeg } from "./rendre.ts";

const ICI = import.meta.dir, FONTS = join(ICI, "../tools/fonts"), FPS = 30;
const MODELE = join(process.env.HOME!, ".cache/whisper.cpp/ggml-medium.bin");
const Y_SOUS_TITRES = 1380, Y_TITRE = 130; // centre des sous-titres (sous le menton, validé le 20/11/2026), haut du filet du titre (registre fin, 23/11)

const run = (cmd: string, args: string[]) => {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`${cmd} : ${(r.stderr || r.stdout || "").trim().split("\n").slice(-3).join(" ")}`);
  return r.stdout;
};
const duree = (f: string) => parseFloat(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]));
const typo = (s: string) => s.replace(/'/g, "’").replace(/\s*([?!:;»])/g, " $1").replace(/«\s*/g, "« ").replace(/\s+/g, " ").trim();
const echap = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// 1. la prise coupée : on garde le complément des coupes
function couper(m: any, travail: string) {
  const src = resolve(m.source.replace(/^~/, process.env.HOME!)), sortie = join(travail, "coupe.mp4"), cle = join(travail, "coupe.cle");
  if (!existsSync(src)) throw new Error(`rush introuvable : ${src}`);
  const signature = JSON.stringify([src, m.coupes || []]);
  if (existsSync(sortie) && existsSync(cle) && readFileSync(cle, "utf8") === signature) return sortie;
  const D = duree(src), coupes = [...(m.coupes || [])].sort((a: number[], b: number[]) => a[0] - b[0]);
  const garde: number[][] = []; let t = 0;
  for (const [a, b] of coupes) { if (a > t) garde.push([t, a]); t = Math.max(t, b); }
  if (t < D) garde.push([t, D]);
  const fc = garde.map(([a, b], i) => `[0:v]trim=${a}:${b},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=${a}:${b},asetpts=PTS-STARTPTS[a${i}]`).join(";")
    + ";" + garde.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${garde.length}:v=1:a=1[v][a]`;
  run("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-r", String(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", sortie]);
  writeFileSync(cle, signature);
  return sortie;
}

// 2. la transcription au mot (whisper.cpp, modèle medium, en français), en cache
function transcrire(coupe: string, travail: string): [number, number, string][] {
  const json = join(travail, "mots.json");
  if (existsSync(json) && Bun.file(json).lastModified > Bun.file(coupe).lastModified) return JSON.parse(readFileSync(json, "utf8"));
  if (!existsSync(MODELE)) throw new Error(`modèle whisper absent : ${MODELE} (curl -L -o "${MODELE}" https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin)`);
  const wav = join(travail, "son.wav");
  run("ffmpeg", ["-y", "-loglevel", "error", "-i", coupe, "-ar", "16000", "-ac", "1", wav]);
  run("whisper-cli", ["-m", MODELE, "-l", "fr", "-ml", "1", "-sow", "-oj", "-of", join(travail, "whisper"), "-f", wav]);
  const brut = JSON.parse(readFileSync(join(travail, "whisper.json"), "utf8")).transcription;
  const mots = brut.map((x: any) => [x.offsets.from / 1000, x.offsets.to / 1000, x.text.trim()]).filter((x: any) => x[2]);
  writeFileSync(json, JSON.stringify(mots));
  return mots;
}

// 3. les sous-titres : des groupes de 4 mots ou 22 signes au plus, coupés après la ponctuation, retardés de « decalage »
function grouper(mots: [number, number, string][], st: any) {
  const groupes: [number, number, string][] = []; let cur: [number, number, string][] = [];
  const vider = () => { if (cur.length) groupes.push([cur[0][0], cur[cur.length - 1][1], cur.map((c) => c[2]).join(" ")]); cur = []; };
  for (const w of mots) {
    if (cur.length && ([...cur.map((c) => c[2]), w[2]].join(" ").length > 22 || cur.length >= 4)) vider();
    cur.push(w);
    if (/[.,?!»:]$/.test(w[2])) vider();
  }
  vider();
  const dec = st?.decalage ?? 0.3, corr = Object.entries(st?.corrections || {}) as [string, string][];
  return groupes.map(([a, b, t], k) => {
    for (const [de, vers] of corr) t = t.split(de).join(vers);
    const suivant = k + 1 < groupes.length ? groupes[k + 1][0] + dec : b + dec + 0.6;
    return [a + dec, suivant - (b + dec) > 0.5 ? b + dec + 0.5 : suivant - 0.01, typo(t)] as [number, number, string];
  });
}

// 4. les images fixes (sous-titres, titre), rendues par Chrome aux polices de la marque, fond transparent
async function rendreImages(c: any, groupes: [number, number, string][], titre: any, travail: string) {
  const page = join(travail, "textes.html");
  writeFileSync(page, `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:"DM Serif Display";src:url("file://${FONTS}/DMSerifDisplay-Regular.ttf")}
@font-face{font-family:"DM Sans";font-weight:800;src:url("file://${FONTS}/DMSans-ExtraBold.ttf")}
html,body{margin:0;background:transparent}
#b{position:absolute;left:0;top:0;display:inline-block;white-space:nowrap}
.st{font:800 72px/1 "DM Sans";color:#E07855;background:rgba(17,17,17,.92);border-radius:24px;padding:20px 36px 24px}
/* le titre, au registre fin (Florent, 23/11 : le bandeau noir « pas assez raffiné ») : pas d'aplat, un voile dégradé très doux
   sur le haut de l'image, un filet terracotta de 2 px, le serif plus fin, l'accent en couleur de texte */
.ti{width:1080px;height:520px;box-sizing:border-box;padding-top:${Y_TITRE}px;text-align:center;white-space:normal;
  background:linear-gradient(to bottom,rgba(20,19,18,.62),rgba(20,19,18,.36) 50%,rgba(20,19,18,0));
  font:400 72px/1.1 "DM Serif Display";letter-spacing:-.005em;color:#FBF8F4;text-shadow:0 2px 22px rgba(0,0,0,.35)}
.ti::before{content:"";display:block;width:72px;height:2px;background:#E07855;margin:0 auto 30px}
.ti i{font-style:normal;color:#E07855}
</style><div id="b"></div>`);
  await c.cdp("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
  await c.cdp("Page.navigate", { url: "file://" + encodeURI(page) });
  for (let i = 0; i < 50 && (await c.js(`!!document.getElementById("b") && document.readyState === "complete"`).catch(() => false)) !== true; i++) await Bun.sleep(100);
  await c.js(`document.fonts.load('800 72px "DM Sans"').then(() => document.fonts.load('72px "DM Serif Display"'))`);
  await c.cdp("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
  const cliche = async (cls: string, html: string, fichier: string) => {
    const r = await c.js(`(() => { const b = document.getElementById("b"); b.className = ${JSON.stringify(cls)}; b.innerHTML = ${JSON.stringify(html)}; const r = b.getBoundingClientRect(); return [r.width, r.height]; })()`);
    if (cls === "st" && r[0] > 1000) throw new Error(`texte trop large pour l'écran (${Math.round(r[0])} px) : ${html.replace(/<[^>]+>/g, "")}`);
    const shot = await c.cdp("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: Math.ceil(r[0]), height: Math.ceil(r[1]), scale: 1 } });
    writeFileSync(fichier, Buffer.from(shot.result.data, "base64"));
  };
  mkdirSync(join(travail, "st"), { recursive: true });
  const fichiers: string[] = [];
  for (const [k, g] of groupes.entries()) { const f = join(travail, "st", `${String(k).padStart(3, "0")}.png`); await cliche("st", echap(g[2]), f); fichiers.push(f); }
  let titrePng: string | null = null;
  if (titre?.lignes?.length) {
    titrePng = join(travail, "titre.png");
    await cliche("ti", titre.lignes.map((l: string) => echap(typo(l)).replace(/\*([^*]+)\*/g, "<i>$1</i>")).join("<br>"), titrePng);
  }
  await c.cdp("Emulation.setDefaultBackgroundColorOverride", {});
  return { fichiers, titrePng };
}

if (import.meta.main) {
  const args = process.argv.slice(2), opt = (n: string) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : undefined; };
  const fichier = args.find((a, i) => !a.startsWith("--") && !(args[i - 1] || "").match(/^--(sortie|nom)$/));
  if (!fichier || !opt("sortie")) { console.error("usage : bun montage.ts <montage.json|md> --sortie <dossier> [--nom <base>] [--transcription]"); process.exit(2); }
  const chemin = resolve(fichier), m = lireScenario(chemin), sortie = resolve(opt("sortie")!.replace(/^~/, process.env.HOME!));
  const nom = opt("nom") || basename(chemin, extname(chemin)).replace(/-montage$/, ""), travail = join(sortie, `.travail-${nom}`);
  mkdirSync(travail, { recursive: true });
  const debut = Date.now();
  let c: any;
  try {
    const coupe = couper(m, travail), D = duree(coupe);
    const groupes = m.sous_titres === false ? [] : grouper(transcrire(coupe, travail), m.sous_titres);
    console.log(`prise coupée : ${D.toFixed(1)} s, ${groupes.length} sous-titres`);
    if (args.includes("--transcription")) {
      for (const g of groupes) console.log(`${g[0].toFixed(2).padStart(6)}  ${g[2]}`);
      process.exit(0);
    }
    c = await ouvrirChrome();
    const { fichiers, titrePng } = await rendreImages(c, groupes, m.titre, travail);
    // les incrustations : le décor seul (transparent, en bas) ou une animation plein écran
    const incs: { f: string; debut: number; plein: boolean }[] = [];
    for (const [k, inc] of (m.incrustations || []).entries()) {
      const f = join(travail, `incrustation-${k}.${inc.plein ? "mp4" : "mov"}`);
      if (inc.plein) {
        const sc = lireScenario(resolve(dirname(chemin), inc.plein)), info = await preparer(c, sc, "9x16");
        const enc = ffmpeg(["-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", f]);
        for (let n = 0; n < Math.round(info.duree * FPS); n++) await enc.ecrire(await image(c, n / FPS));
        await enc.fermer();
      } else await rendreIncrustation(c, { fond: inc.fond || "courbe", duree: inc.duree || 6 }, f);
      if (inc.debut < 0 || inc.debut > D) throw new Error(`incrustation ${k + 1} : début ${inc.debut} s hors de la vidéo (${D.toFixed(1)} s)`);
      incs.push({ f, debut: inc.debut, plein: !!inc.plein });
      console.log(`incrustation ${k + 1} : ${inc.plein ? "plein écran " + inc.plein : "fond « " + (inc.fond || "courbe") + " »"} à ${inc.debut} s`);
    }
    // l'assemblage : incrustations (sous les textes), sous-titres, titre
    const entrees = ["-i", coupe], fc: string[] = []; let v = "[0:v]", n = 1;
    for (const x of incs) {
      entrees.push("-i", x.f);
      fc.push(`[${n}:v]setpts=PTS-STARTPTS+${x.debut}/TB[i${n}]`, `${v}[i${n}]overlay=eof_action=pass:format=auto[o${n}]`); v = `[o${n}]`; n++;
    }
    groupes.forEach((g, k) => {
      entrees.push("-i", fichiers[k]);
      fc.push(`${v}[${n}:v]overlay=x=(W-w)/2:y=${Y_SOUS_TITRES}-h/2:enable='between(t,${g[0].toFixed(2)},${g[1].toFixed(2)})'[o${n}]`); v = `[o${n}]`; n++;
    });
    if (titrePng) {
      // le titre et son voile, en fondu : au début (« jusqua », 5 s par défaut), puis de retour sur la fin (« fin » : les
      // dernières secondes, 4 par défaut ; 0 pour ne pas le remettre). Florent, 23/11 : plus longtemps en haut, et à la fin.
      const jusqua = Number(m.titre.jusqua ?? 5), retour = Number(m.titre.fin ?? 4);
      entrees.push("-loop", "1", "-t", String(jusqua + 0.1), "-i", titrePng);
      fc.push(`[${n}:v]format=rgba,fade=in:st=0:d=0.3:alpha=1,fade=out:st=${(jusqua - 0.5).toFixed(2)}:d=0.5:alpha=1[t${n}]`, `${v}[t${n}]overlay=0:0:eof_action=pass[o${n}]`); v = `[o${n}]`; n++;
      if (retour > 0) {
        const a = Math.max(jusqua + 1, D - retour);
        entrees.push("-loop", "1", "-t", String(D - a + 0.1), "-i", titrePng);
        fc.push(`[${n}:v]format=rgba,fade=in:st=0:d=0.5:alpha=1,setpts=PTS-STARTPTS+${a.toFixed(2)}/TB[t${n}]`, `${v}[t${n}]overlay=0:0:eof_action=pass[o${n}]`); v = `[o${n}]`; n++;
      }
    }
    const graphe = join(travail, "graphe.txt"); writeFileSync(graphe, fc.join(";") || "[0:v]null[o0]");
    const mp4 = join(sortie, `${nom}.mp4`);
    run("ffmpeg", ["-y", "-loglevel", "error", ...entrees, "-filter_complex_script", graphe, "-map", fc.length ? v : "[o0]", "-map", "0:a", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", "-t", String(D), mp4]);
    const jpg = join(sortie, `${nom}-miniature.jpg`);
    run("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(m.miniature ?? 1), "-i", mp4, "-frames:v", "1", "-q:v", "2", jpg]);
    console.log(`vidéo : ${mp4}\nminiature : ${jpg}\nfait en ${((Date.now() - debut) / 1000).toFixed(0)} s`);
  } catch (e: any) {
    console.error("ÉCHEC : " + (e?.message || e));
    process.exitCode = 1;
  } finally {
    c?.fermer();
  }
}
