import { create } from 'zustand';

/**
 * A one-shot handoff from /wheel-build to /wheel: the dish ids the user
 * picked from their favourites to spin between. Not persisted -- it's set
 * right before navigating and read once the wheel screen mounts.
 */
interface WheelPicksState {
  customIds: string[] | null;
  setCustomIds: (ids: string[] | null) => void;
}

export const useWheelPicks = create<WheelPicksState>((set) => ({
  customIds: null,
  setCustomIds: (ids) => set({ customIds: ids }),
}));
