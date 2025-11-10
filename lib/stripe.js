// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-01", // użyj aktualnej wersji API (dostosuj jeśli potrzeba)
});
