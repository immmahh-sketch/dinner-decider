import { useMemo } from 'react';
import { ALL_DISHES } from '@/data/dishes';
import { Dish } from '@/engine/types';
import { poolFor, RESULT_THRESHOLD, seededShuffle } from '@/engine/filter';
import { getActiveExcluder } from '@/engine/exclude';
import { filterByIngredients } from '@/engine/ingredients';
import { useDecider } from './decider';
import { useCatalogVersion } from './catalog';
import { usePrefs } from './prefs';

/**
 * The remaining dishes for the current answers. Derived with useMemo from the
 * stable `steps` reference — never returns a fresh array to the store selector,
 * which is what used to crash the results screen (infinite render loop).
 *
 * If the user chose "directly" by ingredient, `pickedIngredients` takes over:
 * every dish whose text contains all the picked terms (still minus deal-breakers).
 */
export function usePool(): Dish[] {
  const steps = useDecider((s) => s.steps);
  const picked = useDecider((s) => s.pickedIngredients);
  const catVersion = useCatalogVersion();
  // deal-breakers feed poolFor via the module-singleton excluder; this key just
  // forces the memo to refresh when the user edits them.
  const avoid = usePrefs((s) => s.avoid);
  const diets = usePrefs((s) => s.diets);
  const allergens = usePrefs((s) => s.allergens);
  const dealKey = useMemo(
    () => `${avoid.join(',')}|${diets.join(',')}|${allergens.join(',')}`,
    [avoid, diets, allergens],
  );
  const pickKey = picked.join('|');
  return useMemo(() => {
    if (picked.length) {
      const exclude = getActiveExcluder();
      const base = exclude ? ALL_DISHES.filter((d) => !exclude(d)) : ALL_DISHES;
      return filterByIngredients(base, picked);
    }
    return poolFor(ALL_DISHES, steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, catVersion, dealKey, pickKey]);
}

export function usePoolCount(): number {
  return usePool().length;
}

/** Up to RESULT_THRESHOLD dishes, deterministically shuffled by the current seed. */
export function useResults(): { results: Dish[]; total: number } {
  const pool = usePool();
  const seed = useDecider((s) => s.shuffleSeed);
  const results = useMemo(
    () => seededShuffle(pool, seed).slice(0, RESULT_THRESHOLD),
    [pool, seed],
  );
  return { results, total: pool.length };
}

export { useCatalogStats } from './catalog';
