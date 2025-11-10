'use server'

import { headers } from 'next/headers'

import { stripe } from '../../lib/stripe'

export async function fetchClientSecret() {
  const origin = (await headers()).get('origin')

  // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: "payment",
    currency: "pln",
    line_items: [
        {
        price_data: {
            currency: "pln",
            product_data: { name: "DAS" }, // np. "Opłata za konsultację"
            unit_amount: 1200,
        },
        quantity: 1,
        },
    ],
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    });


  return session.client_secret
}