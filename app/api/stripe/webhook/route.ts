// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false, // ważne jeśli używasz pages router; w app router Next 13+ trzeba pobrać request.text()
  },
};

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      // Dane do zapisu — dopasuj według swoich pól
      const orderData = {
        stripeSessionId: session.id,
        email: session.customer_email ?? (session.customer?.email ?? null),
        name: session.metadata?.name ?? null,
        phone: session.metadata?.phone ?? null,
        amount: (session.amount_total ?? session.display_items?.[0]?.amount ?? 0) / 100,
        status: "PAID",
        metadata: session.metadata ?? {},
      };

      // Stwórz rekord Order
      await prisma.order.create({
        data: {
          stripeSessionId: orderData.stripeSessionId,
          email: orderData.email ?? "unknown",
          name: orderData.name,
          phone: orderData.phone,
          amount: orderData.amount,
          status: orderData.status,
          metadata: orderData.metadata,
        },
      });

      console.log("Order saved for session:", session.id);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return new Response("Webhook handler error", { status: 500 });
  }
}
