// supabase/functions/docuseal-webhook/index.ts
// Handles DocuSeal webhook callbacks when documents are signed

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const docusealApiKey = Deno.env.get('DOCUSEAL_API_KEY')
    const docusealUrl = Deno.env.get('DOCUSEAL_URL') || 'https://api.docuseal.co'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse webhook payload
    const payload = await req.json()
    console.log('DocuSeal webhook received:', JSON.stringify(payload, null, 2))

    const { event_type, data } = payload

    // Handle different event types
    switch (event_type) {
      case 'submission.completed': {
        // Document fully signed by all parties
        const submissionId = data.id || data.submission_id

        // Find our signing request
        const { data: signingRequest, error: findError } = await supabase
          .from('document_signing_requests')
          .select('*')
          .eq('docuseal_submission_id', String(submissionId))
          .single()

        if (findError || !signingRequest) {
          console.error('Signing request not found:', submissionId)
          return new Response(JSON.stringify({ error: 'Signing request not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Download the signed document from DocuSeal
        const docResponse = await fetch(
          `${docusealUrl}/api/submissions/${submissionId}`,
          {
            headers: {
              'X-Auth-Token': docusealApiKey || '',
              'Content-Type': 'application/json'
            }
          }
        )

        if (!docResponse.ok) {
          throw new Error('Failed to fetch submission from DocuSeal')
        }

        const submission = await docResponse.json()
        const documentUrl = submission.documents?.[0]?.url || submission.combined_document_url

        // Update signing request status
        await supabase
          .from('document_signing_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            docuseal_document_url: documentUrl
          })
          .eq('id', signingRequest.id)

        // Update all signers to signed
        await supabase
          .from('document_signers')
          .update({
            status: 'signed',
            signed_at: new Date().toISOString()
          })
          .eq('signing_request_id', signingRequest.id)

        console.log('Document completed:', signingRequest.id)
        break
      }

      case 'submitter.completed': {
        // Individual signer completed
        const submitterId = data.id || data.submitter_id

        await supabase
          .from('document_signers')
          .update({
            status: 'signed',
            signed_at: new Date().toISOString()
          })
          .eq('docuseal_submitter_id', String(submitterId))

        console.log('Signer completed:', submitterId)
        break
      }

      case 'submitter.opened':
      case 'submission.viewed': {
        // Document was viewed
        const submissionId = data.submission_id || data.id

        await supabase
          .from('document_signing_requests')
          .update({
            status: 'viewed',
            viewed_at: new Date().toISOString()
          })
          .eq('docuseal_submission_id', String(submissionId))
          .eq('status', 'sent') // Only update if still in sent status

        console.log('Document viewed:', submissionId)
        break
      }

      case 'submission.expired': {
        const submissionId = data.id || data.submission_id

        await supabase
          .from('document_signing_requests')
          .update({ status: 'expired' })
          .eq('docuseal_submission_id', String(submissionId))

        console.log('Document expired:', submissionId)
        break
      }

      case 'submitter.declined': {
        const submitterId = data.id || data.submitter_id
        const submissionId = data.submission_id

        await supabase
          .from('document_signers')
          .update({ status: 'declined' })
          .eq('docuseal_submitter_id', String(submitterId))

        await supabase
          .from('document_signing_requests')
          .update({ status: 'declined' })
          .eq('docuseal_submission_id', String(submissionId))

        console.log('Document declined:', submissionId)
        break
      }

      default:
        console.log('Unhandled event type:', event_type)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
