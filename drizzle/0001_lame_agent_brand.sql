ALTER TABLE `employees` MODIFY COLUMN `gender` enum('male','female') NOT NULL DEFAULT 'male';--> statement-breakpoint
ALTER TABLE `employees` MODIFY COLUMN `maritalStatus` enum('single','married','widowed','divorced') NOT NULL DEFAULT 'single';--> statement-breakpoint
ALTER TABLE `profiles` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `employees` ADD `rib` varchar(191) NOT NULL;