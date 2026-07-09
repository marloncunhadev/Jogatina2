import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  style: text("style").notNull(), // 'Agressivo' | 'Agressiva' | 'Conservador' | 'Equilibrado' | 'Coringa'
  avatar: text("avatar").notNull(),
  totalWins: integer("total_wins").default(0).notNull(),
  averageScore: integer("average_score").default(0).notNull(),
  lastPlayed: text("last_played").default("Nunca").notNull(),
  isCustom: boolean("is_custom").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matchHistory = pgTable("match_history", {
  id: text("id").primaryKey(),
  matchId: text("match_id").notNull(),
  date: text("date").notNull(),
  tableName: text("table_name").notNull(),
  playerName: text("player_name").notNull(),
  playerId: text("player_id").references(() => players.id, { onDelete: "set null" }),
  score: integer("score").notNull(),
  isWinner: boolean("is_winner").default(false).notNull(),
  game: text("game").default("flip7").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
