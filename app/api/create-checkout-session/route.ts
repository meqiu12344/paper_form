// app/api/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // oczekujemy: amount (string/number, PLN), email, name, phone, metadata (opcjonalnie obiekt)
    const { amount, email, name, phone, metadata } = body;

    if (!amount || !email) {
      return NextResponse.json({ error: "Missing required fields: amount or email" }, { status: 400 });
    }

    const unit_amount = Math.round(Number(amount) * 100); // PLN -> grosze

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: `Zamówienie wydruku - ${name ?? email}`,
            },
            unit_amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        ...(
          typeof metadata === "object" && metadata !== null
            ? Object.fromEntries(Object.entries(metadata).map(([k, v]) => [k, String(v)]))
            : {}
        ),
        // dodatkowe pola
        phone: phone ?? "",
        frontend_amount_pln: String(amount),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    });

    // Zwróć URL sesji (redirect user)
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("create-checkout-session error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
