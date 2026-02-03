import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, Download, Edit2, Trash2, Eye, Upload, BookOpen,
  CheckCircle, Clock, AlertCircle, MoreHorizontal, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import ImportJournalEntriesModal from '@/components/accounting/ImportJournalEntriesModal';

// Demo journal entries for fallback
const demoEntries = [
  {
    id: 'JE-001',
    entry_date: '2024-12-31',
    description: 'December Depreciation',
    status: 'posted',
    total_debits: 12500,
    total_credits: 12500,
    created_by: 'John Smith',
    lines: [
      { account: '6100 - Depreciation Expense', debit: 12500, credit: 0 },
      { account: '1510 - Accumulated Depreciation', debit: 0, credit: 12500 },
    ]
  },
  {
    id: 'JE-002',
    entry_date: '2024-12-31',
    description: 'Accrued Interest - Construction Loan',
    status: 'posted',
    total_debits: 42000,
    total_credits: 42000,
    created_by: 'John Smith',
    lines: [
      { account: '7000 - Interest Expense', debit: 42000, credit: 0 },
      { account: '2100 - Interest Payable', debit: 0, credit: 42000 },
    ]
  },
  {
    id: 'JE-003',
    entry_date: '2024-12-28',
    description: 'Reclassify Prepaid Insurance',
    status: 'posted',
    total_debits: 8500,
    total_credits: 8500,
    created_by: 'Sarah Johnson',
    lines: [
      { account: '6000 - Insurance Expense', debit: 8500, credit: 0 },
      { account: '1300 - Prepaid Insurance', debit: 0, credit: 8500 },
    ]
  },
  {
    id: 'JE-004',
    entry_date: '2024-12-27',
    description: 'Year-End Bonus Accrual',
    status: 'draft',
    total_debits: 45000,
    total_credits: 45000,
    created_by: 'John Smith',
    lines: [
      { account: '6200 - Bonus Expense', debit: 45000, credit: 0 },
      { account: '2200 - Accrued Expenses', debit: 0, credit: 45000 },
    ]
  },
  {
    id: 'JE-005',
    entry_date: '2024-12-26',
    description: 'Intercompany Loan Interest',
    status: 'pending_approval',
    total_debits: 40000,
    total_credits: 40000,
    created_by: 'Mike Roberts',
    lines: [
      { account: '1200 - Intercompany Receivable', debit: 40000, credit: 0 },
      { account: '4100 - Interest Income', debit: 0, credit: 40000 },
    ]
  },
];

const STATUS_CONFIG = {
  posted: { label: 'Posted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  draft: { label: 'Draft', color: 'bg-amber-100 text-amber-700', icon: Clock },
  pending_approval: { label: 'Pending Approval', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  voided: { label: 'Voided', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const fetchJournalEntries = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('entity_id', entityId)
      .order('entry_date', { ascending: false })
      .limit(100);

    if (data && !error) return data;
  } catch (err) {
    console.error('Error fetching journal entries:', err);
  }
  return demoEntries;
};

export default function JournalEntriesPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const entity = context?.entity;
  const queryClient = useQueryClient();

  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const basePath = `/accounting/entities/${entityId}`;

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries', entityId],
    queryFn: () => fetchJournalEntries(entityId),
    enabled: !!entityId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (entryId) => {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['journal-entries', entityId]);
    }
  });

  const postMutation = useMutation({
    mutationFn: async (entryId) => {
      const { error } = await supabase
        .from('journal_entries')
        .update({ status: 'posted' })
        .eq('id', entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['journal-entries', entityId]);
    }
  });

  const filteredEntries = entries.filter(entry => {
    if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!entry.description?.toLowerCase().includes(term) &&
          !entry.id?.toLowerCase().includes(term)) {
        return false;
      }
    }
    if (dateFrom && entry.entry_date < dateFrom) return false;
    if (dateTo && entry.entry_date > dateTo) return false;
    return true;
  });

  const stats = {
    total: entries.length,
    posted: entries.filter(e => e.status === 'posted').length,
    draft: entries.filter(e => e.status === 'draft').length,
    pending: entries.filter(e => e.status === 'pending_approval').length,
  };

  const handleExport = () => {
    const csvContent = [
      ['Entry #', 'Date', 'Description', 'Debits', 'Credits', 'Status'].join(','),
      ...filteredEntries.map(e => [
        e.id,
        e.entry_date,
        `"${e.description}"`,
        e.total_debits,
        e.total_credits,
        e.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-entries-${entityId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Journal Entries</h1>
          <p className="text-muted-foreground">
            General ledger journal entries for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => navigate(`${basePath}/journal-entries/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Posted</p>
                <p className="text-2xl font-bold text-green-600">{stats.posted}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold text-amber-600">{stats.draft}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="posted">Posted</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="voided">Voided</option>
            </select>
            <Input
              type="date"
              className="w-40"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              className="w-40"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Entry #</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                  <th className="text-right px-4 py-3 font-medium">Debits</th>
                  <th className="text-right px-4 py-3 font-medium">Credits</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No journal entries found</p>
                      <p className="text-sm">Create your first entry to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => {
                    const statusConfig = STATUS_CONFIG[entry.status] || STATUS_CONFIG.draft;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={entry.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <span className="font-mono text-primary">{entry.id}</span>
                        </td>
                        <td className="px-4 py-3">{formatDate(entry.entry_date)}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{entry.description}</p>
                            {entry.created_by && (
                              <p className="text-xs text-muted-foreground">by {entry.created_by}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(entry.total_debits)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(entry.total_credits)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`${basePath}/journal-entries/${entry.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {entry.status === 'draft' && (
                                <>
                                  <DropdownMenuItem onClick={() => navigate(`${basePath}/journal-entries/${entry.id}/edit`)}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => postMutation.mutate(entry.id)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Post Entry
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => deleteMutation.mutate(entry.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Import Modal */}
      <ImportJournalEntriesModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        entityId={entityId}
      />
    </div>
  );
}
