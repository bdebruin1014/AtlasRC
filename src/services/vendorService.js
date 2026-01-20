import { supabase, isDemoMode } from '@/lib/supabase';

// Mock data for demo mode
const mockVendors = [
  {
    id: 1,
    name: 'BuildRight Construction',
    vendor_type: 'Contractor',
    contact_name: 'Mike Johnson',
    phone: '(864) 555-1234',
    email: 'mike@buildright.com',
    address_line1: '123 Industrial Blvd',
    city: 'Greenville',
    state: 'SC',
    zip: '29601',
    status: 'active',
    balance: 12500.00,
    payment_terms: '30',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'ABC Supplies',
    vendor_type: 'Supplier',
    contact_name: 'Sarah Williams',
    phone: '(864) 555-2345',
    email: 'orders@abcsupplies.com',
    address_line1: '456 Commerce Way',
    city: 'Spartanburg',
    state: 'SC',
    zip: '29302',
    status: 'active',
    balance: 450.25,
    payment_terms: '30',
    created_at: '2024-02-01T09:00:00Z',
  },
  {
    id: 3,
    name: 'Metro Electric',
    vendor_type: 'Subcontractor',
    contact_name: 'Tom Davis',
    phone: '(864) 555-3456',
    email: 'tdavis@metroelectric.com',
    address_line1: '789 Electric Ave',
    city: 'Greenville',
    state: 'SC',
    zip: '29605',
    status: 'active',
    balance: 0,
    payment_terms: '30',
    created_at: '2024-02-15T11:00:00Z',
  },
  {
    id: 4,
    name: 'City Planning Department',
    vendor_type: 'Government',
    contact_name: 'Planning Office',
    phone: '(864) 555-4567',
    email: 'planning@greenvillesc.gov',
    address_line1: '206 S Main St',
    city: 'Greenville',
    state: 'SC',
    zip: '29601',
    status: 'active',
    balance: 0,
    payment_terms: '0',
    created_at: '2024-03-01T08:00:00Z',
  },
  {
    id: 5,
    name: 'Legal Partners LLP',
    vendor_type: 'Professional Services',
    contact_name: 'Jennifer Smith, Esq.',
    phone: '(864) 555-5678',
    email: 'jsmith@legalpartners.com',
    website: 'https://www.legalpartners.com',
    address_line1: '100 E North St, Suite 400',
    city: 'Greenville',
    state: 'SC',
    zip: '29601',
    status: 'active',
    balance: 2500.00,
    payment_terms: '30',
    created_at: '2024-03-15T14:00:00Z',
  },
  {
    id: 6,
    name: 'Greenville Water',
    vendor_type: 'Utility',
    contact_name: 'Customer Service',
    phone: '(864) 555-6789',
    email: 'service@greenvillewater.com',
    address_line1: '407 W Broad St',
    city: 'Greenville',
    state: 'SC',
    zip: '29601',
    status: 'active',
    balance: 0,
    payment_terms: '0',
    created_at: '2024-04-01T10:00:00Z',
  },
];

let mockVendorsData = [...mockVendors];

export const vendorService = {
  // Get all vendors for an entity
  async getAll(entityId, options = {}) {
    if (isDemoMode) {
      let filtered = [...mockVendorsData];
      
      if (options.status) {
        filtered = filtered.filter(v => v.status === options.status);
      }
      
      if (options.type) {
        filtered = filtered.filter(v => v.vendor_type === options.type);
      }
      
      // Sort by name
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      
      return { data: filtered, error: null };
    }
    
    let query = supabase
      .from('vendors')
      .select('*')
      .eq('entity_id', entityId)
      .order('name', { ascending: true });
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.type) {
      query = query.eq('vendor_type', options.type);
    }
    
    return await query;
  },
  
  // Get a single vendor by ID
  async getById(id) {
    if (isDemoMode) {
      const vendor = mockVendorsData.find(v => v.id === id);
      return { data: vendor || null, error: vendor ? null : 'Not found' };
    }
    
    return await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
  },
  
  // Create a new vendor
  async create(vendor) {
    if (isDemoMode) {
      const newVendor = {
        ...vendor,
        id: Date.now(),
        balance: 0,
        created_at: new Date().toISOString(),
      };
      mockVendorsData.push(newVendor);
      return { data: newVendor, error: null };
    }
    
    return await supabase
      .from('vendors')
      .insert(vendor)
      .select()
      .single();
  },
  
  // Update a vendor
  async update(id, updates) {
    if (isDemoMode) {
      const index = mockVendorsData.findIndex(v => v.id === id);
      if (index !== -1) {
        mockVendorsData[index] = { ...mockVendorsData[index], ...updates };
        return { data: mockVendorsData[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }
    
    return await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },
  
  // Delete a vendor
  async delete(id) {
    if (isDemoMode) {
      const index = mockVendorsData.findIndex(v => v.id === id);
      if (index !== -1) {
        mockVendorsData.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }
    
    return await supabase.from('vendors').delete().eq('id', id);
  },
  
  // Get vendor bills
  async getBills(vendorId) {
    if (isDemoMode) {
      // Would need to integrate with billService
      return { data: [], error: null };
    }
    
    return await supabase
      .from('bills')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('bill_date', { ascending: false });
  },
  
  // Get vendors with outstanding balances
  async getWithBalances(entityId) {
    if (isDemoMode) {
      return {
        data: mockVendorsData.filter(v => v.balance > 0),
        error: null,
      };
    }
    
    return await supabase
      .from('vendors')
      .select('*')
      .eq('entity_id', entityId)
      .gt('balance', 0)
      .order('balance', { ascending: false });
  },
  
  // Search vendors
  async search(entityId, query) {
    if (isDemoMode) {
      const lowerQuery = query.toLowerCase();
      return {
        data: mockVendorsData.filter(v =>
          v.name.toLowerCase().includes(lowerQuery) ||
          v.contact_name?.toLowerCase().includes(lowerQuery) ||
          v.email?.toLowerCase().includes(lowerQuery)
        ),
        error: null,
      };
    }
    
    return await supabase
      .from('vendors')
      .select('*')
      .eq('entity_id', entityId)
      .or(`name.ilike.%${query}%,contact_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name', { ascending: true });
  },
};

export default vendorService;
