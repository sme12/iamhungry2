"use client";

import { useTranslations } from "next-intl";
import type { CuisineId } from "@/schemas/appState";
import { AVAILABLE_CUISINES } from "@/config/defaults";

interface CuisineSelectorProps {
  selected: CuisineId[];
  onToggle: (cuisineId: CuisineId) => void;
}

export function CuisineSelector({ selected, onToggle }: CuisineSelectorProps) {
  const t = useTranslations("cuisines");

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_CUISINES.map((cuisineId) => {
          const isSelected = selected.includes(cuisineId);
          return (
            <button
              key={cuisineId}
              type="button"
              onClick={() => onToggle(cuisineId)}
              className={`h-10 px-4 rounded-full text-sm font-medium
                         transition-colors active:scale-[0.98]
                         ${
                           isSelected
                             ? "bg-accent text-white"
                             : "bg-card border border-border hover:bg-card-hover"
                         }`}
            >
              {t(cuisineId)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
