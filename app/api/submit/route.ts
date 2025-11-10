import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// 🔑 Inicjalizacja klienta Supabase z kluczami z .env
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // używamy roli serwisowej, bo to backend
);

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // 📦 Dane zamówienia
    const orderData = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: (form.get("phone") as string) || null,
      format: form.get("format") as string,
      customWidth: form.get("customWidth") as string || null,
      customHeight: form.get("customHeight") as string || null,
      quantity: parseInt((form.get("quantity") as string) || "1"),
      material: form.get("material") as string,
      colorOption: form.get("colorOption") as string,
      printLengthMultiplier: form.get("printLengthMultiplier") as string,
      finishes: (form.get("finishes") as string) || null,
      totalPrice: parseFloat((form.get("totalPrice") as string) || "0"),
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    // 📂 Obsługa pliku (upload do Supabase Storage)
    const file = form.get("file") as File | null;
    let filePath: string | null = null;
    let fileName: string | null = null;
    let fileSizeKB: number | null = null;

    if (file && file.size > 0) {
      const safeName = file.name.replace(/\s+/g, "_");
      const storedFileName = `${Date.now()}_${safeName}`;
      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(storedFileName, arrayBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Błąd uploadu pliku:", uploadError);
        return NextResponse.json({ success: false, error: "Błąd uploadu pliku" }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(storedFileName);

      filePath = publicUrlData.publicUrl;
      fileName = file.name;
      fileSizeKB = Math.round(file.size / 1024);
    }

    // 💾 Zapis do bazy Supabase (tabela "Order")
    const { data, error } = await supabase
      .from("Order")
      .insert([{ ...orderData, filePath, fileName, fileSizeKB }])
      .select()
      .single();

    if (error) {
      console.error("Błąd zapisu do bazy:", error);
      return NextResponse.json({ success: false, error: "Błąd zapisu do bazy" }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId: data.id });
  } catch (err) {
    console.error("❌ API submit error:", err);
    return NextResponse.json({ success: false, error: "Błąd serwera" }, { status: 500 });
  }
}
