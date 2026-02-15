import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, CheckCircle,
  AlertCircle, ArrowUpRight, ArrowDownRight, Clock, FileText, Plus,
  CreditCard, ArrowRightLeft, Building2, Users, Scale, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useJournalEntries, useBills, useAccounts } from '@/hooks/useAccounting';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

export default function EntityDashboardPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const entity = context?.entity;

  const basePath = `/accounting/entities/${entityId}`;

  // Fetch real data from Supabase via hooks
  const { entries: journalEntries, isLoading: jeLoading } = useJournalEntries(entityId);
  const { bills, isLoading: billsLoading, summary: billSummary } = useBills(entityId);
  const { accounts, accountsByType, isLoading: accountsLoading } = useAccounts(entityId);

  const isLoading = jeLoading || billsLoading || accountsLoading;

  // Compute financial metrics from real account data
  const financials = useMemo(() => {
    if (!accounts || accounts.length === 0) {
      return { cashBalance: 0, ytdRevenue: 0, ytdExpenses: 0, accountsReceivable: 0, accountsPayable: 0 };
    }

    const sumByType = (types) =>
      accounts
        .filter(a => types.includes(a.account_type) || types.includes(a.category))
        .reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

    // Cash = bank + cash accounts (asset sub-type)
    const cashAccounts = accounts.filter(a =>
      a.account_type === 'asset' && (a.sub_category === 'cash' || a.sub_category === 'bank' ||
        a.account_name?.toLowerCase().includes('cash') || a.account_name?.toLowerCase().includes('checking') ||
        a.account_name?.toLowerCase().includes('savings'))
    );
    const cashBalance = cashAccounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

    // AR = accounts receivable
    const arAccounts = accounts.filter(a =>
      a.account_type === 'asset' && (a.sub_category === 'accounts_receivable' ||
        a.account_name?.toLowerCase().includes('receivable'))
    );
    const accountsReceivable = arAccounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

    // AP from bills summary (more accurate)
    const accountsPayable = billSummary?.totalPayable || 0;

    // Revenue and expenses from journal entries (posted only)
    const postedEntries = (journalEntries || []).filter(e => e.status === 'posted');
    const ytdRevenue = accounts
      .filter(a => a.account_type === 'revenue')
      .reduce((sum, a) => sum + Math.abs(parseFloat(a.balance) || 0), 0);
    const ytdExpenses = accounts
      .filter(a => a.account_type === 'expense' || a.account_type === 'cogs')
      .reduce((sum, a) => sum + Math.abs(parseFloat(a.balance) || 0), 0);

    return { cashBalance, ytdRevenue, ytdExpenses, accountsReceivable, accountsPayable };
  }, [accounts, journalEntries, billSummary]);

  const ytdNetIncome = financials.ytdRevenue - financials.ytdExpenses;

  // Recent transactions from journal entries (last 5)
  const recentTransactions = useMemo(() => {
    const sorted = [...(journalEntries || [])]
      .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
      .slice(0, 5);
    return sorted.map(je => ({
      id: je.id,
      description: je.description || je.entry_number || 'Journal Entry',
      date: je.date || je.created_at?.split('T')[0],
      amount: parseFloat(je.total_debit) || 0,
      type: je.description?.toLowerCase().includes('payment') || je.description?.toLowerCase().includes('revenue') ? 'credit' : 'debit',
      status: je.status,
    }));
  }, [journalEntries]);

  // Pending items from overdue/due bills
  const pendingItems = useMemo(() => {
    const today = new Date();
    const overdueBills = (bills || [])
      .filter(b => b.status !== 'paid' && b.status !== 'void' && b.due_date)
      .map(b => {
        const due = new Date(b.due_date);
        const days = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
        return { ...b, daysOverdue: days };
      })
      .filter(b => b.daysOverdue > 0)
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 5);

    return overdueBills.map(b => ({
      id: b.id,
      description: b.daysOverdue > 30 ? 'Overdue Bill' : 'Bill Due',
      vendor: b.vendor_name || b.vendor || 'Unknown',
      amount: parseFloat(b.balance) || parseFloat(b.amount) || 0,
      days: b.daysOverdue,
    }));
  }, [bills]);

  // Count open (non-posted) journal entries
  const openTransactionCount = (journalEntries || []).filter(e => e.status === 'draft' || e.status === 'pending_approval').length;

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
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(financials.cashBalance)}</p>
                )}
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">YTD Revenue</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(financials.ytdRevenue)}</p>
                )}
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">YTD Expenses</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(financials.ytdExpenses)}</p>
                )}
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">YTD Net Income</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-1" />
                ) : (
                  <p className={cn("text-2xl font-bold", ytdNetIncome >= 0 ? 'text-green-600' : 'text-red-600')}>
                    {formatCurrency(ytdNetIncome)}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            {!isLoading && (
              <div className="mt-2 text-sm text-muted-foreground">
                {financials.ytdRevenue ? ((ytdNetIncome / financials.ytdRevenue) * 100).toFixed(1) : '0.0'}% margin
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link to={`${basePath}/journal-entries`} className="text-sm text-emerald-600 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {jeLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No journal entries yet.</p>
                <Button variant="link" size="sm" onClick={() => navigate(`${basePath}/journal-entries/new`)}>
                  Create your first entry
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {recentTransactions.map(txn => (
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
                    <div className="text-right">
                      <span className={cn(
                        "font-medium",
                        txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {txn.type === 'credit' ? '+' : ''}{formatCurrency(txn.amount)}
                      </span>
                      {txn.status && txn.status !== 'posted' && (
                        <p className="text-xs text-amber-600">{txn.status}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            {billsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
                <p className="text-sm">All caught up! No overdue items.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.vendor}
                        {item.amount ? ` \u2022 ${formatCurrency(item.amount)}` : ''}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">{item.days} days overdue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              className="w-full mt-4"
              size="sm"
              onClick={() => navigate(`${basePath}/bills`)}
            >
              View All Bills
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
              <p className="text-lg font-bold">{(bills || []).filter(b => b.status === 'paid').length}</p>
              <p className="text-xs text-muted-foreground">Bills Paid</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{openTransactionCount}</p>
              <p className="text-xs text-muted-foreground">Open Transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
