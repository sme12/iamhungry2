"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppState, CuisineId, Day, Meal, PersonWeekSchedule } from "@/schemas/appState";
import type { PersonId } from "@/config/defaults";
import type { WeekOption } from "@/components/WeekSelector";
import {
  getCurrentWeekInfo,
  getNextWeekKey,
  getPlanKey,
  getWeekInfoByKey,
} from "@/utils/weekNumber";
import { useScheduleStore } from "@/stores/useScheduleStore";

interface UseScheduleReturn {
  schedules: {
    vitalik: PersonWeekSchedule;
    lena: PersonWeekSchedule;
  };
  selectedCuisines: CuisineId[];
  specialConditions: string;
  weekOption: WeekOption;
  customWeekNumber: number | null;
  currentWeekNumber: number;
  nextWeekNumber: number;

  toggleSlot: (person: PersonId, day: Day, meal: Meal) => void;
  toggleCuisine: (cuisineId: CuisineId) => void;
  setSpecialConditions: (value: string) => void;
  setWeekOption: (option: WeekOption) => void;
  setCustomWeekNumber: (num: number | null) => void;

  getAppState: () => AppState;
  getSelectedWeekKey: () => string;
  isValid: boolean;
  hasHydrated: boolean;
}

/**
 * Provides schedule state, derived week information, and action handlers used by the scheduling UI.
 *
 * @returns An object containing:
 * - `schedules`: current week schedules for each person,
 * - `selectedCuisines`: array of chosen cuisine IDs,
 * - `specialConditions`: free-form special conditions text,
 * - `weekOption` and `customWeekNumber`: selected week mode and custom week number (if any),
 * - `currentWeekNumber` and `nextWeekNumber`: computed week numbers for the selected/current context,
 * - action handlers: `toggleSlot`, `toggleCuisine`, `setSpecialConditions`, `setWeekOption`, `setCustomWeekNumber`,
 * - helpers: `getAppState` (returns the combined app state) and `getSelectedWeekKey` (resolves the active plan key),
 * - `isValid`: whether the current selection is valid, and
 * - `hasHydrated`: whether the store has completed hydration.
 */
export function useSchedule(): UseScheduleReturn {
  const schedules = useScheduleStore((state) => state.schedules);
  const selectedCuisines = useScheduleStore((state) => state.selectedCuisines);
  const specialConditions = useScheduleStore((state) => state.specialConditions);
  const weekOption = useScheduleStore((state) => state.weekOption);
  const customWeekNumber = useScheduleStore((state) => state.customWeekNumber);
  const hasHydrated = useScheduleStore((state) => state._hasHydrated);

  const toggleSlot = useScheduleStore((state) => state.toggleSlot);
  const toggleCuisine = useScheduleStore((state) => state.toggleCuisine);
  const setSpecialConditions = useScheduleStore((state) => state.setSpecialConditions);
  const setWeekOption = useScheduleStore((state) => state.setWeekOption);
  const setCustomWeekNumber = useScheduleStore((state) => state.setCustomWeekNumber);

  const [currentWeekInfo, setCurrentWeekInfo] = useState(getCurrentWeekInfo);

  useEffect(() => {
    const updateWeekInfo = () => {
      setCurrentWeekInfo(getCurrentWeekInfo());
    };

    // Check at midnight each day
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime();

    const midnightTimeout = setTimeout(() => {
      updateWeekInfo();
      // After first midnight, check every 24 hours
      const dailyInterval = setInterval(updateWeekInfo, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    // Update on visibility change and focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateWeekInfo();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", updateWeekInfo);

    return () => {
      clearTimeout(midnightTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", updateWeekInfo);
    };
  }, []);

  const currentWeekNumber = currentWeekInfo.weekNumber;
  const nextWeekKey = getNextWeekKey(currentWeekInfo.weekKey);
  const nextWeekNumber = getWeekInfoByKey(nextWeekKey).weekNumber;

  const getAppState = useCallback((): AppState => {
    return {
      schedules,
      selectedCuisines,
      specialConditions,
    };
  }, [schedules, selectedCuisines, specialConditions]);

  const getSelectedWeekKey = useCallback((): string => {
    if (weekOption === "current") return currentWeekInfo.weekKey;
    if (weekOption === "next") return nextWeekKey;
    // custom: build key from year + customWeekNumber
    return getPlanKey(currentWeekInfo.year, customWeekNumber!);
  }, [weekOption, customWeekNumber, currentWeekInfo.weekKey, currentWeekInfo.year, nextWeekKey]);

  // Valid if at least one cuisine is selected and week is valid
  const isValid =
    selectedCuisines.length > 0 &&
    (weekOption !== "custom" || customWeekNumber !== null);

  return {
    schedules,
    selectedCuisines,
    specialConditions,
    weekOption,
    customWeekNumber,
    currentWeekNumber,
    nextWeekNumber,
    toggleSlot,
    toggleCuisine,
    setSpecialConditions,
    setWeekOption,
    setCustomWeekNumber,
    getAppState,
    getSelectedWeekKey,
    isValid,
    hasHydrated,
  };
}