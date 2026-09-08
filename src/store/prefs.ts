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
  /** display name used when sharing a pick with someone */
  username: string;
  /** free-text "never show me this" ingredient terms, lowercased */
  avoid: string[];
  /** hard dietary requirements */
  diets: Diet[];
  /** allergens to screen out */
  allergens: Allergen[];
  setHideHowItWorks: (v: boolean) => void;
  setAdsRemoved: (v: boolean) => void;
  setUsername: (v: string) => void;
  addAvoid: (term: string) => void;
  removeAvoid: (term: string) => void;
  toggleDiet: (d: Diet) => void;
  toggleAllergen: (a: Allergen) => void;
}

const toggle = <T,>(list: T[], item: T): T[] =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      hideHowItWorks: false,
      adsRemoved: false,
      hydrated: false,
      username: '',
      avoid: [],
      diets: [],
      allergens: [],
      setHideHowItWorks: (v) => set({ hideHowItWorks: v }),
      setAdsRemoved: (v) => set({ adsRemoved: v }),
      setUsername: (v) => set({ username: v.slice(0, 24) }),
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
        username: s.username,
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
function syncExcluder(s: Pick<PrefsState, 'avoid' | 'diets' | 'allergens'>): void {
  setActiveExcluder(
    buildExcluder({ avoid: s.avoid, diets: s.diets, allergens: s.allergens }),
  );
}
syncExcluder(usePrefs.getState());
usePrefs.subscribe(syncExcluder);
