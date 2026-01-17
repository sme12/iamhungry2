"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppState } from "@/schemas/appState";
import { useMealPlanGeneration } from "@/hooks/useMealPlanGeneration";
import { MealPlanView } from "./MealPlanView";
import { MealPlanSkeleton, ShoppingListSkeleton } from "./Skeleton";
import { addIdsToShoppingItems } from "@/utils/shoppingItemId";
import { CATEGORY_EMOJI } from "@/config/defaults";
import type { Category, ShoppingTrip } from "@/schemas/mealPlanResponse";

interface GenerateSectionProps {
  appState: AppState;
  isFormValid: boolean;
  getWeekKey: () => string;
}

// Category display order
const CATEGORY_ORDER: Category[] = [
  "produce",
  "dairy",
  "meat",
  "bakery",
  "pantry",
  "frozen",
  "condiments",
];

function ShoppingListPreview({ trips }: { trips: ShoppingTrip[] }) {
  const t = useTranslations("categories");

  // Group items by category across all trips
  const itemsByCategory = new Map<Category, { name: string; amount: string }[]>();

  for (const trip of trips) {
    for (const item of trip.items) {
      const existing = itemsByCategory.get(item.category) || [];
      existing.push({ name: item.name, amount: item.amount });
      itemsByCategory.set(item.category, existing);
    }
  }

  const totalItems = trips.reduce((sum, trip) => sum + trip.items.length, 0);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted">{totalItems} products</div>

      {CATEGORY_ORDER.map((category) => {
        const items = itemsByCategory.get(category);
        if (!items || items.length === 0) return null;

        return (
          <div key={category} className="space-y-1">
            <div className="flex items-center gap-2 py-2">
              <span>{CATEGORY_EMOJI[category]}</span>
              <span className="font-medium">{t(category)}</span>
              <span className="text-sm text-muted">({items.length})</span>
            </div>
            <div className="space-y-1">
              {items.map((item, idx) => (
                <div
                  key={`${category}-${idx}`}
                  className="flex items-center gap-3 h-12 px-3 rounded-lg bg-card"
                >
                  <div className="w-6 h-6 rounded border-2 border-border" />
                  <span className="flex-1">{item.name}</span>
                  <span className="text-sm text-muted">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GenerateSection({ appState, isFormValid, getWeekKey }: GenerateSectionProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    stage,
    weekPlan,
    shoppingTrips,
    error,
    generatePlan,
    confirmPlan,
    regeneratePlan,
    reset,
    resetToPlanStage,
  } = useMealPlanGeneration();

  const handleSave = async () => {
    if (!weekPlan || !shoppingTrips) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const weekKey = getWeekKey();
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
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
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
        onClick={() => generatePlan(appState)}
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
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-border">
          <h3 className="font-medium mb-4">{t("result.mealPlan")}</h3>
          <MealPlanView weekPlan={weekPlan} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => regeneratePlan(appState)}
            className="flex-1 h-12 rounded-lg bg-card hover:bg-card-hover font-medium transition-colors"
          >
            {t("common.regenerate")}
          </button>
          <button
            onClick={() => confirmPlan(appState)}
            className="flex-1 h-12 rounded-lg bg-accent hover:bg-accent-hover font-medium text-white transition-colors"
          >
            {t("generation.confirmPlan")}
          </button>
        </div>
      </div>
    );
  }

  // Generating shopping list - show skeleton
  if (stage === "generating-shopping") {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-border">
          <h3 className="font-medium mb-4">{t("result.mealPlan")}</h3>
          {weekPlan && <MealPlanView weekPlan={weekPlan} />}
        </div>

        <div className="space-y-4">
          <p className="text-center text-muted">{t("generation.generatingShopping")}</p>
          <ShoppingListSkeleton />
        </div>
      </div>
    );
  }

  // Complete - show both plan and shopping list
  if (stage === "complete" && weekPlan && shoppingTrips) {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-border">
          <h3 className="font-medium mb-4">{t("result.mealPlan")}</h3>
          <MealPlanView weekPlan={weekPlan} />
        </div>

        <div className="p-4 rounded-lg border border-border">
          <h3 className="font-medium mb-4">{t("result.shoppingList")}</h3>
          <ShoppingListPreview trips={shoppingTrips} />
        </div>

        {saveError && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-destructive text-sm">{saveError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={resetToPlanStage}
            disabled={isSaving}
            className="flex-1 h-12 rounded-lg bg-card hover:bg-card-hover font-medium transition-colors disabled:opacity-50"
          >
            {t("generation.backToPlan")}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-12 rounded-lg bg-success hover:bg-success/90 font-medium text-white transition-colors disabled:opacity-50"
          >
            {isSaving ? t("loading.saving") : t("common.save")}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
