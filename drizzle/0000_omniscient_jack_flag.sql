CREATE TABLE "players" (
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
