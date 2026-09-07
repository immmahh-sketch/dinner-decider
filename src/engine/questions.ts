import { Dish, isHome, isRestaurant, isTakeaway } from './types';

export interface AnswerOption {
  id: string;
  label: string;
  emoji?: string;
  /** Keep a dish only if this returns true. Omit for "no preference". */
  keep?: (d: Dish) => boolean;
  /** Force a particular next question (overrides Question.nextId). */
  nextId?: string | null;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  /** Only ask this question when it returns true for the answers so far. */
  when?: (answers: Record<string, string>) => boolean;
  options: AnswerOption[];
  /** Default next question id. null means "go to results". */
  nextId: string | null;
}

const anyOf =
  <T,>(...vals: T[]) =>
  (v: T) =>
    vals.includes(v);

export const QUESTIONS: Record<string, Question> = {
  // ---------------------------------------------------------------- root
  q_where: {
    id: 'q_where',
    title: 'Where are you eating tonight?',
    subtitle: 'This is the big fork in the road.',
    options: [
      { id: 'in', label: 'Staying in', emoji: '🏠', nextId: 'q_cook_order' },
      {
        id: 'out',
        label: 'Going out',
        emoji: '🍽️',
        keep: (d) => isRestaurant(d),
        nextId: 'qr_type',
      },
    ],
    nextId: 'q_cook_order',
  },

  q_cook_order: {
    id: 'q_cook_order',
    title: 'Cook, or order in?',
    options: [
      {
        id: 'cook',
        label: "I'll cook something",
        emoji: '🧑‍🍳',
        keep: (d) => isHome(d),
        nextId: 'qh_effort',
      },
      {
        id: 'takeaway',
        label: "Let's get a takeaway",
        emoji: '🛵',
        keep: (d) => isTakeaway(d),
        nextId: 'qt_type',
      },
    ],
    nextId: 'qh_effort',
  },

  // ---------------------------------------------------------------- cook at home
  qh_effort: {
    id: 'qh_effort',
    title: 'How much effort tonight?',
    options: [
      {
        id: 'quick',
        label: 'Quick & easy',
        emoji: '⚡',
        keep: (d) => isHome(d) && (d.effort === 'quick' || d.timeMinutes <= 30),
      },
      {
        id: 'medium',
        label: 'A bit more to it',
        emoji: '🍳',
        keep: (d) => isHome(d) && d.effort === 'medium',
      },
      {
        id: 'showoff',
        label: 'Show off my skills',
        emoji: '🎩',
        keep: (d) => isHome(d) && d.effort === 'showoff',
      },
    ],
    nextId: 'qh_mood',
  },

  qh_mood: {
    id: 'qh_mood',
    title: 'What are you in the mood for?',
    options: [
      {
        id: 'comfort',
        label: 'Proper comfort food',
        emoji: '🫕',
        keep: (d) => d.mood.includes('comfort') || d.mood.includes('indulgent') || d.richness === 'hearty',
      },
      {
        id: 'light',
        label: 'Something light & fresh',
        emoji: '🥗',
        keep: (d) => d.mood.includes('light') || d.mood.includes('fresh') || d.mood.includes('healthy') || d.richness === 'light',
      },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
    nextId: 'qh_style',
  },

  qh_style: {
    id: 'qh_style',
    title: 'Any particular style?',
    options: [
      { id: 'italian', label: 'Italian', emoji: '🇮🇹', keep: (d) => d.cuisine === 'italian' },
      { id: 'indian', label: 'Indian & South Asian', emoji: '🇮🇳', keep: (d) => d.cuisine === 'indian' },
      { id: 'eastasian', label: 'Chinese & East Asian', emoji: '🥢', keep: (d) => d.cuisine === 'east-asian' },
      { id: 'mexican', label: 'Mexican & Tex-Mex', emoji: '🌮', keep: (d) => d.cuisine === 'mexican' },
      {
        id: 'british',
        label: 'British & American classics',
        emoji: '🍖',
        keep: (d) => anyOf('british', 'american', 'caribbean')(d.cuisine),
      },
      {
        id: 'med',
        label: 'Med & Middle Eastern',
        emoji: '🫒',
        keep: (d) => anyOf('med', 'middle-eastern', 'french')(d.cuisine),
      },
      { id: 'any', label: 'Surprise me', emoji: '🎲' },
    ],
    nextId: 'qh_protein',
  },

  qh_protein: {
    id: 'qh_protein',
    title: 'Main protein?',
    options: [
      { id: 'chicken', label: 'Chicken', emoji: '🍗', keep: (d) => d.protein === 'chicken' },
      { id: 'redmeat', label: 'Beef or lamb', emoji: '🥩', keep: (d) => anyOf('beef', 'lamb')(d.protein) },
      { id: 'pork', label: 'Pork', emoji: '🥓', keep: (d) => d.protein === 'pork' },
      { id: 'fish', label: 'Fish or seafood', emoji: '🐟', keep: (d) => anyOf('fish', 'seafood')(d.protein) },
      { id: 'veg', label: 'Vegetarian', emoji: '🥦', keep: (d) => d.diet.includes('vegetarian') || d.diet.includes('vegan') },
      { id: 'vegan', label: 'Vegan', emoji: '🌱', keep: (d) => d.diet.includes('vegan') },
      { id: 'any', label: 'No strong preference', emoji: '🤷' },
    ],
    nextId: 'qh_carb',
  },

  qh_carb: {
    id: 'qh_carb',
    title: 'Carb of choice?',
    options: [
      { id: 'pasta', label: 'Pasta', emoji: '🍝', keep: (d) => d.carb === 'pasta' },
      { id: 'rice', label: 'Rice', emoji: '🍚', keep: (d) => d.carb === 'rice' },
      { id: 'noodles', label: 'Noodles', emoji: '🍜', keep: (d) => d.carb === 'noodles' },
      { id: 'potato', label: 'Potato', emoji: '🥔', keep: (d) => d.carb === 'potato' },
      { id: 'bread', label: 'Bread or wrap', emoji: '🥖', keep: (d) => anyOf('bread', 'pastry')(d.carb) },
      { id: 'lowcarb', label: 'Keep it low-carb', emoji: '🥬', keep: (d) => anyOf('none', 'salad')(d.carb) },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
    nextId: 'qh_spice',
  },

  qh_spice: {
    id: 'qh_spice',
    title: 'Spice level?',
    options: [
      { id: 'mild', label: 'Keep it mild', emoji: '😌', keep: (d) => d.spicy <= 1 },
      { id: 'kick', label: 'A bit of a kick', emoji: '🌶️', keep: (d) => d.spicy >= 1 && d.spicy <= 2 },
      { id: 'heat', label: 'Bring the heat', emoji: '🔥', keep: (d) => d.spicy >= 2 },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
    nextId: 'qh_format',
  },

  qh_format: {
    id: 'qh_format',
    title: 'How do you want to eat it?',
    options: [
      { id: 'bowl', label: 'Cosy bowl', emoji: '🍲', keep: (d) => anyOf('bowl', 'soup')(d.format) },
      { id: 'plate', label: 'Plated dinner', emoji: '🍽️', keep: (d) => d.format === 'plate' },
      { id: 'hands', label: 'Eat with my hands', emoji: '🙌', keep: (d) => d.format === 'handheld' },
      { id: 'sharing', label: 'Bits to share', emoji: '🫱', keep: (d) => d.format === 'sharing' },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
    nextId: 'qh_onepan',
  },

  qh_onepan: {
    id: 'qh_onepan',
    title: 'Minimal washing up?',
    subtitle: 'One pan, one tray, done.',
    options: [
      { id: 'yes', label: 'Yes please', emoji: '🧽', keep: (d) => isHome(d) && d.onePan },
      { id: 'no', label: "Don't care about mess", emoji: '🍳' },
    ],
    nextId: null,
  },

  // ---------------------------------------------------------------- takeaway
  qt_type: {
    id: 'qt_type',
    title: 'What kind of takeaway?',
    options: [
      { id: 'pizza', label: 'Pizza', emoji: '🍕', keep: (d) => isTakeaway(d) && d.takeawayType === 'pizza' },
      { id: 'indian', label: 'Indian', emoji: '🍛', keep: (d) => isTakeaway(d) && d.takeawayType === 'indian' },
      { id: 'chinese', label: 'Chinese', emoji: '🥡', keep: (d) => isTakeaway(d) && d.takeawayType === 'chinese' },
      { id: 'burger', label: 'Burgers', emoji: '🍔', keep: (d) => isTakeaway(d) && d.takeawayType === 'burger' },
      { id: 'chippy', label: 'Chip shop', emoji: '🍟', keep: (d) => isTakeaway(d) && d.takeawayType === 'chippy' },
      { id: 'kebab', label: 'Kebab', emoji: '🥙', keep: (d) => isTakeaway(d) && d.takeawayType === 'kebab' },
      { id: 'thai', label: 'Thai', emoji: '🍤', keep: (d) => isTakeaway(d) && d.takeawayType === 'thai' },
      { id: 'sushi', label: 'Sushi', emoji: '🍱', keep: (d) => isTakeaway(d) && d.takeawayType === 'sushi' },
      { id: 'mexican', label: 'Mexican', emoji: '🌯', keep: (d) => isTakeaway(d) && d.takeawayType === 'mexican' },
      { id: 'chicken', label: 'Fried chicken', emoji: '🍗', keep: (d) => isTakeaway(d) && d.takeawayType === 'fried-chicken' },
      { id: 'any', label: 'Surprise me', emoji: '🎲' },
    ],
    nextId: 'qt_hunger',
  },

  qt_hunger: {
    id: 'qt_hunger',
    title: 'How hungry are you?',
    options: [
      { id: 'starving', label: 'Absolutely starving', emoji: '🤤', keep: (d) => d.richness === 'hearty' },
      { id: 'normal', label: 'Normal appetite', emoji: '🙂' },
      { id: 'light', label: 'Just a light bite', emoji: '🌤️', keep: (d) => d.richness !== 'hearty' },
    ],
    nextId: 'qt_diet',
  },

  qt_diet: {
    id: 'qt_diet',
    title: 'Meat or meat-free?',
    options: [
      { id: 'meat', label: 'Meat', emoji: '🍖', keep: (d) => anyOf('chicken', 'beef', 'lamb', 'pork', 'mixed')(d.protein) },
      { id: 'fish', label: 'Fish or seafood', emoji: '🐟', keep: (d) => anyOf('fish', 'seafood')(d.protein) },
      { id: 'veggie', label: 'Vegetarian', emoji: '🥦', keep: (d) => d.diet.includes('vegetarian') || d.diet.includes('vegan') },
      { id: 'vegan', label: 'Vegan', emoji: '🌱', keep: (d) => d.diet.includes('vegan') },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
    nextId: 'qt_spice',
  },

  qt_spice: {
    id: 'qt_spice',
    title: 'Spice level?',
    options: [
      { id: 'mild', label: 'Keep it mild', emoji: '😌', keep: (d) => d.spicy <= 1 },
      { id: 'kick', label: 'A bit of a kick', emoji: '🌶️', keep: (d) => d.spicy >= 1 && d.spicy <= 2 },
      { id: 'heat', label: 'Bring the heat', emoji: '🔥', keep: (d) => d.spicy >= 2 },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
    nextId: 'qt_vibe',
  },

  qt_vibe: {
    id: 'qt_vibe',
    title: 'What is the vibe?',
    options: [
      { id: 'comfort', label: 'Comfort / indulgent', emoji: '🛋️', keep: (d) => d.mood.includes('comfort') || d.mood.includes('indulgent') },
      { id: 'lighter', label: 'A bit lighter', emoji: '🍃', keep: (d) => d.mood.includes('light') || d.mood.includes('fresh') || d.mood.includes('healthy') },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
    nextId: null,
  },

  // ---------------------------------------------------------------- restaurant
  qr_type: {
    id: 'qr_type',
    title: 'What type of place?',
    options: [
      { id: 'italian', label: 'Italian / trattoria', emoji: '🍝', keep: (d) => isRestaurant(d) && d.restaurantType === 'italian' },
      { id: 'indian', label: 'Indian', emoji: '🍛', keep: (d) => isRestaurant(d) && d.restaurantType === 'indian' },
      { id: 'asian', label: 'Pan-Asian', emoji: '🥢', keep: (d) => isRestaurant(d) && d.restaurantType === 'asian' },
      { id: 'grill', label: 'Steakhouse & grill', emoji: '🥩', keep: (d) => isRestaurant(d) && d.restaurantType === 'grill' },
      { id: 'gastropub', label: 'Gastropub', emoji: '🍺', keep: (d) => isRestaurant(d) && d.restaurantType === 'gastropub' },
      { id: 'mexican', label: 'Mexican', emoji: '🌮', keep: (d) => isRestaurant(d) && d.restaurantType === 'mexican' },
      { id: 'med', label: 'Mediterranean', emoji: '🫒', keep: (d) => isRestaurant(d) && d.restaurantType === 'med' },
      { id: 'seafood', label: 'Seafood', emoji: '🦞', keep: (d) => isRestaurant(d) && d.restaurantType === 'seafood' },
      { id: 'any', label: 'Surprise me', emoji: '🎲' },
    ],
    nextId: 'qr_occasion',
  },

  qr_occasion: {
    id: 'qr_occasion',
    title: 'What is the occasion?',
    options: [
      { id: 'casual', label: 'Casual bite', emoji: '👕', keep: (d) => isRestaurant(d) && d.priceTier <= 2 },
      { id: 'nice', label: 'Nice dinner out', emoji: '🍷', keep: (d) => isRestaurant(d) && d.priceTier >= 2 },
      { id: 'special', label: 'Special occasion', emoji: '🎉', keep: (d) => isRestaurant(d) && d.priceTier === 3 },
    ],
    nextId: 'qr_fancy',
  },

  qr_fancy: {
    id: 'qr_fancy',
    title: 'What are you fancying?',
    options: [
      { id: 'meat', label: 'A good bit of meat', emoji: '🍖', keep: (d) => anyOf('chicken', 'beef', 'lamb', 'pork')(d.protein) },
      { id: 'fish', label: 'Fish & seafood', emoji: '🐟', keep: (d) => anyOf('fish', 'seafood')(d.protein) },
      { id: 'pasta', label: 'Pasta & risotto', emoji: '🍝', keep: (d) => anyOf('pasta', 'rice')(d.carb) },
      { id: 'veggie', label: 'Veggie', emoji: '🥦', keep: (d) => d.diet.includes('vegetarian') || d.diet.includes('vegan') },
      { id: 'sharing', label: 'Sharing plates', emoji: '🫱', keep: (d) => d.format === 'sharing' },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
    nextId: 'qr_spice',
  },

  qr_spice: {
    id: 'qr_spice',
    title: 'Spice level?',
    options: [
      { id: 'mild', label: 'Keep it mild', emoji: '😌', keep: (d) => d.spicy <= 1 },
      { id: 'kick', label: 'A bit of a kick', emoji: '🌶️', keep: (d) => d.spicy >= 1 && d.spicy <= 2 },
      { id: 'heat', label: 'Bring the heat', emoji: '🔥', keep: (d) => d.spicy >= 2 },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
    nextId: 'qr_vibe',
  },

  qr_vibe: {
    id: 'qr_vibe',
    title: 'Comfort or lighter?',
    options: [
      { id: 'comfort', label: 'Rich & comforting', emoji: '🫕', keep: (d) => d.richness !== 'light' },
      { id: 'lighter', label: 'On the lighter side', emoji: '🍃', keep: (d) => d.richness !== 'hearty' },
      { id: 'any', label: "Don't mind", emoji: '🤷' },
    ],
    nextId: null,
  },
};

export const FIRST_QUESTION_ID = 'q_where';
