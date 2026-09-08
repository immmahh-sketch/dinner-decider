import { Dish, Flavour, isHome } from './types';

export const FLAVOUR_META: Record<Flavour, { label: string; emoji: string; blurb: string }> = {
  fresh: { label: 'Fresh & light', emoji: '🥗', blurb: 'Crisp, green, not heavy' },
  zesty: { label: 'Zingy & zesty', emoji: '🍋', blurb: 'Citrus, sharp, pickled' },
  herby: { label: 'Bright & herby', emoji: '🌿', blurb: 'Loads of fresh herbs' },
  spicy: { label: 'Spicy & fiery', emoji: '🔥', blurb: 'Proper chilli heat' },
  warming: { label: 'Warming & fragrant', emoji: '♨️', blurb: 'Gentle spice, cosy warmth' },
  comforting: { label: 'Comforting & cosy', emoji: '🫕', blurb: 'Carby, creamy, familiar' },
  indulgent: { label: 'Rich & indulgent', emoji: '🧀', blurb: 'Cheesy, fried, decadent' },
  smoky: { label: 'Smoky & chargrilled', emoji: '🍖', blurb: 'Barbecue, char, smoke' },
  savoury: { label: 'Deep & savoury', emoji: '🍄', blurb: 'Umami, slow-cooked, moreish' },
  holiday: { label: 'Tastes of a holiday', emoji: '🏝️', blurb: 'Sunshine on a plate' },
};

/** Order the vibe question shows them in. */
export const FLAVOUR_ORDER: Flavour[] = [
  'fresh',
  'zesty',
  'herby',
  'warming',
  'spicy',
  'holiday',
  'smoky',
  'savoury',
  'comforting',
  'indulgent',
];

const KEYWORDS: Record<Flavour, RegExp> = {
  fresh:
    /\b(salad|slaw|steamed|raw|crisp|cucumber|leaves|rocket|lettuce|crudit|ceviche|poke|carpaccio|tabbouleh|fattoush|greens|pea shoot|courgette ribbon)\b/,
  zesty:
    /\b(lemon|lime|citrus|zest|yuzu|ponzu|vinegar|pickle|pickled|tamarind|sumac|verjus|preserved lemon|gremolata|caper|sharp|tangy|sour)\b/,
  herby:
    /\b(basil|coriander|cilantro|parsley|mint|dill|chives|tarragon|oregano|pesto|chimichurri|salsa verde|za'?atar|herb|gremolata|holy basil|thai basil)\b/,
  spicy:
    /\b(chilli|chili|jalapeno|jalapeño|scotch bonnet|habanero|sriracha|harissa|gochujang|n'?duja|nduja|vindaloo|madras|jalfrezi|arrabbiata|diavola|piri ?piri|nashville|buffalo|fiery|extra hot|szechuan|sichuan|dragon|firecracker|kung pao|drunken noodle)\b/,
  warming:
    /\b(cinnamon|cumin|turmeric|garam masala|masala|curry|korma|tikka|rogan|biryani|tagine|ginger|star anise|cardamom|clove|ras el hanout|five ?spice|mulled|chai|dal|dhal|katsu)\b/,
  comforting:
    /\b(mash|mac and cheese|macaroni|pie|stew|hotpot|bake|baked|risotto|carbonara|lasagne|lasagna|gratin|dauphinoise|dumpling|casserole|chowder|cottage|shepherd|toad in the hole|hot ?pot|congee|porridge|noodle soup|pot pie|meatloaf|bangers)\b/,
  indulgent:
    /\b(fried|deep-fried|crispy|crunchy|bacon|double cheese|cheeseburger|smash burger|parmigiana|parmesan|triple cooked|loaded|nduja|brisket|short rib|pork belly|duck fat|katsu|karaage|schnitzel|buttermilk|mac and cheese|poutine|nacho|tempura)\b/,
  smoky:
    /\b(bbq|barbecue|barbeque|smoked|smoky|chargrill|char-grill|char grill|charred|grilled|flame|jerk|tandoor|tandoori|brisket|chorizo|paprika|pit|coal|ember|robata|yakitori|souvlaki|shish)\b/,
  savoury:
    /\b(soy|miso|mushroom|shiitake|porcini|anchovy|fish sauce|oyster sauce|marmite|umami|ragu|ragù|bolognese|slow-cook|slow cook|braise|braised|gravy|stock|bone broth|beef shin|oxtail|black bean|hoisin|dashi|worcestershire)\b/,
  holiday:
    /\b(coconut|mango|pineapple|jerk|paella|souvlaki|mezze|meze|taco|burrito|quesadilla|fajita|tapas|halloumi|feta|olive|tzatziki|satay|pad thai|banh mi|pho|nasi|rendang|jambalaya|gazpacho|caprese|mojo|piña|tostada|elote)\b/,
};

const CUISINE_FLAVOURS: Partial<Record<string, Flavour[]>> = {
  indian: ['warming'],
  'middle-eastern': ['holiday', 'herby'],
  med: ['holiday', 'fresh'],
  mexican: ['holiday'],
  caribbean: ['holiday', 'smoky'],
  'east-asian': ['savoury'],
};

const cache = new WeakMap<object, Flavour[]>();

/** Derive the flavour tags for a dish from its fields + wording. Cached per dish object. */
export function deriveFlavours(dish: Dish): Flavour[] {
  if (dish.flavours && dish.flavours.length) return dish.flavours;
  const cached = cache.get(dish);
  if (cached) return cached;

  const text = [
    dish.name,
    dish.blurb,
    isHome(dish) ? dish.ingredients.join(' ') : '',
    'searchTerm' in dish ? String((dish as { searchTerm?: string }).searchTerm ?? '') : '',
  ]
    .join(' ')
    .toLowerCase();

  const set = new Set<Flavour>();

  (Object.keys(KEYWORDS) as Flavour[]).forEach((f) => {
    if (KEYWORDS[f].test(text)) set.add(f);
  });

  // structural rules from existing tags
  if (dish.spicy >= 2) set.add('spicy');
  if (dish.spicy === 1) set.add('warming');
  if (dish.mood.includes('light') || dish.mood.includes('fresh') || dish.mood.includes('healthy')) {
    set.add('fresh');
  }
  if (dish.mood.includes('indulgent')) set.add('indulgent');
  if (dish.richness === 'hearty' && (dish.mood.includes('comfort') || dish.carb !== 'none')) {
    set.add('comforting');
  }
  (CUISINE_FLAVOURS[dish.cuisine] ?? []).forEach((f) => set.add(f));

  // never let a dish be totally flavourless
  if (set.size === 0) {
    set.add(dish.richness === 'light' ? 'fresh' : 'comforting');
  }

  const result = [...set];
  cache.set(dish, result);
  return result;
}

export function hasFlavour(dish: Dish, flavour: Flavour): boolean {
  return deriveFlavours(dish).includes(flavour);
}
