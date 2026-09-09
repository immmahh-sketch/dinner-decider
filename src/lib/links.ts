import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Dish, isRestaurant, isTakeaway } from '@/engine/types';

// Just Eat has no public menu API, so the app can't pre-filter its deck to what
// a given postcode can actually order. What it can do is drop the user on the
// right cuisine page, where they enter their postcode and see real local menus.
// Their address never leaves the device — Just Eat asks for it, we don't.
const JUST_EAT_CUISINE: Record<string, string> = {
  pizza: 'pizza',
  italian: 'italian',
  indian: 'indian',
  chinese: 'chinese',
  thai: 'thai',
  japanese: 'japanese',
  sushi: 'sushi',
  korean: 'korean',
  vietnamese: 'vietnamese',
  burger: 'burgers',
  kebab: 'kebab',
  'peri-peri': 'peri-peri',
  'middle-eastern': 'lebanese',
  greek: 'greek',
  turkish: 'turkish',
  caribbean: 'caribbean',
  mexican: 'mexican',
  'fried-chicken': 'chicken',
  chippy: 'fish-and-chips',
  deli: 'sandwiches',
  healthy: 'healthy',
};

/** Deep link into Just Eat for this kind of takeaway. Falls back to the Just
 *  Eat home page (postcode prompt) when the cuisine isn't mapped. */
export function justEatUrl(dish: Dish): string {
  const type = isTakeaway(dish) ? (dish as { takeawayType?: string }).takeawayType ?? '' : '';
  const slug = JUST_EAT_CUISINE[type];
  return slug
    ? `https://www.just-eat.co.uk/${slug}-takeaway`
    : 'https://www.just-eat.co.uk/';
}

/**
 * Build a Google Maps "near me" search for a dish + venue type.
 * Maps uses the device's own location for "near me", so we never send coordinates.
 */
export function mapsSearchUrl(query: string): string {
  const q = encodeURIComponent(query.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function webSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
}

/** What to search for a given results dish. */
export function findNearMeQuery(dish: Dish): string {
  if (isTakeaway(dish)) {
    return `${dish.searchTerm} takeaway near me`;
  }
  if (isRestaurant(dish)) {
    return `${dish.searchTerm} restaurant near me`;
  }
  return `${dish.name} near me`;
}

export async function openExternal(url: string) {
  try {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      toolbarColor: '#EEF2F6',
      controlsColor: '#0FB5A6',
    });
  } catch {
    // no-op: browser not available (e.g. in a test env)
  }
}

/** Placeholder for the future "order now" affiliate deep-link. */
export function orderNowUrl(dish: Dish): string {
  // Future: swap for a Just Eat / Deliveroo affiliate link with a partner tag.
  const q =
    'searchTerm' in dish ? (dish as { searchTerm: string }).searchTerm : dish.name;
  return webSearchUrl(`order ${q} delivery near me`);
}

export const isWeb = Platform.OS === 'web';
