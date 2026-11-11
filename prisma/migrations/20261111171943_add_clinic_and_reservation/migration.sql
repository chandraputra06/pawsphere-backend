-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('user', 'vet', 'shelter', 'klinik', 'admin') NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE `clinics` (
    `id` VARCHAR(191) NOT NULL,
    `owner_user_id` VARCHAR(191) NULL,
    `number` INTEGER NOT NULL DEFAULT 0,
    `name` VARCHAR(150) NOT NULL,
    `short_area` VARCHAR(100) NULL,
    `area` VARCHAR(150) NOT NULL,
    `address` VARCHAR(255) NULL,
    `distance` VARCHAR(30) NULL,
    `distance_km` DOUBLE NULL,
    `is_open_now` BOOLEAN NOT NULL DEFAULT true,
    `open_status` VARCHAR(100) NULL,
    `hours` VARCHAR(100) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `image` LONGTEXT NULL,
    `images` JSON NULL,
    `doctor` JSON NULL,
    `hospitalization_badge` VARCHAR(100) NULL,
    `hospitalization_full` BOOLEAN NOT NULL DEFAULT false,
    `boarding_badge` VARCHAR(100) NULL,
    `starting_price` VARCHAR(50) NULL,
    `home_care_price` VARCHAR(50) NULL,
    `inpatient_price` VARCHAR(50) NULL,
    `boarding_price` VARCHAR(50) NULL,
    `available_services` JSON NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT true,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `clinics_owner_user_id_idx`(`owner_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_reservations` (
    `id` VARCHAR(191) NOT NULL,
    `clinic_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `service_type` VARCHAR(30) NOT NULL,
    `care_method` VARCHAR(20) NOT NULL,
    `pet_name` VARCHAR(100) NOT NULL,
    `pet_type` VARCHAR(100) NULL,
    `pet_age` VARCHAR(50) NULL,
    `pet_weight` VARCHAR(50) NULL,
    `doctor_name` VARCHAR(150) NULL,
    `schedule_date` VARCHAR(100) NULL,
    `schedule_time` VARCHAR(50) NULL,
    `check_in_date` VARCHAR(50) NULL,
    `check_out_date` VARCHAR(50) NULL,
    `complaint` TEXT NULL,
    `notes` TEXT NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(30) NULL,
    `estimated_total` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `booking_code` VARCHAR(50) NOT NULL,
    `queue_number` VARCHAR(20) NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `clinic_reservations_booking_code_key`(`booking_code`),
    INDEX `clinic_reservations_clinic_id_idx`(`clinic_id`),
    INDEX `clinic_reservations_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `clinics` ADD CONSTRAINT `clinics_owner_user_id_fkey` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_reservations` ADD CONSTRAINT `clinic_reservations_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_reservations` ADD CONSTRAINT `clinic_reservations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
