DROP TABLE `dtr`;--> statement-breakpoint
CREATE INDEX `time_entries_user_org_date_idx` ON `time_entries` (`user_id`,`org_id`,`date`);--> statement-breakpoint
CREATE INDEX `time_entries_active_idx` ON `time_entries` (`user_id`,`org_id`,`time_out`);--> statement-breakpoint
CREATE INDEX `user_org_user_idx` ON `user_organizations` (`user_id`,`org_id`);--> statement-breakpoint
CREATE INDEX `user_org_org_idx` ON `user_organizations` (`org_id`);