CREATE TABLE `mapPools` (
	`id` integer PRIMARY KEY NOT NULL,
	`maps` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` integer PRIMARY KEY NOT NULL,
	`t1_name` text(32) NOT NULL,
	`t2_name` text(32) NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
