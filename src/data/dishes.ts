import { Dish, HomeDish, RestaurantDish, TakeawayDish } from '@/engine/types';

// -------------------------------------------------------------------------
// The deck is two layers:
//   1. BUNDLED  — the hand-written dishes shipped in the binary. Works
//      offline and gives the app something to run on the very first launch.
//   2. HOSTED   — a big catalogue of composed dishes fetched at runtime from
//      GitHub Pages (see loadCatalog). Home dishes arrive as lightweight
//      "cards" and are rebuilt on demand by engine/hydrate.
// ALL_DISHES holds both, deduped by id. It is mutated in place so existing
// imports stay valid; screens re-read it when `catalogVersion` bumps.
// -------------------------------------------------------------------------

// Hosted on a GitHub Release asset (CDN-backed, gzipped in transit). Re-run
// scripts/generate-catalog.mjs then: gh release upload catalog docs/dishes.json --clobber
export const CATALOG_URL =
  'https://github.com/immmahh-sketch/dinner-decider/releases/download/catalog/dishes.json';

// The hand-written dish files under src/data/{home,takeaway,restaurant}/*.json
// are concatenated into these three bundles by scripts/bundle-dishes.mjs.
// (Was Metro require.context — an experimental feature that crashes the New
// Architecture release build on launch. Run bundle-dishes.mjs after editing
// any dish file.)
import homeBundle from './home.bundle.json';
import takeawayBundle from './takeaway.bundle.json';
import restaurantBundle from './restaurant.bundle.json';

export const HOME_DISHES = homeBundle as unknown as HomeDish[];
export const TAKEAWAY_DISHES = takeawayBundle as unknown as TakeawayDish[];
export const RESTAURANT_DISHES = restaurantBundle as unknown as RestaurantDish[];

const BUNDLED: Dish[] = [...HOME_DISHES, ...TAKEAWAY_DISHES, ...RESTAURANT_DISHES];

export const ALL_DISHES: Dish[] = [...BUNDLED];
const BY_ID = new Map<string, Dish>(ALL_DISHES.map((d) => [d.id, d]));
export const dishById = (id: string): Dish | undefined => BY_ID.get(id);

// ---- live catalogue --------------------------------------------------
let version = 0;
const listeners = new Set<() => void>();
export const catalogVersion = () => version;
export const onCatalogChange = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export interface CatalogStats {
  bundled: number;
  hosted: number;
  total: number;
  source: 'bundled' | 'hosted';
}
export function catalogStats(): CatalogStats {
  return {
    bundled: BUNDLED.length,
    hosted: ALL_DISHES.length - BUNDLED.length,
    total: ALL_DISHES.length,
    source: ALL_DISHES.length > BUNDLED.length ? 'hosted' : 'bundled',
  };
}

function mergeHosted(cards: Dish[]) {
  let added = 0;
  for (const d of cards) {
    if (!d || !d.id || BY_ID.has(d.id)) continue;
    ALL_DISHES.push(d);
    BY_ID.set(d.id, d);
    added++;
  }
  if (added > 0) {
    version++;
    listeners.forEach((cb) => cb());
  }
  return added;
}

let loadPromise: Promise<CatalogStats> | null = null;

/** Fetch the hosted catalogue once and fold it into ALL_DISHES. Safe to call
 *  repeatedly — resolves to the same in-flight promise. Failure is swallowed;
 *  the app keeps running on BUNDLED. */
export function loadCatalog(): Promise<CatalogStats> {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const res = await fetch(CATALOG_URL, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`catalog ${res.status}`);
      const cards = (await res.json()) as Dish[];
      if (Array.isArray(cards)) mergeHosted(cards);
    } catch {
      // offline / fetch failed — stay on the bundled deck
    }
    return catalogStats();
  })();
  return loadPromise;
}

export const DATASET_COUNTS = {
  get home() {
    return ALL_DISHES.filter((d) => d.venue === 'home').length;
  },
  get takeaway() {
    return ALL_DISHES.filter((d) => d.venue === 'takeaway').length;
  },
  get restaurant() {
    return ALL_DISHES.filter((d) => d.venue === 'restaurant').length;
  },
  get total() {
    return ALL_DISHES.length;
  },
};

// Punchy titles for the fortune wheel on the welcome screen.
export const WHEEL_TITLES: string[] = [
  'Spaghetti Bolognese', 'Katsu Curry', 'Fish & Chips', 'Margherita Pizza', 'Beef Tacos',
  'Thai Green Curry', 'Full English', 'Smash Burger', 'Tikka Masala', 'Carbonara',
  'Sunday Roast', 'Pad Thai', 'Lasagne', 'Sushi Platter', 'Shepherd’s Pie',
  'Ramen', 'Doner Kebab', 'Halloumi Salad', 'Mac & Cheese', 'Paella',
];
