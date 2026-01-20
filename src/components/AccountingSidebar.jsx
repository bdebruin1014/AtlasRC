import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, BookOpen, CreditCard, Receipt, FileText,
  ArrowLeftRight, DollarSign, BarChart3, Settings, Wallet, PiggyBank,
  GitBranch, CheckSquare, AlertCircle, Clock, Plus, Users, Layers, Percent,
  Link2, Briefcase, Car
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransactionEntryProvider, TransactionEntryContext } from '@/contexts/TransactionEntryContext';

// Quick Actions for dark theme sidebar
const QuickActionsDark = ({ entityId }) => {
  const { openModal } = React.useContext(TransactionEntryContext);

  const actions = [
    { type: 'bill', label: '+ Bill', color: 'bg-red-600 hover:bg-red-500' },
    { type: 'invoice', label: '+ Invoice', color: 'bg-green-600 hover:bg-green-500' },
    { type: 'payment', label: '+ Payment', color: 'bg-blue-600 hover:bg-blue-500' },
    { type: 'journalEntry', label: '+ Journal', color: 'bg-purple-600 hover:bg-purple-500' }
  ];

  return (
    <div className="p-3 border-b border-gray-800">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Actions</p>
      <div className="grid grid-cols-2 gap-1.5">
        {actions.map(action => (
          <button
            key={action.type}
            className={`${action.color} py-1.5 px-2 rounded text-[10px] font-medium text-white transition-colors`}
            onClick={() => openModal(action.type, entityId)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Transaction Modal Container for dark theme
const TransactionModalsDark = () => {
  const { activeModal, closeModal, selectedEntity } = React.useContext(TransactionEntryContext);
  const [formData, setFormData] = React.useState({});
  const [lineItems, setLineItems] = React.useState([{ id: 1, description: '', quantity: 1, rate: '', amount: 0, account: '' }]);
  const [jeLines, setJeLines] = React.useState([
    { id: 1, account: '', debit: '', credit: '', memo: '' },
    { id: 2, account: '', debit: '', credit: '', memo: '' }
  ]);

  React.useEffect(() => {
    if (activeModal) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        number: '',
        vendor: '',
        customer: '',
        paymentMethod: 'check',
        memo: '',
        subtotal: 0,
        tax: 0,
        total: 0
      });
      setLineItems([{ id: 1, description: '', quantity: 1, rate: '', amount: 0, account: '' }]);
      setJeLines([
        { id: 1, account: '', debit: '', credit: '', memo: '' },
        { id: 2, account: '', debit: '', credit: '', memo: '' }
      ]);
    }
  }, [activeModal]);

  if (!activeModal) return null;

  const updateLineItem = (id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          const qty = parseFloat(updated.quantity) || 0;
          const rate = parseFloat(updated.rate) || 0;
          updated.amount = qty * rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, { id: Date.now(), description: '', quantity: 1, rate: '', amount: 0, account: '' }]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateJeLine = (id, field, value) => {
    setJeLines(prev => prev.map(line => line.id === id ? { ...line, [field]: value } : line));
  };

  const addJeLine = () => {
    setJeLines(prev => [...prev, { id: Date.now(), account: '', debit: '', credit: '', memo: '' }]);
  };

  const removeJeLine = (id) => {
    if (jeLines.length > 2) {
      setJeLines(prev => prev.filter(line => line.id !== id));
    }
  };

  const totalDebits = jeLines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredits = jeLines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  const isBalanced = totalDebits === totalCredits && totalDebits > 0;
  const difference = totalDebits - totalCredits;

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const tax = parseFloat(formData.tax) || 0;
    return { subtotal, total: subtotal + tax };
  };

  const { subtotal, total } = calculateTotals();

  const handleSave = () => {
    console.log('Saving transaction:', { type: activeModal, formData, lineItems, selectedEntity });
    closeModal();
  };

  // Bill Form
  if (activeModal === 'bill') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Add Bill</h2>
            <p className="text-gray-500 text-sm">Record a vendor bill or invoice</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Vendor *</label>
                <select className="w-full border rounded-md px-3 py-2" value={formData.vendor || ''} onChange={(e) => setFormData({...formData, vendor: e.target.value})}>
                  <option value="">Select vendor...</option>
                  <option value="vendor1">Smith Framing LLC</option>
                  <option value="vendor2">ABC Plumbing</option>
                  <option value="vendor3">Sparks Electric</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bill Number</label>
                <input type="text" className="w-full border rounded-md px-3 py-2" placeholder="Vendor invoice #" value={formData.number || ''} onChange={(e) => setFormData({...formData, number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bill Date *</label>
                <input type="date" className="w-full border rounded-md px-3 py-2" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date *</label>
                <input type="date" className="w-full border rounded-md px-3 py-2" value={formData.dueDate || ''} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Line Items</label>
                <button onClick={addLineItem} className="text-sm text-emerald-600 hover:text-emerald-700">+ Add Line</button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs">
                    <tr>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-left p-2 font-medium w-24">Qty</th>
                      <th className="text-left p-2 font-medium w-32">Rate</th>
                      <th className="text-left p-2 font-medium w-32">Amount</th>
                      <th className="text-left p-2 font-medium w-32">Account</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">
                          <input type="text" className="w-full border rounded px-2 py-1 text-sm" placeholder="Item description" value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)} />
                        </td>
                        <td className="p-2">
                          <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)} />
                        </td>
                        <td className="p-2">
                          <input type="number" className="w-full border rounded px-2 py-1 text-sm" placeholder="0.00" value={item.rate} onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)} />
                        </td>
                        <td className="p-2">
                          <input type="text" className="w-full border rounded px-2 py-1 text-sm bg-gray-50" value={item.amount.toFixed(2)} readOnly />
                        </td>
                        <td className="p-2">
                          <select className="w-full border rounded px-2 py-1 text-sm" value={item.account} onChange={(e) => updateLineItem(item.id, 'account', e.target.value)}>
                            <option value="">Select...</option>
                            <option value="5000">5000 - COGS</option>
                            <option value="6000">6000 - Operating Exp</option>
                            <option value="6100">6100 - Materials</option>
                          </select>
                        </td>
                        <td className="p-2">
                          {lineItems.length > 1 && (
                            <button onClick={() => removeLineItem(item.id)} className="text-red-500 hover:text-red-700">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span>Tax:</span>
                  <input type="number" className="w-24 border rounded px-2 py-1 text-sm text-right" placeholder="0.00" value={formData.tax || ''} onChange={(e) => setFormData({...formData, tax: e.target.value})} />
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Memo/Notes</label>
              <textarea className="w-full border rounded-md px-3 py-2" rows="2" placeholder="Additional notes..." value={formData.memo || ''} onChange={(e) => setFormData({...formData, memo: e.target.value})}></textarea>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex gap-3">
            <button onClick={closeModal} className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 font-medium">
              Save Bill
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Invoice Form
  if (activeModal === 'invoice') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Add Invoice</h2>
            <p className="text-gray-500 text-sm">Create a customer invoice</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Customer *</label>
                <select className="w-full border rounded-md px-3 py-2" value={formData.customer || ''} onChange={(e) => setFormData({...formData, customer: e.target.value})}>
                  <option value="">Select customer...</option>
                  <option value="cust1">ABC Investments LLC</option>
                  <option value="cust2">Smith Family Trust</option>
                  <option value="cust3">Denver RE Partners</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Invoice Number</label>
                <input type="text" className="w-full border rounded-md px-3 py-2" placeholder="Auto-generated" value={formData.number || ''} onChange={(e) => setFormData({...formData, number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Invoice Date *</label>
                <input type="date" className="w-full border rounded-md px-3 py-2" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date *</label>
                <input type="date" className="w-full border rounded-md px-3 py-2" value={formData.dueDate || ''} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Line Items</label>
                <button onClick={addLineItem} className="text-sm text-emerald-600 hover:text-emerald-700">+ Add Line</button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs">
                    <tr>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-left p-2 font-medium w-24">Qty</th>
                      <th className="text-left p-2 font-medium w-32">Rate</th>
                      <th className="text-left p-2 font-medium w-32">Amount</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">
                          <input type="text" className="w-full border rounded px-2 py-1 text-sm" placeholder="Item description" value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)} />
                        </td>
                        <td className="p-2">
                          <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)} />
                        </td>
                        <td className="p-2">
                          <input type="number" className="w-full border rounded px-2 py-1 text-sm" placeholder="0.00" value={item.rate} onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)} />
                        </td>
                        <td className="p-2">
                          <input type="text" className="w-full border rounded px-2 py-1 text-sm bg-gray-50" value={item.amount.toFixed(2)} readOnly />
                        </td>
                        <td className="p-2">
                          {lineItems.length > 1 && (
                            <button onClick={() => removeLineItem(item.id)} className="text-red-500 hover:text-red-700">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span>Tax:</span>
                  <input type="number" className="w-24 border rounded px-2 py-1 text-sm text-right" placeholder="0.00" value={formData.tax || ''} onChange={(e) => setFormData({...formData, tax: e.target.value})} />
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message on Invoice</label>
              <textarea className="w-full border rounded-md px-3 py-2" rows="2" placeholder="Thank you for your business!" value={formData.memo || ''} onChange={(e) => setFormData({...formData, memo: e.target.value})}></textarea>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex gap-3">
            <button onClick={closeModal} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
              Save Draft
            </button>
            <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 font-medium">
              Save & Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Form
  if (activeModal === 'payment') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Record Payment</h2>
            <p className="text-gray-500 text-sm">Record a payment made or received</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payment Type *</label>
              <select className="w-full border rounded-md px-3 py-2" value={formData.paymentType || 'billPayment'} onChange={(e) => setFormData({...formData, paymentType: e.target.value})}>
                <option value="billPayment">Bill Payment (Money Out)</option>
                <option value="invoicePayment">Invoice Payment (Money In)</option>
                <option value="general">General Payment</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payee/Payer *</label>
                <select className="w-full border rounded-md px-3 py-2" value={formData.vendor || ''} onChange={(e) => setFormData({...formData, vendor: e.target.value})}>
                  <option value="">Select...</option>
                  <option value="vendor1">Smith Framing LLC</option>
                  <option value="vendor2">ABC Plumbing</option>
                  <option value="cust1">ABC Investments LLC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Date *</label>
                <input type="date" className="w-full border rounded-md px-3 py-2" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method *</label>
                <select className="w-full border rounded-md px-3 py-2" value={formData.paymentMethod || ''} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}>
                  <option value="check">Check</option>
                  <option value="ach">ACH/Bank Transfer</option>
                  <option value="wire">Wire Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check/Reference Number</label>
                <input type="text" className="w-full border rounded-md px-3 py-2" placeholder="Check # or ref" value={formData.number || ''} onChange={(e) => setFormData({...formData, number: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input type="number" className="w-full border rounded-md px-3 py-2 text-lg font-semibold" placeholder="0.00" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bank Account *</label>
                <select className="w-full border rounded-md px-3 py-2" value={formData.account || ''} onChange={(e) => setFormData({...formData, account: e.target.value})}>
                  <option value="">Select account...</option>
                  <option value="1000">Operating Account</option>
                  <option value="1010">Construction Account</option>
                  <option value="1020">Reserve Account</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Memo</label>
              <textarea className="w-full border rounded-md px-3 py-2" rows="2" placeholder="Payment notes..." value={formData.memo || ''} onChange={(e) => setFormData({...formData, memo: e.target.value})}></textarea>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">💡 Tip: This will create a payment record. To apply it to specific bills or invoices, go to the Bills or Invoices page.</p>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex gap-3">
            <button onClick={closeModal} className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 font-medium">
              Record Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Journal Entry Form
  if (activeModal === 'journalEntry') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Journal Entry</h2>
            <p className="text-gray-500 text-sm">Create a manual accounting journal entry</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input type="date" className="w-full border rounded-md px-3 py-2" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Journal Entry #</label>
                <input type="text" className="w-full border rounded-md px-3 py-2" placeholder="Auto-generated" value={formData.number || ''} onChange={(e) => setFormData({...formData, number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reference</label>
                <input type="text" className="w-full border rounded-md px-3 py-2" placeholder="Optional" value={formData.reference || ''} onChange={(e) => setFormData({...formData, reference: e.target.value})} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description *</label>
              <input type="text" className="w-full border rounded-md px-3 py-2" placeholder="Brief description of this entry" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Journal Lines (Debits = Credits)</label>
                <button onClick={addJeLine} className="text-sm text-emerald-600 hover:text-emerald-700">+ Add Line</button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs">
                    <tr>
                      <th className="text-left p-2 font-medium">Account</th>
                      <th className="text-left p-2 font-medium w-32">Debit</th>
                      <th className="text-left p-2 font-medium w-32">Credit</th>
                      <th className="text-left p-2 font-medium">Memo</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {jeLines.map((line) => (
                      <tr key={line.id} className="border-t">
                        <td className="p-2">
                          <select className="w-full border rounded px-2 py-1 text-sm" value={line.account} onChange={(e) => updateJeLine(line.id, 'account', e.target.value)}>
                            <option value="">Select account...</option>
                            <option value="1000">1000 - Cash - Operating</option>
                            <option value="1100">1100 - Accounts Receivable</option>
                            <option value="2000">2000 - Accounts Payable</option>
                            <option value="3000">3000 - Member's Capital</option>
                            <option value="4000">4000 - Revenue</option>
                            <option value="5000">5000 - Cost of Goods Sold</option>
                            <option value="6000">6000 - Operating Expenses</option>
                            <option value="7000">7000 - Interest Expense</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="number" className="w-full border rounded px-2 py-1 text-sm text-right" placeholder="0.00" value={line.debit} onChange={(e) => updateJeLine(line.id, 'debit', e.target.value)} />
                        </td>
                        <td className="p-2">
                          <input type="number" className="w-full border rounded px-2 py-1 text-sm text-right" placeholder="0.00" value={line.credit} onChange={(e) => updateJeLine(line.id, 'credit', e.target.value)} />
                        </td>
                        <td className="p-2">
                          <input type="text" className="w-full border rounded px-2 py-1 text-sm" placeholder="Line memo" value={line.memo} onChange={(e) => updateJeLine(line.id, 'memo', e.target.value)} />
                        </td>
                        <td className="p-2">
                          {jeLines.length > 2 && (
                            <button onClick={() => removeJeLine(line.id)} className="text-red-500 hover:text-red-700">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-gray-50 font-bold">
                      <td className="p-2 text-right">Totals:</td>
                      <td className="p-2">
                        <div className="text-right px-2 py-1">${totalDebits.toFixed(2)}</div>
                      </td>
                      <td className="p-2">
                        <div className="text-right px-2 py-1">${totalCredits.toFixed(2)}</div>
                      </td>
                      <td className="p-2" colSpan="2">
                        {!isBalanced && totalDebits + totalCredits > 0 && (
                          <div className={cn("text-sm", difference > 0 ? "text-red-600" : "text-red-600")}>
                            Out of balance by ${Math.abs(difference).toFixed(2)}
                          </div>
                        )}
                        {isBalanced && (
                          <div className="text-sm text-green-600">✓ Balanced</div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">⚠️ Journal entries directly affect your general ledger. Debits must equal credits.</p>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex gap-3">
            <button onClick={closeModal} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!isBalanced} className={cn("flex-1 px-4 py-2 rounded-md font-medium", isBalanced ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-300 text-gray-500 cursor-not-allowed")}>
              {isBalanced ? 'Post Journal Entry' : 'Entry Must Balance'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const AccountingSidebar = ({ entity }) => {
  const { entityId } = useParams();
  const location = useLocation();

  // Mock pending tasks for this entity
  const pendingTasks = [
    { id: 1, title: 'Reconcile December bank statement', dueDate: '2024-12-31', priority: 'high' },
    { id: 2, title: 'Review Q4 journal entries', dueDate: '2025-01-05', priority: 'medium' },
    { id: 3, title: 'Process vendor invoices', dueDate: '2025-01-02', priority: 'medium' },
  ];

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: `/accounting/${entityId}`, icon: LayoutDashboard, exact: true },
        { label: 'Entity Details', path: `/accounting/${entityId}/details`, icon: Building2 },
        { label: 'Ownership Structure', path: `/accounting/${entityId}/ownership`, icon: GitBranch },
      ]
    },
    {
      title: 'Banking',
      items: [
        { label: 'Bank Feeds', path: `/accounting/${entityId}/bank-feeds`, icon: Link2 },
        { label: 'Bank Reconciliation', path: `/accounting/${entityId}/banking`, icon: CheckSquare },
        { label: 'Credit Cards', path: `/accounting/${entityId}/credit-cards`, icon: Wallet },
      ]
    },
    {
      title: 'Transactions',
      items: [
        { label: 'All Transactions', path: `/accounting/${entityId}/transactions`, icon: Receipt },
        { label: 'Journal Entries', path: `/accounting/${entityId}/journal-entries`, icon: FileText },
        { label: 'Reconciliation', path: `/accounting/${entityId}/reconciliation`, icon: CheckSquare },
      ]
    },
    {
      title: 'Receivables (AR)',
      items: [
        { label: 'Invoices', path: `/accounting/${entityId}/invoices`, icon: FileText },
        { label: 'AR Aging Report', path: `/accounting/${entityId}/ar-aging`, icon: Clock },
      ]
    },
    {
      title: 'Payables (AP)',
      items: [
        { label: 'Bills', path: `/accounting/${entityId}/bills`, icon: Receipt },
        { label: 'Batch Payments', path: `/accounting/${entityId}/batch-payments`, icon: Layers },
        { label: '1099 Vendors', path: `/accounting/${entityId}/vendors-1099`, icon: Users },
        { label: 'Expenses', path: `/accounting/${entityId}/expenses`, icon: Car },
      ]
    },
    {
      title: 'Payroll',
      items: [
        { label: 'Payroll', path: `/accounting/${entityId}/payroll`, icon: Briefcase },
      ]
    },
    {
      title: 'Intercompany',
      items: [
        { label: 'Intercompany Txns', path: `/accounting/${entityId}/intercompany`, icon: ArrowLeftRight },
        { label: 'Due To/From', path: `/accounting/${entityId}/due-to-from`, icon: PiggyBank },
      ]
    },
    {
      title: 'Reports',
      items: [
        { label: 'Financial Statements', path: `/accounting/${entityId}/reports`, icon: BarChart3 },
        { label: 'Trial Balance', path: `/accounting/${entityId}/trial-balance`, icon: FileText },
        { label: 'Cash Flow', path: `/accounting/${entityId}/cash-flow`, icon: DollarSign },
        { label: 'Job Costing', path: `/accounting/${entityId}/job-costing`, icon: BarChart3 },
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Entity Settings', path: `/accounting/${entityId}/settings`, icon: Settings },
        { label: 'Chart of Accounts', path: `/accounting/${entityId}/settings/chart-of-accounts`, icon: BookOpen },
        { label: 'Bank Accounts Setup', path: `/accounting/${entityId}/settings/bank-accounts`, icon: CreditCard },
      ]
    },
  ];

  const formatCurrency = (val) => {
    if (!val) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const getTypeConfig = (type) => ({
    holding: { bg: 'bg-purple-500', label: 'Holding' },
    project: { bg: 'bg-blue-500', label: 'Project SPV' },
    operating: { bg: 'bg-green-500', label: 'Operating' },
    investment: { bg: 'bg-amber-500', label: 'Investment' },
  }[type] || { bg: 'bg-gray-500', label: type });

  const typeConfig = getTypeConfig(entity?.type);

  const getPriorityColor = (priority) => ({
    high: 'text-red-500',
    medium: 'text-amber-500',
    low: 'text-blue-500',
  }[priority] || 'text-gray-500');

  return (
    <aside className="w-56 bg-[#1a1a1a] border-r border-gray-800 flex flex-col flex-shrink-0 h-full">
      {/* Entity Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", typeConfig.bg)}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">{entity?.name || 'Loading...'}</h2>
            <span className="text-xs text-gray-400">{typeConfig.label}</span>
          </div>
        </div>
        {entity && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">Cash</p>
              <p className="text-sm font-semibold text-white">{formatCurrency(entity.cashBalance)}</p>
            </div>
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-400">YTD P&L</p>
              <p className={cn("text-sm font-semibold", 
                (entity.ytdRevenue - entity.ytdExpenses) >= 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {formatCurrency(entity.ytdRevenue - entity.ytdExpenses)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Entity Tasks Section */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Entity Tasks</span>
          <button className="p-1 hover:bg-gray-700 rounded">
            <Plus className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {pendingTasks.slice(0, 3).map(task => (
            <div 
              key={task.id} 
              className="flex items-start gap-2 p-1.5 rounded hover:bg-gray-800 cursor-pointer group"
            >
              <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", 
                task.priority === 'high' ? 'bg-red-500' : 
                task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 truncate group-hover:text-white">{task.title}</p>
                <p className="text-[10px] text-gray-500">{task.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
        <NavLink 
          to={`/accounting/${entityId}/tasks`}
          className="block mt-2 text-xs text-emerald-500 hover:text-emerald-400 text-center"
        >
          View All Tasks →
        </NavLink>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="px-3 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </p>
            {section.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                    isActive 
                      ? "bg-emerald-600 text-white" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
      
      {/* Transaction Modals */}
      <TransactionModalsDark />
    </aside>
  );
};

export default AccountingSidebar;
