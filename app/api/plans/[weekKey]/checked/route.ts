import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { redis, KV_PREFIX } from "@/lib/redis";
import { z } from "zod";

// Schema for PUT request body
const UpdateCheckedSchema = z.object({
  checkedIds: z.array(z.string()),
});

// GET /api/plans/[weekKey]/checked — Get checked item IDs
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weekKey: string }> }
) {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekKey } = await params;
  const checkedKey = `${KV_PREFIX}:checked:${weekKey}`;

  try {
    const data = await redis.get<string[]>(checkedKey);

    // Upstash auto-deserializes, return empty array if null
    const checkedIds = data ?? [];
    return NextResponse.json({ checkedIds });
  } catch (error) {
    console.error("Failed to fetch checked items:", error);
    return NextResponse.json(
      { error: "Failed to fetch checked items" },
      { status: 500 }
    );
  }
}

// PUT /api/plans/[weekKey]/checked — Update checked item IDs
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ weekKey: string }> }
) {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekKey } = await params;
  const checkedKey = `${KV_PREFIX}:checked:${weekKey}`;

  try {
    const body = await request.json();
    const parsed = UpdateCheckedSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Upstash auto-serializes JSON
    await redis.set(checkedKey, parsed.data.checkedIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update checked items:", error);
    return NextResponse.json(
      { error: "Failed to update checked items" },
      { status: 500 }
    );
  }
}
