// supabase/functions/parse-contract/index.ts
// Edge function stub for AI-powered contract parsing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { documentUrl, projectId } = await req.json();

    if (!documentUrl) {
      return new Response(
        JSON.stringify({ error: 'documentUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Integrate with AI service (OpenAI, Anthropic, etc.) to parse contract
    // For now, return a stub response indicating the function is set up
    // but actual parsing is not yet implemented

    const parsedData = {
      status: 'stub',
      message: 'Contract parsing edge function is configured. Connect an AI provider to enable parsing.',
      documentUrl,
      projectId,
      fields: {
        contract_date: null,
        effective_date: null,
        closing_date: null,
        buyer_name: null,
        seller_name: null,
        purchase_price: null,
        earnest_money: null,
        financing_type: null,
        inspection_period_days: null,
        contingencies: [],
      },
    };

    return new Response(
      JSON.stringify({ data: parsedData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
