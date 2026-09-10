import { Dish, Occasion, isHome, isRestaurant, isTakeaway } from './types';

export const OCCASION_META: Record<Occasion, { label: string; emoji: string; blurb: string }> = {
  solo: { label: 'Just me tonight', emoji: '🍽️', blurb: 'Cooking / ordering for one' },
  nofuss: { label: 'Just feed me', emoji: '😮‍💨', blurb: 'Fast, easy, no faff' },
  family: { label: 'Feeding the household', emoji: '👨‍👩‍👧‍👦', blurb: 'Crowd-pleaser for the table' },
  date: { label: 'Date night', emoji: '🕯️', blurb: 'A step up, a bit special' },
  special: { label: 'Anniversary or big occasion', emoji: '🥂', blurb: 'Pull out all the stops' },
};

/** Order the evening question shows them in. */
export const OCCASION_ORDER: Occasion[] = ['solo', 'nofuss', 'family', 'date', 'special'];

const KEYWORDS: Record<Occasion, RegExp> = {
  solo: /\b(for one|single serve|single-serve|solo|desk lunch|one bowl|quick bowl|on toast|instant)\b/,
  nofuss:
    /\b(5-minute|10-minute|15-minute|speedy|quick|no-cook|no cook|store ?cupboard|storecupboard|assembly|weeknight|midweek|lazy|freezer|10 minutes|ready in|fuss-free|one-pan|one pan|one-pot|one pot|traybake|tray bake)\b/,
  family:
    /\b(family|feeds a crowd|crowd|sharing platter|share|kids|children|batch|make-ahead|make ahead|freezer-friendly|roast|bake|casserole|one-pot|one pot|traybake|tray bake|feeds \d)\b/,
  date:
    /\b(for two|for 2|sharing|to share|date night|candlelit|candle|romantic|elegant|bistro|steak for two|fondue|tapas|small plates|sharing board)\b/,
  special:
    /\b(wellington|chateaubriand|ch[aâ]teaubriand|fillet steak|fillet of beef|rib-?eye|ribeye|tomahawk|t-bone|lobster|langoustine|scallop|turbot|dover sole|monkfish|truffle|caviar|oyster|oysters|foie gras|wagyu|dry-aged|aged beef|tasting menu|showstopper|show-stopper|centrepiece|centerpiece|celebration|feast|whole roast|crown of|rack of lamb|beef bourguignon|champagne|prosecco|surf and turf|surf & turf|baked alaska|croquembouche)\b/,
};

const cache = new WeakMap<object, Occasion[]>();

/** Derive the occasion tags for a dish from its fields + wording. Cached per dish object. */
export function deriveOccasions(dish: Dish): Occasion[] {
  if (dish.occasions && dish.occasions.length) return dish.occasions;
  const cached = cache.get(dish);
  if (cached) return cached;

  const text = [
    dish.name,
    dish.blurb,
    // Hosted home dishes arrive as lightweight "cards" with no `ingredients`
    // array (engine/hydrate rebuilds it on demand), so guard the access.
    isHome(dish) && Array.isArray(dish.ingredients) ? dish.ingredients.join(' ') : '',
    'searchTerm' in dish ? String((dish as { searchTerm?: string }).searchTerm ?? '') : '',
  ]
    .join(' ')
    .toLowerCase();

  const set = new Set<Occasion>();
  (Object.keys(KEYWORDS) as Occasion[]).forEach((o) => {
    if (KEYWORDS[o].test(text)) set.add(o);
  });

  const fancy = dish.mood.includes('fancy');
  const indulgent = dish.mood.includes('indulgent');
  const light = dish.mood.includes('light') || dish.mood.includes('healthy') || dish.mood.includes('fresh');
  const sharing = dish.format === 'sharing';

  if (isHome(dish)) {
    const quick = dish.effort === 'quick' || dish.timeMinutes <= 25;
    const midEffort = dish.effort === 'medium';
    const showoff = dish.effort === 'showoff';

    // solo — doable for one, not a two-hour project, not a giant sharing feast
    if (!sharing && !showoff && dish.timeMinutes <= 55) set.add('solo');
    // nofuss — fast or one-pan
    if (quick || dish.onePan) set.add('nofuss');
    // family — scales up, crowd-friendly, not blistering, not delicate-fancy
    if (dish.servings >= 4 && dish.spicy <= 2 && !fancy) set.add('family');
    // date — a step up, still doable at home, portioned for a couple
    if ((midEffort || showoff || indulgent || fancy) && dish.spicy <= 2 && dish.servings <= 4) {
      set.add('date');
    }
    // special — a genuine showstopper
    if (showoff || fancy || (indulgent && dish.richness === 'hearty' && (midEffort || showoff))) {
      set.add('special');
    }
  } else if (isTakeaway(dish)) {
    const casualType = /burger|chippy|kebab|fried-chicken|fried chicken/.test(dish.takeawayType);
    // takeaway is the definition of no-fuss
    set.add('nofuss');
    if (!sharing) set.add('solo');
    if (dish.spicy <= 2) set.add('family');
    if (!casualType) set.add('date');
    if (sharing || dish.takeawayType === 'sushi' || (indulgent && dish.richness === 'hearty')) {
      set.add('special');
    }
  } else if (isRestaurant(dish)) {
    const p = dish.priceTier;
    if (p <= 2) set.add('solo');
    if (p === 1) set.add('nofuss');
    if (p <= 2 && dish.spicy <= 2) set.add('family');
    if (p >= 2) set.add('date');
    if (p === 3 || (p === 2 && fancy)) set.add('special');
  }

  // never let a dish suit no evening at all
  if (set.size === 0) {
    set.add('solo');
    set.add('nofuss');
    if (light) set.add('family');
  }

  const result = [...set];
  cache.set(dish, result);
  return result;
}

export function hasOccasion(dish: Dish, occasion: Occasion): boolean {
  return deriveOccasions(dish).includes(occasion);
}
