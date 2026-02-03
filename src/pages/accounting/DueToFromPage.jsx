// src/pages/accounting/DueToFromPage.jsx
// Due To/From report page showing intercompany balances

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  Download, CheckCircle, Search, Building2, MoreHorizontal,
  ArrowUpRight, ArrowDownLeft, Scale, TrendingUp, AlertTriangle,
  FileText, Filter, RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import SettleBalanceModal from '@/components/accounting/SettleBalanceModal';

// Demo data
const demoBalances = [
  {
    id: 'B-001',
    entity_id: 'E-002',
    entity_name: 'Riverside Plaza LLC',
    counterparty_id: 'E-001',
    counterparty_name: 'Atlas Holdings LLC',
    due_to: 125000.00,
    due_from: 0,
    net_balance: -125000.00,
    last_activity_date: '2025-01-15',
    aging_days: 45,
    status: 'current',
  },
  {
    id: 'B-002',
    entity_id: 'E-003',
    entity_name: 'Downtown Tower LLC',
    counterparty_id: 'E-001',
    counterparty_name: 'Atlas Holdings LLC',
    due_to: 0,
    due_from: 85000.00,
    net_balance: 85000.00,
    last_activity_date: '2025-01-10',
    aging_days: 22,
    status: 'current',
  },
  {
    id: 'B-003',
    entity_id: 'E-004',
    entity_name: 'Oak Street Partners LP',
    counterparty_id: 'E-001',
    counterparty_name: 'Atlas Holdings LLC',
    due_to: 45000.00,
    due_from: 0,
    net_balance: -45000.00,
    last_activity_date: '2024-12-01',
    aging_days: 65,
    status: 'aging',
  },
  {
    id: 'B-004',
    entity_id: 'E-002',
    entity_name: 'Riverside Plaza LLC',
    counterparty_id: 'E-005',
    counterparty_name: 'Atlas Management Co.',
    due_to: 18500.00,
    due_from: 0,
    net_balance: -18500.00,
    last_activity_date: '2025-01-20',
    aging_days: 12,
    status: 'current',
  },
  {
    id: 'B-005',
    entity_id: 'E-003',
    entity_name: 'Downtown Tower LLC',
    counterparty_id: 'E-005',
    counterparty_name: 'Atlas Management Co.',
    due_to: 22000.00,
    due_from: 0,
    net_balance: -22000.00,
    last_activity_date: '2025-01-18',
    aging_days: 14,
    status: 'current',
  },
  {
    id: 'B-006',
    entity_id: 'E-004',
    entity_name: 'Oak Street Partners LP',
    counterparty_id: 'E-005',
    counterparty_name: 'Atlas Management Co.',
    due_to: 0,
    due_from: 32000.00,
    net_balance: 32000.00,
    last_activity_date: '2024-11-15',
    aging_days: 78,
    status: 'overdue',
  },
];

export default function DueToFromPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const basePath = `/accounting/entities/${entityId}`;

  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Fetch balances
  const { data: balances = [], isLoading, refetch } = useQuery({
    queryKey: ['due-to-from', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('intercompany_balances')
          .select(`
            *,
            entity:entities!entity_id(id, name),
            counterparty:entities!counterparty_id(id, name)
          `)
          .or(`entity_id.eq.${entityId},counterparty_id.eq.${entityId}`)
          .order('last_activity_date', { ascending: false });

        if (error) throw error;
        return data || demoBalances;
      } catch (err) {
        console.error('Error fetching balances:', err);
        return demoBalances;
      }
    },
  });

  // Filter balances
  const filteredBalances = useMemo(() => {
    return balances.filter(balance => {
      const entityName = balance.entity_name || balance.entity?.name || '';
      const counterpartyName = balance.counterparty_name || balance.counterparty?.name || '';
      const matchesSearch = searchTerm === '' ||
        entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        counterpartyName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || balance.status === filterStatus;

      const net = balance.net_balance || 0;
      const matchesType = filterType === 'all' ||
        (filterType === 'due_to' && net < 0) ||
        (filterType === 'due_from' && net > 0);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [balances, searchTerm, filterStatus, filterType]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalDueTo = balances.reduce((sum, b) => sum + (b.due_to || 0), 0);
    const totalDueFrom = balances.reduce((sum, b) => sum + (b.due_from || 0), 0);
    const netPosition = totalDueFrom - totalDueTo;
    const agingCount = balances.filter(b => b.status === 'aging' || b.status === 'overdue').length;

    return { totalDueTo, totalDueFrom, netPosition, agingCount };
  }, [balances]);

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleExport = () => {
    // Export logic
    console.log('Exporting Due To/From report...');
  };

  const handleSettle = (balance) => {
    setSelectedBalance(balance);
    setShowSettleModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      current: 'bg-green-100 text-green-800',
      aging: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={cn('capitalize', styles[status] || 'bg-gray-100 text-gray-800')}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Due To/From</h1>
          <p className="text-muted-foreground">Intercompany balances</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowSettleModal(true)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Settle Balance
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Due To</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalDueTo)}</p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Due From</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalDueFrom)}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Position</p>
              <p className={cn(
                "text-2xl font-bold",
                stats.netPosition >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(Math.abs(stats.netPosition))}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.netPosition >= 0 ? 'Net Receivable' : 'Net Payable'}
              </p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Scale className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aging Balances</p>
              <p className="text-2xl font-bold">{stats.agingCount}</p>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </div>
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="due_to">Due To</SelectItem>
            <SelectItem value="due_from">Due From</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="current">Current</SelectItem>
            <SelectItem value="aging">Aging</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Balance Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead className="text-right">Due To</TableHead>
              <TableHead className="text-right">Due From</TableHead>
              <TableHead className="text-right">Net Balance</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-center">Aging</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading balances...
                </TableCell>
              </TableRow>
            ) : filteredBalances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Scale className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No intercompany balances found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBalances.map((balance) => (
                <TableRow key={balance.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {balance.entity_name || balance.entity?.name || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {balance.counterparty_name || balance.counterparty?.name || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {balance.due_to > 0 ? (
                      <span className="text-red-600 font-medium">
                        {formatCurrency(balance.due_to)}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {balance.due_from > 0 ? (
                      <span className="text-green-600 font-medium">
                        {formatCurrency(balance.due_from)}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-bold",
                      balance.net_balance >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(Math.abs(balance.net_balance))}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {balance.net_balance >= 0 ? 'DR' : 'CR'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(balance.last_activity_date)}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-sm",
                      balance.aging_days > 60 ? "text-red-600 font-medium" :
                      balance.aging_days > 30 ? "text-amber-600" : "text-muted-foreground"
                    )}>
                      {balance.aging_days} days
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(balance.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSettle(balance)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Settle Balance
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          View Transactions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Aging Report
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

      {/* Summary Footer */}
      {filteredBalances.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="bg-muted/50 rounded-lg p-4 inline-flex gap-8">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Due To</p>
              <p className="font-semibold text-red-600">
                {formatCurrency(filteredBalances.reduce((sum, b) => sum + (b.due_to || 0), 0))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Due From</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(filteredBalances.reduce((sum, b) => sum + (b.due_from || 0), 0))}
              </p>
            </div>
            <div className="text-right border-l pl-8">
              <p className="text-xs text-muted-foreground">Net Balance</p>
              <p className="font-bold">
                {formatCurrency(
                  filteredBalances.reduce((sum, b) => sum + (b.due_from || 0), 0) -
                  filteredBalances.reduce((sum, b) => sum + (b.due_to || 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settle Balance Modal */}
      <SettleBalanceModal
        open={showSettleModal}
        onClose={() => {
          setShowSettleModal(false);
          setSelectedBalance(null);
        }}
        entityId={entityId}
        selectedBalance={selectedBalance}
      />
    </div>
  );
}
