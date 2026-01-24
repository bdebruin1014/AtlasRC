// src/services/projectContactsService.js
// Project Contacts Service with 12 categories

import { supabase, isDemoMode } from '@/lib/supabase';

export const CONTACT_CATEGORIES = [
  { id: 'architect', label: 'Architect', icon: '🏛️' },
  { id: 'consultant', label: 'Consultant', icon: '💼' },
  { id: 'contractor', label: 'Contractor', icon: '🔨' },
  { id: 'engineer', label: 'Engineer', icon: '⚙️' },
  { id: 'government', label: 'Government', icon: '🏢' },
  { id: 'investor', label: 'Investor', icon: '💰' },
  { id: 'legal_title', label: 'Legal/Title', icon: '⚖️' },
  { id: 'lender', label: 'Lender', icon: '🏦' },
  { id: 'sales', label: 'Sales', icon: '📊' },
  { id: 'survey', label: 'Survey', icon: '📐' },
  { id: 'team_member', label: 'Team Member', icon: '👤' },
  { id: 'other', label: 'Other', icon: '📋' },
];

const mockContacts = [
  { id: 'pc-1', project_id: 'proj-1', category: 'architect', first_name: 'David', last_name: 'Chen', company_name: 'Chen Architecture Group', email: 'david@chenarch.com', phone: '(864) 555-0101', is_primary: true, profile_data: { license_number: 'SC-12345', specialty: 'Residential' } },
  { id: 'pc-2', project_id: 'proj-1', category: 'contractor', first_name: 'Mike', last_name: 'Johnson', company_name: 'Johnson Builders', email: 'mike@jbuilders.com', phone: '(864) 555-0102', is_primary: true, profile_data: { license_number: 'GC-67890', insurance_expiry: '2026-06-30' } },
  { id: 'pc-3', project_id: 'proj-1', category: 'lender', first_name: 'Sarah', last_name: 'Williams', company_name: 'First National Bank', email: 'sarah@fnb.com', phone: '(864) 555-0103', is_primary: true, profile_data: { loan_type: 'Construction', nmls_id: '123456' } },
  { id: 'pc-4', project_id: 'proj-1', category: 'engineer', first_name: 'Robert', last_name: 'Brown', company_name: 'Brown Civil Engineering', email: 'robert@brownce.com', phone: '(864) 555-0104', is_primary: false, profile_data: { specialty: 'Civil', pe_number: 'PE-54321' } },
  { id: 'pc-5', project_id: 'proj-1', category: 'legal_title', first_name: 'Jennifer', last_name: 'Taylor', company_name: 'Taylor Law Firm', email: 'jen@taylorlaw.com', phone: '(864) 555-0105', is_primary: true, profile_data: { bar_number: 'SC-BAR-9876', specialty: 'Real Estate' } },
  { id: 'pc-6', project_id: 'proj-1', category: 'survey', first_name: 'Tom', last_name: 'Harris', company_name: 'Harris Surveying', email: 'tom@harrissurvey.com', phone: '(864) 555-0106', is_primary: true, profile_data: { license_number: 'PLS-11111' } },
];

export async function getProjectContacts(projectId, filters = {}) {
  if (isDemoMode) {
    let contacts = mockContacts.filter(c => !projectId || c.project_id === projectId || projectId === 'proj-1');
    if (filters.category) contacts = contacts.filter(c => c.category === filters.category);
    if (filters.search) {
      const term = filters.search.toLowerCase();
      contacts = contacts.filter(c =>
        c.first_name.toLowerCase().includes(term) ||
        c.last_name?.toLowerCase().includes(term) ||
        c.company_name?.toLowerCase().includes(term)
      );
    }
    return contacts;
  }

  let query = supabase
    .from('project_contacts')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true);

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('category').order('is_primary', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProjectContactById(contactId) {
  if (isDemoMode) {
    return mockContacts.find(c => c.id === contactId) || null;
  }

  const { data, error } = await supabase
    .from('project_contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  if (error) throw error;
  return data;
}

export async function createProjectContact(contactData) {
  if (isDemoMode) {
    const newContact = { id: `pc-${Date.now()}`, ...contactData, created_at: new Date().toISOString() };
    mockContacts.push(newContact);
    return newContact;
  }

  const { data, error } = await supabase
    .from('project_contacts')
    .insert([{ ...contactData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProjectContact(contactId, updates) {
  if (isDemoMode) {
    const idx = mockContacts.findIndex(c => c.id === contactId);
    if (idx >= 0) mockContacts[idx] = { ...mockContacts[idx], ...updates };
    return mockContacts[idx];
  }

  const { data, error } = await supabase
    .from('project_contacts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', contactId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProjectContact(contactId) {
  if (isDemoMode) {
    const idx = mockContacts.findIndex(c => c.id === contactId);
    if (idx >= 0) mockContacts.splice(idx, 1);
    return true;
  }

  const { error } = await supabase
    .from('project_contacts')
    .delete()
    .eq('id', contactId);

  if (error) throw error;
  return true;
}

export async function getContactsByCategory(projectId) {
  const contacts = await getProjectContacts(projectId);
  const grouped = {};
  CONTACT_CATEGORIES.forEach(cat => { grouped[cat.id] = []; });
  contacts.forEach(c => {
    if (grouped[c.category]) grouped[c.category].push(c);
  });
  return grouped;
}
