/*
  Warnings:

  - You are about to drop the `Repayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `nextDueDate` on the `Loan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "bankAccount" TEXT;
ALTER TABLE "Customer" ADD COLUMN "bankIfsc" TEXT;
ALTER TABLE "Customer" ADD COLUMN "bankName" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Repayment";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Installment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "expectedAmount" REAL NOT NULL,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "penalInterest" REAL NOT NULL DEFAULT 0,
    "totalRemaining" REAL NOT NULL,
    "balanceAfterPayment" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "paidAt" DATETIME,
    "method" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Installment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "loanType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "tenure" INTEGER NOT NULL,
    "interestRate" REAL NOT NULL DEFAULT 0,
    "emi" REAL NOT NULL DEFAULT 0,
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "purpose" TEXT,
    "guarantorName" TEXT,
    "guarantorPhone" TEXT,
    "collateralDetails" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedAt" DATETIME,
    "disbursedAt" DATETIME,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "Loan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Loan" ("amount", "approvedAt", "createdAt", "createdById", "customerId", "emi", "frequency", "guarantorName", "guarantorPhone", "id", "interestRate", "loanType", "pdfUrl", "purpose", "status", "tenure", "updatedAt") SELECT "amount", "approvedAt", "createdAt", "createdById", "customerId", "emi", "frequency", "guarantorName", "guarantorPhone", "id", "interestRate", "loanType", "pdfUrl", "purpose", "status", "tenure", "updatedAt" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
