import { NextResponse } from "next/server";
// ❌ Usuwamy importy dla lokalnego zapisu
// import fs from "fs";
// import path from "path";

// ✅ Dodajemy import Supabase
import { supabase } from "@/lib/supabaseClient"; 

// Wymagane dla Next.js do obsługi FormData i Buffer
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 1. Parsowanie danych z formularza
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

    console.log("Dane zamówienia:", orderData);

    // Zmienne do przechowywania informacji o pliku
    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileSizeKB: number | null = null;

    const file = form.get("file") as File | null;

    if (file && file.size > 0) {
        // 2. Przekształcenie pliku na Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Przygotowanie unikalnej nazwy i ścieżki w Storage
        const safeName = file.name.replace(/\s+/g, "_");
        // Ścieżka w Buckecie (np. folder orders + unikalna nazwa)
        const storedFilePath = `orders/${Date.now()}_${safeName}`; 
        // ⚠️ Upewnij się, że ten Bucket istnieje w Supabase!
        const bucketName = "uploads"; 

        // 4. Przesyłanie do Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(storedFilePath, buffer, {
                contentType: file.type || "application/octet-stream",
                upsert: false, 
            });

        if (uploadError) {
            console.error("❌ Supabase Storage upload error:", uploadError);
            throw new Error(`Storage upload error: ${uploadError.message}`);
        }

        // 5. Pobranie publicznego URL do pliku
        const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(storedFilePath);

        fileUrl = urlData.publicUrl; // URL do zapisu w bazie danych
        fileName = file.name;
        fileSizeKB = Math.round(file.size / 1024); // Rozmiar w KB
    }

    // 6. Zapis danych zamówienia (w tym URL do pliku) do tabeli w Supabase
    const dataToInsert = {
        ...orderData,
        fileUrl, // Zapisujemy URL do pliku zamiast lokalnej ścieżki
        fileName,
        fileSizeKB,
    };

    const { data: created, error: insertError } = await supabase
        .from("orders") // ⚠️ Zmień na nazwę Twojej tabeli
        .insert([dataToInsert])
        .select(); 

    if (insertError) {
        console.error("❌ Supabase insert error:", insertError);
        throw new Error(`Supabase error: ${insertError.message}`); 
    }

    const createdOrder = created ? created[0] : null;

    if (!createdOrder) {
        throw new Error("Supabase did not return the created order.");
    }
    
    // 7. Zwrot pomyślnej odpowiedzi
    return NextResponse.json({ success: true, orderId: createdOrder.id });
  } catch (err) {
    console.error("❌ API submit error:", err);
    // 8. Obsługa błędów
    return NextResponse.json(
      { success: false, error: "Błąd serwera. Spróbuj ponownie lub skontaktuj się z nami." }, 
      { status: 500 }
    );
  }
}