import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Plus, FileText,
  Download, RefreshCw, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency } from '@/lib/utils';
import { transactionServiceTs, type Transaction } from '@/services/transactionService.ts';
import { entityService } from '@/services/entityService';

interface DashboardSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  operatingCash: number;
  revenueChange: number;
  expensesChange: number;
  profitChange: number;
  cashChange: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}

interface Entity {
  id: string;
  name: string;
}

// Default values for fallback
const defaultSummary: DashboardSummary = {
  totalRevenue: 1245000,
  totalExpenses: 892000,
  netProfit: 353000,
  operatingCash: 485000,
  revenueChange: 12.5,
  expensesChange: -8.2,
  profitChange: 18.3,
  cashChange: 5.1,
};

const defaultMonthlyData: MonthlyData[] = [
  { month: 'Jan', income: 95000, expenses: 72000 },
  { month: 'Feb', income: 88000, expenses: 65000 },
  { month: 'Mar', income: 112000, expenses: 78000 },
  { month: 'Apr', income: 105000, expenses: 82000 },
  { month: 'May', income: 125000, expenses: 88000 },
  { month: 'Jun', income: 135000, expenses: 95000 },
  { month: 'Jul', income: 142000, expenses: 102000 },
  { month: 'Aug', income: 128000, expenses: 89000 },
  { month: 'Sep', income: 118000, expenses: 76000 },
  { month: 'Oct', income: 132000, expenses: 84000 },
  { month: 'Nov', income: 115000, expenses: 78000 },
  { month: 'Dec', income: 150000, expenses: 83000 },
];

const defaultExpensesByCategory: ExpenseCategory[] = [
  { category: 'Construction', amount: 425000, percentage: 47.6 },
  { category: 'Land Acquisition', amount: 185000, percentage: 20.7 },
  { category: 'Professional Fees', amount: 95000, percentage: 10.6 },
  { category: 'Marketing', amount: 65000, percentage: 7.3 },
  { category: 'Debt Service', amount: 55000, percentage: 6.2 },
  { category: 'Other', amount: 67000, percentage: 7.5 },
];

const PERIODS = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'custom', label: 'Custom' },
];

const AccountingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('this-month');
  const [entityId, setEntityId] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>([{ id: 'all', name: 'All Entities' }]);
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>(defaultMonthlyData);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseCategory[]>(defaultExpensesByCategory);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [entityId, period, customStartDate, customEndDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load entities
      const entitiesData = await entityService.getAll();
      setEntities([{ id: 'all', name: 'All Entities' }, ...entitiesData.map((e: { id: string; name: string }) => ({ id: e.id, name: e.name }))]);

      // Build date filters based on period
      let startDate: string | undefined;
      let endDate: string | undefined;
      const now = new Date();

      if (period === 'this-month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      } else if (period === 'last-month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      } else if (period === 'quarter') {
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        startDate = quarterStart.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      } else if (period === 'ytd') {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      } else if (period === 'custom' && customStartDate && customEndDate) {
        startDate = customStartDate;
        endDate = customEndDate;
      }

      // Load transactions with filters
      const txnData = await transactionServiceTs.getAll({
        entity_id: entityId !== 'all' ? entityId : undefined,
        start_date: startDate,
        end_date: endDate,
      });
      setTransactions(txnData);

      // Calculate summary from transactions
      const totalRevenue = txnData.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = txnData.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      setSummary({
        ...defaultSummary,
        totalRevenue: totalRevenue || defaultSummary.totalRevenue,
        totalExpenses: totalExpenses || defaultSummary.totalExpenses,
        netProfit: (totalRevenue - totalExpenses) || defaultSummary.netProfit,
      });

      // Calculate expenses by category
      const categoryMap: Record<string, number> = {};
      txnData.filter(t => t.transaction_type === 'expense').forEach(t => {
        const cat = t.category || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      });

      const totalCatExpenses = Object.values(categoryMap).reduce((sum, val) => sum + val, 0) || 1;
      const categoryList = Object.entries(categoryMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: Math.round((amount / totalCatExpenses) * 1000) / 10
        }));

      if (categoryList.length > 0) {
        setExpensesByCategory(categoryList);
      }

    } catch (error) {
      console.warn('Using default dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxIncome = Math.max(...monthlyData.map(d => d.income));
  const maxExpense = Math.max(...monthlyData.map(d => d.expenses));
  const maxValue = Math.max(maxIncome, maxExpense);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounting Dashboard</h1>
          <p className="text-gray-500">Financial overview and reporting</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={entityId} onValueChange={setEntityId}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entities.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {period === 'custom' && (
            <>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-36 bg-white"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-36 bg-white"
              />
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => navigate('/accounting/transactions/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
        <Button variant="outline" onClick={() => navigate('/accounting/reconcile')}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reconcile Accounts
        </Button>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className={cn(
                'flex items-center text-sm font-medium',
                summary.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {summary.revenueChange >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {Math.abs(summary.revenueChange)}%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalRevenue, { compact: true })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className={cn(
                'flex items-center text-sm font-medium',
                summary.expensesChange <= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {summary.expensesChange <= 0 ? (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                )}
                {Math.abs(summary.expensesChange)}%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalExpenses, { compact: true })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                summary.netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100'
              )}>
                <TrendingUp className={cn(
                  'w-6 h-6',
                  summary.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                )} />
              </div>
              <div className={cn(
                'flex items-center text-sm font-medium',
                summary.profitChange >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {summary.profitChange >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {Math.abs(summary.profitChange)}%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Net Profit</p>
              <p className={cn(
                'text-2xl font-bold',
                summary.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
              )}>
                {formatCurrency(summary.netProfit, { compact: true })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Operating Cash */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div className={cn(
                'flex items-center text-sm font-medium',
                summary.cashChange >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {summary.cashChange >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {Math.abs(summary.cashChange)}%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Operating Cash</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.operatingCash, { compact: true })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue vs Expenses Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Revenue vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden">
              <div className="flex items-end justify-between h-48 gap-1">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-0.5 items-end justify-center h-40">
                      {/* Income bar */}
                      <div
                        className="w-2/5 bg-green-500 rounded-t"
                        style={{ height: `${Math.min((data.income / maxValue) * 140, 140)}px` }}
                        title={`Income: ${formatCurrency(data.income)}`}
                      />
                      {/* Expense bar */}
                      <div
                        className="w-2/5 bg-red-400 rounded-t"
                        style={{ height: `${Math.min((data.expenses / maxValue) * 140, 140)}px` }}
                        title={`Expenses: ${formatCurrency(data.expenses)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 text-center">
                    <span className="text-xs text-gray-500">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-sm text-gray-600">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded" />
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expensesByCategory.map((item, index) => {
                const colors = [
                  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500',
                  'bg-amber-500', 'bg-pink-500', 'bg-gray-500'
                ];
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(item.amount)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', colors[index % colors.length])}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Expenses</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(summary.totalExpenses)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Waterfall */}
      <Card className="bg-white mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Cash Flow Waterfall
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-48 gap-4 px-4">
            {/* Starting Cash */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: '120px' }}
              />
              <span className="text-xs text-gray-500 mt-2 text-center">Starting Cash</span>
              <span className="text-sm font-medium">$380K</span>
            </div>
            {/* Income */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-green-500 rounded-t"
                style={{ height: '150px' }}
              />
              <span className="text-xs text-gray-500 mt-2 text-center">+ Income</span>
              <span className="text-sm font-medium text-green-600">+$1.25M</span>
            </div>
            {/* Expenses */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-red-400 rounded-t"
                style={{ height: '110px' }}
              />
              <span className="text-xs text-gray-500 mt-2 text-center">- Expenses</span>
              <span className="text-sm font-medium text-red-600">-$892K</span>
            </div>
            {/* Investments */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-purple-500 rounded-t"
                style={{ height: '80px' }}
              />
              <span className="text-xs text-gray-500 mt-2 text-center">- Investments</span>
              <span className="text-sm font-medium text-purple-600">-$253K</span>
            </div>
            {/* Ending Cash */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-emerald-600 rounded-t"
                style={{ height: '140px' }}
              />
              <span className="text-xs text-gray-500 mt-2 text-center">Ending Cash</span>
              <span className="text-sm font-medium">$485K</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="bg-white cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/accounting/transactions')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View All Transactions</h3>
              <p className="text-sm text-gray-500">Browse and filter transactions</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-white cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/accounting/chart-of-accounts')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Chart of Accounts</h3>
              <p className="text-sm text-gray-500">Manage account structure</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-white cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/entities')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Entity Ledgers</h3>
              <p className="text-sm text-gray-500">View by entity</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingDashboard;
