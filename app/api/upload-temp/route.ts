// /api/upload-temp/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid'; // Wymaga instalacji pakietu uuid

// Upewnij się, że masz zainstalowany pakiet 'uuid'
// npm install uuid
// npm install -D @types/uuid

// Inicjalizacja klienta Supabase dla operacji serwerowych (z Service Role Key)
// Klucz Service Role Key jest potrzebny do zapisu na serwerze bez konieczności logowania użytkownika.
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
        auth: {
            persistSession: false,
        }
    }
);

// Nazwa twojego Bucketu w Supabase Storage (zapewnij, że taki istnieje)
const BUCKET_NAME = 'images'; 

// Maksymalny dozwolony rozmiar pliku w bajtach (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; 


// Używamy POST do przesyłania danych
export async function POST(req: Request) {
    try {
        // 1. Sprawdzenie, czy żądanie zawiera dane formularza (multipart/form-data)
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "Brak pliku do przesłania." }, { status: 400 });
        }
        
        // 2. Weryfikacja rozmiaru pliku
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "Plik jest za duży (max 10MB)." }, { status: 413 });
        }

        // 3. Konwersja pliku na bufor bajtów
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4. Utworzenie unikalnej ścieżki i nazwy pliku
        // Użyj unikalnego ID, aby zapobiec kolizjom i umieść plik w folderze "temp"
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `uploads/${uniqueFileName}`; // Pliki w folderze 'temp'

        // 5. Przesłanie pliku do Supabase Storage
        const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, buffer, {
                contentType: file.type || 'application/octet-stream',
                cacheControl: '3600', // Czas cachowania
                upsert: false, // Zapobiegaj nadpisaniu
            });

        if (storageError) {
            console.error("❌ Błąd Supabase Storage:", storageError);
            return NextResponse.json({ error: `Błąd przesyłania pliku do storage: ${storageError.message}` }, { status: 500 });
        }
        
        // 6. Zwrot ścieżki pliku
        return NextResponse.json({ 
            message: "Plik przesłany pomyślnie.", 
            filePath: filePath // Ścieżka, którą zapiszesz w bazie Order
        });

    } catch (err: any) {
        console.error("❌ Błąd API upload-temp:", err);
        return NextResponse.json({ error: err.message || "Wystąpił nieznany błąd serwera podczas uploadu." }, { status: 500 });
    }
}