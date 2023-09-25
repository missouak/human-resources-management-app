CREATE TABLE `actions` (
	`id` varchar(191) NOT NULL DEFAULT (uuid()),
	`name` varchar(191) NOT NULL,
	`description` text,
	`slug` text,
	`applicationId` varchar(191) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `actions_to_profiles` (
	`actionId` varchar(191) NOT NULL,
	`profileId` varchar(191) NOT NULL,
	CONSTRAINT `actions_to_profiles_actionId_profileId` PRIMARY KEY(`actionId`,`profileId`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` varchar(191) NOT NULL DEFAULT (uuid()),
	`name` varchar(191) NOT NULL,
	`description` text,
	`slug` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` varchar(191) NOT NULL DEFAULT (uuid()),
	`name` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` varchar(191) NOT NULL DEFAULT (uuid()),
	`firstName` varchar(191) NOT NULL,
	`lastName` varchar(191) NOT NULL,
	`cin` varchar(191) NOT NULL,
	`gender` enum('male','female'),
	`phoneNumber` varchar(191) NOT NULL,
	`email` text NOT NULL,
	`address` text NOT NULL,
	`birthday` date NOT NULL,
	`maritalStatus` enum('single','married','widowed','divorced') DEFAULT 'single',
	`image` json DEFAULT ('null'),
	`iban` varchar(191) NOT NULL,
	`joinedAt` date NOT NULL,
	`jobTitle` text NOT NULL,
	`serviceId` varchar(191) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_cin_unique` UNIQUE(`cin`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` varchar(191) NOT NULL DEFAULT (uuid()),
	`userId` varchar(191) NOT NULL,
	`username` varchar(191) NOT NULL,
	`imageUrl` text NOT NULL,
	`email` text,
	`firstName` varchar(191),
	`lastName` varchar(191),
	`role` enum('user','admin') DEFAULT 'user',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` varchar(191) NOT NULL DEFAULT (uuid()),
	`name` text NOT NULL,
	`departmentId` varchar(191) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
