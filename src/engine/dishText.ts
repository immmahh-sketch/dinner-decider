import { Dish, isHome } from './types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain-ESM module, typed by recipeTemplates.d.ts
import { SAUCES as RAW_SAUCES, PROTEINS as RAW_PROTEINS, VEG as RAW_VEG } from './recipeTemplates.mjs';

const SAUCES = RAW_SAUCES as Record<string, { word: string; ing: string[] }>;
const PROTEINS = RAW_PROTEINS as Record<string, { word: string }>;
const VEG = RAW_VEG as string[];

/**
 * A lowercased searchable blob for a dish — used by the deal-breaker /
 * allergen filter and the WW/SW estimator. For hosted home "cards" (no
 * ingredients array yet) it reconstructs the key ingredient words from the
 * gen marker so "no almonds" still catches a korma. Cached per dish object.
 */
const cache = new WeakMap<object, string>();

interface GenLike {
  gen?: { t: string; s: string; p: string; v: (string | number)[] };
}

export function dishText(d: Dish): string {
  const hit = cache.get(d);
  if (hit !== undefined) return hit;

  const parts: string[] = [d.name, d.blurb];

  if (isHome(d)) {
    const home = d as Dish & { ingredients?: string[] } & GenLike;
    if (home.ingredients && home.ingredients.length) {
      parts.push(home.ingredients.join(' '));
    } else if (home.gen) {
      const s = SAUCES[home.gen.s];
      const p = PROTEINS[home.gen.p];
      if (s) parts.push(s.ing.join(' '), s.word);
      if (p) parts.push(p.word);
      parts.push(
        ...home.gen.v.map((k) => (typeof k === 'number' ? VEG[k] : String(k))),
        home.carb,
      );
    }
  } else {
    const st = (d as Dish & { searchTerm?: string }).searchTerm;
    if (st) parts.push(st);
  }

  const text = parts.join(' ').toLowerCase();
  cache.set(d, text);
  return text;
}
