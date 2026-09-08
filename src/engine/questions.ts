import { Dish, isHome, isRestaurant, isTakeaway } from './types';
import { hasFlavour } from './flavours';
import { hasOccasion } from './occasion';

export type Answers = Record<string, string>;

export interface AnswerOption {
  id: string;
  label: string;
  emoji?: string;
  /** Keep a dish only if this returns true. Omit for "no preference". */
  keep?: (d: Dish) => boolean;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  /** Only ask this question when it returns true for the answers so far. */
  when?: (a: Answers) => boolean;
  options: AnswerOption[];
}

const anyOf =
  <T,>(...vals: T[]) =>
  (v: T) =>
    vals.includes(v);

// ---- who is the pool right now, from the answers --------------------------
export const venueOf = (a: Answers): 'home' | 'takeaway' | 'restaurant' | 'any' => {
  if (a.q_where === 'out') return 'restaurant';
  if (a.q_where === 'in' && a.q_cook_order === 'takeaway') return 'takeaway';
  if (a.q_where === 'in' && a.q_cook_order === 'cook') return 'home';
  return 'any';
};

export const QUESTIONS: Record<string, Question> = {
  // ---------------------------------------------------------------- EVENING FIRST
  q_evening: {
    id: 'q_evening',
    title: 'What kind of evening is it?',
    subtitle: 'This sets the tone for everything that follows.',
    options: [
      { id: 'solo', label: 'Just me tonight', emoji: '🍽️', keep: (d) => hasOccasion(d, 'solo') },
      { id: 'nofuss', label: 'Just feed me — no fuss', emoji: '😮‍💨', keep: (d) => hasOccasion(d, 'nofuss') },
      { id: 'family', label: 'Feeding the household', emoji: '👨‍👩‍👧‍👦', keep: (d) => hasOccasion(d, 'family') },
      { id: 'date', label: 'Date night', emoji: '🕯️', keep: (d) => hasOccasion(d, 'date') },
      { id: 'special', label: 'Anniversary or big occasion', emoji: '🥂', keep: (d) => hasOccasion(d, 'special') },
      { id: 'any', label: 'Surprise me', emoji: '🎲' },
    ],
  },

  // ---------------------------------------------------------------- HEALTH LAYER
  q_health: {
    id: 'q_health',
    title: 'Thinking about healthy eating?',
    subtitle: 'No judgement — this just nudges the shortlist.',
    options: [
      { id: 'notfussed', label: 'Not fussed tonight', emoji: '🤗' },
      {
        id: 'mindful',
        label: 'Keeping it mindful',
        emoji: '🥗',
        keep: (d) =>
          d.richness !== 'hearty' ||
          d.mood.some((m) => m === 'light' || m === 'fresh' || m === 'healthy'),
      },
      {
        id: 'losing',
        label: 'Trying to lose weight',
        emoji: '🎯',
        keep: (d) =>
          d.richness === 'light' ||
          d.mood.some((m) => m === 'light' || m === 'fresh' || m === 'healthy'),
      },
    ],
  },

  q_plan: {
    id: 'q_plan',
    title: 'On a particular plan?',
    subtitle: 'We’ll show a rough score on every dish.',
    when: (a) => a.q_health === 'losing',
    options: [
      { id: 'sw', label: 'Slimming World', emoji: '🟢' },
      { id: 'ww', label: 'WeightWatchers', emoji: '🔵' },
      { id: 'cals', label: 'Counting calories', emoji: '🔢' },
      { id: 'lighter', label: 'No set plan — just lighter', emoji: '🍃' },
    ],
  },

  // ---------------------------------------------------------------- the fork
  q_where: {
    id: 'q_where',
    title: 'Where are you eating tonight?',
    subtitle: 'The big fork in the road.',
    options: [
      { id: 'in', label: 'Staying in', emoji: '🏠' },
      { id: 'out', label: 'Going out', emoji: '🍽️', keep: (d) => isRestaurant(d) },
    ],
  },

  q_cook_order: {
    id: 'q_cook_order',
    title: 'Cook, or order in?',
    when: (a) => a.q_where === 'in',
    options: [
      { id: 'cook', label: "I'll cook something", emoji: '🧑‍🍳', keep: (d) => isHome(d) },
      { id: 'takeaway', label: "Let's get a takeaway", emoji: '🛵', keep: (d) => isTakeaway(d) },
    ],
  },

  // ---------------------------------------------------------------- FLAVOUR FIRST
  q_vibe: {
    id: 'q_vibe',
    title: 'What are you in the mood for?',
    subtitle: 'Go on flavour, not country — we ask about that later.',
    options: [
      { id: 'fresh', label: 'Fresh & light', emoji: '🥗', keep: (d) => hasFlavour(d, 'fresh') },
      { id: 'zesty', label: 'Zingy & zesty', emoji: '🍋', keep: (d) => hasFlavour(d, 'zesty') },
      { id: 'herby', label: 'Bright & herby', emoji: '🌿', keep: (d) => hasFlavour(d, 'herby') },
      { id: 'warming', label: 'Warming & fragrant', emoji: '♨️', keep: (d) => hasFlavour(d, 'warming') },
      { id: 'spicy', label: 'Spicy & fiery', emoji: '🔥', keep: (d) => hasFlavour(d, 'spicy') },
      { id: 'holiday', label: 'Tastes of a holiday', emoji: '🏝️', keep: (d) => hasFlavour(d, 'holiday') },
      { id: 'smoky', label: 'Smoky & chargrilled', emoji: '🍖', keep: (d) => hasFlavour(d, 'smoky') },
      { id: 'savoury', label: 'Deep & savoury', emoji: '🍄', keep: (d) => hasFlavour(d, 'savoury') },
      { id: 'comforting', label: 'Comforting & cosy', emoji: '🫕', keep: (d) => hasFlavour(d, 'comforting') },
      { id: 'indulgent', label: 'Rich & indulgent', emoji: '🧀', keep: (d) => hasFlavour(d, 'indulgent') },
      { id: 'any', label: 'Surprise me', emoji: '🎲' },
    ],
  },

  // ---------------------------------------------------------------- effort (cook)
  q_effort: {
    id: 'q_effort',
    title: 'How much effort tonight?',
    when: (a) => venueOf(a) === 'home',
    options: [
      { id: 'quick', label: 'Quick & easy', emoji: '⚡', keep: (d) => isHome(d) && (d.effort === 'quick' || d.timeMinutes <= 30) },
      { id: 'medium', label: 'A bit more to it', emoji: '🍳', keep: (d) => isHome(d) && d.effort === 'medium' },
      { id: 'showoff', label: 'Show off my skills', emoji: '🎩', keep: (d) => isHome(d) && d.effort === 'showoff' },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
  },

  // ---------------------------------------------------------------- protein
  q_protein: {
    id: 'q_protein',
    title: 'Any protein in mind?',
    options: [
      { id: 'chicken', label: 'Chicken', emoji: '🍗', keep: (d) => d.protein === 'chicken' },
      { id: 'redmeat', label: 'Beef or lamb', emoji: '🥩', keep: (d) => anyOf('beef', 'lamb')(d.protein) },
      { id: 'pork', label: 'Pork', emoji: '🥓', keep: (d) => d.protein === 'pork' },
      { id: 'fish', label: 'Fish or seafood', emoji: '🐟', keep: (d) => anyOf('fish', 'seafood')(d.protein) },
      { id: 'veg', label: 'Vegetarian', emoji: '🥦', keep: (d) => d.diet.includes('vegetarian') || d.diet.includes('vegan') },
      { id: 'vegan', label: 'Vegan', emoji: '🌱', keep: (d) => d.diet.includes('vegan') },
      { id: 'any', label: 'No strong preference', emoji: '🤷' },
    ],
  },

  // ---------------------------------------------------------------- carb
  q_carb: {
    id: 'q_carb',
    title: 'Carb of choice?',
    when: (a) => venueOf(a) !== 'restaurant',
    options: [
      { id: 'pasta', label: 'Pasta', emoji: '🍝', keep: (d) => d.carb === 'pasta' },
      { id: 'rice', label: 'Rice', emoji: '🍚', keep: (d) => d.carb === 'rice' },
      { id: 'noodles', label: 'Noodles', emoji: '🍜', keep: (d) => d.carb === 'noodles' },
      { id: 'potato', label: 'Potato', emoji: '🥔', keep: (d) => d.carb === 'potato' },
      { id: 'bread', label: 'Bread or wrap', emoji: '🥖', keep: (d) => anyOf('bread', 'pastry')(d.carb) },
      { id: 'lowcarb', label: 'Keep it low-carb', emoji: '🥬', keep: (d) => anyOf('none', 'salad')(d.carb) },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
  },

  // ---------------------------------------------------------------- spice fine-tune
  q_spice: {
    id: 'q_spice',
    title: 'Where are you on spice?',
    when: (a) => a.q_vibe !== 'spicy',
    options: [
      { id: 'mild', label: 'Keep it mild', emoji: '😌', keep: (d) => d.spicy <= 1 },
      { id: 'kick', label: 'A bit of a kick', emoji: '🌶️', keep: (d) => d.spicy >= 1 && d.spicy <= 2 },
      { id: 'heat', label: 'Bring the heat', emoji: '🔥', keep: (d) => d.spicy >= 2 },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
  },

  // ---------------------------------------------------------------- portion
  q_hunger: {
    id: 'q_hunger',
    title: 'How hungry are you?',
    when: (a) => venueOf(a) !== 'restaurant',
    options: [
      { id: 'light', label: 'Just a light bite', emoji: '🌤️', keep: (d) => d.richness !== 'hearty' },
      { id: 'normal', label: 'Normal appetite', emoji: '🙂' },
      { id: 'famished', label: 'Absolutely starving', emoji: '🤤', keep: (d) => d.richness === 'hearty' },
    ],
  },

  // ---------------------------------------------------------------- cuisine — LATE
  q_style: {
    id: 'q_style',
    title: 'Now — any particular cuisine?',
    subtitle: 'Totally fine to leave it to chance.',
    options: [
      { id: 'italian', label: 'Italian', emoji: '🇮🇹', keep: (d) => d.cuisine === 'italian' },
      { id: 'indian', label: 'Indian & South Asian', emoji: '🇮🇳', keep: (d) => d.cuisine === 'indian' },
      { id: 'eastasian', label: 'Chinese, Thai & East Asian', emoji: '🥢', keep: (d) => d.cuisine === 'east-asian' },
      { id: 'mexican', label: 'Mexican & Tex-Mex', emoji: '🌮', keep: (d) => d.cuisine === 'mexican' },
      { id: 'british', label: 'British & American', emoji: '🍖', keep: (d) => anyOf('british', 'american', 'caribbean')(d.cuisine) },
      { id: 'med', label: 'Med & Middle Eastern', emoji: '🫒', keep: (d) => anyOf('med', 'middle-eastern', 'french')(d.cuisine) },
      { id: 'any', label: 'Surprise me', emoji: '🎲' },
    ],
  },

  // ---------------------------------------------------------------- one pan (cook)
  q_onepan: {
    id: 'q_onepan',
    title: 'Minimal washing up?',
    subtitle: 'One pan, one tray, done.',
    when: (a) => venueOf(a) === 'home',
    options: [
      { id: 'yes', label: 'Yes please', emoji: '🧽', keep: (d) => isHome(d) && d.onePan },
      { id: 'no', label: "Don't care about mess", emoji: '🍳' },
    ],
  },
};

/** The order questions are asked in; `when` skips any that don't apply. */
export const QUESTION_ORDER: string[] = [
  'q_evening',
  'q_health',
  'q_plan',
  'q_where',
  'q_cook_order',
  'q_vibe',
  'q_effort',
  'q_protein',
  'q_carb',
  'q_spice',
  'q_hunger',
  'q_style',
  'q_onepan',
];

export const FIRST_QUESTION_ID = 'q_evening';
