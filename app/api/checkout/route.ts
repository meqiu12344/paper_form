import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Inicjalizacja klienta Supabase dla operacji serwerowych (z Service Role Key)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            persistSession: false,
        }
    }
);

export async function POST(req: Request) {
  try {
    // 1. Odbierz dane z formularza, w tym filePath
    const { 
        formData, 
        priceInCents, 
        calculatedPriceNetto, 
        fileName, 
        fileSizeKB,
        filePath, // ODBIERAMY ŚCIEŻKĘ PLIKU
    } = await req.json();

    // 2. Walidacja danych (minimalna)
    if (!priceInCents || priceInCents <= 0 || !formData.email) {
        return NextResponse.json({ error: "Nieprawidłowe dane zamówienia lub cena." }, { status: 400 });
    }

    // 3. Zapis zamówienia do bazy danych ze statusem "pending"
    // Zapisujemy plik od razu, ponieważ został on wgrany w /api/upload-temp
    const { data: order, error: dbError } = await supabase
        .from('Order')
        .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            format: formData.format,
            customWidth: formData.customWidth,
            customHeight: formData.customHeight,
            quantity: formData.quantity,
            material: formData.material,
            colorOption: formData.colorOption,
            printLengthMultiplier: formData.printLengthMultiplier,
            finishes: formData.finishes,
            totalPrice: calculatedPriceNetto,
            status: 'pending_payment',
            fileName: fileName,
            fileSizeKB: fileSizeKB,
            filePath: filePath, // ZAPISUJEMY FAKTYCZNĄ ŚCIEŻKĘ JUŻ TERAZ
        })
        .select('id')
        .single();

    if (dbError || !order) {
        console.error("❌ Błąd zapisu do bazy danych:", dbError);
        return NextResponse.json({ error: `Błąd zapisu zamówienia: ${dbError?.message}` }, { status: 500 });
    }
    
    const orderId = order.id;

    // 4. Utwórz sesję Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: formData.email,
      line_items: [
        {
          price_data: {
            currency: "pln", 
            product_data: { 
                name: "Zamówienie wydruku",
                description: `ID Zamówienia: ${orderId}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // KLUCZOWE: Dodaj ID zamówienia ORAZ ŚCIEŻKĘ PLIKU do metadata Stripe
      metadata: { 
          order_id: orderId.toString(),
          order_email: formData.email,
          file_path: filePath || '', // DODANO ŚCIEŻKĘ PLIKU
      }, 

      // Adresy URL do przekierowania
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/submit?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`, 
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/druk?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Błąd Stripe/API:", err);
    return NextResponse.json({ error: err.message || "Wystąpił nieznany błąd serwera." }, { status: 500 });
  }
}