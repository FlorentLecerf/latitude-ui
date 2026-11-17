#!/usr/bin/env bun
// Rend un scénario de vidéo animée Latitude en MP4, avec le Chrome installé et ffmpeg.
//
//   bun rendre.ts <scenario.md|scenario.json> --sortie <dossier> [--nom <base>] [--formats 4x5,9x16] [--planche]
//
//   --sortie   dossier où poser les fichiers (obligatoire ; jamais un dépôt git : un MP4 va sur le Drive)
//   --nom      nom de base des fichiers (défaut : celui du scénario)
//   --formats  4x5 (1080×1350 : LinkedIn, fil Instagram) et/ou 9x16 (1080×1920 : Reels, TikTok, Shorts)
//   --planche  ne sort que la planche d'images repères (deux par scène), pour vérifier avant le rendu
//
// Le scénario est un JSON, seul ou dans le premier bloc ```json d'un fichier Markdown.
// Un fichier « <scénario>.scenes.js » posé à côté ajoute des scènes sur mesure (voir README.md).
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";

const ICI = import.meta.dir;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FPS = 30;

export function lireScenario(chemin: string): any {
  const brut = readFileSync(chemin, "utf8");
  if (extname(chemin) === ".json") return JSON.parse(brut);
  const m = brut.match(/```json\s*\n([\s\S]*?)\n```/);
  if (!m) throw new Error(`pas de bloc \`\`\`json dans ${chemin}`);
  return JSON.parse(m[1]);
}

// une photo que Chrome ne sait pas lire (HEIC) est convertie en JPEG dans le dossier temporaire
function preparerPhoto(sc: any, base: string) {
  if (!sc.photo) return;
  const src = resolve(base, sc.photo.replace(/^~/, process.env.HOME || "~"));
  if (!existsSync(src)) throw new Error(`photo introuvable : ${src}`);
  if (/\.(jpe?g|png|webp)$/i.test(src)) { sc.photo = src; return; }
  const dest = join(tmpdir(), `latitude-motion-photo-${Bun.hash(src).toString(16)}.jpg`);
  const r = spawnSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "88", "-Z", "2600", src, "--out", dest], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`conversion de la photo impossible : ${r.stderr}`);
  sc.photo = dest;
}

export async function ouvrirChrome() {
  const port = 9300 + Math.floor(Math.random() * 400);
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${join(tmpdir(), "latitude-motion-chrome")}`,
    "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1080,1920",
    "--allow-file-access-from-files", "--no-first-run", "--disable-gpu", "about:blank",
  ], { stdio: "ignore" });
  let cible: any;
  for (let i = 0; i < 80 && !cible; i++) {
    try { cible = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((x: any) => x.type === "page"); } catch {}
    if (!cible) await Bun.sleep(250);
  }
  if (!cible) { chrome.kill(); throw new Error("Chrome ne répond pas (un autre rendu est peut-être en cours)"); }
  const ws = new WebSocket(cible.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const attente = new Map<number, (d: any) => void>();
  ws.onmessage = (m) => { const d = JSON.parse(String(m.data)); if (d.id && attente.has(d.id)) { attente.get(d.id)!(d); attente.delete(d.id); } };
  const cdp = (method: string, params: any = {}) => new Promise<any>((res) => { const i = ++id; attente.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const js = async (expression: string) => {
    const r = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    const ex = r.result?.exceptionDetails;
    if (ex) throw new Error(ex.exception?.description?.split("\n")[0] || ex.text);
    return r.result?.result?.value;
  };
  return { cdp, js, fermer() { try { ws.close(); } catch {} chrome.kill(); } };
}
type Page = Awaited<ReturnType<typeof ouvrirChrome>>;

// charge le moteur dans une page neuve et lui donne le scénario ; rend { duree, scenes, reperes }
export async function preparer(c: Page, scenario: any, format: string, surMesure?: string) {
  const H = format === "9x16" ? 1920 : 1350, tag = `f=${format}&t=${Date.now()}`;
  await c.cdp("Emulation.setDeviceMetricsOverride", { width: 1080, height: H, deviceScaleFactor: 1, mobile: false });
  await c.cdp("Page.navigate", { url: `file://${encodeURI(join(ICI, "moteur.html"))}?${tag}` });
  let pret = false;
  for (let i = 0; i < 100 && !pret; i++) {
    pret = (await c.js(`typeof window.demarrer === "function" && location.search.includes(${JSON.stringify(tag)})`).catch(() => false)) === true;
    if (!pret) await Bun.sleep(100);
  }
  if (!pret) throw new Error("le moteur ne s'est pas chargé");
  if (surMesure) await c.js(surMesure);
  return await c.js(`window.demarrer(${JSON.stringify(scenario)}, ${JSON.stringify(format)})`);
}

export async function image(c: Page, t: number): Promise<Buffer> {
  await c.js(`window.image(${t.toFixed(5)})`);
  const shot = await c.cdp("Page.captureScreenshot", { format: "jpeg", quality: 96 });
  return Buffer.from(shot.result.data, "base64");
}

// ffmpeg nourri image par image par son entrée standard : aucun fichier temporaire
export function ffmpeg(args: string[]) {
  const proc = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg", ...args], { stdio: ["pipe", "ignore", "pipe"] });
  let err = "";
  proc.stderr!.on("data", (d) => (err += d));
  const fini = new Promise<void>((res, rej) => proc.on("close", (code) => (code === 0 ? res() : rej(new Error("ffmpeg : " + err.trim())))));
  return {
    ecrire: (buf: Buffer) => new Promise<void>((res, rej) => proc.stdin!.write(buf, (e) => (e ? rej(e) : res()))),
    async fermer() { proc.stdin!.end(); await fini; },
  };
}

export async function planche(c: Page, temps: number[], sortie: string) {
  const cols = Math.min(temps.length, 6), rangs = Math.ceil(temps.length / cols);
  const f = ffmpeg(["-framerate", "1", "-i", "-", "-vf", `scale=270:-1,tile=${cols}x${rangs}:padding=6:margin=6:color=0x111111`, "-frames:v", "1", sortie]);
  for (const t of temps) await f.ecrire(await image(c, t));
  await f.fermer();
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const opt = (nom: string) => { const i = args.indexOf("--" + nom); return i >= 0 ? args[i + 1] : undefined; };
  const fichier = args.find((a, i) => !a.startsWith("--") && !(args[i - 1] || "").match(/^--(sortie|nom|formats)$/));
  if (!fichier || !opt("sortie")) {
    console.error("usage : bun rendre.ts <scenario.md|json> --sortie <dossier> [--nom <base>] [--formats 4x5,9x16] [--planche]");
    process.exit(2);
  }
  const chemin = resolve(fichier), sortie = resolve(opt("sortie")!.replace(/^~/, process.env.HOME || "~"));
  const nom = opt("nom") || basename(chemin, extname(chemin));
  const formats = (opt("formats") || "4x5,9x16").split(",").map((f) => f.trim());
  const seulementPlanche = args.includes("--planche");
  const debut = Date.now();
  let c: Page | undefined;
  try {
    const scenario = lireScenario(chemin);
    preparerPhoto(scenario, dirname(chemin));
    const js = join(dirname(chemin), basename(chemin, extname(chemin)) + ".scenes.js");
    const surMesure = existsSync(js) ? readFileSync(js, "utf8") : undefined;
    mkdirSync(sortie, { recursive: true });
    c = await ouvrirChrome();
    for (const [i, format] of formats.entries()) {
      const info = await preparer(c, scenario, format, surMesure);
      if (i === 0) {
        console.log(`fond « ${scenario.fond || "carte"} », ${info.scenes.length} scènes, ${info.duree.toFixed(1)} s`);
        for (const s of info.scenes) console.log(`  ${String(s.debut).padStart(5)} s  ${s.type} (${s.duree} s)`);
        if (seulementPlanche) {
          const png = join(sortie, `${nom}-planche.png`);
          await planche(c, info.reperes, png);
          console.log(`planche : ${png}`);
          break;
        }
      }
      const mp4 = join(sortie, `${nom}-${format}.mp4`);
      const f = ffmpeg(["-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
      const n = Math.round(info.duree * FPS);
      for (let k = 0; k < n; k++) await f.ecrire(await image(c, k / FPS));
      await f.fermer();
      console.log(`vidéo ${format} : ${mp4}`);
    }
    console.log(`fait en ${((Date.now() - debut) / 1000).toFixed(0)} s`);
  } catch (e: any) {
    console.error("ÉCHEC : " + (e?.message || e));
    process.exitCode = 1;
  } finally {
    c?.fermer();
  }
}
