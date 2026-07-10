import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "active_table_cache.json");

export const dynamic = "force-dynamic";

function getCachedTables(): { [id: string]: any } {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed) {
        if (parsed.tables && typeof parsed.tables === "object") {
          return parsed.tables;
        }
        // If it's a single table directly (legacy format)
        if (parsed.id) {
          return { [parsed.id]: parsed };
        }
      }
    }
  } catch (e) {
    console.error("Error reading active table cache:", e);
  }
  return {};
}

function saveCachedTables(tables: { [id: string]: any }) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ tables }, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing active table cache:", e);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const list = searchParams.get("list");
  
  const tables = getCachedTables();

  if (list === "true") {
    const activeTablesList = Object.values(tables).filter((t: any) => t && t.status === "active");
    // Sort by newest first
    activeTablesList.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    return NextResponse.json({ tables: activeTablesList });
  }

  if (id) {
    const table = tables[id];
    return NextResponse.json(table || { status: "inactive" });
  }

  // Default: return the latest active table
  const activeTablesList = Object.values(tables).filter((t: any) => t && t.status === "active");
  if (activeTablesList.length > 0) {
    // Sort by newest first
    activeTablesList.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    return NextResponse.json(activeTablesList[0]);
  }

  return NextResponse.json({ status: "inactive" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tables = getCachedTables();

    if (body.id) {
      if (body.status === "inactive") {
        tables[body.id] = { ...tables[body.id], status: "inactive" };
      } else {
        tables[body.id] = body;
      }
    } else if (body.status === "inactive") {
      // If we don't have an ID but want to make inactive, try to mark the latest active table as inactive
      const activeTables = Object.values(tables).filter((t: any) => t && t.status === "active");
      if (activeTables.length > 0) {
        activeTables.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        const latest = activeTables[0];
        tables[latest.id] = { ...latest, status: "inactive" };
      }
    }

    saveCachedTables(tables);
    return NextResponse.json({ success: true, table: body });
  } catch (error) {
    console.error("Failed to update active table:", error);
    return NextResponse.json({ error: "Failed to update active table" }, { status: 500 });
  }
}

