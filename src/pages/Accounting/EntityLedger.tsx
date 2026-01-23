import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Filter,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Loader2,
  FileText,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  reference: string;
  type: 'debit' | 'credit';
  account: string;
  amount: number;
  balance: number;
  category: string;
  project?: string;
  status: 'posted' | 'pending' | 'reconciled';
}

const mockEntity = {
  id: '1',
  name: 'ABC Holdings LLC',
  type: 'Operating Company',
  openingBalance: 125000
};

const mockLedgerEntries: LedgerEntry[] = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Property acquisition deposit',
    reference: 'TXN-001',
    type: 'debit',
    account: 'Operating Account',
    amount: 50000,
    balance: 175000,
    category: 'Capital Expenditure',
    project: 'Sunrise Apartments',
    status: 'posted'
  },
  {
    id: '2',
    date: '2024-01-18',
    description: 'Legal fees - acquisition',
    reference: 'TXN-002',
    type: 'debit',
    account: 'Operating Account',
    amount: 15000,
    balance: 160000,
    category: 'Legal & Professional',
    project: 'Sunrise Apartments',
    status: 'posted'
  },
  {
    id: '3',
    date: '2024-01-20',
    description: 'Investor capital contribution',
    reference: 'TXN-003',
    type: 'credit',
    account: 'Operating Account',
    amount: 250000,
    balance: 410000,
    category: 'Capital Contribution',
    status: 'reconciled'
  },
  {
    id: '4',
    date: '2024-01-25',
    description: 'Due diligence costs',
    reference: 'TXN-004',
    type: 'debit',
    account: 'Operating Account',
    amount: 8500,
    balance: 401500,
    category: 'Due Diligence',
    project: 'Sunrise Apartments',
    status: 'posted'
  },
  {
    id: '5',
    date: '2024-02-01',
    description: 'Property management fee',
    reference: 'TXN-005',
    type: 'debit',
    account: 'Operating Account',
    amount: 3200,
    balance: 398300,
    category: 'Management Fees',
    project: 'Oak Street Plaza',
    status: 'pending'
  },
  {
    id: '6',
    date: '2024-02-05',
    description: 'Rental income - Oak Street',
    reference: 'TXN-006',
    type: 'credit',
    account: 'Operating Account',
    amount: 45000,
    balance: 443300,
    category: 'Rental Income',
    project: 'Oak Street Plaza',
    status: 'posted'
  },
  {
    id: '7',
    date: '2024-02-10',
    description: 'Insurance premium payment',
    reference: 'TXN-007',
    type: 'debit',
    account: 'Operating Account',
    amount: 12000,
    balance: 431300,
    category: 'Insurance',
    status: 'posted'
  },
  {
    id: '8',
    date: '2024-02-15',
    description: 'Construction draw #1',
    reference: 'TXN-008',
    type: 'debit',
    account: 'Operating Account',
    amount: 175000,
    balance: 256300,
    category: 'Construction',
    project: 'Sunrise Apartments',
    status: 'pending'
  }
];

export default function EntityLedger() {
  const navigate = useNavigate();
  const { entityId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [entity, setEntity] = useState(mockEntity);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadLedgerData();
  }, [entityId]);

  const loadLedgerData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEntries(mockLedgerEntries);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredEntries = entries.filter(entry => {
    if (searchQuery && !entry.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !entry.reference.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
    if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
    if (dateRange.start && entry.date < dateRange.start) return false;
    if (dateRange.end && entry.date > dateRange.end) return false;
    return true;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'date') {
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * modifier;
    }
    return (a.amount - b.amount) * modifier;
  });

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const totalDebits = filteredEntries
    .filter(e => e.type === 'debit')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCredits = filteredEntries
    .filter(e => e.type === 'credit')
    .reduce((sum, e) => sum + e.amount, 0);

  const currentBalance = sortedEntries.length > 0
    ? sortedEntries[sortedEntries.length - 1].balance
    : entity.openingBalance;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Posted</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'reconciled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reconciled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting ledger as ${format}`);
    // Export implementation would go here
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold tracking-tight">{entity.name}</h1>
            </div>
            <p className="text-muted-foreground">General Ledger</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileText className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => navigate('/accounting/transactions/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Opening Balance</CardDescription>
            <CardTitle className="text-xl">
              {formatCurrency(entity.openingBalance)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Debits</CardDescription>
            <CardTitle className="text-xl text-red-600">
              {formatCurrency(totalDebits)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Credits</CardDescription>
            <CardTitle className="text-xl text-green-600">
              {formatCurrency(totalCredits)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Balance</CardDescription>
            <CardTitle className="text-xl">
              {formatCurrency(currentBalance)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by description or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="debit">Debits</SelectItem>
                  <SelectItem value="credit">Credits</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reconciled">Reconciled</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-[140px]"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-[140px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortField === 'date' && (
                      sortDirection === 'asc' ?
                        <ChevronUp className="h-4 w-4" /> :
                        <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Project</TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Debit
                    {sortField === 'amount' && (
                      sortDirection === 'asc' ?
                        <ChevronUp className="h-4 w-4" /> :
                        <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Opening Balance Row */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={5} className="font-medium">
                  Opening Balance
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(entity.openingBalance)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>

              {sortedEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/accounting/transactions/${entry.id}`)}
                >
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {entry.reference}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {entry.type === 'debit' ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      )}
                      {entry.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {entry.project ? (
                      <span className="text-sm">{entry.project}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {entry.type === 'debit' ? formatCurrency(entry.amount) : ''}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {entry.type === 'credit' ? formatCurrency(entry.amount) : ''}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(entry.balance)}
                  </TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                </TableRow>
              ))}

              {sortedEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No transactions found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {sortedEntries.length} of {entries.length} entries
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Debits</p>
                <p className="text-lg font-semibold text-red-600">{formatCurrency(totalDebits)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(totalCredits)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Net Change</p>
                <p className={`text-lg font-semibold ${totalCredits - totalDebits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalCredits - totalDebits)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
