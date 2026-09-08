import { Dish, HomeDish, RestaurantDish, TakeawayDish } from '@/engine/types';

// Every *.json file in each folder is loaded automatically — just drop a new
// file into src/data/home (or takeaway / restaurant) and it appears in the app.
// (Metro require.context; enabled by default in Expo Router projects.)

type Ctx = { keys(): string[]; (id: string): unknown };

function loadDir(ctx: Ctx): unknown[] {
  return ctx
    .keys()
    .sort()
    .flatMap((k) => {
      const mod = ctx(k) as unknown;
      const arr = (mod as { default?: unknown }).default ?? mod;
      return Array.isArray(arr) ? arr : [];
    });
}

const homeCtx = (require as unknown as { context: (a: string, b: boolean, c: RegExp) => Ctx }).context(
  './home',
  false,
  /\.json$/,
);
const takeawayCtx = (require as unknown as { context: (a: string, b: boolean, c: RegExp) => Ctx }).context(
  './takeaway',
  false,
  /\.json$/,
);
const restaurantCtx = (require as unknown as { context: (a: string, b: boolean, c: RegExp) => Ctx }).context(
  './restaurant',
  false,
  /\.json$/,
);

export const HOME_DISHES = loadDir(homeCtx) as HomeDish[];
export const TAKEAWAY_DISHES = loadDir(takeawayCtx) as TakeawayDish[];
export const RESTAURANT_DISHES = loadDir(restaurantCtx) as RestaurantDish[];

export const ALL_DISHES: Dish[] = [
  ...HOME_DISHES,
  ...TAKEAWAY_DISHES,
  ...RESTAURANT_DISHES,
];

const BY_ID = new Map<string, Dish>(ALL_DISHES.map((d) => [d.id, d]));
export const dishById = (id: string): Dish | undefined => BY_ID.get(id);

export const DATASET_COUNTS = {
  home: HOME_DISHES.length,
  takeaway: TAKEAWAY_DISHES.length,
  restaurant: RESTAURANT_DISHES.length,
  total: ALL_DISHES.length,
};

// Punchy titles for the fortune wheel on the welcome screen.
export const WHEEL_TITLES: string[] = [
  'Spaghetti Bolognese',
  'Katsu Curry',
  'Fish & Chips',
  'Margherita Pizza',
  'Beef Tacos',
  'Thai Green Curry',
  'Full English',
  'Smash Burger',
  'Tikka Masala',
  'Carbonara',
  'Sunday Roast',
  'Pad Thai',
  'Lasagne',
  'Sushi Platter',
  'Shepherd’s Pie',
  'Ramen',
  'Doner Kebab',
  'Halloumi Salad',
  'Mac & Cheese',
  'Paella',
];
