import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from "@/lib/supabaseClient"; // Upewnij się, że to jest klient Supabase do użycia serwerowego!

// Interfejs dla danych, które pobieramy z bazy
interface AdminCredential {
  hashed_password: string;
}

export async function POST(request: Request) {
  try {
    // 1. Parsowanie ciała żądania
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Wymagany login i hasło.' },
        { status: 400 } // Bad Request
      );
    }

    // 2. Pobranie hasha hasła z Supabase dla podanej nazwy użytkownika
    const { data, error } = await supabase
      .from('AdminCredentials') // Użyj nazwy Twojej tabeli
      .select('hashed_password')
      .eq('username', username)
      .limit(1)
      .single<AdminCredential>();

    if (error || !data) {
      // Nie ujawniamy, czy użytkownik istnieje, czy hasło jest błędne.
      // Zwracamy ogólny błąd dla zwiększenia bezpieczeństwa.
      console.error("Błąd zapytania do Supabase lub użytkownik nie znaleziony:", error);
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowy login lub hasło.' },
        { status: 200 } // Status 200 jest często używany w takich przypadkach, aby uniknąć wykrycia statusu użytkownika.
      );
    }

    // 3. Bezpieczna weryfikacja hasła za pomocą bcrypt
    const isMatch = await bcrypt.compare(password, data.hashed_password);

    if (isMatch) {
      // Sukces logowania
      // Można tutaj ustawić ciasteczko (cookie) sesji lub JWT, ale na razie zwracamy tylko sukces.
      return NextResponse.json(
        { success: true, message: 'Zalogowano pomyślnie.' },
        { status: 200 }
      );
    } else {
      // Hasło nie pasuje
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowy login lub hasło.' },
        { status: 200 }
      );
    }

  } catch (e) {
    // Obsługa ogólnych błędów, np. błędu parsowania JSON lub błędu serwera
    console.error("Krytyczny błąd serwera podczas logowania:", e);
    return NextResponse.json(
      { success: false, error: 'Wystąpił nieoczekiwany błąd serwera.' },
      { status: 500 } // Internal Server Error
    );
  }
}

// Opcjonalnie: blokowanie innych metod HTTP
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}