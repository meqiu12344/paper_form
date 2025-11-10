-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT,
    "fileSizeKB" INTEGER,
    "filePath" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

