CREATE TABLE `operation_receipts` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`operation_id` text NOT NULL,
	`request_hash` text NOT NULL,
	`result` text NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT `fk_operation_receipts_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`operation_id` text NOT NULL,
	`archived_at` text,
	`creation_hash` text NOT NULL,
	`legacy_page_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_pages_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`token_hash` text NOT NULL UNIQUE,
	`credential_revision` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_devices_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT "devices_demo_slot" CHECK("id" = 'demo')
);
--> statement-breakpoint
ALTER TABLE `checkin_sessions` ADD `device_id` text;--> statement-breakpoint
ALTER TABLE `checkin_sessions` ADD `legacy_draft` text;--> statement-breakpoint
ALTER TABLE `checkin_sessions` ADD `target_entry_id` text;--> statement-breakpoint
ALTER TABLE `checkin_sessions` ADD `target_entry_revision` integer;--> statement-breakpoint
ALTER TABLE `journal_entries` ADD `content` text;--> statement-breakpoint
ALTER TABLE `journal_entries` ADD `properties` text;--> statement-breakpoint
CREATE UNIQUE INDEX `receipt_owner_operation` ON `operation_receipts` (`owner_id`,`operation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `page_owner_operation` ON `pages` (`owner_id`,`operation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `page_legacy_source` ON `pages` (`owner_id`,`legacy_page_id`);--> statement-breakpoint
CREATE INDEX `page_owner` ON `pages` (`owner_id`,`id`);