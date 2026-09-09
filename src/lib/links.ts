import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Dish, isRestaurant, isTakeaway } from '@/engine/types';

// None of Just Eat, Deliveroo or Uber Eats expose a public menu feed, so the app
// can't pre-filter its deck to what a given postcode can actually order. What it
// can do is open each service scoped to the user's saved postcode (or its
// postcode prompt), so they land on real local menus in one tap. The postcode is
// stored only on the device and only ever appears in these delivery links and
// the Maps search — never sent anywhere else.
const pc = (postcode?: string): string =>
  (postcode || '').replace(/\s+/g, '').toUpperCase();

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

export type DeliveryService = 'justeat' | 'deliveroo' | 'ubereats';

export const DELIVERY_SERVICES: { key: DeliveryService; label: string }[] = [
  { key: 'justeat', label: 'Just Eat' },
  { key: 'deliveroo', label: 'Deliveroo' },
  { key: 'ubereats', label: 'Uber Eats' },
];

/** Open Just Eat: to the saved postcode's area page if we have one, else the
 *  matching cuisine landing page, else the home (postcode) prompt. */
export function justEatUrl(dish: Dish, postcode?: string): string {
  const p = pc(postcode);
  if (p) return `https://www.just-eat.co.uk/area/${encodeURIComponent(p)}`;
  const type = isTakeaway(dish) ? (dish as { takeawayType?: string }).takeawayType ?? '' : '';
  const slug = JUST_EAT_CUISINE[type];
  return slug ? `https://www.just-eat.co.uk/${slug}-takeaway` : 'https://www.just-eat.co.uk/';
}

/** Open Deliveroo, scoped to the saved postcode where possible. */
export function deliverooUrl(_dish: Dish, postcode?: string): string {
  const p = pc(postcode);
  return p ? `https://deliveroo.co.uk/?postcode=${encodeURIComponent(p)}` : 'https://deliveroo.co.uk/';
}

/** Open Uber Eats. Uber encodes location as an opaque token, so a raw postcode
 *  can't be injected — this lands on the address prompt. */
export function uberEatsUrl(_dish: Dish, _postcode?: string): string {
  return 'https://www.ubereats.com/gb';
}

export function deliveryUrl(service: DeliveryService, dish: Dish, postcode?: string): string {
  if (service === 'deliveroo') return deliverooUrl(dish, postcode);
  if (service === 'ubereats') return uberEatsUrl(dish, postcode);
  return justEatUrl(dish, postcode);
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

/** What to search for a given results dish. With a saved postcode the search is
 *  scoped to that area; otherwise it falls back to the device's "near me". */
export function findNearMeQuery(dish: Dish, postcode?: string): string {
  const where = postcode && postcode.trim() ? `near ${postcode.trim()}` : 'near me';
  if (isTakeaway(dish)) return `${dish.searchTerm} takeaway ${where}`;
  if (isRestaurant(dish)) return `${dish.searchTerm} restaurant ${where}`;
  return `${dish.name} ${where}`;
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
