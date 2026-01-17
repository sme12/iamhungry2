import { z } from "zod";

// Dish
export const MealItemSchema = z.object({
  name: z.string(),
  time: z.number(), // minutes
  portions: z.number(),
});
export type MealItem = z.infer<typeof MealItemSchema>;

// Day in meal plan
export const DayPlanSchema = z.object({
  day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  breakfast: MealItemSchema.nullable(),
  lunch: MealItemSchema.nullable(),
  dinner: MealItemSchema.nullable(),
});
export type DayPlan = z.infer<typeof DayPlanSchema>;

// Product categories
export const CategorySchema = z.enum([
  "dairy", // 🥛 Dairy products
  "meat", // 🥩 Meat / Fish
  "produce", // 🥬 Vegetables / Fruits
  "pantry", // 🍝 Pantry staples
  "frozen", // ❄️ Frozen
  "bakery", // 🥖 Bread / Pastries
  "condiments", // 🧂 Sauces / Seasonings
]);
export type Category = z.infer<typeof CategorySchema>;

// Shopping list item
export const ShoppingItemSchema = z.object({
  name: z.string(),
  amount: z.string(),
  category: CategorySchema,
  forMeal: z.string().optional(), // for which dish
});
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;

// Item with ID (for client, after processing)
export const ShoppingItemWithIdSchema = ShoppingItemSchema.extend({
  id: z.string(), // deterministic ID for preserving checkbox state
});
export type ShoppingItemWithId = z.infer<typeof ShoppingItemWithIdSchema>;

// Shopping trip
export const ShoppingTripSchema = z.object({
  label: z.string(), // "Trip 1 (Mon-Thu)"
  items: z.array(ShoppingItemSchema),
});
export type ShoppingTrip = z.infer<typeof ShoppingTripSchema>;

// ============================================
// Meal slot identifier for selective regeneration
// ============================================
export const DaySchema = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
export const MealSchema = z.enum(["breakfast", "lunch", "dinner"]);

export const MealSlotSchema = z.object({
  day: DaySchema,
  meal: MealSchema,
});
export type MealSlot = z.infer<typeof MealSlotSchema>;

// ============================================
// Step 1: Meal Plan Only (without shopping list)
// ============================================
export const MealPlanOnlyResponseSchema = z.object({
  weekPlan: z.array(DayPlanSchema),
});
export type MealPlanOnlyResponse = z.infer<typeof MealPlanOnlyResponseSchema>;

// Parse meal plan response (step 1)
export function parseMealPlanOnlyResponse(
  data: unknown
): MealPlanOnlyResponse | null {
  const result = MealPlanOnlyResponseSchema.safeParse(data);
  return result.success ? result.data : null;
}

// ============================================
// Step 2: Shopping List (after plan is confirmed)
// ============================================
export const ShoppingListResponseSchema = z.object({
  shoppingTrips: z.array(ShoppingTripSchema),
});
export type ShoppingListResponse = z.infer<typeof ShoppingListResponseSchema>;

// Parse shopping list response (step 2)
export function parseShoppingListResponse(
  data: unknown
): ShoppingListResponse | null {
  const result = ShoppingListResponseSchema.safeParse(data);
  return result.success ? result.data : null;
}

// ============================================
// Combined: Full response (for persisted plans)
// ============================================
export const MealPlanResponseSchema = z.object({
  weekPlan: z.array(DayPlanSchema),
  shoppingTrips: z.array(ShoppingTripSchema),
});
export type MealPlanResponse = z.infer<typeof MealPlanResponseSchema>;

// Parse combined response
export function parseMealPlanResponse(data: unknown): MealPlanResponse | null {
  const result = MealPlanResponseSchema.safeParse(data);
  return result.success ? result.data : null;
}
