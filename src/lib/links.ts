import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Dish, isRestaurant, isTakeaway } from '@/engine/types';

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
