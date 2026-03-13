CREATE TABLE `time_change_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`time_entry_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`org_id` text NOT NULL,
	`requested_time_in` text,
	`requested_time_out` text,
	`requested_note` text,
	`reason` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` text,
	`review_note` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tcr_user_org_idx` ON `time_change_requests` (`user_id`,`org_id`);--> statement-breakpoint
CREATE INDEX `tcr_status_idx` ON `time_change_requests` (`org_id`,`status`);--> statement-breakpoint
CREATE INDEX `tcr_entry_idx` ON `time_change_requests` (`time_entry_id`);