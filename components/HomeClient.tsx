"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { PlanListItem } from "@/schemas/persistedPlan";
import { usePlans } from "@/hooks/usePlans";
import { EmptyState } from "@/components/EmptyState";
import { TabSwitcher, type TabId } from "@/components/TabSwitcher";
import { WeekPagination } from "@/components/WeekPagination";
import { MealPlanView } from "@/components/MealPlanView";
import { ShoppingListView } from "@/components/ShoppingListView";
import { StickyPanel } from "@/components/StickyPanel";
import { MealPlanSkeleton, ShoppingListSkeleton } from "@/components/Skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface HomeClientProps {
  initialWeeks: PlanListItem[];
}

export function HomeClient({ initialWeeks }: HomeClientProps) {
  const t = useTranslations("deleteDialog");
  const [activeTab, setActiveTab] = useState<TabId>("plan");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const {
    plan,
    weekInfo,
    checkedIds,
    loading,
    deleting,
    error,
    goNext,
    goPrev,
    hasPrev,
    hasNext,
    toggleChecked,
    deletePlan,
  } = usePlans(initialWeeks);

  // No plans saved yet
  if (initialWeeks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-4">
        {/* Week navigation */}
        {weekInfo && (
          <WeekPagination
            weekInfo={weekInfo}
            onPrev={goPrev}
            onNext={goNext}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />
        )}

        {/* Tab switcher */}
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        {loading ? (
          activeTab === "plan" ? (
            <MealPlanSkeleton />
          ) : (
            <ShoppingListSkeleton />
          )
        ) : error ? (
          <div className="text-center py-8 text-error">{error}</div>
        ) : plan ? (
          activeTab === "plan" ? (
            <MealPlanView weekPlan={plan.result.weekPlan} />
          ) : (
            <ShoppingListView
              trips={plan.result.shoppingTrips}
              checkedIds={checkedIds}
              onToggle={toggleChecked}
              weekKey={weekInfo!.weekKey}
            />
          )
        ) : (
          <div className="text-center py-8 text-muted">Plan not found</div>
        )}

        {/* Delete plan - intentionally subtle */}
        {plan && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="mt-8 text-sm text-muted/50 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {t("title")}
          </button>
        )}
      </main>

      {/* Sticky panel with "New plan" button */}
      <StickyPanel />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title={t("title")}
        message={t("message")}
        confirmLabel={t("confirm")}
        cancelLabel={t("cancel")}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          await deletePlan();
        }}
      />
    </div>
  );
}
