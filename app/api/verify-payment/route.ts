import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js"; // DODANO

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Inicjalizacja klienta Supabase dla operacji serwerowych (Service Role Key)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Używamy Service Role Key dla bezpiecznej aktualizacji statusu
    {
        auth: {
            persistSession: false,
        }
    }
);

export async function POST(req: Request) {
  try {
    const { sessionId, orderId } = await req.json();

    if (!sessionId || !orderId) {
        return NextResponse.json({ verified: false, error: "Brak ID sesji lub zamówienia." }, { status: 400 });
    }

    // 1. Weryfikacja sesji Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // W metadanych powinny być: order_id i file_path (zapisane w /api/checkout)
    const storedOrderId = session.metadata?.order_id;
    const storedFilePath = session.metadata?.file_path;

    if (session.payment_status === 'paid' && storedOrderId === orderId) {
      
      // Obiekt do aktualizacji statusu
      const updates: { status: string; filePath?: string } = { status: 'paid' };

      // Opcjonalnie: Jeśli ścieżka pliku została przesłana, upewnij się, że została zapisana w bazie
      // (Choć została zapisana już w /api/checkout, ta logika jest zabezpieczeniem)
      if (storedFilePath) {
         updates.filePath = storedFilePath;
      }

      // 2. Aktualizacja statusu zamówienia w bazie danych
      const { error: dbError } = await supabase
          .from('Order')
          .update(updates) 
          .eq('id', orderId);

      if (dbError) {
          console.error("❌ Błąd aktualizacji statusu w bazie danych:", dbError);
          // Mimo błędu DB, płatność Stripe się powiodła
          return NextResponse.json({ verified: true, warning: "Płatność udana, ale problem z aktualizacją bazy danych. Sprawdź ręcznie!" });
      }

      return NextResponse.json({ verified: true, message: "Płatność i aktualizacja bazy danych udana." });

    } else {
        // Płatność nieudana lub status inny niż 'paid'
        // Opcjonalnie: Zmień status w bazie na 'payment_failed'
         await supabase
            .from('Order')
            .update({ status: 'payment_failed' })
            .eq('id', orderId);
            
        return NextResponse.json({ verified: false, error: "Płatność nie została zakończona sukcesem." }, { status: 400 });
    }

  } catch (err: any) {
    console.error("❌ Błąd weryfikacji płatności:", err);
    return NextResponse.json({ verified: false, error: err.message || "Wystąpił nieznany błąd serwera." }, { status: 500 });
  }
}