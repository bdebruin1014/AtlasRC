import { supabase } from '@/lib/supabase';

/**
 * Convert an opportunity to a project.
 *
 * Validates that the opportunity exists and has not already been converted,
 * then invokes the Supabase edge function `convert-opportunity`. If the edge
 * function is unavailable it falls back to direct database operations.
 */
export async function convertOpportunity({
  opportunity_id,
  project_name,
  project_type,
  owner_entity_id,
  builder_entity_id,
}) {
  // 1. Validate the opportunity exists and is not already converted
  const { data: opportunity, error: fetchError } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunity_id)
    .single();

  if (fetchError || !opportunity) {
    throw new Error('Opportunity not found');
  }

  if (opportunity.stage === 'Converted' || opportunity.project_id) {
    throw new Error('This opportunity has already been converted to a project');
  }

  // 2. Try calling the Supabase edge function
  try {
    const { data, error } = await supabase.functions.invoke(
      'convert-opportunity',
      {
        body: {
          opportunity_id,
          project_name,
          project_type,
          owner_entity_id,
          builder_entity_id,
        },
      },
    );

    if (!error && data?.project_id) {
      return { project_id: data.project_id };
    }

    if (error) {
      console.warn(
        'Edge function returned an error, falling back to direct DB:',
        error.message,
      );
    }
  } catch (e) {
    console.warn(
      'Edge function unavailable, using direct DB operations:',
      e.message,
    );
  }

  // 3. Fallback: direct database operations
  const projectData = {
    name: project_name,
    project_type,
    status: 'active',
    address: opportunity.address,
    city: opportunity.city,
    state: opportunity.state,
    zip_code: opportunity.zip_code,
    county: opportunity.county,
    parcel_id: opportunity.parcel_id,
    acres: opportunity.acres,
    potential_lots: opportunity.potential_lots,
    zoning: opportunity.zoning,
    opportunity_id,
    purchase_price: opportunity.asking_price,
    estimated_value: opportunity.estimated_value,
    assignment_fee: opportunity.assignment_fee,
    earnest_money: opportunity.earnest_money,
    dd_deadline: opportunity.dd_deadline,
    close_date: opportunity.close_date,
    ...(owner_entity_id && { entity_id: owner_entity_id }),
    ...(builder_entity_id && { builder_entity_id }),
  };

  const { data: newProject, error: insertError } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single();

  if (insertError) {
    throw new Error(insertError.message || 'Failed to create project');
  }

  // Mark the opportunity as converted
  await supabase
    .from('opportunities')
    .update({
      project_id: newProject.id,
      stage: 'Converted',
      converted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', opportunity_id);

  return { project_id: newProject.id };
}
