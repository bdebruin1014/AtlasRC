// src/services/opportunityContactsService.js
// Opportunity Contacts Service — connects to opportunity_contacts table

import { supabase } from '@/lib/supabase';

// ============================================
// CONSTANTS
// ============================================

export const CONTACT_ROLES = [
  { id: 'Seller', label: 'Seller', color: 'bg-purple-100 text-purple-700' },
  { id: "Seller's Agent", label: "Seller's Agent", color: 'bg-blue-100 text-blue-700' },
  { id: "Buyer's Agent", label: "Buyer's Agent", color: 'bg-emerald-100 text-emerald-700' },
  { id: 'Attorney', label: 'Attorney', color: 'bg-amber-100 text-amber-700' },
  { id: 'Title Company', label: 'Title Company', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'Lender', label: 'Lender', color: 'bg-green-100 text-green-700' },
  { id: 'Inspector', label: 'Inspector', color: 'bg-orange-100 text-orange-700' },
  { id: 'Appraiser', label: 'Appraiser', color: 'bg-pink-100 text-pink-700' },
  { id: 'Other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
];

// ============================================
// MOCK DATA (fallback)
// ============================================

const mockContacts = [
  {
    id: 'opp-contact-1',
    opportunity_id: 'demo',
    name: 'Robert Johnson',
    role: 'Seller',
    company: '',
    phone: '(864) 555-0201',
    email: 'robert.johnson@email.com',
    notes: 'Primary property owner. Motivated seller, relocating out of state.',
    is_primary: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp-contact-2',
    opportunity_id: 'demo',
    name: 'Lisa Martinez',
    role: "Seller's Agent",
    company: 'Keller Williams Realty',
    phone: '(864) 555-0302',
    email: 'lisa.martinez@kw.com',
    notes: 'Responsive, prefers email communication.',
    is_primary: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp-contact-3',
    opportunity_id: 'demo',
    name: 'Jennifer Taylor',
    role: 'Attorney',
    company: 'Taylor Law Firm',
    phone: '(864) 555-0105',
    email: 'jen@taylorlaw.com',
    notes: 'Handles closing and title review.',
    is_primary: false,
    created_at: new Date().toISOString(),
  },
];

// ============================================
// CRUD OPERATIONS
// ============================================

export async function getContacts(opportunityId) {
  try {
    const { data, error } = await supabase
      .from('opportunity_contacts')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('is_primary', { ascending: false })
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching opportunity contacts:', error);
    return mockContacts.map(c => ({ ...c, opportunity_id: opportunityId }));
  }
}

export async function createContact(opportunityId, contactData) {
  try {
    const payload = {
      ...contactData,
      opportunity_id: opportunityId,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('opportunity_contacts')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating opportunity contact:', error);
    return {
      ...contactData,
      id: `opp-contact-${Date.now()}`,
      opportunity_id: opportunityId,
      created_at: new Date().toISOString(),
    };
  }
}

export async function updateContact(contactId, updates) {
  try {
    const { data, error } = await supabase
      .from('opportunity_contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating opportunity contact:', error);
    return { id: contactId, ...updates };
  }
}

export async function deleteContact(contactId) {
  try {
    const { error } = await supabase
      .from('opportunity_contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting opportunity contact:', error);
    return true;
  }
}

export default {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  CONTACT_ROLES,
};
