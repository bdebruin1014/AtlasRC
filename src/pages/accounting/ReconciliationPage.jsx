import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, X, ChevronDown, ChevronRight, Search, Download, RefreshCw, Landmark, Calendar, DollarSign, Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ReconciliationPage = ({ selectedEntity, flatEntities }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [statementBalance, setStatementBalance] = useState('');
  const [statementDate, setStatementDate] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const bankAccounts = [
    { id: 'acct-1', name: 'Operating Account', bank: 'Chase Bank', number: '****4521', entity: 'vanrock', balance: 2450000, lastReconciled: '2024-11-30', status: 'needs-reconciliation', unreconciledCount: 24 },
    { id: 'acct-2', name: 'Payroll Account', bank: 'Chase Bank', number: '****7832', entity: 'vanrock', balance: 125000, lastReconciled: '2024-12-15', status: 'current', unreconciledCount: 3 },
    { id: 'acct-3', name: 'Construction Account', bank: 'First National', number: '****7891', entity: 'watson', balance: 1850000, lastReconciled: '2024-12-20', status: 'current', unreconciledCount: 8 },
    { id: 'acct-4', name: 'Reserve Account', bank: 'Wells Fargo', number: '****3344', entity: 'sunset', balance: 425000, lastReconciled: '2024-11-30', status: 'needs-reconciliation', unreconciledCount: 12 },
    { id: 'acct-5', name: 'Operating Account', bank: 'Bank of America', number: '****9012', entity: 'oslo', balance: 920000, lastReconciled: '2024-12-10', status: 'current', unreconciledCount: 5 },
    { id: 'acct-6', name: 'Fund Operating', bank: 'JP Morgan', number: '****5678', entity: 'fund1', balance: 1200000, lastReconciled: '2024-12-01', status: 'needs-reconciliation', unreconciledCount: 18 },
  ];

  const unreconciledItems = [
    { id: 1, date: '2024-12-28', type: 'deposit', ref: 'DEP-1234', description: 'Rental Income - December', amount: 145000, cleared: false },
    { id: 2, date: '2024-12-27', type: 'check', ref: 'CHK-5567', description: 'Smith Construction - Draw #5', amount: -85000, cleared: true },
    { id: 3, date: '2024-12-26', type: 'ach', ref: 'ACH-8901', description: 'Property Tax Payment', amount: -45000, cleared: true },
    { id: 4, date: '2024-12-24', type: 'deposit', ref: 'DEP-1235', description: 'Lot Sale - Lot 15', amount: 285000, cleared: false },
    { id: 5, date: '2024-12-23', type: 'check', ref: 'CHK-5568', description: 'Ferguson Supply - Materials', amount: -48500, cleared: true },
    { id: 6, date: '2024-12-22', type: 'wire', ref: 'WIRE-001', description: 'Construction Loan Draw', amount: 500000, cleared: false },
    { id: 7, date: '2024-12-20', type: 'ach', ref: 'ACH-8902', description: 'Insurance Premium', amount: -28500, cleared: true },
    { id: 8, date: '2024-12-19', type: 'check', ref: 'CHK-5569', description: 'Legal Fees', amount: -15000, cleared: false },
    { id: 9, date: '2024-12-18', type: 'deposit', ref: 'DEP-1236', description: 'Management Fee Income', amount: 35000, cleared: true },
    { id: 10, date: '2024-12-15', type: 'ach', ref: 'ACH-8903', description: 'Utility Payment', amount: -4200, cleared: true },
  ];

  const toggleItemSelection = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    const clearedIds = unreconciledItems.filter(i => i.cleared).map(i => i.id);
    setSelectedItems(clearedIds);
  };

  const clearAll = () => setSelectedItems([]);

  const selectedDeposits = unreconciledItems.filter(i => selectedItems.includes(i.id) && i.amount > 0).reduce((s, i) => s + i.amount, 0);
  const selectedWithdrawals = unreconciledItems.filter(i => selectedItems.includes(i.id) && i.amount < 0).reduce((s, i) => s + Math.abs(i.amount), 0);
  const beginningBalance = selectedAccount ? selectedAccount.balance - unreconciledItems.reduce((s, i) => s + i.amount, 0) : 0;
  const clearedBalance = beginningBalance + selectedDeposits - selectedWithdrawals;
  const difference = parseFloat(statementBalance || 0) - clearedBalance;

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit': return 'bg-green-100 text-green-700';
      case 'check': return 'bg-blue-100 text-blue-700';
      case 'ach': return 'bg-purple-100 text-purple-700';
      case 'wire': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Account List */}
      <div className="w-72 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-3">Bank Accounts</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search accounts..." className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={cn(
                "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                selectedAccount?.id === account.id && "bg-green-50 border-l-4 border-l-[#047857]"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-medium text-sm">{account.name}</p>
                  <p className="text-xs text-gray-500">{account.bank} {account.number}</p>
                </div>
                {account.status === 'needs-reconciliation' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-xs text-gray-500">{flatEntities?.find(e => e.id === account.entity)?.name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-semibold">${(account.balance / 1000).toFixed(0)}K</span>
                <span className={cn("text-xs px-2 py-0.5 rounded", account.unreconciledCount > 10 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600")}>
                  {account.unreconciledCount} uncleared
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Reconciliation Workspace */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedAccount ? (
          <>
            {/* Header */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{selectedAccount.name}</h2>
                  <p className="text-sm text-gray-500">{selectedAccount.bank} • {selectedAccount.number} • Last Reconciled: {selectedAccount.lastReconciled}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Import Statement</Button>
                  <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowReconcileModal(true)}>
                    <RefreshCw className="w-4 h-4 mr-1" />Reconcile
                  </Button>
                </div>
              </div>

              {/* Reconciliation Summary */}
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Beginning Balance</p>
                  <p className="text-lg font-semibold">${(beginningBalance / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Cleared Deposits</p>
                  <p className="text-lg font-semibold text-green-700">+${(selectedDeposits / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Cleared Withdrawals</p>
                  <p className="text-lg font-semibold text-red-700">-${(selectedWithdrawals / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Cleared Balance</p>
                  <p className="text-lg font-semibold text-blue-700">${(clearedBalance / 1000).toFixed(0)}K</p>
                </div>
                <div className={cn("rounded-lg p-3 text-center", difference === 0 ? "bg-green-50" : "bg-amber-50")}>
                  <p className="text-xs text-gray-500">Difference</p>
                  <p className={cn("text-lg font-semibold", difference === 0 ? "text-green-700" : "text-amber-700")}>
                    ${Math.abs(difference).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Statement Info Bar */}
            <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Statement Date:</span>
                <Input type="date" className="w-40 h-8" value={statementDate} onChange={(e) => setStatementDate(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Statement Ending Balance:</span>
                <Input type="number" className="w-40 h-8" placeholder="0.00" value={statementBalance} onChange={(e) => setStatementBalance(e.target.value)} />
              </div>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={selectAll}>Select Cleared</Button>
              <Button variant="outline" size="sm" onClick={clearAll}>Clear All</Button>
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 px-4 py-3"></th>
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-left px-4 py-3 font-medium">Reference</th>
                      <th className="text-left px-4 py-3 font-medium">Description</th>
                      <th className="text-right px-4 py-3 font-medium">Amount</th>
                      <th className="text-center px-4 py-3 font-medium">Cleared</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {unreconciledItems.map((item) => (
                      <tr key={item.id} className={cn("hover:bg-gray-50", selectedItems.includes(item.id) && "bg-green-50")}>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleItemSelection(item.id)}
                            className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                              selectedItems.includes(item.id) ? "bg-[#047857] border-[#047857]" : "border-gray-300 hover:border-gray-400"
                            )}
                          >
                            {selectedItems.includes(item.id) && <Check className="w-3 h-3 text-white" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">{item.date}</td>
                        <td className="px-4 py-3">
                          <span className={cn("px-2 py-1 rounded text-xs uppercase", getTypeColor(item.type))}>{item.type}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{item.ref}</td>
                        <td className="px-4 py-3">{item.description}</td>
                        <td className={cn("px-4 py-3 text-right font-medium", item.amount > 0 ? "text-green-600" : "text-gray-900")}>
                          {item.amount > 0 ? '+' : ''}{item.amount < 0 ? '-' : ''}${Math.abs(item.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.cleared ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <Minus className="w-4 h-4 text-gray-300 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-white border-t p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedItems.length} of {unreconciledItems.length} items selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Save Progress</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]" disabled={difference !== 0}>
                  <CheckCircle className="w-4 h-4 mr-1" />Finish Reconciliation
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an account to begin reconciliation</p>
            </div>
          </div>
        )}
      </div>

      {/* Reconcile Modal */}
      {showReconcileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Start Reconciliation</h3>
              <button onClick={() => setShowReconcileModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Account</p>
                <p className="font-medium">{selectedAccount?.name}</p>
                <p className="text-sm text-gray-600">{selectedAccount?.bank} {selectedAccount?.number}</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Statement Date *</label>
                <Input type="date" value={statementDate} onChange={(e) => setStatementDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Statement Ending Balance *</label>
                <Input type="number" placeholder="0.00" value={statementBalance} onChange={(e) => setStatementBalance(e.target.value)} />
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-medium mb-1">Tips for Reconciliation</p>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li>Enter the ending balance from your bank statement</li>
                  <li>Check off items that appear on your statement</li>
                  <li>The difference should be $0 when complete</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowReconcileModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowReconcileModal(false)}>Begin Reconciliation</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconciliationPage;
