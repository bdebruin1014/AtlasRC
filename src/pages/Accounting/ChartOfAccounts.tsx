import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Building2,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  subtype: string;
  description: string;
  parentId: string | null;
  balance: number;
  isActive: boolean;
  children?: Account[];
}

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset', icon: Wallet, color: 'text-blue-600' },
  { value: 'liability', label: 'Liability', icon: CreditCard, color: 'text-red-600' },
  { value: 'equity', label: 'Equity', icon: Building2, color: 'text-purple-600' },
  { value: 'revenue', label: 'Revenue', icon: TrendingUp, color: 'text-green-600' },
  { value: 'expense', label: 'Expense', icon: TrendingDown, color: 'text-orange-600' }
];

const ACCOUNT_SUBTYPES: Record<string, { value: string; label: string }[]> = {
  asset: [
    { value: 'cash', label: 'Cash & Cash Equivalents' },
    { value: 'receivable', label: 'Accounts Receivable' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'fixed', label: 'Fixed Assets' },
    { value: 'other_current', label: 'Other Current Assets' },
    { value: 'other_noncurrent', label: 'Other Non-Current Assets' }
  ],
  liability: [
    { value: 'payable', label: 'Accounts Payable' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'current_loan', label: 'Short-Term Loan' },
    { value: 'longterm_loan', label: 'Long-Term Loan' },
    { value: 'other_current', label: 'Other Current Liabilities' },
    { value: 'other_noncurrent', label: 'Other Non-Current Liabilities' }
  ],
  equity: [
    { value: 'owner_equity', label: 'Owner\'s Equity' },
    { value: 'retained_earnings', label: 'Retained Earnings' },
    { value: 'common_stock', label: 'Common Stock' },
    { value: 'additional_capital', label: 'Additional Paid-In Capital' }
  ],
  revenue: [
    { value: 'operating', label: 'Operating Revenue' },
    { value: 'rental', label: 'Rental Income' },
    { value: 'interest', label: 'Interest Income' },
    { value: 'other', label: 'Other Income' }
  ],
  expense: [
    { value: 'operating', label: 'Operating Expenses' },
    { value: 'payroll', label: 'Payroll Expenses' },
    { value: 'rent', label: 'Rent & Occupancy' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'professional', label: 'Professional Services' },
    { value: 'depreciation', label: 'Depreciation' },
    { value: 'interest', label: 'Interest Expense' },
    { value: 'other', label: 'Other Expenses' }
  ]
};

const mockAccounts: Account[] = [
  // Assets
  {
    id: '1000',
    code: '1000',
    name: 'Assets',
    type: 'asset',
    subtype: 'cash',
    description: 'All company assets',
    parentId: null,
    balance: 5250000,
    isActive: true,
    children: [
      {
        id: '1100',
        code: '1100',
        name: 'Cash & Cash Equivalents',
        type: 'asset',
        subtype: 'cash',
        description: 'Cash accounts',
        parentId: '1000',
        balance: 750000,
        isActive: true,
        children: [
          { id: '1101', code: '1101', name: 'Operating Account', type: 'asset', subtype: 'cash', description: 'Main operating account', parentId: '1100', balance: 500000, isActive: true },
          { id: '1102', code: '1102', name: 'Reserve Account', type: 'asset', subtype: 'cash', description: 'Emergency reserves', parentId: '1100', balance: 250000, isActive: true }
        ]
      },
      {
        id: '1200',
        code: '1200',
        name: 'Accounts Receivable',
        type: 'asset',
        subtype: 'receivable',
        description: 'Money owed to the company',
        parentId: '1000',
        balance: 125000,
        isActive: true
      },
      {
        id: '1500',
        code: '1500',
        name: 'Fixed Assets',
        type: 'asset',
        subtype: 'fixed',
        description: 'Property and equipment',
        parentId: '1000',
        balance: 4375000,
        isActive: true,
        children: [
          { id: '1510', code: '1510', name: 'Real Estate Holdings', type: 'asset', subtype: 'fixed', description: 'Property investments', parentId: '1500', balance: 4200000, isActive: true },
          { id: '1520', code: '1520', name: 'Equipment', type: 'asset', subtype: 'fixed', description: 'Office equipment', parentId: '1500', balance: 175000, isActive: true }
        ]
      }
    ]
  },
  // Liabilities
  {
    id: '2000',
    code: '2000',
    name: 'Liabilities',
    type: 'liability',
    subtype: 'payable',
    description: 'All company liabilities',
    parentId: null,
    balance: 2750000,
    isActive: true,
    children: [
      {
        id: '2100',
        code: '2100',
        name: 'Accounts Payable',
        type: 'liability',
        subtype: 'payable',
        description: 'Money owed to vendors',
        parentId: '2000',
        balance: 85000,
        isActive: true
      },
      {
        id: '2500',
        code: '2500',
        name: 'Long-Term Debt',
        type: 'liability',
        subtype: 'longterm_loan',
        description: 'Mortgages and loans',
        parentId: '2000',
        balance: 2665000,
        isActive: true,
        children: [
          { id: '2510', code: '2510', name: 'Mortgage - Sunrise Apartments', type: 'liability', subtype: 'longterm_loan', description: 'Property mortgage', parentId: '2500', balance: 1500000, isActive: true },
          { id: '2520', code: '2520', name: 'Mortgage - Oak Street Plaza', type: 'liability', subtype: 'longterm_loan', description: 'Property mortgage', parentId: '2500', balance: 1165000, isActive: true }
        ]
      }
    ]
  },
  // Equity
  {
    id: '3000',
    code: '3000',
    name: 'Equity',
    type: 'equity',
    subtype: 'owner_equity',
    description: 'Owner\'s equity',
    parentId: null,
    balance: 2500000,
    isActive: true,
    children: [
      { id: '3100', code: '3100', name: 'Owner\'s Capital', type: 'equity', subtype: 'owner_equity', description: 'Initial investment', parentId: '3000', balance: 2000000, isActive: true },
      { id: '3200', code: '3200', name: 'Retained Earnings', type: 'equity', subtype: 'retained_earnings', description: 'Accumulated profits', parentId: '3000', balance: 500000, isActive: true }
    ]
  },
  // Revenue
  {
    id: '4000',
    code: '4000',
    name: 'Revenue',
    type: 'revenue',
    subtype: 'operating',
    description: 'All revenue accounts',
    parentId: null,
    balance: 850000,
    isActive: true,
    children: [
      { id: '4100', code: '4100', name: 'Rental Income', type: 'revenue', subtype: 'rental', description: 'Property rental revenue', parentId: '4000', balance: 780000, isActive: true },
      { id: '4200', code: '4200', name: 'Management Fees', type: 'revenue', subtype: 'operating', description: 'Property management fees', parentId: '4000', balance: 50000, isActive: true },
      { id: '4300', code: '4300', name: 'Interest Income', type: 'revenue', subtype: 'interest', description: 'Interest earned', parentId: '4000', balance: 20000, isActive: true }
    ]
  },
  // Expenses
  {
    id: '5000',
    code: '5000',
    name: 'Expenses',
    type: 'expense',
    subtype: 'operating',
    description: 'All expense accounts',
    parentId: null,
    balance: 425000,
    isActive: true,
    children: [
      { id: '5100', code: '5100', name: 'Property Expenses', type: 'expense', subtype: 'operating', description: 'Property operating costs', parentId: '5000', balance: 180000, isActive: true },
      { id: '5200', code: '5200', name: 'Administrative Expenses', type: 'expense', subtype: 'operating', description: 'Office and admin costs', parentId: '5000', balance: 95000, isActive: true },
      { id: '5300', code: '5300', name: 'Professional Fees', type: 'expense', subtype: 'professional', description: 'Legal and accounting', parentId: '5000', balance: 75000, isActive: true },
      { id: '5400', code: '5400', name: 'Interest Expense', type: 'expense', subtype: 'interest', description: 'Loan interest', parentId: '5000', balance: 75000, isActive: true }
    ]
  }
];

interface AccountFormData {
  code: string;
  name: string;
  type: string;
  subtype: string;
  description: string;
  parentId: string;
  isActive: boolean;
}

const initialFormData: AccountFormData = {
  code: '',
  name: '',
  type: '',
  subtype: '',
  description: '',
  parentId: '',
  isActive: true
};

export default function ChartOfAccounts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set(['1000', '2000', '3000', '4000', '5000']));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAccounts(mockAccounts);
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

  const toggleExpanded = (accountId: string) => {
    setExpandedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (accts: Account[]) => {
      accts.forEach(a => {
        allIds.add(a.id);
        if (a.children) collectIds(a.children);
      });
    };
    collectIds(accounts);
    setExpandedAccounts(allIds);
  };

  const collapseAll = () => {
    setExpandedAccounts(new Set());
  };

  const getTypeInfo = (type: string) => {
    return ACCOUNT_TYPES.find(t => t.value === type) || ACCOUNT_TYPES[0];
  };

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        code: account.code,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        description: account.description,
        parentId: account.parentId || '',
        isActive: account.isActive
      });
    } else {
      setEditingAccount(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setFormData(initialFormData);
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim() || !formData.type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: 'Success',
        description: editingAccount ? 'Account updated successfully.' : 'Account created successfully.'
      });
      handleCloseModal();
      loadAccounts();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: 'Success',
        description: 'Account deleted successfully.'
      });
      setIsDeleteDialogOpen(false);
      setDeletingAccount(null);
      loadAccounts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account.',
        variant: 'destructive'
      });
    }
  };

  const filterAccounts = (accts: Account[]): Account[] => {
    return accts
      .filter(account => {
        if (typeFilter !== 'all' && account.type !== typeFilter) return false;
        if (searchQuery) {
          const matchesSelf = account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.code.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesChild = account.children?.some(child =>
            child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            child.code.toLowerCase().includes(searchQuery.toLowerCase())
          );
          return matchesSelf || matchesChild;
        }
        return true;
      })
      .map(account => ({
        ...account,
        children: account.children ? filterAccounts(account.children) : undefined
      }));
  };

  const filteredAccounts = filterAccounts(accounts);

  const renderAccountRow = (account: Account, level: number = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedAccounts.has(account.id);
    const typeInfo = getTypeInfo(account.type);
    const IconComponent = typeInfo.icon;

    return (
      <React.Fragment key={account.id}>
        <div
          className={`flex items-center justify-between py-3 px-4 hover:bg-muted/50 border-b ${
            level === 0 ? 'bg-muted/30 font-semibold' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(account.id)}
                className="p-1 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <IconComponent className={`h-4 w-4 ${typeInfo.color}`} />
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{account.code}</code>
            <span className={level === 0 ? '' : 'text-sm'}>{account.name}</span>
            {!account.isActive && (
              <Badge variant="outline" className="text-xs">Inactive</Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-right min-w-[120px] ${level === 0 ? 'font-semibold' : 'text-sm'}`}>
              {formatCurrency(account.balance)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleOpenModal(account)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenModal()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Sub-Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setDeletingAccount(account);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {hasChildren && isExpanded && account.children!.map(child => renderAccountRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const totals = {
    assets: accounts.find(a => a.id === '1000')?.balance || 0,
    liabilities: accounts.find(a => a.id === '2000')?.balance || 0,
    equity: accounts.find(a => a.id === '3000')?.balance || 0,
    revenue: accounts.find(a => a.id === '4000')?.balance || 0,
    expenses: accounts.find(a => a.id === '5000')?.balance || 0
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage your accounting structure</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {ACCOUNT_TYPES.map(type => {
          const IconComponent = type.icon;
          const balance = totals[type.value as keyof typeof totals] || 0;
          return (
            <Card key={type.value}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <IconComponent className={`h-4 w-4 ${type.color}`} />
                  {type.label}
                </CardDescription>
                <CardTitle className="text-xl">
                  {formatCurrency(balance)}
                </CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by account name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ACCOUNT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="outline" onClick={collapseAll}>
                Collapse All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Tree */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b px-4 py-3 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6" />
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Account</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold min-w-[120px] text-right">Balance</span>
              <div className="w-8" />
            </div>
          </div>
          {filteredAccounts.map(account => renderAccountRow(account, 0))}
          {filteredAccounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No accounts found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Update the account details below.' : 'Enter the details for the new account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Account Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., 1100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Cash"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Account Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, subtype: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtype">Subtype</Label>
                <Select
                  value={formData.subtype}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subtype: value }))}
                  disabled={!formData.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subtype" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.type && ACCOUNT_SUBTYPES[formData.type]?.map(sub => (
                      <SelectItem key={sub.value} value={sub.value}>
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Account</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Top Level)</SelectItem>
                  {accounts.map(account => (
                    <React.Fragment key={account.id}>
                      <SelectItem value={account.id}>
                        {account.code} - {account.name}
                      </SelectItem>
                      {account.children?.map(child => (
                        <SelectItem key={child.id} value={child.id}>
                          &nbsp;&nbsp;{child.code} - {child.name}
                        </SelectItem>
                      ))}
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingAccount?.name}"?
              {deletingAccount?.children && deletingAccount.children.length > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This account has {deletingAccount.children.length} sub-accounts that will also be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
