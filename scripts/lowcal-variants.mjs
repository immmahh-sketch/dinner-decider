// Generate "(Low Calorie)" siblings for every hand-written HOME dish whose
// rough per-portion estimate is >= 600 kcal, tweaking the recipe so the
// re-estimate lands under 600. Writes them to src/data/home/low-calorie.json.
//
//   node scripts/lowcal-variants.mjs          # regenerate the file
//   node scripts/lowcal-variants.mjs --dry    # just print the report
//
// Takeaway / restaurant dishes are skipped on purpose: you order those off a
// menu, so there's no recipe to lighten. Re-run scripts/bundle-dishes.mjs after.
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const HOME = path.join(process.cwd(), 'src', 'data', 'home');
const OUT_BASENAME = 'low-calorie.json';
const OUT = path.join(HOME, OUT_BASENAME);

// ---------------------------------------------------------------------------
// Estimator — a faithful port of the HOME path of src/engine/estimate.ts.
// dishText() there is name + blurb + ingredients (NOT method), lowercased.
// Keep this in sync if the real estimator changes.
// ---------------------------------------------------------------------------
const has = (t, ...w) => w.some((x) => t.includes(x));
const dishText = (d) => [d.name, d.blurb, (d.ingredients || []).join(' ')].join(' ').toLowerCase();

function estimateKcal(d) {
  const t = dishText(d);
  let kcal = 520;

  if (d.richness === 'light') kcal -= 150;
  else if (d.richness === 'hearty') kcal += 170;

  if (has(t, 'deep-fried', 'deep fried', 'battered', 'tempura', 'katsu', 'fried chicken', 'schnitzel', 'karaage', 'popcorn chicken')) kcal += 260;
  else if (has(t, 'fried', 'crispy', 'crumbed', 'breaded', 'panko', 'golden')) kcal += 150;
  if (has(t, 'creamy', 'double cream', 'carbonara', 'alfredo', 'gratin', 'dauphinoise', 'mac and cheese', 'macaroni cheese', 'cheese sauce', 'béchamel', 'bechamel', 'stroganoff')) kcal += 190;
  if (has(t, 'cheese', 'mozzarella', 'parmesan', 'cheddar', 'halloumi', 'feta', 'paneer', 'blue cheese', 'raclette')) kcal += 90;
  if (has(t, 'butter', 'buttery', 'ghee', 'brown butter')) kcal += 90;
  if (has(t, 'coconut', 'korma', 'massaman', 'rendang', 'peanut', 'satay')) kcal += 150;
  if (has(t, 'pastry', 'puff pastry', 'shortcrust', ' pie', 'sausage roll', 'wellington', 'filo', 'pot pie', 'pasty')) kcal += 170;
  if (has(t, 'bbq', 'barbecue', 'honey', 'glazed', 'glaze', 'teriyaki', 'hoisin', 'sweet chilli', 'sweet-and-sour', 'sweet and sour', 'maple', 'char siu', 'plum sauce', 'sticky')) kcal += 45;
  if (has(t, 'grilled', 'griddled', 'chargrilled', 'steamed', 'poached', ' salad', 'tandoori', 'skewer', 'souvlaki', 'ceviche', 'poke', 'broth', 'consommé', 'nourish bowl')) kcal -= 120;
  if (has(t, 'roast', 'roasted', 'baked', 'traybake', 'tray bake', 'tray-bake')) kcal += 30;

  switch (d.protein) {
    case 'beef':
    case 'lamb':
      kcal += 90;
      break;
    case 'pork':
      kcal += 60;
      break;
    case 'fish':
      kcal -= 20;
      break;
    case 'seafood':
      kcal -= 60;
      break;
    case 'vegan':
      kcal -= 40;
      break;
    default:
      break;
  }
  if (has(t, 'sausage', 'chorizo', 'bacon', 'pepperoni', 'salami', 'pancetta', 'lardon', 'nduja', "n'duja", 'hot dog', 'frankfurter', 'corned beef', 'spam', 'black pudding')) kcal += 110;

  switch (d.carb) {
    case 'pasta':
      kcal += 120;
      break;
    case 'rice':
      kcal += 130;
      break;
    case 'noodles':
      kcal += 125;
      break;
    case 'potato':
      kcal += 110;
      break;
    case 'bread':
    case 'pastry':
      kcal += 110;
      break;
    case 'grains':
      kcal += 120;
      break;
    case 'salad':
      kcal -= 60;
      break;
    case 'none':
      kcal -= 90;
      break;
    default:
      break;
  }
  if (has(t, 'chips', 'fries', 'wedges', 'hash brown', 'onion rings', 'fried rice', 'egg-fried rice', 'egg fried rice', 'pilau', 'garlic bread', 'naan', 'roti', 'paratha', 'dough balls')) kcal += 180;

  return Math.max(180, Math.round(kcal / 10) * 10);
}

// ---------------------------------------------------------------------------
// Recipe lightening — swaps that bite on blurb + ingredients (what the
// estimator reads) and read sensibly to a cook.
// ---------------------------------------------------------------------------
const SWAPS = [
  [/\b(double|single|heavy|whipping|clotted|soured|sour) cream\b/gi, 'fat-free Greek yoghurt'],
  [/\bcream cheese\b/gi, 'light soft cheese'],
  [/\bcr[eè]me fra[iî]che\b/gi, '0%-fat Greek yoghurt'],
  [/\bmascarpone\b/gi, 'light soft cheese'],
  [/\bcreamy\b/gi, 'velvety'],
  [/\bbuttery\b/gi, 'light'],
  [/\bbrown butter\b/gi, 'a little olive oil'],
  [/\b\d+\s*g\s+butter\b/gi, 'low-fat spread'],
  [/\bbutter\b/gi, 'low-fat spread'],
  [/\bghee\b/gi, 'olive oil spray'],
  [/\bstreaky bacon\b/gi, 'lean smoked ham'],
  [/\bsmoked bacon\b/gi, 'lean smoked ham'],
  [/\bback bacon\b/gi, 'lean smoked ham'],
  [/\bbacon lardons?\b/gi, 'lean smoked ham'],
  [/\blardons?\b/gi, 'lean smoked ham'],
  [/\bbacon\b/gi, 'lean smoked ham'],
  [/\bpancetta\b/gi, 'lean smoked ham'],
  [/\bchorizo\b/gi, 'smoked paprika'],
  [/\bpepperoni\b/gi, 'lean ham'],
  [/\bsalami\b/gi, 'lean ham'],
  [/\bn['’]?duja\b/gi, 'harissa'],
  [/\bsausage\s?meat\b/gi, 'lean turkey mince'],
  [/\bsausages?\b/gi, 'lean turkey mince'],
  [/\b(skin-on |french |triple-cooked |thick-cut |thin-cut |chunky )?fries\b/gi, 'oven-roasted new potatoes'],
  [/\b(chunky |thick-cut |thin-cut |triple-cooked )?chips\b/gi, 'oven-roasted new potatoes'],
  [/\bpotato wedges\b/gi, 'new potatoes'],
  [/\bwedges\b/gi, 'roasted new potatoes'],
  [/\bhash browns?\b/gi, 'baked potato rösti'],
  [/\bonion rings\b/gi, 'roasted red onion'],
  [/\bgarlic bread\b/gi, 'griddled courgette'],
  [/\bpeshwari naan\b/gi, 'a small chapati'],
  [/\bnaan(?: bread)?\b/gi, 'a small chapati'],
  [/\bparatha\b/gi, 'a small chapati'],
  [/\broti\b/gi, 'a small chapati'],
  [/\bdough balls\b/gi, 'crudités'],
  [/\begg[- ]fried rice\b/gi, 'steamed basmati rice'],
  [/\bfried rice\b/gi, 'steamed basmati rice'],
  [/\bpilau rice\b/gi, 'steamed basmati rice'],
  [/\bpilau\b/gi, 'steamed rice'],
  [/\b(puff|shortcrust|ready-rolled|filo|flaky) pastry\b/gi, 'a thin sliced-potato topping'],
  [/\bfilo\b/gi, 'thinly sliced potato'],
  [/\bpastry\b/gi, 'a thin sliced-potato topping'],
  [/\bdeep[- ]fried\b/gi, 'oven-baked'],
  [/\bdeep[- ]fry\b/gi, 'oven-bake'],
  [/\bshallow[- ]fried\b/gi, 'lightly pan-cooked'],
  [/\bpan[- ]fried\b/gi, 'seared in a little oil'],
  [/\bstir[- ]fried\b/gi, 'stir-cooked'],
  [/\bdeep[- ]frying\b/gi, 'oven-baking'],
  [/\bfried\b/gi, 'oven-baked'],
  [/\bfrying\b/gi, 'cooking'],
  [/\bcrispy\b/gi, 'crisp'],
  [/\bcrumbed\b/gi, 'herb-topped'],
  [/\bbreaded\b/gi, 'herb-crusted'],
  [/\bpanko\b/gi, 'a light herb crumb'],
  [/\bbattered\b/gi, 'lightly spiced'],
  [/\bkatsu\b/gi, 'lightly curried'],
  [/\btempura\b/gi, 'steamed'],
  [/\b\d+\s*(?:g|ml)\s+(?:caster |granulated |golden |light brown |dark brown )?sugar\b/gi, '1 tbsp granulated sweetener'],
  [/\b(caster |granulated |golden |light brown |dark brown )?sugar\b/gi, 'granulated sweetener'],
  [/\b\d+\s*tbsp\s+(?:olive |vegetable |sunflower |rapeseed |groundnut )?oil\b/gi, '1 tsp olive oil'],
  [/\ba drizzle of (?:olive )?oil\b/gi, 'a spritz of olive oil'],
];

const swap = (s) => SWAPS.reduce((x, [re, to]) => x.replace(re, to), s);

const CHEESE_LINE = /(parmesan|pecorino|cheddar|mozzarella|gruy[eè]re|comt[eé]|halloumi|feta|paneer|blue cheese|raclette|mascarpone|clotted|double cream|single cream)/i;
const CARB_WORD = /\b(spaghetti|linguine|tagliatelle|pappardelle|penne|rigatoni|fusilli|macaroni|lasagne|pasta|noodles?|rice|basmati|long-grain|arborio|risotto rice|potatoes?|gnocchi|tortillas?|wraps?|bread rolls?|baguette|couscous|bulgur|quinoa|orzo)\b/i;

function lightenBlurb(src) {
  const b = swap(src.blurb).trim().replace(/[.\s]+$/, '');
  return `${b}. A lighter reworking that comes in under 600 kcal a portion.`;
}

function makeVariant(src) {
  const v = JSON.parse(JSON.stringify(src));
  v.id = `${src.id}-lc`;
  v.name = `${src.name} (Low Calorie)`;
  v.richness = 'light';
  v.mood = Array.from(
    new Set([...(Array.isArray(src.mood) ? src.mood : []).filter((m) => m !== 'indulgent'), 'light', 'healthy']),
  );
  v.blurb = lightenBlurb(src);
  v.ingredients = src.ingredients.map(swap);
  v.method = src.method.map(swap);
  v.method.push(
    'Go easy on any added fats, pile on extra vegetables and serve a sensible portion — that keeps this under 600 kcal per serving.',
  );
  return v;
}

// Harder cuts, applied only if the first pass still isn't under 600.
function hardTrim(v) {
  const trimmed = v.ingredients.filter((l) => !CHEESE_LINE.test(l));
  if (trimmed.length >= 3) v.ingredients = trimmed;
  v.ingredients = v.ingredients.map((l) => {
    const m = l.match(/^(\s*)(\d{2,4})\s*g\b/);
    if (m && CARB_WORD.test(l)) {
      const g = Math.max(40, Math.round(parseInt(m[2], 10) * 0.65));
      return `${l.replace(/^(\s*)\d{2,4}\s*g\b/, `$1${g}g`)} (moderate portion)`;
    }
    return l;
  });
  if (!/\b(salad|greens|vegetables|veg)\b/i.test(v.ingredients.join(' '))) {
    v.ingredients.push('A big handful of salad or green vegetables, to serve');
  }
  return v;
}

// ---------------------------------------------------------------------------
const files = fs
  .readdirSync(HOME)
  .filter((f) => f.endsWith('.json') && f !== OUT_BASENAME)
  .sort();

let scanned = 0;
let alreadyLight = 0;
const made = [];
const skipped = [];

for (const f of files) {
  const arr = JSON.parse(fs.readFileSync(path.join(HOME, f), 'utf8'));
  for (const src of arr) {
    if (typeof src.id !== 'string' || src.id.endsWith('-lc')) continue;
    scanned++;
    const origK = estimateKcal(src);
    if (origK < 600) {
      alreadyLight++;
      continue;
    }
    let v = makeVariant(src);
    let k = estimateKcal(v);
    if (k >= 600) {
      v = hardTrim(v);
      k = estimateKcal(v);
    }
    if (k < 600) {
      made.push(v);
      continue;
    }
    skipped.push(`${src.name}  (~${origK} → best ${k})`);
  }
}

made.sort((a, b) => a.id.localeCompare(b.id));

console.log(`\nHOME dishes scanned:        ${scanned}`);
console.log(`already under 600 kcal:     ${alreadyLight}`);
console.log(`low-calorie variants made:  ${made.length}`);
console.log(`too rich to rework (kept):  ${skipped.length}`);
if (skipped.length) {
  console.log('\n  not reducible under 600 (left as-is):');
  for (const s of skipped.slice(0, 40)) console.log(`   - ${s}`);
  if (skipped.length > 40) console.log(`   … and ${skipped.length - 40} more`);
}

if (DRY) {
  console.log('\n--dry: nothing written.');
} else {
  fs.writeFileSync(OUT, JSON.stringify(made, null, 2) + '\n');
  console.log(`\nwrote ${made.length} dishes -> src/data/home/${OUT_BASENAME}`);
  console.log('next: node scripts/bundle-dishes.mjs && node scripts/validate-data.mjs');
}
