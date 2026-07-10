CREATE TABLE "match_history" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"date" text NOT NULL,
	"table_name" text NOT NULL,
	"player_name" text NOT NULL,
	"player_id" text,
	"score" integer NOT NULL,
	"is_winner" boolean DEFAULT false NOT NULL,
	"game" text DEFAULT 'flip7' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sala" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"target_score" integer NOT NULL,
	"max_rounds" integer NOT NULL,
	"current_round" integer NOT NULL,
	"status" text NOT NULL,
	"players" text NOT NULL,
	"active_player_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"game_time_seconds" integer DEFAULT 0 NOT NULL,
	"game" text DEFAULT 'flip7' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_history" ADD CONSTRAINT "match_history_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;