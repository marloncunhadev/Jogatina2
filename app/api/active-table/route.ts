import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../src/db/index";
import { sala } from "../../../src/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const list = searchParams.get("list");

    if (list === "true") {
      const dbSalas = await db.select().from(sala).where(eq(sala.status, "active")).orderBy(desc(sala.createdAt));
      const activeTablesList = dbSalas.map((s) => {
        try {
          return {
            ...s,
            players: JSON.parse(s.players),
            createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
          };
        } catch (e) {
          console.error("Error parsing players JSON for sala id:", s.id, e);
          return {
            ...s,
            players: [],
            createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
          };
        }
      });
      return NextResponse.json({ tables: activeTablesList });
    }

    if (id) {
      const dbSalas = await db.select().from(sala).where(eq(sala.id, id)).limit(1);
      if (dbSalas.length > 0) {
        const s = dbSalas[0];
        try {
          return NextResponse.json({
            ...s,
            players: JSON.parse(s.players),
            createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
          });
        } catch (e) {
          console.error("Error parsing players JSON for sala id:", s.id, e);
          return NextResponse.json({
            ...s,
            players: [],
            createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
          });
        }
      }
      return NextResponse.json({ status: "inactive" });
    }

    // Default: return the latest active table
    const dbSalas = await db.select().from(sala).where(eq(sala.status, "active")).orderBy(desc(sala.createdAt)).limit(1);
    if (dbSalas.length > 0) {
      const s = dbSalas[0];
      try {
        return NextResponse.json({
          ...s,
          players: JSON.parse(s.players),
          createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
        });
      } catch (e) {
        console.error("Error parsing players JSON for sala id:", s.id, e);
        return NextResponse.json({
          ...s,
          players: [],
          createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ status: "inactive" });
  } catch (error) {
    console.error("Failed to fetch active table from database:", error);
    return NextResponse.json({ error: "Failed to fetch active table" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.id) {
      if (body.status === "inactive") {
        await db.update(sala)
          .set({ status: "inactive" })
          .where(eq(sala.id, body.id));
      } else {
        const parsedCreatedAt = body.createdAt ? new Date(body.createdAt) : new Date();
        const serializedPlayers = JSON.stringify(body.players);

        const existing = await db.select().from(sala).where(eq(sala.id, body.id)).limit(1);
        if (existing.length > 0) {
          await db.update(sala)
            .set({
              name: body.name,
              targetScore: body.targetScore,
              maxRounds: body.maxRounds,
              currentRound: body.currentRound,
              status: body.status || "active",
              players: serializedPlayers,
              activePlayerIndex: body.activePlayerIndex,
              gameTimeSeconds: body.gameTimeSeconds || 0,
              game: body.game || "flip7",
            })
            .where(eq(sala.id, body.id));
        } else {
          await db.insert(sala)
            .values({
              id: body.id,
              name: body.name,
              targetScore: body.targetScore,
              maxRounds: body.maxRounds,
              currentRound: body.currentRound,
              status: body.status || "active",
              players: serializedPlayers,
              activePlayerIndex: body.activePlayerIndex,
              createdAt: parsedCreatedAt,
              gameTimeSeconds: body.gameTimeSeconds || 0,
              game: body.game || "flip7",
            });
        }
      }
    } else if (body.status === "inactive") {
      const activeSalas = await db.select().from(sala).where(eq(sala.status, "active")).orderBy(desc(sala.createdAt)).limit(1);
      if (activeSalas.length > 0) {
        await db.update(sala)
          .set({ status: "inactive" })
          .where(eq(sala.id, activeSalas[0].id));
      }
    }

    return NextResponse.json({ success: true, table: body });
  } catch (error) {
    console.error("Failed to update active table in database:", error);
    return NextResponse.json({ error: "Failed to update active table" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.update(sala)
      .set({ status: "inactive" })
      .where(eq(sala.status, "active"));
    return NextResponse.json({ success: true, message: "Todas as mesas foram fechadas." });
  } catch (error) {
    console.error("Failed to clear active tables in database:", error);
    return NextResponse.json({ error: "Failed to clear active tables" }, { status: 500 });
  }
}

