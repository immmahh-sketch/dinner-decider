import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PrefsState {
  hideHowItWorks: boolean;
  adsRemoved: boolean;
  hydrated: boolean;
  setHideHowItWorks: (v: boolean) => void;
  setAdsRemoved: (v: boolean) => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      hideHowItWorks: false,
      adsRemoved: false,
      hydrated: false,
      setHideHowItWorks: (v) => set({ hideHowItWorks: v }),
      setAdsRemoved: (v) => set({ adsRemoved: v }),
    }),
    {
      name: 'dinner-decider:prefs',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ hideHowItWorks: s.hideHowItWorks, adsRemoved: s.adsRemoved }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
