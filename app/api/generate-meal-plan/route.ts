import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { getAuthUserId } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { redis, KV_PREFIX } from "@/lib/redis";
import { AppStateSchema } from "@/schemas/appState";
import {
  DayPlanSchema,
  MealPlanOnlyResponseSchema,
  MealSlotSchema,
} from "@/schemas/mealPlanResponse";
import { parsePersistedPlan } from "@/schemas/persistedPlan";
import {
  buildMealPlanPrompt,
  buildPartialRegenerationPrompt,
} from "@/utils/promptBuilder";
import { getPreviousWeekKey } from "@/utils/weekNumber";

// Cuisine names for prompt building
const CUISINE_NAMES: Record<string, string> = {
  "eastern-european": "Восточно-европейская",
  asian: "Азиатская",
  mexican: "Мексиканская",
  american: "Американская",
  italian: "Итальянская",
  mediterranean: "Средиземноморская",
  japanese: "Японская",
  thai: "Тайская",
  georgian: "Грузинская",
  scandinavian: "Скандинавская",
};

// Rate limit: 10 requests per minute
const RATE_LIMIT = 10;
const RATE_WINDOW_SEC = 60;

// Request body schema
const RequestBodySchema = z.object({
  appState: AppStateSchema,
  weekKey: z.string().optional(),
  currentPlan: z.array(DayPlanSchema).optional(),
  regenerateSlots: z.array(MealSlotSchema).optional(),
});

export async function POST(request: Request) {
  try {
    // Auth check
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit check
    const rateLimitResult = await checkRateLimit(
      `meal-plan:${userId}`,
      RATE_LIMIT,
      RATE_WINDOW_SEC
    );

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetAt - Date.now()) / 1000
      );
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const parseResult = RequestBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { appState, weekKey, currentPlan, regenerateSlots } = parseResult.data;

    // Fetch previous week's meals if weekKey provided
    let previousMeals: string[] | undefined;
    if (weekKey) {
      const prevWeekKey = getPreviousWeekKey(weekKey);
      const planKey = `${KV_PREFIX}:plan:${prevWeekKey}`;
      const data = await redis.get(planKey);
      if (data) {
        const prevPlan = parsePersistedPlan(data);
        if (prevPlan?.result.weekPlan) {
          previousMeals = prevPlan.result.weekPlan.flatMap((day) =>
            [day.breakfast, day.lunch, day.dinner]
              .filter((m) => m !== null)
              .map((m) => m.name)
          );
        }
      }
    }

    // Build prompt - use partial regeneration if slots specified
    const isPartialRegeneration =
      currentPlan && regenerateSlots && regenerateSlots.length > 0;

    const prompt = isPartialRegeneration
      ? buildPartialRegenerationPrompt(
          appState,
          currentPlan,
          regenerateSlots,
          CUISINE_NAMES,
          previousMeals
        )
      : buildMealPlanPrompt(appState, CUISINE_NAMES, previousMeals);

    // Get model from env (defaults to sonnet)
    const modelId =
      process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

    // Generate meal plan using AI SDK
    const { output } = await generateText({
      model: anthropic(modelId),
      output: Output.object({ schema: MealPlanOnlyResponseSchema }),
      prompt,
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("Meal plan generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
