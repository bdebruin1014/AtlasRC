// src/pages/accounting/MonthEndClosePage.jsx
// Month-End Close page for managing accounting period closures

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar, Play, MoreHorizontal, CheckCircle, Circle, Clock,
  Lock, Unlock, AlertTriangle, FileText, RefreshCw, ChevronRight,
  CheckSquare, XCircle, ArrowRight, Loader2
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
    closed_date: '2025-02-10',
    closed_by: 'John Smith',
  },
  {
    id: 'P-002',
    fiscal_year: 2025,
    period_number: 2,
    period_name: 'February 2025',
    start_date: '2025-02-01',
    end_date: '2025-02-28',
    status: 'in_progress',
    checklist_progress: 65,
  },
  {
    id: 'P-003',
    fiscal_year: 2025,
    period_number: 3,
    period_name: 'March 2025',
    start_date: '2025-03-01',
    end_date: '2025-03-31',
    status: 'open',
    checklist_progress: 0,
  },
];

// Demo close checklist
const demoChecklist = [
  { id: 1, task: 'Review and post all pending transactions', category: 'Transactions', completed: true, required: true },
  { id: 2, task: 'Reconcile all bank accounts', category: 'Reconciliation', completed: true, required: true },
  { id: 3, task: 'Reconcile credit card accounts', category: 'Reconciliation', completed: true, required: true },
  { id: 4, task: 'Review accounts receivable aging', category: 'Review', completed: true, required: false },
  { id: 5, task: 'Review accounts payable aging', category: 'Review', completed: false, required: false },
  { id: 6, task: 'Accrue unbilled expenses', category: 'Accruals', completed: false, required: true },
  { id: 7, task: 'Record depreciation entries', category: 'Accruals', completed: false, required: true },
  { id: 8, task: 'Review intercompany balances', category: 'Intercompany', completed: false, required: true },
  { id: 9, task: 'Generate trial balance', category: 'Reports', completed: false, required: true },
  { id: 10, task: 'Manager review and approval', category: 'Approval', completed: false, required: true },
];

export default function MonthEndClosePage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const queryClient = useQueryClient();
  const basePath = `/accounting/entities/${entityId}`;

  const [showInitializeModal, setShowInitializeModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  // Fetch periods
  const { data: periods = [], isLoading } = useQuery({
    queryKey: ['month-end-close', entityId],
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

  // Fetch checklist for selected period
  const { data: checklist = demoChecklist } = useQuery({
    queryKey: ['close-checklist', selectedPeriod?.id],
    queryFn: async () => {
      if (!selectedPeriod) return demoChecklist;
      try {
        const { data, error } = await supabase
          .from('close_checklist_items')
          .select('*')
          .eq('period_id', selectedPeriod.id)
          .order('sort_order');

        if (error) throw error;
        return data || demoChecklist;
      } catch (err) {
        console.error('Error fetching checklist:', err);
        return demoChecklist;
      }
    },
    enabled: !!selectedPeriod,
  });

  // Filter periods by year
  const filteredPeriods = useMemo(() => {
    return periods.filter(p => p.fiscal_year.toString() === filterYear);
  }, [periods, filterYear]);

  // Get current period (first open or in_progress)
  const currentPeriod = useMemo(() => {
    return periods.find(p => p.status === 'in_progress') ||
           periods.find(p => p.status === 'open');
  }, [periods]);

  // Auto-select current period
  React.useEffect(() => {
    if (currentPeriod && !selectedPeriod) {
      setSelectedPeriod(currentPeriod);
    }
  }, [currentPeriod, selectedPeriod]);

  // Calculate stats
  const stats = useMemo(() => {
    const currentYear = periods.filter(p => p.fiscal_year === parseInt(filterYear));
    const closed = currentYear.filter(p => p.status === 'closed').length;
    const inProgress = currentYear.filter(p => p.status === 'in_progress').length;
    const open = currentYear.filter(p => p.status === 'open').length;
    const total = currentYear.length;

    return { closed, inProgress, open, total };
  }, [periods, filterYear]);

  // Checklist stats
  const checklistStats = useMemo(() => {
    const completed = checklist.filter(c => c.completed).length;
    const required = checklist.filter(c => c.required);
    const requiredCompleted = required.filter(c => c.completed).length;
    const progress = checklist.length > 0 ? Math.round((completed / checklist.length) * 100) : 0;

    return { completed, total: checklist.length, required: required.length, requiredCompleted, progress };
  }, [checklist]);

  const startCloseMutation = useMutation({
    mutationFn: async (periodId) => {
      const { error } = await supabase
        .from('fiscal_periods')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', periodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['month-end-close', entityId]);
    },
  });

  const closePeriodMutation = useMutation({
    mutationFn: async (periodId) => {
      const { error } = await supabase
        .from('fiscal_periods')
        .update({
          status: 'closed',
          closed_date: new Date().toISOString().split('T')[0],
          closed_by: 'Current User',
        })
        .eq('id', periodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['month-end-close', entityId]);
    },
  });

  const toggleChecklistItem = useMutation({
    mutationFn: async ({ itemId, completed }) => {
      const { error } = await supabase
        .from('close_checklist_items')
        .update({ completed, completed_at: completed ? new Date().toISOString() : null })
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['close-checklist', selectedPeriod?.id]);
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

  const handleStartClose = () => {
    if (currentPeriod && currentPeriod.status === 'open') {
      startCloseMutation.mutate(currentPeriod.id);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      closed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      open: 'bg-gray-100 text-gray-800',
      locked: 'bg-purple-100 text-purple-800',
    };
    const labels = {
      closed: 'Closed',
      in_progress: 'In Progress',
      open: 'Open',
      locked: 'Locked',
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
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'open':
        return <Circle className="h-4 w-4 text-gray-400" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-purple-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const years = useMemo(() => {
    const uniqueYears = [...new Set(periods.map(p => p.fiscal_year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [periods]);

  const canClosePeriod = checklistStats.requiredCompleted === checklistStats.required &&
                         selectedPeriod?.status === 'in_progress';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Month-End Close</h1>
          <p className="text-muted-foreground">Close accounting periods</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowInitializeModal(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Initialize Periods
          </Button>
          <Button
            onClick={handleStartClose}
            disabled={!currentPeriod || currentPeriod.status !== 'open' || startCloseMutation.isPending}
          >
            {startCloseMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Start Close Process
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Periods Closed</p>
              <p className="text-2xl font-bold text-green-600">{stats.closed}</p>
              <p className="text-xs text-muted-foreground">of {stats.total} in FY{filterYear}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">Currently closing</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Periods</p>
              <p className="text-2xl font-bold">{stats.open}</p>
              <p className="text-xs text-muted-foreground">Awaiting close</p>
            </div>
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Circle className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Period</p>
              <p className="text-lg font-bold truncate">
                {currentPeriod?.period_name || 'None'}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentPeriod ? getStatusBadge(currentPeriod.status) : 'No active period'}
              </p>
            </div>
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Periods List */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
              <h3 className="font-semibold">Fiscal Periods</h3>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      FY {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="divide-y max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading periods...
                </div>
              ) : filteredPeriods.length === 0 ? (
                <div className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No periods found</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowInitializeModal(true)}
                  >
                    Initialize Periods
                  </Button>
                </div>
              ) : (
                filteredPeriods.map((period) => (
                  <div
                    key={period.id}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedPeriod?.id === period.id && "bg-primary/5 border-l-2 border-l-primary"
                    )}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {getStatusIcon(period.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{period.period_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(period.start_date)} - {formatDate(period.end_date)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Close Checklist */}
        <div className="lg:col-span-2">
          {selectedPeriod ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/50 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{selectedPeriod.period_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(selectedPeriod.start_date)} - {formatDate(selectedPeriod.end_date)}
                    </p>
                  </div>
                  {getStatusBadge(selectedPeriod.status)}
                </div>
                {selectedPeriod.status === 'in_progress' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Close Progress</span>
                      <span className="font-medium">{checklistStats.progress}%</span>
                    </div>
                    <Progress value={checklistStats.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {checklistStats.completed} of {checklistStats.total} tasks complete
                      ({checklistStats.requiredCompleted}/{checklistStats.required} required)
                    </p>
                  </div>
                )}
              </div>

              {selectedPeriod.status === 'closed' ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Period Closed</h4>
                  <p className="text-sm text-muted-foreground">
                    Closed on {formatDate(selectedPeriod.closed_date)}
                    {selectedPeriod.closed_by && ` by ${selectedPeriod.closed_by}`}
                  </p>
                </div>
              ) : selectedPeriod.status === 'open' ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Play className="h-6 w-6 text-gray-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Period Not Started</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start the close process to begin working on this period.
                  </p>
                  <Button onClick={() => startCloseMutation.mutate(selectedPeriod.id)}>
                    Start Close Process
                  </Button>
                </div>
              ) : (
                <>
                  {/* Checklist */}
                  <div className="divide-y">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start gap-3 p-3 hover:bg-muted/30",
                          item.completed && "bg-green-50/50"
                        )}
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={(checked) =>
                            toggleChecklistItem.mutate({ itemId: item.id, completed: checked })
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <p className={cn(
                            "text-sm",
                            item.completed && "line-through text-muted-foreground"
                          )}>
                            {item.task}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{item.category}</span>
                            {item.required && (
                              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                        {item.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Close Button */}
                  <div className="p-4 bg-muted/30 border-t">
                    {!canClosePeriod && (
                      <div className="flex items-center gap-2 text-sm text-amber-600 mb-3">
                        <AlertTriangle className="h-4 w-4" />
                        Complete all required tasks before closing
                      </div>
                    )}
                    <Button
                      className="w-full"
                      disabled={!canClosePeriod || closePeriodMutation.isPending}
                      onClick={() => closePeriodMutation.mutate(selectedPeriod.id)}
                    >
                      {closePeriodMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      Close Period
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-semibold mb-1">Select a Period</h4>
              <p className="text-sm text-muted-foreground">
                Choose a period from the list to view its close checklist
              </p>
            </div>
          )}
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
