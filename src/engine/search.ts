import { Dish } from './types';
import { dishText } from './dishText';

/**
 * Straight-up dish search — for when you already know the dinner and just
 * want the recipe. Ranks exact / prefix / substring name hits above a
 * loose all-words match on the dish's full text.
 */
export interface SearchHit {
  dish: Dish;
  score: number;
}

export function searchDishes(all: Dish[], query: string, limit = 40): Dish[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const words = q.split(/\s+/).filter(Boolean);

  const hits: SearchHit[] = [];
  for (const d of all) {
    const name = d.name.toLowerCase();
    let score: number;
    if (name === q) score = 0;
    else if (name.startsWith(q)) score = 1;
    else if (name.includes(q)) score = 2;
    else {
      const text = dishText(d);
      score = words.every((w) => text.includes(w)) ? 3 : -1;
    }
    if (score >= 0) hits.push({ dish: d, score });
  }

  hits.sort((a, b) => a.score - b.score || a.dish.name.length - b.dish.name.length);

  // Collapse exact-name duplicates (the catalogue has a few) — keep the best hit.
  const seen = new Set<string>();
  const out: Dish[] = [];
  for (const h of hits) {
    const key = h.dish.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h.dish);
    if (out.length >= limit) break;
  }
  return out;
}
