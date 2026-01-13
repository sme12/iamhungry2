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

// Full response from Claude
export const MealPlanResponseSchema = z.object({
  weekPlan: z.array(DayPlanSchema),
  shoppingTrips: z.array(ShoppingTripSchema),
});
export type MealPlanResponse = z.infer<typeof MealPlanResponseSchema>;

// Parse response
export function parseMealPlanResponse(data: unknown): MealPlanResponse | null {
  const result = MealPlanResponseSchema.safeParse(data);
  return result.success ? result.data : null;
}
