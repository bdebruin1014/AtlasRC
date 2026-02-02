import { supabase, isDemoMode } from '@/lib/supabase';

// Mock templates for demo mode
const mockTemplates = [
  {
    id: '10000000-0000-0000-0001-000000000001',
    name: 'Holding Company - Standard',
    description: 'Standard chart of accounts for holding companies',
    entity_purpose: 'holding_company',
    project_type: null,
    is_default: true,
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    account_count: 45,
  },
  {
    id: '10000000-0000-0000-0001-000000000002',
    name: 'Operating Company - Standard',
    description: 'Standard chart of accounts for operating companies',
    entity_purpose: 'operating_company',
    project_type: null,
    is_default: true,
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    account_count: 72,
  },
  {
    id: '10000000-0000-0000-0001-000000000003',
    name: 'SPE - Lot Development',
    description: 'Chart of accounts for lot development SPEs',
    entity_purpose: 'spe',
    project_type: 'lot_development',
    is_default: true,
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    account_count: 58,
  },
  {
    id: '10000000-0000-0000-0001-000000000004',
    name: 'SPE - Build-to-Rent',
    description: 'Chart of accounts for BTR projects',
    entity_purpose: 'spe',
    project_type: 'btr',
    is_default: true,
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    account_count: 68,
  },
  {
    id: '10000000-0000-0000-0001-000000000005',
    name: 'SPE - Fix & Flip',
    description: 'Chart of accounts for fix and flip projects',
    entity_purpose: 'spe',
    project_type: 'fix_and_flip',
    is_default: true,
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    account_count: 48,
  },
  {
    id: '10000000-0000-0000-0001-000000000006',
    name: 'SPE - Spec Build',
    description: 'Chart of accounts for spec home construction',
    entity_purpose: 'spe',
    project_type: 'spec_build',
    is_default: true,
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    account_count: 52,
  },
  {
    id: '10000000-0000-0000-0001-000000000007',
    name: 'SPE - Community Development',
    description: 'Chart of accounts for master-planned communities',
    entity_purpose: 'spe',
    project_type: 'community_development',
    is_default: true,
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    account_count: 82,
  },
  {
    id: '10000000-0000-0000-0001-000000000008',
    name: 'SPE - General',
    description: 'Generic chart of accounts for SPEs',
    entity_purpose: 'spe',
    project_type: 'none',
    is_default: true,
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    account_count: 42,
  },
];

// Mock template accounts
const mockTemplateAccounts = {
  '10000000-0000-0000-0001-000000000001': [
    { id: 1, account_number: '1000', account_name: 'ASSETS', account_type: 'asset', is_header: true, normal_balance: 'debit' },
    { id: 2, account_number: '1100', account_name: 'Cash and Cash Equivalents', account_type: 'asset', is_header: true, normal_balance: 'debit' },
    { id: 3, account_number: '1110', account_name: 'Operating Cash', account_type: 'asset', is_header: false, normal_balance: 'debit' },
    // ... more accounts would be here
  ],
};

export const coaTemplateService = {
  // Get all templates
  async getAll(options = {}) {
    if (isDemoMode) {
      let filtered = [...mockTemplates];
      if (options.entityPurpose) {
        filtered = filtered.filter(t => t.entity_purpose === options.entityPurpose);
      }
      if (options.projectType) {
        filtered = filtered.filter(t => t.project_type === options.projectType);
      }
      return { data: filtered, error: null };
    }

    let query = supabase
      .from('coa_templates')
      .select('*, coa_template_accounts(count)')
      .order('name');

    if (options.entityPurpose) {
      query = query.eq('entity_purpose', options.entityPurpose);
    }

    if (options.projectType) {
      query = query.eq('project_type', options.projectType);
    }

    if (options.isDefault !== undefined) {
      query = query.eq('is_default', options.isDefault);
    }

    return await query;
  },

  // Get a template by ID with its accounts
  async getById(id) {
    if (isDemoMode) {
      const template = mockTemplates.find(t => t.id === id);
      if (template) {
        return {
          data: {
            ...template,
            accounts: mockTemplateAccounts[id] || []
          },
          error: null
        };
      }
      return { data: null, error: 'Not found' };
    }

    const { data: template, error } = await supabase
      .from('coa_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { data: null, error };

    const { data: accounts } = await supabase
      .from('coa_template_accounts')
      .select('*')
      .eq('template_id', id)
      .order('display_order');

    return { data: { ...template, accounts: accounts || [] }, error: null };
  },

  // Find the best matching template for an entity
  async findMatchingTemplate(entityPurpose, projectType = null) {
    if (isDemoMode) {
      // First try exact match
      let match = mockTemplates.find(t =>
        t.entity_purpose === entityPurpose &&
        t.project_type === projectType &&
        t.is_default
      );

      // Fall back to purpose-only match
      if (!match && entityPurpose !== 'spe') {
        match = mockTemplates.find(t =>
          t.entity_purpose === entityPurpose &&
          t.is_default
        );
      }

      // For SPE, fall back to general
      if (!match && entityPurpose === 'spe') {
        match = mockTemplates.find(t =>
          t.entity_purpose === 'spe' &&
          t.project_type === 'none' &&
          t.is_default
        );
      }

      return { data: match || null, error: null };
    }

    // Try exact match first
    let { data: template } = await supabase
      .from('coa_templates')
      .select('*')
      .eq('entity_purpose', entityPurpose)
      .eq('project_type', projectType)
      .eq('is_default', true)
      .single();

    // Fall back to purpose-only match for non-SPE
    if (!template && entityPurpose !== 'spe') {
      const { data } = await supabase
        .from('coa_templates')
        .select('*')
        .eq('entity_purpose', entityPurpose)
        .eq('is_default', true)
        .single();
      template = data;
    }

    // For SPE without specific project type, use general
    if (!template && entityPurpose === 'spe') {
      const { data } = await supabase
        .from('coa_templates')
        .select('*')
        .eq('entity_purpose', 'spe')
        .eq('project_type', 'none')
        .eq('is_default', true)
        .single();
      template = data;
    }

    return { data: template, error: null };
  },

  // Create a new template (admin only)
  async create(template) {
    if (isDemoMode) {
      const newTemplate = {
        ...template,
        id: `custom-${Date.now()}`,
        is_system: false,
        created_at: new Date().toISOString(),
      };
      mockTemplates.push(newTemplate);
      return { data: newTemplate, error: null };
    }

    const { accounts, ...templateData } = template;

    const { data: newTemplate, error: templateError } = await supabase
      .from('coa_templates')
      .insert({ ...templateData, is_system: false })
      .select()
      .single();

    if (templateError) return { data: null, error: templateError };

    // Insert accounts if provided
    if (accounts && accounts.length > 0) {
      const accountsWithTemplateId = accounts.map((acc, idx) => ({
        ...acc,
        template_id: newTemplate.id,
        display_order: acc.display_order || idx,
      }));

      const { error: accountsError } = await supabase
        .from('coa_template_accounts')
        .insert(accountsWithTemplateId);

      if (accountsError) return { data: null, error: accountsError };
    }

    return { data: newTemplate, error: null };
  },

  // Update a template (non-system templates only)
  async update(id, updates) {
    if (isDemoMode) {
      const index = mockTemplates.findIndex(t => t.id === id);
      if (index !== -1) {
        if (mockTemplates[index].is_system) {
          return { data: null, error: 'Cannot modify system templates' };
        }
        mockTemplates[index] = { ...mockTemplates[index], ...updates };
        return { data: mockTemplates[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }

    // Check if system template
    const { data: existing } = await supabase
      .from('coa_templates')
      .select('is_system')
      .eq('id', id)
      .single();

    if (existing?.is_system) {
      return { data: null, error: 'Cannot modify system templates' };
    }

    return await supabase
      .from('coa_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  // Delete a template (non-system templates only)
  async delete(id) {
    if (isDemoMode) {
      const index = mockTemplates.findIndex(t => t.id === id);
      if (index !== -1) {
        if (mockTemplates[index].is_system) {
          return { error: 'Cannot delete system templates' };
        }
        mockTemplates.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }

    // Check if system template
    const { data: existing } = await supabase
      .from('coa_templates')
      .select('is_system')
      .eq('id', id)
      .single();

    if (existing?.is_system) {
      return { error: 'Cannot delete system templates' };
    }

    // Accounts will be deleted via CASCADE
    return await supabase
      .from('coa_templates')
      .delete()
      .eq('id', id);
  },

  // Duplicate a template
  async duplicate(id, newName) {
    const { data: original, error: fetchError } = await this.getById(id);
    if (fetchError || !original) {
      return { data: null, error: fetchError || 'Template not found' };
    }

    const newTemplate = {
      name: newName || `${original.name} (Copy)`,
      description: original.description,
      entity_purpose: original.entity_purpose,
      project_type: original.project_type,
      is_default: false,
      accounts: original.accounts?.map(acc => ({
        account_number: acc.account_number,
        account_name: acc.account_name,
        account_type: acc.account_type,
        sub_type: acc.sub_type,
        parent_account_number: acc.parent_account_number,
        description: acc.description,
        is_header: acc.is_header,
        is_required: false, // Don't copy required flag
        normal_balance: acc.normal_balance,
        display_order: acc.display_order,
      })),
    };

    return await this.create(newTemplate);
  },
};

export default coaTemplateService;
