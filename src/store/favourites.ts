import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FavouritesState {
  /** dish ids, oldest-favourited first */
  ids: string[];
  hydrated: boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
}

export const useFavourites = create<FavouritesState>()(
  persist(
    (set) => ({
      ids: [],
      hydrated: false,
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
    }),
    {
      name: 'dinner-decider:favourites',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ ids: s.ids }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
