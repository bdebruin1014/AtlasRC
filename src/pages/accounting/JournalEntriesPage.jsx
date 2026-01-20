import React, { useState } from 'react';
import { Plus, Search, Download, Edit2, Trash2, Eye, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const JournalEntriesPage = ({ selectedEntity, flatEntities }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);

  const chartOfAccounts = [
    { id: 1000, name: '1000 - Cash - Operating', type: 'Asset' },
    { id: 1100, name: '1100 - Accounts Receivable', type: 'Asset' },
    { id: 1200, name: '1200 - Intercompany Receivable', type: 'Asset' },
    { id: 2000, name: '2000 - Accounts Payable', type: 'Liability' },
    { id: 2100, name: '2100 - Intercompany Payable', type: 'Liability' },
    { id: 3000, name: '3000 - Member\'s Capital', type: 'Equity' },
    { id: 3100, name: '3100 - Retained Earnings', type: 'Equity' },
    { id: 4000, name: '4000 - Rental Income', type: 'Revenue' },
    { id: 4100, name: '4100 - Home Sales Revenue', type: 'Revenue' },
    { id: 5000, name: '5000 - Cost of Goods Sold', type: 'Expense' },
    { id: 6000, name: '6000 - Operating Expenses', type: 'Expense' },
    { id: 6100, name: '6100 - Depreciation Expense', type: 'Expense' },
    { id: 7000, name: '7000 - Interest Expense', type: 'Expense' },
  ];

  const [entries, setEntries] = useState([
    { 
      id: 'JE-2024-0045', 
      date: '2024-12-31', 
      description: 'December Depreciation', 
      entity: 'sunset',
      lines: [
        { account: 6100, debit: 12500, credit: 0, memo: 'Building depreciation' },
        { account: 1510, debit: 0, credit: 12500, memo: 'Accumulated depreciation' },
      ],
      status: 'Posted',
      createdBy: 'John Smith'
    },
    { 
      id: 'JE-2024-0044', 
      date: '2024-12-31', 
      description: 'Accrued Interest - Construction Loan', 
      entity: 'watson',
      lines: [
        { account: 7000, debit: 42000, credit: 0, memo: 'December interest' },
        { account: 2100, debit: 0, credit: 42000, memo: 'Interest payable' },
      ],
      status: 'Posted',
      createdBy: 'John Smith'
    },
    { 
      id: 'JE-2024-0043', 
      date: '2024-12-28', 
      description: 'Reclassify Prepaid Insurance', 
      entity: 'vanrock',
      lines: [
        { account: 6000, debit: 8500, credit: 0, memo: 'Insurance expense' },
        { account: 1100, debit: 0, credit: 8500, memo: 'Prepaid insurance' },
      ],
      status: 'Posted',
      createdBy: 'Sarah Johnson'
    },
    { 
      id: 'JE-2024-0042', 
      date: '2024-12-27', 
      description: 'Year-End Bonus Accrual', 
      entity: 'manageco',
      lines: [
        { account: 6000, debit: 45000, credit: 0, memo: 'Bonus expense' },
        { account: 2000, debit: 0, credit: 45000, memo: 'Accrued bonus' },
      ],
      status: 'Draft',
      createdBy: 'John Smith'
    },
    { 
      id: 'JE-2024-0041', 
      date: '2024-12-26', 
      description: 'Intercompany Loan Interest', 
      entity: 'olive-brynn',
      lines: [
        { account: 1200, debit: 40000, credit: 0, memo: 'Interest receivable' },
        { account: 4000, debit: 0, credit: 40000, memo: 'Interest income' },
      ],
      status: 'Posted',
      createdBy: 'John Smith'
    },
  ]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    entity: selectedEntity,
    lines: [
      { account: '', debit: '', credit: '', memo: '' },
      { account: '', debit: '', credit: '', memo: '' },
    ],
    status: 'Draft',
  });

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { account: '', debit: '', credit: '', memo: '' }]
    }));
  };

  const removeLine = (index) => {
    if (formData.lines.length > 2) {
      setFormData(prev => ({
        ...prev,
        lines: prev.lines.filter((_, i) => i !== index)
      }));
    }
  };

  const updateLine = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => i === index ? { ...line, [field]: value } : line)
    }));
  };

  const totalDebits = formData.lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredits = formData.lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isBalanced = totalDebits === totalCredits && totalDebits > 0;

  const handleSave = () => {
    const newEntry = {
      id: `JE-2024-${String(entries.length + 46).padStart(4, '0')}`,
      ...formData,
      lines: formData.lines.map(l => ({
        account: parseInt(l.account),
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0,
        memo: l.memo
      })),
      createdBy: 'Current User'
    };
    setEntries(prev => [newEntry, ...prev]);
    setShowModal(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      entity: selectedEntity,
      lines: [
        { account: '', debit: '', credit: '', memo: '' },
        { account: '', debit: '', credit: '', memo: '' },
      ],
      status: 'Draft',
    });
  };

  const filteredEntries = selectedEntity === 'all' 
    ? entries 
    : entries.filter(e => e.entity === selectedEntity);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Journal Entries</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Journal Entry
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Entries</p>
          <p className="text-xl font-semibold">{filteredEntries.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Posted</p>
          <p className="text-xl font-semibold text-green-600">{filteredEntries.filter(e => e.status === 'Posted').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Draft</p>
          <p className="text-xl font-semibold text-amber-600">{filteredEntries.filter(e => e.status === 'Draft').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-xl font-semibold">{filteredEntries.filter(e => e.date.startsWith('2024-12')).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search journal entries..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="Posted">Posted</option>
            <option value="Draft">Draft</option>
          </select>
          <Input type="date" className="w-40" placeholder="From Date" />
          <Input type="date" className="w-40" placeholder="To Date" />
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Entry #</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-left px-4 py-3 font-medium">Entity</th>
              <th className="text-right px-4 py-3 font-medium">Debits</th>
              <th className="text-right px-4 py-3 font-medium">Credits</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredEntries.map((entry) => {
              const debitTotal = entry.lines.reduce((s, l) => s + l.debit, 0);
              const creditTotal = entry.lines.reduce((s, l) => s + l.credit, 0);
              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#047857]">{entry.id}</td>
                  <td className="px-4 py-3">{entry.date}</td>
                  <td className="px-4 py-3">{entry.description}</td>
                  <td className="px-4 py-3 text-xs">{flatEntities?.find(e => e.id === entry.entity)?.name}</td>
                  <td className="px-4 py-3 text-right">${debitTotal.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${creditTotal.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs", entry.status === 'Posted' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>{entry.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                      {entry.status === 'Draft' && <button className="p-1 hover:bg-gray-100 rounded"><Edit2 className="w-4 h-4 text-gray-500" /></button>}
                      {entry.status === 'Draft' && <button className="p-1 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Journal Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">New Journal Entry</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Entry Date *</label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Entity *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.entity} onChange={(e) => setFormData(prev => ({ ...prev, entity: e.target.value }))}>
                    {flatEntities?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Status</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
                    <option value="Draft">Draft</option>
                    <option value="Posted">Posted</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <Input value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Enter journal entry description" />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Line Items</label>
                  <Button variant="outline" size="sm" onClick={addLine}><Plus className="w-4 h-4 mr-1" />Add Line</Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Account</th>
                        <th className="text-right px-3 py-2 font-medium w-32">Debit</th>
                        <th className="text-right px-3 py-2 font-medium w-32">Credit</th>
                        <th className="text-left px-3 py-2 font-medium">Memo</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {formData.lines.map((line, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2">
                            <select 
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={line.account}
                              onChange={(e) => updateLine(index, 'account', e.target.value)}
                            >
                              <option value="">Select account...</option>
                              {chartOfAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <Input 
                              type="number" 
                              className="text-right" 
                              placeholder="0.00"
                              value={line.debit}
                              onChange={(e) => updateLine(index, 'debit', e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input 
                              type="number" 
                              className="text-right" 
                              placeholder="0.00"
                              value={line.credit}
                              onChange={(e) => updateLine(index, 'credit', e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input 
                              placeholder="Line memo..."
                              value={line.memo}
                              onChange={(e) => updateLine(index, 'memo', e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            {formData.lines.length > 2 && (
                              <button onClick={() => removeLine(index)} className="p-1 hover:bg-red-100 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t font-medium">
                      <tr>
                        <td className="px-3 py-2 text-right">Totals:</td>
                        <td className="px-3 py-2 text-right">${totalDebits.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">${totalCredits.toLocaleString()}</td>
                        <td colSpan={2} className="px-3 py-2">
                          {isBalanced ? (
                            <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" />Balanced</span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4" />Out of balance: ${Math.abs(totalDebits - totalCredits).toLocaleString()}</span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="outline">Save as Draft</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave} disabled={!isBalanced}>
                Post Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntriesPage;
