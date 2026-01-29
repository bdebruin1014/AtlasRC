import React, { useState } from 'react';
import { Plus, Search, Download, Upload, Filter, Eye, Edit2, Trash2, X, CheckCircle, Ban, RotateCcw, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TransactionsPage = ({ selectedEntity, entities, flatEntities }) => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [showReverseDialog, setShowReverseDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [voidReason, setVoidReason] = useState('');

  const [transactions, setTransactions] = useState([
    { id: 'TXN-2024-0892', date: '2024-12-28', type: 'deposit', description: 'Rental Income - December', account: 'Operating Account', amount: 145000, entity: 'sunset', category: 'Revenue', status: 'posted', project: null },
    { id: 'TXN-2024-0891', date: '2024-12-27', type: 'payment', description: 'Smith Construction - Draw #5', account: 'Construction Account', amount: -850000, entity: 'watson', category: 'Construction', status: 'posted', project: 'Watson House' },
    { id: 'TXN-2024-0890', date: '2024-12-26', type: 'payment', description: 'Property Tax Payment - Q4', account: 'Operating Account', amount: -45000, entity: 'sunset', category: 'Operating Expenses', status: 'posted', project: null },
    { id: 'TXN-2024-0889', date: '2024-12-25', type: 'deposit', description: 'Management Fee Income - Dec', account: 'Operating Account', amount: 35000, entity: 'manageco', category: 'Revenue', status: 'posted', project: null },
    { id: 'TXN-2024-0888', date: '2024-12-24', type: 'deposit', description: 'Lot Sale - Lot 15', account: 'Construction Account', amount: 285000, entity: 'watson', category: 'Revenue', status: 'posted', project: 'Watson House' },
    { id: 'TXN-2024-0887', date: '2024-12-23', type: 'payment', description: 'Ferguson Supply - Plumbing Materials', account: 'Construction Account', amount: -48500, entity: 'watson', category: 'Construction', status: 'pending', project: 'Watson House' },
    { id: 'TXN-2024-0886', date: '2024-12-22', type: 'transfer', description: 'Transfer to Payroll Account', account: 'Operating Account', amount: -75000, entity: 'vanrock', category: 'Transfer', status: 'posted', project: null },
    { id: 'TXN-2024-0885', date: '2024-12-22', type: 'deposit', description: 'Construction Loan Draw', account: 'Construction Account', amount: 500000, entity: 'oslo', category: 'Financing', status: 'posted', project: 'Oslo Townhomes' },
    { id: 'TXN-2024-0884', date: '2024-12-20', type: 'payment', description: 'Insurance Premium - Annual', account: 'Operating Account', amount: -28500, entity: 'sunset', category: 'Operating Expenses', status: 'posted', project: null },
    { id: 'TXN-2024-0883', date: '2024-12-19', type: 'payment', description: 'Legal Fees - Contract Review', account: 'Operating Account', amount: -15000, entity: 'vanrock', category: 'Professional Services', status: 'posted', project: null },
  ]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'payment',
    description: '',
    account: 'Operating Account',
    amount: '',
    entity: selectedEntity || '',
    category: 'Operating Expenses',
    project: '',
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit': return 'bg-green-100 text-green-700';
      case 'payment': return 'bg-red-100 text-red-700';
      case 'transfer': return 'bg-blue-100 text-blue-700';
      case 'journal': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchTerm && !tx.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalDeposits = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalPayments = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const handleSave = () => {
    const newTx = {
      id: `TXN-2024-${String(893 + transactions.length).padStart(4, '0')}`,
      ...formData,
      amount: formData.type === 'payment' ? -Math.abs(parseFloat(formData.amount) || 0) : Math.abs(parseFloat(formData.amount) || 0),
      status: 'pending',
    };
    setTransactions(prev => [newTx, ...prev]);
    setShowModal(false);
    setFormData({ date: new Date().toISOString().split('T')[0], type: 'payment', description: '', account: 'Operating Account', amount: '', entity: selectedEntity || '', category: 'Operating Expenses', project: '' });
  };

  const handleVoid = () => {
    if (!selectedTransaction) return;

    if (!voidReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason Required',
        description: 'Please provide a reason for voiding this transaction.',
      });
      return;
    }

    setTransactions(prev => prev.map(tx =>
      tx.id === selectedTransaction.id
        ? {
            ...tx,
            status: 'voided',
            voidedAt: new Date().toISOString(),
            voidReason: voidReason,
            originalAmount: tx.amount,
            amount: 0,
          }
        : tx
    ));

    toast({
      title: 'Transaction Voided',
      description: `${selectedTransaction.id} has been voided and will not affect account balances.`,
    });

    setShowVoidDialog(false);
    setSelectedTransaction(null);
    setVoidReason('');
  };

  const handleReverse = () => {
    if (!selectedTransaction) return;

    // Create a reversing entry
    const reversalTx = {
      id: `TXN-2024-${String(893 + transactions.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      type: selectedTransaction.type,
      description: `REVERSAL: ${selectedTransaction.description}`,
      account: selectedTransaction.account,
      amount: -selectedTransaction.amount, // Opposite sign
      entity: selectedTransaction.entity,
      category: selectedTransaction.category,
      status: 'posted',
      project: selectedTransaction.project,
      isReversal: true,
      reversesId: selectedTransaction.id,
    };

    // Mark original as reversed
    setTransactions(prev => [
      reversalTx,
      ...prev.map(tx =>
        tx.id === selectedTransaction.id
          ? { ...tx, status: 'reversed', reversedById: reversalTx.id }
          : tx
      ),
    ]);

    toast({
      title: 'Transaction Reversed',
      description: `Created reversal entry ${reversalTx.id} to offset ${selectedTransaction.id}.`,
    });

    setShowReverseDialog(false);
    setSelectedTransaction(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'voided': return 'bg-red-100 text-red-700';
      case 'reversed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1" />Import</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-xl font-semibold">{transactions.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Total Deposits</p>
          <p className="text-xl font-semibold text-green-600">${(totalDeposits / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Total Payments</p>
          <p className="text-xl font-semibold text-red-600">${(totalPayments / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">Net Change</p>
          <p className={cn("text-xl font-semibold", totalDeposits - totalPayments >= 0 ? "text-green-600" : "text-red-600")}>
            ${((totalDeposits - totalPayments) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search transactions..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="payment">Payments</option>
            <option value="transfer">Transfers</option>
            <option value="journal">Journal</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Accounts</option>
            <option>Operating Account</option>
            <option>Construction Account</option>
            <option>Payroll Account</option>
          </select>
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />More Filters</Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">ID</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-left px-4 py-3 font-medium">Account</th>
              <th className="text-left px-4 py-3 font-medium">Entity</th>
              <th className="text-right px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-[#047857]">{tx.id}</td>
                <td className="px-4 py-3">{tx.date}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getTypeColor(tx.type))}>{tx.type}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p>{tx.description}</p>
                    {tx.project && <p className="text-xs text-gray-500">{tx.project}</p>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{tx.account}</td>
                <td className="px-4 py-3 text-xs">{flatEntities?.find(e => e.id === tx.entity)?.name || tx.entity}</td>
                <td className={cn("px-4 py-3 text-right font-medium", tx.amount > 0 ? "text-green-600" : "text-red-600")}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(tx.status))}>
                      {tx.status}
                    </span>
                    {tx.isReversal && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-purple-50 text-purple-600">REV</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded" title="View"><Eye className="w-4 h-4 text-gray-500" /></button>
                    {tx.status === 'pending' && (
                      <button className="p-1 hover:bg-gray-100 rounded" title="Edit"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                    )}
                    {(tx.status === 'posted' || tx.status === 'pending') && !tx.isReversal && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal className="w-4 h-4 text-gray-500" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => { setSelectedTransaction(tx); setShowVoidDialog(true); }}
                            className="text-red-600"
                          >
                            <Ban className="w-4 h-4 mr-2" />Void Transaction
                          </DropdownMenuItem>
                          {tx.status === 'posted' && (
                            <DropdownMenuItem
                              onClick={() => { setSelectedTransaction(tx); setShowReverseDialog(true); }}
                              className="text-purple-600"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />Reverse Entry
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Add Transaction</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Date *</label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Type *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}>
                    <option value="deposit">Deposit</option>
                    <option value="payment">Payment</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <Input value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Transaction description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Account *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.account} onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}>
                    <option>Operating Account</option>
                    <option>Construction Account</option>
                    <option>Payroll Account</option>
                    <option>Reserve Account</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Amount *</label>
                  <Input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Entity *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.entity} onChange={(e) => setFormData(prev => ({ ...prev, entity: e.target.value }))}>
                    {flatEntities?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                    <option>Revenue</option>
                    <option>Operating Expenses</option>
                    <option>Construction</option>
                    <option>Professional Services</option>
                    <option>Financing</option>
                    <option>Transfer</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>Save Transaction</Button>
            </div>
          </div>
        </div>
      )}

      {/* Void Transaction Dialog */}
      <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Void Transaction
            </DialogTitle>
            <DialogDescription>
              This will mark the transaction as void. The transaction will remain in the ledger but with a $0 amount.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction:</span>
                  <span className="font-medium">{selectedTransaction.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Description:</span>
                  <span>{selectedTransaction.description}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className={cn("font-medium", selectedTransaction.amount > 0 ? "text-green-600" : "text-red-600")}>
                    ${Math.abs(selectedTransaction.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Reason for voiding *</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Enter reason for voiding this transaction..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  This action cannot be undone. The transaction will be permanently marked as void.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowVoidDialog(false); setVoidReason(''); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleVoid}>
              <Ban className="w-4 h-4 mr-1" />Void Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reverse Transaction Dialog */}
      <Dialog open={showReverseDialog} onOpenChange={setShowReverseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-500" />
              Reverse Transaction
            </DialogTitle>
            <DialogDescription>
              This will create a new entry with opposite debits and credits to offset the original transaction.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Original Transaction</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction:</span>
                  <span className="font-medium">{selectedTransaction.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date:</span>
                  <span>{selectedTransaction.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Description:</span>
                  <span>{selectedTransaction.description}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className={cn("font-medium", selectedTransaction.amount > 0 ? "text-green-600" : "text-red-600")}>
                    {selectedTransaction.amount > 0 ? '+' : '-'}${Math.abs(selectedTransaction.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-purple-700 mb-2">Reversing Entry (to be created)</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date:</span>
                  <span>{new Date().toISOString().split('T')[0]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Description:</span>
                  <span>REVERSAL: {selectedTransaction.description}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className={cn("font-medium", -selectedTransaction.amount > 0 ? "text-green-600" : "text-red-600")}>
                    {-selectedTransaction.amount > 0 ? '+' : '-'}${Math.abs(selectedTransaction.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  The net effect of the original and reversing entries will be zero, effectively canceling the transaction.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReverseDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleReverse}>
              <RotateCcw className="w-4 h-4 mr-1" />Create Reversal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsPage;
