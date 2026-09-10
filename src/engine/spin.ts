import { Dish } from './types';
import { getActiveExcluder } from './exclude';

/** N distinct random dishes for the fortune wheel, minus the user's deal-breakers. */
export function randomDishes(all: Dish[], n: number): Dish[] {
  const exclude = getActiveExcluder();
  const pool = exclude ? all.filter((d) => !exclude(d)) : all;
  if (pool.length <= n) return [...pool];

  const picked: Dish[] = [];
  const used = new Set<number>();
  while (picked.length < n && used.size < pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    if (used.has(i)) continue;
    used.add(i);
    picked.push(pool[i]);
  }
  return picked;
}
