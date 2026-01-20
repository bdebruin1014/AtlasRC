import { supabase } from '@/lib/supabase';

export const transactionService = {
  async getAll() {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        entity:entities(name),
        project:projects(name),
        contact:contacts(first_name, last_name)
      `)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        entity:entities(name),
        project:projects(name),
        contact:contacts(first_name, last_name)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(transaction) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('project_id', projectId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByEntity(entityId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('entity_id', entityId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data;
  },
};
