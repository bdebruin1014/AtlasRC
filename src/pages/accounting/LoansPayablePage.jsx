// src/pages/accounting/LoansPayablePage.jsx
// Loans Payable Management

import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Landmark, DollarSign, Calendar, Percent, Plus, Search,
  MoreHorizontal, Eye, Edit, Trash2, Loader2, AlertCircle,
  Clock, CheckCircle2, Building2, TrendingDown, CreditCard,
  FileText, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import LoanFormModal from '@/components/accounting/LoanFormModal';

// Demo loans for development
const demoLoans = [
  {
    id: 'loan-1',
    loan_name: 'Construction Loan - Main Street',
    loan_type: 'construction',
    lender_name: 'First National Bank',
    loan_number: 'CL-2024-001',
    original_amount: 2500000.00,
    current_balance: 1875000.00,
    origination_date: '2024-03-15',
    maturity_date: '2026-03-15',
    interest_rate: 7.25,
    interest_type: 'prime_plus',
    payment_frequency: 'monthly',
    monthly_payment: 28500.00,
    next_payment_date: '2025-02-01',
    status: 'active',
  },
  {
    id: 'loan-2',
    loan_name: 'Equipment Financing',
    loan_type: 'equipment',
    lender_name: 'CAT Financial',
    loan_number: 'EQ-78542',
    original_amount: 450000.00,
    current_balance: 312500.00,
    origination_date: '2023-08-01',
    maturity_date: '2028-08-01',
    interest_rate: 5.99,
    interest_type: 'fixed',
    payment_frequency: 'monthly',
    monthly_payment: 8750.00,
    next_payment_date: '2025-02-01',
    status: 'active',
  },
  {
    id: 'loan-3',
    loan_name: 'Operating Line of Credit',
    loan_type: 'line_of_credit',
    lender_name: 'Wells Fargo',
    loan_number: 'LOC-445566',
    original_amount: 500000.00,
    current_balance: 125000.00,
    origination_date: '2024-01-01',
    maturity_date: '2025-12-31',
    interest_rate: 8.50,
    interest_type: 'variable',
    payment_frequency: 'monthly',
    monthly_payment: 0,
    next_payment_date: '2025-02-01',
    status: 'active',
  },
  {
    id: 'loan-4',
    loan_name: 'SBA 7(a) Loan',
    loan_type: 'sba',
    lender_name: 'US Bank',
    loan_number: 'SBA-2022-8899',
    original_amount: 750000.00,
    current_balance: 625000.00,
    origination_date: '2022-06-15',
    maturity_date: '2032-06-15',
    interest_rate: 6.75,
    interest_type: 'fixed',
    payment_frequency: 'monthly',
    monthly_payment: 8650.00,
    next_payment_date: '2025-02-15',
    status: 'active',
  },
  {
    id: 'loan-5',
    loan_name: 'Bridge Loan - Acquisition',
    loan_type: 'bridge',
    lender_name: 'Private Lender LLC',
    loan_number: 'BL-2024-005',
    original_amount: 1000000.00,
    current_balance: 0,
    origination_date: '2024-01-15',
    maturity_date: '2024-07-15',
    interest_rate: 12.00,
    interest_type: 'fixed',
    payment_frequency: 'interest_only',
    monthly_payment: 10000.00,
    next_payment_date: null,
    status: 'paid_off',
  },
];

const loanTypeLabels = {
  term: 'Term Loan',
  line_of_credit: 'Line of Credit',
  construction: 'Construction Loan',
  equipment: 'Equipment Loan',
  sba: 'SBA Loan',
  mortgage: 'Mortgage',
  bridge: 'Bridge Loan',
  mezzanine: 'Mezzanine',
  other: 'Other',
};

export default function LoansPayablePage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const context = useOutletContext();
  const entity = context?.entity;
  const basePath = `/accounting/entities/${entityId}`;

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  // Fetch loans
  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans-payable', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('loans_payable')
          .select('*')
          .eq('entity_id', entityId)
          .order('current_balance', { ascending: false });

        if (error) throw error;
        return data || demoLoans;
      } catch (err) {
        console.error('Error fetching loans:', err);
        return demoLoans;
      }
    },
  });

  // Delete loan mutation
  const deleteMutation = useMutation({
    mutationFn: async (loanId) => {
      const { error } = await supabase
        .from('loans_payable')
        .delete()
        .eq('id', loanId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['loans-payable', entityId]);
    },
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleEditLoan = (loan) => {
    setSelectedLoan(loan);
    setShowLoanModal(true);
  };

  const handleDeleteLoan = (loan) => {
    if (confirm(`Delete loan "${loan.loan_name}"?`)) {
      deleteMutation.mutate(loan.id);
    }
  };

  // Filter loans
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = !searchTerm ||
      loan.loan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.lender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loan_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || loan.loan_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate summary stats
  const activeLoans = loans.filter(l => l.status === 'active');
  const stats = {
    totalLoans: activeLoans.length,
    totalBalance: activeLoans.reduce((sum, l) => sum + (l.current_balance || 0), 0),
    totalOriginal: activeLoans.reduce((sum, l) => sum + (l.original_amount || 0), 0),
    monthlyPayments: activeLoans.reduce((sum, l) => sum + (l.monthly_payment || 0), 0),
    avgInterestRate: activeLoans.length > 0
      ? activeLoans.reduce((sum, l) => sum + (l.interest_rate || 0), 0) / activeLoans.length
      : 0,
    upcomingPayments: activeLoans.filter(l => {
      if (!l.next_payment_date) return false;
      const nextDate = new Date(l.next_payment_date);
      const inTwoWeeks = new Date();
      inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
      return nextDate <= inTwoWeeks;
    }).length,
  };

  const paidDownPercent = stats.totalOriginal > 0
    ? ((stats.totalOriginal - stats.totalBalance) / stats.totalOriginal) * 100
    : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paid_off':
        return <Badge className="bg-blue-100 text-blue-800">Paid Off</Badge>;
      case 'defaulted':
        return <Badge className="bg-red-100 text-red-800">Defaulted</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Loans Payable</h1>
          <p className="text-muted-foreground">Manage loans and debt</p>
        </div>
        <Button onClick={() => { setSelectedLoan(null); setShowLoanModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Loan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Outstanding</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalLoans} active loan{stats.totalLoans !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Landmark className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payments</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.monthlyPayments)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total scheduled
                </p>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Interest Rate</p>
                <p className="text-2xl font-bold">{stats.avgInterestRate.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all loans
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Down</p>
                <p className="text-2xl font-bold text-green-600">{paidDownPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.totalOriginal - stats.totalBalance)} principal
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments Alert */}
      {stats.upcomingPayments > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-amber-800">
              {stats.upcomingPayments} payment{stats.upcomingPayments > 1 ? 's' : ''} due in the next 2 weeks
            </p>
            <p className="text-sm text-amber-700">
              Review and prepare for upcoming loan payments
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700"
            onClick={() => setStatusFilter('active')}
          >
            View Payments
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search loans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loan Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(loanTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paid_off">Paid Off</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loans Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Loan</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Lender</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Balance</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Rate</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Payment</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Next Due</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLoans.map((loan) => {
                const paidPercent = loan.original_amount > 0
                  ? ((loan.original_amount - loan.current_balance) / loan.original_amount) * 100
                  : 0;

                return (
                  <tr key={loan.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{loan.loan_name}</p>
                        {loan.loan_number && (
                          <p className="text-xs text-muted-foreground font-mono">{loan.loan_number}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{loan.lender_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {loanTypeLabels[loan.loan_type] || loan.loan_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <p className="font-medium">{formatCurrency(loan.current_balance)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={paidPercent} className="h-1.5 w-16" />
                          <span className="text-xs text-muted-foreground">{paidPercent.toFixed(0)}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">{loan.interest_rate}%</span>
                      <p className="text-xs text-muted-foreground capitalize">
                        {loan.interest_type?.replace('_', ' ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {loan.monthly_payment > 0 ? formatCurrency(loan.monthly_payment) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {loan.next_payment_date ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className={cn(
                            new Date(loan.next_payment_date) < new Date() && "text-red-600 font-medium"
                          )}>
                            {formatDate(loan.next_payment_date)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(loan.status)}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditLoan(loan)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditLoan(loan)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Loan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`${basePath}/loans/${loan.id}/payments`)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Payment History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteLoan(loan)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Loan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                    <Landmark className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="font-medium">No loans found</p>
                    <p className="text-sm">Add a loan to start tracking your debt</p>
                    <Button
                      className="mt-4"
                      onClick={() => { setSelectedLoan(null); setShowLoanModal(true); }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Loan
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Loan Form Modal */}
      <LoanFormModal
        open={showLoanModal}
        onClose={() => { setShowLoanModal(false); setSelectedLoan(null); }}
        entityId={entityId}
        loan={selectedLoan}
      />
    </div>
  );
}
