/*
  Warnings:

  - You are about to drop the `ColorOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Format` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LengthMultiplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Material` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `amount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSessionId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `colorOption` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `format` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `material` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `printLengthMultiplier` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "ColorOption_key_key";

-- DropIndex
DROP INDEX "Format_key_key";

-- DropIndex
DROP INDEX "LengthMultiplier_key_key";

-- DropIndex
DROP INDEX "Material_key_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ColorOption";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Format";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LengthMultiplier";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Material";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "format" TEXT NOT NULL,
    "customWidth" TEXT,
    "customHeight" TEXT,
    "quantity" INTEGER NOT NULL,
    "material" TEXT NOT NULL,
    "colorOption" TEXT NOT NULL,
    "printLengthMultiplier" TEXT NOT NULL,
    "finishes" TEXT,
    "fileName" TEXT,
    "fileSizeKB" INTEGER,
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING'
);
INSERT INTO "new_Order" ("createdAt", "email", "id", "name", "phone", "status") SELECT "createdAt", "email", "id", "name", "phone", "status" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
