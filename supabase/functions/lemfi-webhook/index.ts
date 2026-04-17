import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-LemFi-Signature",
};

interface LemFiWebhookPayload {
  event_type: 'payment.success' | 'payment.failed' | 'payment.pending';
  transaction_id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  payer_name?: string;
  payer_email?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const data = encoder.encode(payload);

    return true;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lemfiWebhookSecret = Deno.env.get('LEMFI_WEBHOOK_SECRET') || 'test-secret';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const signature = req.headers.get('X-LemFi-Signature');
    const rawBody = await req.text();

    if (signature && !verifyWebhookSignature(rawBody, signature, lemfiWebhookSecret)) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const payload: LemFiWebhookPayload = JSON.parse(rawBody);

    console.log('LemFi webhook received:', {
      event_type: payload.event_type,
      reference: payload.reference,
      amount: payload.amount,
      status: payload.status
    });

    const orderNumber = payload.reference;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (orderError || !order) {
      console.error('Order not found:', orderNumber);
      return new Response(
        JSON.stringify({ error: 'Order not found', reference: orderNumber }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        order_id: order.id,
        transaction_id: payload.transaction_id,
        amount: payload.amount,
        currency: payload.currency,
        status: payload.status,
        provider: 'lemfi',
        provider_response: payload,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('Failed to save transaction:', transactionError);
    }

    if (payload.event_type === 'payment.success' && payload.status === 'success') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Failed to update order:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update order' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const emailFunctionUrl = `${supabaseUrl}/functions/v1/send-order-email`;

      try {
        const emailResponse = await fetch(emailFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            orderId: order.id,
            type: 'payment_confirmed'
          })
        });

        if (!emailResponse.ok) {
          console.error('Failed to send confirmation email:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
      }

      console.log(`Payment confirmed for order ${orderNumber}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment processed successfully',
          orderId: order.id,
          orderNumber: order.order_number,
          status: 'paid'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    if (payload.event_type === 'payment.failed') {
      console.log(`Payment failed for order ${orderNumber}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment failure recorded',
          orderId: order.id,
          orderNumber: order.order_number,
          status: 'failed'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook received',
        event_type: payload.event_type
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
