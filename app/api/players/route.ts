import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../src/db/index";
import { players } from "../../../src/db/schema";
import { desc, eq } from "drizzle-orm";

const INITIAL_PLAYERS = [
  {
    id: 'sora',
    name: 'Sora',
    style: 'Coringa',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6pa0w5xpTZvrK_3uvM1dVoxkye3hsEeSPbHjKscHfobDyn_1OPGmpPEpFuqLlB1cupPScEFS6Klv4UvmsJ1gksOkuPot9sgnCqIWZvpnONcvV3pR2z1QDu6c3jWxb4Wbu0Iet1DMhuXVvuNEpg2XHsQoW_vTEImQyOlhqfpOn-w70yfNBOmNe0iLweBemHQC4jfL6k2hz9VmumeZLYBnjOfEO6tv8s6yNrSOs_NOiDqtw7R7rjDehSw',
    totalWins: 42,
    averageScore: 156,
    lastPlayed: 'Ontem',
    isCustom: false,
  },
  {
    id: 'leo',
    name: 'Leo',
    style: 'Equilibrado',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALr3M0R7WX9w0I18Zt_lPiE7GpggmvfxQ4kDxLM09MMVQebI_bnLDzBzoRcb7kymV5P8DcZ5S4spm3JetUQg9zDbueAwDSuSG8ww-SMZK2GltDWwt4kQqx-ipU0GGd4FrXnGklXKgOSQn9c8qj4Kwu8tEdVrLCcIxsnA3lfT4GKDnCSa3OB-7e5fUhCLwPGQ_hBQ4C6wouoVzRmQuy_8ALQ_FThrOqROIeLqQE2L72qsfidyGfTCr2FQ',
    totalWins: 28,
    averageScore: 132,
    lastPlayed: '3 dias atrás',
    isCustom: false,
  },
  {
    id: 'maya',
    name: 'Maya',
    style: 'Agressiva',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8m_2_6IIJy1TTbhHrcHIUeG00aHs0g_HLzESHhHL3ei1am90AypSYcj3ToPlur5WtCNNffsj1bUJcDabDqUfSYBX8uJkkv_-hIiW5Dy0wMLJit3_1kb-ofO-r7ojEDuAxYLdACV_MFU-gIKktcGLdNnzTAiYlYM26MkzVskBt2-CAAirQnRHTb_mrTA3mn8Obs6jWFMa8DowHoynCNwrefXLVTsvBQINNh_G0zZ-_vNQ4rauhsUUp7w',
    totalWins: 15,
    averageScore: 184,
    lastPlayed: 'Hoje',
    isCustom: false,
  },
  {
    id: 'alex',
    name: 'Alex "A"',
    style: 'Equilibrado',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaZ4tNKiAoYP0kwHUknsEVv98mctmG36cLK2fuDll4zckwqTl0dMrBrzoY_-tjG9Vjc7sPNcSS8J7wsgjTPf3yi5ONBkC8Pe43JDdIW5RUkNiTDmrGm49KnJviA4gINsn5xLaMlTpIP0KXYbq2OEdWMZPlKkfvgrIm72fngAqWQCCMpCgSeNG-G5uleX126_Yg_8IyFxdIAT4Tqdl7r--PhtcTF6nKVis-XT-qQgeE1jgGMgGpLg5XAg',
    totalWins: 35,
    averageScore: 148,
    lastPlayed: '2 semanas atrás',
    isCustom: false,
  },
  {
    id: 'beatriz',
    name: 'Beatriz',
    style: 'Conservador',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXB6xyduz4RfBXW754t5m5r_czyPI_ZHyMqv-TiVa6EXvtD5vVybQYg0J4vBxntoiD6IwOHETzINFQazZdS3OeZg5ZtXu5d7za2NskKyIGosAnrDkiX0ERd7tm514euMNe1EwiPcHD6F8Tzkpoht1YwdDbXpUXKJkekOKu0DtivzQcpebX3t1veA76d-29OzCnkPD6fKjYTCC4zZrme4ETYlJXP1w6PeqU9XgiTaSNgDtf1hDfvVT0Yw',
    totalWins: 19,
    averageScore: 122,
    lastPlayed: '4 dias atrás',
    isCustom: false,
  },
  {
    id: 'carlos',
    name: 'Carlos G.',
    style: 'Conservador',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE1nvKimAgCLNKwsd8Wuwzk_MMJMg785Bg9AeN4pn9IQijUFfrA-Vgj-OFmXEwpLXxJ4R9NPSpud9FA538t7N3Z5d8U72Ka_edn8w_zuxMhoRcjTGaO_ECXH9XEnzjIwUIOiRY0AAgb-J7T1-5E0cwRA6aeK-4ZHPvuywC_k8OS5oE_Jft-CBnQfed9QruFgpiY8nRLFB8BR2Wg_OLIBqrRl1Vy3P7vHeN-VgsXEQ_u5TnLcs8fcI18Q',
    totalWins: 23,
    averageScore: 115,
    lastPlayed: 'Ontem',
    isCustom: false,
  },
  {
    id: 'diana',
    name: 'Diana Z.',
    style: 'Coringa',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5_tyXRXZi25g1bOE8uC8B1qm43fmOkiW9Nn7lgmeZJRN8i4H6x_A8SZMTQigTEVoBDq1zvQjV2pimicSEBZjI5L7mNYtam42j6ejd-Uwp71lBzPUljpg7bN35aaD3KA-JXHi0td-oyprb09spib6m72VUFGlKpeNOPMzYh0QB7DXLcdip9WtxT0hZR5rXJ7PxJl7GoZuEqHJFocKRTVZQvTBohD2aQFWu93ACFGmDe5rwkGpG-E1vuQ',
    totalWins: 30,
    averageScore: 140,
    lastPlayed: 'Hoje',
    isCustom: false,
  },
  {
    id: 'eduardo',
    name: 'Eduardo',
    style: 'Equilibrado',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDsF2Y-K_zyerOuJURBBAeBtCLRG5RE8wnwbIOfUVY-o-7u7O1HLaQhxrOPtrvJWhqQa3yFTvuqkbtPfA6srzxZwKZcYFlBLXyGz-lKY0qY1RWEKNn_B25mrpOMZSo4YXfgoRV9ypWNI99p1GbbEPW-_VwQYj6U5gYx_aG_hbjUr0wYFSVANrM0EASOAxd9J2ZcqpVaYCS7MmtoG1Mtpvo9kZdAvBSm4POf3Fv1blmiEmAQYe3luOwOQ',
    totalWins: 50,
    averageScore: 165,
    lastPlayed: 'Hoje',
    isCustom: false,
  }
];

export async function GET() {
  try {
    const list = await db.select().from(players).orderBy(desc(players.createdAt));
    if (list.length === 0) {
      // Seed with initial players
      await db.insert(players).values(INITIAL_PLAYERS);
      const seededList = await db.select().from(players).orderBy(desc(players.createdAt));
      return NextResponse.json(seededList);
    }
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
