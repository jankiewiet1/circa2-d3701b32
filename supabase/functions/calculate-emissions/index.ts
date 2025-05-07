import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_id, scope } = await req.json();
    console.log('Processing calculation request:', { company_id, scope });

    if (!company_id) {
      throw new Error('Company ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // 1. Get company preferences
    const { data: preferences, error: prefError } = await supabaseClient
      .from('company_preferences')
      .select('preferred_emission_source')
      .eq('company_id', company_id)
      .single();

    if (prefError) {
      throw new Error(`Failed to fetch company preferences: ${prefError.message}`);
    }

    if (!preferences?.preferred_emission_source) {
      throw new Error('No preferred emission source set for company');
    }

    const preferredSource = preferences.preferred_emission_source;
    console.log('Company preferred source:', preferredSource);

    // 2. Execute calculation
    const { data: results, error: calcError } = await supabaseClient
      .rpc('calculate_scope_emissions', {
        p_company_id: company_id,
        p_scope: scope.toLowerCase(),
        p_source: preferredSource
    });

    if (calcError) {
      throw new Error(`Calculation failed: ${calcError.message}`);
    }

    // 4. Analyze results
    const unmatchedEntries = results.filter(r => 
      !r.co2_factor && !r.ch4_factor && !r.n2o_factor
    );

    if (unmatchedEntries.length > 0) {
      console.warn('Unmatched entries found:', unmatchedEntries);
    }

    // 5. Store results in scope1_emissions table
    const { error: insertError } = await supabaseClient
      .from('scope1_emissions')
      .upsert(
        results.map(r => ({
          entry_id: r.entry_id,
          company_id,
          calculation_date: new Date().toISOString(),
          co2_emissions: r.co2_emissions,
          ch4_emissions: r.ch4_emissions,
          n2o_emissions: r.n2o_emissions,
          total_emissions: r.total_emissions,
          emission_source: preferredSource
        }))
      );

    if (insertError) {
      throw new Error(`Failed to store results: ${insertError.message}`);
    }

    // 6. Return response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          total_entries: results.length,
          unmatched_entries: unmatchedEntries.length,
          results: results,
          summary: {
            total_co2: results.reduce((sum, r) => sum + (r.co2_emissions || 0), 0),
            total_ch4: results.reduce((sum, r) => sum + (r.ch4_emissions || 0), 0),
            total_n2o: results.reduce((sum, r) => sum + (r.n2o_emissions || 0), 0),
            total_emissions: results.reduce((sum, r) => sum + (r.total_emissions || 0), 0),
          }
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Calculation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error.message,
          details: error.toString(),
          debug_info: {
            timestamp: new Date().toISOString()
          }
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
