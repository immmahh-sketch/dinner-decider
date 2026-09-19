import { create } from 'zustand';

/**
 * "Tonight's wheel" -- the dishes currently queued to spin between. Grows as
 * the user hearts a favourite, taps the 🎡 quick-add on a search result, or
 * ticks a box on /wheel-build; read (and cleared) once by /wheel on mount so
 * a later plain "Spin the wheel" from the home screen starts fresh instead
 * of reusing a stale pick. Not persisted -- it's a working set, not a saved
 * list (favourites is the saved list).
 */
interface WheelPicksState {
  ids: string[];
  toggle: (id: string) => void;
  set: (ids: string[]) => void;
  clear: () => void;
}

export const useWheelPicks = create<WheelPicksState>((set) => ({
  ids: [],
  toggle: (id) =>
    set((s) => ({
      ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
    })),
  set: (ids) => set({ ids }),
  clear: () => set({ ids: [] }),
}));
