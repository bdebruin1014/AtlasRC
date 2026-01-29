import React, { useState } from 'react';
import {
  Lock, Unlock, Calendar, AlertTriangle, CheckCircle, Clock,
  Shield, FileText, ChevronRight, History, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PeriodLockPage = () => {
  const { toast } = useToast();
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [unlockReason, setUnlockReason] = useState('');

  const [periods, setPeriods] = useState([
    { year: 2024, month: 12, status: 'open', transactions: 156, balance: 2450000 },
    { year: 2024, month: 11, status: 'locked', lockedAt: '2024-12-05', lockedBy: 'John Smith', transactions: 143, balance: 2380000 },
    { year: 2024, month: 10, status: 'locked', lockedAt: '2024-11-03', lockedBy: 'John Smith', transactions: 128, balance: 2250000 },
    { year: 2024, month: 9, status: 'locked', lockedAt: '2024-10-04', lockedBy: 'Sarah Johnson', transactions: 135, balance: 2180000 },
    { year: 2024, month: 8, status: 'closed', closedAt: '2024-09-02', closedBy: 'John Smith', transactions: 142, balance: 2100000 },
    { year: 2024, month: 7, status: 'closed', closedAt: '2024-08-03', closedBy: 'John Smith', transactions: 118, balance: 2050000 },
    { year: 2024, month: 6, status: 'closed', closedAt: '2024-07-05', closedBy: 'Sarah Johnson', transactions: 125, balance: 1980000 },
  ]);

  const [lockChecklist, setLockChecklist] = useState({
    reconciled: false,
    reviewed: false,
    adjustments: false,
    backup: false,
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'open':
        return { icon: Unlock, color: 'text-green-600', bg: 'bg-green-100', label: 'Open' };
      case 'locked':
        return { icon: Lock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Locked' };
      case 'closed':
        return { icon: Shield, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Closed' };
      default:
        return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Unknown' };
    }
  };

  const canLockPeriod = (period) => {
    // Can only lock if all previous periods are locked/closed
    const priorPeriods = periods.filter(p =>
      p.year < period.year || (p.year === period.year && p.month < period.month)
    );
    return priorPeriods.every(p => p.status !== 'open') && period.status === 'open';
  };

  const handleLockPeriod = () => {
    if (!Object.values(lockChecklist).every(Boolean)) {
      toast({
        variant: 'destructive',
        title: 'Checklist Incomplete',
        description: 'Please complete all checklist items before locking the period.',
      });
      return;
    }

    setPeriods(prev => prev.map(p =>
      p.year === selectedPeriod.year && p.month === selectedPeriod.month
        ? {
            ...p,
            status: 'locked',
            lockedAt: new Date().toISOString().split('T')[0],
            lockedBy: 'Current User',
          }
        : p
    ));

    toast({
      title: 'Period Locked',
      description: `${months[selectedPeriod.month - 1]} ${selectedPeriod.year} has been locked. New transactions are blocked.`,
    });

    setShowLockDialog(false);
    setSelectedPeriod(null);
    setLockChecklist({ reconciled: false, reviewed: false, adjustments: false, backup: false });
  };

  const handleUnlockPeriod = () => {
    if (!unlockReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason Required',
        description: 'Please provide a reason for unlocking this period.',
      });
      return;
    }

    setPeriods(prev => prev.map(p =>
      p.year === selectedPeriod.year && p.month === selectedPeriod.month
        ? {
            ...p,
            status: 'open',
            lockedAt: null,
            lockedBy: null,
            lastUnlockedAt: new Date().toISOString(),
            unlockReason: unlockReason,
          }
        : p
    ));

    toast({
      title: 'Period Unlocked',
      description: `${months[selectedPeriod.month - 1]} ${selectedPeriod.year} has been unlocked for adjustments.`,
    });

    setShowUnlockDialog(false);
    setSelectedPeriod(null);
    setUnlockReason('');
  };

  const openPeriod = periods.find(p => p.status === 'open');
  const lockedPeriods = periods.filter(p => p.status === 'locked').length;
  const closedPeriods = periods.filter(p => p.status === 'closed').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Period Lock / Month-End Close</h1>
          <p className="text-gray-600">Manage accounting periods and prevent changes to closed months</p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />Lock Settings
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Unlock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {openPeriod ? `${months[openPeriod.month - 1].slice(0, 3)} ${openPeriod.year}` : 'None'}
              </p>
              <p className="text-sm text-gray-600">Current Open Period</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lockedPeriods}</p>
              <p className="text-sm text-gray-600">Locked Periods</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{closedPeriods}</p>
              <p className="text-sm text-gray-600">Permanently Closed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{openPeriod?.transactions || 0}</p>
              <p className="text-sm text-gray-600">Pending Transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold">Accounting Periods</h2>
        </div>
        <div className="divide-y">
          {periods.map((period) => {
            const config = getStatusConfig(period.status);
            const StatusIcon = config.icon;
            const canLock = canLockPeriod(period);

            return (
              <div
                key={`${period.year}-${period.month}`}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", config.bg)}>
                    <StatusIcon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {months[period.month - 1]} {period.year}
                    </p>
                    <p className="text-sm text-gray-500">
                      {period.transactions} transactions • ${(period.balance / 1000).toFixed(0)}K balance
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={cn("px-3 py-1 rounded-full text-sm", config.bg, config.color)}>
                    {config.label}
                  </span>

                  {period.status === 'open' && canLock && (
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={() => { setSelectedPeriod(period); setShowLockDialog(true); }}
                    >
                      <Lock className="w-4 h-4 mr-1" />Lock Period
                    </Button>
                  )}

                  {period.status === 'locked' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Locked {period.lockedAt} by {period.lockedBy}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedPeriod(period); setShowUnlockDialog(true); }}
                      >
                        <Unlock className="w-4 h-4 mr-1" />Unlock
                      </Button>
                    </div>
                  )}

                  {period.status === 'closed' && (
                    <span className="text-xs text-gray-500">
                      Closed {period.closedAt} by {period.closedBy}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lock Period Dialog */}
      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Lock Period
            </DialogTitle>
            <DialogDescription>
              Locking {selectedPeriod && `${months[selectedPeriod.month - 1]} ${selectedPeriod.year}`} will prevent any new transactions from being posted to this period.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-3">Month-End Checklist</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={lockChecklist.reconciled}
                    onChange={(e) => setLockChecklist(prev => ({ ...prev, reconciled: e.target.checked }))}
                  />
                  <span className="text-sm text-amber-700">All bank accounts reconciled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={lockChecklist.reviewed}
                    onChange={(e) => setLockChecklist(prev => ({ ...prev, reviewed: e.target.checked }))}
                  />
                  <span className="text-sm text-amber-700">Financial statements reviewed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={lockChecklist.adjustments}
                    onChange={(e) => setLockChecklist(prev => ({ ...prev, adjustments: e.target.checked }))}
                  />
                  <span className="text-sm text-amber-700">All adjusting entries posted</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={lockChecklist.backup}
                    onChange={(e) => setLockChecklist(prev => ({ ...prev, backup: e.target.checked }))}
                  />
                  <span className="text-sm text-amber-700">Backup created</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <p><strong>Note:</strong> Locked periods can be unlocked by administrators if adjustments are needed. Use the "Close Period" option for permanent closure.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLockDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleLockPeriod}
              disabled={!Object.values(lockChecklist).every(Boolean)}
            >
              <Lock className="w-4 h-4 mr-1" />Lock Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlock Period Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-green-500" />
              Unlock Period
            </DialogTitle>
            <DialogDescription>
              Unlocking {selectedPeriod && `${months[selectedPeriod.month - 1]} ${selectedPeriod.year}`} will allow new transactions to be posted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Unlocking a closed period should only be done for corrections. All changes will be logged in the audit trail.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Reason for unlocking *</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm"
                rows={3}
                placeholder="Explain why this period needs to be unlocked..."
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowUnlockDialog(false); setUnlockReason(''); }}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleUnlockPeriod}
            >
              <Unlock className="w-4 h-4 mr-1" />Unlock Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PeriodLockPage;
