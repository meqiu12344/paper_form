// app/api/submit/route.ts
import { NextResponse } from "next/server";
import { IncomingMessage } from "http";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

export const runtime = "nodejs"; // wymagane dla formidable

// Helper do parsowania form-data
export async function parseForm(req: Request) {
  return new Promise<{ fields: any; files: any }>((resolve, reject) => {
    const nodeReq = req as unknown as IncomingMessage;
    const form = formidable({ multiples: false, maxFileSize: 10 * 1024 * 1024 }); // 10MB

    form.parse(nodeReq, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export async function POST(req: Request) {
  try {
    const { fields, files } = await parseForm(req);

    // Ustawienie Supabase (serwerowy klient)
    const SUPA_URL = process.env.SUPABASE_URL!;
    const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supa = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false }});

    // Przygotuj dane
    const orderData = {
      format: fields.format as string,
      customWidth: fields.customWidth ? parseInt(fields.customWidth) : null,
      customHeight: fields.customHeight ? parseInt(fields.customHeight) : null,
      quantity: parseInt(fields.quantity || "1"),
      material: fields.material as string,
      colorOption: fields.colorOption as string,
      printLengthMult: fields.printLengthMultiplier as string,
      finishes: fields.finishes ? (Array.isArray(fields.finishes) ? fields.finishes : [fields.finishes]) : [],
      name: fields.name as string,
      email: fields.email as string,
      phone: fields.phone as string || null,
      calculated_price: fields.calculatedPrice as string || "0.00",
    };

    // Upload pliku (jeśli jest)
    let file_path = null;
    let file_name = null;
    let file_size = null;

    if (files && files.file) {
      const f = files.file as formidable.File;
      const fileBuffer = fs.readFileSync(f.filepath);
      const ext = path.extname(f.originalFilename || f.newFilename || "upload");
      const key = `orders/${Date.now()}_${(f.originalFilename || f.newFilename).replace(/\s+/g,'_')}`;

      const { data, error: upErr } = await supa.storage
        .from("uploads")
        .upload(key, fileBuffer, { upsert: false, contentType: f.mimetype || undefined });

      if (upErr) {
        console.error("Supabase upload error:", upErr);
        return NextResponse.json({ error: "Błąd uploadu pliku" }, { status: 500 });
      }

      file_path = data?.path || key;
      file_name = f.originalFilename || "file";
      file_size = f.size || null;
    }

    // Zapis do bazy (Prisma)
    const created = await prisma.order.create({
      data: {
        format: orderData.format,
        customWidth: orderData.customWidth,
        customHeight: orderData.customHeight,
        quantity: orderData.quantity,
        material: orderData.material,
        colorOption: orderData.colorOption,
        printLengthMult: orderData.printLengthMult,
        finishes: orderData.finishes,
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        file_path,
        file_name,
        file_size,
        calculated_price: orderData.calculated_price,
      }
    });

    return NextResponse.json({ message: "OK", orderId: created.id }, { status: 200 });
  } catch (err) {
    console.error("API submit error:", err);
    return NextResponse.json({ error: "Wystąpił błąd serwera." }, { status: 500 });
  }
}
