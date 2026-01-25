import { supabase, isDemoMode } from '@/lib/supabase';

// Mock relationships for demo mode
const mockRelationships = [
  {
    id: 'rel-1',
    parent_entity_id: 'entity-1',
    parent_entity: { id: 'entity-1', name: 'Atlas Holdings LLC', type: 'holding' },
    child_entity_id: 'entity-2',
    child_entity: { id: 'entity-2', name: 'Atlas Development Co', type: 'operating' },
    ownership_percentage: 100,
    relationship_type: 'ownership',
    effective_date: '2023-01-15',
    end_date: null,
    notes: 'Wholly-owned subsidiary',
  },
  {
    id: 'rel-2',
    parent_entity_id: 'entity-2',
    parent_entity: { id: 'entity-2', name: 'Atlas Development Co', type: 'operating' },
    child_entity_id: 'entity-3',
    child_entity: { id: 'entity-3', name: 'Sunset Ridge Development LLC', type: 'project' },
    ownership_percentage: 80,
    relationship_type: 'ownership',
    effective_date: '2024-03-01',
    end_date: null,
    notes: 'Joint venture with capital partner',
  },
  {
    id: 'rel-3',
    parent_entity_id: 'entity-4',
    parent_entity: { id: 'entity-4', name: 'Capital Partners Fund I', type: 'holding' },
    child_entity_id: 'entity-3',
    child_entity: { id: 'entity-3', name: 'Sunset Ridge Development LLC', type: 'project' },
    ownership_percentage: 20,
    relationship_type: 'ownership',
    effective_date: '2024-03-01',
    end_date: null,
    notes: 'Minority capital partner',
  },
];

export const entityRelationshipService = {
  // Get all relationships for an entity (as parent or child)
  async getByEntityId(entityId, options = {}) {
    if (isDemoMode) {
      let relationships = mockRelationships.filter(r =>
        r.parent_entity_id === entityId || r.child_entity_id === entityId
      );

      if (options.asParent) {
        relationships = relationships.filter(r => r.parent_entity_id === entityId);
      }
      if (options.asChild) {
        relationships = relationships.filter(r => r.child_entity_id === entityId);
      }
      if (options.type) {
        relationships = relationships.filter(r => r.relationship_type === options.type);
      }
      if (options.activeOnly) {
        relationships = relationships.filter(r => !r.end_date || new Date(r.end_date) >= new Date());
      }

      return { data: relationships, error: null };
    }

    let query = supabase
      .from('entity_relationships')
      .select(`
        *,
        parent_entity:entities!entity_relationships_parent_entity_id_fkey(id, name, type),
        child_entity:entities!entity_relationships_child_entity_id_fkey(id, name, type)
      `);

    if (options.asParent) {
      query = query.eq('parent_entity_id', entityId);
    } else if (options.asChild) {
      query = query.eq('child_entity_id', entityId);
    } else {
      query = query.or(`parent_entity_id.eq.${entityId},child_entity_id.eq.${entityId}`);
    }

    if (options.type) {
      query = query.eq('relationship_type', options.type);
    }

    if (options.activeOnly) {
      query = query.or('end_date.is.null,end_date.gte.' + new Date().toISOString().split('T')[0]);
    }

    return await query.order('effective_date', { ascending: false });
  },

  // Get ownership structure for an entity (who owns it)
  async getOwners(entityId, options = {}) {
    return this.getByEntityId(entityId, { ...options, asChild: true, type: 'ownership' });
  },

  // Get subsidiaries of an entity (what it owns)
  async getSubsidiaries(entityId, options = {}) {
    return this.getByEntityId(entityId, { ...options, asParent: true, type: 'ownership' });
  },

  // Get total ownership percentage for a child entity
  async getTotalOwnership(childEntityId) {
    const { data: relationships, error } = await this.getOwners(childEntityId, { activeOnly: true });
    if (error) return { data: null, error };

    const total = relationships.reduce((sum, rel) => sum + (rel.ownership_percentage || 0), 0);
    return { data: total, error: null };
  },

  // Get remaining available ownership for a child entity
  async getAvailableOwnership(childEntityId) {
    const { data: total, error } = await this.getTotalOwnership(childEntityId);
    if (error) return { data: null, error };
    return { data: 100 - total, error: null };
  },

  // Create a new relationship
  async create(relationship) {
    // Validate ownership percentage doesn't exceed 100%
    if (relationship.relationship_type === 'ownership') {
      const { data: available, error: availError } = await this.getAvailableOwnership(relationship.child_entity_id);
      if (availError) return { data: null, error: availError };

      if (relationship.ownership_percentage > available) {
        return {
          data: null,
          error: `Cannot add ${relationship.ownership_percentage}% ownership. Only ${available}% available.`
        };
      }
    }

    if (isDemoMode) {
      const newRelationship = {
        ...relationship,
        id: `rel-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      mockRelationships.push(newRelationship);
      return { data: newRelationship, error: null };
    }

    return await supabase
      .from('entity_relationships')
      .insert(relationship)
      .select(`
        *,
        parent_entity:entities!entity_relationships_parent_entity_id_fkey(id, name, type),
        child_entity:entities!entity_relationships_child_entity_id_fkey(id, name, type)
      `)
      .single();
  },

  // Update a relationship
  async update(id, updates) {
    // If updating ownership percentage, validate
    if (updates.ownership_percentage !== undefined) {
      const { data: existing } = await this.getById(id);
      if (existing && existing.relationship_type === 'ownership') {
        const { data: available } = await this.getAvailableOwnership(existing.child_entity_id);
        const additionalNeeded = updates.ownership_percentage - (existing.ownership_percentage || 0);

        if (additionalNeeded > available) {
          return {
            data: null,
            error: `Cannot set ${updates.ownership_percentage}% ownership. Only ${available + existing.ownership_percentage}% available.`
          };
        }
      }
    }

    if (isDemoMode) {
      const index = mockRelationships.findIndex(r => r.id === id);
      if (index !== -1) {
        mockRelationships[index] = { ...mockRelationships[index], ...updates };
        return { data: mockRelationships[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }

    return await supabase
      .from('entity_relationships')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        parent_entity:entities!entity_relationships_parent_entity_id_fkey(id, name, type),
        child_entity:entities!entity_relationships_child_entity_id_fkey(id, name, type)
      `)
      .single();
  },

  // End a relationship (set end_date)
  async end(id, endDate = new Date().toISOString().split('T')[0]) {
    return await this.update(id, { end_date: endDate });
  },

  // Delete a relationship
  async delete(id) {
    if (isDemoMode) {
      const index = mockRelationships.findIndex(r => r.id === id);
      if (index !== -1) {
        mockRelationships.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }

    return await supabase
      .from('entity_relationships')
      .delete()
      .eq('id', id);
  },

  // Get by ID
  async getById(id) {
    if (isDemoMode) {
      const relationship = mockRelationships.find(r => r.id === id);
      return { data: relationship || null, error: relationship ? null : 'Not found' };
    }

    return await supabase
      .from('entity_relationships')
      .select(`
        *,
        parent_entity:entities!entity_relationships_parent_entity_id_fkey(id, name, type),
        child_entity:entities!entity_relationships_child_entity_id_fkey(id, name, type)
      `)
      .eq('id', id)
      .single();
  },

  // Build full ownership chain (recursive)
  async getOwnershipChain(entityId, visited = new Set()) {
    if (visited.has(entityId)) {
      return { data: [], error: null }; // Prevent circular references
    }
    visited.add(entityId);

    const { data: owners, error } = await this.getOwners(entityId, { activeOnly: true });
    if (error) return { data: null, error };

    const chain = [];

    for (const owner of owners) {
      const ownerChain = await this.getOwnershipChain(owner.parent_entity_id, visited);

      chain.push({
        entity: owner.parent_entity,
        directOwnership: owner.ownership_percentage,
        effectiveOwnership: owner.ownership_percentage,
        relationship: owner,
        parents: ownerChain.data || [],
      });
    }

    return { data: chain, error: null };
  },

  // Build full subsidiary tree (recursive)
  async getSubsidiaryTree(entityId, visited = new Set()) {
    if (visited.has(entityId)) {
      return { data: [], error: null }; // Prevent circular references
    }
    visited.add(entityId);

    const { data: subsidiaries, error } = await this.getSubsidiaries(entityId, { activeOnly: true });
    if (error) return { data: null, error };

    const tree = [];

    for (const sub of subsidiaries) {
      const subTree = await this.getSubsidiaryTree(sub.child_entity_id, visited);

      tree.push({
        entity: sub.child_entity,
        ownershipPercentage: sub.ownership_percentage,
        relationship: sub,
        children: subTree.data || [],
      });
    }

    return { data: tree, error: null };
  },

  // Calculate effective ownership through chain
  calculateEffectiveOwnership(ownershipChain, targetEntityId) {
    // Recursive calculation of effective ownership through multiple layers
    function calculate(chain, currentPercentage = 100) {
      let totalEffective = 0;

      for (const node of chain) {
        const nodeEffective = (currentPercentage * node.directOwnership) / 100;

        if (node.entity.id === targetEntityId) {
          totalEffective += nodeEffective;
        }

        if (node.parents && node.parents.length > 0) {
          totalEffective += calculate(node.parents, nodeEffective);
        }
      }

      return totalEffective;
    }

    return calculate(ownershipChain);
  },
};

export default entityRelationshipService;
