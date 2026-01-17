"use client";

import { useSchedule } from "@/hooks/useSchedule";
import { WeekCalendar } from "./WeekCalendar";
import { CuisineSelector } from "./CuisineSelector";
import { SpecialConditions } from "./SpecialConditions";
import { WeekSelector } from "./WeekSelector";
import { GenerateSection } from "./GenerateSection";

export function NewPlanForm() {
  const {
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
  } = useSchedule();

  return (
    <div className="space-y-8">
      <WeekCalendar schedules={schedules} onToggle={toggleSlot} />
      <CuisineSelector selected={selectedCuisines} onToggle={toggleCuisine} />
      <SpecialConditions
        value={specialConditions}
        onChange={setSpecialConditions}
      />
      <WeekSelector
        selectedOption={weekOption}
        customWeekNumber={customWeekNumber}
        currentWeekNumber={currentWeekNumber}
        nextWeekNumber={nextWeekNumber}
        onOptionChange={setWeekOption}
        onCustomChange={setCustomWeekNumber}
      />
      <GenerateSection
        appState={getAppState()}
        isFormValid={isValid}
        getWeekKey={getSelectedWeekKey}
      />
    </div>
  );
}
