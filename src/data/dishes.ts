import { Dish, HomeDish, RestaurantDish, TakeawayDish } from '@/engine/types';

// ---- home (cook at home) : grouped by cuisine bucket -----------------------
import homeItalian from './home/italian.json';
import homeIndian from './home/indian.json';
import homeEastAsian from './home/east-asian.json';
import homeMexican from './home/mexican.json';
import homeBritish from './home/british.json';
import homeAmerican from './home/american.json';
import homeMed from './home/med.json';
import homeMiddleEast from './home/middle-eastern.json';
import homeFrench from './home/french.json';
import homeOther from './home/other.json';

// ---- takeaway : grouped by takeaway type ----------------------------------
import tkPizza from './takeaway/pizza.json';
import tkIndian from './takeaway/indian.json';
import tkChinese from './takeaway/chinese.json';
import tkBurger from './takeaway/burger.json';
import tkChippy from './takeaway/chippy.json';
import tkKebab from './takeaway/kebab.json';
import tkThai from './takeaway/thai.json';
import tkSushi from './takeaway/sushi.json';
import tkMexican from './takeaway/mexican.json';
import tkFriedChicken from './takeaway/fried-chicken.json';

// ---- restaurant : grouped by venue type ----------------------------------
import rsItalian from './restaurant/italian.json';
import rsIndian from './restaurant/indian.json';
import rsAsian from './restaurant/asian.json';
import rsGrill from './restaurant/grill.json';
import rsGastropub from './restaurant/gastropub.json';
import rsMexican from './restaurant/mexican.json';
import rsMed from './restaurant/med.json';
import rsSeafood from './restaurant/seafood.json';
import rsFrench from './restaurant/french.json';

const asHome = (x: unknown) => x as HomeDish[];
const asTakeaway = (x: unknown) => x as TakeawayDish[];
const asRestaurant = (x: unknown) => x as RestaurantDish[];

export const HOME_DISHES: HomeDish[] = [
  ...asHome(homeItalian),
  ...asHome(homeIndian),
  ...asHome(homeEastAsian),
  ...asHome(homeMexican),
  ...asHome(homeBritish),
  ...asHome(homeAmerican),
  ...asHome(homeMed),
  ...asHome(homeMiddleEast),
  ...asHome(homeFrench),
  ...asHome(homeOther),
];

export const TAKEAWAY_DISHES: TakeawayDish[] = [
  ...asTakeaway(tkPizza),
  ...asTakeaway(tkIndian),
  ...asTakeaway(tkChinese),
  ...asTakeaway(tkBurger),
  ...asTakeaway(tkChippy),
  ...asTakeaway(tkKebab),
  ...asTakeaway(tkThai),
  ...asTakeaway(tkSushi),
  ...asTakeaway(tkMexican),
  ...asTakeaway(tkFriedChicken),
];

export const RESTAURANT_DISHES: RestaurantDish[] = [
  ...asRestaurant(rsItalian),
  ...asRestaurant(rsIndian),
  ...asRestaurant(rsAsian),
  ...asRestaurant(rsGrill),
  ...asRestaurant(rsGastropub),
  ...asRestaurant(rsMexican),
  ...asRestaurant(rsMed),
  ...asRestaurant(rsSeafood),
  ...asRestaurant(rsFrench),
];

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

// 20 punchy titles for the fortune wheel on the welcome screen.
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
