// Concatenate every hand-written dish JSON under src/data/{home,takeaway,
// restaurant}/*.json into three single files that dishes.ts imports
// statically. Replaces require.context (an experimental Metro feature that
// crashes the New-Architecture release build on TestFlight).
//
// Run after editing any dish file:  node scripts/bundle-dishes.mjs
import fs from 'node:fs';
import path from 'node:path';

const DATA = path.join(process.cwd(), 'src', 'data');

for (const kind of ['home', 'takeaway', 'restaurant']) {
  const dir = path.join(DATA, kind);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();
  const all = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (Array.isArray(j)) all.push(...j);
    else console.warn(`  skip (not an array): ${kind}/${f}`);
  }
  const out = path.join(DATA, `${kind}.bundle.json`);
  fs.writeFileSync(out, JSON.stringify(all));
  console.log(`${kind}: ${files.length} files -> ${all.length} dishes -> ${out}`);
}
