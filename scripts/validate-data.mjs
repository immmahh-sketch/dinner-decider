// Validates every dish JSON file against the schema the app expects.
// Run with: npm run data:check
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');

const ENUMS = {
  venue: ['home', 'takeaway', 'restaurant'],
  cuisine: ['italian', 'indian', 'east-asian', 'mexican', 'british', 'american', 'med', 'middle-eastern', 'french', 'caribbean', 'other'],
  protein: ['chicken', 'beef', 'lamb', 'pork', 'fish', 'seafood', 'veggie', 'vegan', 'egg', 'mixed', 'none'],
  carb: ['pasta', 'rice', 'noodles', 'potato', 'bread', 'pastry', 'grains', 'salad', 'none'],
  richness: ['light', 'medium', 'hearty'],
  format: ['bowl', 'plate', 'handheld', 'sharing', 'soup', 'salad'],
  effort: ['quick', 'medium', 'showoff'],
};
const MOODS = ['comfort', 'light', 'fresh', 'indulgent', 'healthy', 'fancy'];
const DIETS = ['vegetarian', 'vegan', 'pescatarian', 'gluten-free', 'dairy-free'];

let errors = 0;
let count = 0;
const ids = new Set();

const check = (cond, msg) => {
  if (!cond) {
    errors++;
    console.error('  ✗ ' + msg);
  }
};

const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.json')) validateFile(p);
  }
};

function validateFile(path) {
  const rel = path.split('src' + (process.platform === 'win32' ? '\\' : '/'))[1] || path;
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    errors++;
    console.error(`\n${rel}\n  ✗ invalid JSON: ${e.message}`);
    return;
  }
  if (!Array.isArray(data)) {
    errors++;
    console.error(`\n${rel}\n  ✗ top level must be an array`);
    return;
  }
  const before = errors;
  for (const d of data) {
    count++;
    const label = d.id || d.name || '(unknown)';
    check(typeof d.id === 'string' && d.id.length > 0, `${label}: missing id`);
    check(!ids.has(d.id), `${label}: duplicate id`);
    ids.add(d.id);
    check(typeof d.name === 'string' && d.name.length > 0, `${label}: missing name`);
    check(typeof d.blurb === 'string' && d.blurb.length > 0, `${label}: missing blurb`);
    for (const key of ['venue', 'cuisine', 'protein', 'carb', 'richness', 'format']) {
      check(ENUMS[key].includes(d[key]), `${label}: ${key}="${d[key]}" not in [${ENUMS[key].join(', ')}]`);
    }
    check([0, 1, 2, 3].includes(d.spicy), `${label}: spicy must be 0-3, got ${d.spicy}`);
    check(Array.isArray(d.mood) && d.mood.every((m) => MOODS.includes(m)), `${label}: bad mood ${JSON.stringify(d.mood)}`);
    check(Array.isArray(d.diet) && d.diet.every((m) => DIETS.includes(m)), `${label}: bad diet ${JSON.stringify(d.diet)}`);

    if (d.venue === 'home') {
      check(ENUMS.effort.includes(d.effort), `${label}: effort="${d.effort}" invalid`);
      check(typeof d.timeMinutes === 'number' && d.timeMinutes > 0, `${label}: timeMinutes invalid`);
      check(typeof d.onePan === 'boolean', `${label}: onePan must be boolean`);
      check(typeof d.servings === 'number' && d.servings > 0, `${label}: servings invalid`);
      check(Array.isArray(d.ingredients) && d.ingredients.length >= 2, `${label}: needs an ingredients list`);
      check(Array.isArray(d.method) && d.method.length >= 2, `${label}: needs a method`);
    } else {
      check(typeof d.searchTerm === 'string' && d.searchTerm.length > 0, `${label}: missing searchTerm`);
    }
    if (d.venue === 'takeaway') check(typeof d.takeawayType === 'string', `${label}: missing takeawayType`);
    if (d.venue === 'restaurant') {
      check(typeof d.restaurantType === 'string', `${label}: missing restaurantType`);
      check([1, 2, 3].includes(d.priceTier), `${label}: priceTier must be 1-3`);
    }
  }
  if (errors > before) console.error(`\n${rel}`);
}

walk(root);

console.log(`\n${count} dishes checked, ${errors} error(s).`);
process.exit(errors ? 1 : 0);
