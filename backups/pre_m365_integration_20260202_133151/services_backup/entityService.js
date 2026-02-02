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
