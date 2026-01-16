"use client";

import type { MealSlotStatus } from "@/schemas/appState";
import { STATUS_EMOJI } from "@/config/defaults";

interface MealSlotCellProps {
  status: MealSlotStatus;
  onClick: () => void;
}

export function MealSlotCell({ status, onClick }: MealSlotCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-[48px] min-h-[48px] w-full flex items-center justify-center
                 bg-card border border-border rounded-md
                 active:scale-[0.98] transition-transform hover:bg-card-hover"
    >
      <span className="text-xl">{STATUS_EMOJI[status]}</span>
    </button>
  );
}
