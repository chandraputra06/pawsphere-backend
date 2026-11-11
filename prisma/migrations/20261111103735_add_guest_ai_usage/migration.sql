-- CreateTable
CREATE TABLE `guest_ai_usages` (
    `id` VARCHAR(191) NOT NULL,
    `guest_id` VARCHAR(100) NOT NULL,
    `session_id` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `guest_ai_usages_guest_id_created_at_idx`(`guest_id`, `created_at`),
    UNIQUE INDEX `guest_ai_usages_guest_id_session_id_key`(`guest_id`, `session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
