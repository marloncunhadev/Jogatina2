import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "active_table_cache.json");

export const dynamic = "force-dynamic";

function getCachedTable() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading active table cache:", e);
  }
  return null;
}

function saveCachedTable(table: any) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(table, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing active table cache:", e);
  }
}

export async function GET() {
  const table = getCachedTable();
  return NextResponse.json(table || { status: "inactive" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    saveCachedTable(body);
    return NextResponse.json({ success: true, table: body });
  } catch (error) {
    console.error("Failed to update active table:", error);
    return NextResponse.json({ error: "Failed to update active table" }, { status: 500 });
  }
}
