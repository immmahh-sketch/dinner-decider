import { useSyncExternalStore } from 'react';
import { catalogStats, catalogVersion, CatalogStats, onCatalogChange } from '@/data/dishes';

/** Bumps whenever the hosted catalogue folds new dishes into ALL_DISHES. */
export function useCatalogVersion(): number {
  return useSyncExternalStore(
    (cb) => onCatalogChange(cb),
    () => catalogVersion(),
    () => catalogVersion(),
  );
}

/** Live deck stats; re-renders when the hosted catalogue arrives. */
export function useCatalogStats(): CatalogStats {
  useCatalogVersion();
  return catalogStats();
}
