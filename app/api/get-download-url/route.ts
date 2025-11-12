// /api/get-download-url/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Używamy Service Role Key dla bezpiecznego dostępu do Storage na serwerze
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
        auth: {
            persistSession: false,
        }
    }
);

const BUCKET_NAME = 'images'; // Użyj tej samej nazwy Bucketu co w /api/upload-temp

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
        return NextResponse.json({ error: "Brak ID zamówienia." }, { status: 400 });
    }

    try {
        // 1. Pobierz filePath dla danego zamówienia
        const { data: order, error: dbError } = await supabase
            .from('Order')
            .select('filePath, fileName')
            .eq('id', orderId)
            .single();

        if (dbError || !order || !order.filePath) {
            console.error("Błąd pobierania ścieżki pliku:", dbError);
            return NextResponse.json({ error: "Nie znaleziono pliku dla tego zamówienia." }, { status: 404 });
        }
        
        // 2. Generowanie tymczasowego, podpisanego URL (ważny 60 sekund)
        // Dzieje się to na serwerze, co jest bezpieczne.
        const { data: urlData, error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(order.filePath, 60, { 
                download: order.fileName // Użycie oryginalnej nazwy pliku do pobrania
            });

        if (storageError || !urlData) {
            console.error("Błąd generowania podpisanego URL:", storageError);
            return NextResponse.json({ error: `Błąd generowania linku: ${storageError?.message}` }, { status: 500 });
        }

        // 3. Zwróć wygenerowany URL do klienta
        return NextResponse.json({ downloadUrl: urlData.signedUrl });

    } catch (err: any) {
        console.error("❌ Błąd API get-download-url:", err);
        return NextResponse.json({ error: err.message || "Wystąpił nieznany błąd serwera." }, { status: 500 });
    }
}