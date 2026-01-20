import { supabase } from '@/lib/supabase';

export const opportunityService = {
  async getAll() {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(opportunity) {
    const { data, error } = await supabase
      .from('opportunities')
      .insert([opportunity])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('opportunities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async updateStage(id, stage) {
    return this.update(id, { stage });
  },

  async getByStage(stage) {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('stage', stage)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};
