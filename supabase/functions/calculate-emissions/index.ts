
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_id } = await req.json();

    if (!company_id) {
      throw new Error('Company ID is required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // First, ensure years are extracted from dates
    await supabaseClient.rpc('update_emission_entries_year');
    
    console.log(`Processing emissions for company: ${company_id}`);

    // Call the enhanced database function to calculate emissions
    const { data, error } = await supabaseClient.rpc('calculate_ghg_emissions', {
      company_id: company_id
    });

    if (error) {
      console.error('Database function error:', error);
      throw error;
    }

    console.log('Calculation results:', data);

    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
        message: `Updated ${data[0]?.updated_rows || 0} entries. ${data[0]?.unmatched_rows || 0} entries remain unmatched.`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in calculate-emissions:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
