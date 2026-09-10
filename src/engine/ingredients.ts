import { Dish } from './types';
import { dishText } from './dishText';

/**
 * "Choose directly" — skip the quiz and pick the dinner by the ingredients
 * you've got in / fancy. A dish matches when EVERY picked term appears in its
 * searchable text (name + blurb + ingredients, or the reconstructed words for
 * a hosted card). AND semantics: more picks = fewer, more specific results.
 */

export interface IngredientGroup {
  title: string;
  items: string[];
}

// Curated so each term is discriminating enough to be a useful filter — the
// truly universal ones (salt, pepper, oil, stock) are left out on purpose.
export const INGREDIENT_GROUPS: IngredientGroup[] = [
  {
    title: 'Protein',
    items: [
      'chicken',
      'beef',
      'mince',
      'steak',
      'pork',
      'sausage',
      'bacon',
      'lamb',
      'salmon',
      'cod',
      'haddock',
      'tuna',
      'prawn',
      'tofu',
      'halloumi',
      'paneer',
      'chickpea',
      'lentil',
      'egg',
    ],
  },
  {
    title: 'Carb',
    items: ['pasta', 'spaghetti', 'rice', 'noodle', 'potato', 'gnocchi', 'tortilla', 'couscous', 'bread'],
  },
  {
    title: 'Veg & aromatics',
    items: [
      'tomato',
      'garlic',
      'onion',
      'pepper',
      'mushroom',
      'spinach',
      'broccoli',
      'courgette',
      'aubergine',
      'sweet potato',
      'carrot',
      'leek',
      'peas',
      'sweetcorn',
      'kale',
      'chilli',
      'ginger',
      'lemon',
      'lime',
      'coriander',
      'spring onion',
    ],
  },
  {
    title: 'Dairy & store cupboard',
    items: [
      'cheese',
      'parmesan',
      'feta',
      'cream',
      'coconut milk',
      'yoghurt',
      'chorizo',
      'olives',
      'curry paste',
      'soy sauce',
      'peanut',
      'honey',
    ],
  },
];

export const norm = (t: string): string => t.trim().toLowerCase();

/** All picked terms must appear in the dish's searchable text. */
export function matchesIngredients(d: Dish, terms: string[]): boolean {
  if (!terms.length) return true;
  const text = dishText(d);
  return terms.every((t) => text.includes(t));
}

export function filterByIngredients(all: Dish[], terms: string[]): Dish[] {
  const clean = terms.map(norm).filter(Boolean);
  if (!clean.length) return all;
  return all.filter((d) => matchesIngredients(d, clean));
}
