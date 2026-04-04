-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "email" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "aadhaar" TEXT,
    "pan" TEXT,
    "dateOfBirth" DATETIME,
    "occupation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "Customer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Loan" (
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
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedAt" DATETIME,
    "nextDueDate" DATETIME,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "Loan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Repayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'CASH',
    "reference" TEXT,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Repayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'SMS',
    "template" TEXT NOT NULL DEFAULT 'CUSTOM',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentById" TEXT,
    CONSTRAINT "Notification_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Notification_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,
    CONSTRAINT "AuditLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerId_key" ON "Customer"("customerId");
