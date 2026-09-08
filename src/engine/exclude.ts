import { Dish, Diet } from './types';
import { dishText } from './dishText';

/**
 * "Deal-breakers": an always-on pre-filter applied before the Guess Who quiz
 * even starts. Unlike a quiz answer it never dead-ends politely — if you say
 * "no onions" you mean it, so onion dishes are gone full stop.
 *
 * The active predicate is kept in a module singleton so the non-React paths
 * (the decider store's imperative applyAnswer) pick it up too. The prefs store
 * rebuilds it whenever the user edits their deal-breakers.
 */
export interface ExcludePrefs {
  avoid: string[]; // free-text ingredient terms
  diets: Diet[]; // hard dietary requirements
  allergens: string[]; // allergen keys — see ALLERGEN_TERMS
}

/** Words that betray an allergen in a dish's name / blurb / ingredient words. */
const ALLERGEN_TERMS: Record<string, string[]> = {
  nuts: [
    'almond', 'cashew', 'walnut', 'hazelnut', 'pecan', 'pistachio', 'macadamia',
    'pine nut', 'praline', 'marzipan', 'nutella', 'frangipane', 'brazil nut',
  ],
  peanuts: ['peanut', 'groundnut', 'satay'],
  dairy: [
    'milk', 'cream', 'crème fraîche', 'creme fraiche', 'cheese', 'cheddar',
    'parmesan', 'parmigiano', 'mozzarella', 'feta', 'halloumi', 'paneer',
    'mascarpone', 'ricotta', 'butter', 'buttery', 'ghee', 'yoghurt', 'yogurt',
    'béchamel', 'bechamel', 'burrata', 'gruyère', 'gruyere',
  ],
  gluten: [
    'flour', 'bread', 'breadcrumb', 'panko', 'pasta', 'noodle', 'naan', 'chapati',
    'roti', 'paratha', 'pitta', 'tortilla', 'wrap', 'bun', 'brioche', 'pastry',
    'batter', 'couscous', 'bulgur', 'barley', 'orzo', 'gnocchi', 'dumpling',
    'soy sauce', 'crouton', 'filo', 'puff pastry',
  ],
  egg: [
    'egg', 'mayonnaise', ' mayo', 'aioli', 'hollandaise', 'béarnaise', 'bearnaise',
    'carbonara', 'frittata', 'omelette', 'meringue', 'quiche',
  ],
  shellfish: [
    'prawn', 'shrimp', 'crab', 'lobster', 'langoustine', 'scampi', 'crayfish',
    'scallop', 'mussel', 'clam', 'oyster', 'cockle', 'squid', 'calamari', 'octopus',
  ],
  fish: [
    'salmon', 'tuna', 'cod', 'haddock', 'pollock', 'mackerel', 'sardine', 'anchov',
    'trout', 'sea bass', 'seabass', 'hake', 'halibut', 'plaice', 'kipper',
    'fish cake', 'fish finger', 'fish and chips', 'fish & chips', 'fish pie',
  ],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'miso', 'tempeh', 'tamari', 'hoisin', 'teriyaki'],
  sesame: ['sesame', 'tahini', 'hummus', "za'atar", 'zaatar', 'gomashio', 'halva'],
};

const MEAT: Dish['protein'][] = ['chicken', 'beef', 'lamb', 'pork', 'mixed'];

export function buildExcluder(prefs: ExcludePrefs): ((d: Dish) => boolean) | null {
  const avoid = (prefs.avoid || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const diets = prefs.diets || [];
  const allergens = prefs.allergens || [];
  if (!avoid.length && !diets.length && !allergens.length) return null;

  const terms = new Set<string>(avoid);
  for (const a of allergens) for (const w of ALLERGEN_TERMS[a] || []) terms.add(w);
  // "gluten-free" / "dairy-free" chosen as a diet behave like avoiding those terms
  if (diets.includes('gluten-free')) for (const w of ALLERGEN_TERMS.gluten) terms.add(w);
  if (diets.includes('dairy-free')) for (const w of ALLERGEN_TERMS.dairy) terms.add(w);
  const termList = [...terms];

  const wantsVeg = diets.includes('vegetarian');
  const wantsVegan = diets.includes('vegan');
  const wantsPesc = diets.includes('pescatarian');

  return (d: Dish): boolean => {
    if (wantsVegan && !d.diet.includes('vegan')) return true;
    if (wantsVeg && !(d.diet.includes('vegetarian') || d.diet.includes('vegan'))) return true;
    if (
      wantsPesc &&
      !d.diet.includes('pescatarian') &&
      !d.diet.includes('vegetarian') &&
      !d.diet.includes('vegan') &&
      MEAT.includes(d.protein)
    ) {
      return true;
    }

    if (!termList.length) return false;
    const text = dishText(d);
    for (const term of termList) if (text.includes(term)) return true;
    return false;
  };
}

let active: ((d: Dish) => boolean) | null = null;
export const setActiveExcluder = (fn: ((d: Dish) => boolean) | null): void => {
  active = fn;
};
export const getActiveExcluder = (): ((d: Dish) => boolean) | null => active;
