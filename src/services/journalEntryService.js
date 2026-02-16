import { supabase } from '@/lib/supabase';

export const journalEntryService = {
  // Get all journal entries for an entity
  async getAll(entityId, options = {}) {
    let query = supabase
      .from('journal_entries')
      .select('*, journal_entry_lines(*)')
      .eq('entity_id', entityId)
      .order('date', { ascending: false });

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.startDate) {
      query = query.gte('date', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('date', options.endDate);
    }

    return await query;
  },

  // Get a single journal entry by ID
  async getById(id) {
    return await supabase
      .from('journal_entries')
      .select('*, journal_entry_lines(*)')
      .eq('id', id)
      .single();
  },

  // Create a new journal entry
  async create(entry) {
    const { lines, ...entryData } = entry;

    // Insert the journal entry
    const { data: newEntry, error: entryError } = await supabase
      .from('journal_entries')
      .insert(entryData)
      .select()
      .single();

    if (entryError) return { data: null, error: entryError };

    // Insert the lines
    if (lines && lines.length > 0) {
      const linesWithEntryId = lines.map(line => ({
        ...line,
        journal_entry_id: newEntry.id,
      }));

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(linesWithEntryId);

      if (linesError) return { data: null, error: linesError };
    }

    return { data: newEntry, error: null };
  },

  // Update a journal entry
  async update(id, updates) {
    return await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  // Delete a journal entry
  async delete(id) {
    // Delete lines first (if not using CASCADE)
    await supabase
      .from('journal_entry_lines')
      .delete()
      .eq('journal_entry_id', id);

    return await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);
  },

  // Post a journal entry
  async post(id) {
    return await this.update(id, { status: 'posted', posted_at: new Date().toISOString() });
  },

  // Void a journal entry
  async void(id) {
    return await this.update(id, { status: 'voided', voided_at: new Date().toISOString() });
  },
};

export default journalEntryService;
