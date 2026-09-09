import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Diet } from '@/engine/types';
import { buildExcluder, setActiveExcluder } from '@/engine/exclude';

export type Allergen =
  | 'nuts'
  | 'peanuts'
  | 'dairy'
  | 'gluten'
  | 'egg'
  | 'shellfish'
  | 'fish'
  | 'soy'
  | 'sesame';

export const ALLERGENS: { key: Allergen; label: string }[] = [
  { key: 'nuts', label: 'Tree nuts' },
  { key: 'peanuts', label: 'Peanuts' },
  { key: 'dairy', label: 'Dairy' },
  { key: 'gluten', label: 'Gluten' },
  { key: 'egg', label: 'Egg' },
  { key: 'shellfish', label: 'Shellfish' },
  { key: 'fish', label: 'Fish' },
  { key: 'soy', label: 'Soy' },
  { key: 'sesame', label: 'Sesame' },
];

export const DIETS: { key: Diet; label: string }[] = [
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'pescatarian', label: 'Pescatarian' },
  { key: 'gluten-free', label: 'Gluten-free' },
  { key: 'dairy-free', label: 'Dairy-free' },
];

interface PrefsState {
  hideHowItWorks: boolean;
  adsRemoved: boolean;
  hydrated: boolean;
  /** true once the first-run setup screen has been seen (or skipped) */
  onboarded: boolean;
  /** display name used when sharing a pick with someone */
  username: string;
  /** UK postcode — stored ONLY on this device, used to open delivery apps
   *  and local searches for the right area. Never sent anywhere else. */
  postcode: string;
  /** free-text "never show me this" ingredient terms, lowercased */
  avoid: string[];
  /** hard dietary requirements */
  diets: Diet[];
  /** allergens to screen out */
  allergens: Allergen[];
  setHideHowItWorks: (v: boolean) => void;
  setAdsRemoved: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  setUsername: (v: string) => void;
  setPostcode: (v: string) => void;
  addAvoid: (term: string) => void;
  removeAvoid: (term: string) => void;
  toggleDiet: (d: Diet) => void;
  toggleAllergen: (a: Allergen) => void;
}

const toggle = <T,>(list: T[], item: T): T[] =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

/** Tidy a typed postcode: uppercase, single gap before the last 3 chars. */
export function tidyPostcode(v: string): string {
  const raw = v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  if (raw.length <= 3) return raw;
  return `${raw.slice(0, -3)} ${raw.slice(-3)}`;
}

/** Loose UK-postcode shape check, for gentle UI feedback only. */
export function looksLikePostcode(v: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(v.trim());
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      hideHowItWorks: false,
      adsRemoved: false,
      hydrated: false,
      onboarded: false,
      username: '',
      postcode: '',
      avoid: [],
      diets: [],
      allergens: [],
      setHideHowItWorks: (v) => set({ hideHowItWorks: v }),
      setAdsRemoved: (v) => set({ adsRemoved: v }),
      setOnboarded: (v) => set({ onboarded: v }),
      setUsername: (v) => set({ username: v.slice(0, 24) }),
      setPostcode: (v) => set({ postcode: tidyPostcode(v) }),
      addAvoid: (term) =>
        set((s) => {
          const clean = term.toLowerCase().trim();
          if (!clean || s.avoid.includes(clean)) return s;
          return { avoid: [...s.avoid, clean].slice(0, 40) };
        }),
      removeAvoid: (term) => set((s) => ({ avoid: s.avoid.filter((x) => x !== term) })),
      toggleDiet: (d) => set((s) => ({ diets: toggle(s.diets, d) })),
      toggleAllergen: (a) => set((s) => ({ allergens: toggle(s.allergens, a) })),
    }),
    {
      name: 'dinner-decider:prefs',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        hideHowItWorks: s.hideHowItWorks,
        adsRemoved: s.adsRemoved,
        onboarded: s.onboarded,
        username: s.username,
        postcode: s.postcode,
        avoid: s.avoid,
        diets: s.diets,
        allergens: s.allergens,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
          syncExcluder(state);
        }
      },
    },
  ),
);

// ---- keep the always-on deal-breaker filter in step with prefs ------------
// Wrapped defensively: this runs at module load and on every prefs change, and
// it must never be able to take the whole app down.
function syncExcluder(s: Pick<PrefsState, 'avoid' | 'diets' | 'allergens'>): void {
  try {
    setActiveExcluder(
      buildExcluder({
        avoid: s.avoid ?? [],
        diets: s.diets ?? [],
        allergens: s.allergens ?? [],
      }),
    );
  } catch {
    setActiveExcluder(null);
  }
}
try {
  syncExcluder(usePrefs.getState());
  usePrefs.subscribe(syncExcluder);
} catch {
  /* deal-breaker filtering just stays off until a prefs change re-tries */
}
