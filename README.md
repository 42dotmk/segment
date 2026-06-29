# Segment

A custom display font, packaged for web distribution.

62 glyphs — uppercase `A`–`Z` (`U+0041`–`U+005A`), lowercase `a`–`z`
(`U+0061`–`U+007A`), and digits `0`–`9` (`U+0030`–`U+0039`). Ships as
`woff2`, `woff`, `ttf`, and `svg` with a ready-to-use CSS file.

## Quick start

```bash
npm install @42mk/segment
```

```css
@import "@42mk/segment/css";

.label {
  font-family: "Segment", sans-serif;
}
```

The imported CSS defines the `@font-face` and a `.segment` helper class.

## Try it / preview

Clone the repo and run the demo page:

```bash
git clone https://github.com/42dotmk/Segment.git segment
cd segment
npm install
npm run build
npm run demo
```

Then open <http://localhost:8080>.

The demo (`demo/index.html`) shows a pangram, a live input tester, and the
full A–Z / a–z / 0–9 glyph grid with codepoint labels. It loads fonts directly
from `dist/`, so you must `npm run build` at least once before starting it.

Any static server works — `npm run demo` just wraps `npx http-server demo`.

## Install options

### As an npm package

```bash
npm install @42mk/segment
```

Available subpath exports:

| Import                          | File                      |
| ------------------------------- | ------------------------- |
| `@42mk/segment` / `.../css`     | `dist/segment.css`        |
| `@42mk/segment/woff2`           | `dist/segment.woff2`      |
| `@42mk/segment/woff`            | `dist/segment.woff`       |
| `@42mk/segment/ttf`             | `dist/segment.ttf`        |
| `@42mk/segment/svg`             | `dist/segment.svg`        |
| `@42mk/segment/glyph-map`       | `dist/glyph-map.json`     |

### Direct file reference

```html
<link rel="preload" href="/@42mk/segment/dist/segment.woff2"
      as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/@42mk/segment/dist/segment.css">
```

## Build from source

```bash
npm install
npm run build     # outputs dist/
npm run clean     # removes dist/ and build/
```

Pipeline: `src/svg/*.svg` → stroke-expand (`oslllo-svg-fixer`) →
`svgicons2svgfont` → `svg2ttf` → `ttf2woff` + `wawoff2` → `dist/`.

Source SVGs are named `{HEX4}-{char}.svg`, where the hex prefix is the
Unicode codepoint the glyph maps to. Add or replace glyphs by dropping
files into `src/svg/` using that convention, then rebuild.

## Scripts

| Command         | What it does                                  |
| --------------- | --------------------------------------------- |
| `npm run build` | Build all font formats + CSS into `dist/`     |
| `npm run demo`  | Serve `demo/` on http://localhost:8080        |
| `npm run clean` | Remove `dist/` and `build/`                   |

## Layout

```
src/svg/              source glyphs (unicode-prefixed filenames)
scripts/              build pipeline
dist/                 built font files + CSS (generated)
demo/                 local preview page
segment_font_export/  original icomoon export (reference only)
```

## Requirements

Node.js 18+ (ESM build scripts).

## Credits

- **Original design:** Pavlina Buchevska — designed the original SVG glyphs.
- **Number glyphs:** Mila Jovanovikj — designed the digit glyphs `0`–`9`.
- **Font conversion & packaging:** [Darko Bozhinovski](https://darko.io) —
  converted the original SVG design into a distributable web font.
- **Demo page & packaging fixes:** Ilija Boshkov — built the demo/landing
  page and tidied up the npm packaging.

## License

[SIL Open Font License 1.1](./LICENSE).
