CREATE TABLE "password" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teams" RENAME COLUMN "password" TO "passwordId";