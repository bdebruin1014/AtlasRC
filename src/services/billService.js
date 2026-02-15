import { supabase, isDemoMode } from '@/lib/supabase';

// Mock data for demo mode
const mockBills = [
  {
    id: 1,
    bill_number: 'BILL-001',
    vendor_id: 1,
    vendor_name: 'BuildRight Construction',
    bill_date: '2024-12-01',
    due_date: '2024-12-31',
    description: 'Materials for Project Watson House',
    terms: '30',
    amount: 12500.00,
    balance: 12500.00,
    status: 'pending',
    line_items: [
      { account_id: 1, account_name: 'Construction Materials', description: 'Lumber and framing', amount: 8500.00 },
      { account_id: 2, account_name: 'Construction Materials', description: 'Concrete', amount: 4000.00 },
    ],
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 2,
    bill_number: 'BILL-002',
    vendor_id: 2,
    vendor_name: 'ABC Supplies',
    bill_date: '2024-12-05',
    due_date: '2025-01-04',
    description: 'Office supplies',
    terms: '30',
    amount: 450.25,
    balance: 450.25,
    status: 'pending',
    line_items: [
      { account_id: 3, account_name: 'Office Supplies', description: 'Printer paper and ink', amount: 450.25 },
    ],
    created_at: '2024-12-05T14:30:00Z',
  },
  {
    id: 3,
    bill_number: 'BILL-003',
    vendor_id: 3,
    vendor_name: 'Metro Electric',
    bill_date: '2024-11-15',
    due_date: '2024-12-15',
    description: 'Electrical work - Phase 1',
    terms: '30',
    amount: 8750.00,
    balance: 0,
    status: 'paid',
    line_items: [
      { account_id: 4, account_name: 'Subcontractor Expense', description: 'Electrical installation', amount: 8750.00 },
    ],
    payments: [
      { date: '2024-12-10', amount: 8750.00, method: 'Check #1042' },
    ],
    created_at: '2024-11-15T09:00:00Z',
  },
  {
    id: 4,
    bill_number: 'BILL-004',
    vendor_id: 5,
    vendor_name: 'Legal Partners LLP',
    bill_date: '2024-11-01',
    due_date: '2024-12-01',
    description: 'Legal consultation - Entity formation',
    terms: '30',
    amount: 2500.00,
    balance: 2500.00,
    status: 'overdue',
    line_items: [
      { account_id: 5, account_name: 'Professional Fees', description: 'Legal services', amount: 2500.00 },
    ],
    created_at: '2024-11-01T11:00:00Z',
  },
];

let mockBillsData = [...mockBills];

export const billService = {
  // Get all bills for an entity
  async getAll(entityId, options = {}) {
    try {
      let query = supabase
        .from('bills')
        .select('*, bill_line_items(*)')
        .eq('entity_id', entityId)
        .order('bill_date', { ascending: false });

      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }

      if (options.vendorId) {
        query = query.eq('vendor_id', options.vendorId);
      }

      return await query;
    } catch (err) {
      console.error('Error fetching bills:', err);
      let filtered = [...mockBillsData];

      if (options.status && options.status !== 'all') {
        filtered = filtered.filter(b => b.status === options.status);
      }

      if (options.vendorId) {
        filtered = filtered.filter(b => b.vendor_id === options.vendorId);
      }

      // Sort by date descending
      filtered.sort((a, b) => new Date(b.bill_date) - new Date(a.bill_date));

      return { data: filtered, error: null };
    }
  },

  // Get a single bill by ID
  async getById(id) {
    try {
      return await supabase
        .from('bills')
        .select('*, bill_line_items(*), payments(*)')
        .eq('id', id)
        .single();
    } catch (err) {
      console.error('Error fetching bill by ID:', err);
      const bill = mockBillsData.find(b => b.id === id);
      return { data: bill || null, error: bill ? null : 'Not found' };
    }
  },

  // Create a new bill
  async create(bill) {
    try {
      const { line_items, ...billData } = bill;

      const { data: newBill, error: billError } = await supabase
        .from('bills')
        .insert(billData)
        .select()
        .single();

      if (billError) throw billError;

      if (line_items && line_items.length > 0) {
        const linesWithBillId = line_items.map(line => ({
          ...line,
          bill_id: newBill.id,
        }));

        await supabase.from('bill_line_items').insert(linesWithBillId);
      }

      return { data: newBill, error: null };
    } catch (err) {
      console.error('Error creating bill:', err);
      const newBill = {
        ...bill,
        id: Date.now(),
        bill_number: bill.bill_number || `BILL-${String(mockBillsData.length + 1).padStart(3, '0')}`,
        created_at: new Date().toISOString(),
      };
      mockBillsData.push(newBill);
      return { data: newBill, error: null };
    }
  },

  // Update a bill
  async update(id, updates) {
    try {
      return await supabase
        .from('bills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    } catch (err) {
      console.error('Error updating bill:', err);
      const index = mockBillsData.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBillsData[index] = { ...mockBillsData[index], ...updates };
        return { data: mockBillsData[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }
  },

  // Delete a bill
  async delete(id) {
    try {
      await supabase.from('bill_line_items').delete().eq('bill_id', id);
      return await supabase.from('bills').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting bill:', err);
      const index = mockBillsData.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBillsData.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }
  },

  // Record a payment
  async recordPayment(billId, payment) {
    try {
      // In production, this would create a payment record and update the bill
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({ bill_id: billId, ...payment })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update bill balance
      const { data: bill } = await this.getById(billId);
      const newBalance = (bill.balance || bill.amount) - payment.amount;

      await this.update(billId, {
        balance: Math.max(0, newBalance),
        status: newBalance <= 0 ? 'paid' : bill.status,
      });

      return { data: paymentData, error: null };
    } catch (err) {
      console.error('Error recording payment:', err);
      const bill = mockBillsData.find(b => b.id === billId);
      if (bill) {
        bill.payments = bill.payments || [];
        bill.payments.push({
          ...payment,
          id: Date.now(),
          date: payment.date || new Date().toISOString().split('T')[0],
        });
        bill.balance = Math.max(0, bill.balance - payment.amount);
        if (bill.balance === 0) {
          bill.status = 'paid';
        }
        return { data: bill, error: null };
      }
      return { data: null, error: 'Bill not found' };
    }
  },

  // Void a bill
  async void(id) {
    return await this.update(id, { status: 'void', voided_at: new Date().toISOString() });
  },

  // Get bills due soon
  async getDueSoon(entityId, days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    try {
      return await supabase
        .from('bills')
        .select('*')
        .eq('entity_id', entityId)
        .neq('status', 'paid')
        .neq('status', 'void')
        .lte('due_date', futureDate.toISOString().split('T')[0])
        .order('due_date', { ascending: true });
    } catch (err) {
      console.error('Error fetching bills due soon:', err);
      return {
        data: mockBillsData.filter(b =>
          b.status !== 'paid' &&
          b.status !== 'void' &&
          new Date(b.due_date) <= futureDate
        ),
        error: null,
      };
    }
  },

  // Get overdue bills
  async getOverdue(entityId) {
    const today = new Date().toISOString().split('T')[0];

    try {
      return await supabase
        .from('bills')
        .select('*')
        .eq('entity_id', entityId)
        .neq('status', 'paid')
        .neq('status', 'void')
        .lt('due_date', today)
        .order('due_date', { ascending: true });
    } catch (err) {
      console.error('Error fetching overdue bills:', err);
      return {
        data: mockBillsData.filter(b =>
          b.status !== 'paid' &&
          b.status !== 'void' &&
          b.due_date < today
        ),
        error: null,
      };
    }
  },
};

export default billService;
