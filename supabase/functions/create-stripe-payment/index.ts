// supabase/functions/create-stripe-payment/index.ts
// Stripe Payment Intent für GLB Paketversand
//
// Umgebungsvariablen in Supabase Dashboard setzen:
// STRIPE_SECRET_KEY = sk_live_... (oder sk_test_... zum Testen)

// @ts-nocheck
/* eslint-disable */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, tracking_number, destination, currency = 'eur' } = await req.json();

    if (!amount || !tracking_number) {
      return new Response(
        JSON.stringify({ error: 'amount and tracking_number are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripeSecretKey = (globalThis as any).Deno?.env?.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured. Please set STRIPE_SECRET_KEY in Supabase secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // amount muss in Cent sein (z.B. 55 € = 5500)
    const amountInCents = Math.round(amount * 100);

    // Stripe unterstützt in URLSearchParams keine Arrays mit gleichen Keys direkt —
    // wir bauen den Body manuell
    const bodyParts = [
      `amount=${amountInCents}`,
      `currency=${currency}`,
      `metadata[tracking_number]=${encodeURIComponent(tracking_number)}`,
      `metadata[destination]=${encodeURIComponent(destination || '')}`,
      `metadata[service]=GLB_Paketversand`,
      `description=${encodeURIComponent(`GLB Paketversand - ${tracking_number} → ${destination}`)}`,
      // Zahlungsmethoden: Kreditkarte, PayPal, Sofortüberweisung
      `payment_method_types[]=card`,
      `payment_method_types[]=paypal`,
      `payment_method_types[]=sofort`,
    ].join('&');

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParts,
    });

    const paymentIntent = await stripeRes.json();

    if (paymentIntent.error) {
      return new Response(
        JSON.stringify({ error: paymentIntent.error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

