"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ShoppingItemWithId, Category } from "@/schemas/mealPlanResponse";
import type { ShoppingTripWithIds } from "@/utils/shoppingItemId";
import { CATEGORY_EMOJI } from "@/config/defaults";

interface ShoppingListViewProps {
  trips: ShoppingTripWithIds[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
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

interface CategorySectionProps {
  category: Category;
  items: ShoppingItemWithId[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
}

function CategorySection({
  category,
  items,
  checkedIds,
  onToggle,
}: CategorySectionProps) {
  const t = useTranslations("categories");
  const [collapsed, setCollapsed] = useState(false);

  const checkedCount = items.filter((item) => checkedIds.has(item.id)).length;
  const emoji = CATEGORY_EMOJI[category];

  return (
    <div className="mb-2">
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        aria-label={t(category)}
        className="w-full flex items-center justify-between py-1.5 px-1 text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="font-medium text-sm">{t(category)}</span>
          <span className="text-xs text-muted tabular-nums">
            ({checkedCount}/{items.length})
          </span>
        </div>
        <span className="text-muted text-sm" aria-hidden="true">
          {collapsed ? "▼" : "▲"}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-1">
          {items.map((item) => {
            const isChecked = checkedIds.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onToggle(item.id)}
                role="checkbox"
                aria-checked={isChecked}
                className={`w-full flex items-center gap-3 h-12 px-3 rounded-lg transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isChecked
                    ? "bg-card/50 text-muted line-through"
                    : "bg-card hover:bg-card-hover"
                }`}
              >
                <div
                  aria-hidden="true"
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isChecked
                      ? "bg-success border-success text-white"
                      : "border-border"
                  }`}
                >
                  {isChecked && <span className="text-xs">✓</span>}
                </div>
                <span className="flex-1 text-left text-sm min-w-0 truncate">
                  {item.name}
                </span>
                <span className="text-xs text-muted shrink-0">{item.amount}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface TripSectionProps {
  trip: ShoppingTripWithIds;
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  showOnlyUnchecked: boolean;
}

function TripSection({
  trip,
  checkedIds,
  onToggle,
  showOnlyUnchecked,
}: TripSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Group items by category within this trip
  const itemsByCategory = useMemo(() => {
    const grouped = new Map<Category, ShoppingItemWithId[]>();
    for (const item of trip.items) {
      if (showOnlyUnchecked && checkedIds.has(item.id)) continue;
      const existing = grouped.get(item.category) || [];
      existing.push(item);
      grouped.set(item.category, existing);
    }
    return grouped;
  }, [trip.items, checkedIds, showOnlyUnchecked]);

  const totalItems = trip.items.length;
  const checkedCount = trip.items.filter((item) =>
    checkedIds.has(item.id)
  ).length;

  // Hide trip if filtering and all items checked
  if (showOnlyUnchecked && itemsByCategory.size === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        aria-label={trip.label}
        className="w-full flex items-center justify-between py-2 px-2 bg-card rounded-lg mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="font-semibold">{trip.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted tabular-nums">
            {checkedCount}/{totalItems}
          </span>
          <span className="text-muted" aria-hidden="true">
            {collapsed ? "▼" : "▲"}
          </span>
        </div>
      </button>

      {!collapsed && (
        <div className="pl-2">
          {CATEGORY_ORDER.map((category) => {
            const items = itemsByCategory.get(category);
            if (!items || items.length === 0) return null;
            return (
              <CategorySection
                key={category}
                category={category}
                items={items}
                checkedIds={checkedIds}
                onToggle={onToggle}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ShoppingListView({
  trips,
  checkedIds,
  onToggle,
}: ShoppingListViewProps) {
  const t = useTranslations("shoppingList");
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);

  // Calculate totals
  const totalItems = trips.reduce((sum, trip) => sum + trip.items.length, 0);
  const totalChecked = trips.reduce(
    (sum, trip) =>
      sum + trip.items.filter((item) => checkedIds.has(item.id)).length,
    0
  );

  // Check if all items are checked (for empty state)
  const allChecked = totalChecked === totalItems && totalItems > 0;

  return (
    <div className="space-y-4">
      {/* Header with filter toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          {totalChecked}/{totalItems}
        </div>
        <button
          onClick={() => setShowOnlyUnchecked(!showOnlyUnchecked)}
          aria-pressed={showOnlyUnchecked}
          className={`text-sm px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            showOnlyUnchecked
              ? "bg-accent text-white"
              : "bg-card hover:bg-card-hover"
          }`}
        >
          {showOnlyUnchecked ? t("showAll") : t("showUnchecked")}
        </button>
      </div>

      {/* Trips */}
      {trips.map((trip, index) => (
        <TripSection
          key={index}
          trip={trip}
          checkedIds={checkedIds}
          onToggle={onToggle}
          showOnlyUnchecked={showOnlyUnchecked}
        />
      ))}

      {/* Empty state when filtering */}
      {showOnlyUnchecked && allChecked && (
        <div className="text-center py-8 text-muted">
          ✅ All items purchased!
        </div>
      )}
    </div>
  );
}
