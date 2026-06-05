-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `phone_number` VARCHAR(20) NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'vet', 'shelter', 'admin') NOT NULL DEFAULT 'user',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_triage_histories` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `animal_type` VARCHAR(50) NOT NULL,
    `age` VARCHAR(50) NOT NULL,
    `symptoms` JSON NOT NULL,
    `duration` VARCHAR(100) NOT NULL,
    `additional_condition` TEXT NULL,
    `urgency_level` ENUM('green', 'yellow', 'red') NOT NULL,
    `summary` TEXT NOT NULL,
    `first_aid_advice` JSON NOT NULL,
    `recommendation` TEXT NOT NULL,
    `source` VARCHAR(20) NOT NULL DEFAULT 'stub',
    `disclaimer` TEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_triage_histories_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shelters` (
    `id` VARCHAR(191) NOT NULL,
    `owner_user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `capacity` INTEGER NOT NULL DEFAULT 0,
    `verification_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `verified_at` DATETIME(3) NULL,
    `verified_by_admin_id` VARCHAR(191) NULL,
    `rejection_reason` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `shelters_owner_user_id_idx`(`owner_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `animals` (
    `id` VARCHAR(191) NOT NULL,
    `shelter_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `species` VARCHAR(50) NOT NULL,
    `breed` VARCHAR(100) NULL,
    `age` VARCHAR(50) NULL,
    `gender` VARCHAR(20) NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(255) NULL,
    `is_vaccinated` BOOLEAN NOT NULL DEFAULT false,
    `is_sterilized` BOOLEAN NOT NULL DEFAULT false,
    `adoption_status` VARCHAR(30) NOT NULL DEFAULT 'available',
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `animals_shelter_id_idx`(`shelter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adoption_applications` (
    `id` VARCHAR(191) NOT NULL,
    `animal_id` VARCHAR(191) NOT NULL,
    `applicant_user_id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `address` TEXT NOT NULL,
    `experience` TEXT NULL,
    `reason` TEXT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'submitted',
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `adoption_applications_animal_id_idx`(`animal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vet_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(150) NULL,
    `sip_number` VARCHAR(100) NULL,
    `experience_years` INTEGER NOT NULL DEFAULT 0,
    `consultation_fee` INTEGER NOT NULL DEFAULT 0,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `vet_profiles_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultations` (
    `id` VARCHAR(191) NOT NULL,
    `vet_profile_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `method` VARCHAR(20) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'pending',
    `notes` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `consultations_vet_profile_id_idx`(`vet_profile_id`),
    INDEX `consultations_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescriptions` (
    `id` VARCHAR(191) NOT NULL,
    `consultation_id` VARCHAR(191) NOT NULL,
    `notes` TEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `prescriptions_consultation_id_idx`(`consultation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `price` INTEGER NOT NULL DEFAULT 0,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `image_url` VARCHAR(255) NULL,
    `requires_prescription` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `total_amount` INTEGER NOT NULL DEFAULT 0,
    `shipping_address` TEXT NULL,
    `payment_method` VARCHAR(50) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'pending',
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `orders_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_price` INTEGER NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_items_order_id_idx`(`order_id`),
    INDEX `order_items_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emergency_reports` (
    `id` VARCHAR(191) NOT NULL,
    `reporter_user_id` VARCHAR(191) NOT NULL,
    `animal_type` VARCHAR(50) NOT NULL,
    `condition` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `photo_url` VARCHAR(255) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'open',
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `emergency_reports_reporter_user_id_idx`(`reporter_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation_campaigns` (
    `id` VARCHAR(191) NOT NULL,
    `shelter_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `target_amount` INTEGER NOT NULL,
    `raised_amount` INTEGER NOT NULL DEFAULT 0,
    `urgency` VARCHAR(20) NOT NULL DEFAULT 'normal',
    `deadline` DATETIME(3) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `donation_campaigns_shelter_id_idx`(`shelter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donations` (
    `id` VARCHAR(191) NOT NULL,
    `campaign_id` VARCHAR(191) NOT NULL,
    `donor_user_id` VARCHAR(191) NULL,
    `donor_name` VARCHAR(100) NULL,
    `type` VARCHAR(20) NOT NULL DEFAULT 'money',
    `amount` INTEGER NOT NULL DEFAULT 0,
    `message` TEXT NULL,
    `is_anonymous` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `donations_campaign_id_idx`(`campaign_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ai_triage_histories` ADD CONSTRAINT `ai_triage_histories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animals` ADD CONSTRAINT `animals_shelter_id_fkey` FOREIGN KEY (`shelter_id`) REFERENCES `shelters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adoption_applications` ADD CONSTRAINT `adoption_applications_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultations` ADD CONSTRAINT `consultations_vet_profile_id_fkey` FOREIGN KEY (`vet_profile_id`) REFERENCES `vet_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_consultation_id_fkey` FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_campaigns` ADD CONSTRAINT `donation_campaigns_shelter_id_fkey` FOREIGN KEY (`shelter_id`) REFERENCES `shelters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donations` ADD CONSTRAINT `donations_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `donation_campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
