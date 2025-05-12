
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Validate request
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { email, summary } = await req.json();
    
    if (!email || !summary) {
      return new Response(JSON.stringify({ error: 'Missing email or summary data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY environment variable not set");
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Circa <no-reply@circa-carbon.com>',
        to: email,
        subject: 'Your Carbon Emissions Summary',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0E5D40;">Your Carbon Emissions Summary</h1>
            <p>Here is a summary of your carbon emissions data:</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <h3>Summary:</h3>
              <p>Total CO2: ${summary.totalCO2} tonnes</p>
              <p>Total Cost: ${summary.totalCost}</p>
              <p>FTE: ${summary.fte}</p>
            </div>
            <p>Thank you for using Circa for your carbon accounting needs.</p>
          </div>
        `
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
