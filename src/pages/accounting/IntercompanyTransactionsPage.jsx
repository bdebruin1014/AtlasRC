import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight, Building2, DollarSign, Calendar, Filter, Search,
  CheckCircle, Clock, AlertTriangle, Plus, FileText, RefreshCw,
  ChevronDown, ChevronRight, Eye, Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockEntities = [
  { id: 'E-001', name: 'Atlas Holdings LLC', type: 'Parent' },
  { id: 'E-002', name: 'Riverside Plaza LLC', type: 'Property' },
  { id: 'E-003', name: 'Downtown Tower LLC', type: 'Property' },
  { id: 'E-004', name: 'Oak Street Partners LP', type: 'Property' },
  { id: 'E-005', name: 'Atlas Management Co.', type: 'OpCo' }
];

const mockIntercompanyTxns = [
  {
    id: 'IC-2024-0089',
    date: '2024-01-20',
    fromEntity: 'E-001',
    fromEntityName: 'Atlas Holdings LLC',
    toEntity: 'E-002',
    toEntityName: 'Riverside Plaza LLC',
    type: 'Loan Advance',
    description: 'Construction loan draw #5',
    amount: 500000.00,
    status: 'posted',
    fromAccount: '1350 - IC Receivable - Riverside',
    toAccount: '2350 - IC Payable - Holdings',
    reference: 'DRAW-RSP-005',
    matched: true
  },
  {
    id: 'IC-2024-0088',
    date: '2024-01-18',
    fromEntity: 'E-005',
    fromEntityName: 'Atlas Management Co.',
    toEntity: 'E-002',
    toEntityName: 'Riverside Plaza LLC',
    type: 'Management Fee',
    description: 'January 2024 property management fee',
    amount: 15000.00,
    status: 'posted',
    fromAccount: '4100 - Management Fee Income',
    toAccount: '6100 - Management Fee Expense',
    reference: 'MGT-JAN-RSP',
    matched: true
  },
  {
    id: 'IC-2024-0087',
    date: '2024-01-18',
    fromEntity: 'E-005',
    fromEntityName: 'Atlas Management Co.',
    toEntity: 'E-003',
    toEntityName: 'Downtown Tower LLC',
    type: 'Management Fee',
    description: 'January 2024 property management fee',
    amount: 22500.00,
    status: 'posted',
    fromAccount: '4100 - Management Fee Income',
    toAccount: '6100 - Management Fee Expense',
    reference: 'MGT-JAN-DWT',
    matched: true
  },
  {
    id: 'IC-2024-0086',
    date: '2024-01-15',
    fromEntity: 'E-003',
    fromEntityName: 'Downtown Tower LLC',
    toEntity: 'E-001',
    toEntityName: 'Atlas Holdings LLC',
    type: 'Distribution',
    description: 'Q4 2023 cash distribution',
    amount: 250000.00,
    status: 'posted',
    fromAccount: '3900 - Distributions',
    toAccount: '1200 - Cash',
    reference: 'DIST-Q4-DWT',
    matched: true
  },
  {
    id: 'IC-2024-0085',
    date: '2024-01-12',
    fromEntity: 'E-001',
    fromEntityName: 'Atlas Holdings LLC',
    toEntity: 'E-004',
    toEntityName: 'Oak Street Partners LP',
    type: 'Capital Contribution',
    description: 'Acquisition equity contribution',
    amount: 2500000.00,
    status: 'pending',
    fromAccount: '1600 - Investment in Oak Street',
    toAccount: '3100 - Partner Capital',
    reference: 'CAP-OAK-001',
    matched: false
  },
  {
    id: 'IC-2024-0084',
    date: '2024-01-10',
    fromEntity: 'E-002',
    fromEntityName: 'Riverside Plaza LLC',
    toEntity: 'E-001',
    toEntityName: 'Atlas Holdings LLC',
    type: 'Interest Payment',
    description: 'December 2023 intercompany loan interest',
    amount: 18750.00,
    status: 'posted',
    fromAccount: '7100 - Interest Expense',
    toAccount: '4200 - Interest Income',
    reference: 'INT-DEC-RSP',
    matched: true
  }
];

const mockICBalances = [
  { fromEntity: 'Atlas Holdings LLC', toEntity: 'Riverside Plaza LLC', receivable: 2850000, payable: 0 },
  { fromEntity: 'Atlas Holdings LLC', toEntity: 'Downtown Tower LLC', receivable: 0, payable: 450000 },
  { fromEntity: 'Atlas Holdings LLC', toEntity: 'Oak Street Partners LP', receivable: 2500000, payable: 0 },
  { fromEntity: 'Atlas Management Co.', toEntity: 'Riverside Plaza LLC', receivable: 45000, payable: 0 },
  { fromEntity: 'Atlas Management Co.', toEntity: 'Downtown Tower LLC', receivable: 67500, payable: 0 }
];

const typeConfig = {
  'Loan Advance': { color: 'bg-blue-100 text-blue-800' },
  'Management Fee': { color: 'bg-purple-100 text-purple-800' },
  'Distribution': { color: 'bg-green-100 text-green-800' },
  'Capital Contribution': { color: 'bg-orange-100 text-orange-800' },
  'Interest Payment': { color: 'bg-yellow-100 text-yellow-800' },
  'Reimbursement': { color: 'bg-gray-100 text-gray-800' }
};

const statusConfig = {
  posted: { label: 'Posted', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  unmatched: { label: 'Unmatched', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
};

export default function IntercompanyTransactionsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(mockIntercompanyTxns[0]);
  const [view, setView] = useState('transactions');

  const filteredTxns = useMemo(() => {
    return mockIntercompanyTxns.filter(txn => {
      const matchesFilter = filter === 'all' || txn.status === filter;
      const matchesSearch = txn.fromEntityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.toEntityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => ({
    totalTxns: mockIntercompanyTxns.length,
    totalVolume: mockIntercompanyTxns.reduce((sum, t) => sum + t.amount, 0),
    pending: mockIntercompanyTxns.filter(t => t.status === 'pending').length,
    unmatched: mockIntercompanyTxns.filter(t => !t.matched).length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Intercompany Transactions</h1>
          <p className="text-gray-600">Track and manage transactions between entities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Run Matching</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />New IC Transaction</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><ArrowLeftRight className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTxns}</p>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalVolume / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Total Volume</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.unmatched}</p>
              <p className="text-sm text-gray-600">Unmatched</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button variant={view === 'transactions' ? 'default' : 'outline'} size="sm" onClick={() => setView('transactions')}>Transactions</Button>
          <Button variant={view === 'balances' ? 'default' : 'outline'} size="sm" onClick={() => setView('balances')}>IC Balances</Button>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        {view === 'transactions' && (
          <div className="flex gap-2">
            {['all', 'posted', 'pending'].map((f) => (
              <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : statusConfig[f]?.label || f}
              </Button>
            ))}
          </div>
        )}
      </div>

      {view === 'transactions' ? (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
            {filteredTxns.map((txn) => (
              <div
                key={txn.id}
                onClick={() => setSelectedTxn(txn)}
                className={cn(
                  "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                  selectedTxn?.id === txn.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-gray-900">{txn.id}</span>
                  <span className={cn("px-2 py-0.5 rounded text-xs", typeConfig[txn.type]?.color || 'bg-gray-100')}>{txn.type}</span>
                </div>
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <span className="text-gray-600">{txn.fromEntityName.split(' ')[0]}</span>
                  <ArrowLeftRight className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">{txn.toEntityName.split(' ')[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">${txn.amount.toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    {txn.matched ? <Link2 className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[txn.status].color)}>{statusConfig[txn.status].label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-span-2">
            {selectedTxn && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-bold text-gray-900">{selectedTxn.id}</h2>
                        <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedTxn.status].color)}>{statusConfig[selectedTxn.status].label}</span>
                        {selectedTxn.matched && <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center gap-1"><Link2 className="w-3 h-3" />Matched</span>}
                      </div>
                      <p className="text-gray-600">{selectedTxn.description}</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${selectedTxn.amount.toLocaleString()}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="text-sm text-gray-500">From Entity</p>
                        <p className="font-semibold text-gray-900">{selectedTxn.fromEntityName}</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedTxn.fromAccount}</p>
                      </div>
                      <div className="px-4">
                        <ArrowLeftRight className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-sm text-gray-500">To Entity</p>
                        <p className="font-semibold text-gray-900">{selectedTxn.toEntityName}</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedTxn.toAccount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-gray-500">Date</p><p className="font-medium">{selectedTxn.date}</p></div>
                    <div><p className="text-gray-500">Type</p><p className="font-medium">{selectedTxn.type}</p></div>
                    <div><p className="text-gray-500">Reference</p><p className="font-medium">{selectedTxn.reference}</p></div>
                    <div><p className="text-gray-500">Status</p><p className="font-medium capitalize">{selectedTxn.status}</p></div>
                  </div>
                </div>

                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Journal Entries</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900">{selectedTxn.fromEntityName}</p>
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between"><span>Dr. {selectedTxn.fromAccount}</span><span>${selectedTxn.amount.toLocaleString()}</span></div>
                        <div className="flex justify-between text-gray-600"><span className="pl-4">Cr. Cash / Payable</span><span>${selectedTxn.amount.toLocaleString()}</span></div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-900">{selectedTxn.toEntityName}</p>
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between"><span>Dr. Cash / Receivable</span><span>${selectedTxn.amount.toLocaleString()}</span></div>
                        <div className="flex justify-between text-gray-600"><span className="pl-4">Cr. {selectedTxn.toAccount}</span><span>${selectedTxn.amount.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedTxn.status === 'pending' && (
                  <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-2" />Post Transaction</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Intercompany Balance Summary</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="p-4">From Entity</th>
                <th className="p-4">To Entity</th>
                <th className="p-4 text-right">IC Receivable</th>
                <th className="p-4 text-right">IC Payable</th>
                <th className="p-4 text-right">Net Position</th>
              </tr>
            </thead>
            <tbody>
              {mockICBalances.map((bal, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium">{bal.fromEntity}</td>
                  <td className="p-4">{bal.toEntity}</td>
                  <td className="p-4 text-right text-green-600">${bal.receivable.toLocaleString()}</td>
                  <td className="p-4 text-right text-red-600">${bal.payable.toLocaleString()}</td>
                  <td className={cn("p-4 text-right font-semibold", bal.receivable - bal.payable >= 0 ? "text-green-600" : "text-red-600")}>
                    ${(bal.receivable - bal.payable).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
