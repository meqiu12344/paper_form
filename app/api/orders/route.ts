import { NextResponse } from "next/server";
// ❌ Usuwamy import Prisma
// import { prisma } from "@/lib/prisma"; 
// ✅ Dodajemy import Supabase
import { supabase } from "@/lib/supabaseClient"; 

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
      printLengthMultiplier: form.get("printLengthMultiplier") as string,
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: (form.get("phone") as string) || null,
      totalPrice: parseFloat((form.get("totalPrice") as string) || "0"),
    };

    console.log(orderData);

    // 📂 zapis pliku lokalnie (pozostawiamy bez zmian)
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let filePath = null;
    let fileName = null;
    let fileSizeKB: number | null = null;

    const file = form.get("file") as File | null;

    if (file && file.size > 0) {
      // ... (kod zapisu pliku bez zmian)
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

    // 💾 Zapis do bazy Supabase
    const dataToInsert = {
        ...orderData,
        filePath,
        fileName,
        fileSizeKB,
        // Upewnij się, że nazwy kolumn odpowiadają Twojej tabeli w Supabase
    };

    const { data: created, error } = await supabase
        .from("orders") // Zmień na nazwę Twojej tabeli
        .insert([dataToInsert])
        .select(); // Dodaj .select() by uzyskać wstawiony rekord

    if (error) {
        console.error("❌ Supabase insert error:", error);
        // Rzucamy błąd, by wpaść do bloku catch
        throw new Error(`Supabase error: ${error.message}`); 
    }

    // Supabase .insert() z .select() zwraca tablicę w `data`
    const createdOrder = created ? created[0] : null;

    if (!createdOrder) {
        throw new Error("Supabase did not return the created order.");
    }
    
    return NextResponse.json({ success: true, orderId: createdOrder.id });
  } catch (err) {
    console.error("❌ API submit error:", err);
    return NextResponse.json({ success: false, error: "Błąd serwera" }, { status: 500 });
  }
}