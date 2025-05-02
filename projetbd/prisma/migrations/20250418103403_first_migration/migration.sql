-- CreateTable
CREATE TABLE `Utilisateur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `Num_Etudiant` VARCHAR(191) NULL,
    `Matricule` VARCHAR(191) NULL,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `derniere_connexion` DATETIME(3) NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Utilisateur_email_key`(`email`),
    INDEX `idx_utilisateurs_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `Role_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UtilisateurRole` (
    `utilisateur_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,

    INDEX `idx_user_roles`(`utilisateur_id`, `role_id`),
    PRIMARY KEY (`utilisateur_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sujet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `TypeDeSujet` VARCHAR(191) NOT NULL,
    `DateDeDepot` DATE NOT NULL,
    `Delai` DATE NOT NULL,
    `file` LONGBLOB NULL,
    `Titre` VARCHAR(255) NULL,
    `correctionUrl` LONGBLOB NULL,
    `Description` TEXT NULL,
    `sousTitre` VARCHAR(255) NULL,
    `status` ENUM('brouillon', 'Publié') NOT NULL DEFAULT 'brouillon',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Note` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `etudiant_id` INTEGER NOT NULL,
    `sujet_id` INTEGER NOT NULL,
    `Note` DECIMAL(5, 2) NOT NULL,

    INDEX `etudiant_id`(`etudiant_id`),
    INDEX `sujet_id`(`sujet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Soumission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fichier` LONGBLOB NULL,
    `etudiant_id` INTEGER NULL,
    `sujet_id` INTEGER NULL,
    `commentaire` TEXT NULL,
    `dateSoumission` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `etudiant_id`(`etudiant_id`),
    INDEX `sujet_id`(`sujet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UtilisateurRole` ADD CONSTRAINT `UtilisateurRole_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtilisateurRole` ADD CONSTRAINT `UtilisateurRole_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_etudiant_id_fkey` FOREIGN KEY (`etudiant_id`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_sujet_id_fkey` FOREIGN KEY (`sujet_id`) REFERENCES `Sujet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Soumission` ADD CONSTRAINT `Soumission_etudiant_id_fkey` FOREIGN KEY (`etudiant_id`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Soumission` ADD CONSTRAINT `Soumission_sujet_id_fkey` FOREIGN KEY (`sujet_id`) REFERENCES `Sujet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
