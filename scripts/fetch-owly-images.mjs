// One-off asset fetcher for the Owly program.
// Downloads a real illustration for every picture subject used in the lessons
// into public/owly-img/<slug>.jpg so the app serves local static files.
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname } from "node:path";

const STYLE =
  "cute flat vector illustration for a preschool learning app, " +
  "soft rounded shapes, warm earthy pastel palette, thick friendly outlines, " +
  "centered, plain white background, no text, high quality";

const OWLY_SUBJECT =
  "a friendly cartoon baby owl mascot named Owly, big round eyes, " +
  "fluffy teal and cream feathers, tiny orange beak, cheerful expression";

const SUBJECTS = [
  // units
  "a colorful alphabet blocks tower",
  "playful wooden number and shape blocks",
  "an open storybook with a bookmark",
  "a leafy green forest scene with sun",
  // objects / animals
  "a shiny red apple",
  "a ripe yellow banana",
  "a bunch of purple grapes",
  "a woven wicker basket",
  "a fluffy white cloud",
  "a crescent moon",
  "a bright yellow star",
  "a colorful soccer ball",
  "a cute orange cat",
  "a green leafy tree",
  "a small friendly green gecko",
  "a gecko climbing a brick wall",
  "a gecko catching a little bug",
  "a spiky green durian fruit",
  "a brown eagle bird",
  "a silver fish",
  "a brown eagle bird with spread wings",
  "a pink blooming flower",
  "a big grey elephant",
  "a cozy bird nest made of twigs",
  "colorful party balloons and confetti",
  OWLY_SUBJECT,
];

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const OUT = new URL("../public/owly-img/", import.meta.url);

const url = (subject, seed) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(
    `${subject}, ${STYLE}`
  )}?width=512&height=512&seed=${seed}&nologo=true`;

const exists = async (p) => {
  try { await access(p); return true; } catch { return false; }
};

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const subject of SUBJECTS) {
    const file = new URL(`${slug(subject)}.jpg`, OUT);
    if (await exists(file)) { console.log("skip", slug(subject)); continue; }
    const seed = Math.abs([...subject].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)) % 100000;
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      try {
        const res = await fetch(url(subject, seed), { signal: AbortSignal.timeout(60000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 1000) throw new Error(`too small ${buf.length}`);
        await mkdir(dirname(file.pathname), { recursive: true });
        await writeFile(file, buf);
        console.log("ok  ", slug(subject), buf.length);
        ok = true;
      } catch (e) {
        console.log("retry", slug(subject), attempt, String(e.message || e));
      }
    }
    if (!ok) console.error("FAIL", slug(subject));
  }
}

main();
