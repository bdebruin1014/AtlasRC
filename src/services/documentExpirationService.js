import { supabase, isDemoMode } from '@/lib/supabase';

// Demo data
const demoExpirations = [
  {
    id: 'exp-1',
    document_name: 'General Liability Insurance',
    document_type: 'insurance_gl',
    document_category: 'insurance',
    vendor_name: 'SafeGuard Insurance',
    policy_number: 'GL-2024-45678',
    expiration_date: '2025-02-15',
    status: 'expiring_soon',
    days_until_expiry: 20,
    reminder_days: 30,
    notes: 'Contact agent for renewal quote',
    project_id: 'proj-1',
  },
  {
    id: 'exp-2',
    document_name: "Builder's Risk Policy - Watson Creek",
    document_type: 'insurance_builders_risk',
    document_category: 'insurance',
    vendor_name: 'Construction Mutual',
    policy_number: 'BR-2024-12345',
    expiration_date: '2025-03-31',
    status: 'active',
    days_until_expiry: 64,
    reminder_days: 30,
    project_id: 'proj-1',
  },
  {
    id: 'exp-3',
    document_name: 'Building Permit #BP-2024-789',
    document_type: 'permit_building',
    document_category: 'permit',
    permit_number: 'BP-2024-789',
    expiration_date: '2025-01-28',
    status: 'expiring_soon',
    days_until_expiry: 2,
    reminder_days: 14,
    notes: 'Apply for extension before expiry',
    project_id: 'proj-1',
  },
  {
    id: 'exp-4',
    document_name: 'Contractor License - ABC Plumbing',
    document_type: 'license_contractor',
    document_category: 'license',
    vendor_name: 'ABC Plumbing',
    license_number: 'CL-45678',
    expiration_date: '2025-04-30',
    status: 'active',
    days_until_expiry: 94,
    reminder_days: 60,
  },
  {
    id: 'exp-5',
    document_name: "Workers' Comp - Smith Framing",
    document_type: 'insurance_workers_comp',
    document_category: 'insurance',
    vendor_name: 'Smith Framing LLC',
    policy_number: 'WC-2024-9876',
    expiration_date: '2025-01-20',
    status: 'expired',
    days_until_expiry: -6,
    reminder_days: 30,
    notes: 'EXPIRED - Request updated COI immediately',
  },
  {
    id: 'exp-6',
    document_name: 'Performance Bond - Oslo Ridge',
    document_type: 'bond_performance',
    document_category: 'bond',
    vendor_name: 'SureBond Corp',
    bond_number: 'PB-2024-5555',
    expiration_date: '2025-12-31',
    status: 'active',
    days_until_expiry: 339,
    reminder_days: 90,
    project_id: 'proj-2',
  },
];

let mockData = [...demoExpirations];

export const documentExpirationService = {
  // Get all document expirations
  async getAll(options = {}) {
    if (isDemoMode) {
      let filtered = [...mockData];

      if (options.projectId) {
        filtered = filtered.filter(d => d.project_id === options.projectId);
      }

      if (options.status && options.status !== 'all') {
        filtered = filtered.filter(d => d.status === options.status);
      }

      if (options.category && options.category !== 'all') {
        filtered = filtered.filter(d => d.document_category === options.category);
      }

      // Sort by expiration date
      filtered.sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));

      return { data: filtered, error: null };
    }

    let query = supabase
      .from('document_expirations')
      .select('*')
      .order('expiration_date', { ascending: true });

    if (options.projectId) {
      query = query.eq('project_id', options.projectId);
    }

    if (options.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options.category && options.category !== 'all') {
      query = query.eq('document_category', options.category);
    }

    return await query;
  },

  // Get single expiration
  async getById(id) {
    if (isDemoMode) {
      const exp = mockData.find(e => e.id === id);
      return { data: exp || null, error: exp ? null : 'Not found' };
    }

    return await supabase
      .from('document_expirations')
      .select('*')
      .eq('id', id)
      .single();
  },

  // Create a new expiration tracker
  async create(expiration) {
    if (isDemoMode) {
      const daysUntil = Math.floor((new Date(expiration.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
      const newExp = {
        ...expiration,
        id: `exp-${Date.now()}`,
        days_until_expiry: daysUntil,
        status: daysUntil < 0 ? 'expired' : daysUntil <= (expiration.reminder_days || 30) ? 'expiring_soon' : 'active',
        created_at: new Date().toISOString(),
      };
      mockData.push(newExp);
      return { data: newExp, error: null };
    }

    return await supabase
      .from('document_expirations')
      .insert(expiration)
      .select()
      .single();
  },

  // Update an expiration
  async update(id, updates) {
    if (isDemoMode) {
      const index = mockData.findIndex(e => e.id === id);
      if (index !== -1) {
        if (updates.expiration_date) {
          const daysUntil = Math.floor((new Date(updates.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
          updates.days_until_expiry = daysUntil;
          updates.status = daysUntil < 0 ? 'expired' : daysUntil <= (mockData[index].reminder_days || 30) ? 'expiring_soon' : 'active';
        }
        mockData[index] = { ...mockData[index], ...updates };
        return { data: mockData[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }

    return await supabase
      .from('document_expirations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  // Delete an expiration
  async delete(id) {
    if (isDemoMode) {
      const index = mockData.findIndex(e => e.id === id);
      if (index !== -1) {
        mockData.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }

    return await supabase
      .from('document_expirations')
      .delete()
      .eq('id', id);
  },

  // Mark as renewed
  async renew(id, newExpirationDate) {
    return this.update(id, {
      expiration_date: newExpirationDate,
      status: 'active',
      renewed_at: new Date().toISOString(),
    });
  },

  // Get summary/stats
  async getSummary(projectId = null) {
    const { data: expirations, error } = await this.getAll({ projectId });

    if (error) return { data: null, error };

    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    return {
      data: {
        total: expirations.length,
        expired: expirations.filter(e => e.status === 'expired').length,
        expiringSoon: expirations.filter(e => e.status === 'expiring_soon').length,
        active: expirations.filter(e => e.status === 'active').length,
        within30Days: expirations.filter(e => {
          const exp = new Date(e.expiration_date);
          return exp <= in30Days && exp >= today;
        }).length,
        within60Days: expirations.filter(e => {
          const exp = new Date(e.expiration_date);
          return exp <= in60Days && exp >= today;
        }).length,
        within90Days: expirations.filter(e => {
          const exp = new Date(e.expiration_date);
          return exp <= in90Days && exp >= today;
        }).length,
        byCategory: {
          insurance: expirations.filter(e => e.document_category === 'insurance').length,
          permit: expirations.filter(e => e.document_category === 'permit').length,
          license: expirations.filter(e => e.document_category === 'license').length,
          bond: expirations.filter(e => e.document_category === 'bond').length,
          certificate: expirations.filter(e => e.document_category === 'certificate').length,
          other: expirations.filter(e => !['insurance', 'permit', 'license', 'bond', 'certificate'].includes(e.document_category)).length,
        },
      },
      error: null,
    };
  },

  // Get alerts (expired + expiring soon)
  async getAlerts(projectId = null) {
    const { data: expirations, error } = await this.getAll({ projectId });

    if (error) return { data: null, error };

    const alerts = expirations.filter(e =>
      e.status === 'expired' || e.status === 'expiring_soon'
    );

    return {
      data: alerts.sort((a, b) => {
        // Expired first, then by expiration date
        if (a.status === 'expired' && b.status !== 'expired') return -1;
        if (a.status !== 'expired' && b.status === 'expired') return 1;
        return new Date(a.expiration_date) - new Date(b.expiration_date);
      }),
      error: null,
    };
  },
};

export default documentExpirationService;
