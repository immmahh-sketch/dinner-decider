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
  let kcal = 520;
  let fat = 20;
  let satFat = 7;
  let carbs = 55;
  let sugar = 8;
  let protein = 30;
  let salt = 1.4;
  let fibre = 6;

  if (isTakeaway(d)) {
    kcal += 220;
    fat += 16;
    satFat += 6;
    salt += 1.1;
  } else if (!isHome(d)) {
    // restaurant
    kcal += 140;
    fat += 10;
    satFat += 4;
    salt += 0.8;
  }

  if (d.richness === 'light') {
    kcal -= 150;
    fat -= 8;
    carbs -= 12;
  } else if (d.richness === 'hearty') {
    kcal += 170;
    fat += 10;
    carbs += 18;
    protein += 8;
  }

  // --- cooking method / richness signals from the wording ---
  if (has(t, 'deep-fried', 'deep fried', 'battered', 'tempura', 'katsu', 'fried chicken', 'schnitzel', 'karaage', 'popcorn chicken')) {
    kcal += 260;
    fat += 20;
    satFat += 6;
  } else if (has(t, 'fried', 'crispy', 'crumbed', 'breaded', 'panko', 'golden')) {
    kcal += 150;
    fat += 11;
    satFat += 3;
  }
  if (has(t, 'creamy', 'double cream', 'carbonara', 'alfredo', 'gratin', 'dauphinoise', 'mac and cheese', 'macaroni cheese', 'cheese sauce', 'béchamel', 'bechamel', 'stroganoff')) {
    kcal += 190;
    fat += 14;
    satFat += 9;
    sugar += 2;
  }
  if (has(t, 'cheese', 'mozzarella', 'parmesan', 'cheddar', 'halloumi', 'feta', 'paneer', 'blue cheese', 'raclette')) {
    kcal += 90;
    fat += 7;
    satFat += 4;
    salt += 0.4;
  }
  if (has(t, 'butter', 'buttery', 'ghee', 'brown butter')) {
    kcal += 90;
    fat += 10;
    satFat += 6;
  }
  if (has(t, 'coconut', 'korma', 'massaman', 'rendang', 'peanut', 'satay')) {
    kcal += 150;
    fat += 12;
    satFat += 8;
    sugar += 3;
  }
  if (has(t, 'pastry', 'puff pastry', 'shortcrust', ' pie', 'sausage roll', 'wellington', 'filo', 'pot pie', 'pasty')) {
    kcal += 170;
    fat += 12;
    satFat += 6;
  }
  if (has(t, 'bbq', 'barbecue', 'honey', 'glazed', 'glaze', 'teriyaki', 'hoisin', 'sweet chilli', 'sweet-and-sour', 'sweet and sour', 'maple', 'char siu', 'plum sauce', 'sticky')) {
    sugar += 12;
    kcal += 45;
    carbs += 10;
  }
  if (has(t, 'grilled', 'griddled', 'chargrilled', 'steamed', 'poached', ' salad', 'tandoori', 'skewer', 'souvlaki', 'ceviche', 'poke', 'broth', 'consommé', 'nourish bowl')) {
    kcal -= 120;
    fat -= 8;
    satFat -= 3;
  }
  if (has(t, 'roast', 'roasted', 'baked', 'traybake', 'tray bake', 'tray-bake')) {
    kcal += 30;
    fat += 2;
  }

  // --- protein leanness ---
  switch (d.protein) {
    case 'beef':
    case 'lamb':
      kcal += 90;
      fat += 9;
      satFat += 5;
      protein += 6;
      break;
    case 'pork':
      kcal += 60;
      fat += 6;
      satFat += 3;
      protein += 5;
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
      kcal -= 60;
      fat -= 5;
      carbs -= 3;
      protein += 4;
      break;
    case 'vegan':
      kcal -= 40;
      satFat -= 3;
      protein -= 4;
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
  if (has(t, 'sausage', 'chorizo', 'bacon', 'pepperoni', 'salami', 'pancetta', 'lardon', 'nduja', "n'duja", 'hot dog', 'frankfurter', 'corned beef', 'spam', 'black pudding')) {
    kcal += 110;
    fat += 10;
    satFat += 4;
    salt += 1.0;
  }
  if (has(t, 'lentil', 'chickpea', 'butter bean', 'black bean', 'kidney bean', ' dal', ' dhal', ' daal', 'tofu', 'tempeh', 'edamame')) {
    fibre += 5;
    protein += 4;
  }

  // --- carb load ---
  switch (d.carb) {
    case 'pasta':
      carbs += 40;
      kcal += 120;
      fibre += 2;
      break;
    case 'rice':
      carbs += 45;
      kcal += 130;
      break;
    case 'noodles':
      carbs += 42;
      kcal += 125;
      break;
    case 'potato':
      carbs += 34;
      kcal += 110;
      fibre += 3;
      break;
    case 'bread':
    case 'pastry':
      carbs += 30;
      kcal += 110;
      break;
    case 'grains':
      carbs += 32;
      kcal += 120;
      fibre += 4;
      break;
    case 'salad':
      carbs -= 15;
      kcal -= 60;
      fibre += 3;
      break;
    case 'none':
      carbs -= 25;
      kcal -= 90;
      break;
    default:
      break;
  }
  if (has(t, 'chips', 'fries', 'wedges', 'hash brown', 'onion rings', 'fried rice', 'egg-fried rice', 'egg fried rice', 'pilau', 'garlic bread', 'naan', 'roti', 'paratha', 'dough balls')) {
    kcal += 180;
    fat += 10;
    carbs += 22;
  }

  // --- salt drivers ---
  if (has(t, 'soy sauce', ' soy', 'miso', 'fish sauce', 'oyster sauce', 'gravy', 'stock', 'bouillon', 'olives', 'capers', 'anchov', 'kimchi', 'pickle', 'cured', 'smoked', 'salted')) {
    salt += 0.9;
  }
  if (isTakeaway(d) && has(t, 'pizza')) {
    salt += 1.2;
    satFat += 5;
    kcal += 120;
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
  // calories then ~20 kcal per syn.
  let synKcal = 0;
  if (has(t, 'fried', 'crispy', 'battered', 'katsu', 'tempura', 'schnitzel', 'karaage', 'chips', 'fries', 'wedges')) synKcal += 260;
  if (has(t, 'creamy', 'carbonara', 'alfredo', 'gratin', 'cheese sauce', 'béchamel', 'bechamel', 'stroganoff', 'dauphinoise')) synKcal += 220;
  if (has(t, 'cheese', 'mozzarella', 'parmesan', 'cheddar', 'halloumi', 'paneer', 'feta')) synKcal += 120;
  if (has(t, 'butter', 'ghee', 'olive oil', 'buttery', 'oil-drizzled', 'drizzle of oil')) synKcal += 100;
  if (has(t, 'coconut', 'korma', 'massaman', 'peanut', 'satay', 'cashew')) synKcal += 150;
  if (has(t, 'pastry', ' pie', 'filo', 'puff', 'sausage roll', 'crumble', 'pasty')) synKcal += 170;
  if (has(t, 'bbq', 'honey', 'glaze', 'teriyaki', 'hoisin', 'sweet chilli', 'maple', 'sweet and sour', 'sticky')) synKcal += 90;
  if (has(t, ' wine', ' beer', 'cider', 'sherry', 'marsala', 'vodka', ' rum', 'prosecco')) synKcal += 70;
  if (has(t, 'mayo', 'mayonnaise', 'aioli', 'pesto', 'hollandaise', 'tartare', 'ranch')) synKcal += 110;
  if (has(t, 'chorizo', 'bacon', 'pepperoni', 'salami', 'nduja', "n'duja", 'pancetta')) synKcal += 90;
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
