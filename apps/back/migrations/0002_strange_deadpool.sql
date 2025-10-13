ALTER TABLE `mapPools` ALTER COLUMN "maps" TO "maps" text NOT NULL DEFAULT (json_array());--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_matches` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`t1_name` text(32) NOT NULL,
	`t2_name` text(32) NOT NULL,
	`map_picks` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_matches`("id", "t1_name", "t2_name", "map_picks", "created_at") SELECT "id", "t1_name", "t2_name", "map_picks", "created_at" FROM `matches`;--> statement-breakpoint
DROP TABLE `matches`;--> statement-breakpoint
ALTER TABLE `__new_matches` RENAME TO `matches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;