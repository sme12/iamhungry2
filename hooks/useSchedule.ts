"use client";

import { useState, useCallback } from "react";
import type {
  AppState,
  CuisineId,
  Day,
  Meal,
  MealSlotStatus,
  PersonWeekSchedule,
} from "@/schemas/appState";
import {
  createDefaultWeekSchedule,
  DEFAULT_SELECTED_CUISINES,
  PEOPLE,
  STATUS_CYCLE,
} from "@/config/defaults";
import type { PersonId } from "@/config/defaults";
import type { WeekOption } from "@/components/WeekSelector";
import {
  getCurrentWeekInfo,
  getNextWeekKey,
  getPlanKey,
  getWeekInfoByKey,
} from "@/utils/weekNumber";

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
}

export function useSchedule(): UseScheduleReturn {
  const [schedules, setSchedules] = useState<{
    vitalik: PersonWeekSchedule;
    lena: PersonWeekSchedule;
  }>(() => ({
    vitalik: createDefaultWeekSchedule(),
    lena: createDefaultWeekSchedule(),
  }));

  const [selectedCuisines, setSelectedCuisines] = useState<CuisineId[]>(
    [...DEFAULT_SELECTED_CUISINES]
  );

  const [specialConditions, setSpecialConditions] = useState("");

  const [weekOption, setWeekOption] = useState<WeekOption>("current");
  const [customWeekNumber, setCustomWeekNumber] = useState<number | null>(null);

  const currentWeekInfo = getCurrentWeekInfo();
  const currentWeekNumber = currentWeekInfo.weekNumber;
  const nextWeekKey = getNextWeekKey(currentWeekInfo.weekKey);
  const nextWeekNumber = getWeekInfoByKey(nextWeekKey).weekNumber;

  const toggleSlot = useCallback(
    (person: PersonId, day: Day, meal: Meal) => {
      setSchedules((prev) => {
        const currentStatus = prev[person][day][meal];
        const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
        const nextStatus = STATUS_CYCLE[
          (currentIndex + 1) % STATUS_CYCLE.length
        ] as MealSlotStatus;

        return {
          ...prev,
          [person]: {
            ...prev[person],
            [day]: {
              ...prev[person][day],
              [meal]: nextStatus,
            },
          },
        };
      });
    },
    []
  );

  const toggleCuisine = useCallback((cuisineId: CuisineId) => {
    setSelectedCuisines((prev) => {
      if (prev.includes(cuisineId)) {
        return prev.filter((c) => c !== cuisineId);
      }
      return [...prev, cuisineId];
    });
  }, []);

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
  };
}
