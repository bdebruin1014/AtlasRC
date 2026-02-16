// src/services/contactsService.js
// Enhanced Contacts Management - Qualia-style

import { supabase } from '@/lib/supabase';

// ============================================
// COMPANY CATEGORIES & TYPES
// ============================================

export const COMPANY_CATEGORIES = {
  CLOSING: {
    label: 'Closing',
    types: [
      { value: 'lender', label: 'Lender' },
      { value: 'mortgage_broker', label: 'Mortgage Broker' },
      { value: 'real_estate_agency', label: 'Real Estate Agency' },
      { value: 'underwriter', label: 'Underwriter' },
      { value: 'law_firm', label: 'Law Firm' },
      { value: 'title_abstractor', label: 'Title Abstractor' },
      { value: 'title_company', label: 'Title Company' },
      { value: 'settlement_agency', label: 'Settlement Agency' },
      { value: 'escrow_company', label: 'Escrow Company' },
      { value: 'notary', label: 'Notary' },
    ]
  },
  PAYOFFS: {
    label: 'Payoffs',
    types: [
      { value: 'payoff_lender', label: 'Payoff Lender' },
      { value: 'hoa', label: 'HOA' },
      { value: 'hoa_management', label: 'HOA Management Co.' },
    ]
  },
  SERVICES: {
    label: 'Services',
    types: [
      { value: 'hvac', label: 'HVAC' },
      { value: 'plumber', label: 'Plumber' },
      { value: 'electrician', label: 'Electrician' },
      { value: 'roofer', label: 'Roofer' },
      { value: 'general_contractor', label: 'General Contractor' },
      { value: 'subcontractor', label: 'Subcontractor' },
      { value: 'landscaper', label: 'Landscaper' },
      { value: 'pest_control', label: 'Pest Control' },
      { value: 'surveyor', label: 'Surveying Firm' },
      { value: 'inspector', label: 'Inspector' },
      { value: 'appraiser', label: 'Appraiser' },
      { value: 'architect', label: 'Architect' },
      { value: 'engineer', label: 'Engineer' },
      { value: 'insurance', label: 'Insurance Co.' },
    ]
  },
  GOVERNMENT: {
    label: 'Government',
    types: [
      { value: 'tax_authority', label: 'Tax Authority' },
      { value: 'government_entity', label: 'Government Entity' },
      { value: 'recording_office', label: 'Recording Office' },
      { value: 'permit_office', label: 'Permit Office' },
      { value: 'zoning_department', label: 'Zoning Department' },
    ]
  },
  OTHER: {
    label: 'Other',
    types: [
      { value: 'other_company', label: 'Other Company' },
      { value: 'exchange_accommodator', label: 'Exchange Accommodator' },
    ]
  }
};

// ============================================
// EMPLOYEE ROLES
// ============================================

export const EMPLOYEE_ROLES = [
  { value: 'loan_officer', label: 'Loan Officer' },
  { value: 'loan_processor', label: 'Loan Processor' },
  { value: 'real_estate_agent', label: 'Real Estate Agent' },
  { value: 'broker', label: 'Broker' },
  { value: 'attorney', label: 'Attorney' },
  { value: 'paralegal', label: 'Paralegal' },
  { value: 'closer', label: 'Closer' },
  { value: 'escrow_officer', label: 'Escrow Officer' },
  { value: 'notary', label: 'Notary' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'superintendent', label: 'Superintendent' },
  { value: 'estimator', label: 'Estimator' },
  { value: 'sales_rep', label: 'Sales Rep' },
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'assistant', label: 'Assistant' },
  { value: 'other', label: 'Other' },
];

// ============================================
// PROJECT CONTACT ROLES
// ============================================

export const PROJECT_CONTACT_ROLES = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'listing_agent', label: 'Listing Agent' },
  { value: 'buying_agent', label: 'Buying Agent' },
  { value: 'lender', label: 'Lender' },
  { value: 'title_company', label: 'Title Company' },
  { value: 'inspector', label: 'Inspector' },
  { value: 'appraiser', label: 'Appraiser' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'architect', label: 'Architect' },
  { value: 'attorney', label: 'Attorney' },
  { value: 'hoa', label: 'HOA' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'surveyor', label: 'Surveyor' },
  { value: 'other', label: 'Other' },
];

// ============================================
// COMPANY FUNCTIONS
// ============================================

export async function getCompanies(filters = {}) {
  try {
    let query = supabase
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (filters.type) {
      query = query.eq('company_type', filters.type);
    }
    if (filters.category) {
      const categoryTypes = COMPANY_CATEGORIES[filters.category]?.types.map(t => t.value) || [];
      query = query.in('company_type', categoryTypes);
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

export async function getCompanyById(companyId) {
  try {
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) throw error;

    // Get employees
    const { data: employees } = await supabase
      .from('company_employees')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true);

    return { ...company, employees: employees || [] };
  } catch (error) {
    console.error('Error fetching company:', error);
    return null;
  }
}

export async function createCompany(companyData) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating company:', error);
    return null;
  }
}

export async function updateCompany(companyId, updates) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', companyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating company:', error);
    return null;
  }
}

export async function deleteCompany(companyId) {
  try {
    const { error } = await supabase
      .from('companies')
      .update({ is_active: false })
      .eq('id', companyId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting company:', error);
    return false;
  }
}

// ============================================
// EMPLOYEE FUNCTIONS
// ============================================

export async function getEmployees(filters = {}) {
  try {
    let query = supabase
      .from('company_employees')
      .select(`
        *,
        company:companies(id, name, company_type)
      `)
      .eq('is_active', true)
      .order('last_name');

    if (filters.companyId) {
      query = query.eq('company_id', filters.companyId);
    }
    if (filters.role) {
      query = query.eq('job_title', filters.role);
    }
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

export async function getEmployeeById(employeeId) {
  try {
    const { data, error } = await supabase
      .from('company_employees')
      .select(`
        *,
        company:companies(id, name, company_type)
      `)
      .eq('id', employeeId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    return null;
  }
}

export async function createEmployee(employeeData) {
  try {
    const { data, error } = await supabase
      .from('company_employees')
      .insert([employeeData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating employee:', error);
    return null;
  }
}

export async function updateEmployee(employeeId, updates) {
  try {
    const { data, error } = await supabase
      .from('company_employees')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', employeeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating employee:', error);
    return null;
  }
}

export async function deleteEmployee(employeeId) {
  try {
    const { error } = await supabase
      .from('company_employees')
      .update({ is_active: false })
      .eq('id', employeeId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
}

// ============================================
// PROJECT CONTACTS FUNCTIONS
// ============================================

export async function getProjectContacts(projectId) {
  try {
    const { data, error } = await supabase
      .from('project_contacts')
      .select(`
        *,
        contact:contacts(*),
        company:companies(id, name),
        employee:company_employees(*)
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching project contacts:', error);
    return [];
  }
}

export async function addProjectContact(projectContactData) {
  try {
    const { data, error } = await supabase
      .from('project_contacts')
      .insert([projectContactData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding project contact:', error);
    return null;
  }
}

export async function updateProjectContact(projectContactId, updates) {
  try {
    const { data, error } = await supabase
      .from('project_contacts')
      .update(updates)
      .eq('id', projectContactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating project contact:', error);
    return null;
  }
}

export async function removeProjectContact(projectContactId) {
  try {
    const { error } = await supabase
      .from('project_contacts')
      .delete()
      .eq('id', projectContactId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing project contact:', error);
    return false;
  }
}

// Get all buyers across projects
export async function getAllBuyers() {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('contact_type', 'buyer')
      .order('last_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return [];
  }
}

// Get all sellers across projects
export async function getAllSellers() {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('contact_type', 'seller')
      .order('last_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return [];
  }
}

// ============================================
// INDIVIDUAL CONTACTS FUNCTIONS
// ============================================

export async function getContacts(filters = {}) {
  try {
    let query = supabase
      .from('contacts')
      .select('*')
      .order('last_name');

    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

export async function createContact(contactData) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contactData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating contact:', error);
    return null;
  }
}

export async function updateContact(contactId, updates) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating contact:', error);
    return null;
  }
}
