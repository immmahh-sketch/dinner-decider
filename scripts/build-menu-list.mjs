// Build docs/menu/list.json — a compact, browsable index of the WHOLE deck
// (bundled hand-written dishes + the hosted composed catalogue) so the menu
// page at /menu/ can show and search every meal without downloading the full
// 31 MB catalogue.
//
// Run after regenerating docs/dishes.json:  node scripts/build-menu-list.mjs

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const V = { home: 'h', takeaway: 't', restaurant: 'r' };

function readBundled() {
  const out = [];
  for (const venue of ['home', 'takeaway', 'restaurant']) {
    const dir = join(ROOT, 'src', 'data', venue);
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      const arr = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      for (const d of arr) out.push(d);
    }
  }
  return out;
}

function readHosted() {
  const p = join(ROOT, 'docs', 'dishes.json');
  if (!existsSync(p)) {
    console.warn('docs/dishes.json not found — run scripts/generate-catalog.mjs first. Bundled only.');
    return [];
  }
  return JSON.parse(readFileSync(p, 'utf8'));
}

const seen = new Set();
const rows = [];
const stats = { total: 0, venue: {}, cuisine: {}, protein: {} };

for (const d of [...readBundled(), ...readHosted()]) {
  if (!d || !d.id || seen.has(d.id)) continue;
  seen.add(d.id);
  // [ name, venueChar, cuisine, protein, carb, spicy ]
  rows.push([d.name, V[d.venue] || '?', d.cuisine, d.protein, d.carb, d.spicy | 0]);
  stats.total++;
  stats.venue[d.venue] = (stats.venue[d.venue] || 0) + 1;
  stats.cuisine[d.cuisine] = (stats.cuisine[d.cuisine] || 0) + 1;
  stats.protein[d.protein] = (stats.protein[d.protein] || 0) + 1;
}

rows.sort((a, b) => a[0].localeCompare(b[0]));

const outDir = join(ROOT, 'docs', 'menu');
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, 'list.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), stats, rows }),
);

const mb = (Buffer.byteLength(JSON.stringify({ rows })) / 1e6).toFixed(1);
console.log(`docs/menu/list.json — ${stats.total.toLocaleString()} dishes, ~${mb} MB`);
console.log('venue', stats.venue);
