import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../src/db/index";
import { players } from "../../../../src/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, style, avatar, totalWins, averageScore, lastPlayed } = body;

    const updateData: Partial<typeof players.$inferInsert> = {};
    if (name !== undefined) updateData.name = name;
    if (style !== undefined) updateData.style = style;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (totalWins !== undefined) updateData.totalWins = totalWins;
    if (averageScore !== undefined) updateData.averageScore = averageScore;
    if (lastPlayed !== undefined) updateData.lastPlayed = lastPlayed;

    const updated = await db
      .update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Failed to update player:", error);
    return NextResponse.json({ error: "Failed to update player in database" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await db
      .delete(players)
      .where(eq(players.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Player deleted successfully", player: deleted[0] });
  } catch (error) {
    console.error("Failed to delete player:", error);
    return NextResponse.json({ error: "Failed to delete player from database" }, { status: 500 });
  }
}
