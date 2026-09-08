import { useMemo } from 'react';
import { ALL_DISHES } from '@/data/dishes';
import { Dish } from '@/engine/types';
import { poolFor, RESULT_THRESHOLD, seededShuffle } from '@/engine/filter';
import { useDecider } from './decider';
import { useCatalogVersion } from './catalog';

/**
 * The remaining dishes for the current answers. Derived with useMemo from the
 * stable `steps` reference — never returns a fresh array to the store selector,
 * which is what used to crash the results screen (infinite render loop).
 */
export function usePool(): Dish[] {
  const steps = useDecider((s) => s.steps);
  const catVersion = useCatalogVersion();
  return useMemo(() => poolFor(ALL_DISHES, steps), [steps, catVersion]);
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
