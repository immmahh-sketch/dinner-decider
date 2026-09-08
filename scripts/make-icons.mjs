// Generates the Dinner Decider app icon set from an inline SVG.
// Requires sharp:  npm i --no-save sharp   (dev-only, not a project dependency)
//   node scripts/make-icons.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const assets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');

const TEAL = '#0FB5A6';
const NAVY = '#161D2B';
const GOLD = '#FFD23F';
const PINK = '#FF2E7E';
const GREEN = '#25C685';
const BLUE = '#2D9CDB';
const VIOLET = '#6C5CE7';

/**
 * The mark: a white plate with a gold rim and a mini fortune-wheel, a pink
 * "decider" pointer at the top, and chunky crossed cutlery over it.
 * `bg` null => transparent (for splash / adaptive foreground).
 */
function markSvg({ size = 1024, bg = TEAL, scale = 1 } = {}) {
  const c = size / 2;
  const wheelColors = [PINK, GOLD, GREEN, BLUE, VIOLET, TEAL];
  const R = 300 * scale; // plate radius
  const wedge = (i) => {
    const a0 = (i * 60 - 90) * (Math.PI / 180);
    const a1 = ((i + 1) * 60 - 90) * (Math.PI / 180);
    const r = R - 34 * scale;
    return `M ${c} ${c} L ${(c + r * Math.cos(a0)).toFixed(1)} ${(c + r * Math.sin(a0)).toFixed(1)} A ${r} ${r} 0 0 1 ${(c + r * Math.cos(a1)).toFixed(1)} ${(c + r * Math.sin(a1)).toFixed(1)} Z`;
  };

  const s = scale;
  const cutlery = `
    <g transform="translate(${c} ${c - 6 * s})">
      <!-- fork -->
      <g transform="rotate(-15) translate(${-138 * s} ${-300 * s})" fill="${NAVY}">
        <rect x="${-60 * s}" y="0" width="${24 * s}" height="${175 * s}" rx="${12 * s}"/>
        <rect x="${-12 * s}" y="0" width="${24 * s}" height="${175 * s}" rx="${12 * s}"/>
        <rect x="${36 * s}" y="0" width="${24 * s}" height="${175 * s}" rx="${12 * s}"/>
        <path d="M ${-60 * s} ${140 * s} L ${60 * s} ${140 * s} L ${44 * s} ${230 * s} Q ${44 * s} ${250 * s} ${24 * s} ${250 * s} L ${-24 * s} ${250 * s} Q ${-44 * s} ${250 * s} ${-44 * s} ${230 * s} Z"/>
        <rect x="${-24 * s}" y="${232 * s}" width="${48 * s}" height="${360 * s}" rx="${24 * s}"/>
      </g>
      <!-- knife -->
      <g transform="rotate(15) translate(${138 * s} ${-300 * s})" fill="${NAVY}">
        <path d="M ${-30 * s} ${10 * s} Q ${38 * s} ${20 * s} ${30 * s} ${250 * s} Q ${30 * s} ${290 * s} ${-8 * s} ${300 * s} L ${-30 * s} ${300 * s} Z"/>
        <rect x="${-24 * s}" y="${292 * s}" width="${48 * s}" height="${300 * s}" rx="${24 * s}"/>
      </g>
    </g>`;

  const pointer = `<path d="M ${c} ${c - R - 6 * scale} l ${44 * scale} ${-70 * scale} l ${-88 * scale} 0 Z" fill="${PINK}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : ''}
    ${bg ? `<circle cx="${size * 0.32}" cy="${size * 0.28}" r="${size * 0.5}" fill="#ffffff" opacity="0.06"/>` : ''}
    <circle cx="${c}" cy="${c}" r="${R + 8 * scale}" fill="${GOLD}"/>
    <circle cx="${c}" cy="${c}" r="${R - 20 * scale}" fill="#ffffff"/>
    <g>${wheelColors.map((col, i) => `<path d="${wedge(i)}" fill="${col}" opacity="0.45"/>`).join('')}</g>
    <circle cx="${c}" cy="${c}" r="${R - 20 * scale}" fill="none" stroke="${NAVY}" stroke-width="${14 * scale}"/>
    <circle cx="${c}" cy="${c}" r="${40 * scale}" fill="#ffffff" stroke="${NAVY}" stroke-width="${12 * scale}"/>
    ${pointer}
    ${cutlery}
  </svg>`;
}

async function render(svg, size, out, { flatten } = {}) {
  let img = sharp(Buffer.from(svg)).resize(size, size);
  if (flatten) img = img.flatten({ background: flatten });
  const buf = await img.png().toBuffer();
  writeFileSync(join(assets, out), buf);
  console.log('  ', out, `${size}x${size}`, `${(buf.length / 1024).toFixed(1)}kb`);
}

const jobs = [
  // main iOS/store icon — opaque teal, full bleed
  [markSvg({ size: 1024, bg: TEAL }), 1024, 'icon.png'],
  // Android adaptive foreground — mark only, generous safe-zone padding, transparent
  [markSvg({ size: 1024, bg: null, scale: 0.62 }), 1024, 'android-icon-foreground.png'],
  // Android adaptive background — flat teal
  [`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${TEAL}"/></svg>`, 1024, 'android-icon-background.png'],
  // Android monochrome — single-colour silhouette on transparent
  [markSvg({ size: 1024, bg: null, scale: 0.62 })
    .replace(new RegExp(`${PINK}|${GOLD}|${GREEN}|${BLUE}|${VIOLET}|${TEAL}|#ffffff`, 'g'), NAVY),
    1024, 'android-icon-monochrome.png'],
  // splash — mark on transparent, tighter
  [markSvg({ size: 1024, bg: null, scale: 0.9 }), 1024, 'splash-icon.png'],
  // favicon
  [markSvg({ size: 128, bg: TEAL }), 128, 'favicon.png'],
];

for (const [svg, size, out, opts] of jobs) {
  // eslint-disable-next-line no-await-in-loop
  await render(svg, size, out, opts);
}
console.log('done — assets/ updated');
