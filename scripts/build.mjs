// Build pipeline: build/svg-fixed/*.svg → dist/segment.{svg,ttf,woff,woff2,css}
//
// Filename convention: "{HEX4}-{char}.svg" (e.g. "0041-A.svg"). The hex
// prefix is the target Unicode codepoint.

import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { Readable } from "node:stream";
import { resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { globby } from "globby";
import SVGIcons2SVGFont from "svgicons2svgfont";
import svg2ttf from "svg2ttf";
import ttf2woff from "ttf2woff";
import wawoff from "wawoff2";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));

const FAMILY = "Segment";
const SLUG = "segment";
const VERSION = pkg.version;
const FONT_HEIGHT = 1000;
const DESCENT = 150;
const NORMALIZE = true;
const CENTER = true;

const srcDir = resolve(root, "build/svg-fixed");
const distDir = resolve(root, "dist");
await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const files = (await globby("*.svg", { cwd: srcDir, absolute: true })).sort();
if (files.length === 0) {
  console.error("no fixed SVGs found — run `npm run prebuild` first");
  process.exit(1);
}

const glyphMap = {};

const svgFontPath = resolve(distDir, `${SLUG}.svg`);
const svgFontChunks = [];

const fontStream = new SVGIcons2SVGFont({
  fontName: FAMILY,
  fontHeight: FONT_HEIGHT,
  descent: DESCENT,
  normalize: NORMALIZE,
  centerHorizontally: CENTER,
  log: () => {},
});

fontStream.on("data", (chunk) => svgFontChunks.push(chunk));
const fontDone = new Promise((res, rej) => {
  fontStream.on("end", res);
  fontStream.on("error", rej);
});

for (const file of files) {
  const name = basename(file, ".svg");
  const m = name.match(/^([0-9A-Fa-f]{4,6})-(.+)$/);
  if (!m) {
    console.warn(`skip ${name} — no HEX prefix`);
    continue;
  }
  const cp = parseInt(m[1], 16);
  const char = String.fromCodePoint(cp);
  const glyphName = `${SLUG}-${m[2]}`;

  let svg = await readFile(file, "utf8");
  // oslllo-svg-fixer emits path coords in the `width`/`height` range but
  // leaves viewBox from the original source — rewrite viewBox so
  // svgicons2svgfont scales the glyph correctly within the em box.
  const wh = svg.match(/width="([\d.]+)"[^>]*height="([\d.]+)"/);
  if (wh) {
    svg = svg.replace(/viewBox="[^"]*"/, `viewBox="0 0 ${wh[1]} ${wh[2]}"`);
  }
  const stream = Readable.from([svg]);
  stream.metadata = { unicode: [char], name: glyphName };
  fontStream.write(stream);

  glyphMap[char] = { codepoint: cp, hex: m[1].toUpperCase(), name: glyphName };
}

fontStream.end();
await fontDone;

const svgFont = Buffer.concat(svgFontChunks).toString("utf8");
await writeFile(svgFontPath, svgFont);
console.log(`wrote ${svgFontPath}`);

const ttf = Buffer.from(
  svg2ttf(svgFont, {
    version: `Version ${VERSION.split(".").slice(0, 2).join(".")}`,
    description: pkg.description,
    url: pkg.repository?.url || "",
    copyright: "",
    ts: Math.floor(Date.now() / 1000),
  }).buffer
);
const ttfPath = resolve(distDir, `${SLUG}.ttf`);
await writeFile(ttfPath, ttf);
console.log(`wrote ${ttfPath}`);

const woff = Buffer.from(ttf2woff(ttf).buffer);
const woffPath = resolve(distDir, `${SLUG}.woff`);
await writeFile(woffPath, woff);
console.log(`wrote ${woffPath}`);

const woff2 = Buffer.from(await wawoff.compress(ttf));
const woff2Path = resolve(distDir, `${SLUG}.woff2`);
await writeFile(woff2Path, woff2);
console.log(`wrote ${woff2Path}`);

await writeFile(
  resolve(distDir, "glyph-map.json"),
  JSON.stringify(glyphMap, null, 2) + "\n"
);

const css = `@font-face {
  font-family: "${FAMILY}";
  src: url("./${SLUG}.woff2") format("woff2"),
       url("./${SLUG}.woff") format("woff"),
       url("./${SLUG}.ttf") format("truetype");
  font-weight: 0;
  font-style: normal;
  font-display: swap;
}

.segment,
.font-segment {
  font-family: "${FAMILY}", sans-serif;
  font-style: normal;
  font-weight: 0;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  letter-spacing: 0.06em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;
await writeFile(resolve(distDir, `${SLUG}.css`), css);
console.log(`wrote ${SLUG}.css`);
console.log(`\nbuild complete — ${files.length} glyphs → ${distDir}`);
