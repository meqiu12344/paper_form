import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic"; // żeby API działało zawsze w dev/edge

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Pobranie pól tekstowych
    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const format = formData.get("format")?.toString() || "";
    const customWidth = formData.get("customWidth")?.toString() || null;
    const customHeight = formData.get("customHeight")?.toString() || null;
    const quantity = Number(formData.get("quantity")) || 1;
    const material = formData.get("material")?.toString() || "";
    const colorOption = formData.get("colorOption")?.toString() || "";
    const printLengthMultiplier = formData.get("printLengthMultiplier")?.toString() || "";
    const finishes = formData.get("finishes")?.toString() || "";
    const totalPrice = Number(formData.get("totalPrice")) || 0;

    // 🔹 Obsługa pliku
    let fileName: string | null = null;
    let filePath: string | null = null;
    let fileSizeKB: number | null = null;

    const file = formData.get("file") as File | null;
    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      fileName = `${Date.now()}_${file.name}`;
      filePath = `/uploads/${fileName}`;
      fileSizeKB = Math.round(buffer.byteLength / 1024);

      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    }

    // 🔹 Zapis w bazie
    const order = await prisma.order.create({
      data: {
        name,
        email,
        phone,
        format,
        customWidth,
        customHeight,
        quantity,
        material,
        colorOption,
        printLengthMultiplier,
        finishes,
        totalPrice,
        fileName,
        fileSizeKB,
        filePath,
      },
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Błąd przy zapisie zamówienia" }, { status: 500 });
  }
}

export async function GET() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(orders);
}
