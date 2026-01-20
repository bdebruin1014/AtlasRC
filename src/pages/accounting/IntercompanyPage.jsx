import React, { useState } from 'react';
import { Plus, Search, Download, Edit2, Eye, X, Link2, AlertTriangle, CheckCircle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const IntercompanyPage = ({ selectedEntity, flatEntities }) => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [transactions, setTransactions] = useState([
    { id: 'IC-2024-0045', date: '2024-12-28', fromEntity: 'manageco', toEntity: 'watson', type: 'Management Fee', description: 'Management Fee - December 2024', amount: 35000, status: 'posted', invoiceRef: 'INV-2024-0162' },
    { id: 'IC-2024-0044', date: '2024-12-28', fromEntity: 'manageco', toEntity: 'oslo', type: 'Management Fee', description: 'Management Fee - December 2024', amount: 25000, status: 'posted', invoiceRef: 'INV-2024-0161' },
    { id: 'IC-2024-0043', date: '2024-12-15', fromEntity: 'manageco', toEntity: 'sunset', type: 'Management Fee', description: 'Property Management - December 2024', amount: 18500, status: 'posted', invoiceRef: 'INV-2024-0160' },
    { id: 'IC-2024-0042', date: '2024-12-01', fromEntity: 'olive-brynn', toEntity: 'watson', type: 'Loan Interest', description: 'Mezzanine Loan Interest - Q4 2024', amount: 40000, status: 'posted', invoiceRef: 'INV-2024-0157' },
    { id: 'IC-2024-0041', date: '2024-11-30', fromEntity: 'vanrock', toEntity: 'watson', type: 'Capital Contribution', description: 'Development Capital - Tranche 5', amount: 500000, status: 'posted', invoiceRef: null },
    { id: 'IC-2024-0040', date: '2024-11-15', fromEntity: 'vanrock', toEntity: 'oslo', type: 'Capital Contribution', description: 'Development Capital - Initial', amount: 350000, status: 'posted', invoiceRef: null },
    { id: 'IC-2024-0039', date: '2024-11-01', fromEntity: 'watson', toEntity: 'vanrock', type: 'Distribution', description: 'Q3 Profit Distribution', amount: 125000, status: 'posted', invoiceRef: null },
    { id: 'IC-2024-0038', date: '2024-10-15', fromEntity: 'sunset', toEntity: 'vanrock', type: 'Distribution', description: 'Q3 Cash Distribution', amount: 85000, status: 'posted', invoiceRef: null },
  ]);

  const intercompanyBalances = [
    { entity1: 'manageco', entity2: 'watson', receivable: 35000, payable: 0, net: 35000 },
    { entity1: 'manageco', entity2: 'oslo', receivable: 25000, payable: 0, net: 25000 },
    { entity1: 'manageco', entity2: 'sunset', receivable: 18500, payable: 0, net: 18500 },
    { entity1: 'olive-brynn', entity2: 'watson', receivable: 540000, payable: 0, net: 540000 },
    { entity1: 'vanrock', entity2: 'watson', receivable: 0, payable: 125000, net: -125000 },
    { entity1: 'vanrock', entity2: 'oslo', receivable: 350000, payable: 0, net: 350000 },
    { entity1: 'vanrock', entity2: 'sunset', receivable: 0, payable: 85000, net: -85000 },
  ];

  const eliminationEntries = [
    { id: 1, description: 'Eliminate Management Fee Revenue/Expense', debit: { account: 'Management Fee Income', entity: 'manageco', amount: 78500 }, credit: { account: 'Management Fees Expense', entity: 'Various', amount: 78500 } },
    { id: 2, description: 'Eliminate Intercompany Loan Interest', debit: { account: 'Interest Income', entity: 'olive-brynn', amount: 40000 }, credit: { account: 'Interest Expense', entity: 'watson', amount: 40000 } },
    { id: 3, description: 'Eliminate Intercompany Receivables/Payables', debit: { account: 'Intercompany Payable', entity: 'Various', amount: 540000 }, credit: { account: 'Intercompany Receivable', entity: 'Various', amount: 540000 } },
  ];

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fromEntity: '',
    toEntity: '',
    type: 'Management Fee',
    description: '',
    amount: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalIntercompany = transactions.reduce((sum, t) => sum + t.amount, 0);
  const managementFees = transactions.filter(t => t.type === 'Management Fee').reduce((sum, t) => sum + t.amount, 0);
  const loanInterest = transactions.filter(t => t.type === 'Loan Interest').reduce((sum, t) => sum + t.amount, 0);
  const capitalMovements = transactions.filter(t => t.type === 'Capital Contribution' || t.type === 'Distribution').reduce((sum, t) => sum + t.amount, 0);

  const handleSave = () => {
    const newTx = {
      id: `IC-2024-${String(46 + transactions.length).padStart(4, '0')}`,
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      status: 'pending',
      invoiceRef: null,
    };
    setTransactions(prev => [newTx, ...prev]);
    setShowModal(false);
    setFormData({ date: new Date().toISOString().split('T')[0], fromEntity: '', toEntity: '', type: 'Management Fee', description: '', amount: '' });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Intercompany Transactions</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Reconcile</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Intercompany (YTD)</p>
          <p className="text-xl font-semibold">${(totalIntercompany / 1000000).toFixed(2)}M</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">Management Fees</p>
          <p className="text-xl font-semibold text-blue-600">${(managementFees / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-purple-500">
          <p className="text-sm text-gray-500">Loan Interest</p>
          <p className="text-xl font-semibold text-purple-600">${(loanInterest / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500">Capital Movements</p>
          <p className="text-xl font-semibold text-amber-600">${(capitalMovements / 1000000).toFixed(2)}M</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        {['transactions', 'balances', 'eliminations'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize", activeTab === tab ? "border-[#047857] text-[#047857]" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <>
          <div className="bg-white border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search transactions..." className="pl-9" />
              </div>
              <select className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Types</option>
                <option>Management Fee</option>
                <option>Loan Interest</option>
                <option>Capital Contribution</option>
                <option>Distribution</option>
              </select>
              <select className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Entities</option>
                {flatEntities?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Transaction #</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">From</th>
                  <th className="text-center px-4 py-3 font-medium"></th>
                  <th className="text-left px-4 py-3 font-medium">To</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-[#047857]">{tx.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{tx.date}</td>
                    <td className="px-4 py-3 text-xs">{flatEntities?.find(e => e.id === tx.fromEntity)?.name}</td>
                    <td className="px-4 py-3 text-center"><ArrowRight className="w-4 h-4 text-gray-400 mx-auto" /></td>
                    <td className="px-4 py-3 text-xs">{flatEntities?.find(e => e.id === tx.toEntity)?.name}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs",
                        tx.type === 'Management Fee' ? "bg-blue-100 text-blue-700" :
                        tx.type === 'Loan Interest' ? "bg-purple-100 text-purple-700" :
                        tx.type === 'Capital Contribution' ? "bg-green-100 text-green-700" :
                        "bg-amber-100 text-amber-700"
                      )}>{tx.type}</span>
                    </td>
                    <td className="px-4 py-3">{tx.description}</td>
                    <td className="px-4 py-3 text-right font-medium">${tx.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(tx.status))}>{tx.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded" title="View"><Eye className="w-4 h-4 text-gray-500" /></button>
                        {tx.invoiceRef && <button className="p-1 hover:bg-gray-100 rounded" title="View Invoice"><FileText className="w-4 h-4 text-blue-500" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Balances Tab */}
      {activeTab === 'balances' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold">Intercompany Balances</h3>
            <p className="text-sm text-gray-500">Current receivable/payable balances between entities</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Entity 1</th>
                <th className="text-left px-4 py-3 font-medium">Entity 2</th>
                <th className="text-right px-4 py-3 font-medium">Receivable</th>
                <th className="text-right px-4 py-3 font-medium">Payable</th>
                <th className="text-right px-4 py-3 font-medium">Net Balance</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {intercompanyBalances.map((bal, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{flatEntities?.find(e => e.id === bal.entity1)?.name}</td>
                  <td className="px-4 py-3">{flatEntities?.find(e => e.id === bal.entity2)?.name}</td>
                  <td className="px-4 py-3 text-right text-green-600">${bal.receivable.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-600">${bal.payable.toLocaleString()}</td>
                  <td className={cn("px-4 py-3 text-right font-medium", bal.net >= 0 ? "text-green-600" : "text-red-600")}>
                    {bal.net >= 0 ? '' : '-'}${Math.abs(bal.net).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {bal.net === 0 ? (
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" />Balanced</span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="w-4 h-4" />Outstanding</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan={2} className="px-4 py-3 font-semibold">Total</td>
                <td className="px-4 py-3 text-right font-semibold text-green-600">${intercompanyBalances.reduce((s, b) => s + b.receivable, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-semibold text-red-600">${intercompanyBalances.reduce((s, b) => s + b.payable, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-semibold">${intercompanyBalances.reduce((s, b) => s + b.net, 0).toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Eliminations Tab */}
      {activeTab === 'eliminations' && (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">Consolidation Elimination Entries</p>
                <p className="text-sm text-amber-700">These entries are automatically generated to eliminate intercompany transactions during consolidation. They appear on the consolidation worksheet but do not affect individual entity financials.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Elimination Journal Entries</h3>
                  <p className="text-sm text-gray-500">Total Eliminations: ${eliminationEntries.reduce((s, e) => s + e.debit.amount, 0).toLocaleString()}</p>
                </div>
                <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Regenerate</Button>
              </div>
            </div>
            <div className="divide-y">
              {eliminationEntries.map((entry) => (
                <div key={entry.id} className="p-4">
                  <p className="font-medium mb-3">{entry.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs text-red-600 font-medium mb-1">DEBIT</p>
                      <p className="text-sm">{entry.debit.account}</p>
                      <p className="text-xs text-gray-500">{entry.debit.entity}</p>
                      <p className="text-lg font-semibold text-red-700">${entry.debit.amount.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 font-medium mb-1">CREDIT</p>
                      <p className="text-sm">{entry.credit.account}</p>
                      <p className="text-xs text-gray-500">{entry.credit.entity}</p>
                      <p className="text-lg font-semibold text-green-700">${entry.credit.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">New Intercompany Transaction</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">From Entity *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.fromEntity} onChange={(e) => setFormData(prev => ({ ...prev, fromEntity: e.target.value }))}>
                    <option value="">Select entity...</option>
                    {flatEntities?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">To Entity *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.toEntity} onChange={(e) => setFormData(prev => ({ ...prev, toEntity: e.target.value }))}>
                    <option value="">Select entity...</option>
                    {flatEntities?.filter(e => e.id !== formData.fromEntity).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Date *</label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Transaction Type *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}>
                    <option>Management Fee</option>
                    <option>Loan Interest</option>
                    <option>Capital Contribution</option>
                    <option>Distribution</option>
                    <option>Reimbursement</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Amount *</label>
                <Input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <Input value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Transaction description" />
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-medium mb-1">Automatic Entries</p>
                <p className="text-xs">This will create matching receivable/payable entries in both entities and be flagged for consolidation elimination.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>Create Transaction</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntercompanyPage;
