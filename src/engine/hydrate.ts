import { Dish, HomeDish, isHome } from './types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain-ESM module, typed by recipeTemplates.d.ts
import { buildRecipe } from './recipeTemplates.mjs';

/**
 * Hosted dishes ship as lightweight "cards": every quiz-filter field plus a
 * blurb, but home cards drop the big `ingredients` / `method` arrays and carry
 * a `gen` marker instead. This rebuilds them from the shared templates the
 * moment a dish detail screen opens — so the 100k catalogue stays small in
 * transit and in memory.
 */
export interface GenMarker {
  t: string; // technique key
  s: string; // sauce key
  p: string; // protein template key
  v: (string | number)[]; // veg
}

type HomeCard = Omit<HomeDish, 'ingredients' | 'method'> & {
  ingredients?: string[];
  method?: string[];
  gen?: GenMarker;
};

const cache = new WeakMap<object, Dish>();

export function hydrateDish(d: Dish | undefined): Dish | undefined {
  if (!d) return d;
  if (!isHome(d)) return d;
  const card = d as unknown as HomeCard;
  if (card.ingredients && card.ingredients.length && card.method && card.method.length) return d;
  if (!card.gen) return d;

  const hit = cache.get(d);
  if (hit) return hit;

  const built = buildRecipe({
    tech: card.gen.t,
    sauce: card.gen.s,
    protein: card.gen.p,
    carb: card.carb,
    veg: card.gen.v,
    servings: card.servings,
  });

  const full: HomeDish = {
    ...(d as HomeDish),
    blurb: d.blurb || built?.blurb || 'A simple, satisfying dinner.',
    ingredients: built?.ingredients ?? ['See method for what you need.', 'Salt and pepper.'],
    method: built?.method ?? [
      'Cook the main ingredient until done.',
      'Add the sauce and vegetables and finish together.',
    ],
  };
  cache.set(d, full);
  return full;
}
