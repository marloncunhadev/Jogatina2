import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../src/db/index";
import { players } from "../../../src/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db.select().from(players).orderBy(desc(players.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return NextResponse.json({ error: "Failed to fetch players from database" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, style, avatar, totalWins, averageScore, lastPlayed, isCustom } = body;

    if (!name || !style || !avatar) {
      return NextResponse.json({ error: "Missing required fields: name, style, avatar" }, { status: 400 });
    }

    const newId = id || 'custom_' + Date.now();
    const newPlayer = {
      id: newId,
      name,
      style,
      avatar,
      totalWins: totalWins || 0,
      averageScore: averageScore || 0,
      lastPlayed: lastPlayed || "Hoje",
      isCustom: isCustom !== undefined ? isCustom : true,
    };

    const inserted = await db.insert(players).values(newPlayer).returning();
    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error("Failed to create player:", error);
    return NextResponse.json({ error: "Failed to save player to database" }, { status: 500 });
  }
}
