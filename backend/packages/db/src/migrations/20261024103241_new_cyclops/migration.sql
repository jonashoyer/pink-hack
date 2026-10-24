CREATE TABLE `account` (
	`id` text PRIMARY KEY,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL UNIQUE,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	CONSTRAINT `fk_session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `voice_sessions` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`checkin_id` text NOT NULL,
	`operation_id` text NOT NULL,
	`provider_session_id` text,
	`state` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_voice_sessions_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `voice_tool_calls` (
	`id` text PRIMARY KEY,
	`voice_session_id` text NOT NULL,
	`call_id` text NOT NULL,
	`name` text NOT NULL,
	`arguments_hash` text NOT NULL,
	`result` text NOT NULL,
	CONSTRAINT `fk_voice_tool_calls_voice_session_id_voice_sessions_id_fk` FOREIGN KEY (`voice_session_id`) REFERENCES `voice_sessions`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `checkin_sessions` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`source` text NOT NULL,
	`operation_id` text NOT NULL,
	`stage` text NOT NULL,
	`journal_date` text NOT NULL,
	`draft` text,
	`draft_revision` integer DEFAULT 0 NOT NULL,
	`context_revisions` text NOT NULL,
	`confirmation` text,
	`saved_entry_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_checkin_sessions_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `context_pages` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`sections` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_context_pages_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `day_plans` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`entry_id` text NOT NULL,
	`journal_date` text NOT NULL,
	`source_entry_ids` text NOT NULL,
	`context_revisions` text NOT NULL,
	`items` text NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_day_plans_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_day_plans_entry_id_journal_entries_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`journal_date` text NOT NULL,
	`title` text NOT NULL,
	`original_text` text NOT NULL,
	`note` text NOT NULL,
	`source` text NOT NULL,
	`session_id` text NOT NULL,
	`operation_id` text NOT NULL,
	`context_revisions` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_journal_entries_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_journal_entries_session_id_checkin_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `checkin_sessions`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `observations` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`entry_id` text NOT NULL,
	`metric` text NOT NULL,
	`value` text NOT NULL,
	`unit` text,
	`symptom_name` text,
	`note` text,
	`observed_at` text NOT NULL,
	`confirmation_state` text NOT NULL,
	`source_reference` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	CONSTRAINT `fk_observations_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_observations_entry_id_journal_entries_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`owner_id` text PRIMARY KEY,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`allow_medical_voice_context` integer DEFAULT false NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_profiles_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE UNIQUE INDEX `voice_owner_operation` ON `voice_sessions` (`owner_id`,`operation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `voice_session_call` ON `voice_tool_calls` (`voice_session_id`,`call_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `checkin_owner_operation` ON `checkin_sessions` (`owner_id`,`operation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `context_owner_kind` ON `context_pages` (`owner_id`,`kind`);--> statement-breakpoint
CREATE INDEX `plan_owner_date` ON `day_plans` (`owner_id`,`journal_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `entry_owner_operation` ON `journal_entries` (`owner_id`,`operation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `entry_session` ON `journal_entries` (`session_id`);--> statement-breakpoint
CREATE INDEX `entry_owner_date` ON `journal_entries` (`owner_id`,`journal_date`,`id`);--> statement-breakpoint
CREATE INDEX `observation_owner_entry` ON `observations` (`owner_id`,`entry_id`);