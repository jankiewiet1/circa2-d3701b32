// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Hello from Functions!")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, summary } = await req.json();

    if (!email || !summary) {
      return new Response(JSON.stringify({ error: "Email and summary are required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let emailHtml = `<h1>Your CO₂ Emission Summary</h1>`;
    emailHtml += `<p>Thank you for using our CO₂ calculator!</p>`;
    emailHtml += `<p><strong>Total Emissions:</strong> ${summary.totalCO2.toFixed(2)} kg CO₂e</p>`;
    emailHtml += `<p><strong>Total Social Cost:</strong> €${summary.totalCost.toFixed(2)}</p>`;
    if (summary.fte && summary.fte > 0) {
      emailHtml += `<p><strong>Emissions per FTE:</strong> ${(summary.totalCO2 / summary.fte).toFixed(2)} kg CO₂e</p>`;
    }
    emailHtml += `<h2>Detailed Inputs:</h2><ul>`;
    Object.keys(summary.inputs).forEach(inputKey => {
      const inputDetail = summary.inputs[inputKey];
      if (inputDetail && parseFloat(inputDetail.amount) > 0) {
        emailHtml += `<li>${inputKey}: ${inputDetail.amount} ${inputDetail.unit}</li>`;
      }
    });
    emailHtml += `</ul>`;
    emailHtml += `<p>We'd love to discuss how Circa can help you further. <a href="https://yourwebsite.com/contact">Contact us</a> for a follow-up!</p>`;

    const { data, error: emailError } = await resend.emails.send({
      from: "Circa <info@circa.site>",
      to: [email],
      subject: "Your CO₂ Emission Summary from Circa",
      html: emailHtml,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send email.", details: emailError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully!", emailId: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Function error:", e);
    return new Response(JSON.stringify({ error: "Internal server error.", details: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-summary-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
