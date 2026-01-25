"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { AppState } from "@/schemas/appState";
import { useMealPlanGeneration } from "@/hooks/useMealPlanGeneration";
import { MealPlanView } from "./MealPlanView";
import { MealPlanSkeleton } from "./Skeleton";
import { CookingLoader } from "./CookingLoader";
import { addIdsToShoppingItems } from "@/utils/shoppingItemId";

interface GenerateSectionProps {
  appState: AppState;
  isFormValid: boolean;
  getWeekKey: () => string;
}

export function GenerateSection({ appState, isFormValid, getWeekKey }: GenerateSectionProps) {
  const t = useTranslations();
  const router = useRouter();

  const {
    stage,
    weekPlan,
    selectedSlots,
    error,
    generatePlan,
    confirmPlan,
    regeneratePlan,
    reset,
    toggleSlot,
  } = useMealPlanGeneration();

  const handleConfirmAndSave = () => {
    const weekKey = getWeekKey();

    confirmPlan(appState, async (shoppingTrips) => {
      const tripsWithIds = addIdsToShoppingItems(shoppingTrips);

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekKey,
          inputState: appState,
          result: {
            weekPlan,
            shoppingTrips: tripsWithIds,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/");
    });
  };

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-destructive font-medium">{t("errors.generation")}</p>
          <p className="text-sm text-muted mt-1">{error}</p>
        </div>
        <button
          onClick={reset}
          className="w-full h-12 rounded-lg bg-card hover:bg-card-hover font-medium transition-colors"
        >
          {t("errors.tryAgain")}
        </button>
      </div>
    );
  }

  // Idle state - show generate button
  if (stage === "idle") {
    return (
      <button
        onClick={() => generatePlan(appState, getWeekKey())}
        disabled={!isFormValid}
        className="w-full h-14 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white transition-colors"
      >
        {t("common.generate")}
      </button>
    );
  }

  // Generating plan - show skeleton
  if (stage === "generating-plan") {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted">{t("loading.generating")}</p>
        <MealPlanSkeleton />
      </div>
    );
  }

  // Plan ready - show plan with action buttons
  if (stage === "plan-ready" && weekPlan) {
    const hasSelection = selectedSlots.size > 0;

    return (
      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{t("result.mealPlan")}</h3>
            {hasSelection && (
              <span className="text-sm text-muted">
                {t("generation.selectedCount", { count: selectedSlots.size })}
              </span>
            )}
          </div>
          <MealPlanView
            weekPlan={weekPlan}
            selectable
            selectedSlots={selectedSlots}
            onToggle={toggleSlot}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => regeneratePlan(appState, getWeekKey())}
            className="flex-1 h-12 rounded-lg bg-card hover:bg-card-hover font-medium transition-colors"
          >
            {hasSelection
              ? t("generation.regenerateSelected")
              : t("common.regenerate")}
          </button>
          <button
            onClick={handleConfirmAndSave}
            className="flex-1 h-12 rounded-lg bg-accent hover:bg-accent-hover font-medium text-white transition-colors"
          >
            {t("generation.acceptPlan")}
          </button>
        </div>
      </div>
    );
  }

  // Generating shopping list and saving - show animated loader
  if (stage === "generating-shopping") {
    return (
      <div className="py-8">
        <CookingLoader />
        <p className="text-center text-muted mt-4">
          {t("generation.savingPlan")}
        </p>
      </div>
    );
  }

  return null;
}
