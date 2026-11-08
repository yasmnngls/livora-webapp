// Generates sample avatar illustrations (no real faces) and PWA icons.
// Photos go to private/ (not public/) so only the gated photo route can serve them.
// Each avatar gets a full PNG and a separately rendered, heavily blurred PNG.
// The blurred file is what the server sends before a mutual accept, so the
// detail is not in the browser at all (a CSS blur could be removed).
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const AVATARS = [
  ["s1", "#f59e0b", "#7c2d12"],
  ["s2", "#10b981", "#064e3b"],
  ["s3", "#6366f1", "#1e1b4b"],
  ["s4", "#ec4899", "#500724"],
  ["s5", "#0ea5e9", "#0c4a6e"],
  ["s6", "#84cc16", "#365314"],
  ["s7", "#f97316", "#431407"],
  ["s8", "#a855f7", "#3b0764"],
];

function avatarSvg(bg, fg, seed) {
  const r = 40 + (seed % 3) * 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${bg}"/>
  <circle cx="200" cy="165" r="${r + 30}" fill="${fg}" opacity="0.9"/>
  <rect x="${110 - seed * 2}" y="270" width="${180 + seed * 4}" height="160" rx="80" fill="${fg}" opacity="0.9"/>
  <circle cx="${180}" cy="160" r="8" fill="${bg}"/><circle cx="${220}" cy="160" r="8" fill="${bg}"/>
  <path d="M175 195 Q200 ${210 + seed} 225 195" stroke="${bg}" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>`;
}

await mkdir("private/photos", { recursive: true });
await mkdir("public/icons", { recursive: true });

for (const [i, [id, bg, fg]] of AVATARS.entries()) {
  const svg = Buffer.from(avatarSvg(bg, fg, i));
  await sharp(svg).png().toFile(`private/photos/${id}.png`);
  // Downscale to 12px first so no shape detail survives, then blur up.
  const tiny = await sharp(svg).resize(12, 12).png().toBuffer();
  await sharp(tiny).resize(400, 400, { kernel: "cubic" }).blur(18).png().toFile(`private/photos/${id}-blurred.png`);
}

const icon = (size) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#0f766e"/>
  <path d="M22 52 L50 28 L78 52 V78 H22 Z" fill="#f0fdfa"/>
  <circle cx="41" cy="60" r="6" fill="#0f766e"/><circle cx="59" cy="60" r="6" fill="#0f766e"/>
</svg>`);
for (const size of [192, 512]) await sharp(icon(size)).png().toFile(`public/icons/icon-${size}.png`);
await sharp(icon(180)).png().toFile("public/icons/apple-touch-icon.png");
console.log("assets written");
