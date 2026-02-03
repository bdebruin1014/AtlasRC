// src/pages/accounting/FiscalPeriodsPage.jsx
// Fiscal Periods page for managing accounting periods

import React, { useState, useMemo } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Plus, MoreHorizontal, CheckCircle, Circle, Clock, Lock, Unlock,
  Calendar, Search, Edit, Trash2, RotateCcw, Eye, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import InitializePeriodsModal from '@/components/accounting/InitializePeriodsModal';

// Demo periods data
const demoPeriods = [
  {
    id: 'P-001',
    fiscal_year: 2025,
    period_number: 1,
    period_name: 'January 2025',
    start_date: '2025-01-01',
    end_date: '2025-01-31',
    status: 'closed',
    is_adjustment: false,
    closed_date: '2025-02-10',
    closed_by: 'John Smith',
    transactions_count: 245,
  },
  {
    id: 'P-002',
    fiscal_year: 2025,
    period_number: 2,
    period_name: 'February 2025',
    start_date: '2025-02-01',
    end_date: '2025-02-28',
    status: 'closed',
    is_adjustment: false,
    closed_date: '2025-03-08',
    closed_by: 'John Smith',
    transactions_count: 198,
  },
  {
    id: 'P-003',
    fiscal_year: 2025,
    period_number: 3,
    period_name: 'March 2025',
    start_date: '2025-03-01',
    end_date: '2025-03-31',
    status: 'open',
    is_adjustment: false,
    transactions_count: 156,
  },
  {
    id: 'P-004',
    fiscal_year: 2025,
    period_number: 4,
    period_name: 'April 2025',
    start_date: '2025-04-01',
    end_date: '2025-04-30',
    status: 'open',
    is_adjustment: false,
    transactions_count: 0,
  },
  {
    id: 'P-005',
    fiscal_year: 2025,
    period_number: 5,
    period_name: 'May 2025',
    start_date: '2025-05-01',
    end_date: '2025-05-31',
    status: 'future',
    is_adjustment: false,
    transactions_count: 0,
  },
  {
    id: 'P-006',
    fiscal_year: 2025,
    period_number: 13,
    period_name: 'Adjustment Period',
    start_date: '2025-12-31',
    end_date: '2025-12-31',
    status: 'future',
    is_adjustment: true,
    transactions_count: 0,
  },
  {
    id: 'P-007',
    fiscal_year: 2024,
    period_number: 12,
    period_name: 'December 2024',
    start_date: '2024-12-01',
    end_date: '2024-12-31',
    status: 'locked',
    is_adjustment: false,
    closed_date: '2025-01-12',
    closed_by: 'John Smith',
    transactions_count: 312,
  },
  {
    id: 'P-008',
    fiscal_year: 2024,
    period_number: 13,
    period_name: 'Adjustment Period',
    start_date: '2024-12-31',
    end_date: '2024-12-31',
    status: 'locked',
    is_adjustment: true,
    closed_date: '2025-01-15',
    closed_by: 'John Smith',
    transactions_count: 8,
  },
];

export default function FiscalPeriodsPage() {
  const { entityId } = useParams();
  const context = useOutletContext();
  const queryClient = useQueryClient();
  const basePath = `/accounting/entities/${entityId}`;

  const [showInitializeModal, setShowInitializeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch periods
  const { data: periods = [], isLoading } = useQuery({
    queryKey: ['fiscal-periods', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('fiscal_periods')
          .select('*')
          .eq('entity_id', entityId)
          .order('fiscal_year', { ascending: false })
          .order('period_number', { ascending: true });

        if (error) throw error;
        return data || demoPeriods;
      } catch (err) {
        console.error('Error fetching periods:', err);
        return demoPeriods;
      }
    },
  });

  // Filter periods
  const filteredPeriods = useMemo(() => {
    return periods.filter(period => {
      const matchesSearch = searchTerm === '' ||
        period.period_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesYear = filterYear === 'all' ||
        period.fiscal_year.toString() === filterYear;

      const matchesStatus = filterStatus === 'all' ||
        period.status === filterStatus;

      return matchesSearch && matchesYear && matchesStatus;
    });
  }, [periods, searchTerm, filterYear, filterStatus]);

  // Get unique years
  const years = useMemo(() => {
    const uniqueYears = [...new Set(periods.map(p => p.fiscal_year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [periods]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = periods.length;
    const closed = periods.filter(p => p.status === 'closed').length;
    const locked = periods.filter(p => p.status === 'locked').length;
    const open = periods.filter(p => p.status === 'open').length;
    const future = periods.filter(p => p.status === 'future').length;

    return { total, closed, locked, open, future };
  }, [periods]);

  // Mutations
  const reopenPeriodMutation = useMutation({
    mutationFn: async (periodId) => {
      const { error } = await supabase
        .from('fiscal_periods')
        .update({ status: 'open', closed_date: null, closed_by: null })
        .eq('id', periodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['fiscal-periods', entityId]);
    },
  });

  const lockPeriodMutation = useMutation({
    mutationFn: async (periodId) => {
      const { error } = await supabase
        .from('fiscal_periods')
        .update({ status: 'locked' })
        .eq('id', periodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['fiscal-periods', entityId]);
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      closed: 'bg-green-100 text-green-800',
      locked: 'bg-purple-100 text-purple-800',
      open: 'bg-blue-100 text-blue-800',
      future: 'bg-gray-100 text-gray-600',
      in_progress: 'bg-amber-100 text-amber-800',
    };
    const labels = {
      closed: 'Closed',
      locked: 'Locked',
      open: 'Open',
      future: 'Future',
      in_progress: 'In Progress',
    };
    return (
      <Badge className={cn(styles[status] || 'bg-gray-100 text-gray-800')}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-purple-600" />;
      case 'open':
        return <Circle className="h-4 w-4 text-blue-600" />;
      case 'future':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fiscal Periods</h1>
          <p className="text-muted-foreground">Manage accounting periods</p>
        </div>
        <Button onClick={() => setShowInitializeModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Initialize Periods
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Periods</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Circle className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Closed</p>
              <p className="text-2xl font-bold text-green-600">{stats.closed}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Locked</p>
              <p className="text-2xl font-bold text-purple-600">{stats.locked}</p>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Future</p>
              <p className="text-2xl font-bold text-gray-600">{stats.future}</p>
            </div>
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search periods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Fiscal Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                FY {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="locked">Locked</SelectItem>
            <SelectItem value="future">Future</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Periods Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Fiscal Year</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Transactions</TableHead>
              <TableHead>Closed Date</TableHead>
              <TableHead>Closed By</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading periods...
                </TableCell>
              </TableRow>
            ) : filteredPeriods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No fiscal periods found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInitializeModal(true)}
                    >
                      Initialize Periods
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPeriods.map((period) => (
                <TableRow
                  key={period.id}
                  className={cn(period.is_adjustment && "bg-amber-50/50")}
                >
                  <TableCell>
                    {getStatusIcon(period.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{period.period_name}</span>
                      {period.is_adjustment && (
                        <Badge variant="outline" className="text-xs">
                          Adj
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Period {period.period_number}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">{period.fiscal_year}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatDate(period.start_date)} - {formatDate(period.end_date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(period.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono",
                      period.transactions_count === 0 && "text-muted-foreground"
                    )}>
                      {period.transactions_count.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {period.closed_date ? formatDate(period.closed_date) : '-'}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {period.closed_by || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Transactions
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Period
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {period.status === 'closed' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => reopenPeriodMutation.mutate(period.id)}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Reopen Period
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => lockPeriodMutation.mutate(period.id)}
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Lock Period
                            </DropdownMenuItem>
                          </>
                        )}
                        {period.status === 'locked' && (
                          <DropdownMenuItem
                            onClick={() => reopenPeriodMutation.mutate(period.id)}
                            className="text-amber-600"
                          >
                            <Unlock className="h-4 w-4 mr-2" />
                            Unlock Period
                          </DropdownMenuItem>
                        )}
                        {period.status === 'open' && (
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Close Period
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Period
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-blue-600" />
          <span className="text-muted-foreground">Open - Transactions can be posted</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">Closed - Period closed, can be reopened</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-purple-600" />
          <span className="text-muted-foreground">Locked - No changes allowed</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-muted-foreground">Future - Not yet active</span>
        </div>
      </div>

      {/* Initialize Periods Modal */}
      <InitializePeriodsModal
        open={showInitializeModal}
        onClose={() => setShowInitializeModal(false)}
        entityId={entityId}
      />
    </div>
  );
}
