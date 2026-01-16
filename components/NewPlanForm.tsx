"use client";

import { useSchedule } from "@/hooks/useSchedule";
import { WeekCalendar } from "./WeekCalendar";
import { CuisineSelector } from "./CuisineSelector";
import { SpecialConditions } from "./SpecialConditions";

export function NewPlanForm() {
  const {
    schedules,
    selectedCuisines,
    specialConditions,
    toggleSlot,
    toggleCuisine,
    setSpecialConditions,
  } = useSchedule();

  return (
    <div className="space-y-8">
      <WeekCalendar schedules={schedules} onToggle={toggleSlot} />
      <CuisineSelector selected={selectedCuisines} onToggle={toggleCuisine} />
      <SpecialConditions
        value={specialConditions}
        onChange={setSpecialConditions}
      />
      {/* Generate button will be added in step 5 (Two-Stage Generation) */}
    </div>
  );
}
