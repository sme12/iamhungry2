import { z } from "zod";

// Calendar cell statuses
export const MealSlotStatusSchema = z.enum([
  "full", // 🍽️ Full meal (cooking at home)
  "coffee", // ☕ Light snack (coffee/croissant)
  "skip", // ❌ Skip
]);
export type MealSlotStatus = z.infer<typeof MealSlotStatusSchema>;

// Days of the week
export const DaySchema = z.enum([
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
]);
export type Day = z.infer<typeof DaySchema>;

// Meals
export const MealSchema = z.enum(["breakfast", "lunch", "dinner"]);
export type Meal = z.infer<typeof MealSchema>;

// One person's daily schedule
export const DayScheduleSchema = z.object({
  breakfast: MealSlotStatusSchema,
  lunch: MealSlotStatusSchema,
  dinner: MealSlotStatusSchema,
});
export type DaySchedule = z.infer<typeof DayScheduleSchema>;

// One person's weekly schedule
export const PersonWeekScheduleSchema = z.record(DaySchema, DayScheduleSchema);
export type PersonWeekSchedule = z.infer<typeof PersonWeekScheduleSchema>;

// Cuisine identifiers
export const CuisineIdSchema = z.enum([
  "eastern-european",
  "asian",
  "mexican",
  "american",
  "italian",
  "mediterranean",
  "japanese",
  "thai",
  "georgian",
  "scandinavian",
]);
export type CuisineId = z.infer<typeof CuisineIdSchema>;

// Full app state (for plan creation form)
export const AppStateSchema = z.object({
  schedules: z.object({
    vitalik: PersonWeekScheduleSchema,
    lena: PersonWeekScheduleSchema,
  }),
  selectedCuisines: z.array(CuisineIdSchema),
  specialConditions: z.string(),
});
export type AppState = z.infer<typeof AppStateSchema>;

// Validation when loading from Vercel KV
export function parseAppState(data: unknown): AppState | null {
  const result = AppStateSchema.safeParse(data);
  return result.success ? result.data : null;
}
