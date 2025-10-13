CREATE TABLE `teams` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))) NOT NULL,
	`name` text(32) NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_name_unique` ON `teams` (`name`);--> statement-breakpoint
ALTER TABLE `matches` ADD `map_pool_id` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` ADD `t1_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` ADD `t2_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` DROP COLUMN `t1_name`;--> statement-breakpoint
ALTER TABLE `matches` DROP COLUMN `t2_name`;