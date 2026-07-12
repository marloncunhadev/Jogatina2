-- SQL Script to set up the database tables in Supabase
-- You can copy and paste this script directly into the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Create the 'players' table
CREATE TABLE IF NOT EXISTS "players" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "style" text NOT NULL,
    "avatar" text NOT NULL,
    "total_wins" integer DEFAULT 0 NOT NULL,
    "average_score" integer DEFAULT 0 NOT NULL,
    "last_played" text DEFAULT 'Nunca' NOT NULL,
    "is_custom" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) on the players table
-- (Optional, but recommended for Supabase production security)
ALTER TABLE "players" ENABLE ROW LEVEL SECURITY;

-- Create policies allowing anyone to view players, and authenticated users to modify them
DROP POLICY IF EXISTS "Allow public read access to players" ON "players";
CREATE POLICY "Allow public read access to players" 
ON "players" FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert access to players" ON "players";
CREATE POLICY "Allow authenticated insert access to players" 
ON "players" FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update access to players" ON "players";
CREATE POLICY "Allow authenticated update access to players" 
ON "players" FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete access to players" ON "players";
CREATE POLICY "Allow authenticated delete access to players" 
ON "players" FOR DELETE 
TO authenticated 
USING (true);

-- 2. Create the 'match_history' table
CREATE TABLE IF NOT EXISTS "match_history" (
    "id" text PRIMARY KEY NOT NULL,
    "match_id" text NOT NULL,
    "date" text NOT NULL,
    "table_name" text NOT NULL,
    "player_name" text NOT NULL,
    "player_id" text REFERENCES "players"("id") ON DELETE SET NULL,
    "score" integer NOT NULL,
    "is_winner" boolean DEFAULT false NOT NULL,
    "game" text DEFAULT 'flip7' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) on the match_history table
ALTER TABLE "match_history" ENABLE ROW LEVEL SECURITY;

-- Create policies allowing anyone to view match_history, and authenticated users to modify them
DROP POLICY IF EXISTS "Allow public read access to match_history" ON "match_history";
CREATE POLICY "Allow public read access to match_history" 
ON "match_history" FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert access to match_history" ON "match_history";
CREATE POLICY "Allow authenticated insert access to match_history" 
ON "match_history" FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete access to match_history" ON "match_history";
CREATE POLICY "Allow authenticated delete access to match_history" 
ON "match_history" FOR DELETE 
TO authenticated 
USING (true);

