ALTER TABLE `checkin_sessions` ADD `voice_context_revisions` text;--> statement-breakpoint
ALTER TABLE `checkin_sessions` ADD `confirmation_operation_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `checkin_confirmation_operation` ON `checkin_sessions` (`owner_id`,`confirmation_operation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `plan_one_accepted_per_day` ON `day_plans` (`owner_id`,`journal_date`) WHERE "day_plans"."state" = 'accepted';