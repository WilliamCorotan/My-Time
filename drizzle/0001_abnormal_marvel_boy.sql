CREATE TABLE `time_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`org_id` text NOT NULL,
	`date` text NOT NULL,
	`time_in` text NOT NULL,
	`time_out` text,
	`note` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
