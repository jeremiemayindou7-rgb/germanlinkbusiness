import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone } = await req.json()

    if (!phone) {
      return new Response(JSON.stringify({ error: 'Phone required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 6-stelligen Code generieren
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 Minuten

    // Supabase Client mit Service Role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Alte Codes für diese Nummer löschen
    await supabase.from('whatsapp_otps').delete().eq('phone', phone)

    // Neuen Code speichern
    const { error: dbError } = await supabase.from('whatsapp_otps').insert({
      phone,
      code,
      expires_at: expiresAt.toISOString()
    })

    if (dbError) throw dbError

    // Twilio WhatsApp senden
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')!
    const twilioPhone = Deno.env.get('TWILIO_WHATSAPP_NUMBER')! // z.B. +14155238886

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

    const formData = new URLSearchParams({
      From: `whatsapp:${twilioPhone}`,
      To: `whatsapp:${phone}`,
      Body: `🔐 GermanLink Business\n\nDein Bestätigungscode: *${code}*\n\nGültig für 10 Minuten.\nTeile diesen Code mit niemandem.`
    })

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })

    if (!twilioResponse.ok) {
      const err = await twilioResponse.json()
      throw new Error(err.message || 'Twilio error')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})