/*
  Warnings:

  - You are about to drop the column `nome` on the `cartaocredito` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `categoria` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `conta` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `CartaoCredito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Categoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Conta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_userId_fkey`;

-- AlterTable
ALTER TABLE `cartaocredito` DROP COLUMN `nome`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `categoria` DROP COLUMN `nome`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `conta` DROP COLUMN `nome`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `nome`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `sessionToken` VARCHAR(191) NULL,
    ADD COLUMN `tokenExpiresAt` DATETIME(3) NULL;

-- DropTable
DROP TABLE `session`;
