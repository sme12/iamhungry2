import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { redis, KV_PREFIX, PLAN_INDEX_KEY } from "@/lib/redis";
import { parsePersistedPlan } from "@/schemas/persistedPlan";

// GET /api/plans/[weekKey] — Get a specific plan
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weekKey: string }> }
) {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekKey } = await params;
  const planKey = `${KV_PREFIX}:plan:${weekKey}`;

  try {
    const data = await redis.get(planKey);

    if (!data) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Upstash auto-deserializes JSON
    const plan = parsePersistedPlan(data);

    if (!plan) {
      console.error("Invalid plan data in Redis for key:", planKey);
      return NextResponse.json({ error: "Invalid plan data" }, { status: 500 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Failed to fetch plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/plans/[weekKey] — Delete a plan and its related data
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ weekKey: string }> }
) {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekKey } = await params;
  const planKey = `${KV_PREFIX}:plan:${weekKey}`;
  const checkedKey = `${KV_PREFIX}:checked:${weekKey}`;

  try {
    // Delete plan data and checked items
    await redis.del(planKey, checkedKey);
    // Remove from shared plan index
    await redis.zrem(PLAN_INDEX_KEY, weekKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete plan:", error);
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
