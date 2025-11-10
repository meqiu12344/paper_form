'use client'
import { useEffect, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const secret = sessionStorage.getItem('stripeClientSecret')
    if (secret) setClientSecret(secret)
  }, [])

  if (!clientSecret) {
    return <p>Ładowanie płatności...</p>
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
