import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ShoppingItem {
  id: string;
  text: string;
  dishId: string;
  dishName: string;
  checked: boolean;
}

interface ShoppingState {
  items: ShoppingItem[];
  hydrated: boolean;
  addForDish: (dishId: string, dishName: string, lines: string[]) => number;
  hasDish: (dishId: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
}

const keyOf = (dishId: string, text: string) =>
  `${dishId}::${text.trim().toLowerCase()}`;

export const useShoppingList = create<ShoppingState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      addForDish: (dishId, dishName, lines) => {
        const existing = new Set(get().items.map((i) => keyOf(i.dishId, i.text)));
        const fresh = lines
          .map((l) => l.trim())
          .filter((l) => l.length > 0 && !existing.has(keyOf(dishId, l)))
          .map((l, idx) => ({
            id: `${dishId}-${Date.now()}-${idx}`,
            text: l,
            dishId,
            dishName,
            checked: false,
          }));
        if (fresh.length) set({ items: [...get().items, ...fresh] });
        return fresh.length;
      },

      hasDish: (dishId) => get().items.some((i) => i.dishId === dishId),

      toggle: (id) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, checked: !i.checked } : i,
          ),
        }),

      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      clearChecked: () => set({ items: get().items.filter((i) => !i.checked) }),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'dinner-decider:shopping',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
