import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { redis, PLAN_INDEX_KEY } from "@/lib/redis";
import type { PlanListItem } from "@/schemas/persistedPlan";
import { getWeekInfoByKey } from "@/utils/weekNumber";

// GET /api/plans — List all saved plan keys for the current user
export async function GET() {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userIndexKey = `${PLAN_INDEX_KEY}:${userId}`;

    // Get all plan keys from the sorted set (sorted by score descending)
    const planKeys = await redis.zrange<string[]>(userIndexKey, 0, -1, { rev: true });

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
