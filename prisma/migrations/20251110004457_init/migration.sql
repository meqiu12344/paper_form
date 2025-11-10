-- CreateTable
CREATE TABLE "Format" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "width_mm" INTEGER NOT NULL,
    "height_mm" INTEGER NOT NULL,
    "price_pln_netto" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price_multiplier" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "ColorOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "multiplier" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "LengthMultiplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "multiplier" INTEGER NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stripeSessionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Format_key_key" ON "Format"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Material_key_key" ON "Material"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ColorOption_key_key" ON "ColorOption"("key");

-- CreateIndex
CREATE UNIQUE INDEX "LengthMultiplier_key_key" ON "LengthMultiplier"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
