"use client";

import { useState, useCallback } from "react";
import type { AppState, Day, Meal } from "@/schemas/appState";
import type { DayPlan, MealSlot, ShoppingTrip } from "@/schemas/mealPlanResponse";

export type GenerationStage =
  | "idle" // Initial, form ready
  | "generating-plan" // Loading meal plan
  | "plan-ready" // Plan received, awaiting user confirm
  | "generating-shopping" // Loading shopping list
  | "complete"; // Both ready

interface GenerationState {
  stage: GenerationStage;
  weekPlan: DayPlan[] | null;
  shoppingTrips: ShoppingTrip[] | null;
  selectedSlots: Set<string>; // format: "mon-breakfast"
  error: string | null;
}

interface UseMealPlanGenerationReturn {
  stage: GenerationStage;
  weekPlan: DayPlan[] | null;
  shoppingTrips: ShoppingTrip[] | null;
  selectedSlots: Set<string>;
  error: string | null;

  generatePlan: (appState: AppState) => Promise<void>;
  confirmPlan: (appState: AppState) => Promise<void>;
  regeneratePlan: (appState: AppState) => Promise<void>;
  reset: () => void;
  resetToPlanStage: () => void;
  toggleSlot: (day: Day, meal: Meal) => void;
  clearSelection: () => void;
}

const initialState: GenerationState = {
  stage: "idle",
  weekPlan: null,
  shoppingTrips: null,
  selectedSlots: new Set(),
  error: null,
};

export function useMealPlanGeneration(): UseMealPlanGenerationReturn {
  const [state, setState] = useState<GenerationState>(initialState);

  const generatePlan = useCallback(async (appState: AppState) => {
    setState((s) => ({ ...s, stage: "generating-plan", error: null }));

    try {
      const res = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appState }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const { weekPlan } = await res.json();
      setState({
        stage: "plan-ready",
        weekPlan,
        shoppingTrips: null,
        selectedSlots: new Set(),
        error: null,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setState((s) => ({ ...s, stage: "idle", error: message }));
    }
  }, []);

  const confirmPlan = useCallback(
    async (appState: AppState) => {
      if (!state.weekPlan) return;

      setState((s) => ({ ...s, stage: "generating-shopping", error: null }));

      try {
        const res = await fetch("/api/generate-shopping-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekPlan: state.weekPlan, appState }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Shopping list generation failed");
        }

        const { shoppingTrips } = await res.json();
        setState((s) => ({ ...s, stage: "complete", shoppingTrips }));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        setState((s) => ({ ...s, stage: "plan-ready", error: message }));
      }
    },
    [state.weekPlan]
  );

  const regeneratePlan = useCallback(
    async (appState: AppState) => {
      const currentPlan = state.weekPlan;
      const selectedSlots = state.selectedSlots;

      setState((s) => ({
        ...s,
        stage: "generating-plan",
        shoppingTrips: null,
        error: null,
      }));

      // Build regenerateSlots array from selected slots
      const regenerateSlots: MealSlot[] = Array.from(selectedSlots).map(
        (slotKey) => {
          const [day, meal] = slotKey.split("-") as [Day, Meal];
          return { day, meal };
        }
      );

      try {
        const res = await fetch("/api/generate-meal-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appState,
            currentPlan: regenerateSlots.length > 0 ? currentPlan : undefined,
            regenerateSlots: regenerateSlots.length > 0 ? regenerateSlots : undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Regeneration failed");
        }

        const { weekPlan } = await res.json();
        setState({
          stage: "plan-ready",
          weekPlan,
          shoppingTrips: null,
          selectedSlots: new Set(),
          error: null,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        setState((s) => ({ ...s, stage: "plan-ready", error: message }));
      }
    },
    [state.weekPlan, state.selectedSlots]
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const resetToPlanStage = useCallback(() => {
    setState((s) => ({
      ...s,
      stage: "plan-ready",
      shoppingTrips: null,
      error: null,
    }));
  }, []);

  const toggleSlot = useCallback((day: Day, meal: Meal) => {
    const slotKey = `${day}-${meal}`;
    setState((s) => {
      const newSet = new Set(s.selectedSlots);
      if (newSet.has(slotKey)) {
        newSet.delete(slotKey);
      } else {
        newSet.add(slotKey);
      }
      return { ...s, selectedSlots: newSet };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState((s) => ({ ...s, selectedSlots: new Set() }));
  }, []);

  return {
    stage: state.stage,
    weekPlan: state.weekPlan,
    shoppingTrips: state.shoppingTrips,
    selectedSlots: state.selectedSlots,
    error: state.error,
    generatePlan,
    confirmPlan,
    regeneratePlan,
    reset,
    resetToPlanStage,
    toggleSlot,
    clearSelection,
  };
}
