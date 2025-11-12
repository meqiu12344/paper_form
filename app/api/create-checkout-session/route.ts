// /api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: "maniak.mateusz@wp.pl", 
      line_items: [
        {
          price_data: {
            currency: "pln", 
            product_data: { name: "Zamówienie wydruku" },
            unit_amount: 12, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/submit`, 
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/druk`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Błąd Stripe:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}