
// Follow Deno deploy edge function format for Supabase Edge Functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Send summary email function loaded");

const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { email, company_id, date_range } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Sending summary email to ${email}`);
    
    // In a real implementation, you'd use a service like SendGrid, AWS SES, or other email providers
    // For now, we'll just simulate a successful email send
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Summary email has been sent to ${email}`,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
