// Composes named dinners from technique x protein x flavour x base and writes
// them to src/data/{home,takeaway,restaurant}/gen-*.json until the whole deck
// reaches TARGET_TOTAL. De-duplicates by name against every existing dish.
// Run: node scripts/generate-dishes.mjs
import { readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const TARGET_TOTAL = 10000;
const CHUNK = 200;
// share of the shortfall to take from each venue (rest tops up wherever there's room)
const SPLIT = { home: 0.55, takeaway: 0.23, restaurant: 0.22 };

// ---------- deterministic RNG (mulberry32) --------------------------------
function rngMake(seed) {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rngMake(20260908);
const pick = (a) => a[Math.floor(rand() * a.length)];
const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const slug = (s) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ---------- load what already exists; wipe old generated files ----------
const ids = new Set();
const names = new Set(); // "venue|name" so the same dish name can exist per venue
for (const venue of ['home', 'takeaway', 'restaurant']) {
  for (const f of readdirSync(join(ROOT, venue))) {
    if (!f.endsWith('.json')) continue;
    if (f.startsWith('gen-')) { rmSync(join(ROOT, venue, f)); continue; }
    for (const d of JSON.parse(readFileSync(join(ROOT, venue, f), 'utf8'))) {
      ids.add(d.id);
      names.add(`${d.venue}|${d.name.toLowerCase()}`);
    }
  }
}
const baseCount = ids.size;
const DEFICIT = TARGET_TOTAL - baseCount;
console.log(`base deck ${baseCount}, need ${DEFICIT} more`);

const claim = (venue, name, idPrefix) => {
  const key = `${venue}|${name.toLowerCase()}`;
  if (names.has(key)) return null;
  const id = `${idPrefix}-${slug(name)}`.slice(0, 92);
  if (ids.has(id)) return null;
  names.add(key);
  ids.add(id);
  return id;
};

// ======================================================================
// FLAVOUR / SAUCE table
// ======================================================================
const F = (word, cuisine, spicy, ing, tags = []) => ({ word, cuisine, spicy, ing, tags });
const SAUCES = [
  F('Harissa', 'middle-eastern', 2, ['2 tbsp rose harissa', '1 lemon', 'a drizzle of honey'], ['smoky']),
  F("Za'atar", 'middle-eastern', 0, ["2 tbsp za'atar", 'olive oil', '1 lemon'], ['herby', 'fresh']),
  F('Sumac & Lemon', 'middle-eastern', 0, ['1 tbsp sumac', '2 lemons', 'olive oil', 'parsley'], ['zesty', 'fresh']),
  F('Ras el Hanout', 'middle-eastern', 1, ['2 tbsp ras el hanout', '1 tbsp tomato purée', 'a little stock']),
  F('Pomegranate & Walnut', 'middle-eastern', 0, ['3 tbsp pomegranate molasses', '60g walnuts', '1 onion'], ['zesty']),
  F('Baharat', 'middle-eastern', 1, ['2 tbsp baharat', '1 tbsp tomato purée', 'a squeeze of lemon']),
  F('Preserved Lemon & Olive', 'middle-eastern', 0, ['1 preserved lemon, chopped', '80g green olives', '1 tsp ground ginger'], ['zesty']),
  F('Tikka Masala', 'indian', 2, ['3 tbsp tikka curry paste', '200g passata', '4 tbsp cream or yoghurt']),
  F('Korma', 'indian', 1, ['3 tbsp korma paste', '100ml coconut milk', '2 tbsp ground almonds']),
  F('Jalfrezi', 'indian', 3, ['3 tbsp jalfrezi paste', '2 peppers', '3 green chillies']),
  F('Madras', 'indian', 3, ['3 tbsp madras paste', '400g chopped tomatoes', '1 tsp mustard seeds']),
  F('Rogan Josh', 'indian', 2, ['3 tbsp rogan josh paste', '150g yoghurt', '4 cardamom pods']),
  F('Bhuna', 'indian', 2, ['3 tbsp bhuna paste', '3 tomatoes', '2 tbsp ginger-garlic paste']),
  F('Balti', 'indian', 2, ['3 tbsp balti paste', '2 peppers', 'fresh coriander']),
  F('Saag', 'indian', 2, ['300g spinach, blitzed', '2 tbsp curry powder', '2 tbsp ginger-garlic paste']),
  F('Coconut Dhansak', 'indian', 2, ['3 tbsp curry paste', '100g red lentils', '200ml coconut milk']),
  F('Butter Masala', 'indian', 1, ['200g passata', '50g butter', '100ml double cream', '1 tsp garam masala'], ['indulgent']),
  F('Tandoori', 'indian', 2, ['3 tbsp tandoori paste', '150g yoghurt', '1 lemon'], ['smoky']),
  F('Katsu Curry', 'east-asian', 1, ['1 tbsp mild curry powder', '1 tbsp flour', '400ml stock', '1 tsp honey']),
  F('Teriyaki', 'east-asian', 0, ['3 tbsp soy sauce', '2 tbsp mirin', '1 tbsp honey', '1 tsp grated ginger']),
  F('Miso', 'east-asian', 0, ['2 tbsp white miso', '1 tbsp mirin', '20g butter'], ['savoury']),
  F('Gochujang', 'east-asian', 2, ['2 tbsp gochujang', '1 tbsp soy sauce', '1 tbsp maple syrup']),
  F('Black Bean', 'east-asian', 1, ['2 tbsp fermented black beans', '2 garlic cloves', '1 tbsp soy sauce'], ['savoury']),
  F('Sweet & Sour', 'east-asian', 0, ['3 tbsp rice vinegar', '2 tbsp ketchup', '2 tbsp sugar', '100g pineapple']),
  F('Kung Pao', 'east-asian', 3, ['2 dried chillies', '1 tbsp Sichuan pepper', '40g peanuts', '2 tbsp soy sauce']),
  F('Sichuan Chilli', 'east-asian', 3, ['1 tbsp chilli bean paste', '1 tsp Sichuan pepper', '2 tbsp soy sauce']),
  F('Sticky Soy & Ginger', 'east-asian', 0, ['4 tbsp soy sauce', '1 thumb ginger', '2 tbsp honey', '2 garlic cloves']),
  F('Sesame & Ginger', 'east-asian', 0, ['2 tbsp sesame oil', '1 thumb ginger', '2 tbsp soy sauce', '1 tbsp sesame seeds'], ['fresh']),
  F('Hoisin', 'east-asian', 0, ['4 tbsp hoisin sauce', '1 tbsp rice vinegar', '2 spring onions']),
  F('Oyster Sauce', 'east-asian', 0, ['3 tbsp oyster sauce', '1 tbsp soy sauce', '1 tsp sugar'], ['savoury']),
  F('Satay', 'east-asian', 1, ['4 tbsp peanut butter', '200ml coconut milk', '1 tbsp soy sauce', '1 lime']),
  F('Thai Green', 'east-asian', 2, ['3 tbsp green curry paste', '400ml coconut milk', 'Thai basil', '1 lime']),
  F('Thai Red', 'east-asian', 2, ['3 tbsp red curry paste', '400ml coconut milk', '2 lime leaves', '1 tbsp fish sauce']),
  F('Panang', 'east-asian', 2, ['3 tbsp panang paste', '300ml coconut milk', '2 tbsp peanut butter', '2 lime leaves']),
  F('Massaman', 'east-asian', 1, ['3 tbsp massaman paste', '400ml coconut milk', '40g peanuts', '1 cinnamon stick']),
  F('Lemongrass & Lime', 'east-asian', 1, ['2 lemongrass stalks', '2 limes', '1 tbsp fish sauce', '1 red chilli'], ['zesty', 'fresh']),
  F('Coconut & Lime', 'east-asian', 1, ['200ml coconut milk', '2 limes', '1 tbsp grated ginger', 'coriander'], ['fresh']),
  F('Sweet Chilli', 'east-asian', 1, ['4 tbsp sweet chilli sauce', '1 tbsp soy sauce', '1 lime']),
  F('Char Siu', 'east-asian', 0, ['3 tbsp hoisin', '1 tbsp honey', '1 tbsp soy sauce', '1 tsp five-spice']),
  F('Peri Peri', 'other', 2, ['3 tbsp peri peri sauce', '1 lemon', '3 garlic cloves', '1 tsp smoked paprika'], ['smoky']),
  F('Jerk', 'caribbean', 3, ['3 tbsp jerk marinade', '1 tsp thyme', '2 spring onions', '1 lime'], ['smoky']),
  F('Caribbean Curry', 'caribbean', 2, ['2 tbsp Caribbean curry powder', '1 scotch bonnet', 'thyme', '2 tbsp ginger-garlic']),
  F('Chimichurri', 'other', 1, ['big bunch parsley', '2 tbsp red wine vinegar', '2 garlic cloves', '1/2 tsp chilli flakes'], ['herby', 'zesty', 'fresh']),
  F('Salsa Verde', 'italian', 0, ['big bunch parsley and mint', '1 tbsp capers', '2 anchovies', '1 tbsp red wine vinegar'], ['herby', 'fresh']),
  F('Romesco', 'med', 1, ['2 roasted red peppers', '40g almonds', '1 tsp smoked paprika', '1 tbsp sherry vinegar'], ['smoky']),
  F('Salmoriglio', 'med', 0, ['big bunch oregano', '2 lemons', '3 garlic cloves', 'olive oil'], ['herby', 'zesty', 'fresh']),
  F('Lemon & Garlic', 'med', 0, ['2 lemons', '4 garlic cloves', 'olive oil', 'parsley'], ['zesty', 'fresh']),
  F('Saffron & Tomato', 'med', 0, ['pinch of saffron', '400g chopped tomatoes', '1 onion', '125ml white wine']),
  F('Puttanesca', 'italian', 1, ['400g chopped tomatoes', '80g black olives', '2 tbsp capers', '4 anchovies']),
  F('Arrabbiata', 'italian', 2, ['400g chopped tomatoes', '4 garlic cloves', '1 tsp chilli flakes', 'basil']),
  F('Tomato & Basil', 'italian', 0, ['400g chopped tomatoes', '3 garlic cloves', 'big handful basil', '1 tsp sugar']),
  F('Nduja', 'italian', 2, ['60g nduja', '200g passata', '2 garlic cloves'], ['smoky', 'indulgent']),
  F('Pesto', 'italian', 0, ['4 tbsp basil pesto', '30g Parmesan', '30g pine nuts'], ['herby', 'fresh']),
  F('Lemon & Caper Butter', 'italian', 0, ['60g butter', '2 tbsp capers', '2 lemons', 'parsley'], ['zesty']),
  F('Creamy Garlic Mushroom', 'french', 0, ['250g mushrooms', '150ml double cream', '3 garlic cloves', 'thyme'], ['savoury', 'indulgent']),
  F('Mustard Cream', 'french', 0, ['2 tbsp wholegrain mustard', '150ml crème fraîche', '100ml white wine'], ['indulgent']),
  F('Peppercorn', 'french', 0, ['1 tbsp crushed peppercorns', '150ml double cream', '50ml brandy', '1 shallot'], ['indulgent']),
  F('Diane', 'french', 0, ['150g mushrooms', '1 tbsp Worcestershire sauce', '50ml brandy', '150ml cream', '1 tsp Dijon'], ['indulgent']),
  F('Garlic Butter', 'french', 0, ['60g butter', '4 garlic cloves', 'parsley', '1/2 lemon'], ['indulgent']),
  F('White Wine & Herb', 'french', 0, ['150ml white wine', 'big bunch tarragon and parsley', '20g butter', '1 shallot'], ['herby', 'fresh']),
  F('Tarragon Cream', 'french', 0, ['big bunch tarragon', '150ml crème fraîche', '100ml white wine', '1 shallot'], ['herby', 'indulgent']),
  F('Cajun', 'american', 2, ['2 tbsp Cajun seasoning', '1 tsp smoked paprika', '1 lemon'], ['smoky']),
  F('Blackened', 'american', 2, ['2 tbsp blackening spice', '30g melted butter', '1 lime'], ['smoky']),
  F('BBQ', 'american', 1, ['150ml barbecue sauce', '1 tbsp smoked paprika', '1 tbsp cider vinegar'], ['smoky']),
  F('Buffalo', 'american', 2, ['4 tbsp hot sauce', '30g melted butter', '1 tsp garlic granules']),
  F('Honey Mustard', 'american', 0, ['3 tbsp honey', '2 tbsp Dijon mustard', '1 tbsp cider vinegar']),
  F('Maple & Bacon', 'american', 0, ['3 tbsp maple syrup', '100g bacon lardons', '1 tsp Dijon'], ['smoky', 'indulgent']),
  F('Chipotle', 'mexican', 2, ['2 tbsp chipotle paste', '400g chopped tomatoes', '1 tsp cumin', '1 lime'], ['smoky']),
  F('Chilli-Lime', 'mexican', 2, ['2 limes', '1 tsp chilli powder', '1 tsp cumin', 'coriander'], ['zesty', 'fresh']),
  F('Fajita-Spiced', 'mexican', 1, ['2 tbsp fajita seasoning', '2 peppers', '1 onion', '1 lime']),
  F('Mole', 'mexican', 2, ['3 tbsp mole paste', '20g dark chocolate', '400g chopped tomatoes', '1 tsp cinnamon']),
  F('Salsa Roja', 'mexican', 2, ['3 tomatoes', '2 chipotles', '1 onion', '1 tsp oregano'], ['smoky']),
];

// ======================================================================
// PROTEIN table
// ======================================================================
const P = (word, key, diet, qty) => ({ word, key, diet, qty });
const PROTEINS = [
  P('Chicken Thigh', 'chicken', [], '600g boneless chicken thighs'),
  P('Chicken Breast', 'chicken', [], '4 chicken breasts'),
  P('Chicken', 'chicken', [], '600g diced chicken'),
  P('Beef', 'beef', [], '600g diced braising beef'),
  P('Beef Mince', 'beef', [], '500g beef mince'),
  P('Steak', 'beef', [], '2 sirloin steaks'),
  P('Pork', 'pork', [], '600g diced pork shoulder'),
  P('Pork Loin', 'pork', [], '4 pork loin steaks'),
  P('Sausage', 'pork', [], '8 good sausages'),
  P('Lamb', 'lamb', [], '600g diced lamb shoulder'),
  P('Lamb Mince', 'lamb', [], '500g lamb mince'),
  P('Salmon', 'fish', ['pescatarian'], '4 salmon fillets'),
  P('Cod', 'fish', ['pescatarian'], '4 cod fillets'),
  P('Haddock', 'fish', ['pescatarian'], '4 haddock fillets'),
  P('Sea Bass', 'fish', ['pescatarian'], '4 sea bass fillets'),
  P('King Prawn', 'seafood', ['pescatarian'], '400g raw king prawns'),
  P('Halloumi', 'veggie', ['vegetarian'], '450g halloumi, sliced'),
  P('Paneer', 'veggie', ['vegetarian'], '450g paneer, cubed'),
  P('Tofu', 'vegan', ['vegetarian', 'vegan', 'dairy-free'], '560g firm tofu, cubed'),
  P('Chickpea', 'vegan', ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], '2 tins chickpeas, drained'),
  P('Butter Bean', 'vegan', ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], '2 tins butter beans, drained'),
  P('Lentil', 'vegan', ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], '250g green lentils'),
  P('Mushroom', 'veggie', ['vegetarian', 'vegan', 'dairy-free'], '600g mixed mushrooms, torn'),
  P('Cauliflower', 'vegan', ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], '1 large cauliflower, in florets'),
  P('Aubergine', 'vegan', ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], '3 aubergines, cubed'),
  P('Sweet Potato', 'vegan', ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], '4 large sweet potatoes, cubed'),
];

// ======================================================================
// TECHNIQUE table
// ======================================================================
const carbLine = {
  rice: 'rice, to serve',
  noodles: '2 nests noodles',
  potato: '800g potatoes',
  grains: '250g couscous or mixed grains',
  bread: '4 flatbreads or wraps',
  pasta: '350g pasta',
  none: 'a green salad, to serve',
  salad: 'mixed salad leaves',
};
const carbShort = {
  rice: 'rice', noodles: 'noodles', potato: 'potatoes', grains: 'couscous or grains',
  bread: 'flatbreads', pasta: 'pasta', none: 'a green salad', salad: 'a leafy salad',
};
const VEG = ['red peppers', 'red onion', 'courgette', 'baby spinach', 'tenderstem broccoli', 'green beans',
  'cherry tomatoes', 'peas', 'kale', 'pak choi', 'mangetout', 'butternut squash', 'chestnut mushrooms',
  'sugar snap peas', 'chard', 'leeks', 'fennel', 'sweetcorn'];

// each technique: allowed sauce cuisines, optional tag requirement, and a method builder
const TECHNIQUES = [
  { key: 'traybake', word: 'Traybake', mins: 40, effort: 'quick', onePan: true, richness: 'hearty', format: 'plate', mood: ['comfort'],
    carbs: ['potato', 'none', 'grains'], sauceCuisine: ['middle-eastern', 'med', 'american', 'other', 'caribbean', 'indian', 'italian', 'mexican'],
    proteinKeys: ['chicken', 'pork', 'lamb', 'fish', 'seafood', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Heat the oven to 200C fan. Tip the ${p}, ${v} and ${s} into a large roasting tin with oil and seasoning and toss.`,
      `Roast for 30-35 minutes, turning once, until the ${p.toLowerCase()} is cooked through and everything is golden at the edges.`,
      `Serve straight from the tin with ${c}.`] },
  { key: 'skillet', word: 'Skillet', mins: 25, effort: 'quick', onePan: true, richness: 'medium', format: 'bowl', mood: ['comfort'],
    carbs: ['rice', 'grains', 'none', 'potato'], sauceCuisine: ['med', 'middle-eastern', 'american', 'italian', 'french', 'mexican', 'other', 'caribbean', 'indian'],
    proteinKeys: ['chicken', 'beef', 'pork', 'lamb', 'seafood', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Fry the ${p.toLowerCase()} in a large skillet over medium-high heat until browned all over.`,
      `Add the ${v}, then stir in the ${s} with a splash of water and simmer for 8-10 minutes until the sauce clings.`,
      `Check the seasoning and serve with ${c}.`] },
  { key: 'stirfry', word: 'Stir-Fry', mins: 20, effort: 'quick', onePan: true, richness: 'medium', format: 'bowl', mood: ['comfort'],
    carbs: ['rice', 'noodles', 'none'], sauceCuisine: ['east-asian'],
    proteinKeys: ['chicken', 'beef', 'pork', 'seafood', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Get a wok smoking hot. Stir-fry the ${p.toLowerCase()} for 3-4 minutes until seared, then lift out.`,
      `Stir-fry the ${v} for 2 minutes, return the ${p.toLowerCase()}, pour in the ${s} and toss for 1 minute until glossy.`,
      `Pile onto ${c}.`] },
  { key: 'curry', word: 'Curry', mins: 40, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort'],
    carbs: ['rice', 'bread'], sauceCuisine: ['indian', 'east-asian', 'caribbean'],
    sauceWord: /Masala|Korma|Jalfrezi|Madras|Vindaloo|Rogan|Bhuna|Balti|Saag|Dhansak|Tikka|Tandoori|Thai|Massaman|Panang|Katsu|Coconut|Satay|Caribbean Curry/,
    proteinKeys: ['chicken', 'beef', 'lamb', 'pork', 'fish', 'seafood', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Fry a chopped onion until soft, then add the ${s} and cook out for 2 minutes.`,
      `Add the ${p.toLowerCase()} and ${v}, loosen with stock or coconut milk, and simmer for 20-25 minutes.`,
      `Season, scatter with fresh herbs and serve with ${c}.`] },
  { key: 'stew', word: 'Stew', mins: 100, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort'],
    carbs: ['potato', 'bread', 'none'], sauceCuisine: ['french', 'italian', 'med', 'middle-eastern', 'caribbean', 'american', 'other'],
    proteinKeys: ['beef', 'lamb', 'pork', 'chicken', 'vegan'],
    method: (p, s, c, v) => [
      `Brown the ${p.toLowerCase()} in a heavy pot, then soften a diced onion, carrot and celery.`,
      `Return the ${p.toLowerCase()} with the ${s} and enough stock to cover, then cover and simmer gently for 1.5 hours.`,
      `Stir in the ${v} for the last 15 minutes and serve with ${c}.`] },
  { key: 'soup', word: 'Soup', mins: 40, effort: 'quick', onePan: true, richness: 'medium', format: 'soup', mood: ['comfort', 'healthy'],
    carbs: ['none', 'bread', 'noodles'], sauceCuisine: ['east-asian', 'med', 'middle-eastern', 'italian', 'french', 'american', 'other', 'caribbean'],
    sauceWordBan: /Hoisin|Char Siu|Sticky Soy|Teriyaki|Oyster|Black Bean|Sweet & Sour|Gochujang|Kung Pao|Peppercorn|Diane|Garlic Butter|BBQ|Buffalo|Honey Mustard|Maple/,
    proteinKeys: ['chicken', 'fish', 'seafood', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Soften a chopped onion, then add the ${s} and cook for a minute.`,
      `Add the ${p.toLowerCase()}, ${v} and 1.2 litres of stock and simmer for 20-25 minutes.`,
      `Blend to your liking or leave it chunky, then serve with ${c}.`] },
  { key: 'grill', word: 'Skewers', mins: 25, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort', 'healthy'],
    carbs: ['rice', 'bread', 'grains', 'none'], sauceCuisine: ['middle-eastern', 'med', 'american', 'other', 'caribbean', 'mexican', 'east-asian', 'indian'],
    proteinKeys: ['chicken', 'beef', 'lamb', 'pork', 'seafood', 'fish', 'veggie'],
    method: (p, s, c, v) => [
      `Toss the ${p.toLowerCase()} in the ${s} and leave to marinate for at least 20 minutes.`,
      `Thread onto skewers with the ${v} and grill or griddle for 10-12 minutes, turning, until charred and cooked.`,
      `Rest briefly and serve with ${c}.`] },
  { key: 'roast', word: 'Roast', mins: 75, effort: 'medium', onePan: false, richness: 'hearty', format: 'plate', mood: ['comfort'],
    carbs: ['potato', 'grains', 'none'], sauceCuisine: ['french', 'med', 'middle-eastern', 'american', 'other', 'italian'],
    proteinKeys: ['chicken', 'beef', 'lamb', 'pork', 'fish', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Heat the oven to 190C fan. Rub the ${p.toLowerCase()} all over with the ${s}, oil and seasoning.`,
      `Roast for 45-60 minutes, basting once, until deep golden and cooked through; roast the ${v} alongside.`,
      `Rest, then carve and serve with ${c}.`] },
  { key: 'panfry', word: 'with Pan Sauce', mins: 20, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort'],
    carbs: ['potato', 'none', 'grains'], sauceCuisine: ['french', 'italian', 'med', 'american'],
    proteinKeys: ['chicken', 'beef', 'pork', 'fish', 'seafood', 'veggie'],
    method: (p, s, c, v) => [
      `Season the ${p.toLowerCase()} well and fry in a hot pan with a little oil for 3-4 minutes each side.`,
      `Lift out to rest, add the ${s} to the pan and let it bubble into a sauce, then return the ${p.toLowerCase()} to coat.`,
      `Serve with the ${v} and ${c}.`] },
  { key: 'salad', word: 'Salad', mins: 20, effort: 'quick', onePan: false, richness: 'light', format: 'salad', mood: ['fresh', 'light', 'healthy'],
    carbs: ['none', 'grains', 'salad'], sauceCuisine: ['med', 'middle-eastern', 'east-asian', 'italian', 'mexican', 'other'], sauceTag: ['fresh', 'zesty', 'herby'],
    proteinKeys: ['chicken', 'beef', 'fish', 'seafood', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Cook or griddle the ${p.toLowerCase()} and let it cool a little.`,
      `Whisk the ${s} into a dressing and toss through the ${v} and leaves.`,
      `Top with the ${p.toLowerCase()} and serve with ${c}.`] },
  { key: 'bowl', word: 'Rice Bowl', mins: 25, effort: 'quick', onePan: false, richness: 'medium', format: 'bowl', mood: ['healthy', 'comfort'],
    carbs: ['rice', 'grains'], sauceCuisine: ['east-asian', 'middle-eastern', 'mexican', 'med', 'other', 'american'],
    proteinKeys: ['chicken', 'beef', 'pork', 'fish', 'seafood', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Cook the ${c} and divide between bowls.`,
      `Cook the ${p.toLowerCase()} with the ${s} until glazed and just done, adding the ${v} to wilt or char.`,
      `Spoon over the bowls with any extra dressing and a scatter of seeds or herbs.`] },
  { key: 'pasta', word: 'Pasta', mins: 25, effort: 'quick', onePan: false, richness: 'medium', format: 'bowl', mood: ['comfort'],
    carbs: ['pasta'], sauceCuisine: ['italian', 'french', 'med'],
    proteinKeys: ['beef', 'pork', 'chicken', 'fish', 'seafood', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Cook the pasta in well-salted water until al dente, saving a mug of the cooking water.`,
      `Make the ${s} sauce in a wide pan with the ${p.toLowerCase()} and ${v}.`,
      `Toss the drained pasta through with a splash of the water until everything is coated; finish with Parmesan.`] },
  { key: 'bake', word: 'Bake', mins: 50, effort: 'medium', onePan: false, richness: 'hearty', format: 'plate', mood: ['comfort', 'indulgent'],
    carbs: ['potato', 'pasta', 'none', 'grains'], sauceCuisine: ['italian', 'french', 'american', 'med', 'middle-eastern'],
    proteinKeys: ['chicken', 'beef', 'pork', 'fish', 'seafood', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Heat the oven to 190C fan. Layer the ${p.toLowerCase()}, ${v} and ${s} in a baking dish.`,
      `Top with cheese or breadcrumbs and bake for 30-35 minutes until bubbling and golden.`,
      `Rest for 5 minutes, then serve with ${c}.`] },
  { key: 'noodles', word: 'Noodles', mins: 20, effort: 'quick', onePan: true, richness: 'medium', format: 'bowl', mood: ['comfort'],
    carbs: ['noodles'], sauceCuisine: ['east-asian'],
    proteinKeys: ['chicken', 'beef', 'pork', 'seafood', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Cook the noodles to packet instructions, then drain and toss with a little oil.`,
      `Stir-fry the ${p.toLowerCase()} and ${v}, add the ${s} and the noodles and toss over high heat for 2 minutes.`,
      `Serve straight away with extra chilli, lime or sesame.`] },
  { key: 'wrap', word: 'Wraps', mins: 15, effort: 'quick', onePan: true, richness: 'medium', format: 'handheld', mood: ['comfort', 'fresh'],
    carbs: ['bread'], sauceCuisine: ['mexican', 'middle-eastern', 'east-asian', 'american', 'other', 'caribbean'],
    proteinKeys: ['chicken', 'beef', 'pork', 'lamb', 'seafood', 'veggie', 'vegan'],
    method: (p, s, c, v) => [
      `Cook the ${p.toLowerCase()} with the ${s} until done and nicely coloured.`,
      `Warm the ${c} and spread with yoghurt or mayo.`,
      `Fill with the ${p.toLowerCase()}, ${v} and salad, roll up tightly and serve.`] },
  { key: 'slow', word: 'Slow-Cooked', mins: 240, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort', 'indulgent'],
    carbs: ['potato', 'rice', 'bread', 'none'], sauceCuisine: ['french', 'italian', 'med', 'middle-eastern', 'american', 'caribbean', 'other', 'mexican'],
    proteinKeys: ['beef', 'lamb', 'pork', 'chicken'],
    method: (p, s, c, v) => [
      `Brown the ${p.toLowerCase()}, then add the ${s}, ${v} and enough liquid to almost cover.`,
      `Cover and cook low for 3-4 hours (or a slow cooker on low for 7-8) until meltingly tender.`,
      `Shred or leave in chunks and serve over ${c}.`] },
];

function moodFor(t, s, p) {
  const m = new Set(t.mood);
  if (['fish', 'seafood'].includes(p.key) && ['salad', 'grill', 'panfry', 'soup', 'bowl'].includes(t.key)) m.add('healthy');
  if (p.diet.includes('vegan') && ['salad', 'bowl', 'soup', 'stirfry'].includes(t.key)) { m.add('healthy'); m.add('light'); }
  if (['bake', 'slow', 'roast'].includes(t.key) && ['beef', 'lamb', 'pork'].includes(p.key)) m.add('indulgent');
  if (s.tags.includes('indulgent')) m.add('indulgent');
  if (['grill', 'roast'].includes(t.key) && ['beef', 'lamb'].includes(p.key)) m.add('fancy');
  if (s.tags.includes('fresh') && t.richness === 'light') m.add('fresh');
  return [...m];
}

function homeDish(t, p, s) {
  if (!t.proteinKeys.includes(p.key)) return null;
  if (!t.sauceCuisine.includes(s.cuisine)) return null;
  if (t.sauceTag && !t.sauceTag.some((tag) => s.tags.includes(tag))) return null;
  if (t.sauceWord && !t.sauceWord.test(s.word)) return null;
  if (t.sauceWordBan && t.sauceWordBan.test(s.word)) return null;
  if (p.diet.includes('vegan') && /Puttanesca|Salsa Verde|Oyster Sauce/.test(s.word)) return null;
  if (p.key === 'fish' && ['stew', 'slow'].includes(t.key)) return null;
  const carb = pick(t.carbs);
  const veg = shuffle(VEG).slice(0, 1 + Math.floor(rand() * 2));
  const name = `${s.word} ${p.word} ${t.word}`.replace(/\s+/g, ' ').trim();
  const id = claim('home', name, 'gen-h');
  if (!id) return null;
  const richness =
    ['bake', 'slow', 'stew', 'roast'].includes(t.key) && ['beef', 'lamb', 'pork'].includes(p.key) ? 'hearty' : t.richness;
  const cShort = carbShort[carb];
  const tw = t.word.toLowerCase().replace(/^with /, '');
  const blurbs = [
    `${p.word} cooked ${tw}-style in a ${s.word.toLowerCase()} sauce with ${veg.join(' and ')}.`,
    `A ${s.word.toLowerCase()} ${tw} of ${p.word.toLowerCase()} with ${veg.join(', ')}.`,
    `${s.word} ${p.word.toLowerCase()} with ${veg.join(' and ')}, served with ${cShort}.`,
    `${p.word} and ${veg.join(', ')} in a ${s.word.toLowerCase()} ${tw}.`,
  ];
  const servings = ['salad', 'wrap', 'bowl', 'panfry'].includes(t.key) ? (rand() < 0.4 ? 2 : 4) : 4;
  return {
    id, name, blurb: cap(pick(blurbs)),
    venue: 'home', cuisine: s.cuisine, protein: p.key, carb,
    spicy: Math.max(0, Math.min(3, s.spicy)), richness, mood: moodFor(t, s, p), format: t.format, diet: p.diet,
    effort: t.effort, timeMinutes: t.mins, onePan: t.onePan, servings,
    ingredients: [p.qty, ...s.ing, carbLine[carb], veg.join(', '), '1 onion, 2 garlic cloves', 'olive oil, salt and pepper'],
    method: t.method(p.word, s.word, cShort, veg.join(' and ')),
  };
}

// ======================================================================
// TAKEAWAY
// ======================================================================
function takeawaySet() {
  const out = [];
  const add = (name, o) => {
    const id = claim('takeaway', name, 'gen-t');
    if (id) out.push({ id, name, venue: 'takeaway', searchTerm: name.toLowerCase(), ...o });
  };
  const vd = (veg, vegan) => (vegan ? ['vegetarian', 'vegan', 'dairy-free'] : veg ? ['vegetarian'] : []);

  // -- pizza --
  const pizzaTops = ['Pepperoni', 'Double Pepperoni', 'Nduja & Hot Honey', 'Spicy Salami', 'Ham & Mushroom', 'Ham & Pineapple',
    'Chicken & Sweetcorn', 'BBQ Chicken', 'Buffalo Chicken', 'Chicken & Pesto', 'Cajun Chicken', 'Chicken Tikka',
    'Chorizo & Roasted Pepper', 'Meatball & Red Onion', 'Spicy Beef & Jalapeño', 'Pulled Pork & BBQ', 'Prawn & Garlic',
    'Tuna & Red Onion', 'Anchovy & Caper', 'Parma Ham & Rocket', 'Four Cheese', "Goat's Cheese & Caramelised Onion",
    'Truffle Mushroom', 'Roasted Vegetable', 'Spinach & Ricotta', 'Margherita', 'Marinara', 'Fiorentina', 'Capricciosa',
    'Diavola', 'Quattro Stagioni', 'Sausage & Friarielli', 'Philly Cheesesteak', 'Full English', 'Mac & Cheese',
    'Vegan Vegetable', 'Vegan BBQ Jackfruit', 'Vegan Margherita', 'Hawaiian', 'Spicy Hawaiian', 'Salami & Wild Mushroom',
    'Calabrese Salami & Chilli', 'Smoked Salmon & Crème Fraîche', 'Roquefort & Walnut', 'Egg & Bacon Breakfast'];
  for (const top of pizzaTops) {
    const vegan = /Vegan/.test(top);
    const veg = !vegan && /Vegetable|Margherita|Marinara|Truffle Mushroom|Four Cheese|Spinach|Onion|Ricotta|Fiorentina|Mac & Cheese|Roquefort/.test(top);
    add(`${top} Pizza`, {
      cuisine: /Hawaiian|BBQ|Buffalo|Cajun|Philly|English|Jackfruit|Pulled Pork/.test(top) ? 'american' : 'italian',
      protein: vegan ? 'vegan' : veg ? 'veggie' : /Prawn|Tuna|Anchovy|Salmon/.test(top) ? 'seafood' : /Chicken/.test(top) ? 'chicken' : /Beef|Meatball|Cheesesteak/.test(top) ? 'beef' : /Egg/.test(top) ? 'mixed' : 'pork',
      carb: 'bread', spicy: /Spicy|Nduja|Jalapeño|Buffalo|Cajun|Diavola|Chilli|Hot Honey|Tikka/.test(top) ? 2 : /Pepperoni|Salami|Chorizo|Friarielli/.test(top) ? 1 : 0,
      richness: 'hearty', mood: ['comfort', 'indulgent'], format: 'handheld', diet: vd(veg, vegan),
      takeawayType: 'pizza', blurb: `${top} on a stone-baked base with mozzarella and tomato.`,
    });
  }

  // -- indian --
  const inProt = [['Chicken', 'chicken', []], ['Lamb', 'lamb', []], ['Beef', 'beef', []], ['King Prawn', 'seafood', ['pescatarian', 'dairy-free']],
    ['Paneer', 'veggie', ['vegetarian']], ['Chickpea', 'vegan', ['vegetarian', 'vegan', 'dairy-free']], ['Vegetable', 'veggie', ['vegetarian', 'vegan', 'dairy-free']],
    ['Fish', 'fish', ['pescatarian', 'dairy-free']], ['Mixed Vegetable', 'veggie', ['vegetarian', 'vegan', 'dairy-free']], ['Aloo & Chickpea', 'vegan', ['vegetarian', 'vegan', 'dairy-free']]];
  const inStyle = [['Tikka Masala', 2], ['Korma', 1], ['Jalfrezi', 3], ['Madras', 3], ['Vindaloo', 3], ['Bhuna', 2], ['Rogan Josh', 2],
    ['Dopiaza', 2], ['Dhansak', 2], ['Pathia', 3], ['Balti', 2], ['Saag', 2], ['Karahi', 3], ['Methi', 2], ['Achari', 2], ['Ceylon', 3],
    ['Chettinad', 3], ['Do Pyaza', 2], ['Garlic Chilli', 3], ['Makhani', 1], ['Pasanda', 1], ['Chasni', 1], ['Lababdar', 1], ['Jaipuri', 2],
    ['Biryani', 2], ['Rezala', 1], ['Nihari', 2], ['Kadai', 2]];
  for (const [pn, pk, pd] of inProt) for (const [st, sp] of inStyle) {
    if (pk === 'fish' && /Vindaloo|Karahi|Chettinad|Nihari/.test(st)) continue;
    add(`${pn} ${st}`, {
      cuisine: 'indian', protein: pk, carb: 'rice', spicy: sp, richness: 'hearty',
      mood: sp <= 1 ? ['comfort', 'indulgent'] : ['comfort'], format: 'bowl',
      diet: pd.length ? pd : (['Korma', 'Makhani', 'Pasanda', 'Chasni', 'Lababdar', 'Tikka Masala', 'Rezala', 'Biryani'].includes(st) ? ['gluten-free'] : ['gluten-free', 'dairy-free']),
      takeawayType: 'indian', blurb: `${pn} ${st.toLowerCase()}, with rice or naan.`,
    });
  }

  // -- chinese --
  const cnProt = [['Chicken', 'chicken'], ['Beef', 'beef'], ['Pork', 'pork'], ['King Prawn', 'seafood'], ['Roast Duck', 'mixed'],
    ['Tofu', 'vegan'], ['Mixed Vegetable', 'veggie'], ['Char Siu Pork', 'pork'], ['Shredded Chilli Beef', 'beef'], ['Salt & Chilli Chicken', 'chicken']];
  const cnStyle = [['in Black Bean Sauce', 1], ['Sweet & Sour', 0], ['in Oyster Sauce', 0], ['Kung Pao', 3], ['Szechuan', 3],
    ['with Ginger & Spring Onion', 0], ['Salt & Pepper', 2], ['Cantonese Style', 0], ['Chow Mein', 1], ['Curry', 1], ['Satay', 1],
    ['in Lemon Sauce', 0], ['in Honey & Chilli Sauce', 2], ['in Hoisin Sauce', 0], ['with Cashew Nuts', 0], ['in Yellow Bean Sauce', 0],
    ['Peking Style', 1], ['Manchurian', 2], ['Hot & Sour', 2], ['in Garlic Sauce', 1], ['Teriyaki', 0], ['in Plum Sauce', 0], ['Kung Po', 3], ['in Chilli Oil', 3]];
  for (const [pn, pk] of cnProt) for (const [st, sp] of cnStyle) {
    if (pk === 'vegan' && /Oyster/.test(st)) continue;
    add(`${pn} ${st}`, {
      cuisine: 'east-asian', protein: pk, carb: /Chow Mein/.test(st) ? 'noodles' : 'rice', spicy: sp, richness: 'medium', mood: ['comfort'],
      format: 'bowl', diet: pk === 'vegan' || pk === 'veggie' ? ['vegetarian', 'vegan', 'dairy-free'] : ['dairy-free'],
      takeawayType: 'chinese', blurb: `${pn} ${st.replace(/^in |^with /, 'with ')}, with fried or steamed rice.`,
    });
  }

  // -- thai --
  const thProt = [['Chicken', 'chicken'], ['Beef', 'beef'], ['Prawn', 'seafood'], ['Pork', 'pork'], ['Tofu', 'vegan'], ['Vegetable', 'veggie'], ['Duck', 'mixed']];
  const thStyle = [['Green Curry', 2], ['Red Curry', 2], ['Panang Curry', 2], ['Massaman Curry', 1], ['Jungle Curry', 3], ['Yellow Curry', 1],
    ['Pad Thai', 1], ['Pad See Ew', 1], ['Drunken Noodles', 3], ['Cashew Stir-Fry', 1], ['Holy Basil Stir-Fry', 3], ['Sweet Chilli Stir-Fry', 1],
    ['Tamarind Stir-Fry', 1], ['Ginger Stir-Fry', 1], ['Garlic & Pepper Stir-Fry', 1]];
  for (const [pn, pk] of thProt) for (const [st, sp] of thStyle) {
    add(`Thai ${pn} ${st}`, {
      cuisine: 'east-asian', protein: pk, carb: /Noodles|Pad/.test(st) ? 'noodles' : 'rice', spicy: sp, richness: 'medium',
      mood: sp >= 2 ? ['comfort'] : ['comfort', 'fresh'], format: 'bowl',
      diet: pk === 'vegan' || pk === 'veggie' ? ['vegetarian', 'vegan', 'dairy-free'] : ['dairy-free'],
      takeawayType: 'thai', blurb: `Thai ${pn.toLowerCase()} ${st.toLowerCase()} with jasmine rice or noodles.`,
    });
  }

  // -- japanese --
  const jpDish = [['Chicken Katsu Curry', 'chicken', 1, 'rice'], ['Pork Katsu Curry', 'pork', 1, 'rice'], ['Prawn Katsu Curry', 'seafood', 1, 'rice'],
    ['Sweet Potato Katsu Curry', 'vegan', 1, 'rice'], ['Chicken Teriyaki Donburi', 'chicken', 0, 'rice'], ['Salmon Teriyaki Donburi', 'fish', 0, 'rice'],
    ['Beef Yakiniku Donburi', 'beef', 1, 'rice'], ['Chicken Katsudon', 'chicken', 0, 'rice'], ['Pork Katsudon', 'pork', 0, 'rice'],
    ['Chicken Yakisoba', 'chicken', 1, 'noodles'], ['Vegetable Yakisoba', 'veggie', 1, 'noodles'], ['Prawn Yaki Udon', 'seafood', 1, 'noodles'],
    ['Chicken Ramen', 'chicken', 1, 'noodles'], ['Tonkotsu Ramen', 'pork', 1, 'noodles'], ['Miso Ramen', 'pork', 1, 'noodles'],
    ['Vegetable Gyoza Box', 'veggie', 0, 'pastry'], ['Chicken Karaage Box', 'chicken', 1, 'rice'], ['Salmon Sushi Set', 'fish', 0, 'rice'],
    ['Chirashi Bowl', 'fish', 0, 'rice'], ['Teriyaki Tofu Bowl', 'vegan', 0, 'rice'], ['Katsu Chicken Wrap', 'chicken', 1, 'bread']];
  for (const [dn, pk, sp, cb] of jpDish) {
    add(dn, {
      cuisine: 'east-asian', protein: pk, carb: cb, spicy: sp, richness: /Ramen|Katsu|Karaage|Donburi|Katsudon/.test(dn) ? 'hearty' : 'medium',
      mood: /Sushi|Chirashi|Tofu|Gyoza/.test(dn) ? ['light', 'fresh', 'healthy'] : ['comfort'],
      format: /Ramen/.test(dn) ? 'soup' : /Set|Box|Sushi/.test(dn) ? 'sharing' : /Wrap/.test(dn) ? 'handheld' : 'bowl',
      diet: pk === 'vegan' || pk === 'veggie' ? ['vegetarian', 'vegan', 'dairy-free'] : pk === 'fish' ? ['pescatarian', 'dairy-free'] : ['dairy-free'],
      takeawayType: /Sushi|Chirashi/.test(dn) ? 'sushi' : 'japanese', blurb: `${dn} — a Japanese takeaway staple.`,
    });
  }

  // -- korean --
  for (const [dn, pk, sp] of [['Beef Bibimbap', 'beef', 2], ['Chicken Bibimbap', 'chicken', 2], ['Tofu Bibimbap', 'vegan', 2],
    ['Beef Bulgogi Box', 'beef', 1], ['Pork Bulgogi Box', 'pork', 1], ['Korean Fried Chicken Box', 'chicken', 2], ['Gochujang Fried Chicken', 'chicken', 3],
    ['Soy Garlic Fried Chicken', 'chicken', 1], ['Kimchi Fried Rice', 'veggie', 2], ['Japchae', 'beef', 0], ['Tteokbokki', 'veggie', 3],
    ['Bulgogi Rice Bowl', 'beef', 1], ['Spicy Pork Rice Bowl', 'pork', 3], ['Korean BBQ Chicken Wrap', 'chicken', 2]]) {
    add(dn, {
      cuisine: 'east-asian', protein: pk, carb: /Japchae/.test(dn) ? 'noodles' : /Wrap/.test(dn) ? 'bread' : 'rice', spicy: sp,
      richness: 'medium', mood: ['comfort'], format: /Wrap/.test(dn) ? 'handheld' : /Box/.test(dn) ? 'bowl' : 'bowl',
      diet: pk === 'vegan' ? ['vegetarian', 'vegan', 'dairy-free'] : pk === 'veggie' ? ['vegetarian', 'dairy-free'] : ['dairy-free'],
      takeawayType: 'korean', blurb: `${dn} — Korean comfort food to go.`,
    });
  }

  // -- vietnamese --
  for (const [dn, pk, cb, fmt] of [['Beef Pho', 'beef', 'noodles', 'soup'], ['Chicken Pho', 'chicken', 'noodles', 'soup'], ['Veggie Pho', 'veggie', 'noodles', 'soup'],
    ['Pork Banh Mi', 'pork', 'bread', 'handheld'], ['Chicken Banh Mi', 'chicken', 'bread', 'handheld'], ['Tofu Banh Mi', 'vegan', 'bread', 'handheld'],
    ['Lemongrass Pork Vermicelli Bowl', 'pork', 'noodles', 'bowl'], ['Lemongrass Chicken Vermicelli Bowl', 'chicken', 'noodles', 'bowl'],
    ['Prawn Summer Rolls', 'seafood', 'noodles', 'sharing'], ['Vegetable Summer Rolls', 'veggie', 'noodles', 'sharing'],
    ['Grilled Pork Broken Rice', 'pork', 'rice', 'plate'], ['Caramel Clay Pot Chicken', 'chicken', 'rice', 'bowl']]) {
    add(dn, {
      cuisine: 'east-asian', protein: pk, carb: cb, spicy: 1, richness: fmt === 'soup' ? 'light' : 'medium',
      mood: ['fresh', 'light', 'healthy'], format: fmt,
      diet: pk === 'vegan' ? ['vegetarian', 'vegan', 'dairy-free'] : pk === 'veggie' ? ['vegetarian', 'dairy-free'] : pk === 'seafood' ? ['pescatarian', 'dairy-free'] : ['dairy-free'],
      takeawayType: 'vietnamese', blurb: `${dn} — light, herby Vietnamese street food.`,
    });
  }

  // -- burgers --
  const burgers = ['Classic Cheeseburger', 'Double Cheeseburger', 'Bacon Cheeseburger', 'Double Bacon Cheeseburger', 'Triple Cheeseburger',
    'BBQ Bacon Burger', 'Blue Cheese & Onion Jam Burger', 'Jalapeño & Pepper Jack Burger', 'Mushroom & Swiss Burger', 'Chilli Cheese Burger',
    'Buttermilk Fried Chicken Burger', 'Nashville Hot Chicken Burger', 'Grilled Chicken Fillet Burger', 'Cajun Chicken Burger', 'Katsu Chicken Burger',
    'Crispy Fish Burger', 'Halloumi Burger', 'Vegan Smash Burger', 'Falafel Burger', 'Bean & Beetroot Burger', 'Lamb Kofte Burger',
    'Southern Fried Chicken Burger', 'Smash Burger', 'Truffle & Mushroom Burger', 'Pulled Pork Burger'];
  for (const b of burgers) {
    const vegan = /Vegan|Falafel|Bean/.test(b);
    const veg = !vegan && /Halloumi|Mushroom & Swiss|Truffle/.test(b);
    add(b, {
      cuisine: 'american', protein: vegan ? 'vegan' : veg ? 'veggie' : /Chicken|Katsu/.test(b) ? 'chicken' : /Fish/.test(b) ? 'fish' : /Lamb/.test(b) ? 'lamb' : /Pulled Pork/.test(b) ? 'pork' : 'beef',
      carb: 'bread', spicy: /Jalapeño|Nashville|Cajun|Hot|Southern|Chilli/.test(b) ? 2 : 0, richness: 'hearty',
      mood: ['comfort', 'indulgent'], format: 'handheld',
      diet: vegan ? ['vegetarian', 'vegan', 'dairy-free'] : veg ? ['vegetarian'] : /Fish/.test(b) ? ['pescatarian'] : [],
      takeawayType: 'burger', blurb: `${b} with fries and a choice of sauce.`,
    });
  }

  // -- kebab --
  const kebabs = [['Chicken Shish', 'chicken', 1], ['Lamb Shish', 'lamb', 1], ['Adana', 'lamb', 2], ['Urfa', 'lamb', 1], ['Chicken Doner', 'chicken', 1],
    ['Lamb Doner', 'lamb', 1], ['Mixed Shish', 'mixed', 1], ['Chicken Beyti', 'chicken', 1], ['Lamb Beyti', 'lamb', 1], ['Lamb Kofte', 'lamb', 1],
    ['Chicken Kofte', 'chicken', 1], ['Falafel', 'vegan', 1], ['Halloumi Shish', 'veggie', 0], ['Chicken Iskender', 'chicken', 1], ['Lamb Iskender', 'lamb', 1], ['Lamb Chop', 'lamb', 1]];
  for (const [k, pk, sp] of kebabs) for (const fmt of [['Wrap', 'bread', 'handheld'], ['Plate', 'rice', 'plate']]) {
    add(`${k} ${fmt[0]}`, {
      cuisine: 'middle-eastern', protein: pk, carb: fmt[1], spicy: sp, richness: 'hearty', mood: ['comfort'], format: fmt[2],
      diet: pk === 'vegan' ? ['vegetarian', 'vegan', 'dairy-free'] : pk === 'veggie' ? ['vegetarian'] : ['dairy-free'],
      takeawayType: 'kebab', blurb: `${k} ${fmt[0].toLowerCase()} with salad, pickles and garlic or chilli sauce.`,
    });
  }

  // -- chippy --
  const chippy = ['Cod & Chips', 'Haddock & Chips', 'Plaice & Chips', 'Rock & Chips', 'Scampi & Chips', 'Battered Sausage & Chips',
    'Fishcake & Chips', 'Steak Pie & Chips', 'Chicken & Mushroom Pie & Chips', 'Meat & Potato Pie & Chips', 'Steak & Kidney Pudding & Chips',
    'Chips, Cheese & Gravy', 'Curry Sauce & Chips', 'Gravy & Chips', 'Chip Butty', 'Battered Halloumi & Chips', 'Saveloy & Chips',
    'Fishcake & Curry Sauce', 'Cornish Pasty & Chips', 'Chicken Kiev & Chips', 'Battered Mushrooms & Chips', 'Fish Finger Wrap',
    'Half Roast Chicken & Chips', 'Southern Fried Chicken & Chips', 'Doner & Chips', 'Sausage, Egg & Chips'];
  for (const c of chippy) {
    const fish = /Cod|Haddock|Plaice|Rock|Scampi|Fish/.test(c);
    add(c, {
      cuisine: 'british', protein: fish ? (/Scampi/.test(c) ? 'seafood' : 'fish') : /Halloumi|Cheese|Chip Butty|Curry Sauce & Chips|Gravy & Chips|Mushrooms/.test(c) ? 'veggie' : /Chicken|Kiev/.test(c) ? 'chicken' : /Doner/.test(c) ? 'lamb' : /Sausage|Saveloy|Pasty|Pie|Pudding|Egg/.test(c) ? 'pork' : 'beef',
      carb: 'potato', spicy: /Curry|Doner|Southern/.test(c) ? 1 : 0, richness: 'hearty', mood: ['comfort', 'indulgent'], format: /Wrap/.test(c) ? 'handheld' : 'plate',
      diet: fish ? ['pescatarian'] : [], takeawayType: 'chippy', blurb: `${c} — chip-shop comfort, with mushy peas and tartare or curry sauce.`,
    });
  }

  // -- fried chicken --
  const fc = ['Fried Chicken Bucket', 'Fried Chicken & Chips', 'Popcorn Chicken & Fries', 'Chicken Tenders & Fries', 'Chicken Strips & Gravy',
    'BBQ Wings', 'Buffalo Wings', 'Korean Wings', 'Salt & Pepper Wings', 'Lemon Pepper Wings', 'Garlic Parmesan Wings', 'Honey Sriracha Wings',
    'Nashville Hot Chicken', 'Chicken & Waffles', 'Peri Peri Quarter Chicken', 'Peri Peri Half Chicken', 'Peri Peri Whole Chicken',
    'Chicken Rice Box', 'Gravy Chicken Fries', 'Popcorn Chicken Rice Box', 'Boneless Banquet', 'Fillet Burger Meal', 'Zinger Meal', 'Wings & Waffle'];
  for (const c of fc) {
    add(c, {
      cuisine: /Korean/.test(c) ? 'east-asian' : /Peri/.test(c) ? 'other' : 'american', protein: 'chicken',
      carb: /Rice/.test(c) ? 'rice' : /Waffle/.test(c) ? 'bread' : /Wings/.test(c) ? 'none' : 'potato',
      spicy: /Buffalo|Nashville|Hot|Korean|Peri|Sriracha|Zinger/.test(c) ? 2 : /BBQ|Salt & Pepper/.test(c) ? 1 : 0,
      richness: 'hearty', mood: ['indulgent', 'comfort'], format: /Bucket|Banquet|Wings|Whole/.test(c) ? 'sharing' : /Box/.test(c) ? 'bowl' : 'plate',
      diet: /Wings|Peri/.test(c) ? ['dairy-free'] : [], takeawayType: 'fried-chicken', blurb: `${c} — crispy fried chicken with sides and dips.`,
    });
  }

  // -- mexican --
  const mex = ['Chicken Burrito', 'Steak Burrito', 'Carnitas Burrito', 'Barbacoa Burrito', 'Bean Burrito', 'Chicken Burrito Bowl',
    'Steak Burrito Bowl', 'Veggie Burrito Bowl', 'Chicken Quesadilla', 'Steak Quesadilla', 'Cheese Quesadilla', 'Chicken Tacos', 'Beef Tacos',
    'Fish Tacos', 'Carnitas Tacos', 'Al Pastor Tacos', 'Chicken Enchiladas', 'Beef Enchiladas', 'Cheese & Bean Enchiladas', 'Loaded Nachos',
    'BBQ Chicken Nachos', 'Chicken Chimichanga', 'Beef Chimichanga', 'Chicken Fajita Wrap', 'Steak Fajita Wrap', 'Chilli Cheese Fries', 'Chicken Taquitos', 'Elote Bowl'];
  for (const c of mex) {
    const veg = /Bean Burrito|Cheese Quesadilla|Veggie|Cheese & Bean|Elote/.test(c) && !/Chicken|Steak|Beef|Fish|Carnitas|Barbacoa|Pastor|BBQ/.test(c);
    add(c, {
      cuisine: 'mexican', protein: veg ? 'veggie' : /Fish/.test(c) ? 'fish' : /Chicken/.test(c) ? 'chicken' : /Carnitas|Pastor/.test(c) ? 'pork' : 'beef',
      carb: /Bowl/.test(c) ? 'rice' : /Nachos|Fries|Taquitos|Elote/.test(c) ? 'none' : 'bread', spicy: 2, richness: 'hearty',
      mood: /Bowl|Elote/.test(c) ? ['healthy', 'comfort'] : ['comfort', 'indulgent'],
      format: /Nachos|Fries|Taquitos/.test(c) ? 'sharing' : /Bowl|Elote/.test(c) ? 'bowl' : 'handheld',
      diet: veg ? ['vegetarian'] : /Fish/.test(c) ? ['pescatarian'] : [], takeawayType: 'mexican',
      blurb: `${c} with rice, beans, salsa, guacamole and soured cream.`,
    });
  }

  // -- caribbean --
  for (const [dn, pk, sp] of [['Jerk Chicken Box', 'chicken', 3], ['Jerk Pork Box', 'pork', 3], ['Curry Goat Box', 'mixed', 2], ['Curry Chicken Box', 'chicken', 2],
    ['Brown Stew Chicken Box', 'chicken', 1], ['Oxtail & Butter Beans', 'beef', 1], ['Ackee & Saltfish', 'fish', 1], ['Escovitch Fish', 'fish', 2],
    ['Caribbean Vegetable Curry', 'vegan', 2], ['Jerk Wings', 'chicken', 3], ['Rice & Peas with Fried Plantain', 'vegan', 0], ['Jerk Salmon Box', 'fish', 3]]) {
    add(dn, {
      cuisine: 'caribbean', protein: pk, carb: /Wings|Saltfish|Escovitch/.test(dn) ? 'none' : 'rice', spicy: sp, richness: 'hearty',
      mood: ['comfort'], format: /Wings/.test(dn) ? 'sharing' : 'bowl',
      diet: pk === 'vegan' ? ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'] : pk === 'fish' ? ['pescatarian', 'dairy-free'] : ['gluten-free', 'dairy-free'],
      takeawayType: 'caribbean', blurb: `${dn} — with rice and peas, slaw and fried plantain.`,
    });
  }

  // -- greek --
  for (const [dn, pk, cb, fmt] of [['Pork Gyros Pita', 'pork', 'bread', 'handheld'], ['Chicken Gyros Pita', 'chicken', 'bread', 'handheld'],
    ['Chicken Souvlaki Plate', 'chicken', 'potato', 'plate'], ['Pork Souvlaki Plate', 'pork', 'potato', 'plate'], ['Lamb Souvlaki Plate', 'lamb', 'potato', 'plate'],
    ['Halloumi Souvlaki Wrap', 'veggie', 'bread', 'handheld'], ['Moussaka', 'lamb', 'potato', 'plate'], ['Chicken Gyros Box', 'chicken', 'rice', 'bowl'],
    ['Lamb Kleftiko', 'lamb', 'potato', 'plate'], ['Greek Salad with Pita', 'veggie', 'bread', 'salad'], ['Spanakopita Slice', 'veggie', 'pastry', 'handheld']]) {
    add(dn, {
      cuisine: 'med', protein: pk, carb: cb, spicy: 0, richness: /Salad/.test(dn) ? 'light' : 'hearty',
      mood: /Salad/.test(dn) ? ['fresh', 'light', 'healthy'] : ['comfort', 'fresh'], format: fmt,
      diet: pk === 'veggie' ? ['vegetarian'] : /Souvlaki Plate|Kleftiko|Gyros Box/.test(dn) ? ['gluten-free'] : ['dairy-free'],
      takeawayType: 'greek', blurb: `${dn} — chargrilled Greek classics with tzatziki and salad.`,
    });
  }

  // -- middle-eastern --
  for (const [dn, pk, cb] of [['Chicken Shawarma Wrap', 'chicken', 'bread'], ['Lamb Shawarma Wrap', 'lamb', 'bread'], ['Chicken Shawarma Plate', 'chicken', 'rice'],
    ['Lamb Shawarma Plate', 'lamb', 'rice'], ['Falafel Wrap', 'vegan', 'bread'], ['Falafel Plate', 'vegan', 'bread'], ['Mixed Grill Platter', 'mixed', 'rice'],
    ['Chicken Koobideh', 'chicken', 'rice'], ['Lamb Koobideh', 'lamb', 'rice'], ['Joojeh Kebab', 'chicken', 'rice'], ['Mezze Platter', 'veggie', 'bread'],
    ['Manakish Cheese', 'veggie', 'bread'], ['Lahmacun', 'lamb', 'bread'], ['Sujuk & Egg Pide', 'mixed', 'bread'], ['Chicken Musakhan', 'chicken', 'bread'], ['Koshari', 'vegan', 'rice']]) {
    add(dn, {
      cuisine: 'middle-eastern', protein: pk, carb: cb, spicy: /Shawarma|Lahmacun|Sujuk/.test(dn) ? 1 : 0,
      richness: /Mezze|Manakish|Falafel Wrap/.test(dn) ? 'medium' : 'hearty',
      mood: /Mezze|Falafel/.test(dn) ? ['fresh', 'healthy'] : ['comfort'], format: /Platter|Mezze/.test(dn) ? 'sharing' : /Wrap|Manakish|Lahmacun|Pide|Musakhan/.test(dn) ? 'handheld' : /Plate/.test(dn) ? 'plate' : 'bowl',
      diet: pk === 'vegan' ? ['vegetarian', 'vegan', 'dairy-free'] : pk === 'veggie' ? ['vegetarian'] : ['dairy-free'],
      takeawayType: 'middle-eastern', blurb: `${dn} — spiced, chargrilled and generous.`,
    });
  }

  // -- healthy / deli --
  const hh = ['Salmon Poke Bowl', 'Spicy Tuna Poke Bowl', 'Tofu Poke Bowl', 'Prawn Poke Bowl', 'Teriyaki Chicken Poke Bowl',
    'Grilled Chicken Grain Bowl', 'Falafel Grain Bowl', 'Halloumi Grain Bowl', 'Chicken Caesar Salad', 'Superfood Salad',
    'Chicken & Quinoa Salad', 'Teriyaki Chicken Rice Box', 'Katsu Chicken Salad Box', 'Chicken Shawarma Salad Bowl', 'Vegan Buddha Bowl',
    'Miso Salmon Bowl', 'Peri Peri Chicken Salad', 'Chicken & Avocado Salad', 'Spiced Lentil Soup', 'Chicken Noodle Soup', 'Roasted Veg & Grain Bowl',
    'Chicken Club Wrap', 'Falafel & Hummus Wrap', 'Tuna Melt Panini', 'Chicken Pesto Panini', 'Italian Sub', 'Meatball Marinara Sub',
    'Salt Beef Bagel', 'Pastrami on Rye', 'Caprese Ciabatta', 'Halloumi & Roasted Veg Wrap', 'Soup & Sourdough'];
  for (const c of hh) {
    const vegan = /Tofu|Falafel|Buddha|Lentil|Hummus/.test(c);
    const deli = /Wrap|Panini|Sub|Bagel|Rye|Ciabatta|Sourdough/.test(c);
    add(c, {
      cuisine: /Poke|Teriyaki|Katsu|Miso|Noodle/.test(c) ? 'east-asian' : /Shawarma|Falafel|Halloumi|Lentil|Hummus/.test(c) ? 'middle-eastern' : /Italian|Caprese|Meatball|Pesto/.test(c) ? 'italian' : /Peri/.test(c) ? 'other' : 'american',
      protein: vegan ? 'vegan' : /Salmon|Tuna/.test(c) && !/Chicken/.test(c) ? 'fish' : /Prawn/.test(c) ? 'seafood' : /Halloumi|Caprese/.test(c) ? 'veggie' : /Beef|Pastrami|Meatball/.test(c) ? 'beef' : 'chicken',
      carb: /Bowl|Box|Rice|Grain|Quinoa|Poke/.test(c) ? (/Grain|Quinoa/.test(c) ? 'grains' : 'rice') : deli ? 'bread' : /Soup/.test(c) ? 'none' : 'salad',
      spicy: /Spicy|Peri|Shawarma/.test(c) ? 1 : 0, richness: deli ? 'medium' : /Soup|Salad/.test(c) ? 'light' : 'medium',
      mood: deli ? ['comfort', 'fresh'] : ['healthy', 'fresh', 'light'],
      format: /Soup/.test(c) ? 'soup' : /Wrap|Panini|Sub|Bagel|Rye|Ciabatta/.test(c) ? 'handheld' : /Salad/.test(c) ? 'salad' : 'bowl',
      diet: vegan ? ['vegetarian', 'vegan', 'dairy-free'] : /Salmon|Tuna|Prawn/.test(c) && !/Chicken/.test(c) ? ['pescatarian'] : /Halloumi|Caprese/.test(c) ? ['vegetarian'] : [],
      takeawayType: deli ? 'deli' : 'healthy', blurb: `${c} — freshly made to order.`,
    });
  }

  return out;
}

// ======================================================================
// RESTAURANT
// ======================================================================
function restaurantSet() {
  const out = [];
  const tierFor = (name) =>
    /Fillet|Lobster|Wagyu|Truffle|Scallop|Rib-?eye|Tomahawk|Chateaubriand|Ch[aâ]teaubriand|Turbot|Dover Sole|Tasting|Rack of|Foie|Oyster|Caviar|Monkfish|Beef Wellington|Halibut/i.test(name) ? 3
      : /Steak|Duck|Lamb|Sea Bass|Bream|Risotto|Bourguignon|Confit|Osso Buco|Sharing|Short Rib|Brisket|Venison|Cote de|Sunday/i.test(name) ? 2 : 1;
  const add = (name, o) => {
    const id = claim('restaurant', name, 'gen-r');
    if (id) out.push({ id, name, venue: 'restaurant', searchTerm: `${name.toLowerCase()} restaurant`, priceTier: o.priceTier || tierFor(name), ...o });
  };

  // -- italian: pasta --
  const shapes = ['Spaghetti', 'Rigatoni', 'Penne', 'Linguine', 'Tagliatelle', 'Gnocchi', 'Pappardelle', 'Fusilli', 'Bucatini', 'Orecchiette', 'Casarecce', 'Mafaldine'];
  const psauce = [['Bolognese', 'beef', 0], ['Carbonara', 'pork', 0], ['Arrabbiata', 'vegan', 2], ['Puttanesca', 'fish', 1], ['Amatriciana', 'pork', 1],
    ['al Pomodoro', 'vegan', 0], ['al Pesto', 'veggie', 0], ['alla Vodka', 'veggie', 1], ['Cacio e Pepe', 'veggie', 0], ['Primavera', 'veggie', 0],
    ['alla Norma', 'veggie', 0], ['with Nduja & Burrata', 'pork', 2], ['Alfredo', 'veggie', 0], ['with Wild Mushrooms', 'veggie', 0],
    ['with Prawns, Chilli & Lemon', 'seafood', 1], ['with Sausage & Fennel', 'pork', 1], ['with Crab & Chilli', 'seafood', 1],
    ['al Ragù di Cinghiale', 'pork', 0], ['with Lamb Ragù', 'lamb', 0], ['with Clams', 'seafood', 1], ['with Sun-Dried Tomato & Mascarpone', 'veggie', 0]];
  for (const shape of shapes) for (const [sc, pk, sp] of psauce) {
    add(`${shape} ${sc}`, {
      cuisine: 'italian', protein: pk, carb: 'pasta', spicy: sp, richness: 'medium',
      mood: sp === 0 && pk === 'veggie' ? ['comfort'] : ['comfort', 'indulgent'], format: 'bowl',
      diet: pk === 'vegan' ? ['vegetarian', 'vegan', 'dairy-free'] : pk === 'veggie' ? ['vegetarian'] : pk === 'seafood' || pk === 'fish' ? ['pescatarian'] : [],
      restaurantType: 'italian', blurb: `${shape} ${sc}, made fresh in-house.`,
    });
  }
  // italian: risotto + mains
  for (const f of ['Milanese', 'Wild Mushroom', 'Prawn & Lemon', 'Asparagus & Pea', 'Butternut & Sage', 'Nero di Seppia', 'Chicken & Chorizo',
    'Truffle & Parmesan', "Beetroot & Goat's Cheese", 'Seafood', 'Radicchio & Taleggio', 'Courgette & Mint', 'Pumpkin & Amaretti', 'Crab & Chilli'])
    add(`${f} Risotto`, {
      cuisine: 'italian', protein: /Prawn|Seafood|Nero|Crab/.test(f) ? 'seafood' : /Chicken/.test(f) ? 'chicken' : 'veggie', carb: 'rice',
      spicy: /Chilli/.test(f) ? 1 : 0, richness: 'hearty', mood: ['comfort', 'indulgent'], format: 'bowl',
      diet: /Prawn|Seafood|Nero|Crab/.test(f) ? ['pescatarian', 'gluten-free'] : ['vegetarian', 'gluten-free'],
      restaurantType: 'italian', blurb: `A slow-stirred ${f.toLowerCase()} risotto finished with butter and Parmesan.`,
    });
  for (const [m, pk, tier] of [['Chicken Milanese', 'chicken', 2], ['Veal Milanese', 'beef', 3], ['Chicken Parmigiana', 'chicken', 2],
    ['Aubergine Parmigiana', 'veggie', 2], ['Saltimbocca alla Romana', 'beef', 3], ['Osso Buco', 'beef', 3], ['Vitello Tonnato', 'beef', 3],
    ['Pollo alla Cacciatora', 'chicken', 2], ['Branzino al Forno', 'fish', 3], ['Fritto Misto', 'seafood', 2], ['Calamari Fritti', 'seafood', 2],
    ['Beef Tagliata', 'beef', 3], ['Lamb Scottadito', 'lamb', 3], ['Polpette al Sugo', 'beef', 1], ['Burrata & Prosciutto', 'pork', 2],
    ['Antipasti Board', 'pork', 2], ['Arancini', 'veggie', 1], ['Bruschetta', 'vegan', 1]])
    add(m, {
      cuisine: 'italian', protein: pk, carb: /Milanese|Parmigiana|Saltimbocca|Tonnato|Tagliata|Scottadito|Cacciatora/.test(m) ? 'none' : /Osso Buco/.test(m) ? 'rice' : /Board|Arancini|Bruschetta|Burrata|Fritti|Fritto/.test(m) ? 'none' : 'none',
      spicy: 0, richness: /Board|Bruschetta|Burrata/.test(m) ? 'medium' : 'hearty',
      mood: tier === 3 ? ['fancy', 'indulgent'] : ['comfort'], format: /Board|Antipasti|Fritto|Fritti/.test(m) ? 'sharing' : 'plate',
      diet: pk === 'vegan' ? ['vegetarian', 'vegan', 'dairy-free'] : pk === 'veggie' ? ['vegetarian'] : pk === 'seafood' || pk === 'fish' ? ['pescatarian'] : [],
      restaurantType: 'italian', priceTier: tier, blurb: `${m} — a trattoria classic.`,
    });

  // -- grill / steakhouse --
  const cuts = [['Ribeye Steak', 'beef', 3], ['Sirloin Steak', 'beef', 2], ['Fillet Steak', 'beef', 3], ['Rump Steak', 'beef', 2], ['T-Bone Steak', 'beef', 3],
    ['Tomahawk for Two', 'beef', 3], ['Picanha', 'beef', 2], ['Flat Iron Steak', 'beef', 2], ['Bavette Steak', 'beef', 2], ['Chateaubriand for Two', 'beef', 3],
    ['Lamb Rump', 'lamb', 2], ['Rack of Lamb', 'lamb', 3], ['Lamb Chops', 'lamb', 2], ['Pork Chop', 'pork', 1], ['Half Chicken', 'chicken', 1],
    ['Chicken Skewers', 'chicken', 1], ['Gammon Steak', 'pork', 1], ['Beef Short Rib', 'beef', 2], ['Mixed Grill', 'mixed', 2],
    ['Whole Sea Bass', 'fish', 2], ['Salmon Fillet', 'fish', 2], ['King Prawn Skewers', 'seafood', 2], ['Cauliflower Steak', 'vegan', 1], ['Portobello Mushroom Stack', 'veggie', 1]];
  const fins = ['with Peppercorn Sauce', 'with Béarnaise', 'with Chimichurri', 'with Garlic & Herb Butter', 'with Blue Cheese Sauce',
    'with Red Wine Jus', 'with Café de Paris Butter', 'with Salsa Verde', 'with Diane Sauce', 'with Bone Marrow Butter'];
  for (const [cut, pk, tier] of cuts) for (const fin of fins) {
    if (['fish', 'seafood', 'vegan', 'veggie'].includes(pk) && /Blue Cheese|Peppercorn|Diane|Bone Marrow/.test(fin)) continue;
    add(`${cut} ${fin}`, {
      cuisine: 'american', protein: pk, carb: 'potato', spicy: /Chimichurri/.test(fin) ? 1 : 0, richness: 'hearty',
      mood: tier === 3 ? ['fancy', 'indulgent'] : ['indulgent', 'comfort'], format: /for Two|Mixed Grill/.test(cut) ? 'sharing' : 'plate',
      diet: ['fish', 'seafood'].includes(pk) ? ['pescatarian', 'gluten-free'] : pk === 'vegan' ? ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'] : pk === 'veggie' ? ['vegetarian', 'gluten-free'] : ['gluten-free'],
      restaurantType: 'grill', priceTier: tier, blurb: `${cut} grilled over fire, ${fin.toLowerCase()}, with chips and a side.`,
    });
  }

  // -- indian restaurant --
  const indP = [['Chicken', 'chicken'], ['Lamb', 'lamb'], ['King Prawn', 'seafood'], ['Paneer', 'veggie'], ['Vegetable', 'veggie'], ['Fish', 'fish'], ['Chickpea', 'vegan']];
  const indS = [['Tikka Masala', 2], ['Rogan Josh', 2], ['Korma', 1], ['Jalfrezi', 3], ['Makhani', 1], ['Saag', 2], ['Biryani', 2], ['Dhansak', 2],
    ['Karahi', 3], ['Bhuna', 2], ['Chettinad', 3], ['Xacuti', 2], ['Kolhapuri', 3], ['Do Pyaza', 2], ['Achari', 2], ['Nihari', 2], ['Handi', 2]];
  for (const [pn, pk] of indP) for (const [st, sp] of indS) {
    if (pk === 'vegan' && /Nihari|Karahi/.test(st)) continue;
    add(`${pn} ${st}`, {
      cuisine: 'indian', protein: pk, carb: 'rice', spicy: sp, richness: 'hearty', mood: sp <= 1 ? ['comfort', 'indulgent'] : ['comfort'], format: 'bowl',
      diet: pk === 'seafood' || pk === 'fish' ? ['pescatarian', 'gluten-free'] : pk === 'veggie' ? ['vegetarian', 'gluten-free'] : pk === 'vegan' ? ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'] : ['gluten-free'],
      restaurantType: 'indian', priceTier: 2, blurb: `${pn} ${st.toLowerCase()} with basmati rice, naan and chutneys.`,
    });
  }

  // -- asian restaurant --
  for (const m of ['Peking Duck', 'Dim Sum Selection', 'Crispy Chilli Beef', 'Kung Pao Chicken', 'Mapo Tofu', 'Twice-Cooked Pork', 'Salt & Pepper Squid',
    'Steamed Sea Bass with Ginger', 'Sichuan Hot Pot', 'Char Siu Pork', 'Thai Green Curry', 'Thai Red Duck Curry', 'Pad Thai', 'Tom Yum Soup',
    'Massaman Beef Curry', 'Crispy Pork with Holy Basil', 'Chicken Satay', 'Beef Rendang', 'Prawn Laksa', 'Nasi Goreng', 'Dolsot Bibimbap',
    'Korean Fried Chicken', 'Beef Bulgogi', 'Japchae', 'Tonkotsu Ramen', 'Miso Black Cod', 'Chicken Katsu Curry', 'Wagyu Teppanyaki', 'Beef Pho',
    'Shaking Beef', 'Singapore Chilli Crab', 'Hainanese Chicken Rice', 'Bun Cha', 'Whole Steamed Fish', 'Salt Baked Chicken', 'Sizzling Beef Sizzler']) {
    add(m, {
      cuisine: 'east-asian', protein: /Duck/.test(m) ? 'mixed' : /Beef|Bulgogi|Rendang|Shaking|Pho|Bibimbap|Sizzler/.test(m) ? 'beef'
        : /Pork|Char Siu|Bun Cha|Tonkotsu/.test(m) ? 'pork' : /Squid|Prawn|Laksa|Crab|Cod/.test(m) ? 'seafood'
        : /Sea Bass|Steamed Fish/.test(m) ? 'fish' : /Tofu|Japchae/.test(m) ? 'vegan' : 'chicken',
      carb: /Ramen|Pho|Laksa|Japchae|Pad Thai|Bun Cha/.test(m) ? 'noodles' : /Soup/.test(m) ? 'none' : 'rice',
      spicy: /Sichuan|Kung Pao|Mapo|Holy Basil|Laksa|Rendang|Tom Yum|Chilli|Korean Fried|Hot Pot|Green Curry|Red Duck/.test(m) ? 3 : /Katsu|Massaman|Satay|Bulgogi|Nasi|Sizzler/.test(m) ? 1 : 1,
      richness: /Soup|Pho|Satay|Bibimbap/.test(m) ? 'medium' : 'hearty',
      mood: /Wagyu|Cod|Crab|Peking/.test(m) ? ['fancy', 'indulgent'] : ['comfort'],
      format: /Selection|Hot Pot|Peking|Teppanyaki|Crab/.test(m) ? 'sharing' : /Soup|Ramen|Pho|Laksa/.test(m) ? 'soup' : 'bowl',
      diet: /Tofu|Japchae/.test(m) ? ['vegetarian', 'vegan', 'dairy-free'] : ['dairy-free'],
      restaurantType: /Ramen|Katsu|Teppanyaki|Cod|Bibimbap|Bulgogi|Japchae|Korean|Pho|Bun Cha/.test(m) ? 'asian' : 'chinese',
      priceTier: /Wagyu|Cod|Peking|Crab|Hot Pot/.test(m) ? 3 : 2, blurb: `${m} — a pan-Asian restaurant favourite.`,
    });
  }

  // -- med / spanish / greek / middle-eastern --
  for (const m of ['Seafood Paella', 'Chicken & Chorizo Paella', 'Vegetable Paella', 'Mixed Paella', 'Gambas al Ajillo', 'Grilled Octopus',
    'Pulpo a la Gallega', 'Patatas Bravas', 'Jamón Croquetas', 'Tortilla Española', 'Pimientos de Padrón', 'Secreto Ibérico', 'Fabada Asturiana',
    'Txuletón for Two', 'Lamb Kleftiko', 'Pork Souvlaki Plate', 'Chicken Souvlaki Plate', 'Moussaka', 'Chargrilled Whole Sea Bream',
    'Grilled Halloumi & Watermelon Salad', 'Mezze Sharing Board', 'Slow-Roast Lamb Shoulder', 'Prawn Saganaki', 'Stuffed Peppers',
    'Chicken Shawarma Plate', 'Lamb Shish Plate', 'Falafel & Mezze Plate', 'Lamb & Apricot Tagine', 'Chicken & Olive Tagine', 'Baked Feta & Tomato',
    'Grilled Sardines', 'Aubergine & Chickpea Stew', 'Manti', 'İskender Kebab', 'Adana Kebab Plate', 'Lahmacun', 'Chicken Fesenjan', 'Maqluba']) {
    const veg = /Vegetable Paella|Halloumi|Mezze|Stuffed Peppers|Falafel|Baked Feta|Aubergine|Padrón|Tortilla|Bravas/.test(m);
    add(m, {
      cuisine: /Shawarma|Shish|Falafel|Tagine|Mezze|Kleftiko|Manti|İskender|Adana|Lahmacun|Fesenjan|Maqluba/.test(m) ? 'middle-eastern' : 'med',
      protein: veg ? (/Falafel|Aubergine/.test(m) ? 'vegan' : 'veggie') : /Seafood|Octopus|Gambas|Prawn|Sea Bream|Sardines|Pulpo|Paella/.test(m) && !/Chicken|Chorizo/.test(m) ? 'seafood'
        : /Lamb/.test(m) ? 'lamb' : /Pork|Ibérico|Croquetas|Jamón|Fabada|Souvlaki Plate/.test(m) ? 'pork' : /Beef|Txuletón/.test(m) ? 'beef' : /Chicken/.test(m) ? 'chicken' : 'veggie',
      carb: /Paella|Maqluba/.test(m) ? 'rice' : /Tagine/.test(m) ? 'grains' : /Souvlaki|Kleftiko/.test(m) ? 'potato' : /Plate|Shawarma|Shish|Kebab|Lahmacun/.test(m) ? 'bread' : /Salad/.test(m) ? 'salad' : 'none',
      spicy: /Saganaki|Shawarma|Tagine|Adana|Bravas/.test(m) ? 1 : 0, richness: /Salad|Mezze|Sardines|Padrón|Bravas|Croquetas/.test(m) ? 'light' : 'hearty',
      mood: /Salad|Mezze|Sardines/.test(m) ? ['fresh', 'light', 'healthy'] : ['comfort', 'fresh'],
      format: /Paella|Board|Sharing|Shoulder|Mezze|for Two/.test(m) ? 'sharing' : /Salad/.test(m) ? 'salad' : 'plate',
      diet: veg ? (/Falafel|Aubergine/.test(m) ? ['vegetarian', 'vegan', 'dairy-free'] : ['vegetarian', 'gluten-free']) : /Seafood|Octopus|Gambas|Prawn|Sea Bream|Sardines|Pulpo/.test(m) ? ['pescatarian', 'gluten-free'] : ['gluten-free', 'dairy-free'],
      restaurantType: /Shawarma|Shish|Falafel|Tagine|Mezze|Kleftiko|Manti|İskender|Adana|Lahmacun|Fesenjan|Maqluba/.test(m) ? 'middle-eastern' : 'med',
      priceTier: /for Two|Txuletón|Ibérico|Octopus|Pulpo|Shoulder|Sea Bream/.test(m) ? 3 : 2, blurb: `${m} — to share or as a main.`,
    });
  }

  // -- french bistro / brasserie --
  for (const [m, pk, tier] of [['Steak Frites', 'beef', 2], ['Coq au Vin', 'chicken', 2], ['Confit de Canard', 'mixed', 2], ['Boeuf Bourguignon', 'beef', 2],
    ['Moules Marinière', 'seafood', 2], ['Cassoulet', 'mixed', 2], ['Soupe à l\'Oignon Gratinée', 'veggie', 2], ['Escargots à la Bourguignonne', 'mixed', 2],
    ['Steak Tartare', 'beef', 3], ['Sole Meunière', 'fish', 3], ['Bouillabaisse', 'seafood', 3], ['Croque Monsieur', 'pork', 1], ['Quiche Lorraine', 'pork', 1],
    ['Salade Niçoise', 'fish', 2], ['Blanquette de Veau', 'beef', 2], ['Magret de Canard', 'mixed', 3], ['Poulet Rôti', 'chicken', 2], ['Duck Confit Cassoulet', 'mixed', 2],
    ['Beef Cheek Bourguignon', 'beef', 3], ['Fillet of Beef Rossini', 'beef', 3], ['Seared Scallops with Pea Purée', 'seafood', 3], ['Roast Turbot with Hollandaise', 'fish', 3],
    ['Rack of Lamb, Dauphinoise', 'lamb', 3], ['Chicken Chasseur', 'chicken', 2], ['Pork Rillettes', 'pork', 1], ['Ratatouille with Poached Egg', 'egg', 1],
    ['Tartiflette', 'pork', 2], ['Cheese Fondue', 'veggie', 2], ['Onion & Comté Tart', 'veggie', 2], ['Pot-au-Feu', 'beef', 2]]) {
    add(m, {
      cuisine: 'french', protein: pk, carb: /Frites|Rôti|Dauphinoise|Tartiflette|Niçoise|Turbot|Rossini/.test(m) ? 'potato' : /Cassoulet|Bourguignon|Blanquette|Chasseur|Coq|Pot-au-Feu/.test(m) ? 'none' : /Croque|Fondue|Tart|Rillettes|Onion Soup|Oignon/.test(m) ? 'bread' : /Ratatouille/.test(m) ? 'grains' : 'none',
      spicy: 0, richness: /Salade|Escargots|Rillettes|Scallops/.test(m) ? 'medium' : 'hearty',
      mood: tier === 3 ? ['fancy', 'indulgent'] : /Salade|Ratatouille/.test(m) ? ['fresh', 'healthy'] : ['comfort', 'indulgent'],
      format: /Fondue|Bouillabaisse|Pot-au-Feu/.test(m) ? (/Fondue/.test(m) ? 'sharing' : 'soup') : 'plate',
      diet: pk === 'veggie' ? ['vegetarian'] : pk === 'egg' ? ['vegetarian'] : ['fish', 'seafood'].includes(pk) ? ['pescatarian'] : [],
      restaurantType: 'bistro', priceTier: tier, blurb: `${m} — classic French bistro cooking.`,
    });
  }

  // -- gastropub / british --
  for (const m of ['Steak & Ale Pie', 'Fish & Chips', 'Bangers & Mash', "Shepherd's Pie", 'Cottage Pie', 'Chicken & Leek Pie', 'Ham, Egg & Chips',
    'Liver & Bacon', 'Braised Lamb Shank', 'Slow-Roast Pork Belly', "Fisherman's Pie", 'Scampi & Chips', 'Beef Brisket with Mash', 'Chicken Kiev',
    'Toad in the Hole', 'Lancashire Hotpot', 'Gammon & Chips', 'Mushroom & Ale Pie', 'Cauliflower Cheese Bake', 'Nut Roast', 'Roast Beef Sunday Lunch',
    'Roast Pork Sunday Lunch', 'Roast Chicken Sunday Lunch', 'Roast Lamb Sunday Lunch', 'Vegetarian Sunday Roast', 'Ploughman\'s Board', 'Scotch Egg & Piccalilli',
    'Devilled Whitebait', 'Welsh Rarebit', 'Beef Wellington', 'Venison Haunch', 'Faggots & Peas', 'Steak & Kidney Pudding', 'Fish Pie', 'Crab on Toast']) {
    const veg = /Mushroom & Ale|Cauliflower|Nut Roast|Vegetarian|Rarebit/.test(m);
    add(m, {
      cuisine: 'british', protein: veg ? 'veggie' : /Fish|Scampi|Fisherman|Crab|Whitebait/.test(m) ? (/Scampi|Crab/.test(m) ? 'seafood' : 'fish') : /Chicken|Kiev/.test(m) ? 'chicken' : /Lamb|Hotpot|Shepherd/.test(m) ? 'lamb' : /Pork|Bangers|Toad|Gammon|Ham|Faggots|Belly/.test(m) ? 'pork' : /Venison/.test(m) ? 'mixed' : /Scotch Egg/.test(m) ? 'egg' : 'beef',
      carb: /Pie|Wellington|Pudding/.test(m) ? 'pastry' : /Rarebit|Toast|Ploughman/.test(m) ? 'bread' : 'potato', spicy: /Devilled/.test(m) ? 1 : 0,
      richness: /Ploughman|Rarebit|Whitebait|Scotch Egg|Crab/.test(m) ? 'medium' : 'hearty', mood: /Wellington|Venison/.test(m) ? ['fancy', 'indulgent'] : ['comfort'],
      format: /Board/.test(m) ? 'sharing' : 'plate',
      diet: veg ? ['vegetarian'] : /Fish|Scampi|Fisherman|Crab/.test(m) ? ['pescatarian'] : [],
      restaurantType: 'gastropub', priceTier: /Sunday|Shank|Belly|Brisket|Wellington|Venison/.test(m) ? (/Wellington|Venison/.test(m) ? 3 : 2) : 1,
      blurb: `${m} — proper pub cooking with all the trimmings.`,
    });
  }

  // -- modern / seafood / brunch --
  for (const m of ['Roast Cod on Puy Lentils', 'Pan-Seared Sea Bass, Crushed Potatoes', 'Miso-Glazed Salmon', 'Whole Roast Plaice, Brown Shrimp Butter',
    'Grilled Mackerel, Gooseberry', 'Halibut, Beurre Blanc', 'Monkfish Wrapped in Parma Ham', 'Seafood Linguine', 'Fish Stew with Rouille', 'Moules Frites',
    'Half Lobster, Garlic Butter', 'Dressed Crab', 'Fruits de Mer Platter', 'Fish Tacos', 'Salt & Pepper Squid', 'Grilled Prawn Skewers',
    'Cobb Salad', 'Chicken Caesar Salad', 'Poke Bowl', 'Buddha Bowl', 'Shakshuka', 'Eggs Benedict', 'Huevos Rancheros', 'Buttermilk Pancakes with Bacon',
    'Avocado & Poached Egg on Sourdough', 'Steak & Eggs', 'Full English Breakfast', 'Chicken & Waffles', 'Beetroot & Goat\'s Cheese Salad', 'Roasted Squash Grain Bowl',
    'Mushroom & Chestnut Wellington', 'Cauliflower Steak, Romesco', 'Butternut & Sage Tortellini', 'Halloumi & Grain Salad', 'Falafel Mezze Plate']) {
    const fish = /Cod|Sea Bass|Salmon|Plaice|Mackerel|Halibut|Monkfish|Linguine|Fish Stew|Fish Tacos|Squid/.test(m);
    const seaf = /Lobster|Crab|Fruits de Mer|Moules|Prawn|Squid/.test(m);
    const veg = /Salad|Bowl|Wellington|Cauliflower|Tortellini|Halloumi|Squash|Falafel|Beetroot|Avocado|Shakshuka/.test(m) && !/Chicken|Cobb|Steak|Bacon/.test(m);
    add(m, {
      cuisine: /Shakshuka|Falafel|Halloumi Mezze/.test(m) ? 'middle-eastern' : /Huevos|Poke/.test(m) ? 'mexican' : 'french',
      protein: seaf ? 'seafood' : fish ? 'fish' : /Wellington|Cauliflower|Beetroot|Squash|Tortellini/.test(m) ? (/Tortellini|Beetroot|Halloumi/.test(m) ? 'veggie' : 'vegan')
        : /Falafel/.test(m) ? 'vegan' : /Eggs|Shakshuka|Benedict|Rancheros|Avocado/.test(m) ? 'egg' : /Steak|Cobb|Caesar|Waffles|English|Pancakes/.test(m) ? (/Steak/.test(m) ? 'beef' : 'chicken') : 'veggie',
      carb: /Lentils|Grain Bowl|Buddha|Poke/.test(m) ? 'grains' : /Potatoes|Frites|English|Benedict|Rancheros/.test(m) ? 'potato' : /Sourdough|Pancakes|Waffles|Tacos|Sourdough|Mezze/.test(m) ? 'bread' : /Linguine/.test(m) ? 'pasta' : /Salad/.test(m) ? 'salad' : /Tortellini/.test(m) ? 'pasta' : 'none',
      spicy: /Romesco|Huevos|Shakshuka/.test(m) ? 1 : 0, richness: /Salad|Bowl|Crab|Fruits|Avocado/.test(m) ? 'light' : /Benedict|English|Waffles|Wellington|Pancakes/.test(m) ? 'hearty' : 'medium',
      mood: /Salad|Bowl|Avocado|Poke/.test(m) ? ['fresh', 'healthy', 'light'] : /Wellington|Lobster|Halibut|Monkfish|Fruits de Mer/.test(m) ? ['fancy', 'indulgent'] : ['comfort'],
      format: /Platter|Fruits de Mer/.test(m) ? 'sharing' : /Stew/.test(m) ? 'soup' : /Salad/.test(m) ? 'salad' : /Bowl|Poke|Buddha/.test(m) ? 'bowl' : 'plate',
      diet: seaf || fish ? ['pescatarian'] : veg ? (/Tortellini|Beetroot|Halloumi/.test(m) ? ['vegetarian'] : ['vegetarian', 'vegan', 'dairy-free']) : /Eggs|Shakshuka|Benedict|Rancheros|Avocado/.test(m) ? ['vegetarian'] : [],
      restaurantType: 'modern', priceTier: /Lobster|Halibut|Monkfish|Fruits de Mer|Wellington|Dressed Crab/.test(m) ? 3 : 2, blurb: `${m} — a modern seasonal plate.`,
    });
  }

  return out;
}

// ======================================================================
// BUILD
// ======================================================================
const homeAll = [];
const combos = [];
for (const t of TECHNIQUES) for (const p of PROTEINS) for (const s of SAUCES) combos.push([t, p, s]);
for (const [t, p, s] of shuffle(combos)) {
  const d = homeDish(t, p, s);
  if (d) homeAll.push(d);
}
const tkAll = shuffle(takeawaySet());
const rsAll = shuffle(restaurantSet());
const hAll = shuffle(homeAll);
console.log(`capacity — home ${hAll.length}, takeaway ${tkAll.length}, restaurant ${rsAll.length}`);

let needH = Math.min(hAll.length, Math.round(DEFICIT * SPLIT.home));
let needT = Math.min(tkAll.length, Math.round(DEFICIT * SPLIT.takeaway));
let needR = Math.min(rsAll.length, Math.round(DEFICIT * SPLIT.restaurant));
let total = needH + needT + needR;
while (total < DEFICIT) {
  let advanced = false;
  if (needH < hAll.length) { needH++; total++; advanced = true; }
  if (total < DEFICIT && needR < rsAll.length) { needR++; total++; advanced = true; }
  if (total < DEFICIT && needT < tkAll.length) { needT++; total++; advanced = true; }
  if (!advanced) break;
}
const chosen = { home: hAll.slice(0, needH), takeaway: tkAll.slice(0, needT), restaurant: rsAll.slice(0, needR) };

for (const [venue, list] of Object.entries(chosen)) {
  for (let i = 0; i < list.length; i += CHUNK) {
    const part = list.slice(i, i + CHUNK);
    const n = String(i / CHUNK + 1).padStart(2, '0');
    writeFileSync(join(ROOT, venue, `gen-${n}.json`), JSON.stringify(part, null, 0).replace(/\},\{/g, '},\n{') + '\n');
  }
  console.log(`${venue}: wrote ${list.length}`);
}
console.log(`generated ${needH + needT + needR}; deck total ${baseCount + needH + needT + needR}`);
