import { z } from "zod";
import { MealPlanResponseSchema } from "./mealPlanResponse";
import { AppStateSchema } from "./appState";

// Saved plan in Vercel KV
export const PersistedPlanSchema = z.object({
  weekKey: z.string(), // "2026-02" (year-week number)
  createdAt: z.string(), // ISO date string
  inputState: AppStateSchema, // Original settings for generation
  result: MealPlanResponseSchema, // Result from Claude
});
export type PersistedPlan = z.infer<typeof PersistedPlanSchema>;

// List of all plans (for pagination)
export const PlanListItemSchema = z.object({
  weekKey: z.string(),
  createdAt: z.string(),
  weekNumber: z.number(),
  year: z.number(),
  dateRange: z.string(), // "Jan 6-12"
});
export type PlanListItem = z.infer<typeof PlanListItemSchema>;

// Parse saved plan
export function parsePersistedPlan(data: unknown): PersistedPlan | null {
  const result = PersistedPlanSchema.safeParse(data);
  return result.success ? result.data : null;
}
