import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getConfig } from "../config.ts";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getConfig();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const batchSize = 100;
  let cursor: string | null = null;
  let hasMore = true;
  const results: any[] = [];

  while (hasMore) {
    const { data: entries, error: fetchErr } = await supabase.rpc(
      "get_entries_without_calculations",
      { batch_limit: batchSize, p_cursor: cursor }
    );
    if (fetchErr) throw fetchErr;
    if (!entries?.length) break;

    const batchResults = await Promise.all(
      entries.map(async (e: any) => {
        const { error } = await supabase.rpc(
          "calculate_emissions_for_entry",
          { p_entry_id: e.id }
        );
        return { id: e.id, success: !error, error: error?.message };
      })
    );
    results.push(...batchResults);

    cursor  = entries[entries.length - 1].id;
    hasMore = entries.length === batchSize;
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...CORS, "Content-Type": "application/json" }
  });
});
