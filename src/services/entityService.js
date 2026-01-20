import { supabase } from '@/lib/supabase';

/**
 * Entity Service - Handles all Supabase operations for entities
 * Supports holding companies, operating companies, and project LLCs
 */

export const entityService = {
  /**
   * Get all entities
   */
  async getAll() {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get a single entity by ID
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new entity
   */
  async create(entityData) {
    const { data, error } = await supabase
      .from('entities')
      .insert([{
        ...entityData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing entity
   */
  async update(id, entityData) {
    const { data, error } = await supabase
      .from('entities')
      .update({
        ...entityData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an entity
   */
  async delete(id) {
    // First check if entity has children
    const { data: children } = await supabase
      .from('entities')
      .select('id')
      .eq('parent_entity_id', id);

    if (children && children.length > 0) {
      throw new Error('Cannot delete entity with child entities. Please reassign or delete children first.');
    }

    const { error } = await supabase
      .from('entities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Get entities by type
   */
  async getByType(type) {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('type', type)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get child entities of a parent
   */
  async getChildren(parentId) {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('parent_entity_id', parentId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get top-level entities (no parent)
   */
  async getTopLevel() {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .is('parent_entity_id', null)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get entity hierarchy as a tree structure
   */
  async getHierarchy() {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    // Build tree structure
    const buildTree = (entities, parentId = null) => {
      return entities
        .filter(e => e.parent_entity_id === parentId)
        .map(entity => ({
          ...entity,
          children: buildTree(entities, entity.id)
        }));
    };

    return buildTree(data);
  },

  /**
   * Get entity with all descendants (flat list)
   */
  async getWithDescendants(entityId) {
    const { data: allEntities, error } = await supabase
      .from('entities')
      .select('*');

    if (error) throw error;

    const descendants = [];
    const findDescendants = (parentId) => {
      const children = allEntities.filter(e => e.parent_entity_id === parentId);
      children.forEach(child => {
        descendants.push(child);
        findDescendants(child.id);
      });
    };

    const entity = allEntities.find(e => e.id === entityId);
    if (entity) {
      descendants.push(entity);
      findDescendants(entityId);
    }

    return descendants;
  },

  /**
   * Get entity path (breadcrumb from root to entity)
   */
  async getPath(entityId) {
    const { data: allEntities, error } = await supabase
      .from('entities')
      .select('*');

    if (error) throw error;

    const path = [];
    let currentId = entityId;

    while (currentId) {
      const entity = allEntities.find(e => e.id === currentId);
      if (entity) {
        path.unshift(entity);
        currentId = entity.parent_entity_id;
      } else {
        break;
      }
    }

    return path;
  },

  /**
   * Check if entity can be deleted (no children, no linked projects/transactions)
   */
  async canDelete(entityId) {
    // Check for children
    const { data: children } = await supabase
      .from('entities')
      .select('id')
      .eq('parent_entity_id', entityId);

    if (children && children.length > 0) {
      return { canDelete: false, reason: 'Entity has child entities' };
    }

    // Check for linked projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('entity_id', entityId);

    if (projects && projects.length > 0) {
      return { canDelete: false, reason: 'Entity has linked projects' };
    }

    // Check for linked transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id')
      .eq('entity_id', entityId);

    if (transactions && transactions.length > 0) {
      return { canDelete: false, reason: 'Entity has linked transactions' };
    }

    return { canDelete: true };
  }
};

export default entityService;
import { supabase, isDemoMode } from '@/lib/supabase';

// Mock data for demo mode
const mockEntities = [
  {
    id: 1,
    name: 'VanRock Holdings LLC',
    type: 'holding_company',
    type_name: 'Holding Company',
    ein: '12-3456789',
    state: 'SC',
    status: 'active',
    formation_date: '2020-01-15',
    address: '123 Main Street, Suite 100',
    city: 'Greenville',
    zip: '29601',
    description: 'Parent holding company for all real estate operations',
    created_at: '2020-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Watson House LLC',
    type: 'project_entity',
    type_name: 'Project Entity',
    ein: '98-7654321',
    state: 'SC',
    status: 'active',
    formation_date: '2023-06-01',
    address: '456 Development Way',
    city: 'Greenville',
    zip: '29605',
    description: '48-unit multifamily development project',
    parent_entity_id: 1,
    project_id: 1,
    created_at: '2023-06-01T10:00:00Z',
  },
  {
    id: 3,
    name: 'Oslo Townhomes LLC',
    type: 'project_entity',
    type_name: 'Project Entity',
    ein: '55-1234567',
    state: 'SC',
    status: 'active',
    formation_date: '2023-09-15',
    address: '789 Builder Lane',
    city: 'Spartanburg',
    zip: '29302',
    description: '12-unit townhome development',
    parent_entity_id: 1,
    project_id: 2,
    created_at: '2023-09-15T10:00:00Z',
  },
  {
    id: 4,
    name: 'Cedar Mill Partners',
    type: 'project_entity',
    type_name: 'Project Entity',
    ein: '77-9876543',
    state: 'SC',
    status: 'active',
    formation_date: '2024-01-10',
    address: '321 Cedar Mill Road',
    city: 'Anderson',
    zip: '29621',
    description: 'Mixed-use development partnership',
    parent_entity_id: 1,
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 5,
    name: 'Olive Brynn LLC',
    type: 'personal_holding',
    type_name: 'Personal Holding',
    ein: '33-4567890',
    state: 'SC',
    status: 'active',
    formation_date: '2019-03-01',
    description: 'Personal holding company - 50% owner of VanRock Holdings',
    created_at: '2019-03-01T10:00:00Z',
  },
];

let mockEntitiesData = [...mockEntities];

export const entityService = {
  // Get all entities
  async getAll(options = {}) {
    if (isDemoMode) {
      let filtered = [...mockEntitiesData];
      
      if (options.type) {
        filtered = filtered.filter(e => e.type === options.type);
      }
      
      if (options.status) {
        filtered = filtered.filter(e => e.status === options.status);
      }
      
      if (options.parentId) {
        filtered = filtered.filter(e => e.parent_entity_id === options.parentId);
      }
      
      return { data: filtered, error: null };
    }
    
    let query = supabase
      .from('entities')
      .select('*, entity_types(name)')
      .order('name', { ascending: true });
    
    if (options.type) {
      query = query.eq('type', options.type);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.parentId) {
      query = query.eq('parent_entity_id', options.parentId);
    }
    
    return await query;
  },
  
  // Get entity by ID
  async getById(id) {
    if (isDemoMode) {
      const entity = mockEntitiesData.find(e => e.id === parseInt(id));
      return { data: entity || null, error: entity ? null : 'Not found' };
    }
    
    return await supabase
      .from('entities')
      .select('*, entity_types(name)')
      .eq('id', id)
      .single();
  },
  
  // Create entity
  async create(entity) {
    if (isDemoMode) {
      const newEntity = {
        ...entity,
        id: Date.now(),
        created_at: new Date().toISOString(),
      };
      mockEntitiesData.push(newEntity);
      return { data: newEntity, error: null };
    }
    
    return await supabase
      .from('entities')
      .insert(entity)
      .select()
      .single();
  },
  
  // Update entity
  async update(id, updates) {
    if (isDemoMode) {
      const index = mockEntitiesData.findIndex(e => e.id === parseInt(id));
      if (index !== -1) {
        mockEntitiesData[index] = { ...mockEntitiesData[index], ...updates };
        return { data: mockEntitiesData[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }
    
    return await supabase
      .from('entities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },
  
  // Delete entity
  async delete(id) {
    if (isDemoMode) {
      const index = mockEntitiesData.findIndex(e => e.id === parseInt(id));
      if (index !== -1) {
        mockEntitiesData.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }
    
    return await supabase.from('entities').delete().eq('id', id);
  },
  
  // Get entity types
  async getTypes() {
    if (isDemoMode) {
      return {
        data: [
          { id: 1, code: 'holding_company', name: 'Holding Company' },
          { id: 2, code: 'project_entity', name: 'Project Entity' },
          { id: 3, code: 'personal_holding', name: 'Personal Holding' },
          { id: 4, code: 'operating_company', name: 'Operating Company' },
        ],
        error: null,
      };
    }
    
    return await supabase
      .from('entity_types')
      .select('*')
      .order('name', { ascending: true });
  },
  
  // Get ownership structure
  async getOwnershipStructure(entityId) {
    if (isDemoMode) {
      return {
        data: {
          entity: mockEntitiesData.find(e => e.id === parseInt(entityId)),
          children: mockEntitiesData.filter(e => e.parent_entity_id === parseInt(entityId)),
          owners: [
            { id: 1, name: 'Bryan De Bruin', ownership_pct: 50.0, type: 'individual' },
            { id: 5, name: 'Olive Brynn LLC', ownership_pct: 50.0, type: 'entity' },
          ],
        },
        error: null,
      };
    }
    
    // In production, this would be a more complex query joining ownership tables
    return await supabase
      .from('entity_ownership')
      .select('*, entities(*)')
      .eq('entity_id', entityId);
  },
  
  // Get entity summary (financials)
  async getSummary(entityId) {
    if (isDemoMode) {
      return {
        data: {
          totalAssets: 1250000,
          totalLiabilities: 450000,
          equity: 800000,
          cashBalance: 245000,
          accountsPayable: 35000,
          accountsReceivable: 15000,
          projectCount: 3,
          memberCount: 2,
        },
        error: null,
      };
    }
    
    // In production, this would aggregate from various tables
    return await supabase.rpc('get_entity_summary', { p_entity_id: entityId });
  },
  
  // Search entities
  async search(query) {
    if (isDemoMode) {
      const lowerQuery = query.toLowerCase();
      return {
        data: mockEntitiesData.filter(e =>
          e.name.toLowerCase().includes(lowerQuery) ||
          e.description?.toLowerCase().includes(lowerQuery)
        ),
        error: null,
      };
    }
    
    return await supabase
      .from('entities')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name', { ascending: true });
  },
};

export default entityService;
