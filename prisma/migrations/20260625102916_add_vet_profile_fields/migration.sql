-- AlterTable
ALTER TABLE `vet_profiles` ADD COLUMN `about` TEXT NULL,
    ADD COLUMN `location` VARCHAR(150) NULL,
    ADD COLUMN `species` JSON NULL;

-- AddForeignKey
ALTER TABLE `vet_profiles` ADD CONSTRAINT `vet_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
