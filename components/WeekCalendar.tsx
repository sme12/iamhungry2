"use client";

import { useTranslations } from "next-intl";
import type { Day, Meal, PersonWeekSchedule } from "@/schemas/appState";
import type { PersonId } from "@/config/defaults";
import { DAYS_ORDER, PEOPLE } from "@/config/defaults";
import { MealSlotCell } from "./MealSlotCell";

interface WeekCalendarProps {
  schedules: {
    vitalik: PersonWeekSchedule;
    lena: PersonWeekSchedule;
  };
  onToggle: (person: PersonId, day: Day, meal: Meal) => void;
}

const MEALS: Meal[] = ["breakfast", "lunch", "dinner"];

export function WeekCalendar({ schedules, onToggle }: WeekCalendarProps) {
  const t = useTranslations("calendar");

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <div className="space-y-1">
        {/* Header row with person names */}
        <div className="grid grid-cols-[auto_1fr_1fr] gap-1 mb-2">
          <div className="w-10" /> {/* spacer for day column */}
          {PEOPLE.map((personId) => (
            <div
              key={personId}
              className="text-center text-sm font-medium text-muted"
            >
              {t(`persons.${personId}`)}
            </div>
          ))}
        </div>

        {/* Days and meal slots */}
        {DAYS_ORDER.map((day) => (
          <div key={day} className="grid grid-cols-[auto_1fr_1fr] gap-1">
            {/* Day label - spans 3 meal rows */}
            <div className="w-10 flex items-center justify-center text-sm font-medium row-span-3">
              {t(`days.${day}`)}
            </div>

            {/* Meal cells for each person (3 meals stacked) */}
            {PEOPLE.map((personId) => (
              <div key={personId} className="space-y-1">
                {MEALS.map((meal) => (
                  <MealSlotCell
                    key={meal}
                    status={schedules[personId][day][meal]}
                    onClick={() => onToggle(personId, day, meal)}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Hint */}
      <p className="text-xs text-muted">{t("slotHint")}</p>
    </section>
  );
}
