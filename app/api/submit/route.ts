import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const orderData = {
      format: form.get("format") as string,
      customWidth: form.get("customWidth") ? parseInt(form.get("customWidth") as string) : null,
      customHeight: form.get("customHeight") ? parseInt(form.get("customHeight") as string) : null,
      quantity: parseInt((form.get("quantity") as string) || "1"),
      material: form.get("material") as string,
      colorOption: form.get("colorOption") as string,

      // ✅ Poprawione pole zgodne z Prisma schema
      printLengthMultiplier: form.get("printLengthMultiplier") as string,

      // Usuwamy pustą wartość jeśli jest np. finishes: [""]
      // finishes: (form.getAll("finishes") as string[]).filter(f => f.trim() !== ""),

      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: (form.get("phone") as string) || null,
      totalPrice: parseFloat((form.get("totalPrice") as string) || "0"),
    };

    console.log(orderData);

    // 📂 zapis pliku lokalnie
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let filePath = null;
    let fileName = null;
    let fileSizeKB: number | null = null;

    const file = form.get("file") as File | null;

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = file.name.replace(/\s+/g, "_");
      const storedFileName = `${Date.now()}_${safeName}`;
      const fullPath = path.join(uploadDir, storedFileName);

      fs.writeFileSync(fullPath, buffer);

      filePath = `/uploads/${storedFileName}`;
      fileName = file.name;
      fileSizeKB = Math.round(file.size / 1024); // store size in KB
    }

    // 💾 Zapis do bazy
    const created = await prisma.order.create({
      data: {
        ...orderData,
        filePath,
        fileName,
        fileSizeKB,
      },
    });

    return NextResponse.json({ success: true, orderId: created.id });
  } catch (err) {
    console.error("❌ API submit error:", err);
    return NextResponse.json({ success: false, error: "Błąd serwera" }, { status: 500 });
  }
}
