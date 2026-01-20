// src/services/inspectionService.js
// Property Management Inspections Service

import { supabase } from '@/lib/supabase';

// ============================================
// INSPECTION TYPES & TEMPLATES
// ============================================

export const INSPECTION_TYPES = [
  { id: 'move_in', label: 'Move-In Inspection', icon: 'DoorOpen' },
  { id: 'move_out', label: 'Move-Out Inspection', icon: 'DoorClosed' },
  { id: 'routine', label: 'Routine Inspection', icon: 'ClipboardCheck' },
  { id: 'annual', label: 'Annual Inspection', icon: 'Calendar' },
  { id: 'drive_by', label: 'Drive-By Inspection', icon: 'Car' },
  { id: 'maintenance', label: 'Maintenance Inspection', icon: 'Wrench' },
  { id: 'safety', label: 'Safety Inspection', icon: 'Shield' },
  { id: 'pre_lease', label: 'Pre-Lease Inspection', icon: 'FileSearch' },
];

export const INSPECTION_STATUSES = [
  { id: 'scheduled', label: 'Scheduled', color: 'blue' },
  { id: 'in_progress', label: 'In Progress', color: 'yellow' },
  { id: 'completed', label: 'Completed', color: 'green' },
  { id: 'cancelled', label: 'Cancelled', color: 'gray' },
  { id: 'requires_followup', label: 'Requires Follow-up', color: 'orange' },
];

export const ITEM_CONDITIONS = [
  { id: 'excellent', label: 'Excellent', color: 'green', score: 5 },
  { id: 'good', label: 'Good', color: 'emerald', score: 4 },
  { id: 'fair', label: 'Fair', color: 'yellow', score: 3 },
  { id: 'poor', label: 'Poor', color: 'orange', score: 2 },
  { id: 'damaged', label: 'Damaged', color: 'red', score: 1 },
  { id: 'na', label: 'N/A', color: 'gray', score: null },
];

// Default inspection template - rooms and items to check
export const DEFAULT_INSPECTION_TEMPLATE = {
  sections: [
    {
      name: 'Exterior',
      items: [
        'Roof/Gutters',
        'Siding/Paint',
        'Windows (exterior)',
        'Front Door',
        'Back Door',
        'Garage Door',
        'Driveway/Walkway',
        'Landscaping',
        'Fencing',
        'Mailbox',
      ]
    },
    {
      name: 'Living Room',
      items: [
        'Walls/Ceiling',
        'Flooring',
        'Windows',
        'Light Fixtures',
        'Electrical Outlets',
        'HVAC Vents',
        'Smoke Detector',
        'Doors',
      ]
    },
    {
      name: 'Kitchen',
      items: [
        'Walls/Ceiling',
        'Flooring',
        'Countertops',
        'Cabinets',
        'Sink/Faucet',
        'Refrigerator',
        'Stove/Oven',
        'Dishwasher',
        'Microwave',
        'Garbage Disposal',
        'Light Fixtures',
        'Electrical Outlets',
        'Exhaust Fan',
      ]
    },
    {
      name: 'Master Bedroom',
      items: [
        'Walls/Ceiling',
        'Flooring',
        'Windows',
        'Closet',
        'Light Fixtures',
        'Electrical Outlets',
        'Smoke Detector',
        'Doors',
      ]
    },
    {
      name: 'Bedroom 2',
      items: [
        'Walls/Ceiling',
        'Flooring',
        'Windows',
        'Closet',
        'Light Fixtures',
        'Electrical Outlets',
        'Smoke Detector',
        'Doors',
      ]
    },
    {
      name: 'Bedroom 3',
      items: [
        'Walls/Ceiling',
        'Flooring',
        'Windows',
        'Closet',
        'Light Fixtures',
        'Electrical Outlets',
        'Smoke Detector',
        'Doors',
      ]
    },
    {
      name: 'Master Bathroom',
      items: [
        'Walls/Ceiling',
        'Flooring',
        'Toilet',
        'Sink/Vanity',
        'Shower/Tub',
        'Mirrors',
        'Exhaust Fan',
        'Light Fixtures',
        'Towel Bars',
        'Cabinets',
      ]
    },
    {
      name: 'Bathroom 2',
      items: [
        'Walls/Ceiling',
        'Flooring',
        'Toilet',
        'Sink/Vanity',
        'Shower/Tub',
        'Mirrors',
        'Exhaust Fan',
        'Light Fixtures',
      ]
    },
    {
      name: 'Laundry',
      items: [
        'Walls/Ceiling',
        'Flooring',
        'Washer Hookups',
        'Dryer Hookups/Vent',
        'Utility Sink',
        'Light Fixtures',
      ]
    },
    {
      name: 'Garage',
      items: [
        'Walls/Ceiling',
        'Flooring',
        'Garage Door Opener',
        'Light Fixtures',
        'Electrical Outlets',
        'Storage',
      ]
    },
    {
      name: 'Systems',
      items: [
        'HVAC System',
        'Water Heater',
        'Electrical Panel',
        'Plumbing (general)',
        'Smoke Detectors',
        'CO Detectors',
        'Security System',
      ]
    },
  ]
};

// ============================================
// INSPECTION CRUD
// ============================================

export async function createInspection({
  propertyId,
  unitId = null,
  inspectionType,
  scheduledDate,
  inspectorId = null,
  inspectorName = null,
  tenantId = null,
  tenantName = null,
  notes = '',
  templateId = null,
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Get template or use default
    let template = DEFAULT_INSPECTION_TEMPLATE;
    if (templateId) {
      const { data: templateData } = await supabase
        .from('inspection_templates')
        .select('template_data')
        .eq('id', templateId)
        .single();
      if (templateData) template = templateData.template_data;
    }

    // Create inspection record
    const { data: inspection, error } = await supabase
      .from('inspections')
      .insert({
        property_id: propertyId,
        unit_id: unitId,
        inspection_type: inspectionType,
        status: 'scheduled',
        scheduled_date: scheduledDate,
        inspector_id: inspectorId,
        inspector_name: inspectorName,
        tenant_id: tenantId,
        tenant_name: tenantName,
        notes,
        template_id: templateId,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Create inspection items from template
    const items = [];
    template.sections.forEach((section, sectionIndex) => {
      section.items.forEach((itemName, itemIndex) => {
        items.push({
          inspection_id: inspection.id,
          section_name: section.name,
          item_name: itemName,
          sort_order: sectionIndex * 100 + itemIndex,
        });
      });
    });

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('inspection_items')
        .insert(items);
      if (itemsError) throw itemsError;
    }

    return { data: inspection, error: null };
  } catch (error) {
    console.error('Error creating inspection:', error);
    return { data: null, error };
  }
}

export async function getInspection(inspectionId) {
  const { data, error } = await supabase
    .from('inspections')
    .select(`
      *,
      property:properties(*),
      unit:units(*),
      items:inspection_items(*)
    `)
    .eq('id', inspectionId)
    .single();

  if (data && data.items) {
    // Sort items by sort_order
    data.items.sort((a, b) => a.sort_order - b.sort_order);
  }

  return { data, error };
}

export async function updateInspection(inspectionId, updates) {
  const { data, error } = await supabase
    .from('inspections')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', inspectionId)
    .select()
    .single();

  return { data, error };
}

export async function deleteInspection(inspectionId) {
  // Items will cascade delete
  const { error } = await supabase
    .from('inspections')
    .delete()
    .eq('id', inspectionId);

  return { success: !error, error };
}

// ============================================
// INSPECTION ITEMS
// ============================================

export async function updateInspectionItem(itemId, updates) {
  const { data, error } = await supabase
    .from('inspection_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId)
    .select()
    .single();

  return { data, error };
}

export async function bulkUpdateItems(items) {
  // items = [{ id, condition, notes, requires_repair, photo_urls }]
  const results = [];
  
  for (const item of items) {
    const { id, ...updates } = item;
    const { data, error } = await updateInspectionItem(id, updates);
    results.push({ id, data, error });
  }

  return results;
}

export async function addInspectionItem(inspectionId, sectionName, itemName) {
  // Get max sort order for this section
  const { data: existing } = await supabase
    .from('inspection_items')
    .select('sort_order')
    .eq('inspection_id', inspectionId)
    .eq('section_name', sectionName)
    .order('sort_order', { ascending: false })
    .limit(1);

  const sortOrder = existing?.[0]?.sort_order ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from('inspection_items')
    .insert({
      inspection_id: inspectionId,
      section_name: sectionName,
      item_name: itemName,
      sort_order: sortOrder,
    })
    .select()
    .single();

  return { data, error };
}

export async function removeInspectionItem(itemId) {
  const { error } = await supabase
    .from('inspection_items')
    .delete()
    .eq('id', itemId);

  return { success: !error, error };
}

// ============================================
// INSPECTION PHOTOS
// ============================================

export async function uploadInspectionPhoto(inspectionId, itemId, file) {
  try {
    const fileName = `${inspectionId}/${itemId}/${Date.now()}-${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('inspection-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('inspection-photos')
      .getPublicUrl(fileName);

    // Update item with new photo URL
    const { data: item } = await supabase
      .from('inspection_items')
      .select('photo_urls')
      .eq('id', itemId)
      .single();

    const photoUrls = item?.photo_urls || [];
    photoUrls.push(urlData.publicUrl);

    await supabase
      .from('inspection_items')
      .update({ photo_urls: photoUrls })
      .eq('id', itemId);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading photo:', error);
    return { url: null, error };
  }
}

export async function removeInspectionPhoto(itemId, photoUrl) {
  try {
    // Remove from storage
    const path = photoUrl.split('/inspection-photos/')[1];
    if (path) {
      await supabase.storage.from('inspection-photos').remove([path]);
    }

    // Update item
    const { data: item } = await supabase
      .from('inspection_items')
      .select('photo_urls')
      .eq('id', itemId)
      .single();

    const photoUrls = (item?.photo_urls || []).filter(url => url !== photoUrl);

    await supabase
      .from('inspection_items')
      .update({ photo_urls: photoUrls })
      .eq('id', itemId);

    return { success: true };
  } catch (error) {
    console.error('Error removing photo:', error);
    return { success: false, error };
  }
}

// ============================================
// QUERIES
// ============================================

export async function getInspectionsForProperty(propertyId, options = {}) {
  let query = supabase
    .from('inspections')
    .select('*')
    .eq('property_id', propertyId)
    .order('scheduled_date', { ascending: false });

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.type) {
    query = query.eq('inspection_type', options.type);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getInspectionsForUnit(unitId) {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('unit_id', unitId)
    .order('scheduled_date', { ascending: false });

  return { data, error };
}

export async function getAllInspections(filters = {}) {
  let query = supabase
    .from('inspections')
    .select(`
      *,
      property:properties(id, name, address)
    `)
    .order('scheduled_date', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.type) {
    query = query.eq('inspection_type', filters.type);
  }

  if (filters.propertyId) {
    query = query.eq('property_id', filters.propertyId);
  }

  if (filters.startDate) {
    query = query.gte('scheduled_date', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('scheduled_date', filters.endDate);
  }

  if (filters.search) {
    query = query.or(`inspector_name.ilike.%${filters.search}%,tenant_name.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getUpcomingInspections(days = 7) {
  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('inspections')
    .select(`
      *,
      property:properties(id, name, address)
    `)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .in('status', ['scheduled', 'in_progress'])
    .order('scheduled_date', { ascending: true });

  return { data, error };
}

export async function getOverdueInspections() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('inspections')
    .select(`
      *,
      property:properties(id, name, address)
    `)
    .lt('scheduled_date', now)
    .in('status', ['scheduled', 'in_progress'])
    .order('scheduled_date', { ascending: true });

  return { data, error };
}

// ============================================
// COMPLETE INSPECTION
// ============================================

export async function completeInspection(inspectionId, summary = {}) {
  try {
    // Get all items to calculate score
    const { data: items } = await supabase
      .from('inspection_items')
      .select('*')
      .eq('inspection_id', inspectionId);

    // Calculate overall score
    let totalScore = 0;
    let scoredItems = 0;
    let itemsRequiringRepair = 0;

    items?.forEach(item => {
      if (item.condition && item.condition !== 'na') {
        const conditionData = ITEM_CONDITIONS.find(c => c.id === item.condition);
        if (conditionData?.score) {
          totalScore += conditionData.score;
          scoredItems++;
        }
      }
      if (item.requires_repair) {
        itemsRequiringRepair++;
      }
    });

    const overallScore = scoredItems > 0 ? (totalScore / scoredItems).toFixed(2) : null;

    // Update inspection
    const { data, error } = await supabase
      .from('inspections')
      .update({
        status: itemsRequiringRepair > 0 ? 'requires_followup' : 'completed',
        completed_date: new Date().toISOString(),
        overall_score: overallScore,
        items_inspected: items?.length || 0,
        items_requiring_repair: itemsRequiringRepair,
        summary_notes: summary.notes || null,
        tenant_signature: summary.tenantSignature || null,
        inspector_signature: summary.inspectorSignature || null,
      })
      .eq('id', inspectionId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error completing inspection:', error);
    return { data: null, error };
  }
}

// ============================================
// TEMPLATES
// ============================================

export async function getInspectionTemplates() {
  const { data, error } = await supabase
    .from('inspection_templates')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return { data, error };
}

export async function createInspectionTemplate(name, description, templateData) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('inspection_templates')
    .insert({
      name,
      description,
      template_data: templateData,
      created_by: user?.id,
    })
    .select()
    .single();

  return { data, error };
}

// ============================================
// STATISTICS
// ============================================

export async function getInspectionStats(propertyId = null) {
  let query = supabase.from('inspections').select('status, inspection_type, overall_score');
  
  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  const { data, error } = await query;

  if (error) return { data: null, error };

  const stats = {
    total: data.length,
    byStatus: {},
    byType: {},
    averageScore: 0,
    completed: 0,
    scheduled: 0,
    requiresFollowup: 0,
  };

  let scoreSum = 0;
  let scoreCount = 0;

  data.forEach(inspection => {
    // Status counts
    stats.byStatus[inspection.status] = (stats.byStatus[inspection.status] || 0) + 1;
    
    // Type counts
    stats.byType[inspection.inspection_type] = (stats.byType[inspection.inspection_type] || 0) + 1;
    
    // Score average
    if (inspection.overall_score) {
      scoreSum += parseFloat(inspection.overall_score);
      scoreCount++;
    }

    // Quick access counts
    if (inspection.status === 'completed') stats.completed++;
    if (inspection.status === 'scheduled') stats.scheduled++;
    if (inspection.status === 'requires_followup') stats.requiresFollowup++;
  });

  stats.averageScore = scoreCount > 0 ? (scoreSum / scoreCount).toFixed(2) : null;

  return { data: stats, error: null };
}

// ============================================
// GENERATE REPORT
// ============================================

export async function generateInspectionReport(inspectionId) {
  const { data: inspection, error } = await getInspection(inspectionId);
  
  if (error || !inspection) {
    return { data: null, error: error || new Error('Inspection not found') };
  }

  // Group items by section
  const sections = {};
  inspection.items?.forEach(item => {
    if (!sections[item.section_name]) {
      sections[item.section_name] = [];
    }
    sections[item.section_name].push(item);
  });

  const report = {
    inspection,
    sections,
    generatedAt: new Date().toISOString(),
    summary: {
      totalItems: inspection.items?.length || 0,
      itemsRequiringRepair: inspection.items?.filter(i => i.requires_repair).length || 0,
      overallScore: inspection.overall_score,
      conditionBreakdown: {},
    }
  };

  // Calculate condition breakdown
  inspection.items?.forEach(item => {
    if (item.condition) {
      report.summary.conditionBreakdown[item.condition] = 
        (report.summary.conditionBreakdown[item.condition] || 0) + 1;
    }
  });

  return { data: report, error: null };
}

// ============================================
// EXPORTS
// ============================================

export default {
  // Constants
  INSPECTION_TYPES,
  INSPECTION_STATUSES,
  ITEM_CONDITIONS,
  DEFAULT_INSPECTION_TEMPLATE,
  
  // CRUD
  createInspection,
  getInspection,
  updateInspection,
  deleteInspection,
  
  // Items
  updateInspectionItem,
  bulkUpdateItems,
  addInspectionItem,
  removeInspectionItem,
  
  // Photos
  uploadInspectionPhoto,
  removeInspectionPhoto,
  
  // Queries
  getInspectionsForProperty,
  getInspectionsForUnit,
  getAllInspections,
  getUpcomingInspections,
  getOverdueInspections,
  
  // Complete
  completeInspection,
  
  // Templates
  getInspectionTemplates,
  createInspectionTemplate,
  
  // Stats & Reports
  getInspectionStats,
  generateInspectionReport,
};
