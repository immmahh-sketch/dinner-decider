// Builds the hosted dish catalogue: docs/dishes.json
//
// Home dishes ship as compact "cards" (every quiz-filter field + a blurb, but
// no ingredients/method array — the app rebuilds those from src/engine/
// recipeTemplates.mjs via hydrateDish). Takeaway/restaurant dishes are already
// one-liners. Target ~TARGET_TOTAL including the bundled hand-written set.
//
//   node scripts/generate-catalog.mjs
import { readdirSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TECHNIQUES, SAUCES, PROTEINS, VEG, buildRecipe } from '../src/engine/recipeTemplates.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src', 'data');
const OUT = join(ROOT, 'docs');
mkdirSync(OUT, { recursive: true });
const TARGET_TOTAL = 100000;

// ---------- rng ----------
function rngMake(seed) {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rngMake(20260909);
const pick = (a) => a[Math.floor(rand() * a.length)];
const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};
const slug = (s) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ---------- bundled hand-written set (dedup + count) ----------
const bundledIds = new Set();
const bundledNames = new Set();
let bundledCount = 0;
for (const venue of ['home', 'takeaway', 'restaurant']) {
  for (const f of readdirSync(join(DATA, venue))) {
    if (!f.endsWith('.json')) continue;
    if (f.startsWith('gen-')) { rmSync(join(DATA, venue, f)); continue; } // old bundled generated -> gone
    for (const d of JSON.parse(readFileSync(join(DATA, venue, f), 'utf8'))) {
      bundledIds.add(d.id);
      bundledNames.add(`${d.venue}|${d.name.toLowerCase()}`);
      bundledCount++;
    }
  }
}
console.log(`bundled hand-written: ${bundledCount}`);
const DEFICIT = TARGET_TOTAL - bundledCount;

const ids = new Set(bundledIds);
const names = new Set(bundledNames);
const claim = (venue, name, prefix) => {
  const key = `${venue}|${name.toLowerCase()}`;
  if (names.has(key)) return null;
  const id = `${prefix}-${slug(name)}`.slice(0, 96);
  if (ids.has(id)) return null;
  names.add(key); ids.add(id);
  return id;
};

// ---------- HOME: technique compatibility ----------
const CUIS = {
  me: 'middle-eastern', med: 'med', am: 'american', fr: 'french', it: 'italian',
  in: 'indian', ea: 'east-asian', mx: 'mexican', ca: 'caribbean', ot: 'other', br: 'british',
};
const ALLCUIS = Object.values(CUIS);

// How a sauce actually behaves in the pan — this is what stops a raw herb
// dressing being "slow-cooked for 4 hours" or a beef-jus landing on cod.
//   rub      — dry spice blend / marinade paste, on before cooking
//   dressing — raw or no-cook herb / yoghurt / citrus sauce, spooned over at the end
//   glaze    — sticky reduction (soy, honey, hoisin, bbq)
//   stirfry  — East-Asian wok sauce, fast and hot
//   cream    — dairy- or butter-forward finishing sauce
//   braise   — wine / stock reduction built for long cooking
//   simmer   — a cookable sauce you braise the main ingredient in (the default)
const SAUCE_FORM = {
  harissa: 'rub', zaatar: 'rub', 'ras-el-hanout': 'rub', baharat: 'rub', tandoori: 'rub',
  'peri-peri': 'rub', jerk: 'rub', 'piri-lemon': 'rub', cajun: 'rub', blackened: 'rub', 'fajita-spiced': 'rub',
  'sumac-lemon': 'dressing', 'harissa-yoghurt': 'dressing', chermoula: 'dressing', tahini: 'dressing',
  tzatziki: 'dressing', chimichurri: 'dressing', 'salsa-verde': 'dressing', romesco: 'dressing',
  salmoriglio: 'dressing', 'lemon-garlic': 'dressing', pesto: 'dressing', gremolata: 'dressing',
  'green-goddess': 'dressing', 'chilli-lime': 'dressing', 'aji-verde': 'dressing', mojo: 'dressing',
  'salsa-macha': 'dressing', 'sesame-ginger': 'dressing', ponzu: 'dressing', 'nam-jim': 'dressing',
  'lemongrass-lime': 'dressing', 'ginger-scallion': 'dressing',
  teriyaki: 'glaze', miso: 'glaze', gochujang: 'glaze', 'sticky-soy-ginger': 'glaze', hoisin: 'glaze',
  'sweet-chilli': 'glaze', 'char-siu': 'glaze', bulgogi: 'glaze', tonkatsu: 'glaze',
  bbq: 'glaze', buffalo: 'glaze', 'honey-mustard': 'glaze', 'maple-bacon': 'glaze',
  'black-bean': 'stirfry', 'sweet-sour': 'stirfry', 'kung-pao': 'stirfry', 'sichuan-chilli': 'stirfry',
  oyster: 'stirfry', xo: 'stirfry', doubanjiang: 'stirfry', 'black-pepper': 'stirfry',
  'lemon-caper-butter': 'cream', 'brown-butter-sage': 'cream', carbonara: 'cream', 'garlic-butter': 'cream',
  'lemon-herb-butter': 'cream', 'creamy-garlic-mushroom': 'cream', 'mustard-cream': 'cream',
  peppercorn: 'cream', diane: 'cream', 'tarragon-cream': 'cream', 'blue-cheese': 'cream',
  'cider-cream': 'cream', 'cheddar-mustard': 'cream',
  marsala: 'braise', madeira: 'braise', 'red-wine-shallot': 'braise', chasseur: 'braise', 'white-wine-herb': 'braise',
  'tikka-masala': 'simmer', korma: 'simmer', jalfrezi: 'simmer', madras: 'simmer', 'rogan-josh': 'simmer',
  bhuna: 'simmer', balti: 'simmer', saag: 'simmer', 'coconut-dhansak': 'simmer', 'butter-masala': 'simmer',
  vindaloo: 'simmer', dopiaza: 'simmer', methi: 'simmer', achari: 'simmer',
  katsu: 'simmer', satay: 'simmer', 'thai-green': 'simmer', 'thai-red': 'simmer', panang: 'simmer',
  massaman: 'simmer', 'coconut-lime': 'simmer', 'caribbean-curry': 'simmer',
  puttanesca: 'simmer', arrabbiata: 'simmer', 'tomato-basil': 'simmer', nduja: 'simmer',
  'saffron-tomato': 'simmer', provencal: 'simmer', 'pomegranate-walnut': 'simmer',
  'preserved-lemon-olive': 'simmer', chipotle: 'simmer', mole: 'simmer', 'salsa-roja': 'simmer', sofrito: 'simmer',
};
const sform = (sk) => SAUCE_FORM[sk] || 'simmer';

// cream/braise sauces that only really suit red meat (+ chicken)
const BEEFY_SAUCE = new Set(['peppercorn', 'diane', 'madeira', 'red-wine-shallot', 'marsala', 'blue-cheese', 'chasseur']);
// the only cream sauces that belong with fish / seafood — light, lemon/butter
const FISH_CREAM_OK = new Set(['lemon-caper-butter', 'lemon-herb-butter', 'garlic-butter', 'tarragon-cream']);
// quick-cook shellfish that must not go anywhere near a long braise
const QUICK_SEAFOOD = new Set(['squid', 'scallop']);
const LONG_COOK = ['curry', 'stew', 'braised', 'slow', 'soup', 'onepot', 'bake', 'stuffed', 'loaded', 'poached'];

// no dairy / honey / fish / meat hiding in the sauce — for vegan proteins
function plantSafeSauce(s) {
  const t = s.ing.join(' ').toLowerCase().replace(/coconut milk/g, 'coconut');
  return !/cream|crème|creme|butter|cheese|parmesan|pecorino|pancetta|guanciale|\bbacon\b|lardon|nduja|yoghurt|yogurt|\bmilk\b|anchov|fish sauce|oyster sauce|worcestershire|\bhoney\b|\begg/.test(t);
}
// dairy is fine, but no meat or fish — for vegetarian proteins
function vegSafeSauce(s) {
  const t = s.ing.join(' ').toLowerCase();
  return !/anchov|fish sauce|oyster sauce|worcestershire|pancetta|guanciale|\bbacon\b|lardon|nduja/.test(t);
}

// key = technique; value = { p: protein enums, c: sauce cuisines, forms: allowed sauce forms,
//   carbs: base carbs, tag?: require a sauce tag, word?: require a sauce-word match }
const RULES = {
  traybake: { p: ['chicken', 'pork', 'lamb', 'fish', 'seafood', 'veggie', 'vegan'], c: [CUIS.me, CUIS.med, CUIS.am, CUIS.ot, CUIS.ca, CUIS.in, CUIS.it, CUIS.mx], forms: ['rub', 'glaze', 'dressing'], carbs: ['potato', 'none', 'grains'] },
  skillet: { p: ['chicken', 'beef', 'pork', 'lamb', 'seafood', 'veggie', 'vegan'], c: [CUIS.med, CUIS.me, CUIS.am, CUIS.it, CUIS.fr, CUIS.mx, CUIS.ot, CUIS.ca, CUIS.in], forms: ['simmer', 'cream', 'glaze', 'rub', 'dressing'], carbs: ['rice', 'grains', 'none', 'potato'] },
  stirfry: { p: ['chicken', 'beef', 'pork', 'seafood', 'veggie', 'vegan'], c: [CUIS.ea], forms: ['stirfry', 'glaze'], carbs: ['rice', 'noodles', 'none'] },
  curry: { p: ['chicken', 'beef', 'lamb', 'pork', 'fish', 'seafood', 'veggie', 'vegan'], c: [CUIS.in, CUIS.ea, CUIS.ca], forms: ['simmer'], carbs: ['rice', 'bread'], word: /Masala|Korma|Jalfrezi|Madras|Rogan|Bhuna|Balti|Saag|Dhansak|Tikka|Thai|Massaman|Panang|Katsu|Coconut|Satay|Caribbean|Vindaloo|Dopiaza|Methi|Achari/ },
  stew: { p: ['beef', 'lamb', 'pork', 'chicken', 'vegan'], c: [CUIS.fr, CUIS.it, CUIS.med, CUIS.me, CUIS.ca, CUIS.am, CUIS.ot], forms: ['braise', 'simmer'], carbs: ['potato', 'bread', 'none'] },
  soup: { p: ['chicken', 'fish', 'seafood', 'veggie', 'vegan'], c: [CUIS.ea, CUIS.med, CUIS.me, CUIS.it, CUIS.fr, CUIS.am, CUIS.ot, CUIS.ca], forms: ['simmer'], ban: /Arrabbiata|Puttanesca|Nduja|Mole|Bhuna|Achari|Dopiaza|Methi|Vindaloo|Butter Masala|Rogan/, carbs: ['none', 'bread', 'noodles'] },
  grill: { p: ['chicken', 'beef', 'lamb', 'pork', 'seafood', 'fish', 'veggie'], c: [CUIS.me, CUIS.med, CUIS.am, CUIS.ot, CUIS.ca, CUIS.mx, CUIS.ea, CUIS.in], forms: ['rub', 'glaze', 'dressing'], carbs: ['rice', 'bread', 'grains', 'none'] },
  roast: { p: ['chicken', 'beef', 'lamb', 'pork', 'fish', 'veggie', 'vegan'], c: [CUIS.fr, CUIS.med, CUIS.me, CUIS.am, CUIS.ot, CUIS.it, CUIS.br], forms: ['rub', 'glaze', 'simmer', 'dressing'], carbs: ['potato', 'grains', 'none'] },
  panfry: { p: ['chicken', 'beef', 'pork', 'fish', 'seafood', 'veggie'], c: [CUIS.fr, CUIS.it, CUIS.med, CUIS.am, CUIS.br], forms: ['cream', 'braise', 'simmer', 'dressing'], carbs: ['potato', 'none', 'grains'] },
  salad: { p: ['chicken', 'beef', 'fish', 'seafood', 'veggie', 'vegan'], c: [CUIS.med, CUIS.me, CUIS.ea, CUIS.it, CUIS.mx, CUIS.ot, CUIS.am], forms: ['dressing', 'rub'], tag: ['fresh', 'zesty', 'herby'], carbs: ['none', 'grains', 'salad'] },
  bowl: { p: ['chicken', 'beef', 'pork', 'fish', 'seafood', 'veggie', 'vegan'], c: [CUIS.ea, CUIS.me, CUIS.mx, CUIS.med, CUIS.ot, CUIS.am], forms: ['glaze', 'dressing', 'simmer', 'stirfry'], carbs: ['rice', 'grains'] },
  pasta: { p: ['beef', 'pork', 'chicken', 'fish', 'seafood', 'veggie', 'vegan'], c: [CUIS.it, CUIS.fr, CUIS.med], forms: ['simmer', 'cream', 'dressing'], carbs: ['pasta'] },
  bake: { p: ['chicken', 'beef', 'pork', 'fish', 'seafood', 'veggie', 'vegan'], c: [CUIS.it, CUIS.fr, CUIS.am, CUIS.med, CUIS.me, CUIS.br], forms: ['simmer', 'cream'], carbs: ['potato', 'pasta', 'none', 'grains'] },
  noodles: { p: ['chicken', 'beef', 'pork', 'seafood', 'veggie', 'vegan'], c: [CUIS.ea], forms: ['stirfry', 'glaze'], carbs: ['noodles'] },
  wrap: { p: ['chicken', 'beef', 'pork', 'lamb', 'seafood', 'veggie', 'vegan'], c: [CUIS.mx, CUIS.me, CUIS.ea, CUIS.am, CUIS.ot, CUIS.ca], forms: ['rub', 'glaze', 'dressing', 'simmer'], carbs: ['bread'] },
  slow: { p: ['beef', 'lamb', 'pork', 'chicken'], c: [CUIS.fr, CUIS.it, CUIS.med, CUIS.me, CUIS.am, CUIS.ca, CUIS.ot, CUIS.mx], forms: ['braise', 'simmer'], carbs: ['potato', 'rice', 'bread', 'none'] },
  griddle: { p: ['chicken', 'beef', 'lamb', 'pork', 'seafood', 'fish', 'veggie'], c: [CUIS.med, CUIS.me, CUIS.it, CUIS.am, CUIS.ot, CUIS.mx], forms: ['rub', 'dressing', 'glaze'], tag: ['fresh', 'zesty', 'herby', 'smoky'], carbs: ['grains', 'none', 'potato', 'salad'] },
  airfryer: { p: ['chicken', 'pork', 'fish', 'seafood', 'veggie', 'vegan'], c: [CUIS.am, CUIS.ea, CUIS.me, CUIS.ot, CUIS.mx, CUIS.in], forms: ['rub', 'glaze', 'dressing'], carbs: ['none', 'potato', 'rice'] },
  onepot: { p: ['chicken', 'beef', 'pork', 'veggie', 'vegan'], c: [CUIS.med, CUIS.me, CUIS.it, CUIS.am, CUIS.in, CUIS.ca, CUIS.ea, CUIS.ot], forms: ['simmer', 'braise'], carbs: ['rice', 'grains'] },
  glazed: { p: ['chicken', 'pork', 'fish', 'seafood', 'beef'], c: [CUIS.ea, CUIS.am, CUIS.ot], forms: ['glaze', 'stirfry'], carbs: ['rice', 'grains', 'none'] },
  crispy: { p: ['chicken', 'pork', 'beef', 'seafood', 'veggie', 'vegan'], c: [CUIS.ea], forms: ['stirfry', 'glaze'], carbs: ['rice', 'noodles'] },
  braised: { p: ['beef', 'lamb', 'pork', 'chicken'], c: [CUIS.fr, CUIS.it, CUIS.med, CUIS.ea, CUIS.ot], forms: ['braise', 'simmer'], carbs: ['potato', 'rice', 'none', 'grains'] },
  poached: { p: ['chicken', 'fish', 'seafood', 'veggie'], c: [CUIS.fr, CUIS.ea, CUIS.med, CUIS.me], forms: ['simmer', 'dressing', 'cream'], carbs: ['grains', 'none', 'rice'] },
  stuffed: { p: ['beef', 'lamb', 'chicken', 'pork', 'veggie', 'vegan'], c: [CUIS.med, CUIS.me, CUIS.it, CUIS.mx, CUIS.ot], forms: ['simmer', 'rub'], carbs: ['rice', 'grains', 'none'] },
  loaded: { p: ['beef', 'chicken', 'pork', 'veggie', 'vegan'], c: [CUIS.mx, CUIS.am, CUIS.ot], forms: ['simmer', 'glaze'], carbs: ['none', 'potato'] },
};
// techniques whose carb genuinely varies the dish name
const CARB_IN_NAME = new Set(['bowl', 'curry']);
const CARB_NAME = { rice: 'Rice', noodles: 'Noodle', grains: 'Grain', bread: 'Flatbread', potato: 'Potato' };

const MOOD_OK = new Set(['comfort', 'light', 'fresh', 'indulgent', 'healthy', 'fancy']);
function moodFor(t, s, p) {
  const m = new Set(t.mood.filter((x) => MOOD_OK.has(x)));
  if (['fish', 'seafood'].includes(p.key) && ['salad', 'grill', 'panfry', 'soup', 'bowl', 'poached', 'griddle'].includes(t._k)) m.add('healthy');
  if (p.diet.includes('vegan') && ['salad', 'bowl', 'soup', 'stirfry', 'poached'].includes(t._k)) { m.add('healthy'); m.add('light'); }
  if (['bake', 'slow', 'roast', 'braised', 'loaded', 'crispy'].includes(t._k) && ['beef', 'lamb', 'pork'].includes(p.key)) m.add('indulgent');
  if ((s.tags || []).includes('indulgent')) m.add('indulgent');
  if (['grill', 'roast', 'griddle'].includes(t._k) && ['beef', 'lamb'].includes(p.key)) m.add('fancy');
  if ((s.tags || []).includes('fresh') && t.richness === 'light') m.add('fresh');
  if (m.size === 0) m.add('comfort');
  return [...m];
}

const homeCards = [];
{
  const techKeys = Object.keys(TECHNIQUES);
  const sauceKeys = Object.keys(SAUCES);
  const protKeys = Object.keys(PROTEINS);
  const combos = [];
  for (const tk of techKeys) for (const sk of sauceKeys) for (const pk of protKeys) combos.push([tk, sk, pk]);
  for (const [tk, sk, pk] of shuffle(combos)) {
    const rule = RULES[tk];
    const t = { ...TECHNIQUES[tk], _k: tk };
    const s = SAUCES[sk];
    const p = PROTEINS[pk];
    if (!rule.p.includes(p.key)) continue;
    if (!rule.c.includes(s.cuisine)) continue;
    if (!rule.forms.includes(sform(sk))) continue;
    if (rule.tag && !rule.tag.some((tag) => (s.tags || []).includes(tag))) continue;
    if (rule.word && !rule.word.test(s.word)) continue;
    if (rule.ban && rule.ban.test(s.word)) continue;
    // protein <-> sauce sanity
    if (p.diet.includes('vegan') && !plantSafeSauce(s)) continue;
    if (['veggie', 'egg'].includes(p.key) && !vegSafeSauce(s)) continue;
    if (BEEFY_SAUCE.has(sk) && !['beef', 'lamb', 'pork', 'mixed', 'chicken'].includes(p.key)) continue;
    if (['fish', 'seafood'].includes(p.key) && sform(sk) === 'cream' && !FISH_CREAM_OK.has(sk)) continue;
    if (['fish', 'seafood'].includes(p.key) && ['stew', 'slow', 'braised'].includes(tk)) continue;
    if (['fish', 'seafood'].includes(p.key) && ['maple-bacon', 'nduja'].includes(sk)) continue;
    if (QUICK_SEAFOOD.has(pk) && LONG_COOK.includes(tk)) continue;
    if (['stew', 'slow', 'braised'].includes(tk) && ['cauliflower', 'tofu', 'egg'].includes(pk)) continue;
    if (p.key === 'fish' && tk === 'curry' && s.spicy >= 3) continue;
    if (tk === 'curry' && pk === 'gammon') continue;
    if (sk === 'xo' && (p.diet.includes('vegan') || ['veggie', 'egg'].includes(p.key))) continue;

    // dish-identity variants: carb (bowl/curry) OR a named veg pairing (everything else)
    let variants;
    if (tk === 'bowl') {
      variants = shuffle(rule.carbs).slice(0, Math.min(3, rule.carbs.length)).map((carb) => ({ carb, vegName: null, mode: 'bowl' }));
    } else if (tk === 'curry') {
      variants = shuffle(['rice', 'bread']).map((carb) => ({ carb, vegName: null, mode: 'curry' }));
    } else {
      const carb = pick(rule.carbs);
      const vegChoices = shuffle(['peppers', 'squash', 'mushrooms', 'greens', 'tomatoes', 'leeks', 'fennel', 'broccoli']).slice(0, 2);
      variants = vegChoices.map((vn) => ({ carb, vegName: vn, mode: 'veg' }));
    }

    for (const { carb, vegName, mode } of variants) {
      const vegBit = vegName ? ` with ${vegName[0].toUpperCase()}${vegName.slice(1)}` : '';
      let name;
      const adjTech = ['crispy', 'glazed', 'braised', 'poached', 'stuffed', 'loaded', 'slow', 'panfry'].includes(tk);
      if (mode === 'bowl') name = `${s.word} ${p.word} ${CARB_NAME[carb] || 'Rice'} Bowl`;
      else if (mode === 'curry') name = `${s.word} ${p.word} Curry${carb === 'bread' ? ' with Flatbread' : ' with Rice'}`;
      else if (tk === 'stuffed') name = `${s.word} ${p.word} Stuffed Peppers${vegBit}`;
      else if (tk === 'loaded') name = `${s.word} ${p.word} Loaded Fries${vegBit}`;
      else if (adjTech) name = `${s.word} ${t.word} ${p.word}${vegBit}`;
      else name = `${s.word} ${p.word} ${t.word}${vegBit}`;
      name = name.replace(/\s+/g, ' ').trim();
      const id = claim('home', name, 'h');
      if (!id) continue;
      const richness =
        ['bake', 'slow', 'stew', 'roast', 'braised'].includes(tk) && ['beef', 'lamb', 'pork'].includes(p.key)
          ? 'hearty'
          : t.richness;
      const VEGMAP = { peppers: [0], squash: [11], mushrooms: [12], greens: [3, 8], tomatoes: [6], leeks: [15], fennel: [16], broccoli: [4] };
      const veg = vegName
        ? VEGMAP[vegName]
        : shuffle(VEG.map((_, i) => i)).slice(0, 1 + Math.floor(rand() * 2));
      const built = buildRecipe({ tech: tk, sauce: sk, protein: pk, carb, veg, servings: 4 });
      const servings = ['salad', 'wrap', 'bowl', 'panfry', 'poached', 'griddle'].includes(tk)
        ? (rand() < 0.4 ? 2 : 4) : 4;
      homeCards.push({
        id, name,
        blurb: built.blurb,
        venue: 'home',
        cuisine: s.cuisine, protein: p.key, carb,
        spicy: Math.max(0, Math.min(3, s.spicy)),
        richness, mood: moodFor(t, s, p), format: t.format, diet: p.diet,
        effort: t.effort, timeMinutes: t.mins, onePan: t.onePan, servings,
        gen: { t: tk, s: sk, p: pk, v: veg },
      });
    }
  }
}
console.log(`home cards: ${homeCards.length}`);

// ---------- TAKEAWAY + RESTAURANT (expanded one-liners) ----------
function takeawaySet() {
  const out = [];
  const add = (name, o) => { const id = claim('takeaway', name, 't'); if (id) out.push({ id, name, venue: 'takeaway', searchTerm: name.toLowerCase(), ...o }); };
  const vd = (veg, vegan) => (vegan ? ['vegetarian', 'vegan', 'dairy-free'] : veg ? ['vegetarian'] : []);

  const pizzaTops = ['Pepperoni', 'Double Pepperoni', 'Nduja & Hot Honey', 'Spicy Salami', 'Ham & Mushroom', 'Ham & Pineapple', 'Chicken & Sweetcorn', 'BBQ Chicken', 'Buffalo Chicken', 'Chicken & Pesto', 'Cajun Chicken', 'Chicken Tikka', 'Chorizo & Roasted Pepper', 'Meatball & Red Onion', 'Spicy Beef & Jalapeño', 'Pulled Pork & BBQ', 'Prawn & Garlic', 'Tuna & Red Onion', 'Anchovy & Caper', 'Parma Ham & Rocket', 'Four Cheese', "Goat's Cheese & Caramelised Onion", 'Truffle Mushroom', 'Roasted Vegetable', 'Spinach & Ricotta', 'Margherita', 'Marinara', 'Fiorentina', 'Capricciosa', 'Diavola', 'Quattro Stagioni', 'Sausage & Friarielli', 'Philly Cheesesteak', 'Full English', 'Mac & Cheese', 'Vegan Vegetable', 'Vegan BBQ Jackfruit', 'Vegan Margherita', 'Hawaiian', 'Spicy Hawaiian', 'Salami & Wild Mushroom', 'Calabrese Salami & Chilli', 'Smoked Salmon & Crème Fraîche', 'Roquefort & Walnut', 'Egg & Bacon Breakfast', 'Fennel Sausage & Chilli', 'Ndjua & Ricotta', 'Chicken & Chorizo', 'Prawn & Nduja', 'Artichoke & Olive'];
  const bases = ['', ' (Thin Crust)', ' (Deep Pan)', ' (Sourdough Base)', ' (Gluten-Free Base)'];
  for (const top of pizzaTops) for (const base of bases) {
    const vegan = /Vegan/.test(top);
    const veg = !vegan && /Vegetable|Margherita|Marinara|Truffle Mushroom|Four Cheese|Spinach|Onion|Ricotta|Mac & Cheese|Roquefort|Artichoke/.test(top);
    add(`${top} Pizza${base}`, {
      cuisine: /Hawaiian|BBQ|Buffalo|Cajun|Philly|English|Jackfruit|Pulled Pork/.test(top) ? 'american' : 'italian',
      protein: vegan ? 'vegan' : veg ? 'veggie' : /Prawn|Tuna|Anchovy|Salmon/.test(top) ? 'seafood' : /Chicken/.test(top) ? 'chicken' : /Beef|Meatball|Cheesesteak/.test(top) ? 'beef' : /Egg/.test(top) ? 'mixed' : 'pork',
      carb: 'bread', spicy: /Spicy|Nduja|Ndjua|Jalapeño|Buffalo|Cajun|Diavola|Chilli|Hot Honey|Tikka/.test(top) ? 2 : /Pepperoni|Salami|Chorizo|Friarielli/.test(top) ? 1 : 0,
      richness: /Gluten-Free|Thin/.test(base) ? 'medium' : 'hearty', mood: ['comfort', 'indulgent'], format: 'handheld',
      diet: vegan ? [...vd(false, true), ...(/Gluten-Free/.test(base) ? ['gluten-free'] : [])] : veg ? ['vegetarian', ...(/Gluten-Free/.test(base) ? ['gluten-free'] : [])] : (/Gluten-Free/.test(base) ? ['gluten-free'] : []),
      takeawayType: 'pizza', blurb: `${top} on a ${/\(/.test(base) ? base.replace(/[()]/g, '').trim().toLowerCase() : 'stone-baked base'} with mozzarella and tomato.`,
    });
  }

  const inProt = [['Chicken', 'chicken', []], ['Chicken Tikka', 'chicken', []], ['Lamb', 'lamb', []], ['Beef', 'beef', []], ['King Prawn', 'seafood', ['pescatarian', 'dairy-free']], ['Paneer', 'veggie', ['vegetarian']], ['Chickpea', 'vegan', ['vegetarian', 'vegan', 'dairy-free']], ['Vegetable', 'veggie', ['vegetarian', 'vegan', 'dairy-free']], ['Fish', 'fish', ['pescatarian', 'dairy-free']], ['Mixed Vegetable', 'veggie', ['vegetarian', 'vegan', 'dairy-free']], ['Aloo & Chickpea', 'vegan', ['vegetarian', 'vegan', 'dairy-free']], ['Keema', 'lamb', ['dairy-free']], ['Egg', 'egg', ['vegetarian']]];
  const inStyle = [['Tikka Masala', 2], ['Korma', 1], ['Jalfrezi', 3], ['Madras', 3], ['Vindaloo', 3], ['Bhuna', 2], ['Rogan Josh', 2], ['Dopiaza', 2], ['Dhansak', 2], ['Pathia', 3], ['Balti', 2], ['Saag', 2], ['Karahi', 3], ['Methi', 2], ['Achari', 2], ['Ceylon', 3], ['Chettinad', 3], ['Do Pyaza', 2], ['Garlic Chilli', 3], ['Makhani', 1], ['Pasanda', 1], ['Chasni', 1], ['Lababdar', 1], ['Jaipuri', 2], ['Biryani', 2], ['Rezala', 1], ['Nihari', 2], ['Kadai', 2], ['Jhal Frezi', 3], ['Shatkora', 2], ['Naga', 3], ['Butter', 1], ['Malai', 1]];
  for (const [pn, pk, pd] of inProt) for (const [st, sp] of inStyle) {
    if (pk === 'fish' && /Vindaloo|Karahi|Chettinad|Nihari|Naga/.test(st)) continue;
    if (pk === 'egg' && /Nihari|Biryani|Keema/.test(st)) continue;
    add(`${pn} ${st}`, {
      cuisine: 'indian', protein: pk, carb: 'rice', spicy: sp, richness: 'hearty', mood: sp <= 1 ? ['comfort', 'indulgent'] : ['comfort'], format: 'bowl',
      diet: pd.length ? pd : (['Korma', 'Makhani', 'Pasanda', 'Chasni', 'Lababdar', 'Tikka Masala', 'Rezala', 'Biryani', 'Butter', 'Malai'].includes(st) ? ['gluten-free'] : ['gluten-free', 'dairy-free']),
      takeawayType: 'indian', blurb: `${pn} ${st.toLowerCase()}, with rice or naan.`,
    });
  }

  const cnProt = [['Chicken', 'chicken'], ['Beef', 'beef'], ['Pork', 'pork'], ['King Prawn', 'seafood'], ['Roast Duck', 'mixed'], ['Tofu', 'vegan'], ['Mixed Vegetable', 'veggie'], ['Char Siu Pork', 'pork'], ['Shredded Chilli Beef', 'beef'], ['Salt & Chilli Chicken', 'chicken'], ['Salt & Chilli Squid', 'seafood'], ['Crispy Shredded Chicken', 'chicken']];
  const cnStyle = [['in Black Bean Sauce', 1], ['Sweet & Sour', 0], ['in Oyster Sauce', 0], ['Kung Pao', 3], ['Szechuan', 3], ['with Ginger & Spring Onion', 0], ['Salt & Pepper', 2], ['Cantonese Style', 0], ['Chow Mein', 1], ['Curry', 1], ['Satay', 1], ['in Lemon Sauce', 0], ['in Honey & Chilli Sauce', 2], ['in Hoisin Sauce', 0], ['with Cashew Nuts', 0], ['in Yellow Bean Sauce', 0], ['Peking Style', 1], ['Manchurian', 2], ['Hot & Sour', 2], ['in Garlic Sauce', 1], ['Teriyaki', 0], ['in Plum Sauce', 0], ['in Chilli Oil', 3], ['in XO Sauce', 2], ['in Black Pepper Sauce', 1]];
  for (const [pn, pk] of cnProt) for (const [st, sp] of cnStyle) {
    if (pk === 'vegan' && /Oyster/.test(st)) continue;
    add(`${pn} ${st}`, { cuisine: 'east-asian', protein: pk, carb: /Chow Mein/.test(st) ? 'noodles' : 'rice', spicy: sp, richness: 'medium', mood: ['comfort'], format: 'bowl', diet: pk === 'vegan' || pk === 'veggie' ? ['vegetarian', 'vegan', 'dairy-free'] : ['dairy-free'], takeawayType: 'chinese', blurb: `${pn} ${st.replace(/^in |^with /, 'with ')}, with fried or steamed rice.` });
  }

  const thProt = [['Chicken', 'chicken'], ['Beef', 'beef'], ['Prawn', 'seafood'], ['Pork', 'pork'], ['Tofu', 'vegan'], ['Vegetable', 'veggie'], ['Duck', 'mixed'], ['Squid', 'seafood']];
  const thStyle = [['Green Curry', 2], ['Red Curry', 2], ['Panang Curry', 2], ['Massaman Curry', 1], ['Jungle Curry', 3], ['Yellow Curry', 1], ['Pad Thai', 1], ['Pad See Ew', 1], ['Drunken Noodles', 3], ['Cashew Stir-Fry', 1], ['Holy Basil Stir-Fry', 3], ['Sweet Chilli Stir-Fry', 1], ['Tamarind Stir-Fry', 1], ['Ginger Stir-Fry', 1], ['Garlic & Pepper Stir-Fry', 1], ['Prik King', 3], ['Choo Chee', 2]];
  for (const [pn, pk] of thProt) for (const [st, sp] of thStyle) {
    add(`Thai ${pn} ${st}`, { cuisine: 'east-asian', protein: pk, carb: /Noodles|Pad/.test(st) ? 'noodles' : 'rice', spicy: sp, richness: 'medium', mood: sp >= 2 ? ['comfort'] : ['comfort', 'fresh'], format: 'bowl', diet: pk === 'vegan' || pk === 'veggie' ? ['vegetarian', 'vegan', 'dairy-free'] : ['dairy-free'], takeawayType: 'thai', blurb: `Thai ${pn.toLowerCase()} ${st.toLowerCase()} with jasmine rice or noodles.` });
  }

  const burgers = ['Classic Cheeseburger', 'Double Cheeseburger', 'Bacon Cheeseburger', 'Double Bacon Cheeseburger', 'Triple Cheeseburger', 'BBQ Bacon Burger', 'Blue Cheese & Onion Jam Burger', 'Jalapeño & Pepper Jack Burger', 'Mushroom & Swiss Burger', 'Chilli Cheese Burger', 'Buttermilk Fried Chicken Burger', 'Nashville Hot Chicken Burger', 'Grilled Chicken Fillet Burger', 'Cajun Chicken Burger', 'Katsu Chicken Burger', 'Crispy Fish Burger', 'Halloumi Burger', 'Vegan Smash Burger', 'Falafel Burger', 'Bean & Beetroot Burger', 'Lamb Kofte Burger', 'Southern Fried Chicken Burger', 'Smash Burger', 'Truffle & Mushroom Burger', 'Pulled Pork Burger', 'Korean Fried Chicken Burger', 'Peri Peri Chicken Burger'];
  const sides = ['with Fries', 'with Sweet Potato Fries', 'with Onion Rings', 'with Loaded Fries', 'with Slaw & Fries'];
  for (const b of burgers) for (const side of sides) {
    const vegan = /Vegan|Falafel|Bean/.test(b);
    const veg = !vegan && /Halloumi|Mushroom & Swiss|Truffle/.test(b);
    add(`${b} ${side}`, { cuisine: 'american', protein: vegan ? 'vegan' : veg ? 'veggie' : /Chicken|Katsu/.test(b) ? 'chicken' : /Fish/.test(b) ? 'fish' : /Lamb/.test(b) ? 'lamb' : /Pulled Pork/.test(b) ? 'pork' : 'beef', carb: /Sweet Potato/.test(side) ? 'potato' : 'bread', spicy: /Jalapeño|Nashville|Cajun|Hot|Southern|Chilli|Korean|Peri/.test(b) ? 2 : 0, richness: 'hearty', mood: ['comfort', 'indulgent'], format: 'handheld', diet: vegan ? ['vegetarian', 'vegan', 'dairy-free'] : veg ? ['vegetarian'] : /Fish/.test(b) ? ['pescatarian'] : [], takeawayType: 'burger', blurb: `${b} ${side}, with a choice of sauce.` });
  }

  const kebabs = [['Chicken Shish', 'chicken', 1], ['Lamb Shish', 'lamb', 1], ['Adana', 'lamb', 2], ['Urfa', 'lamb', 1], ['Chicken Doner', 'chicken', 1], ['Lamb Doner', 'lamb', 1], ['Mixed Shish', 'mixed', 1], ['Chicken Beyti', 'chicken', 1], ['Lamb Beyti', 'lamb', 1], ['Lamb Kofte', 'lamb', 1], ['Chicken Kofte', 'chicken', 1], ['Falafel', 'vegan', 1], ['Halloumi Shish', 'veggie', 0], ['Chicken Iskender', 'chicken', 1], ['Lamb Iskender', 'lamb', 1], ['Lamb Chop', 'lamb', 1], ['Chicken Wings', 'chicken', 1]];
  for (const [k, pk, sp] of kebabs) for (const fmt of [['Wrap', 'bread', 'handheld'], ['Plate', 'rice', 'plate'], ['on Chips', 'potato', 'plate'], ['Box', 'rice', 'bowl']]) {
    add(`${k} ${fmt[0]}`, { cuisine: 'middle-eastern', protein: pk, carb: fmt[1], spicy: sp, richness: 'hearty', mood: ['comfort'], format: fmt[2], diet: pk === 'vegan' ? ['vegetarian', 'vegan', 'dairy-free'] : pk === 'veggie' ? ['vegetarian'] : ['dairy-free'], takeawayType: 'kebab', blurb: `${k} ${fmt[0].toLowerCase()} with salad, pickles and garlic or chilli sauce.` });
  }

  const chippy = ['Cod', 'Haddock', 'Plaice', 'Rock', 'Scampi', 'Battered Sausage', 'Fishcake', 'Steak Pie', 'Chicken & Mushroom Pie', 'Meat & Potato Pie', 'Steak & Kidney Pudding', 'Battered Halloumi', 'Saveloy', 'Cornish Pasty', 'Chicken Kiev', 'Battered Mushrooms', 'Half Roast Chicken', 'Southern Fried Chicken', 'Doner', 'Sausage & Egg', 'Scampi & Calamari'];
  for (const c of chippy) for (const with_ of ['& Chips', '& Chips with Mushy Peas', '& Chips with Curry Sauce', '& Chips with Gravy', 'Supper']) {
    const fish = /Cod|Haddock|Plaice|Rock|Scampi|Fish|Calamari/.test(c);
    add(`${c} ${with_}`, { cuisine: 'british', protein: fish ? (/Scampi|Calamari/.test(c) ? 'seafood' : 'fish') : /Halloumi|Mushrooms/.test(c) ? 'veggie' : /Chicken|Kiev/.test(c) ? 'chicken' : /Doner/.test(c) ? 'lamb' : /Sausage|Saveloy|Pasty|Pie|Pudding|Egg/.test(c) ? 'pork' : 'beef', carb: 'potato', spicy: /Curry|Doner|Southern/.test(`${c} ${with_}`) ? 1 : 0, richness: 'hearty', mood: ['comfort', 'indulgent'], format: 'plate', diet: fish ? ['pescatarian'] : [], takeawayType: 'chippy', blurb: `${c} ${with_.toLowerCase()} — chip-shop comfort.` });
  }

  const fc = ['Fried Chicken Bucket', 'Fried Chicken & Chips', 'Popcorn Chicken & Fries', 'Chicken Tenders & Fries', 'Chicken Strips & Gravy', 'BBQ Wings', 'Buffalo Wings', 'Korean Wings', 'Salt & Pepper Wings', 'Lemon Pepper Wings', 'Garlic Parmesan Wings', 'Honey Sriracha Wings', 'Nashville Hot Chicken', 'Chicken & Waffles', 'Peri Peri Quarter Chicken', 'Peri Peri Half Chicken', 'Peri Peri Whole Chicken', 'Chicken Rice Box', 'Gravy Chicken Fries', 'Popcorn Chicken Rice Box', 'Boneless Banquet', 'Fillet Burger Meal', 'Zinger Meal', 'Wings & Waffle', 'Katsu Chicken Box', 'Nashville Chicken Box'];
  for (const c of fc) {
    add(c, { cuisine: /Korean/.test(c) ? 'east-asian' : /Peri/.test(c) ? 'other' : 'american', protein: 'chicken', carb: /Rice/.test(c) ? 'rice' : /Waffle/.test(c) ? 'bread' : /Wings/.test(c) ? 'none' : 'potato', spicy: /Buffalo|Nashville|Hot|Korean|Peri|Sriracha|Zinger/.test(c) ? 2 : /BBQ|Salt & Pepper/.test(c) ? 1 : 0, richness: 'hearty', mood: ['indulgent', 'comfort'], format: /Bucket|Banquet|Wings|Whole/.test(c) ? 'sharing' : /Box/.test(c) ? 'bowl' : 'plate', diet: /Wings|Peri/.test(c) ? ['dairy-free'] : [], takeawayType: 'fried-chicken', blurb: `${c} — crispy fried chicken with sides and dips.` });
  }

  const mex = ['Chicken Burrito', 'Steak Burrito', 'Carnitas Burrito', 'Barbacoa Burrito', 'Bean Burrito', 'Chicken Burrito Bowl', 'Steak Burrito Bowl', 'Veggie Burrito Bowl', 'Chicken Quesadilla', 'Steak Quesadilla', 'Cheese Quesadilla', 'Chicken Tacos', 'Beef Tacos', 'Fish Tacos', 'Carnitas Tacos', 'Al Pastor Tacos', 'Chicken Enchiladas', 'Beef Enchiladas', 'Cheese & Bean Enchiladas', 'Loaded Nachos', 'BBQ Chicken Nachos', 'Chicken Chimichanga', 'Beef Chimichanga', 'Chicken Fajita Wrap', 'Steak Fajita Wrap', 'Chilli Cheese Fries', 'Chicken Taquitos', 'Elote Bowl', 'Birria Tacos', 'Baja Fish Tacos', 'Chorizo Burrito'];
  for (const c of mex) {
    const veg = /Bean Burrito|Cheese Quesadilla|Veggie|Cheese & Bean|Elote/.test(c) && !/Chicken|Steak|Beef|Fish|Carnitas|Barbacoa|Pastor|BBQ|Birria|Chorizo/.test(c);
    add(c, { cuisine: 'mexican', protein: veg ? 'veggie' : /Fish|Baja/.test(c) ? 'fish' : /Chicken/.test(c) ? 'chicken' : /Carnitas|Pastor|Chorizo/.test(c) ? 'pork' : 'beef', carb: /Bowl/.test(c) ? 'rice' : /Nachos|Fries|Taquitos|Elote/.test(c) ? 'none' : 'bread', spicy: 2, richness: 'hearty', mood: /Bowl|Elote/.test(c) ? ['healthy', 'comfort'] : ['comfort', 'indulgent'], format: /Nachos|Fries|Taquitos/.test(c) ? 'sharing' : /Bowl|Elote/.test(c) ? 'bowl' : 'handheld', diet: veg ? ['vegetarian'] : /Fish|Baja/.test(c) ? ['pescatarian'] : [], takeawayType: 'mexican', blurb: `${c} with rice, beans, salsa, guacamole and soured cream.` });
  }

  // pan-asian mains
  const paMains = ['Chicken Katsu Curry', 'Pork Katsu Curry', 'Prawn Katsu Curry', 'Sweet Potato Katsu Curry', 'Chicken Teriyaki Donburi', 'Salmon Teriyaki Donburi', 'Beef Yakiniku Donburi', 'Chicken Katsudon', 'Pork Katsudon', 'Chicken Yakisoba', 'Vegetable Yakisoba', 'Prawn Yaki Udon', 'Chicken Ramen', 'Tonkotsu Ramen', 'Miso Ramen', 'Spicy Miso Ramen', 'Vegetable Gyoza Box', 'Chicken Karaage Box', 'Salmon Sushi Set', 'Chirashi Bowl', 'Teriyaki Tofu Bowl', 'Katsu Chicken Wrap', 'Beef Bibimbap', 'Chicken Bibimbap', 'Tofu Bibimbap', 'Beef Bulgogi Box', 'Pork Bulgogi Box', 'Korean Fried Chicken Box', 'Gochujang Fried Chicken', 'Kimchi Fried Rice', 'Japchae', 'Tteokbokki', 'Beef Pho', 'Chicken Pho', 'Veggie Pho', 'Pork Banh Mi', 'Chicken Banh Mi', 'Tofu Banh Mi', 'Lemongrass Pork Vermicelli Bowl', 'Lemongrass Chicken Vermicelli Bowl', 'Prawn Summer Rolls', 'Grilled Pork Broken Rice', 'Caramel Clay Pot Chicken', 'Nasi Goreng', 'Mee Goreng', 'Beef Rendang', 'Chicken Rendang', 'Prawn Laksa', 'Chicken Laksa', 'Hainanese Chicken Rice', 'Char Kway Teow'];
  for (const dn of paMains) {
    const vegan = /Tofu|Vegetable|Veggie/.test(dn);
    add(dn, { cuisine: 'east-asian', protein: vegan ? 'vegan' : /Salmon|Sushi|Chirashi|Prawn|Yaki Udon|Laksa/.test(dn) && !/Chicken/.test(dn) ? (/Prawn|Laksa/.test(dn) ? 'seafood' : 'fish') : /Beef|Bulgogi|Rendang|Pho|Yakiniku|Bibimbap/.test(dn) && !/Chicken/.test(dn) ? 'beef' : /Pork|Katsudon|Banh Mi|Tonkotsu|Broken Rice/.test(dn) && !/Chicken/.test(dn) ? 'pork' : 'chicken', carb: /Ramen|Pho|Laksa|Japchae|Yakisoba|Yaki Udon|Vermicelli|Kway Teow/.test(dn) ? 'noodles' : /Banh Mi/.test(dn) ? 'bread' : 'rice', spicy: /Spicy|Gochujang|Tteokbokki|Laksa|Rendang/.test(dn) ? 2 : 1, richness: /Ramen|Katsu|Karaage|Donburi|Katsudon|Rendang/.test(dn) ? 'hearty' : 'medium', mood: /Sushi|Chirashi|Tofu|Gyoza|Summer Rolls|Pho|Vermicelli/.test(dn) ? ['light', 'fresh', 'healthy'] : ['comfort'], format: /Ramen|Pho|Laksa/.test(dn) ? 'soup' : /Set|Box|Sushi|Summer Rolls/.test(dn) ? 'sharing' : /Wrap|Banh Mi/.test(dn) ? 'handheld' : 'bowl', diet: vegan ? ['vegetarian', 'vegan', 'dairy-free'] : ['dairy-free'], takeawayType: /Sushi|Chirashi/.test(dn) ? 'sushi' : /Bibimbap|Bulgogi|Korean|Gochujang|Japchae|Tteokbokki|Kimchi/.test(dn) ? 'korean' : /Pho|Banh Mi|Vermicelli|Broken Rice|Clay Pot|Summer Rolls/.test(dn) ? 'vietnamese' : 'japanese', blurb: `${dn} — a pan-Asian takeaway staple.` });
  }

  // healthy / deli
  const hh = ['Salmon Poke Bowl', 'Spicy Tuna Poke Bowl', 'Tofu Poke Bowl', 'Prawn Poke Bowl', 'Teriyaki Chicken Poke Bowl', 'Grilled Chicken Grain Bowl', 'Falafel Grain Bowl', 'Halloumi Grain Bowl', 'Chicken Caesar Salad', 'Superfood Salad', 'Chicken & Quinoa Salad', 'Teriyaki Chicken Rice Box', 'Katsu Chicken Salad Box', 'Chicken Shawarma Salad Bowl', 'Vegan Buddha Bowl', 'Miso Salmon Bowl', 'Peri Peri Chicken Salad', 'Chicken & Avocado Salad', 'Spiced Lentil Soup', 'Chicken Noodle Soup', 'Roasted Veg & Grain Bowl', 'Chicken Club Wrap', 'Falafel & Hummus Wrap', 'Tuna Melt Panini', 'Chicken Pesto Panini', 'Italian Sub', 'Meatball Marinara Sub', 'Salt Beef Bagel', 'Pastrami on Rye', 'Caprese Ciabatta', 'Halloumi & Roasted Veg Wrap', 'Soup & Sourdough', 'Greek Salad Box', 'Chicken Katsu Wrap', 'Poke Burrito', 'Sushi Burrito'];
  for (const c of hh) {
    const vegan = /Tofu|Falafel|Buddha|Lentil|Hummus/.test(c);
    const deli = /Wrap|Panini|Sub|Bagel|Rye|Ciabatta|Sourdough|Burrito/.test(c);
    add(c, { cuisine: /Poke|Teriyaki|Katsu|Miso|Noodle|Sushi/.test(c) ? 'east-asian' : /Shawarma|Falafel|Halloumi|Lentil|Hummus/.test(c) ? 'middle-eastern' : /Italian|Caprese|Meatball|Pesto|Greek/.test(c) ? 'med' : /Peri/.test(c) ? 'other' : 'american', protein: vegan ? 'vegan' : /Salmon|Tuna/.test(c) && !/Chicken/.test(c) ? 'fish' : /Prawn/.test(c) ? 'seafood' : /Halloumi|Caprese/.test(c) ? 'veggie' : /Beef|Pastrami|Meatball/.test(c) ? 'beef' : 'chicken', carb: /Bowl|Box|Rice|Grain|Quinoa|Poke/.test(c) ? (/Grain|Quinoa/.test(c) ? 'grains' : 'rice') : deli ? 'bread' : /Soup/.test(c) ? 'none' : 'salad', spicy: /Spicy|Peri|Shawarma/.test(c) ? 1 : 0, richness: deli ? 'medium' : /Soup|Salad/.test(c) ? 'light' : 'medium', mood: deli ? ['comfort', 'fresh'] : ['healthy', 'fresh', 'light'], format: /Soup/.test(c) ? 'soup' : /Wrap|Panini|Sub|Bagel|Rye|Ciabatta|Burrito/.test(c) ? 'handheld' : /Salad/.test(c) ? 'salad' : 'bowl', diet: vegan ? ['vegetarian', 'vegan', 'dairy-free'] : /Salmon|Tuna|Prawn/.test(c) && !/Chicken/.test(c) ? ['pescatarian'] : /Halloumi|Caprese/.test(c) ? ['vegetarian'] : [], takeawayType: deli ? 'deli' : 'healthy', blurb: `${c} — freshly made to order.` });
  }
  return out;
}

function restaurantSet() {
  const out = [];
  const tierFor = (n) => /Fillet|Lobster|Wagyu|Truffle|Scallop|Rib-?eye|Tomahawk|Ch[aâ]teaubriand|Turbot|Dover Sole|Tasting|Rack of|Foie|Oyster|Caviar|Monkfish|Wellington|Halibut/i.test(n) ? 3 : /Steak|Duck|Lamb|Sea Bass|Bream|Risotto|Bourguignon|Confit|Osso Buco|Sharing|Short Rib|Brisket|Venison|Sunday|for Two/i.test(n) ? 2 : 1;
  const add = (name, o) => { const id = claim('restaurant', name, 'r'); if (id) out.push({ id, name, venue: 'restaurant', searchTerm: `${name.toLowerCase()} restaurant`, priceTier: o.priceTier || tierFor(name), ...o }); };

  const shapes = ['Spaghetti', 'Rigatoni', 'Penne', 'Linguine', 'Tagliatelle', 'Gnocchi', 'Pappardelle', 'Fusilli', 'Bucatini', 'Orecchiette', 'Casarecce', 'Mafaldine', 'Trofie', 'Paccheri'];
  const psauce = [['Bolognese', 'beef', 0], ['Carbonara', 'pork', 0], ['Arrabbiata', 'vegan', 2], ['Puttanesca', 'fish', 1], ['Amatriciana', 'pork', 1], ['al Pomodoro', 'vegan', 0], ['al Pesto', 'veggie', 0], ['alla Vodka', 'veggie', 1], ['Cacio e Pepe', 'veggie', 0], ['Primavera', 'veggie', 0], ['alla Norma', 'veggie', 0], ['with Nduja & Burrata', 'pork', 2], ['Alfredo', 'veggie', 0], ['with Wild Mushrooms', 'veggie', 0], ['with Prawns, Chilli & Lemon', 'seafood', 1], ['with Sausage & Fennel', 'pork', 1], ['with Crab & Chilli', 'seafood', 1], ['al Ragù di Cinghiale', 'pork', 0], ['with Lamb Ragù', 'lamb', 0], ['with Clams', 'seafood', 1], ['with Sun-Dried Tomato & Mascarpone', 'veggie', 0], ['with Truffle & Parmesan', 'veggie', 0], ['with Nduja & Prawns', 'seafood', 2], ['with Duck Ragù', 'mixed', 0], ['with Pancetta & Peas', 'pork', 0]];
  for (const shape of shapes) for (const [sc, pk, sp] of psauce) {
    add(`${shape} ${sc}`, { cuisine: 'italian', protein: pk, carb: 'pasta', spicy: sp, richness: 'medium', mood: sp === 0 && pk === 'veggie' ? ['comfort'] : ['comfort', 'indulgent'], format: 'bowl', diet: pk === 'vegan' ? ['vegetarian', 'vegan', 'dairy-free'] : pk === 'veggie' ? ['vegetarian'] : pk === 'seafood' || pk === 'fish' ? ['pescatarian'] : [], restaurantType: 'italian', blurb: `${shape} ${sc}, made fresh in-house.` });
  }
  for (const f of ['Milanese', 'Wild Mushroom', 'Prawn & Lemon', 'Asparagus & Pea', 'Butternut & Sage', 'Nero di Seppia', 'Chicken & Chorizo', 'Truffle & Parmesan', "Beetroot & Goat's Cheese", 'Seafood', 'Radicchio & Taleggio', 'Courgette & Mint', 'Pumpkin & Amaretti', 'Crab & Chilli', 'Smoked Haddock', 'Pea, Broad Bean & Mint', 'Wild Garlic', 'Saffron & Prawn'])
    add(`${f} Risotto`, { cuisine: 'italian', protein: /Prawn|Seafood|Nero|Crab|Haddock/.test(f) ? 'seafood' : /Chicken/.test(f) ? 'chicken' : 'veggie', carb: 'rice', spicy: /Chilli/.test(f) ? 1 : 0, richness: 'hearty', mood: ['comfort', 'indulgent'], format: 'bowl', diet: /Prawn|Seafood|Nero|Crab|Haddock/.test(f) ? ['pescatarian', 'gluten-free'] : ['vegetarian', 'gluten-free'], restaurantType: 'italian', blurb: `A slow-stirred ${f.toLowerCase()} risotto finished with butter and Parmesan.` });

  const cuts = [['Ribeye Steak', 'beef', 3], ['Sirloin Steak', 'beef', 2], ['Fillet Steak', 'beef', 3], ['Rump Steak', 'beef', 2], ['T-Bone Steak', 'beef', 3], ['Tomahawk for Two', 'beef', 3], ['Picanha', 'beef', 2], ['Flat Iron Steak', 'beef', 2], ['Bavette Steak', 'beef', 2], ['Chateaubriand for Two', 'beef', 3], ['Lamb Rump', 'lamb', 2], ['Rack of Lamb', 'lamb', 3], ['Lamb Chops', 'lamb', 2], ['Pork Chop', 'pork', 1], ['Half Chicken', 'chicken', 1], ['Chicken Skewers', 'chicken', 1], ['Gammon Steak', 'pork', 1], ['Beef Short Rib', 'beef', 2], ['Mixed Grill', 'mixed', 2], ['Whole Sea Bass', 'fish', 2], ['Salmon Fillet', 'fish', 2], ['King Prawn Skewers', 'seafood', 2], ['Cauliflower Steak', 'vegan', 1], ['Portobello Mushroom Stack', 'veggie', 1], ['Tuna Steak', 'fish', 2], ['Duck Breast', 'mixed', 2]];
  const fins = ['with Peppercorn Sauce', 'with Béarnaise', 'with Chimichurri', 'with Garlic & Herb Butter', 'with Blue Cheese Sauce', 'with Red Wine Jus', 'with Café de Paris Butter', 'with Salsa Verde', 'with Diane Sauce', 'with Bone Marrow Butter', 'with Green Peppercorn & Brandy', 'with Roquefort Cream'];
  for (const [cut, pk, tier] of cuts) for (const fin of fins) {
    if (['fish', 'seafood', 'vegan', 'veggie'].includes(pk) && /Blue Cheese|Peppercorn|Diane|Bone Marrow|Roquefort/.test(fin)) continue;
    add(`${cut} ${fin}`, { cuisine: 'american', protein: pk, carb: 'potato', spicy: /Chimichurri/.test(fin) ? 1 : 0, richness: 'hearty', mood: tier === 3 ? ['fancy', 'indulgent'] : ['indulgent', 'comfort'], format: /for Two|Mixed Grill/.test(cut) ? 'sharing' : 'plate', diet: ['fish', 'seafood'].includes(pk) ? ['pescatarian', 'gluten-free'] : pk === 'vegan' ? ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'] : pk === 'veggie' ? ['vegetarian', 'gluten-free'] : ['gluten-free'], restaurantType: 'grill', priceTier: tier, blurb: `${cut} grilled over fire, ${fin.toLowerCase()}, with chips and a side.` });
  }

  const indP = [['Chicken', 'chicken'], ['Lamb', 'lamb'], ['King Prawn', 'seafood'], ['Paneer', 'veggie'], ['Vegetable', 'veggie'], ['Fish', 'fish'], ['Chickpea', 'vegan'], ['Duck', 'mixed'], ['Goat', 'mixed']];
  const indS = [['Tikka Masala', 2], ['Rogan Josh', 2], ['Korma', 1], ['Jalfrezi', 3], ['Makhani', 1], ['Saag', 2], ['Biryani', 2], ['Dhansak', 2], ['Karahi', 3], ['Bhuna', 2], ['Chettinad', 3], ['Xacuti', 2], ['Kolhapuri', 3], ['Do Pyaza', 2], ['Achari', 2], ['Nihari', 2], ['Handi', 2], ['Pasanda', 1], ['Methi', 2], ['Vindaloo', 3]];
  for (const [pn, pk] of indP) for (const [st, sp] of indS) {
    if (pk === 'vegan' && /Nihari|Karahi/.test(st)) continue;
    add(`${pn} ${st}`, { cuisine: 'indian', protein: pk, carb: 'rice', spicy: sp, richness: 'hearty', mood: sp <= 1 ? ['comfort', 'indulgent'] : ['comfort'], format: 'bowl', diet: pk === 'seafood' || pk === 'fish' ? ['pescatarian', 'gluten-free'] : pk === 'veggie' ? ['vegetarian', 'gluten-free'] : pk === 'vegan' ? ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'] : ['gluten-free'], restaurantType: 'indian', priceTier: 2, blurb: `${pn} ${st.toLowerCase()} with basmati rice, naan and chutneys.` });
  }

  for (const m of ['Peking Duck', 'Dim Sum Selection', 'Crispy Chilli Beef', 'Kung Pao Chicken', 'Mapo Tofu', 'Twice-Cooked Pork', 'Salt & Pepper Squid', 'Steamed Sea Bass with Ginger', 'Sichuan Hot Pot', 'Char Siu Pork', 'Thai Green Curry', 'Thai Red Duck Curry', 'Pad Thai', 'Tom Yum Soup', 'Massaman Beef Curry', 'Crispy Pork with Holy Basil', 'Chicken Satay', 'Beef Rendang', 'Prawn Laksa', 'Nasi Goreng', 'Dolsot Bibimbap', 'Korean Fried Chicken', 'Beef Bulgogi', 'Japchae', 'Tonkotsu Ramen', 'Miso Black Cod', 'Chicken Katsu Curry', 'Wagyu Teppanyaki', 'Beef Pho', 'Shaking Beef', 'Singapore Chilli Crab', 'Hainanese Chicken Rice', 'Bun Cha', 'Whole Steamed Fish', 'Salt Baked Chicken', 'Sizzling Beef', 'Aromatic Crispy Duck', 'Szechuan King Prawns', 'Black Bean Beef', 'Sweet & Sour Pork Hong Kong Style'])
    add(m, { cuisine: 'east-asian', protein: /Duck/.test(m) ? 'mixed' : /Beef|Bulgogi|Rendang|Shaking|Pho|Bibimbap|Sizzling/.test(m) && !/Chicken/.test(m) ? 'beef' : /Pork|Char Siu|Bun Cha|Tonkotsu/.test(m) && !/Chicken/.test(m) ? 'pork' : /Squid|Prawn|Laksa|Crab|Cod/.test(m) ? 'seafood' : /Sea Bass|Steamed Fish/.test(m) ? 'fish' : /Tofu|Japchae/.test(m) ? 'vegan' : 'chicken', carb: /Ramen|Pho|Laksa|Japchae|Pad Thai|Bun Cha/.test(m) ? 'noodles' : /Soup/.test(m) ? 'none' : 'rice', spicy: /Sichuan|Kung Pao|Mapo|Holy Basil|Laksa|Rendang|Tom Yum|Chilli|Korean Fried|Hot Pot|Green Curry|Red Duck|Szechuan/.test(m) ? 3 : /Katsu|Massaman|Satay|Bulgogi|Nasi|Sweet & Sour/.test(m) ? 1 : 1, richness: /Soup|Pho|Satay|Bibimbap/.test(m) ? 'medium' : 'hearty', mood: /Wagyu|Cod|Crab|Peking/.test(m) ? ['fancy', 'indulgent'] : ['comfort'], format: /Selection|Hot Pot|Peking|Teppanyaki|Crab|Aromatic/.test(m) ? 'sharing' : /Soup|Ramen|Pho|Laksa/.test(m) ? 'soup' : 'bowl', diet: /Tofu|Japchae/.test(m) ? ['vegetarian', 'vegan', 'dairy-free'] : ['dairy-free'], restaurantType: /Ramen|Katsu|Teppanyaki|Cod|Bibimbap|Bulgogi|Japchae|Korean|Pho|Bun Cha/.test(m) ? 'asian' : 'chinese', priceTier: /Wagyu|Cod|Peking|Crab|Hot Pot/.test(m) ? 3 : 2, blurb: `${m} — a pan-Asian restaurant favourite.` });

  for (const m of ['Seafood Paella', 'Chicken & Chorizo Paella', 'Vegetable Paella', 'Mixed Paella', 'Gambas al Ajillo', 'Grilled Octopus', 'Pulpo a la Gallega', 'Patatas Bravas', 'Jamón Croquetas', 'Tortilla Española', 'Pimientos de Padrón', 'Secreto Ibérico', 'Fabada Asturiana', 'Txuletón for Two', 'Lamb Kleftiko', 'Pork Souvlaki Plate', 'Chicken Souvlaki Plate', 'Moussaka', 'Chargrilled Whole Sea Bream', 'Grilled Halloumi & Watermelon Salad', 'Mezze Sharing Board', 'Slow-Roast Lamb Shoulder', 'Prawn Saganaki', 'Stuffed Peppers', 'Chicken Shawarma Plate', 'Lamb Shish Plate', 'Falafel & Mezze Plate', 'Lamb & Apricot Tagine', 'Chicken & Olive Tagine', 'Baked Feta & Tomato', 'Grilled Sardines', 'Aubergine & Chickpea Stew', 'Manti', 'İskender Kebab', 'Adana Kebab Plate', 'Lahmacun', 'Chicken Fesenjan', 'Maqluba', 'Chicken Musakhan', 'Kofte in Tomato Sauce', 'Imam Bayildi', 'Halloumi Saganaki', 'Whole Baked Sea Bass'])
    add(m, { cuisine: /Shawarma|Shish|Falafel|Tagine|Mezze|Kleftiko|Manti|İskender|Adana|Lahmacun|Fesenjan|Maqluba|Musakhan|Kofte|Imam/.test(m) ? 'middle-eastern' : 'med', protein: /Vegetable Paella|Halloumi|Mezze|Stuffed Peppers|Falafel|Baked Feta|Aubergine|Padrón|Tortilla|Bravas|Imam/.test(m) ? (/Falafel|Aubergine|Imam/.test(m) ? 'vegan' : 'veggie') : /Seafood|Octopus|Gambas|Prawn|Sea Bream|Sardines|Pulpo|Sea Bass/.test(m) && !/Chicken|Chorizo/.test(m) ? 'seafood' : /Lamb/.test(m) ? 'lamb' : /Pork|Ibérico|Croquetas|Jamón|Fabada|Souvlaki Plate/.test(m) ? 'pork' : /Beef|Txuletón/.test(m) ? 'beef' : /Chicken/.test(m) ? 'chicken' : 'veggie', carb: /Paella|Maqluba/.test(m) ? 'rice' : /Tagine/.test(m) ? 'grains' : /Souvlaki|Kleftiko/.test(m) ? 'potato' : /Plate|Shawarma|Shish|Kebab|Lahmacun/.test(m) ? 'bread' : /Salad/.test(m) ? 'salad' : 'none', spicy: /Saganaki|Shawarma|Tagine|Adana|Bravas/.test(m) ? 1 : 0, richness: /Salad|Mezze|Sardines|Padrón|Bravas|Croquetas/.test(m) ? 'light' : 'hearty', mood: /Salad|Mezze|Sardines/.test(m) ? ['fresh', 'light', 'healthy'] : ['comfort', 'fresh'], format: /Paella|Board|Sharing|Shoulder|Mezze|for Two/.test(m) ? 'sharing' : /Salad/.test(m) ? 'salad' : 'plate', diet: /Vegetable Paella|Halloumi|Stuffed Peppers|Baked Feta/.test(m) ? ['vegetarian', 'gluten-free'] : /Falafel|Aubergine|Imam/.test(m) ? ['vegetarian', 'vegan', 'dairy-free'] : /Seafood|Octopus|Gambas|Prawn|Sea Bream|Sardines|Pulpo|Sea Bass/.test(m) ? ['pescatarian', 'gluten-free'] : ['gluten-free', 'dairy-free'], restaurantType: /Shawarma|Shish|Falafel|Tagine|Mezze|Kleftiko|Manti|İskender|Adana|Lahmacun|Fesenjan|Maqluba|Musakhan/.test(m) ? 'middle-eastern' : 'med', priceTier: /for Two|Txuletón|Ibérico|Octopus|Pulpo|Shoulder|Sea Bream|Sea Bass/.test(m) ? 3 : 2, blurb: `${m} — to share or as a main.` });

  for (const [m, pk, tier] of [['Steak Frites', 'beef', 2], ['Coq au Vin', 'chicken', 2], ['Confit de Canard', 'mixed', 2], ['Boeuf Bourguignon', 'beef', 2], ['Moules Marinière', 'seafood', 2], ['Cassoulet', 'mixed', 2], ["Soupe à l'Oignon Gratinée", 'veggie', 2], ['Escargots à la Bourguignonne', 'mixed', 2], ['Steak Tartare', 'beef', 3], ['Sole Meunière', 'fish', 3], ['Bouillabaisse', 'seafood', 3], ['Croque Monsieur', 'pork', 1], ['Quiche Lorraine', 'pork', 1], ['Salade Niçoise', 'fish', 2], ['Blanquette de Veau', 'beef', 2], ['Magret de Canard', 'mixed', 3], ['Poulet Rôti', 'chicken', 2], ['Beef Cheek Bourguignon', 'beef', 3], ['Fillet of Beef Rossini', 'beef', 3], ['Seared Scallops with Pea Purée', 'seafood', 3], ['Roast Turbot with Hollandaise', 'fish', 3], ['Rack of Lamb, Dauphinoise', 'lamb', 3], ['Chicken Chasseur', 'chicken', 2], ['Pork Rillettes', 'pork', 1], ['Ratatouille with Poached Egg', 'egg', 1], ['Tartiflette', 'pork', 2], ['Cheese Fondue', 'veggie', 2], ['Onion & Comté Tart', 'veggie', 2], ['Pot-au-Feu', 'beef', 2], ['Duck à l\'Orange', 'mixed', 3], ['Lobster Thermidor', 'seafood', 3], ['Beef Wellington', 'beef', 3], ['Cog au Riesling', 'chicken', 2], ['Pissaladière', 'fish', 1], ['Gratin Dauphinois with Ham', 'pork', 1]])
    add(m, { cuisine: 'french', protein: pk, carb: /Frites|Rôti|Dauphinoise|Tartiflette|Niçoise|Turbot|Rossini|Gratin/.test(m) ? 'potato' : /Cassoulet|Bourguignon|Blanquette|Chasseur|Coq|Cog|Pot-au-Feu|Orange|Thermidor|Wellington/.test(m) ? 'none' : /Croque|Fondue|Tart|Rillettes|Oignon|Pissaladière/.test(m) ? 'bread' : /Ratatouille/.test(m) ? 'grains' : 'none', spicy: 0, richness: /Salade|Escargots|Rillettes|Scallops/.test(m) ? 'medium' : 'hearty', mood: tier === 3 ? ['fancy', 'indulgent'] : /Salade|Ratatouille/.test(m) ? ['fresh', 'healthy'] : ['comfort', 'indulgent'], format: /Fondue|Bouillabaisse|Pot-au-Feu/.test(m) ? (/Fondue/.test(m) ? 'sharing' : 'soup') : 'plate', diet: pk === 'veggie' ? ['vegetarian'] : pk === 'egg' ? ['vegetarian'] : ['fish', 'seafood'].includes(pk) ? ['pescatarian'] : [], restaurantType: 'bistro', priceTier: tier, blurb: `${m} — classic French bistro cooking.` });

  for (const m of ['Steak & Ale Pie', 'Fish & Chips', 'Bangers & Mash', "Shepherd's Pie", 'Cottage Pie', 'Chicken & Leek Pie', 'Ham, Egg & Chips', 'Liver & Bacon', 'Braised Lamb Shank', 'Slow-Roast Pork Belly', "Fisherman's Pie", 'Scampi & Chips', 'Beef Brisket with Mash', 'Chicken Kiev', 'Toad in the Hole', 'Lancashire Hotpot', 'Gammon & Chips', 'Mushroom & Ale Pie', 'Cauliflower Cheese Bake', 'Nut Roast', 'Roast Beef Sunday Lunch', 'Roast Pork Sunday Lunch', 'Roast Chicken Sunday Lunch', 'Roast Lamb Sunday Lunch', 'Vegetarian Sunday Roast', "Ploughman's Board", 'Scotch Egg & Piccalilli', 'Devilled Whitebait', 'Welsh Rarebit', 'Beef Wellington', 'Venison Haunch', 'Faggots & Peas', 'Steak & Kidney Pudding', 'Fish Pie', 'Crab on Toast', 'Bubble & Squeak with Poached Egg', 'Steak & Chips', 'Chicken, Ham & Leek Pie', 'Beef Suet Pudding', 'Pan-Fried Calves Liver'])
    add(m, { cuisine: 'british', protein: /Mushroom & Ale|Cauliflower|Nut Roast|Vegetarian|Rarebit|Bubble/.test(m) ? (/Bubble/.test(m) ? 'egg' : 'veggie') : /Fish|Scampi|Fisherman|Crab|Whitebait/.test(m) ? (/Scampi|Crab/.test(m) ? 'seafood' : 'fish') : /Chicken|Kiev/.test(m) ? 'chicken' : /Lamb|Hotpot|Shepherd/.test(m) ? 'lamb' : /Pork|Bangers|Toad|Gammon|Ham|Faggots|Belly/.test(m) ? 'pork' : /Venison|Liver/.test(m) ? 'mixed' : /Scotch Egg/.test(m) ? 'egg' : 'beef', carb: /Pie|Wellington|Pudding/.test(m) ? 'pastry' : /Rarebit|Toast|Ploughman/.test(m) ? 'bread' : 'potato', spicy: /Devilled/.test(m) ? 1 : 0, richness: /Ploughman|Rarebit|Whitebait|Scotch Egg|Crab|Bubble/.test(m) ? 'medium' : 'hearty', mood: /Wellington|Venison/.test(m) ? ['fancy', 'indulgent'] : ['comfort'], format: /Board/.test(m) ? 'sharing' : 'plate', diet: /Mushroom & Ale|Cauliflower|Nut Roast|Vegetarian|Rarebit/.test(m) ? ['vegetarian'] : /Fish|Scampi|Fisherman|Crab/.test(m) ? ['pescatarian'] : [], restaurantType: 'gastropub', priceTier: /Sunday|Shank|Belly|Brisket|Wellington|Venison/.test(m) ? (/Wellington|Venison/.test(m) ? 3 : 2) : 1, blurb: `${m} — proper pub cooking with all the trimmings.` });

  for (const m of ['Roast Cod on Puy Lentils', 'Pan-Seared Sea Bass, Crushed Potatoes', 'Miso-Glazed Salmon', 'Whole Roast Plaice, Brown Shrimp Butter', 'Grilled Mackerel, Gooseberry', 'Halibut, Beurre Blanc', 'Monkfish Wrapped in Parma Ham', 'Seafood Linguine', 'Fish Stew with Rouille', 'Moules Frites', 'Half Lobster, Garlic Butter', 'Dressed Crab', 'Fruits de Mer Platter', 'Fish Tacos', 'Salt & Pepper Squid', 'Grilled Prawn Skewers', 'Cobb Salad', 'Chicken Caesar Salad', 'Poke Bowl', 'Buddha Bowl', 'Shakshuka', 'Eggs Benedict', 'Huevos Rancheros', 'Buttermilk Pancakes with Bacon', 'Avocado & Poached Egg on Sourdough', 'Steak & Eggs', 'Full English Breakfast', 'Chicken & Waffles', "Beetroot & Goat's Cheese Salad", 'Roasted Squash Grain Bowl', 'Mushroom & Chestnut Wellington', 'Cauliflower Steak, Romesco', 'Butternut & Sage Tortellini', 'Halloumi & Grain Salad', 'Falafel Mezze Plate', 'Burrata, Heritage Tomato & Basil', 'Tuna Tataki', 'Ceviche', 'Charred Hispi Cabbage', 'Wild Mushroom Tagliatelle'])
    add(m, { cuisine: /Shakshuka|Falafel/.test(m) ? 'middle-eastern' : /Huevos|Poke|Ceviche/.test(m) ? 'mexican' : /Burrata|Tortellini|Tagliatelle/.test(m) ? 'italian' : 'french', protein: /Lobster|Crab|Fruits de Mer|Moules|Prawn|Squid|Tataki/.test(m) ? (/Tataki/.test(m) ? 'fish' : 'seafood') : /Cod|Sea Bass|Salmon|Plaice|Mackerel|Halibut|Monkfish|Linguine|Fish Stew|Fish Tacos|Ceviche/.test(m) ? 'fish' : /Wellington|Cauliflower|Beetroot|Squash|Tortellini|Hispi|Wild Mushroom/.test(m) ? (/Tortellini|Beetroot|Halloumi|Burrata/.test(m) ? 'veggie' : 'vegan') : /Falafel/.test(m) ? 'vegan' : /Eggs|Shakshuka|Benedict|Rancheros|Avocado/.test(m) ? 'egg' : /Steak|Cobb|Caesar|Waffles|English|Pancakes/.test(m) ? (/Steak/.test(m) ? 'beef' : 'chicken') : 'veggie', carb: /Lentils|Grain Bowl|Buddha|Poke/.test(m) ? 'grains' : /Potatoes|Frites|English|Benedict|Rancheros/.test(m) ? 'potato' : /Sourdough|Pancakes|Waffles|Tacos|Mezze/.test(m) ? 'bread' : /Linguine|Tortellini|Tagliatelle/.test(m) ? 'pasta' : /Salad/.test(m) ? 'salad' : 'none', spicy: /Romesco|Huevos|Shakshuka|Ceviche/.test(m) ? 1 : 0, richness: /Salad|Bowl|Crab|Fruits|Avocado|Tataki|Ceviche|Burrata/.test(m) ? 'light' : /Benedict|English|Waffles|Wellington|Pancakes/.test(m) ? 'hearty' : 'medium', mood: /Salad|Bowl|Avocado|Poke|Tataki|Ceviche/.test(m) ? ['fresh', 'healthy', 'light'] : /Wellington|Lobster|Halibut|Monkfish|Fruits de Mer/.test(m) ? ['fancy', 'indulgent'] : ['comfort'], format: /Platter|Fruits de Mer/.test(m) ? 'sharing' : /Stew/.test(m) ? 'soup' : /Salad/.test(m) ? 'salad' : /Bowl|Poke|Buddha/.test(m) ? 'bowl' : 'plate', diet: /Lobster|Crab|Fruits de Mer|Moules|Prawn|Squid|Cod|Sea Bass|Salmon|Plaice|Mackerel|Halibut|Monkfish|Tataki|Ceviche/.test(m) ? ['pescatarian'] : /Wellington|Cauliflower|Squash|Hispi|Wild Mushroom/.test(m) ? ['vegetarian', 'vegan', 'dairy-free'] : /Tortellini|Beetroot|Halloumi|Burrata/.test(m) ? ['vegetarian'] : /Falafel/.test(m) ? ['vegetarian', 'vegan', 'dairy-free'] : /Eggs|Shakshuka|Benedict|Rancheros|Avocado/.test(m) ? ['vegetarian'] : [], restaurantType: 'modern', priceTier: /Lobster|Halibut|Monkfish|Fruits de Mer|Wellington|Dressed Crab/.test(m) ? 3 : 2, blurb: `${m} — a modern seasonal plate.` });

  return out;
}

const tkAll = shuffle(takeawaySet());
const rsAll = shuffle(restaurantSet());
const hAll = shuffle(homeCards);
console.log(`capacity — home ${hAll.length}, takeaway ${tkAll.length}, restaurant ${rsAll.length}`);

// split the deficit: ~72% home, ~14% takeaway, ~14% restaurant, top up from spare
let needH = Math.min(hAll.length, Math.round(DEFICIT * 0.72));
let needT = Math.min(tkAll.length, Math.round(DEFICIT * 0.14));
let needR = Math.min(rsAll.length, Math.round(DEFICIT * 0.14));
let total = needH + needT + needR;
while (total < DEFICIT) {
  let adv = false;
  if (needH < hAll.length) { needH++; total++; adv = true; }
  if (total < DEFICIT && needT < tkAll.length) { needT++; total++; adv = true; }
  if (total < DEFICIT && needR < rsAll.length) { needR++; total++; adv = true; }
  if (!adv) break;
}
const catalog = [...hAll.slice(0, needH), ...tkAll.slice(0, needT), ...rsAll.slice(0, needR)];

writeFileSync(join(OUT, 'dishes.json'), JSON.stringify(catalog));
const meta = {
  version: 1,
  generatedAt: new Date().toISOString(),
  bundled: bundledCount,
  hosted: catalog.length,
  total: bundledCount + catalog.length,
  home: needH, takeaway: needT, restaurant: needR,
};
writeFileSync(join(OUT, 'dishes.meta.json'), JSON.stringify(meta, null, 2) + '\n');
console.log(JSON.stringify(meta, null, 2));
