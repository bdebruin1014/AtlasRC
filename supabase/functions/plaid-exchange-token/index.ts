import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Configuration, PlaidApi, PlaidEnvironments } from 'https://esm.sh/plaid@12.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { entity_id, public_token, institution, accounts } = await req.json();

    // Initialize Plaid
    const configuration = new Configuration({
      basePath: PlaidEnvironments[Deno.env.get('PLAID_ENV') || 'sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
          'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
        },
      },
    });
    const plaidClient = new PlaidApi(configuration);

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Save connection
    const { data: connection, error: connError } = await supabaseClient
      .from('plaid_connections')
      .insert({
        entity_id,
        plaid_item_id: itemId,
        plaid_access_token: accessToken, // Should encrypt this!
        plaid_institution_id: institution.institution_id,
        institution_name: institution.name,
        status: 'active',
      })
      .select()
      .single();

    if (connError) throw connError;

    // Create bank accounts for each account
    for (const account of accounts) {
      // Find or create GL account for this bank account
      let glAccountId;

      // Check if GL account exists
      const { data: existingGl } = await supabaseClient
        .from('chart_of_accounts')
        .select('id')
        .eq('entity_id', entity_id)
        .eq('account_name', account.name)
        .single();

      if (existingGl) {
        glAccountId = existingGl.id;
      } else {
        // Create new GL account
        const accountType = account.subtype === 'credit card' ? 'liability' : 'asset';
        const accountNumber = account.subtype === 'credit card' ? '2050' : '1050';

        const { data: newGl } = await supabaseClient
          .from('chart_of_accounts')
          .insert({
            entity_id,
            account_number: accountNumber,
            account_name: account.name,
            account_type: accountType,
            normal_balance: accountType === 'asset' ? 'debit' : 'credit',
          })
          .select()
          .single();

        glAccountId = newGl?.id;
      }

      // Create bank account
      await supabaseClient
        .from('bank_accounts')
        .insert({
          entity_id,
          account_name: account.name,
          account_type: account.subtype === 'credit card' ? 'credit_card' : account.subtype,
          bank_name: institution.name,
          account_number_last4: account.mask,
          plaid_account_id: account.id,
          plaid_item_id: connection.id,
          gl_account_id: glAccountId,
          is_connected: true,
          current_balance: account.balances?.current || 0,
          available_balance: account.balances?.available || 0,
        });
    }

    return new Response(
      JSON.stringify({ success: true, connection_id: connection.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
