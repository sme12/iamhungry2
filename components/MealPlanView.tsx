"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { DayPlan, MealItem } from "@/schemas/mealPlanResponse";
import { DAYS_ORDER } from "@/config/defaults";
import type { Day, Meal } from "@/schemas/appState";
import { copyToClipboard } from "@/utils/clipboard";

interface MealPlanViewProps {
  weekPlan: DayPlan[];
  selectable?: boolean;
  selectedSlots?: Set<string>;
  onToggle?: (day: Day, meal: Meal) => void;
}

const MEALS: Meal[] = ["breakfast", "lunch", "dinner"];

interface MealCellProps {
  meal: MealItem | null;
  selectable?: boolean;
  isSelected?: boolean;
  onToggle?: () => void;
}

function MealCell({ meal, selectable, isSelected, onToggle }: MealCellProps) {
  const t = useTranslations("result");

  if (!meal) {
    return (
      <div className="h-full flex items-center justify-center text-muted text-sm">
        —
      </div>
    );
  }

  const handleCopyPrompt = async () => {
    const prompt = t("recipePrompt", { mealName: meal.name });
    const success = await copyToClipboard(prompt);
    if (success) {
      toast.success(t("copiedPrompt", { mealName: meal.name }));
    } else {
      toast.error(t("copyFailed"));
    }
  };

  const content = (
    <>
      <div className="font-medium text-sm leading-tight">{meal.name}</div>
      <div className="text-xs text-muted mt-1">
        {t("minutes", { time: meal.time })}
      </div>
    </>
  );

  // Selectable mode - selection behavior
  if (selectable && onToggle) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`w-full h-full p-2 text-left rounded transition-colors ${
          isSelected
            ? "bg-accent/20 ring-2 ring-accent"
            : "hover:bg-card-hover"
        }`}
      >
        {content}
      </button>
    );
  }

  // Non-selectable mode - copy prompt behavior
  return (
    <button
      type="button"
      onClick={handleCopyPrompt}
      className="w-full h-full p-2 text-left rounded transition-colors hover:bg-card-hover active:scale-[0.98] cursor-pointer"
    >
      {content}
    </button>
  );
}

export function MealPlanView({
  weekPlan,
  selectable,
  selectedSlots,
  onToggle,
}: MealPlanViewProps) {
  const t = useTranslations();

  // Create a map for quick lookup by day
  const planByDay = new Map<Day, DayPlan>();
  for (const dayPlan of weekPlan) {
    planByDay.set(dayPlan.day, dayPlan);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[320px]">
        <thead>
          <tr>
            <th className="p-2 text-left text-sm font-medium text-muted w-12" />
            {MEALS.map((meal) => (
              <th
                key={meal}
                className="p-2 text-center text-sm font-medium text-muted"
              >
                {t(`calendar.meals.${meal}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS_ORDER.map((day) => {
            const dayPlan = planByDay.get(day);
            return (
              <tr key={day} className="border-t border-border">
                <td className="p-2 text-sm font-medium">
                  {t(`calendar.days.${day}`)}
                </td>
                {MEALS.map((meal) => {
                  const slotKey = `${day}-${meal}`;
                  const isSelected = selectedSlots?.has(slotKey) ?? false;
                  return (
                    <td
                      key={meal}
                      className="p-1 border-l border-border min-h-[64px] align-top"
                    >
                      <MealCell
                        meal={dayPlan?.[meal] ?? null}
                        selectable={selectable}
                        isSelected={isSelected}
                        onToggle={
                          selectable && onToggle
                            ? () => onToggle(day, meal)
                            : undefined
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
