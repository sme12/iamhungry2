"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WeekUIState {
  collapsedTrips: number[];
  collapsedCategories: string[]; // "tripIndex-category"
  showOnlyUnchecked: boolean;
}

const DEFAULT_WEEK_STATE: WeekUIState = {
  collapsedTrips: [],
  collapsedCategories: [],
  showOnlyUnchecked: false,
};

interface ShoppingListUIState {
  _hasHydrated: boolean;
  weekStates: Record<string, WeekUIState>;
}

interface ShoppingListUIActions {
  setHasHydrated: (hydrated: boolean) => void;
  toggleTripCollapsed: (weekKey: string, tripIndex: number) => void;
  toggleCategoryCollapsed: (
    weekKey: string,
    tripIndex: number,
    category: string
  ) => void;
  toggleShowOnlyUnchecked: (weekKey: string) => void;
  getWeekState: (weekKey: string) => WeekUIState;
}

type ShoppingListUIStore = ShoppingListUIState & ShoppingListUIActions;

export const useShoppingListUIStore = create<ShoppingListUIStore>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      weekStates: {},

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      getWeekState: (weekKey) => {
        return get().weekStates[weekKey] ?? DEFAULT_WEEK_STATE;
      },

      toggleTripCollapsed: (weekKey, tripIndex) =>
        set((state) => {
          const weekState = state.weekStates[weekKey] ?? DEFAULT_WEEK_STATE;
          const isCollapsed = weekState.collapsedTrips.includes(tripIndex);

          return {
            weekStates: {
              ...state.weekStates,
              [weekKey]: {
                ...weekState,
                collapsedTrips: isCollapsed
                  ? weekState.collapsedTrips.filter((i) => i !== tripIndex)
                  : [...weekState.collapsedTrips, tripIndex],
              },
            },
          };
        }),

      toggleCategoryCollapsed: (weekKey, tripIndex, category) =>
        set((state) => {
          const weekState = state.weekStates[weekKey] ?? DEFAULT_WEEK_STATE;
          const compoundKey = `${tripIndex}-${category}`;
          const isCollapsed = weekState.collapsedCategories.includes(compoundKey);

          return {
            weekStates: {
              ...state.weekStates,
              [weekKey]: {
                ...weekState,
                collapsedCategories: isCollapsed
                  ? weekState.collapsedCategories.filter((k) => k !== compoundKey)
                  : [...weekState.collapsedCategories, compoundKey],
              },
            },
          };
        }),

      toggleShowOnlyUnchecked: (weekKey) =>
        set((state) => {
          const weekState = state.weekStates[weekKey] ?? DEFAULT_WEEK_STATE;

          return {
            weekStates: {
              ...state.weekStates,
              [weekKey]: {
                ...weekState,
                showOnlyUnchecked: !weekState.showOnlyUnchecked,
              },
            },
          };
        }),
    }),
    {
      name: "shopping-list-ui",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
