CREATE TABLE `agent_delegations` (
	`id` text PRIMARY KEY,
	`owner_id` text NOT NULL,
	`voice_conversation_id` text NOT NULL,
	`delegation_id` text NOT NULL,
	`request_hash` text NOT NULL,
	`state` text NOT NULL,
	`execution_id` text NOT NULL,
	`lease_expires_at` integer NOT NULL,
	`result` text,
	`error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_agent_delegations_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_agent_delegations_voice_conversation_id_voice_conversations_id_fk` FOREIGN KEY (`voice_conversation_id`) REFERENCES `voice_conversations`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agent_owner_conversation_delegation` ON `agent_delegations` (`owner_id`,`voice_conversation_id`,`delegation_id`);