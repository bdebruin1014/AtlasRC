import React, { useState } from 'react';
import { RefreshCw, Plus, Calendar, Clock, Play, Pause, Edit2, Trash2, Copy, CheckCircle, AlertTriangle, X, ChevronDown, Filter, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const RecurringJournalEntriesPage = () => {
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);
  const [entryToExecute, setEntryToExecute] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [runningAll, setRunningAll] = useState(false);
  const [executionDate, setExecutionDate] = useState(new Date().toISOString().split('T')[0]);

  const [recurringEntries, setRecurringEntries] = useState([
    {
      id: 'rje-1',
      name: 'Monthly Depreciation',
      frequency: 'monthly',
      dayOfMonth: 1,
      nextRun: '2025-01-01',
      lastRun: '2024-12-01',
      status: 'active',
      amount: 12500,
      entity: 'VanRock Development',
      description: 'Monthly depreciation of fixed assets',
      lines: [
        { account: '6100 - Depreciation Expense', debit: 12500, credit: 0 },
        { account: '1550 - Accumulated Depreciation', debit: 0, credit: 12500 },
      ],
      runCount: 24,
      createdBy: 'John Smith',
    },
    {
      id: 'rje-2',
      name: 'Loan Interest Accrual',
      frequency: 'monthly',
      dayOfMonth: 15,
      nextRun: '2025-01-15',
      lastRun: '2024-12-15',
      status: 'active',
      amount: 28500,
      entity: 'Watson Project SPE',
      description: 'Accrue construction loan interest',
      lines: [
        { account: '6200 - Interest Expense', debit: 28500, credit: 0 },
        { account: '2100 - Accrued Interest Payable', debit: 0, credit: 28500 },
      ],
      runCount: 18,
      createdBy: 'Sarah Johnson',
    },
    {
      id: 'rje-3',
      name: 'Management Fee Allocation',
      frequency: 'monthly',
      dayOfMonth: 1,
      nextRun: '2025-01-01',
      lastRun: '2024-12-01',
      status: 'active',
      amount: 15000,
      entity: 'Sunset Ridge SPE',
      description: 'Monthly management fee from parent company',
      lines: [
        { account: '6300 - Management Fees', debit: 15000, credit: 0 },
        { account: '2150 - Due to Parent', debit: 0, credit: 15000 },
      ],
      runCount: 12,
      createdBy: 'John Smith',
    },
    {
      id: 'rje-4',
      name: 'Property Insurance',
      frequency: 'monthly',
      dayOfMonth: 1,
      nextRun: '2025-01-01',
      lastRun: '2024-12-01',
      status: 'active',
      amount: 8500,
      entity: 'All Entities',
      description: 'Amortize prepaid insurance',
      lines: [
        { account: '6400 - Insurance Expense', debit: 8500, credit: 0 },
        { account: '1350 - Prepaid Insurance', debit: 0, credit: 8500 },
      ],
      runCount: 36,
      createdBy: 'Mike Davis',
    },
    {
      id: 'rje-5',
      name: 'Quarterly Tax Accrual',
      frequency: 'quarterly',
      dayOfMonth: 1,
      nextRun: '2025-01-01',
      lastRun: '2024-10-01',
      status: 'active',
      amount: 45000,
      entity: 'VanRock Development',
      description: 'Quarterly property tax accrual',
      lines: [
        { account: '6500 - Property Tax Expense', debit: 45000, credit: 0 },
        { account: '2200 - Property Tax Payable', debit: 0, credit: 45000 },
      ],
      runCount: 8,
      createdBy: 'John Smith',
    },
    {
      id: 'rje-6',
      name: 'Annual License Fees',
      frequency: 'yearly',
      dayOfMonth: 1,
      nextRun: '2025-01-01',
      lastRun: '2024-01-01',
      status: 'paused',
      amount: 5000,
      entity: 'VanRock Development',
      description: 'Annual state license fees',
      lines: [
        { account: '6600 - License & Permit Expense', debit: 5000, credit: 0 },
        { account: '1000 - Cash', debit: 0, credit: 5000 },
      ],
      runCount: 3,
      createdBy: 'Sarah Johnson',
    },
  ]);

  // Execute a single recurring entry
  const handleExecuteEntry = async () => {
    if (!entryToExecute) return;

    setExecuting(true);
    try {
      // Simulate API call to create journal entry
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the entry's lastRun and calculate next run
      setRecurringEntries(prev => prev.map(entry => {
        if (entry.id !== entryToExecute.id) return entry;

        const nextRun = calculateNextRun(entry.frequency, executionDate);
        return {
          ...entry,
          lastRun: executionDate,
          nextRun: nextRun,
          runCount: entry.runCount + 1,
        };
      }));

      toast({
        title: 'Entry Executed',
        description: `Created journal entry for "${entryToExecute.name}" - $${entryToExecute.amount.toLocaleString()}`,
      });

      setShowExecuteDialog(false);
      setEntryToExecute(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Execution Failed',
        description: error.message || 'Failed to execute recurring entry.',
      });
    } finally {
      setExecuting(false);
    }
  };

  // Execute all due entries
  const handleRunAllDue = async () => {
    const today = new Date().toISOString().split('T')[0];
    const dueEntries = recurringEntries.filter(e =>
      e.status === 'active' && e.nextRun <= today
    );

    if (dueEntries.length === 0) {
      toast({
        title: 'No Due Entries',
        description: 'There are no recurring entries due to run today.',
      });
      return;
    }

    setRunningAll(true);
    try {
      // Simulate running all entries
      await new Promise(resolve => setTimeout(resolve, 1500));

      setRecurringEntries(prev => prev.map(entry => {
        if (entry.status !== 'active' || entry.nextRun > today) return entry;

        const nextRun = calculateNextRun(entry.frequency, today);
        return {
          ...entry,
          lastRun: today,
          nextRun: nextRun,
          runCount: entry.runCount + 1,
        };
      }));

      toast({
        title: 'All Due Entries Executed',
        description: `Successfully ran ${dueEntries.length} recurring entries.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Execution Failed',
        description: 'Some entries failed to execute.',
      });
    } finally {
      setRunningAll(false);
    }
  };

  // Calculate next run date based on frequency
  const calculateNextRun = (frequency, currentDate) => {
    const date = new Date(currentDate);
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().split('T')[0];
  };

  // Toggle entry status (pause/resume)
  const toggleEntryStatus = (entryId) => {
    setRecurringEntries(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, status: entry.status === 'active' ? 'paused' : 'active' }
        : entry
    ));

    const entry = recurringEntries.find(e => e.id === entryId);
    toast({
      title: entry?.status === 'active' ? 'Entry Paused' : 'Entry Resumed',
      description: `"${entry?.name}" has been ${entry?.status === 'active' ? 'paused' : 'resumed'}.`,
    });
  };

  // Delete entry
  const deleteEntry = (entryId) => {
    const entry = recurringEntries.find(e => e.id === entryId);
    if (confirm(`Are you sure you want to delete "${entry?.name}"?`)) {
      setRecurringEntries(prev => prev.filter(e => e.id !== entryId));
      toast({
        title: 'Entry Deleted',
        description: `"${entry?.name}" has been removed.`,
      });
    }
  };

  // Duplicate entry
  const duplicateEntry = (entry) => {
    const newEntry = {
      ...entry,
      id: `rje-${Date.now()}`,
      name: `${entry.name} (Copy)`,
      runCount: 0,
      createdBy: 'Current User',
    };
    setRecurringEntries(prev => [newEntry, ...prev]);
    toast({
      title: 'Entry Duplicated',
      description: `Created copy of "${entry.name}".`,
    });
  };

  const getFrequencyLabel = (freq) => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      default: return freq;
    }
  };

  const getFrequencyColor = (freq) => {
    switch (freq) {
      case 'daily': return 'bg-red-100 text-red-700';
      case 'weekly': return 'bg-orange-100 text-orange-700';
      case 'monthly': return 'bg-blue-100 text-blue-700';
      case 'quarterly': return 'bg-purple-100 text-purple-700';
      case 'yearly': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredEntries = recurringEntries.filter(entry => {
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = recurringEntries.filter(e => e.status === 'active').length;
  const pausedCount = recurringEntries.filter(e => e.status === 'paused').length;
  const totalMonthlyAmount = recurringEntries
    .filter(e => e.status === 'active')
    .reduce((sum, e) => {
      if (e.frequency === 'monthly') return sum + e.amount;
      if (e.frequency === 'quarterly') return sum + (e.amount / 3);
      if (e.frequency === 'yearly') return sum + (e.amount / 12);
      return sum;
    }, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Recurring Journal Entries</h1>
            <p className="text-sm text-gray-500">Automate repetitive journal entries</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRunAllDue} disabled={runningAll}>
              {runningAll ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Running...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-1" />Run All Due</>
              )}
            </Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-1" />New Recurring Entry
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Total Templates</p>
            <p className="text-2xl font-bold text-blue-700">{recurringEntries.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-700">{activeCount}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Paused</p>
            <p className="text-2xl font-bold text-amber-700">{pausedCount}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Monthly Impact</p>
            <p className="text-2xl font-bold text-purple-700">${(totalMonthlyAmount / 1000).toFixed(0)}K</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search recurring entries..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {['all', 'active', 'paused'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-3 py-1 rounded text-sm capitalize",
                filterStatus === status ? "bg-gray-200" : "hover:bg-gray-100"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "bg-white border rounded-lg overflow-hidden",
                entry.status === 'paused' && "opacity-60"
              )}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      entry.status === 'active' ? "bg-green-100" : "bg-gray-100"
                    )}>
                      {entry.status === 'active' ? (
                        <RefreshCw className="w-5 h-5 text-green-600" />
                      ) : (
                        <Pause className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{entry.name}</h3>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getFrequencyColor(entry.frequency))}>
                          {getFrequencyLabel(entry.frequency)}
                        </span>
                        {entry.status === 'active' ? (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">Paused</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next: {entry.nextRun}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last: {entry.lastRun}
                        </span>
                        <span>Entity: {entry.entity}</span>
                        <span>Run {entry.runCount} times</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">${entry.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">per occurrence</p>
                  </div>
                </div>

                {/* Entry Lines Preview */}
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500">
                        <th className="text-left pb-2">Account</th>
                        <th className="text-right pb-2">Debit</th>
                        <th className="text-right pb-2">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.lines.map((line, idx) => (
                        <tr key={idx}>
                          <td className="py-1">{line.account}</td>
                          <td className="py-1 text-right">{line.debit > 0 ? `$${line.debit.toLocaleString()}` : '-'}</td>
                          <td className="py-1 text-right">{line.credit > 0 ? `$${line.credit.toLocaleString()}` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-gray-500">Created by {entry.createdBy}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEntryToExecute(entry); setShowExecuteDialog(true); }}
                      disabled={entry.status !== 'active'}
                    >
                      <Play className="w-4 h-4 mr-1" />Run Now
                    </Button>
                    {entry.status === 'active' ? (
                      <Button variant="outline" size="sm" onClick={() => toggleEntryStatus(entry.id)}>
                        <Pause className="w-4 h-4 mr-1" />Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => toggleEntryStatus(entry.id)}>
                        <Play className="w-4 h-4 mr-1" />Resume
                      </Button>
                    )}
                    <Button variant="outline" size="sm"><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => duplicateEntry(entry)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Create Recurring Journal Entry</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Entry Name *</label>
                <Input placeholder="e.g., Monthly Depreciation" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Frequency *</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Day of Month *</label>
                  <Input type="number" min="1" max="31" placeholder="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Start Date *</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">End Date (Optional)</label>
                  <Input type="date" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Entity *</label>
                <select className="w-full border rounded-md px-3 py-2">
                  <option value="">Select entity...</option>
                  <option value="vanrock">VanRock Development</option>
                  <option value="watson">Watson Project SPE</option>
                  <option value="sunset">Sunset Ridge SPE</option>
                  <option value="all">All Entities</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea className="w-full border rounded-md px-3 py-2 h-20" placeholder="Describe this recurring entry..." />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Journal Entry Lines *</label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2">Account</th>
                        <th className="text-right px-3 py-2 w-32">Debit</th>
                        <th className="text-right px-3 py-2 w-32">Credit</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-3 py-2">
                          <select className="w-full border rounded px-2 py-1">
                            <option value="">Select account...</option>
                            <option value="6100">6100 - Depreciation Expense</option>
                            <option value="6200">6200 - Interest Expense</option>
                          </select>
                        </td>
                        <td className="px-3 py-2"><Input type="number" placeholder="0.00" className="text-right" /></td>
                        <td className="px-3 py-2"><Input type="number" placeholder="0.00" className="text-right" /></td>
                        <td className="px-3 py-2"><Button variant="ghost" size="sm"><Trash2 className="w-4 h-4" /></Button></td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-3 py-2">
                          <select className="w-full border rounded px-2 py-1">
                            <option value="">Select account...</option>
                            <option value="1550">1550 - Accumulated Depreciation</option>
                            <option value="2100">2100 - Accrued Interest Payable</option>
                          </select>
                        </td>
                        <td className="px-3 py-2"><Input type="number" placeholder="0.00" className="text-right" /></td>
                        <td className="px-3 py-2"><Input type="number" placeholder="0.00" className="text-right" /></td>
                        <td className="px-3 py-2"><Button variant="ghost" size="sm"><Trash2 className="w-4 h-4" /></Button></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="px-3 py-2 border-t bg-gray-50">
                    <Button variant="ghost" size="sm"><Plus className="w-4 h-4 mr-1" />Add Line</Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Create Recurring Entry</Button>
            </div>
          </div>
        </div>
      )}

      {/* Execute Dialog */}
      <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              Run Recurring Entry
            </DialogTitle>
            <DialogDescription>
              Create a journal entry from this recurring template
            </DialogDescription>
          </DialogHeader>

          {entryToExecute && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Template:</span>
                  <span className="font-medium">{entryToExecute.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Entity:</span>
                  <span>{entryToExecute.entity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-semibold">${entryToExecute.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Run:</span>
                  <span>{entryToExecute.lastRun}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Entry Date</label>
                <Input
                  type="date"
                  value={executionDate}
                  onChange={(e) => setExecutionDate(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Entry Lines</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="text-left pb-1">Account</th>
                      <th className="text-right pb-1">Debit</th>
                      <th className="text-right pb-1">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entryToExecute.lines.map((line, idx) => (
                      <tr key={idx} className="text-blue-700">
                        <td className="py-1">{line.account}</td>
                        <td className="py-1 text-right">{line.debit > 0 ? `$${line.debit.toLocaleString()}` : '-'}</td>
                        <td className="py-1 text-right">{line.credit > 0 ? `$${line.credit.toLocaleString()}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExecuteDialog(false)} disabled={executing}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleExecuteEntry}
              disabled={executing}
            >
              {executing ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Creating...</>
              ) : (
                <><CheckCircle className="w-4 h-4 mr-1" />Create Journal Entry</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecurringJournalEntriesPage;
