import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Filter, CheckCircle, XCircle, Split, Link2,
  MoreHorizontal, RefreshCw, Download, Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import * as bankService from '@/services/bankAccountsService';
import { CategorizeTransactionModal } from './CategorizeTransactionModal';
import { SplitTransactionModal } from './SplitTransactionModal';
import { MatchTransactionModal } from './MatchTransactionModal';

const STATUS_COLORS = {
  unmatched: 'bg-yellow-100 text-yellow-800',
  matched: 'bg-green-100 text-green-800',
  excluded: 'bg-gray-100 text-gray-800',
  split: 'bg-blue-100 text-blue-800'
};

export default function BankTransactionsPage() {
  const { entityId, bankAccountId } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCategorizeModal, setShowCategorizeModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { data: bankAccount } = useQuery({
    queryKey: ['bank-account', bankAccountId],
    queryFn: () => bankService.getBankAccount(bankAccountId)
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['bank-transactions', bankAccountId, statusFilter],
    queryFn: () => bankService.getBankTransactions(bankAccountId, {
      matchStatus: statusFilter !== 'all' ? statusFilter : undefined
    })
  });

  const autoMatchMutation = useMutation({
    mutationFn: () => bankService.applyMatchingRules(entityId, bankAccountId),
    onSuccess: (result) => {
      queryClient.invalidateQueries(['bank-transactions', bankAccountId]);
      toast({ title: "Success", description: `Matched ${result.matched} of ${result.total} transactions` });
    }
  });

  const excludeMutation = useMutation({
    mutationFn: (id) => bankService.excludeTransaction(id),
    onSuccess: () => queryClient.invalidateQueries(['bank-transactions', bankAccountId])
  });

  const filteredTransactions = search
    ? transactions.filter(t =>
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.plaid_merchant_name?.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const handleCategorize = (transaction) => {
    setSelectedTransaction(transaction);
    setShowCategorizeModal(true);
  };

  const handleSplit = (transaction) => {
    setSelectedTransaction(transaction);
    setShowSplitModal(true);
  };

  const handleMatch = (transaction) => {
    setSelectedTransaction(transaction);
    setShowMatchModal(true);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  const unmatchedCount = transactions.filter(t => t.match_status === 'unmatched').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bank Transactions</h1>
          <p className="text-muted-foreground">
            {bankAccount?.account_name} • {transactions.length} transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => autoMatchMutation.mutate()}
            disabled={autoMatchMutation.isPending}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Auto-Match ({unmatchedCount})
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unmatched">Unmatched</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="excluded">Excluded</SelectItem>
            <SelectItem value="split">Split</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-muted rounded-lg">
          <span className="text-sm">{selectedIds.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => setShowCategorizeModal(true)}>
            Categorize
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
            Clear
          </Button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0}
                  onCheckedChange={selectAll}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((txn) => (
              <TableRow key={txn.id} className={cn(txn.is_reconciled && 'bg-green-50')}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(txn.id)}
                    onCheckedChange={() => toggleSelect(txn.id)}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(txn.transaction_date)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{txn.plaid_merchant_name || txn.description}</p>
                    {txn.plaid_merchant_name && txn.description !== txn.plaid_merchant_name && (
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {txn.original_description || txn.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {txn.account ? (
                    <span className="text-sm">
                      {txn.account.account_number} - {txn.account.account_name}
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600"
                      onClick={() => handleCategorize(txn)}
                    >
                      + Categorize
                    </Button>
                  )}
                </TableCell>
                <TableCell className={cn(
                  "text-right font-medium",
                  txn.amount >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[txn.match_status]}>
                    {txn.match_status}
                  </Badge>
                  {txn.is_reconciled && (
                    <Badge variant="outline" className="ml-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Reconciled
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleCategorize(txn)}>
                        Categorize
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMatch(txn)}>
                        <Link2 className="h-4 w-4 mr-2" />
                        Match to Bill/Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSplit(txn)}>
                        <Split className="h-4 w-4 mr-2" />
                        Split Transaction
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => excludeMutation.mutate(txn.id)}
                        className="text-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Exclude
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <CategorizeTransactionModal
        open={showCategorizeModal}
        onClose={() => { setShowCategorizeModal(false); setSelectedTransaction(null); }}
        transaction={selectedTransaction}
        entityId={entityId}
        transactionIds={selectedIds.length > 0 ? selectedIds : undefined}
      />

      <SplitTransactionModal
        open={showSplitModal}
        onClose={() => { setShowSplitModal(false); setSelectedTransaction(null); }}
        transaction={selectedTransaction}
        entityId={entityId}
      />

      <MatchTransactionModal
        open={showMatchModal}
        onClose={() => { setShowMatchModal(false); setSelectedTransaction(null); }}
        transaction={selectedTransaction}
        entityId={entityId}
      />
    </div>
  );
}
