-- AlterTable
ALTER TABLE `clinic_reservations`
    ADD COLUMN `payment_method` VARCHAR(20) NOT NULL DEFAULT 'cash',
    ADD COLUMN `payment_status` ENUM('cash_due', 'pending', 'paid', 'partially_refunded', 'failed', 'expired', 'cancelled', 'refunded') NOT NULL DEFAULT 'cash_due',
    ADD COLUMN `idempotency_key` VARCHAR(100) NULL,
    ADD COLUMN `idempotency_fingerprint` CHAR(64) NULL,
    ADD COLUMN `midtrans_order_id` VARCHAR(50) NULL,
    ADD COLUMN `midtrans_transaction_id` VARCHAR(100) NULL,
    ADD COLUMN `snap_token` VARCHAR(255) NULL,
    ADD COLUMN `snap_redirect_url` TEXT NULL,
    ADD COLUMN `payment_provider_status` VARCHAR(50) NULL,
    ADD COLUMN `paid_at` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `clinic_reservations_idempotency_key_key` ON `clinic_reservations`(`idempotency_key`);
CREATE UNIQUE INDEX `clinic_reservations_midtrans_order_id_key` ON `clinic_reservations`(`midtrans_order_id`);
CREATE UNIQUE INDEX `clinic_reservations_midtrans_transaction_id_key` ON `clinic_reservations`(`midtrans_transaction_id`);
CREATE INDEX `clinic_reservations_payment_status_idx` ON `clinic_reservations`(`payment_status`);
