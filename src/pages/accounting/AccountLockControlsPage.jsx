import React, { useState, useMemo } from 'react';
import {
  Lock, Unlock, Shield, Calendar, AlertTriangle, CheckCircle,
  Clock, User, Building, FileText, History, Settings, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * ACCOUNT LOCK CONTROLS - SAFETY PROCEDURES & BEST PRACTICES
 *
 * 1. PERIOD CLOSE LOCKING
 *    - Lock GL periods after monthly close is complete
 *    - No transactions allowed to closed periods
 *    - Unlock requires CFO + Controller dual approval
 *    - All unlocks logged with reason and audit trail
 *
 * 2. ENTITY-LEVEL LOCKING
 *    - Individual entities can be locked during audits
 *    - Prevents unauthorized entries during sensitive periods
 *    - Lock/unlock requires entity controller approval
 *
 * 3. ACCOUNT-LEVEL LOCKING
 *    - Sensitive accounts (cash, equity) can be locked
 *    - Requires additional approval for any postings
 *    - Useful for quarter-end and year-end close
 *
 * 4. USER ACCESS CONTROLS
 *    - Time-based access restrictions
 *    - After-hours posting requires manager approval
 *    - Weekend/holiday posting alerts
 *
 * 5. AUTOMATIC LOCK RULES
 *    - Auto-lock periods 15 days after close
 *    - Auto-lock accounts with zero activity for 90 days
 *    - Dormant entity detection and locking
 *
 * 6. AUDIT REQUIREMENTS
 *    - All lock/unlock actions logged
 *    - Reason required for any unlock
 *    - Monthly report of all unlock events
 */

const mockPeriods = [
  { id: 1, period: 'January 2024', startDate: '2024-01-01', endDate: '2024-01-31', status: 'locked', lockedBy: 'System (Auto)', lockedDate: '2024-02-15', closeStatus: 'completed' },
  { id: 2, period: 'February 2024', startDate: '2024-02-01', endDate: '2024-02-29', status: 'open', lockedBy: null, lockedDate: null, closeStatus: 'in_progress' },
  { id: 3, period: 'March 2024', startDate: '2024-03-01', endDate: '2024-03-31', status: 'open', lockedBy: null, lockedDate: null, closeStatus: 'not_started' }
];

const mockEntityLocks = [
  { id: 1, entity: 'Riverside Plaza LLC', status: 'unlocked', lastLocked: '2024-01-15', lastUnlocked: '2024-01-18', reason: 'External audit complete' },
  { id: 2, entity: 'Downtown Tower LLC', status: 'locked', lastLocked: '2024-02-01', lastUnlocked: null, reason: 'Year-end audit in progress' },
  { id: 3, entity: 'Atlas Holdings LLC', status: 'unlocked', lastLocked: '2024-01-31', lastUnlocked: '2024-02-01', reason: 'Month-end close complete' },
  { id: 4, entity: 'Opportunity Fund I', status: 'unlocked', lastLocked: null, lastUnlocked: null, reason: null }
];

const mockAccountLocks = [
  { id: 1, account: '1000 - Operating Cash', entity: 'All Entities', status: 'soft_lock', approvalRequired: 'CFO', lastModified: '2024-02-01' },
  { id: 2, account: '3000 - Member Capital', entity: 'All Entities', status: 'hard_lock', approvalRequired: 'Board', lastModified: '2024-01-31' },
  { id: 3, account: '4000 - Revenue Recognition', entity: 'Riverside Plaza LLC', status: 'soft_lock', approvalRequired: 'Controller', lastModified: '2024-02-01' }
];

const mockUnlockRequests = [
  { id: 1, type: 'Period', target: 'January 2024', requestor: 'Sarah Johnson', reason: 'Found unrecorded invoice - need to post AP accrual', requestDate: '2024-02-02', status: 'pending_cfo' },
  { id: 2, type: 'Account', target: '1000 - Operating Cash', requestor: 'Mike Chen', reason: 'Bank reconciliation adjustment needed', requestDate: '2024-02-02', status: 'pending_cfo' }
];

const mockLockHistory = [
  { id: 1, action: 'Lock', target: 'January 2024', user: 'System (Auto)', timestamp: '2024-02-15 00:00:00', reason: 'Auto-lock after 15-day grace period' },
  { id: 2, action: 'Lock', target: 'Downtown Tower LLC', user: 'Lisa Wang', timestamp: '2024-02-01 09:30:00', reason: 'Year-end audit in progress' },
  { id: 3, action: 'Unlock', target: 'Atlas Holdings LLC', user: 'John Smith', timestamp: '2024-02-01 17:45:00', reason: 'Month-end close complete' },
  { id: 4, action: 'Soft Lock', target: '1000 - Operating Cash', user: 'Controller', timestamp: '2024-02-01 08:00:00', reason: 'Quarter-end close protection' }
];

const statusConfig = {
  locked: { label: 'Locked', color: 'bg-red-100 text-red-800', icon: Lock },
  unlocked: { label: 'Unlocked', color: 'bg-green-100 text-green-800', icon: Unlock },
  open: { label: 'Open', color: 'bg-green-100 text-green-800', icon: Unlock },
  soft_lock: { label: 'Soft Lock', color: 'bg-yellow-100 text-yellow-800', icon: Shield },
  hard_lock: { label: 'Hard Lock', color: 'bg-red-100 text-red-800', icon: Lock }
};

const closeStatusConfig = {
  completed: { label: 'Closed', color: 'bg-green-100 text-green-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800' }
};

export default function AccountLockControlsPage() {
  const [activeTab, setActiveTab] = useState('periods');
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const stats = useMemo(() => ({
    lockedPeriods: mockPeriods.filter(p => p.status === 'locked').length,
    openPeriods: mockPeriods.filter(p => p.status === 'open').length,
    lockedEntities: mockEntityLocks.filter(e => e.status === 'locked').length,
    pendingRequests: mockUnlockRequests.length,
    lockedAccounts: mockAccountLocks.length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Lock Controls</h1>
          <p className="text-gray-600">Manage period, entity, and account-level locking controls</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><History className="w-4 h-4 mr-2" />Audit Log</Button>
          <Button variant="outline"><Settings className="w-4 h-4 mr-2" />Lock Rules</Button>
        </div>
      </div>

      {/* Pending Unlock Requests Alert */}
      {stats.pendingRequests > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <Bell className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">{stats.pendingRequests} Pending Unlock Request(s)</p>
            <p className="text-sm text-yellow-700">Review and approve or deny unlock requests</p>
          </div>
          <Button size="sm" className="ml-auto" onClick={() => setActiveTab('requests')}>Review Requests</Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Locked Periods</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.lockedPeriods}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Unlock className="w-4 h-4" />
            <span className="text-sm">Open Periods</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.openPeriods}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Building className="w-4 h-4" />
            <span className="text-sm">Locked Entities</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.lockedEntities}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Protected Accounts</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.lockedAccounts}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending Requests</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['periods', 'entities', 'accounts', 'requests', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px",
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === 'periods' && 'Period Locks'}
            {tab === 'entities' && 'Entity Locks'}
            {tab === 'accounts' && 'Account Locks'}
            {tab === 'requests' && `Unlock Requests (${stats.pendingRequests})`}
            {tab === 'history' && 'Lock History'}
          </button>
        ))}
      </div>

      {/* Period Locks Tab */}
      {activeTab === 'periods' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Period Lock Policy</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Periods are auto-locked 15 days after month-end close</li>
              <li>• Unlocking a closed period requires CFO + Controller dual approval</li>
              <li>• All entries to previously closed periods are flagged for audit</li>
              <li>• Maximum of 3 unlock events per period before requiring board approval</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Period</th>
                  <th className="p-4">Date Range</th>
                  <th className="p-4">Close Status</th>
                  <th className="p-4">Lock Status</th>
                  <th className="p-4">Locked By</th>
                  <th className="p-4">Locked Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPeriods.map((period) => (
                  <tr key={period.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{period.period}</td>
                    <td className="p-4 text-sm text-gray-600">{period.startDate} - {period.endDate}</td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs", closeStatusConfig[period.closeStatus].color)}>
                        {closeStatusConfig[period.closeStatus].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit", statusConfig[period.status].color)}>
                        {React.createElement(statusConfig[period.status].icon, { className: "w-3 h-3" })}
                        {statusConfig[period.status].label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{period.lockedBy || '-'}</td>
                    <td className="p-4 text-sm text-gray-600">{period.lockedDate || '-'}</td>
                    <td className="p-4">
                      {period.status === 'locked' ? (
                        <Button size="sm" variant="outline" className="text-orange-600">Request Unlock</Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-red-600">Lock Period</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Entity Locks Tab */}
      {activeTab === 'entities' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Entity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Locked</th>
                <th className="p-4">Last Unlocked</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockEntityLocks.map((entity) => (
                <tr key={entity.id} className={cn("border-b hover:bg-gray-50", entity.status === 'locked' && "bg-red-50")}>
                  <td className="p-4 font-medium text-gray-900">{entity.entity}</td>
                  <td className="p-4">
                    <span className={cn("px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit", statusConfig[entity.status].color)}>
                      {React.createElement(statusConfig[entity.status].icon, { className: "w-3 h-3" })}
                      {statusConfig[entity.status].label}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{entity.lastLocked || 'Never'}</td>
                  <td className="p-4 text-sm text-gray-600">{entity.lastUnlocked || 'Never'}</td>
                  <td className="p-4 text-sm text-gray-600">{entity.reason || '-'}</td>
                  <td className="p-4">
                    {entity.status === 'locked' ? (
                      <Button size="sm" variant="outline" className="text-green-600">
                        <Unlock className="w-3 h-3 mr-1" />Unlock
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Lock className="w-3 h-3 mr-1" />Lock
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Account Locks Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Account Lock Types</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-purple-800">
              <div>
                <p className="font-medium">Soft Lock:</p>
                <p>Postings allowed with additional approval from designated approver</p>
              </div>
              <div>
                <p className="font-medium">Hard Lock:</p>
                <p>No postings allowed - requires unlock request and board approval</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Account</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Lock Type</th>
                  <th className="p-4">Approval Required</th>
                  <th className="p-4">Last Modified</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockAccountLocks.map((account) => (
                  <tr key={account.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{account.account}</td>
                    <td className="p-4 text-sm text-gray-600">{account.entity}</td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit", statusConfig[account.status].color)}>
                        {React.createElement(statusConfig[account.status].icon, { className: "w-3 h-3" })}
                        {statusConfig[account.status].label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{account.approvalRequired}</td>
                    <td className="p-4 text-sm text-gray-600">{account.lastModified}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline" className="text-red-600">Remove Lock</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button><Shield className="w-4 h-4 mr-2" />Add Account Lock</Button>
        </div>
      )}

      {/* Unlock Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Type</th>
                <th className="p-4">Target</th>
                <th className="p-4">Requestor</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Request Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUnlockRequests.map((request) => (
                <tr key={request.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{request.type}</span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{request.target}</td>
                  <td className="p-4 text-sm">{request.requestor}</td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{request.reason}</td>
                  <td className="p-4 text-sm text-gray-600">{request.requestDate}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">Pending CFO</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                      <Button size="sm" variant="outline" className="text-red-600">Deny</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lock History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target</th>
                <th className="p-4">User</th>
                <th className="p-4">Reason</th>
              </tr>
            </thead>
            <tbody>
              {mockLockHistory.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-600">{entry.timestamp}</td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      entry.action.includes('Lock') ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    )}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{entry.target}</td>
                  <td className="p-4 text-sm">{entry.user}</td>
                  <td className="p-4 text-sm text-gray-600">{entry.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
