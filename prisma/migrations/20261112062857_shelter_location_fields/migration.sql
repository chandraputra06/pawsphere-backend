-- AlterTable
ALTER TABLE `shelters` ADD COLUMN `is_open_now` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `operating_hours` VARCHAR(50) NULL,
    MODIFY `owner_user_id` VARCHAR(191) NULL;
