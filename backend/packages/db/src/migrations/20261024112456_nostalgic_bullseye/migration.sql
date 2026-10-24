CREATE TABLE `browser_voice_sessions` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`conversation_id` text,
	`operation_id` text NOT NULL,
	`provider_session_id` text,
	`state` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_browser_voice_sessions_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_browser_voice_sessions_conversation_id_voice_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `voice_conversations`(`id`)
);
--> statement-breakpoint
CREATE TABLE `browser_voice_tool_calls` (
	`id` text PRIMARY KEY,
	`voice_session_id` text NOT NULL,
	`call_id` text NOT NULL,
	`name` text NOT NULL,
	`arguments_hash` text NOT NULL,
	`result` text NOT NULL,
	CONSTRAINT `fk_browser_voice_tool_calls_voice_session_id_browser_voice_sessions_id_fk` FOREIGN KEY (`voice_session_id`) REFERENCES `browser_voice_sessions`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `journal_documents` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`journal_date` text NOT NULL,
	`title` text NOT NULL,
	`original_text` text NOT NULL,
	`content` text NOT NULL,
	`properties` text NOT NULL,
	`source` text NOT NULL,
	`device_id` text,
	`capture_id` text NOT NULL,
	`voice_conversation_id` text,
	`session_id` text,
	`legacy_entry_id` text,
	`operation_id` text NOT NULL,
	`context_revisions` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_journal_documents_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `voice_conversations` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`device_id` text,
	`source` text NOT NULL,
	`target_entry_id` text,
	`last_entry_id` text,
	`state` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_voice_conversations_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
ALTER TABLE `devices` ADD `lease_id` text;--> statement-breakpoint
ALTER TABLE `devices` ADD `lease_expires_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `browser_voice_owner_operation` ON `browser_voice_sessions` (`owner_id`,`operation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `browser_voice_session_call` ON `browser_voice_tool_calls` (`voice_session_id`,`call_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `document_owner_operation` ON `journal_documents` (`owner_id`,`operation_id`);--> statement-breakpoint
CREATE INDEX `document_owner_date` ON `journal_documents` (`owner_id`,`journal_date`,`id`);--> statement-breakpoint
CREATE INDEX `conversation_owner` ON `voice_conversations` (`owner_id`,`id`);