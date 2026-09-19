import { Dish, isHome, isTakeaway } from './types';
import { dishText } from './dishText';

/**
 * A ROUGH per-portion nutrition + slimming-plan estimate for any dish.
 *
 * There is no per-dish nutrition data in the catalogue and the official
 * WeightWatchers Points / Slimming World Syns formulas are proprietary, so
 * everything here is a structural heuristic off the dish's wording and its
 * quiz fields (richness, protein, carb, cooking method). Always shown with a
 * "≈" and a "check the label / your app" disclaimer.
 *
 * Calibration note (19 Sep 2026): the original weights let independent
 * "richness" signals (creamy + cheese + butter + roasted…) add up in full on
 * the same dish, which pushed the catalogue's median home dish to ~820 kcal
 * and put 84% of it at 600+. Real portions overlap — "creamy" and "cheese"
 * usually describe the same richness, not two separate calorie sources — so
 * the indulgence-style bonuses below (fried/creamy/cheese/butter/coconut/
 * pastry/cured-meat/chips-naan-etc) are collected into one bucket and only
 * the single biggest one counts in full; the rest count at half weight. The
 * flat "roast/baked" bonus was dropped entirely — it's a cooking method, not
 * a richness signal, and it was firing on a quarter of the catalogue for no
 * real reason. Re-tuned against the whole bundled deck to land the median
 * home dish back around ~600-650 kcal. See scripts/lowcal-variants.mjs,
 * which ports this same formula to flag/lighten dishes at 600+.
 */
export interface DishNutrition {
  kcal: number;
  fat: number; // g
  satFat: number; // g
  carbs: number; // g
  sugar: number; // g
  protein: number; // g
  salt: number; // g
  fibre: number; // g
}

export interface DishEstimate extends DishNutrition {
  ww: number; // WeightWatchers Points (approx)
  sw: number; // Slimming World Syns (approx)
}

export type Plan = 'sw' | 'ww' | 'cals';

export function planLabel(answer: string | undefined): Plan | null {
  return answer === 'sw' || answer === 'ww' || answer === 'cals' ? answer : null;
}

const cache = new WeakMap<object, DishEstimate>();
const has = (t: string, ...words: string[]): boolean => words.some((w) => t.includes(w));

export function estimateDish(d: Dish): DishEstimate {
  const hit = cache.get(d);
  if (hit) return hit;

  const t = dishText(d);

  // --- base plate ---
  let kcal = 430;
  let fat = 15;
  let satFat = 5;
  let carbs = 45;
  let sugar = 7;
  let protein = 28;
  let salt = 1.2;
  let fibre = 6;

  if (isTakeaway(d)) {
    kcal += 160;
    fat += 12;
    satFat += 4;
    salt += 0.9;
  } else if (!isHome(d)) {
    // restaurant
    kcal += 90;
    fat += 6;
    satFat += 3;
    salt += 0.6;
  }

  if (d.richness === 'light') {
    kcal -= 110;
    fat -= 6;
    carbs -= 9;
  } else if (d.richness === 'hearty') {
    kcal += 110;
    fat += 6;
    carbs += 12;
    protein += 5;
  }

  // --- indulgence signals from the wording -----------------------------
  // Collected into one bucket rather than added on top of each other: only
  // the single biggest signal counts in full, the rest count at half
  // weight, since these mostly describe overlapping richness (a "creamy,
  // cheesy" bake isn't two separate sources of extra calories).
  const indulgence: Array<{ kcal: number; fat: number; satFat: number; sugar?: number }> = [];
  if (has(t, 'deep-fried', 'deep fried', 'battered', 'tempura', 'katsu', 'fried chicken', 'schnitzel', 'karaage', 'popcorn chicken')) {
    indulgence.push({ kcal: 190, fat: 15, satFat: 4 });
  } else if (has(t, 'fried', 'crispy', 'crumbed', 'breaded', 'panko', 'golden')) {
    indulgence.push({ kcal: 110, fat: 8, satFat: 2 });
  }
  if (has(t, 'creamy', 'double cream', 'carbonara', 'alfredo', 'gratin', 'dauphinoise', 'mac and cheese', 'macaroni cheese', 'cheese sauce', 'béchamel', 'bechamel', 'stroganoff')) {
    indulgence.push({ kcal: 140, fat: 10, satFat: 7, sugar: 2 });
  }
  if (has(t, 'cheese', 'mozzarella', 'parmesan', 'cheddar', 'halloumi', 'feta', 'paneer', 'blue cheese', 'raclette')) {
    indulgence.push({ kcal: 60, fat: 5, satFat: 3 });
  }
  if (has(t, 'butter', 'buttery', 'ghee', 'brown butter')) {
    indulgence.push({ kcal: 60, fat: 7, satFat: 4 });
  }
  if (has(t, 'coconut', 'korma', 'massaman', 'rendang', 'peanut', 'satay')) {
    indulgence.push({ kcal: 110, fat: 9, satFat: 6, sugar: 2 });
  }
  if (has(t, 'pastry', 'puff pastry', 'shortcrust', ' pie', 'sausage roll', 'wellington', 'filo', 'pot pie', 'pasty')) {
    indulgence.push({ kcal: 130, fat: 9, satFat: 5 });
  }
  if (has(t, 'sausage', 'chorizo', 'bacon', 'pepperoni', 'salami', 'pancetta', 'lardon', 'nduja', "n'duja", 'hot dog', 'frankfurter', 'corned beef', 'spam', 'black pudding')) {
    indulgence.push({ kcal: 80, fat: 7, satFat: 3 });
  }
  if (has(t, 'chips', 'fries', 'wedges', 'hash brown', 'onion rings', 'fried rice', 'egg-fried rice', 'egg fried rice', 'pilau', 'garlic bread', 'naan', 'roti', 'paratha', 'dough balls')) {
    indulgence.push({ kcal: 130, fat: 7, satFat: 1 });
  }

  indulgence.sort((a, b) => b.kcal - a.kcal);
  indulgence.forEach((sig, i) => {
    const w = i === 0 ? 1 : 0.5;
    kcal += sig.kcal * w;
    fat += sig.fat * w;
    satFat += sig.satFat * w;
    sugar += (sig.sugar ?? 0) * w;
  });

  // --- everything else keeps its own, smaller weight --------------------
  if (has(t, 'bbq', 'barbecue', 'honey', 'glazed', 'glaze', 'teriyaki', 'hoisin', 'sweet chilli', 'sweet-and-sour', 'sweet and sour', 'maple', 'char siu', 'plum sauce', 'sticky')) {
    sugar += 9;
    kcal += 35;
    carbs += 8;
  }
  if (has(t, 'grilled', 'griddled', 'chargrilled', 'steamed', 'poached', ' salad', 'tandoori', 'skewer', 'souvlaki', 'ceviche', 'poke', 'broth', 'consommé', 'nourish bowl')) {
    kcal -= 100;
    fat -= 7;
    satFat -= 2;
  }
  // NB: no flat bonus for "roast/roasted/baked" any more — it's a cooking
  // method, not a richness signal, and it was firing on ~1 in 4 dishes.

  // --- protein leanness ---
  switch (d.protein) {
    case 'beef':
    case 'lamb':
      kcal += 70;
      fat += 7;
      satFat += 4;
      protein += 5;
      break;
    case 'pork':
      kcal += 50;
      fat += 5;
      satFat += 3;
      protein += 4;
      break;
    case 'chicken':
      protein += 8;
      break;
    case 'fish':
      kcal -= 20;
      fat -= 2;
      protein += 6;
      break;
    case 'seafood':
      kcal -= 50;
      fat -= 4;
      carbs -= 3;
      protein += 4;
      break;
    case 'vegan':
      kcal -= 30;
      satFat -= 2;
      protein -= 3;
      fibre += 4;
      break;
    case 'veggie':
      satFat += 1;
      fibre += 3;
      break;
    case 'egg':
      protein += 2;
      break;
    default:
      break;
  }
  if (has(t, 'lentil', 'chickpea', 'butter bean', 'black bean', 'kidney bean', ' dal', ' dhal', ' daal', 'tofu', 'tempeh', 'edamame')) {
    fibre += 5;
    protein += 4;
  }

  // --- carb load ---
  switch (d.carb) {
    case 'pasta':
      carbs += 33;
      kcal += 100;
      fibre += 2;
      break;
    case 'rice':
      carbs += 36;
      kcal += 105;
      break;
    case 'noodles':
      carbs += 34;
      kcal += 100;
      break;
    case 'potato':
      carbs += 28;
      kcal += 90;
      fibre += 3;
      break;
    case 'bread':
    case 'pastry':
      carbs += 25;
      kcal += 90;
      break;
    case 'grains':
      carbs += 25;
      kcal += 95;
      fibre += 4;
      break;
    case 'salad':
      carbs -= 13;
      kcal -= 50;
      fibre += 3;
      break;
    case 'none':
      carbs -= 19;
      kcal -= 70;
      break;
    default:
      break;
  }

  // --- salt drivers ---
  if (has(t, 'soy sauce', ' soy', 'miso', 'fish sauce', 'oyster sauce', 'gravy', 'stock', 'bouillon', 'olives', 'capers', 'anchov', 'kimchi', 'pickle', 'cured', 'smoked', 'salted')) {
    salt += 0.9;
  }
  if (isTakeaway(d) && has(t, 'pizza')) {
    salt += 1.1;
    satFat += 4;
    kcal += 90;
  }

  // --- veg / freshness ---
  if (has(t, 'spinach', 'broccoli', 'kale', 'pepper', 'courgette', 'aubergine', 'mushroom', 'tomato', 'carrot', 'cauliflower', 'greens', ' salad', 'slaw', 'rocket', 'peas', 'green beans', 'squash', 'sprouts', 'asparagus')) {
    fibre += 3;
  }

  // --- clamp to sane ranges ---
  kcal = Math.max(180, Math.round(kcal / 10) * 10);
  fat = Math.max(3, Math.round(fat));
  satFat = Math.max(1, Math.min(Math.round(satFat), fat));
  carbs = Math.max(5, Math.round(carbs));
  sugar = Math.max(1, Math.round(sugar));
  protein = Math.max(6, Math.round(protein));
  salt = Math.max(0.3, Math.round(salt * 10) / 10);
  fibre = Math.max(1, Math.round(fibre));

  // --- WeightWatchers Points (approx, SmartPoints-style) ---
  const ww = Math.max(
    0,
    Math.round(0.0305 * kcal + 0.275 * satFat + 0.12 * sugar - 0.098 * protein),
  );

  // --- Slimming World Syns (approx) ---
  // Lean protein, most veg and "speed" carbs are Free; syns come from added
  // fats, sugar, cheese, pastry, booze and frying. Estimate the discretionary
  // calories then ~20 kcal per syn. Re-tuned alongside the kcal weights above.
  let synKcal = 0;
  if (has(t, 'fried', 'crispy', 'battered', 'katsu', 'tempura', 'schnitzel', 'karaage', 'chips', 'fries', 'wedges')) synKcal += 190;
  if (has(t, 'creamy', 'carbonara', 'alfredo', 'gratin', 'cheese sauce', 'béchamel', 'bechamel', 'stroganoff', 'dauphinoise')) synKcal += 160;
  if (has(t, 'cheese', 'mozzarella', 'parmesan', 'cheddar', 'halloumi', 'paneer', 'feta')) synKcal += 85;
  if (has(t, 'butter', 'ghee', 'olive oil', 'buttery', 'oil-drizzled', 'drizzle of oil')) synKcal += 70;
  if (has(t, 'coconut', 'korma', 'massaman', 'peanut', 'satay', 'cashew')) synKcal += 110;
  if (has(t, 'pastry', ' pie', 'filo', 'puff', 'sausage roll', 'crumble', 'pasty')) synKcal += 125;
  if (has(t, 'bbq', 'honey', 'glaze', 'teriyaki', 'hoisin', 'sweet chilli', 'maple', 'sweet and sour', 'sticky')) synKcal += 65;
  if (has(t, ' wine', ' beer', 'cider', 'sherry', 'marsala', 'vodka', ' rum', 'prosecco')) synKcal += 50;
  if (has(t, 'mayo', 'mayonnaise', 'aioli', 'pesto', 'hollandaise', 'tartare', 'ranch')) synKcal += 80;
  if (has(t, 'chorizo', 'bacon', 'pepperoni', 'salami', 'nduja', "n'duja", 'pancetta')) synKcal += 65;
  const sw = Math.max(0, Math.round(synKcal / 20));

  const out: DishEstimate = { kcal, fat, satFat, carbs, sugar, protein, salt, fibre, ww, sw };
  cache.set(d, out);
  return out;
}

/** Short chip text for a results card given the active plan. */
export function planChip(d: Dish, plan: Plan): string {
  const e = estimateDish(d);
  if (plan === 'sw') return `≈ ${e.sw} Syns`;
  if (plan === 'ww') return `≈ ${e.ww} Points`;
  return `≈ ${e.kcal} kcal`;
}
