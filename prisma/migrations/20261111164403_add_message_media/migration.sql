-- AlterTable
ALTER TABLE `consultation_messages` ADD COLUMN `attachment_url` LONGTEXT NULL,
    ADD COLUMN `type` VARCHAR(20) NOT NULL DEFAULT 'text';
