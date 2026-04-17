import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const { data: existing, error: fetchError } = await supabase
      .from("otp_rate_limits")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching rate limit:", fetchError);
      throw fetchError;
    }

    if (existing) {
      const windowStart = new Date(existing.window_start);

      if (windowStart > fiveMinutesAgo) {
        if (existing.request_count >= 3) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please wait 5 minutes." }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error: updateError } = await supabase
          .from("otp_rate_limits")
          .update({ request_count: existing.request_count + 1 })
          .eq("phone", phone);

        if (updateError) {
          console.error("Error updating rate limit:", updateError);
          throw updateError;
        }
      } else {
        const { error: resetError } = await supabase
          .from("otp_rate_limits")
          .update({ request_count: 1, window_start: now.toISOString() })
          .eq("phone", phone);

        if (resetError) {
          console.error("Error resetting rate limit:", resetError);
          throw resetError;
        }
      }
    } else {
      const { error: insertError } = await supabase
        .from("otp_rate_limits")
        .insert({
          phone,
          request_count: 1,
          window_start: now.toISOString(),
        });

      if (insertError) {
        console.error("Error inserting rate limit:", insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Rate limit error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
