import React, { useState } from 'react';
import { History, Search, Filter, Download, Calendar, User, FileText, Edit2, Trash2, Plus, Eye, ChevronDown, ChevronRight, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const AuditTrailPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('7days');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [expandedEntry, setExpandedEntry] = useState(null);

  const auditEntries = [
    {
      id: 'audit-1',
      timestamp: '2024-12-28 14:32:15',
      user: 'John Smith',
      userEmail: 'john.smith@vanrock.com',
      action: 'update',
      module: 'Journal Entry',
      recordId: 'JE-2024-1542',
      recordName: 'Monthly Depreciation',
      entity: 'VanRock Development',
      ipAddress: '192.168.1.105',
      changes: [
        { field: 'amount', oldValue: '12,000.00', newValue: '12,500.00' },
        { field: 'description', oldValue: 'Monthly depreciation', newValue: 'Monthly depreciation - adjusted' },
      ],
      reason: 'Corrected depreciation amount based on updated asset values',
    },
    {
      id: 'audit-2',
      timestamp: '2024-12-28 13:45:22',
      user: 'Sarah Johnson',
      userEmail: 'sarah.johnson@vanrock.com',
      action: 'create',
      module: 'Bill',
      recordId: 'BILL-2024-0892',
      recordName: 'Smith Construction - Draw #7',
      entity: 'Watson Project SPE',
      ipAddress: '192.168.1.112',
      changes: [
        { field: 'vendor', oldValue: null, newValue: 'Smith Construction Co.' },
        { field: 'amount', oldValue: null, newValue: '185,000.00' },
        { field: 'due_date', oldValue: null, newValue: '2025-01-15' },
      ],
      reason: null,
    },
    {
      id: 'audit-3',
      timestamp: '2024-12-28 11:20:08',
      user: 'Mike Davis',
      userEmail: 'mike.davis@vanrock.com',
      action: 'delete',
      module: 'Journal Entry',
      recordId: 'JE-2024-1538',
      recordName: 'Duplicate Entry - Interest',
      entity: 'VanRock Development',
      ipAddress: '192.168.1.108',
      changes: [
        { field: 'status', oldValue: 'Posted', newValue: 'Deleted' },
      ],
      reason: 'Duplicate entry created in error',
    },
    {
      id: 'audit-4',
      timestamp: '2024-12-28 10:15:33',
      user: 'John Smith',
      userEmail: 'john.smith@vanrock.com',
      action: 'approve',
      module: 'Bill Payment',
      recordId: 'PMT-2024-0445',
      recordName: 'Ferguson Supply Payment',
      entity: 'Sunset Ridge SPE',
      ipAddress: '192.168.1.105',
      changes: [
        { field: 'status', oldValue: 'Pending Approval', newValue: 'Approved' },
        { field: 'approved_by', oldValue: null, newValue: 'John Smith' },
        { field: 'approved_date', oldValue: null, newValue: '2024-12-28' },
      ],
      reason: null,
    },
    {
      id: 'audit-5',
      timestamp: '2024-12-27 16:48:19',
      user: 'Sarah Johnson',
      userEmail: 'sarah.johnson@vanrock.com',
      action: 'update',
      module: 'Account',
      recordId: 'ACCT-1200',
      recordName: 'Accounts Receivable',
      entity: 'VanRock Development',
      ipAddress: '192.168.1.112',
      changes: [
        { field: 'account_name', oldValue: 'Accounts Receivable', newValue: 'Accounts Receivable - Trade' },
        { field: 'sub_type', oldValue: 'Current Asset', newValue: 'Trade Receivable' },
      ],
      reason: 'Reclassified for better reporting',
    },
    {
      id: 'audit-6',
      timestamp: '2024-12-27 15:22:41',
      user: 'System',
      userEmail: 'system@vanrock.com',
      action: 'system',
      module: 'Recurring Entry',
      recordId: 'RJE-001',
      recordName: 'Auto: Monthly Insurance',
      entity: 'All Entities',
      ipAddress: 'localhost',
      changes: [
        { field: 'status', oldValue: 'Scheduled', newValue: 'Posted' },
        { field: 'je_created', oldValue: null, newValue: 'JE-2024-1540' },
      ],
      reason: 'Automated recurring entry execution',
    },
    {
      id: 'audit-7',
      timestamp: '2024-12-27 14:10:55',
      user: 'John Smith',
      userEmail: 'john.smith@vanrock.com',
      action: 'void',
      module: 'Check',
      recordId: 'CHK-5562',
      recordName: 'Check to ABC Supplies',
      entity: 'VanRock Development',
      ipAddress: '192.168.1.105',
      changes: [
        { field: 'status', oldValue: 'Cleared', newValue: 'Voided' },
        { field: 'void_reason', oldValue: null, newValue: 'Payment issued in error' },
      ],
      reason: 'Vendor returned payment - duplicate invoice',
    },
    {
      id: 'audit-8',
      timestamp: '2024-12-27 11:35:28',
      user: 'Mike Davis',
      userEmail: 'mike.davis@vanrock.com',
      action: 'export',
      module: 'Report',
      recordId: 'RPT-TB-202412',
      recordName: 'Trial Balance - December 2024',
      entity: 'VanRock Development',
      ipAddress: '192.168.1.108',
      changes: [],
      reason: 'Monthly financial review',
    },
    {
      id: 'audit-9',
      timestamp: '2024-12-27 09:20:14',
      user: 'Sarah Johnson',
      userEmail: 'sarah.johnson@vanrock.com',
      action: 'reconcile',
      module: 'Bank Account',
      recordId: 'BANK-001',
      recordName: 'Operating Account - Chase',
      entity: 'VanRock Development',
      ipAddress: '192.168.1.112',
      changes: [
        { field: 'reconciled_date', oldValue: '2024-11-30', newValue: '2024-12-27' },
        { field: 'statement_balance', oldValue: null, newValue: '2,450,000.00' },
        { field: 'items_cleared', oldValue: null, newValue: '24' },
      ],
      reason: null,
    },
    {
      id: 'audit-10',
      timestamp: '2024-12-26 17:45:02',
      user: 'Admin',
      userEmail: 'admin@vanrock.com',
      action: 'permission',
      module: 'User',
      recordId: 'USER-015',
      recordName: 'New Accountant User',
      entity: 'System',
      ipAddress: '192.168.1.100',
      changes: [
        { field: 'role', oldValue: 'Viewer', newValue: 'Accountant' },
        { field: 'permissions', oldValue: 'Read Only', newValue: 'Read/Write - Accounting' },
      ],
      reason: 'User promoted to accountant role',
    },
  ];

  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return <Plus className="w-4 h-4 text-green-500" />;
      case 'update': return <Edit2 className="w-4 h-4 text-blue-500" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'approve': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'void': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'export': return <Download className="w-4 h-4 text-purple-500" />;
      case 'reconcile': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'system': return <RefreshCw className="w-4 h-4 text-gray-500" />;
      case 'permission': return <User className="w-4 h-4 text-amber-500" />;
      default: return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-700';
      case 'update': return 'bg-blue-100 text-blue-700';
      case 'delete': return 'bg-red-100 text-red-700';
      case 'approve': return 'bg-green-100 text-green-700';
      case 'void': return 'bg-amber-100 text-amber-700';
      case 'export': return 'bg-purple-100 text-purple-700';
      case 'reconcile': return 'bg-blue-100 text-blue-700';
      case 'system': return 'bg-gray-100 text-gray-700';
      case 'permission': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const users = [...new Set(auditEntries.map(e => e.user))];
  const actions = [...new Set(auditEntries.map(e => e.action))];

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = entry.recordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.recordId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'all' || entry.action === selectedAction;
    const matchesUser = selectedUser === 'all' || entry.user === selectedUser;
    return matchesSearch && matchesAction && matchesUser;
  });

  const stats = {
    total: auditEntries.length,
    creates: auditEntries.filter(e => e.action === 'create').length,
    updates: auditEntries.filter(e => e.action === 'update').length,
    deletes: auditEntries.filter(e => e.action === 'delete').length,
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Audit Trail & Transaction History</h1>
            <p className="text-sm text-gray-500">Complete record of all system changes and user actions</p>
          </div>
          <div className="flex gap-2">
            <select className="border rounded-md px-3 py-1.5 text-sm" value={selectedDateRange} onChange={(e) => setSelectedDateRange(e.target.value)}>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Advanced Filter</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export Log</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Total Activities</p>
            <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-2xl font-bold text-green-700">{stats.creates}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Updated</p>
            <p className="text-2xl font-bold text-blue-700">{stats.updates}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Deleted</p>
            <p className="text-2xl font-bold text-red-700">{stats.deletes}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by record, user, or ID..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-1.5 text-sm" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
          <option value="all">All Actions</option>
          {actions.map(action => (
            <option key={action} value={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</option>
          ))}
        </select>
        <select className="border rounded-md px-3 py-1.5 text-sm" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="all">All Users</option>
          {users.map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Audit Log */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "bg-white border rounded-lg overflow-hidden transition-shadow",
                  expandedEntry === entry.id && "shadow-md"
                )}
              >
                <div
                  onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                  className="p-4 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{entry.user}</span>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", getActionColor(entry.action))}>
                          {entry.action}
                        </span>
                        <span className="text-sm text-gray-500">{entry.module}</span>
                      </div>
                      <p className="text-sm">
                        <span className="text-gray-500">Record:</span>{' '}
                        <span className="font-medium">{entry.recordName}</span>{' '}
                        <span className="text-gray-400 text-xs">({entry.recordId})</span>
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{entry.timestamp}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{entry.entity}</span>
                        <span>IP: {entry.ipAddress}</span>
                      </div>
                    </div>
                    <div>
                      {expandedEntry === entry.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedEntry === entry.id && (
                  <div className="px-4 pb-4 border-t bg-gray-50">
                    <div className="pt-4">
                      {entry.reason && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Reason / Notes</p>
                          <p className="text-sm">{entry.reason}</p>
                        </div>
                      )}
                      {entry.changes.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Changes Made</p>
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="text-left px-3 py-2 font-medium">Field</th>
                                <th className="text-left px-3 py-2 font-medium">Old Value</th>
                                <th className="text-left px-3 py-2 font-medium">New Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {entry.changes.map((change, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-2 font-medium">{change.field}</td>
                                  <td className="px-3 py-2 text-red-600">{change.oldValue || <span className="text-gray-400 italic">empty</span>}</td>
                                  <td className="px-3 py-2 text-green-600">{change.newValue || <span className="text-gray-400 italic">empty</span>}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" />View Record</Button>
                        <Button variant="outline" size="sm"><History className="w-4 h-4 mr-1" />Full History</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Activity Summary */}
        <div className="w-72 border-l bg-white p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Activity by User</h3>
          <div className="space-y-3">
            {users.map(user => {
              const userEntries = auditEntries.filter(e => e.user === user);
              return (
                <div key={user} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user}</p>
                      <p className="text-xs text-gray-500">{userEntries.length} actions</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {['create', 'update', 'delete', 'approve'].map(action => {
                      const count = userEntries.filter(e => e.action === action).length;
                      if (count === 0) return null;
                      return (
                        <span key={action} className={cn("px-2 py-0.5 rounded text-xs", getActionColor(action))}>
                          {count} {action}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <h3 className="font-semibold mt-6 mb-4">Activity by Module</h3>
          <div className="space-y-2">
            {[...new Set(auditEntries.map(e => e.module))].map(module => {
              const count = auditEntries.filter(e => e.module === module).length;
              return (
                <div key={module} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm">{module}</span>
                  <span className="text-sm font-medium bg-gray-100 px-2 py-0.5 rounded">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailPage;
