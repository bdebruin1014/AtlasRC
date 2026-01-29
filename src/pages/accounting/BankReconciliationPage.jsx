import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertTriangle, Search, Download, Upload, RefreshCw, Landmark, Calendar, DollarSign, Check, ArrowLeftRight, FileText, Clock, Filter, MoreHorizontal, X, Unlink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const BankReconciliationPage = () => {
  const { toast } = useToast();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('2024-12');
  const [matchingMode, setMatchingMode] = useState(false);
  const [selectedBank, setSelectedBank] = useState([]);
  const [selectedBook, setSelectedBook] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchCounter, setMatchCounter] = useState(1);

  const bankAccounts = [
    { id: 'acct-1', name: 'Operating Account', bank: 'Chase Bank', number: '****4521', balance: 2450000, bookBalance: 2448500, status: 'variance', lastReconciled: '2024-11-30' },
    { id: 'acct-2', name: 'Payroll Account', bank: 'Chase Bank', number: '****7832', balance: 125000, bookBalance: 125000, status: 'matched', lastReconciled: '2024-12-15' },
    { id: 'acct-3', name: 'Construction Account', bank: 'First National', number: '****7891', balance: 1850000, bookBalance: 1847200, status: 'variance', lastReconciled: '2024-12-20' },
    { id: 'acct-4', name: 'Reserve Account', bank: 'Wells Fargo', number: '****3344', balance: 425000, bookBalance: 425000, status: 'matched', lastReconciled: '2024-12-22' },
  ];

  const [bankTransactions, setBankTransactions] = useState([
    { id: 'bt-1', date: '2024-12-28', description: 'Wire Transfer - Rental Income', amount: 145000, type: 'credit', matched: false, ref: 'WT-78451', matchGroup: null },
    { id: 'bt-2', date: '2024-12-27', description: 'Check #5567 - Smith Construction', amount: -85000, type: 'debit', matched: true, ref: 'CHK-5567', matchGroup: 'M1' },
    { id: 'bt-3', date: '2024-12-26', description: 'ACH - Property Tax', amount: -45000, type: 'debit', matched: true, ref: 'ACH-2847', matchGroup: 'M2' },
    { id: 'bt-4', date: '2024-12-24', description: 'Wire - Lot Sale Proceeds', amount: 285000, type: 'credit', matched: false, ref: 'WT-78452', matchGroup: null },
    { id: 'bt-5', date: '2024-12-23', description: 'Check #5568 - Ferguson Supply', amount: -48500, type: 'debit', matched: false, ref: 'CHK-5568', matchGroup: null },
    { id: 'bt-6', date: '2024-12-22', description: 'Bank Fee', amount: -125, type: 'debit', matched: false, ref: 'FEE-1222', matchGroup: null },
    { id: 'bt-7', date: '2024-12-20', description: 'Interest Earned', amount: 847.50, type: 'credit', matched: false, ref: 'INT-1220', matchGroup: null },
  ]);

  const [bookTransactions, setBookTransactions] = useState([
    { id: 'bk-1', date: '2024-12-28', description: 'December Rent Collection', amount: 145000, type: 'credit', matched: false, ref: 'JE-4521', matchGroup: null },
    { id: 'bk-2', date: '2024-12-27', description: 'Smith Construction - Draw #5', amount: -85000, type: 'debit', matched: true, ref: 'AP-2847', matchGroup: 'M1' },
    { id: 'bk-3', date: '2024-12-26', description: 'Property Tax Q4', amount: -45000, type: 'debit', matched: true, ref: 'AP-2848', matchGroup: 'M2' },
    { id: 'bk-4', date: '2024-12-24', description: 'Lot 15 Sale - Sunset Ridge', amount: 285000, type: 'credit', matched: false, ref: 'AR-1542', matchGroup: null },
    { id: 'bk-5', date: '2024-12-23', description: 'Ferguson Supply - Materials', amount: -48500, type: 'debit', matched: false, ref: 'AP-2849', matchGroup: null },
    { id: 'bk-6', date: '2024-12-21', description: 'Insurance Premium', amount: -28500, type: 'debit', matched: false, ref: 'AP-2850', matchGroup: null },
  ]);

  const toggleBankSelection = (id) => {
    setSelectedBank(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleBookSelection = (id) => {
    setSelectedBook(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Calculate totals for selected transactions
  const selectedBankTotal = useMemo(() => {
    return bankTransactions
      .filter(t => selectedBank.includes(t.id))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [selectedBank, bankTransactions]);

  const selectedBookTotal = useMemo(() => {
    return bookTransactions
      .filter(t => selectedBook.includes(t.id))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [selectedBook, bookTransactions]);

  const amountsDifferent = Math.abs(selectedBankTotal - selectedBookTotal) > 0.01;

  const handleMatch = () => {
    if (selectedBank.length === 0 || selectedBook.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Select Transactions',
        description: 'Please select at least one bank and one book transaction to match.',
      });
      return;
    }

    // Validate amounts match
    if (amountsDifferent) {
      toast({
        variant: 'destructive',
        title: 'Amounts Don\'t Match',
        description: `Bank total: $${selectedBankTotal.toLocaleString()} | Book total: $${selectedBookTotal.toLocaleString()}. Amounts must be equal to match.`,
      });
      return;
    }

    // Create match group ID
    const matchGroup = `M${Date.now()}`;

    // Update bank transactions
    setBankTransactions(prev => prev.map(t =>
      selectedBank.includes(t.id)
        ? { ...t, matched: true, matchGroup }
        : t
    ));

    // Update book transactions
    setBookTransactions(prev => prev.map(t =>
      selectedBook.includes(t.id)
        ? { ...t, matched: true, matchGroup }
        : t
    ));

    toast({
      title: 'Transactions Matched',
      description: `Successfully matched ${selectedBank.length} bank and ${selectedBook.length} book transactions.`,
    });

    // Clear selections
    setSelectedBank([]);
    setSelectedBook([]);
    setMatchCounter(prev => prev + 1);
  };

  const handleUnmatch = (matchGroup) => {
    // Unmatch all transactions in the group
    setBankTransactions(prev => prev.map(t =>
      t.matchGroup === matchGroup
        ? { ...t, matched: false, matchGroup: null }
        : t
    ));
    setBookTransactions(prev => prev.map(t =>
      t.matchGroup === matchGroup
        ? { ...t, matched: false, matchGroup: null }
        : t
    ));

    toast({
      title: 'Match Removed',
      description: 'Transactions have been unmatched.',
    });
  };

  const handleAutoMatch = () => {
    const unmatchedBank = bankTransactions.filter(t => !t.matched);
    const unmatchedBook = bookTransactions.filter(t => !t.matched);
    let matchedCount = 0;

    const newBankTransactions = [...bankTransactions];
    const newBookTransactions = [...bookTransactions];

    // Try to match by exact amount and similar date (within 5 days)
    for (const bankTxn of unmatchedBank) {
      const matchingBook = unmatchedBook.find(bookTxn => {
        if (bookTxn.matched) return false;

        // Check amount matches
        if (Math.abs(bankTxn.amount - bookTxn.amount) > 0.01) return false;

        // Check date is within 5 days
        const bankDate = new Date(bankTxn.date);
        const bookDate = new Date(bookTxn.date);
        const daysDiff = Math.abs((bankDate - bookDate) / (1000 * 60 * 60 * 24));
        return daysDiff <= 5;
      });

      if (matchingBook) {
        const matchGroup = `AUTO-${Date.now()}-${matchedCount}`;

        const bankIdx = newBankTransactions.findIndex(t => t.id === bankTxn.id);
        const bookIdx = newBookTransactions.findIndex(t => t.id === matchingBook.id);

        newBankTransactions[bankIdx] = { ...newBankTransactions[bankIdx], matched: true, matchGroup };
        newBookTransactions[bookIdx] = { ...newBookTransactions[bookIdx], matched: true, matchGroup };

        // Mark as matched in our loop check
        unmatchedBook.find(t => t.id === matchingBook.id).matched = true;
        matchedCount++;
      }
    }

    if (matchedCount > 0) {
      setBankTransactions(newBankTransactions);
      setBookTransactions(newBookTransactions);
      toast({
        title: 'Auto-Match Complete',
        description: `Successfully auto-matched ${matchedCount} transaction pair(s).`,
      });
    } else {
      toast({
        title: 'No Matches Found',
        description: 'No transactions could be automatically matched. Try manual matching.',
      });
    }
  };

  const handleCompleteReconciliation = () => {
    const currentVariance = selectedAccount ? selectedAccount.balance - selectedAccount.bookBalance : 0;
    const unmatchedBankCount = bankTransactions.filter(t => !t.matched).length;
    const unmatchedBookCount = bookTransactions.filter(t => !t.matched).length;

    if (unmatchedBankCount > 0 || unmatchedBookCount > 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Complete',
        description: `There are ${unmatchedBankCount} unmatched bank and ${unmatchedBookCount} unmatched book transactions.`,
      });
      return;
    }

    toast({
      title: 'Reconciliation Complete',
      description: `${selectedAccount.name} has been reconciled for ${selectedPeriod}.`,
    });
  };

  const unmatchedBankTotal = bankTransactions.filter(t => !t.matched).reduce((sum, t) => sum + t.amount, 0);
  const unmatchedBookTotal = bookTransactions.filter(t => !t.matched).reduce((sum, t) => sum + t.amount, 0);
  const variance = selectedAccount ? selectedAccount.balance - selectedAccount.bookBalance : 0;

  return (
    <div className="flex h-full">
      {/* Left Panel - Account List */}
      <div className="w-72 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-3">Bank Accounts</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search accounts..." className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={cn(
                "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                selectedAccount?.id === account.id && "bg-green-50 border-l-4 border-l-[#047857]"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-medium text-sm">{account.name}</p>
                  <p className="text-xs text-gray-500">{account.bank} {account.number}</p>
                </div>
                {account.status === 'variance' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Bank Balance:</span>
                  <span className="font-medium">${account.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Book Balance:</span>
                  <span className="font-medium">${account.bookBalance.toLocaleString()}</span>
                </div>
                {account.balance !== account.bookBalance && (
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-600">Variance:</span>
                    <span className="font-medium text-amber-600">${(account.balance - account.bookBalance).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Reconciliation Workspace */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedAccount ? (
          <>
            {/* Header */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{selectedAccount.name}</h2>
                  <p className="text-sm text-gray-500">{selectedAccount.bank} • {selectedAccount.number}</p>
                </div>
                <div className="flex gap-2">
                  <select className="border rounded-md px-3 py-1.5 text-sm" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                    <option value="2024-12">December 2024</option>
                    <option value="2024-11">November 2024</option>
                    <option value="2024-10">October 2024</option>
                  </select>
                  <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1" />Import Statement</Button>
                  <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Bank Balance</p>
                  <p className="text-lg font-semibold text-blue-700">${(selectedAccount.balance / 1000).toFixed(1)}K</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Book Balance</p>
                  <p className="text-lg font-semibold text-purple-700">${(selectedAccount.bookBalance / 1000).toFixed(1)}K</p>
                </div>
                <div className={cn("rounded-lg p-3 text-center", variance === 0 ? "bg-green-50" : "bg-amber-50")}>
                  <p className="text-xs text-gray-500">Variance</p>
                  <p className={cn("text-lg font-semibold", variance === 0 ? "text-green-700" : "text-amber-700")}>
                    ${Math.abs(variance).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Unmatched Bank</p>
                  <p className="text-lg font-semibold">{bankTransactions.filter(t => !t.matched).length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Unmatched Book</p>
                  <p className="text-lg font-semibold">{bookTransactions.filter(t => !t.matched).length}</p>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white border-b px-4 py-2 flex items-center gap-3">
              <Button
                variant={matchingMode ? "default" : "outline"}
                size="sm"
                className={matchingMode ? "bg-[#047857] hover:bg-[#065f46]" : ""}
                onClick={() => setMatchingMode(!matchingMode)}
              >
                <ArrowLeftRight className="w-4 h-4 mr-1" />Match Mode
              </Button>
              {matchingMode && (selectedBank.length > 0 || selectedBook.length > 0) && (
                <div className="flex items-center gap-2">
                  {selectedBank.length > 0 && selectedBook.length > 0 && (
                    <div className={cn(
                      "text-xs px-2 py-1 rounded",
                      amountsDifferent ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    )}>
                      Bank: ${selectedBankTotal.toLocaleString()} | Book: ${selectedBookTotal.toLocaleString()}
                      {amountsDifferent ? " (mismatch)" : " ✓"}
                    </div>
                  )}
                  <Button
                    size="sm"
                    className={cn(
                      selectedBank.length > 0 && selectedBook.length > 0 && !amountsDifferent
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400"
                    )}
                    onClick={handleMatch}
                    disabled={selectedBank.length === 0 || selectedBook.length === 0 || amountsDifferent}
                  >
                    <Check className="w-4 h-4 mr-1" />Match Selected ({selectedBank.length} + {selectedBook.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setSelectedBank([]); setSelectedBook([]); }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex-1" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search transactions..." className="pl-9 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter</Button>
              <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4" /></Button>
            </div>

            {/* Split Transaction View */}
            <div className="flex-1 flex overflow-hidden">
              {/* Bank Transactions */}
              <div className="flex-1 border-r flex flex-col">
                <div className="bg-blue-50 px-4 py-2 border-b flex items-center justify-between">
                  <span className="font-medium text-sm text-blue-800">Bank Statement</span>
                  <span className="text-xs text-blue-600">{bankTransactions.length} transactions</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {bankTransactions.map((txn) => (
                    <div
                      key={txn.id}
                      onClick={() => matchingMode && !txn.matched && toggleBankSelection(txn.id)}
                      className={cn(
                        "p-3 border-b hover:bg-gray-50 transition-colors",
                        txn.matched && "bg-green-50 opacity-60",
                        selectedBank.includes(txn.id) && "bg-blue-100 border-l-4 border-l-blue-500",
                        matchingMode && !txn.matched && "cursor-pointer"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{txn.date}</span>
                            <span className="text-xs font-mono text-gray-400">{txn.ref}</span>
                            {txn.matched && (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                <CheckCircle className="w-3 h-3" />
                                {txn.matchGroup}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium mt-1">{txn.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-semibold", txn.amount > 0 ? "text-green-600" : "text-gray-900")}>
                            {txn.amount > 0 ? '+' : ''}{txn.amount < 0 ? '-' : ''}${Math.abs(txn.amount).toLocaleString()}
                          </span>
                          {txn.matched && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUnmatch(txn.matchGroup); }}
                              className="p-1 hover:bg-red-100 rounded"
                              title="Unmatch"
                            >
                              <Unlink className="w-3 h-3 text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 px-4 py-2 border-t flex justify-between text-sm">
                  <span className="text-blue-600">Unmatched Total:</span>
                  <span className="font-semibold text-blue-800">${unmatchedBankTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Book Transactions */}
              <div className="flex-1 flex flex-col">
                <div className="bg-purple-50 px-4 py-2 border-b flex items-center justify-between">
                  <span className="font-medium text-sm text-purple-800">Book Entries</span>
                  <span className="text-xs text-purple-600">{bookTransactions.length} transactions</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {bookTransactions.map((txn) => (
                    <div
                      key={txn.id}
                      onClick={() => matchingMode && !txn.matched && toggleBookSelection(txn.id)}
                      className={cn(
                        "p-3 border-b hover:bg-gray-50 transition-colors",
                        txn.matched && "bg-green-50 opacity-60",
                        selectedBook.includes(txn.id) && "bg-purple-100 border-l-4 border-l-purple-500",
                        matchingMode && !txn.matched && "cursor-pointer"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{txn.date}</span>
                            <span className="text-xs font-mono text-gray-400">{txn.ref}</span>
                            {txn.matched && (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                <CheckCircle className="w-3 h-3" />
                                {txn.matchGroup}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium mt-1">{txn.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-semibold", txn.amount > 0 ? "text-green-600" : "text-gray-900")}>
                            {txn.amount > 0 ? '+' : ''}{txn.amount < 0 ? '-' : ''}${Math.abs(txn.amount).toLocaleString()}
                          </span>
                          {txn.matched && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUnmatch(txn.matchGroup); }}
                              className="p-1 hover:bg-red-100 rounded"
                              title="Unmatch"
                            >
                              <Unlink className="w-3 h-3 text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-50 px-4 py-2 border-t flex justify-between text-sm">
                  <span className="text-purple-600">Unmatched Total:</span>
                  <span className="font-semibold text-purple-800">${unmatchedBookTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t p-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                Last reconciled: {selectedAccount.lastReconciled}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleAutoMatch}>
                  <Zap className="w-4 h-4 mr-1" />Auto-Match
                </Button>
                <Button
                  className="bg-[#047857] hover:bg-[#065f46]"
                  onClick={handleCompleteReconciliation}
                  disabled={bankTransactions.some(t => !t.matched) || bookTransactions.some(t => !t.matched)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />Complete Reconciliation
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a bank account to begin reconciliation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankReconciliationPage;
