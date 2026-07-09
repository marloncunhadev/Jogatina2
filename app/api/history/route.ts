import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../src/db/index";
import { matchHistory } from "../../../src/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db.select().from(matchHistory).orderBy(desc(matchHistory.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    console.error("Failed to fetch match history:", error);
    return NextResponse.json({ error: "Failed to fetch match history from database" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Support saving either a single record or an array of records
    const records = Array.isArray(body) ? body : [body];
    
    if (records.length === 0) {
      return NextResponse.json({ error: "No records provided" }, { status: 400 });
    }

    // Validate fields
    for (const record of records) {
      const { tableName, playerName, score } = record;
      if (!tableName || !playerName || score === undefined) {
        return NextResponse.json({ error: "Missing required fields: tableName, playerName, score" }, { status: 400 });
      }
    }

    const insertedRecords = [];
    for (const record of records) {
      const { id, matchId, date, tableName, playerName, playerId, score, isWinner, game } = record;
      
      const newId = id || 'hist_' + Math.random().toString(36).substring(2, 11);
      const newMatchId = matchId || 'match_' + Date.now();
      const newDate = date || new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
      
      const newRecord = {
        id: newId,
        matchId: newMatchId,
        date: newDate,
        tableName,
        playerName,
        playerId: playerId || null,
        score: parseInt(score) || 0,
        isWinner: isWinner !== undefined ? !!isWinner : false,
        game: game || "flip7",
      };

      const inserted = await db.insert(matchHistory).values(newRecord).returning();
      insertedRecords.push(inserted[0]);
    }

    return NextResponse.json(Array.isArray(body) ? insertedRecords : insertedRecords[0]);
  } catch (error) {
    console.error("Failed to save match history:", error);
    return NextResponse.json({ error: "Failed to save match history to database" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.delete(matchHistory);
    return NextResponse.json({ success: true, message: "Match history cleared successfully" });
  } catch (error) {
    console.error("Failed to clear match history:", error);
    return NextResponse.json({ error: "Failed to clear match history from database" }, { status: 500 });
  }
}

