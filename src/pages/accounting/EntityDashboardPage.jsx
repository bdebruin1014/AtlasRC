import React from 'react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, CheckCircle,
  AlertCircle, ArrowUpRight, ArrowDownRight, Clock, FileText, Plus,
  CreditCard, ArrowRightLeft, Building2, Users, Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Demo financial data
const getDemoFinancials = (entityId) => {
  const data = {
    'ent-001': { cashBalance: 485000, ytdRevenue: 1250000, ytdExpenses: 890000, accountsReceivable: 125000, accountsPayable: 78000 },
    'ent-002': { cashBalance: 892000, ytdRevenue: 450000, ytdExpenses: 125000, accountsReceivable: 45000, accountsPayable: 12000 },
    'ent-003': { cashBalance: 125000, ytdRevenue: 0, ytdExpenses: 1850000, accountsReceivable: 0, accountsPayable: 245000 },
    'ent-004': { cashBalance: 340000, ytdRevenue: 3200000, ytdExpenses: 2100000, accountsReceivable: 180000, accountsPayable: 95000 },
    'ent-005': { cashBalance: 75000, ytdRevenue: 0, ytdExpenses: 450000, accountsReceivable: 0, accountsPayable: 125000 },
    'ent-006': { cashBalance: 95000, ytdRevenue: 385000, ytdExpenses: 290000, accountsReceivable: 32000, accountsPayable: 18000 },
    'ent-olive': { cashBalance: 892000, ytdRevenue: 450000, ytdExpenses: 125000, accountsReceivable: 45000, accountsPayable: 12000 },
    'ent-vanrock': { cashBalance: 485000, ytdRevenue: 1250000, ytdExpenses: 890000, accountsReceivable: 125000, accountsPayable: 78000 },
    'ent-highland': { cashBalance: 125000, ytdRevenue: 0, ytdExpenses: 1850000, accountsReceivable: 0, accountsPayable: 245000 },
    'ent-riverside': { cashBalance: 340000, ytdRevenue: 3200000, ytdExpenses: 2100000, accountsReceivable: 180000, accountsPayable: 95000 },
    'ent-cedar': { cashBalance: 75000, ytdRevenue: 0, ytdExpenses: 450000, accountsReceivable: 0, accountsPayable: 125000 },
    'ent-propman': { cashBalance: 95000, ytdRevenue: 385000, ytdExpenses: 290000, accountsReceivable: 32000, accountsPayable: 18000 },
  };
  return data[entityId] || { cashBalance: 0, ytdRevenue: 0, ytdExpenses: 0, accountsReceivable: 0, accountsPayable: 0 };
};

// Demo recent transactions
const demoTransactions = [
  { id: 1, description: 'Payment from ABC Investments', date: '2024-12-28', amount: 15000, type: 'credit' },
  { id: 2, description: 'Smith Framing LLC - Invoice #1042', date: '2024-12-27', amount: 8500, type: 'debit' },
  { id: 3, description: 'Utility Payment - Duke Energy', date: '2024-12-26', amount: 450, type: 'debit' },
  { id: 4, description: 'Management Fee - December', date: '2024-12-25', amount: 5000, type: 'credit' },
  { id: 5, description: 'Insurance Premium - Q1', date: '2024-12-24', amount: 3200, type: 'debit' },
];

// Demo pending items
const demoPendingItems = [
  { id: 1, description: 'Unpaid Invoice', vendor: 'ABC Investments LLC', amount: 12500, days: 15 },
  { id: 2, description: 'Bill Due', vendor: 'Sparks Electric', amount: 2800, days: 5 },
  { id: 3, description: 'Reconciliation Needed', account: 'Operating Account', days: 12 },
];

export default function EntityDashboardPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const entity = context?.entity;

  const basePath = `/accounting/entities/${entityId}`;
  const financials = getDemoFinancials(entityId);
  const ytdNetIncome = financials.ytdRevenue - financials.ytdExpenses;

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Financial overview for {entity?.name || entity?.short_name || 'Entity'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`${basePath}/reports`)}>
            <Scale className="h-4 w-4 mr-2" />
            Financial Reports
          </Button>
        </div>
      </div>

      {/* Quick Actions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Button variant="outline" onClick={() => navigate(`${basePath}/bills/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            New Bill
          </Button>
          <Button variant="outline" onClick={() => navigate(`${basePath}/invoices/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
          <Button variant="outline" onClick={() => navigate(`${basePath}/journal-entries/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            Journal Entry
          </Button>
          <Button variant="outline" onClick={() => navigate(`${basePath}/expenses`)}>
            <Receipt className="h-4 w-4 mr-2" />
            Record Expense
          </Button>
          <Button variant="outline" onClick={() => navigate(`${basePath}/batch-payments`)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
          <Button variant="outline" onClick={() => navigate(`${basePath}/intercompany`)}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Transfer Funds
          </Button>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cash Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(financials.cashBalance)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">YTD Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(financials.ytdRevenue)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.2%</span>
              <span className="text-muted-foreground ml-1">vs last year</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">YTD Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(financials.ytdExpenses)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600">+5.1%</span>
              <span className="text-muted-foreground ml-1">vs budget</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">YTD Net Income</p>
                <p className={cn("text-2xl font-bold", ytdNetIncome >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {formatCurrency(ytdNetIncome)}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {financials.ytdRevenue ? ((ytdNetIncome / financials.ytdRevenue) * 100).toFixed(1) : '0.0'}% margin
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link to={`${basePath}/transactions`} className="text-sm text-emerald-600 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {demoTransactions.map(txn => (
                <div key={txn.id} className="py-3 flex items-center justify-between">
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
                      <p className="text-xs text-muted-foreground">{txn.date}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-medium",
                    txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoPendingItems.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.account || item.vendor}
                      {item.amount && ` • ${formatCurrency(item.amount)}`}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">{item.days} days overdue</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm">
              View All Pending Items
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Receipt className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{formatCurrency(financials.accountsReceivable)}</p>
              <p className="text-xs text-muted-foreground">Accounts Receivable</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{formatCurrency(financials.accountsPayable)}</p>
              <p className="text-xs text-muted-foreground">Accounts Payable</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-lg font-bold">Dec 15</p>
              <p className="text-xs text-muted-foreground">Last Reconciled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">12</p>
              <p className="text-xs text-muted-foreground">Open Transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
