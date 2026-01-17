"use client";

import { useTranslations } from "next-intl";

export type WeekOption = "current" | "next" | "custom";

interface WeekSelectorProps {
  selectedOption: WeekOption;
  customWeekNumber: number | null;
  currentWeekNumber: number;
  nextWeekNumber: number;
  onOptionChange: (option: WeekOption) => void;
  onCustomChange: (num: number | null) => void;
}

export function WeekSelector({
  selectedOption,
  customWeekNumber,
  currentWeekNumber,
  nextWeekNumber,
  onOptionChange,
  onCustomChange,
}: WeekSelectorProps) {
  const t = useTranslations("weekSelector");

  const options: { id: WeekOption; label: string }[] = [
    { id: "current", label: t("current", { number: currentWeekNumber }) },
    { id: "next", label: t("next", { number: nextWeekNumber }) },
    { id: "custom", label: t("custom") },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onOptionChange(option.id)}
              className={`h-10 px-4 rounded-full text-sm font-medium
                         transition-colors active:scale-[0.98]
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-accent focus-visible:ring-offset-2
                         ${
                           isSelected
                             ? "bg-accent text-white"
                             : "bg-card border border-border hover:bg-card-hover"
                         }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {selectedOption === "custom" && (
        <input
          id="custom-week-input"
          name="customWeekNumber"
          type="number"
          min={1}
          max={53}
          value={customWeekNumber ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              onCustomChange(null);
              return;
            }
            const num = parseInt(val, 10);
            if (!isNaN(num) && num >= 1 && num <= 53) {
              onCustomChange(num);
            }
          }}
          aria-label={t("inputLabel")}
          placeholder={t("placeholder")}
          className="h-12 w-full px-4 rounded-lg bg-card border border-border
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
                     placeholder:text-muted"
        />
      )}
    </section>
  );
}
