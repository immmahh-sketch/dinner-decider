import { Linking, Share } from 'react-native';
import { Dish } from '@/engine/types';

/**
 * Sharing a pick. The link points at a tiny landing page on GitHub Pages that
 * either deep-links straight into the app (dinnerdecider://dish/<id>) if it is
 * installed, or offers the App Store if not.
 */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6809964712';
export const SHARE_SITE = 'https://immmahh-sketch.github.io/dinner-decider';

export function dishLink(id: string): string {
  return `${SHARE_SITE}/d/?x=${encodeURIComponent(id)}`;
}

export function shareMessage(dish: Dish, from?: string): string {
  const who = from && from.trim() ? `${from.trim()} reckons ` : '';
  const opener = who ? `${who}we should have` : 'How about';
  return `${opener} ${dish.name} for dinner? 🍽️\n${dish.blurb}\n\nOpen it in Dinner Decider (or get the app):\n${dishLink(dish.id)}`;
}

/** Native share sheet (AirDrop, Messages, WhatsApp, Mail, …). */
export async function shareDish(dish: Dish, from?: string): Promise<void> {
  try {
    await Share.share(
      { message: shareMessage(dish, from), url: dishLink(dish.id) },
      { subject: `Dinner idea: ${dish.name}`, dialogTitle: 'Share this dinner' },
    );
  } catch {
    // user dismissed the sheet, or it is unavailable in this environment
  }
}

/** Jump straight into WhatsApp with the message pre-filled. Returns false if
 *  WhatsApp is not installed (callers can fall back to the share sheet). */
export async function shareDishToWhatsApp(dish: Dish, from?: string): Promise<boolean> {
  const url = `whatsapp://send?text=${encodeURIComponent(shareMessage(dish, from))}`;
  try {
    if (!(await Linking.canOpenURL(url))) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
