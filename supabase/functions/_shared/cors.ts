// supabase/functions/_shared/cors.ts

// Standard CORS headers allowing GET, POST, PUT, DELETE, OPTIONS from any origin during development
// For production, restrict the origin to your actual frontend domain
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin (adjust for production)
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}; 