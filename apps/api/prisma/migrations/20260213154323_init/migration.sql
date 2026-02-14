-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "shopProcessId" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "commissionRate" REAL NOT NULL DEFAULT 2.5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PYG',
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "cardBrand" TEXT,
    "cardLastFour" TEXT,
    "documentType" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "authorizationCode" TEXT,
    "bancardTicket" TEXT,
    "errorMessage" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transactions_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PYG',
    "description" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payment_links_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payment_links_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "grossAmount" REAL NOT NULL,
    "commissionAmount" REAL NOT NULL,
    "netAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "settledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "settlements_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT,
    "transactionId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "merchants_email_key" ON "merchants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_ruc_key" ON "merchants"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_apiKey_key" ON "merchants"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_shopProcessId_key" ON "merchants"("shopProcessId");

-- CreateIndex
CREATE INDEX "merchants_apiKey_idx" ON "merchants"("apiKey");

-- CreateIndex
CREATE INDEX "transactions_merchantId_status_idx" ON "transactions"("merchantId", "status");

-- CreateIndex
CREATE INDEX "transactions_status_createdAt_idx" ON "transactions"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_transactionId_key" ON "payment_links"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_shortCode_key" ON "payment_links"("shortCode");

-- CreateIndex
CREATE INDEX "payment_links_shortCode_idx" ON "payment_links"("shortCode");

-- CreateIndex
CREATE INDEX "payment_links_merchantId_isActive_idx" ON "payment_links"("merchantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "settlements_transactionId_key" ON "settlements"("transactionId");

-- CreateIndex
CREATE INDEX "settlements_merchantId_status_idx" ON "settlements"("merchantId", "status");

-- CreateIndex
CREATE INDEX "audit_logs_merchantId_createdAt_idx" ON "audit_logs"("merchantId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_transactionId_idx" ON "audit_logs"("transactionId");
