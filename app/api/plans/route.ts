import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/auth";
import { redis, KV_PREFIX, PLAN_INDEX_KEY } from "@/lib/redis";
import type { PlanListItem, PersistedPlan } from "@/schemas/persistedPlan";
import { AppStateSchema } from "@/schemas/appState";
import { MealPlanResponseSchema } from "@/schemas/mealPlanResponse";
import { getWeekInfoByKey, getCurrentWeekInfo } from "@/utils/weekNumber";

// GET /api/plans — List all saved plan keys for the current user
export async function GET() {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all plan keys from the sorted set (sorted by score descending)
    const planKeys = await redis.zrange<string[]>(PLAN_INDEX_KEY, 0, -1, { rev: true });

    if (!planKeys || planKeys.length === 0) {
      return NextResponse.json({ plans: [] });
    }

    // Build list items with week info
    const plans: PlanListItem[] = planKeys.map((weekKey) => {
      const info = getWeekInfoByKey(weekKey);
      return {
        weekKey,
        createdAt: "",
        weekNumber: info.weekNumber,
        year: info.year,
        dateRange: info.dateRange,
      };
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// Request body schema for POST
const SavePlanBodySchema = z.object({
  weekKey: z.string().optional(),
  inputState: AppStateSchema,
  result: MealPlanResponseSchema,
});

// POST /api/plans — Save a new plan
export async function POST(request: Request) {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parseResult = SavePlanBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { inputState, result } = parseResult.data;
    const weekKey = parseResult.data.weekKey || getCurrentWeekInfo().weekKey;

    // Build plan object
    const plan: PersistedPlan = {
      weekKey,
      createdAt: new Date().toISOString(),
      inputState,
      result,
    };

    // Save plan to Redis (shared across all users)
    const planKey = `${KV_PREFIX}:plan:${weekKey}`;
    await redis.set(planKey, plan);

    // Add to shared plan index (sorted set with timestamp as score)
    await redis.zadd(PLAN_INDEX_KEY, { score: Date.now(), member: weekKey });

    return NextResponse.json({ weekKey, success: true });
  } catch (error) {
    console.error("Failed to save plan:", error);
    return NextResponse.json(
      { error: "Failed to save plan" },
      { status: 500 }
    );
  }
}
