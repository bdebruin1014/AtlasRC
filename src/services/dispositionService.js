import { supabase } from '@/lib/supabase';

export const dispositionService = {
  // ============================================================================
  // CONTRACTS
  // ============================================================================

  async getContracts(projectId) {
    const query = supabase
      .from('disposition_contracts')
      .select(`
        *,
        buyer_contact:contacts(id, name, email, phone, company),
        takedowns:disposition_takedowns(*)
      `)
      .order('created_at', { ascending: false });

    if (projectId) {
      query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getContractById(id) {
    const { data, error } = await supabase
      .from('disposition_contracts')
      .select(`
        *,
        buyer_contact:contacts(id, name, email, phone, company),
        takedowns:disposition_takedowns(*),
        settlements:disposition_settlements(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createContract(contract) {
    const { data, error } = await supabase
      .from('disposition_contracts')
      .insert(contract)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateContract(id, updates) {
    const { data, error } = await supabase
      .from('disposition_contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteContract(id) {
    const { error } = await supabase
      .from('disposition_contracts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================================
  // TAKEDOWNS
  // ============================================================================

  async getTakedowns(contractId) {
    const { data, error } = await supabase
      .from('disposition_takedowns')
      .select('*')
      .eq('contract_id', contractId)
      .order('takedown_number', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createTakedown(takedown) {
    const { data, error } = await supabase
      .from('disposition_takedowns')
      .insert(takedown)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTakedown(id, updates) {
    const { data, error } = await supabase
      .from('disposition_takedowns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTakedown(id) {
    const { error } = await supabase
      .from('disposition_takedowns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================================
  // SETTLEMENTS
  // ============================================================================

  async getSettlements(projectId) {
    const query = supabase
      .from('disposition_settlements')
      .select(`
        *,
        contract:disposition_contracts(id, contract_number, buyer_name),
        items:disposition_settlement_items(*)
      `)
      .order('closing_date', { ascending: false });

    if (projectId) {
      query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getSettlementById(id) {
    const { data, error } = await supabase
      .from('disposition_settlements')
      .select(`
        *,
        contract:disposition_contracts(id, contract_number, buyer_name),
        takedown:disposition_takedowns(*),
        items:disposition_settlement_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createSettlement(settlement) {
    const { data, error } = await supabase
      .from('disposition_settlements')
      .insert(settlement)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSettlement(id, updates) {
    const { data, error } = await supabase
      .from('disposition_settlements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSettlement(id) {
    const { error } = await supabase
      .from('disposition_settlements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================================
  // SETTLEMENT ITEMS
  // ============================================================================

  async addSettlementItem(item) {
    const { data, error } = await supabase
      .from('disposition_settlement_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSettlementItem(id, updates) {
    const { data, error } = await supabase
      .from('disposition_settlement_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSettlementItem(id) {
    const { error } = await supabase
      .from('disposition_settlement_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================================
  // UNITS
  // ============================================================================

  async getUnits(projectId, filters = {}) {
    let query = supabase
      .from('disposition_units')
      .select(`
        *,
        contract:disposition_contracts(id, contract_number, buyer_name)
      `)
      .eq('project_id', projectId)
      .order('unit_number', { ascending: true });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.phase) {
      query = query.eq('phase', filters.phase);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createUnit(unit) {
    const { data, error } = await supabase
      .from('disposition_units')
      .insert(unit)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createUnits(units) {
    const { data, error } = await supabase
      .from('disposition_units')
      .insert(units)
      .select();

    if (error) throw error;
    return data;
  },

  async updateUnit(id, updates) {
    const { data, error } = await supabase
      .from('disposition_units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUnit(id) {
    const { error } = await supabase
      .from('disposition_units')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================================
  // SUMMARY / ANALYTICS
  // ============================================================================

  async getDispositionSummary(projectId) {
    // Get all contracts with takedowns
    const { data: contracts, error: contractsError } = await supabase
      .from('disposition_contracts')
      .select(`
        *,
        takedowns:disposition_takedowns(*)
      `)
      .eq('project_id', projectId);

    if (contractsError) throw contractsError;

    // Get all settlements
    const { data: settlements, error: settlementsError } = await supabase
      .from('disposition_settlements')
      .select('*')
      .eq('project_id', projectId);

    if (settlementsError) throw settlementsError;

    // Get all units
    const { data: units, error: unitsError } = await supabase
      .from('disposition_units')
      .select('*')
      .eq('project_id', projectId);

    if (unitsError) throw unitsError;

    // Calculate summary
    const activeContracts = contracts?.filter(c => c.status === 'active') || [];
    const totalContracted = activeContracts.reduce((sum, c) => sum + (parseFloat(c.contract_price) || 0), 0);
    const unitsContracted = activeContracts.reduce((sum, c) => sum + (c.total_units || 0), 0);

    const completedTakedowns = contracts?.flatMap(c => c.takedowns || []).filter(t => t.status === 'completed') || [];
    const amountReceived = completedTakedowns.reduce((sum, t) => sum + (parseFloat(t.actual_amount) || 0), 0);
    const unitsSold = completedTakedowns.reduce((sum, t) => sum + (t.actual_units || 0), 0);

    const upcomingTakedowns = contracts?.flatMap(c => c.takedowns || []).filter(t => t.status === 'upcoming' || t.status === 'scheduled') || [];

    const totalUnits = units?.length || 0;
    const availableUnits = units?.filter(u => u.status === 'available').length || 0;

    return {
      totalUnits,
      availableUnits,
      unitsContracted,
      unitsSold,
      unitsRemaining: totalUnits - unitsContracted,
      totalContracted,
      amountReceived,
      amountPending: totalContracted - amountReceived,
      activeContracts: activeContracts.length,
      totalContracts: contracts?.length || 0,
      pendingTakedowns: upcomingTakedowns.length,
      completedSettlements: settlements?.filter(s => s.status === 'closed' || s.status === 'funded').length || 0
    };
  }
};

export default dispositionService;
