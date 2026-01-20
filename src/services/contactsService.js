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
// MOCK DATA
// ============================================

const mockCompanies = [
  { id: 'comp-1', name: 'First National Bank', company_type: 'lender', phone: '(864) 555-0100', email: 'info@fnb.com', address: '100 Main St', city: 'Greenville', state: 'SC', zip_code: '29601' },
  { id: 'comp-2', name: 'Red Cedar Homes', company_type: 'general_contractor', phone: '(864) 555-0101', email: 'info@redcedarhomes.com', address: '200 Builder Way', city: 'Greenville', state: 'SC', zip_code: '29602' },
  { id: 'comp-3', name: 'Greenville Title Co', company_type: 'title_company', phone: '(864) 555-0102', email: 'closings@gvltitle.com', address: '300 Legal Ave', city: 'Greenville', state: 'SC', zip_code: '29601' },
  { id: 'comp-4', name: 'Upstate Inspections', company_type: 'inspector', phone: '(864) 555-0103', email: 'schedule@upstateinspect.com', address: '400 Inspector Ln', city: 'Greenville', state: 'SC', zip_code: '29605' },
  { id: 'comp-5', name: 'Carolina Plumbing', company_type: 'plumber', phone: '(864) 555-0104', email: 'service@carolinaplumb.com', address: '500 Pipe St', city: 'Greenville', state: 'SC', zip_code: '29607' },
  { id: 'comp-6', name: 'Palmetto Electric', company_type: 'electrician', phone: '(864) 555-0105', email: 'info@palmettoelec.com', address: '600 Volt Dr', city: 'Greenville', state: 'SC', zip_code: '29609' },
  { id: 'comp-7', name: 'Blue Ridge HVAC', company_type: 'hvac', phone: '(864) 555-0106', email: 'service@blueridgehvac.com', address: '700 Climate Way', city: 'Greenville', state: 'SC', zip_code: '29611' },
  { id: 'comp-8', name: 'Southern Survey Co', company_type: 'surveyor', phone: '(864) 555-0107', email: 'surveys@southernsurvey.com', address: '800 Map Rd', city: 'Greenville', state: 'SC', zip_code: '29613' },
];

const mockEmployees = [
  { id: 'emp-1', company_id: 'comp-1', first_name: 'Sarah', last_name: 'Davis', job_title: 'Loan Officer', email: 'sdavis@fnb.com', work_phone: '(864) 555-0102', cell_phone: '(864) 555-1102' },
  { id: 'emp-2', company_id: 'comp-1', first_name: 'John', last_name: 'Miller', job_title: 'Loan Processor', email: 'jmiller@fnb.com', work_phone: '(864) 555-0103', cell_phone: '' },
  { id: 'emp-3', company_id: 'comp-2', first_name: 'Mike', last_name: 'Wilson', job_title: 'Owner', email: 'mike@redcedarhomes.com', work_phone: '(864) 555-0101', cell_phone: '(864) 555-1101' },
  { id: 'emp-4', company_id: 'comp-2', first_name: 'Tom', last_name: 'Johnson', job_title: 'Project Manager', email: 'tom@redcedarhomes.com', work_phone: '(864) 555-0108', cell_phone: '' },
  { id: 'emp-5', company_id: 'comp-3', first_name: 'Lisa', last_name: 'Anderson', job_title: 'Closer', email: 'lisa@gvltitle.com', work_phone: '(864) 555-0102', cell_phone: '' },
  { id: 'emp-6', company_id: 'comp-4', first_name: 'Bob', last_name: 'Smith', job_title: 'Inspector', email: 'bob@upstateinspect.com', work_phone: '(864) 555-0103', cell_phone: '(864) 555-1103' },
];

const mockProjectContacts = [
  { id: 'pc-1', project_id: 'PRJ-001', role: 'builder', contact: { first_name: 'Mike', last_name: 'Wilson' }, company: { id: 'comp-2', name: 'Red Cedar Homes' }, phone: '(864) 555-0101', email: 'mike@redcedarhomes.com' },
  { id: 'pc-2', project_id: 'PRJ-001', role: 'lender', contact: { first_name: 'Sarah', last_name: 'Davis' }, company: { id: 'comp-1', name: 'First National Bank' }, phone: '(864) 555-0102', email: 'sdavis@fnb.com' },
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
    return data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    // Return mock data
    let filtered = [...mockCompanies];
    if (filters.type) {
      filtered = filtered.filter(c => c.company_type === filters.type);
    }
    if (filters.search) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    return filtered;
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
    const company = mockCompanies.find(c => c.id === companyId);
    const employees = mockEmployees.filter(e => e.company_id === companyId);
    return company ? { ...company, employees } : null;
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
    const newCompany = { id: `comp-${Date.now()}`, ...companyData };
    mockCompanies.push(newCompany);
    return newCompany;
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
    const idx = mockCompanies.findIndex(c => c.id === companyId);
    if (idx >= 0) {
      mockCompanies[idx] = { ...mockCompanies[idx], ...updates };
      return mockCompanies[idx];
    }
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
    const idx = mockCompanies.findIndex(c => c.id === companyId);
    if (idx >= 0) mockCompanies.splice(idx, 1);
    return true;
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
    return data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    let filtered = mockEmployees.map(e => ({
      ...e,
      company: mockCompanies.find(c => c.id === e.company_id)
    }));
    if (filters.companyId) {
      filtered = filtered.filter(e => e.company_id === filters.companyId);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.first_name.toLowerCase().includes(search) || 
        e.last_name.toLowerCase().includes(search)
      );
    }
    return filtered;
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
    const employee = mockEmployees.find(e => e.id === employeeId);
    if (employee) {
      return { ...employee, company: mockCompanies.find(c => c.id === employee.company_id) };
    }
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
    const newEmployee = { id: `emp-${Date.now()}`, ...employeeData };
    mockEmployees.push(newEmployee);
    return newEmployee;
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
    const idx = mockEmployees.findIndex(e => e.id === employeeId);
    if (idx >= 0) {
      mockEmployees[idx] = { ...mockEmployees[idx], ...updates };
      return mockEmployees[idx];
    }
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
    const idx = mockEmployees.findIndex(e => e.id === employeeId);
    if (idx >= 0) mockEmployees.splice(idx, 1);
    return true;
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
    return data;
  } catch (error) {
    console.error('Error fetching project contacts:', error);
    return mockProjectContacts.filter(pc => pc.project_id === projectId);
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
    const newContact = { id: `pc-${Date.now()}`, ...projectContactData };
    mockProjectContacts.push(newContact);
    return newContact;
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
    const idx = mockProjectContacts.findIndex(pc => pc.id === projectContactId);
    if (idx >= 0) mockProjectContacts.splice(idx, 1);
    return true;
  }
}

// Get all buyers across projects
export async function getAllBuyers() {
  try {
    const { data, error } = await supabase
      .from('project_contacts')
      .select(`
        *,
        contact:contacts(*),
        project:projects(id, name)
      `)
      .eq('role', 'buyer');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return [];
  }
}

// Get all sellers across projects
export async function getAllSellers() {
  try {
    const { data, error } = await supabase
      .from('project_contacts')
      .select(`
        *,
        contact:contacts(*),
        project:projects(id, name)
      `)
      .eq('role', 'seller');

    if (error) throw error;
    return data;
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
    return data;
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
    return { id: `contact-${Date.now()}`, ...contactData };
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
