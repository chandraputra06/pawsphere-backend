-- AlterTable
ALTER TABLE `emergency_reports` MODIFY `photo_url` LONGTEXT NULL;

-- AddForeignKey
ALTER TABLE `emergency_reports` ADD CONSTRAINT `emergency_reports_reporter_user_id_fkey` FOREIGN KEY (`reporter_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
