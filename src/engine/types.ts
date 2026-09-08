// Core data model for Dinner Decider.
// Every dish is a "card" in a game of Guess Who: each answer the user gives
// eliminates every card that does not match.

export type Venue = 'home' | 'takeaway' | 'restaurant';

export type Effort = 'quick' | 'medium' | 'showoff';

export type Protein =
  | 'chicken'
  | 'beef'
  | 'lamb'
  | 'pork'
  | 'fish'
  | 'seafood'
  | 'veggie'
  | 'vegan'
  | 'egg'
  | 'mixed'
  | 'none';

export type Carb =
  | 'pasta'
  | 'rice'
  | 'noodles'
  | 'potato'
  | 'bread'
  | 'pastry'
  | 'grains'
  | 'salad'
  | 'none';

// Broad cuisine buckets the style question offers.
export type Cuisine =
  | 'italian'
  | 'indian'
  | 'east-asian'
  | 'mexican'
  | 'british'
  | 'american'
  | 'med'
  | 'middle-eastern'
  | 'french'
  | 'caribbean'
  | 'other';

export type Richness = 'light' | 'medium' | 'hearty';

export type Mood = 'comfort' | 'light' | 'fresh' | 'indulgent' | 'healthy' | 'fancy';

/**
 * The way a dish *tastes* — this is what the app leads with now, ahead of
 * cuisine. Mostly derived from a dish's other fields + its wording
 * (see engine/flavours.ts); `flavours` on a dish is an optional manual override.
 */
export type Flavour =
  | 'fresh' // light, green, crisp
  | 'zesty' // citrus / sharp / pickled / vinegary
  | 'herby' // a big hit of fresh herbs
  | 'spicy' // real chilli heat
  | 'warming' // gentle spice, curry warmth, ginger, cinnamon
  | 'comforting' // cosy, carby, creamy, baked
  | 'indulgent' // rich, fried, cheesy, decadent
  | 'smoky' // chargrilled, barbecued, smoked
  | 'savoury' // deep umami — soy, miso, mushroom, slow-cooked
  | 'holiday'; // sunshine food — coconut, grill, mezze, tacos

export type DishFormat = 'bowl' | 'plate' | 'handheld' | 'sharing' | 'soup' | 'salad';

export type Diet = 'vegetarian' | 'vegan' | 'pescatarian' | 'gluten-free' | 'dairy-free';

/**
 * The kind of *evening* a dish suits — the first thing the quiz asks, before
 * anything else. Like flavours, this is derived from a dish's other fields +
 * wording (see engine/occasion.ts); `occasions` on a dish is an optional
 * manual override.
 */
export type Occasion =
  | 'solo' // eating on your own — manageable, no giant feast
  | 'nofuss' // just feed me — fast, easy, minimum effort
  | 'family' // feeding the household — crowd-pleaser, scales up, not too hot
  | 'date' // date night — a step up, a bit special, for two
  | 'special'; // anniversary / celebration — pull out all the stops

export interface BaseDish {
  id: string;
  name: string;
  blurb: string;
  venue: Venue;
  cuisine: Cuisine;
  protein: Protein;
  carb: Carb;
  /** 0 = not spicy, 1 = mild warmth, 2 = noticeable kick, 3 = properly hot */
  spicy: 0 | 1 | 2 | 3;
  richness: Richness;
  mood: Mood[];
  format: DishFormat;
  diet: Diet[];
  /** optional manual flavour override; otherwise flavours are derived */
  flavours?: Flavour[];
  /** optional manual occasion override; otherwise occasions are derived */
  occasions?: Occasion[];
}

export interface HomeDish extends BaseDish {
  venue: 'home';
  effort: Effort;
  timeMinutes: number;
  onePan: boolean;
  servings: number;
  ingredients: string[];
  method: string[];
}

export interface TakeawayDish extends BaseDish {
  venue: 'takeaway';
  /** pizza | indian | chinese | burger | chippy | kebab | thai | sushi | mexican | fried-chicken | caribbean | greek */
  takeawayType: string;
  /** what to type into a maps search, e.g. "chicken tikka masala" */
  searchTerm: string;
}

export interface RestaurantDish extends BaseDish {
  venue: 'restaurant';
  /** italian | indian | asian | grill | gastropub | mexican | med | seafood | french */
  restaurantType: string;
  /** 1 = casual, 2 = nice dinner, 3 = special occasion */
  priceTier: 1 | 2 | 3;
  searchTerm: string;
}

export type Dish = HomeDish | TakeawayDish | RestaurantDish;

export const isHome = (d: Dish): d is HomeDish => d.venue === 'home';
export const isTakeaway = (d: Dish): d is TakeawayDish => d.venue === 'takeaway';
export const isRestaurant = (d: Dish): d is RestaurantDish => d.venue === 'restaurant';
