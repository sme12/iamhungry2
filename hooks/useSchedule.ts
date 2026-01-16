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

interface UseScheduleReturn {
  schedules: {
    vitalik: PersonWeekSchedule;
    lena: PersonWeekSchedule;
  };
  selectedCuisines: CuisineId[];
  specialConditions: string;

  toggleSlot: (person: PersonId, day: Day, meal: Meal) => void;
  toggleCuisine: (cuisineId: CuisineId) => void;
  setSpecialConditions: (value: string) => void;

  getAppState: () => AppState;
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

  // Valid if at least one cuisine is selected
  const isValid = selectedCuisines.length > 0;

  return {
    schedules,
    selectedCuisines,
    specialConditions,
    toggleSlot,
    toggleCuisine,
    setSpecialConditions,
    getAppState,
    isValid,
  };
}
