import { supabase, isDemoMode } from '@/lib/supabase';

// Mock data for demo mode
const mockProjects = [
  {
    id: 1,
    name: 'Watson House',
    code: 'PRJ-001',
    type: 'multifamily',
    type_name: 'Multifamily',
    status: 'construction',
    entity_id: 2,
    entity_name: 'Watson House LLC',
    address: '123 Main Street',
    city: 'Greenville',
    state: 'SC',
    zip: '29601',
    units: 48,
    sqft: 52000,
    budget: 18000000,
    spent: 12500000,
    start_date: '2024-01-15',
    target_completion: '2025-06-30',
    description: 'A 48-unit multifamily development in downtown Greenville.',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Oslo Townhomes',
    code: 'PRJ-002',
    type: 'townhomes',
    type_name: 'Townhomes',
    status: 'pre_development',
    entity_id: 3,
    entity_name: 'Oslo Townhomes LLC',
    address: '456 Oslo Drive',
    city: 'Spartanburg',
    state: 'SC',
    zip: '29302',
    units: 12,
    sqft: 24000,
    budget: 4500000,
    spent: 250000,
    start_date: '2024-06-01',
    target_completion: '2025-12-31',
    description: '12-unit luxury townhome development.',
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 3,
    name: 'Cedar Mill Mixed-Use',
    code: 'PRJ-003',
    type: 'mixed_use',
    type_name: 'Mixed-Use',
    status: 'acquisition',
    entity_id: 4,
    entity_name: 'Cedar Mill Partners',
    address: '789 Cedar Mill Road',
    city: 'Anderson',
    state: 'SC',
    zip: '29621',
    units: 24,
    sqft: 35000,
    budget: 8500000,
    spent: 150000,
    start_date: '2024-09-01',
    target_completion: '2026-06-30',
    description: 'Mixed-use development with retail and residential.',
    created_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 4,
    name: 'Pine Valley Lots',
    code: 'PRJ-004',
    type: 'lot_development',
    type_name: 'Lot Development',
    status: 'construction',
    entity_id: 1,
    entity_name: 'VanRock Holdings LLC',
    address: 'Pine Valley Road',
    city: 'Simpsonville',
    state: 'SC',
    zip: '29680',
    units: 35,
    sqft: 0,
    budget: 2800000,
    spent: 1200000,
    start_date: '2024-03-01',
    target_completion: '2024-12-31',
    description: '35-lot subdivision development.',
    created_at: '2024-01-20T10:00:00Z',
  },
];

let mockProjectsData = [...mockProjects];

export const projectService = {
  // Get all projects
  async getAll(options = {}) {
    if (isDemoMode) {
      let filtered = [...mockProjectsData];
      
      if (options.type) {
        filtered = filtered.filter(p => p.type === options.type);
      }
      
      if (options.status) {
        filtered = filtered.filter(p => p.status === options.status);
      }
      
      if (options.entityId) {
        filtered = filtered.filter(p => p.entity_id === options.entityId);
      }
      
      return { data: filtered, error: null };
    }
    
    let query = supabase
      .from('projects')
      .select('*, entities(name), project_types(name)')
      .order('created_at', { ascending: false });
    
    if (options.type) {
      query = query.eq('type', options.type);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.entityId) {
      query = query.eq('entity_id', options.entityId);
    }
    
    return await query;
  },
  
  // Get project by ID
  async getById(id) {
    if (isDemoMode) {
      const project = mockProjectsData.find(p => p.id === parseInt(id));
      return { data: project || null, error: project ? null : 'Not found' };
    }
    
    return await supabase
      .from('projects')
      .select('*, entities(name), project_types(name)')
      .eq('id', id)
      .single();
  },
  
  // Create project
  async create(project) {
    if (isDemoMode) {
      const newProject = {
        ...project,
        id: Date.now(),
        code: project.code || `PRJ-${String(mockProjectsData.length + 1).padStart(3, '0')}`,
        spent: 0,
        created_at: new Date().toISOString(),
      };
      mockProjectsData.push(newProject);
      return { data: newProject, error: null };
    }
    
    return await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
  },
  
  // Update project
  async update(id, updates) {
    if (isDemoMode) {
      const index = mockProjectsData.findIndex(p => p.id === parseInt(id));
      if (index !== -1) {
        mockProjectsData[index] = { ...mockProjectsData[index], ...updates };
        return { data: mockProjectsData[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }
    
    return await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },
  
  // Delete project
  async delete(id) {
    if (isDemoMode) {
      const index = mockProjectsData.findIndex(p => p.id === parseInt(id));
      if (index !== -1) {
        mockProjectsData.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }
    
    return await supabase.from('projects').delete().eq('id', id);
  },
  
  // Get project types
  async getTypes() {
    if (isDemoMode) {
      return {
        data: [
          { id: 1, code: 'lot_development', name: 'Lot Development' },
          { id: 2, code: 'spec_building', name: 'Spec Building' },
          { id: 3, code: 'fix_flip', name: 'Fix & Flip' },
          { id: 4, code: 'build_to_rent', name: 'Build-to-Rent' },
          { id: 5, code: 'multifamily', name: 'Multifamily' },
          { id: 6, code: 'townhomes', name: 'Townhomes' },
          { id: 7, code: 'mixed_use', name: 'Mixed-Use' },
          { id: 8, code: 'commercial', name: 'Commercial' },
        ],
        error: null,
      };
    }
    
    return await supabase
      .from('project_types')
      .select('*')
      .order('name', { ascending: true });
  },
  
  // Get project statuses
  getStatuses() {
    return [
      { code: 'acquisition', name: 'Acquisition', color: 'blue' },
      { code: 'pre_development', name: 'Pre-Development', color: 'purple' },
      { code: 'construction', name: 'Construction', color: 'yellow' },
      { code: 'lease_up', name: 'Lease-Up', color: 'orange' },
      { code: 'stabilized', name: 'Stabilized', color: 'green' },
      { code: 'disposition', name: 'Disposition', color: 'gray' },
      { code: 'complete', name: 'Complete', color: 'emerald' },
    ];
  },
  
  // Get project budget summary
  async getBudgetSummary(projectId) {
    if (isDemoMode) {
      const project = mockProjectsData.find(p => p.id === parseInt(projectId));
      if (!project) return { data: null, error: 'Not found' };
      
      return {
        data: {
          totalBudget: project.budget,
          totalSpent: project.spent,
          remaining: project.budget - project.spent,
          percentComplete: ((project.spent / project.budget) * 100).toFixed(1),
          categories: [
            { name: 'Land', budgeted: project.budget * 0.15, spent: project.spent * 0.2 },
            { name: 'Hard Costs', budgeted: project.budget * 0.65, spent: project.spent * 0.65 },
            { name: 'Soft Costs', budgeted: project.budget * 0.12, spent: project.spent * 0.1 },
            { name: 'Contingency', budgeted: project.budget * 0.08, spent: project.spent * 0.05 },
          ],
        },
        error: null,
      };
    }
    
    return await supabase.rpc('get_project_budget_summary', { p_project_id: projectId });
  },
  
  // Get project team
  async getTeam(projectId) {
    if (isDemoMode) {
      return {
        data: [
          { id: 1, name: 'John Smith', role: 'Project Manager', email: 'john@example.com' },
          { id: 2, name: 'Sarah Johnson', role: 'Architect', email: 'sarah@example.com' },
          { id: 3, name: 'Mike Williams', role: 'General Contractor', email: 'mike@example.com' },
        ],
        error: null,
      };
    }
    
    return await supabase
      .from('project_team')
      .select('*, contacts(*)')
      .eq('project_id', projectId);
  },
  
  // Get project milestones
  async getMilestones(projectId) {
    if (isDemoMode) {
      return {
        data: [
          { id: 1, name: 'Site Acquisition', date: '2024-01-15', status: 'complete' },
          { id: 2, name: 'Permits Approved', date: '2024-03-01', status: 'complete' },
          { id: 3, name: 'Foundation Complete', date: '2024-06-15', status: 'complete' },
          { id: 4, name: 'Framing Complete', date: '2024-10-01', status: 'in_progress' },
          { id: 5, name: 'Final Inspection', date: '2025-05-01', status: 'pending' },
          { id: 6, name: 'Certificate of Occupancy', date: '2025-06-30', status: 'pending' },
        ],
        error: null,
      };
    }
    
    return await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: true });
  },
  
  // Search projects
  async search(query) {
    if (isDemoMode) {
      const lowerQuery = query.toLowerCase();
      return {
        data: mockProjectsData.filter(p =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.code.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery) ||
          p.city?.toLowerCase().includes(lowerQuery)
        ),
        error: null,
      };
    }
    
    return await supabase
      .from('projects')
      .select('*, entities(name)')
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name', { ascending: true });
  },
  
  // Get dashboard stats
  async getDashboardStats() {
    if (isDemoMode) {
      return {
        data: {
          totalProjects: mockProjectsData.length,
          activeProjects: mockProjectsData.filter(p => ['construction', 'pre_development'].includes(p.status)).length,
          totalBudget: mockProjectsData.reduce((sum, p) => sum + p.budget, 0),
          totalSpent: mockProjectsData.reduce((sum, p) => sum + p.spent, 0),
          totalUnits: mockProjectsData.reduce((sum, p) => sum + (p.units || 0), 0),
          byStatus: {
            acquisition: mockProjectsData.filter(p => p.status === 'acquisition').length,
            pre_development: mockProjectsData.filter(p => p.status === 'pre_development').length,
            construction: mockProjectsData.filter(p => p.status === 'construction').length,
            stabilized: mockProjectsData.filter(p => p.status === 'stabilized').length,
          },
        },
        error: null,
      };
    }
    
    return await supabase.rpc('get_project_dashboard_stats');
  },
};

export default projectService;
