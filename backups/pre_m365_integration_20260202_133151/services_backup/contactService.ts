import { supabase } from '@/lib/supabase';

// Types
export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  job_title?: string;
  contact_type: ContactType;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ContactType =
  | 'investor'
  | 'broker'
  | 'contractor'
  | 'vendor'
  | 'attorney'
  | 'accountant'
  | 'property_manager'
  | 'tenant'
  | 'lender'
  | 'other';

export interface ContactFilters {
  search?: string;
  contact_type?: ContactType;
  is_active?: boolean;
  company?: string;
}

export interface CreateContactData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  job_title?: string;
  contact_type: ContactType;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateContactData extends Partial<CreateContactData> {
  is_active?: boolean;
}

// Mock data for development
const mockContacts: Contact[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@investor.com',
    phone: '(555) 123-4567',
    company: 'Smith Capital Partners',
    job_title: 'Managing Partner',
    contact_type: 'investor',
    address_line1: '123 Wall Street',
    city: 'New York',
    state: 'NY',
    zip: '10005',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah@johnsonbrokers.com',
    phone: '(555) 234-5678',
    company: 'Johnson Commercial Brokers',
    job_title: 'Senior Broker',
    contact_type: 'broker',
    address_line1: '456 Market Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    is_active: true,
    created_at: '2024-02-10T14:30:00Z',
    updated_at: '2024-02-10T14:30:00Z'
  },
  {
    id: '3',
    first_name: 'Mike',
    last_name: 'Williams',
    email: 'mike@premierbuilders.com',
    phone: '(555) 345-6789',
    company: 'Premier Builders LLC',
    job_title: 'President',
    contact_type: 'contractor',
    address_line1: '789 Industrial Blvd',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    is_active: true,
    created_at: '2024-03-05T09:15:00Z',
    updated_at: '2024-03-05T09:15:00Z'
  },
  {
    id: '4',
    first_name: 'Emily',
    last_name: 'Chen',
    email: 'emily.chen@lawfirm.com',
    phone: '(555) 456-7890',
    company: 'Chen & Associates Law',
    job_title: 'Real Estate Attorney',
    contact_type: 'attorney',
    address_line1: '100 Legal Way',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    is_active: true,
    created_at: '2024-01-20T11:00:00Z',
    updated_at: '2024-01-20T11:00:00Z'
  },
  {
    id: '5',
    first_name: 'David',
    last_name: 'Martinez',
    email: 'david@nationallending.com',
    phone: '(555) 567-8901',
    company: 'National Commercial Lending',
    job_title: 'Loan Officer',
    contact_type: 'lender',
    address_line1: '200 Finance Ave',
    city: 'Miami',
    state: 'FL',
    zip: '33101',
    is_active: true,
    created_at: '2024-02-28T16:45:00Z',
    updated_at: '2024-02-28T16:45:00Z'
  }
];

/**
 * Contact Service - TypeScript service for managing contacts
 */
export const contactService = {
  /**
   * Get all contacts with optional filters
   */
  async getAll(filters: ContactFilters = {}): Promise<Contact[]> {
    try {
      let query = supabase
        .from('contacts')
        .select('*')
        .order('last_name', { ascending: true });

      if (filters.contact_type) {
        query = query.eq('contact_type', filters.contact_type);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.company) {
        query = query.ilike('company', `%${filters.company}%`);
      }

      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Contact[];
    } catch (error) {
      console.warn('Using mock contact data:', error);
      return filterMockContacts(mockContacts, filters);
    }
  },

  /**
   * Get a single contact by ID
   */
  async getById(id: string): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Contact;
    } catch (error) {
      console.warn('Using mock contact data:', error);
      return mockContacts.find(c => c.id === id) || null;
    }
  },

  /**
   * Create a new contact
   */
  async create(contactData: CreateContactData): Promise<Contact> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          ...contactData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    } catch (error) {
      console.warn('Mock create contact:', error);
      const newContact: Contact = {
        id: String(Date.now()),
        ...contactData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newContact;
    }
  },

  /**
   * Update an existing contact
   */
  async update(id: string, contactData: UpdateContactData): Promise<Contact> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          ...contactData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    } catch (error) {
      console.warn('Mock update contact:', error);
      const existing = mockContacts.find(c => c.id === id);
      if (!existing) throw new Error('Contact not found');
      return {
        ...existing,
        ...contactData,
        updated_at: new Date().toISOString()
      };
    }
  },

  /**
   * Delete a contact
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.warn('Mock delete contact:', error);
      return true;
    }
  },

  /**
   * Get contacts by type
   */
  async getByType(type: ContactType): Promise<Contact[]> {
    return this.getAll({ contact_type: type });
  },

  /**
   * Search contacts
   */
  async search(query: string): Promise<Contact[]> {
    return this.getAll({ search: query });
  },

  /**
   * Get contact types
   */
  getContactTypes(): { value: ContactType; label: string }[] {
    return [
      { value: 'investor', label: 'Investor' },
      { value: 'broker', label: 'Broker' },
      { value: 'contractor', label: 'Contractor' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'attorney', label: 'Attorney' },
      { value: 'accountant', label: 'Accountant' },
      { value: 'property_manager', label: 'Property Manager' },
      { value: 'tenant', label: 'Tenant' },
      { value: 'lender', label: 'Lender' },
      { value: 'other', label: 'Other' }
    ];
  },

  /**
   * Get full name of a contact
   */
  getFullName(contact: Contact): string {
    return `${contact.first_name} ${contact.last_name}`.trim();
  },

  /**
   * Format phone number
   */
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }
};

// Helper function to filter mock data
function filterMockContacts(contacts: Contact[], filters: ContactFilters): Contact[] {
  let filtered = [...contacts];

  if (filters.contact_type) {
    filtered = filtered.filter(c => c.contact_type === filters.contact_type);
  }

  if (filters.is_active !== undefined) {
    filtered = filtered.filter(c => c.is_active === filters.is_active);
  }

  if (filters.company) {
    filtered = filtered.filter(c =>
      c.company?.toLowerCase().includes(filters.company!.toLowerCase())
    );
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(c =>
      c.first_name.toLowerCase().includes(search) ||
      c.last_name.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      c.company?.toLowerCase().includes(search)
    );
  }

  return filtered;
}

export default contactService;
