import { supabase, isDemoMode } from '@/lib/supabase';

// Mock data for demo mode
const mockJournalEntries = [
  {
    id: 1,
    entry_number: 'JE-2024-001',
    date: '2024-12-15',
    description: 'Monthly depreciation expense',
    status: 'posted',
    created_at: '2024-12-15T10:00:00Z',
    total_debit: 5000,
    total_credit: 5000,
    lines: [
      { id: 1, account_id: 1, account_name: 'Depreciation Expense', debit: 5000, credit: 0 },
      { id: 2, account_id: 2, account_name: 'Accumulated Depreciation', debit: 0, credit: 5000 },
    ]
  },
  {
    id: 2,
    entry_number: 'JE-2024-002',
    date: '2024-12-20',
    description: 'Accrued interest payable',
    status: 'posted',
    created_at: '2024-12-20T14:30:00Z',
    total_debit: 2500,
    total_credit: 2500,
    lines: [
      { id: 3, account_id: 3, account_name: 'Interest Expense', debit: 2500, credit: 0 },
      { id: 4, account_id: 4, account_name: 'Interest Payable', debit: 0, credit: 2500 },
    ]
  },
];

export const journalEntryService = {
  // Get all journal entries for an entity
  async getAll(entityId, options = {}) {
    if (isDemoMode) {
      return { data: mockJournalEntries, error: null };
    }
    
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
    if (isDemoMode) {
      const entry = mockJournalEntries.find(e => e.id === id);
      return { data: entry || null, error: entry ? null : 'Not found' };
    }
    
    return await supabase
      .from('journal_entries')
      .select('*, journal_entry_lines(*)')
      .eq('id', id)
      .single();
  },
  
  // Create a new journal entry
  async create(entry) {
    if (isDemoMode) {
      const newEntry = {
        ...entry,
        id: Date.now(),
        entry_number: `JE-${new Date().getFullYear()}-${String(mockJournalEntries.length + 1).padStart(3, '0')}`,
        created_at: new Date().toISOString(),
      };
      mockJournalEntries.push(newEntry);
      return { data: newEntry, error: null };
    }
    
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
    if (isDemoMode) {
      const index = mockJournalEntries.findIndex(e => e.id === id);
      if (index !== -1) {
        mockJournalEntries[index] = { ...mockJournalEntries[index], ...updates };
        return { data: mockJournalEntries[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }
    
    return await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },
  
  // Delete a journal entry
  async delete(id) {
    if (isDemoMode) {
      const index = mockJournalEntries.findIndex(e => e.id === id);
      if (index !== -1) {
        mockJournalEntries.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }
    
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
