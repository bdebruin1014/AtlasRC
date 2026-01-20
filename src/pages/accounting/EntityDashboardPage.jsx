import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, CheckCircle,
  AlertCircle, ArrowUpRight, ArrowDownRight, Clock, Building2, FileText, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TransactionEntryContext } from '@/contexts/TransactionEntryContext';

const EntityDashboardPage = () => {
  const { entityId } = useParams();
  const { openModal } = React.useContext(TransactionEntryContext);

  // Mock entity data
  const entity = {
    id: entityId,
    name: 'Highland Park Development LLC',
    type: 'project',
    ein: '**-***9012',
    state: 'SC',
    fiscalYearEnd: 'December',
    cashBalance: 485000,
    ytdRevenue: 3200000,
    ytdExpenses: 2485000,
    ytdNetIncome: 715000,
    accountsReceivable: 45000,
    accountsPayable: 185000,
  };

  const recentTransactions = [
    { id: 1, date: '2024-12-28', description: 'Wire Transfer - Construction Draw #12', amount: -125000, type: 'debit' },
    { id: 2, date: '2024-12-27', description: 'Lot Sale - Lot 14', amount: 185000, type: 'credit' },
    { id: 3, date: '2024-12-26', description: 'Invoice Payment - ABC Builders', amount: -45000, type: 'debit' },
    { id: 4, date: '2024-12-24', description: 'Interest Income', amount: 850, type: 'credit' },
    { id: 5, date: '2024-12-22', description: 'Insurance Premium', amount: -8500, type: 'debit' },
  ];

  const pendingItems = [
    { id: 1, type: 'reconciliation', description: 'Bank reconciliation needed', account: 'Operating Account', days: 5 },
    { id: 2, type: 'bill', description: 'Unpaid bill', vendor: 'XYZ Plumbing', amount: 12500, days: 3 },
    { id: 3, type: 'invoice', description: 'Outstanding invoice', customer: 'Builder Corp', amount: 35000, days: 15 },
  ];

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{entity.name}</h1>
        <p className="text-sm text-gray-500">Financial Overview • EIN: {entity.ein} • {entity.state}</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex gap-2">
        <Button 
          onClick={() => openModal('bill', entityId)}
          className="bg-red-600 hover:bg-red-500 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Bill
        </Button>
        <Button 
          onClick={() => openModal('invoice', entityId)}
          className="bg-green-600 hover:bg-green-500 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Invoice
        </Button>
        <Button 
          onClick={() => openModal('payment', entityId)}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Payment
        </Button>
        <Button 
          onClick={() => openModal('journalEntry', entityId)}
          className="bg-purple-600 hover:bg-purple-500 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Journal
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cash Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(entity.cashBalance)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+$45K</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">YTD Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(entity.ytdRevenue)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+18%</span>
            <span className="text-gray-500 ml-1">vs last year</span>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">YTD Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(entity.ytdExpenses)}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-red-600">+12%</span>
            <span className="text-gray-500 ml-1">vs budget</span>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">YTD Net Income</p>
              <p className={cn("text-2xl font-bold", entity.ytdNetIncome >= 0 ? 'text-green-600' : 'text-red-600')}>
                {formatCurrency(entity.ytdNetIncome)}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {((entity.ytdNetIncome / entity.ytdRevenue) * 100).toFixed(1)}% margin
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="col-span-2 bg-white border rounded-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Link to={`/accounting/${entityId}/transactions`} className="text-sm text-[#047857] hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y">
            {recentTransactions.map(txn => (
              <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  )}>
                    {txn.type === 'credit' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{txn.description}</p>
                    <p className="text-xs text-gray-500">{txn.date}</p>
                  </div>
                </div>
                <span className={cn(
                  "font-medium",
                  txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                )}>
                  {txn.type === 'credit' ? '+' : ''}{formatCurrency(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Items */}
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Needs Attention</h3>
          </div>
          <div className="divide-y">
            {pendingItems.map(item => (
              <div key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.account || item.vendor || item.customer}
                      {item.amount && ` • ${formatCurrency(item.amount)}`}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">{item.days} days overdue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full" size="sm">View All Pending Items</Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-lg font-bold">{formatCurrency(entity.accountsReceivable)}</p>
              <p className="text-xs text-gray-500">Accounts Receivable</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-lg font-bold">{formatCurrency(entity.accountsPayable)}</p>
              <p className="text-xs text-gray-500">Accounts Payable</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-lg font-bold">Dec 15</p>
              <p className="text-xs text-gray-500">Last Reconciled</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-lg font-bold">12</p>
              <p className="text-xs text-gray-500">Open Transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityDashboardPage;
