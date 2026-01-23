import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  FolderKanban,
  Loader2,
  FileText,
  Plus,
  TrendingUp,
  TrendingDown,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  entity: string;
  status: 'posted' | 'pending' | 'reconciled';
  budgetCategory?: string;
}

interface BudgetCategory {
  name: string;
  budgeted: number;
  actual: number;
  remaining: number;
}

const mockProject = {
  id: '1',
  name: 'Sunrise Apartments',
  status: 'In Progress',
  totalBudget: 2500000,
  openingBalance: 0
};

const mockBudgetCategories: BudgetCategory[] = [
  { name: 'Acquisition', budgeted: 1500000, actual: 1450000, remaining: 50000 },
  { name: 'Hard Costs', budgeted: 750000, actual: 425000, remaining: 325000 },
  { name: 'Soft Costs', budgeted: 150000, actual: 98500, remaining: 51500 },
  { name: 'Contingency', budgeted: 100000, actual: 15000, remaining: 85000 }
];

const mockLedgerEntries: LedgerEntry[] = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Earnest money deposit',
    reference: 'TXN-001',
    type: 'debit',
    account: 'Operating Account',
    amount: 50000,
    balance: 50000,
    category: 'Acquisition',
    entity: 'ABC Holdings LLC',
    status: 'reconciled',
    budgetCategory: 'Acquisition'
  },
  {
    id: '2',
    date: '2024-01-20',
    description: 'Due diligence - environmental',
    reference: 'TXN-002',
    type: 'debit',
    account: 'Operating Account',
    amount: 8500,
    balance: 58500,
    category: 'Soft Costs',
    entity: 'ABC Holdings LLC',
    status: 'posted',
    budgetCategory: 'Soft Costs'
  },
  {
    id: '3',
    date: '2024-01-25',
    description: 'Property acquisition closing',
    reference: 'TXN-003',
    type: 'debit',
    account: 'Operating Account',
    amount: 1400000,
    balance: 1458500,
    category: 'Acquisition',
    entity: 'ABC Holdings LLC',
    status: 'reconciled',
    budgetCategory: 'Acquisition'
  },
  {
    id: '4',
    date: '2024-02-01',
    description: 'Architectural fees',
    reference: 'TXN-004',
    type: 'debit',
    account: 'Operating Account',
    amount: 45000,
    balance: 1503500,
    category: 'Soft Costs',
    entity: 'ABC Holdings LLC',
    status: 'posted',
    budgetCategory: 'Soft Costs'
  },
  {
    id: '5',
    date: '2024-02-10',
    description: 'Construction draw #1 - foundation',
    reference: 'TXN-005',
    type: 'debit',
    account: 'Operating Account',
    amount: 175000,
    balance: 1678500,
    category: 'Hard Costs',
    entity: 'ABC Holdings LLC',
    status: 'posted',
    budgetCategory: 'Hard Costs'
  },
  {
    id: '6',
    date: '2024-02-20',
    description: 'Construction draw #2 - framing',
    reference: 'TXN-006',
    type: 'debit',
    account: 'Operating Account',
    amount: 250000,
    balance: 1928500,
    category: 'Hard Costs',
    entity: 'ABC Holdings LLC',
    status: 'pending',
    budgetCategory: 'Hard Costs'
  },
  {
    id: '7',
    date: '2024-02-25',
    description: 'Engineering fees',
    reference: 'TXN-007',
    type: 'debit',
    account: 'Operating Account',
    amount: 35000,
    balance: 1963500,
    category: 'Soft Costs',
    entity: 'ABC Holdings LLC',
    status: 'posted',
    budgetCategory: 'Soft Costs'
  },
  {
    id: '8',
    date: '2024-03-01',
    description: 'Contingency - unexpected foundation work',
    reference: 'TXN-008',
    type: 'debit',
    account: 'Operating Account',
    amount: 15000,
    balance: 1978500,
    category: 'Contingency',
    entity: 'ABC Holdings LLC',
    status: 'posted',
    budgetCategory: 'Contingency'
  }
];

export default function ProjectLedger() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [project, setProject] = useState(mockProject);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'ledger' | 'budget'>('ledger');

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEntries(mockLedgerEntries);
      setBudgetCategories(mockBudgetCategories);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
    if (categoryFilter !== 'all' && entry.budgetCategory !== categoryFilter) return false;
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

  const totalSpent = filteredEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgetCategories.reduce((sum, c) => sum + c.budgeted, 0);
  const budgetRemaining = totalBudget - totalSpent;
  const budgetUsedPercent = (totalSpent / totalBudget) * 100;

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

  const getBudgetStatus = (category: BudgetCategory) => {
    const percent = (category.actual / category.budgeted) * 100;
    if (percent >= 100) return 'over';
    if (percent >= 90) return 'warning';
    return 'good';
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting project ledger as ${format}`);
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
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <Badge variant="outline">{project.status}</Badge>
            </div>
            <p className="text-muted-foreground">Project Ledger & Budget Tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'ledger' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('ledger')}
              className="rounded-r-none"
            >
              Ledger
            </Button>
            <Button
              variant={viewMode === 'budget' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('budget')}
              className="rounded-l-none"
            >
              Budget
            </Button>
          </div>
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
            <CardDescription className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Total Budget
            </CardDescription>
            <CardTitle className="text-xl">
              {formatCurrency(totalBudget)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Total Spent
            </CardDescription>
            <CardTitle className="text-xl">
              {formatCurrency(totalSpent)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Progress value={budgetUsedPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {budgetUsedPercent.toFixed(1)}% of budget used
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              Budget Remaining
            </CardDescription>
            <CardTitle className={`text-xl ${budgetRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(budgetRemaining)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Transactions</CardDescription>
            <CardTitle className="text-xl">
              {entries.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              {entries.filter(e => e.status === 'pending').length} pending approval
            </p>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'budget' ? (
        /* Budget View */
        <Card>
          <CardHeader>
            <CardTitle>Budget by Category</CardTitle>
            <CardDescription>Track spending against budgeted amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {budgetCategories.map((category) => {
                const percent = (category.actual / category.budgeted) * 100;
                const status = getBudgetStatus(category);
                return (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        {status === 'over' && (
                          <Badge variant="destructive">Over Budget</Badge>
                        )}
                        {status === 'warning' && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            Near Limit
                          </Badge>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <span className="font-medium">{formatCurrency(category.actual)}</span>
                        <span className="text-muted-foreground"> / {formatCurrency(category.budgeted)}</span>
                      </div>
                    </div>
                    <Progress
                      value={Math.min(percent, 100)}
                      className={`h-3 ${
                        status === 'over' ? '[&>div]:bg-red-500' :
                        status === 'warning' ? '[&>div]:bg-yellow-500' :
                        '[&>div]:bg-green-500'
                      }`}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{percent.toFixed(1)}% used</span>
                      <span>{formatCurrency(category.remaining)} remaining</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Ledger View */
        <>
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
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {budgetCategories.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
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
                    <TableHead>Entity</TableHead>
                    <TableHead
                      className="text-right cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Amount
                        {sortField === 'amount' && (
                          sortDirection === 'asc' ?
                            <ChevronUp className="h-4 w-4" /> :
                            <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Running Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
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
                        <Badge variant="outline">{entry.budgetCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{entry.entity}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(entry.balance)}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    </TableRow>
                  ))}

                  {sortedEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No transactions found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Summary Footer */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {viewMode === 'ledger'
                ? `Showing ${sortedEntries.length} of ${entries.length} transactions`
                : `${budgetCategories.length} budget categories tracked`}
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Budget Used</p>
                <p className="text-lg font-semibold">{budgetUsedPercent.toFixed(1)}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-lg font-semibold">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-lg font-semibold ${budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(budgetRemaining)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
