-- CreateTable
CREATE TABLE `loan_applications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `nationalId` VARCHAR(30) NOT NULL,
    `loanAmount` DECIMAL(12, 2) NOT NULL,
    `loanPurpose` VARCHAR(100) NOT NULL,
    `monthlyIncome` DECIMAL(12, 2) NULL,
    `employer` VARCHAR(150) NULL,
    `notes` TEXT NULL,
    `status` ENUM('PENDING', 'REVIEWING', 'CALLED', 'APPROVED', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    `emailSent` BOOLEAN NOT NULL DEFAULT false,
    `ipAddress` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `loan_applications_status_idx`(`status`),
    INDEX `loan_applications_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
