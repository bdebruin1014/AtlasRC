import React, { useState, useMemo } from 'react';
import {
  History, Search, Filter, Download, Eye, User, Calendar,
  FileText, Edit, Trash2, Plus, AlertTriangle, Clock, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * AUDIT TRAIL VIEWER - COMPREHENSIVE ACTIVITY LOGGING
 *
 * 1. LOGGED ACTIVITIES
 *    - All GL transactions (create, modify, delete, post)
 *    - User login/logout with IP addresses
 *    - Permission changes and role assignments
 *    - Report generation and data exports
 *    - Configuration changes
 *    - Approval actions (approve, reject, delegate)
 *
 * 2. DATA RETENTION
 *    - Financial transactions: 7 years minimum
 *    - User activity logs: 3 years
 *    - System configuration changes: Permanent
 *    - Failed login attempts: 1 year
 *
 * 3. AUDIT TRAIL PROTECTION
 *    - Logs are immutable (append-only)
 *    - No user can delete or modify audit logs
 *    - Logs stored in separate, secured database
 *    - Daily backup with off-site replication
 *
 * 4. ACCESS CONTROLS
 *    - View audit logs: Controller, CFO, Auditors
 *    - Export audit logs: CFO, External Auditors only
 *    - System admin logs: IT Security team only
 *
 * 5. COMPLIANCE
 *    - SOX compliance ready
 *    - GAAP audit trail requirements
 *    - Data export in standard formats (CSV, PDF)
 */

const mockAuditLogs = [
  { id: 1, timestamp: '2024-02-02 14:32:15', user: 'Sarah Johnson', action: 'CREATE', module: 'Journal Entry', target: 'JE-2024-0145', details: 'Created journal entry for accrual adjustment', ipAddress: '192.168.1.105', oldValue: null, newValue: '$15,250.00' },
  { id: 2, timestamp: '2024-02-02 14:28:00', user: 'Mike Chen', action: 'APPROVE', module: 'Wire Transfer', target: 'WT-2024-0089', details: 'Approved wire transfer to vendor ABC Corp', ipAddress: '192.168.1.112', oldValue: 'Pending', newValue: 'Approved' },
  { id: 3, timestamp: '2024-02-02 14:15:33', user: 'Lisa Wang', action: 'MODIFY', module: 'Vendor', target: 'V-1052', details: 'Updated bank account information for Johnson LLC', ipAddress: '192.168.1.108', oldValue: 'Bank: Wells Fargo ****1234', newValue: 'Bank: Chase ****5678' },
  { id: 4, timestamp: '2024-02-02 13:45:00', user: 'John Smith', action: 'DELETE', module: 'Draft Invoice', target: 'INV-DRAFT-0234', details: 'Deleted draft invoice before posting', ipAddress: '192.168.1.101', oldValue: '$8,500.00', newValue: null },
  { id: 5, timestamp: '2024-02-02 13:22:18', user: 'Tom Davis', action: 'EXPORT', module: 'Report', target: 'Trial Balance Q1 2024', details: 'Exported trial balance to Excel', ipAddress: '192.168.1.115', oldValue: null, newValue: 'Format: XLSX' },
  { id: 6, timestamp: '2024-02-02 12:55:00', user: 'System', action: 'AUTO_LOCK', module: 'Period', target: 'December 2023', details: 'Automatic period lock after 15-day grace period', ipAddress: 'System', oldValue: 'Open', newValue: 'Locked' },
  { id: 7, timestamp: '2024-02-02 11:30:45', user: 'Admin', action: 'PERMISSION', module: 'User Access', target: 'New Hire - Amy Roberts', details: 'Assigned role: AP Clerk', ipAddress: '192.168.1.100', oldValue: 'No Access', newValue: 'AP Clerk' },
  { id: 8, timestamp: '2024-02-02 10:15:22', user: 'Sarah Johnson', action: 'REJECT', module: 'Expense Report', target: 'EXP-2024-0156', details: 'Rejected expense report - missing receipts', ipAddress: '192.168.1.105', oldValue: 'Pending Review', newValue: 'Rejected' },
  { id: 9, timestamp: '2024-02-02 09:45:00', user: 'Mike Chen', action: 'LOGIN', module: 'Authentication', target: 'User Session', details: 'Successful login', ipAddress: '192.168.1.112', oldValue: null, newValue: 'Session Started' },
  { id: 10, timestamp: '2024-02-02 09:30:15', user: 'Unknown', action: 'LOGIN_FAILED', module: 'Authentication', target: 'User: admin@atlas.com', details: 'Failed login attempt - invalid password (Attempt 2 of 5)', ipAddress: '203.45.67.89', oldValue: null, newValue: 'Access Denied' }
];

const mockSensitiveChanges = [
  { id: 1, timestamp: '2024-02-02 14:15:33', user: 'Lisa Wang', type: 'Bank Account Change', entity: 'Johnson LLC', riskLevel: 'high', reviewed: false },
  { id: 2, timestamp: '2024-02-01 16:45:00', user: 'Admin', type: 'Permission Escalation', entity: 'User: Tom Davis', riskLevel: 'medium', reviewed: true },
  { id: 3, timestamp: '2024-02-01 11:20:00', user: 'John Smith', type: 'Large Transaction', entity: 'Wire Transfer $500K+', riskLevel: 'high', reviewed: true }
];

const actionColors = {
  'CREATE': 'bg-green-100 text-green-800',
  'MODIFY': 'bg-blue-100 text-blue-800',
  'DELETE': 'bg-red-100 text-red-800',
  'APPROVE': 'bg-purple-100 text-purple-800',
  'REJECT': 'bg-orange-100 text-orange-800',
  'EXPORT': 'bg-gray-100 text-gray-800',
  'LOGIN': 'bg-teal-100 text-teal-800',
  'LOGIN_FAILED': 'bg-red-100 text-red-800',
  'AUTO_LOCK': 'bg-yellow-100 text-yellow-800',
  'PERMISSION': 'bg-indigo-100 text-indigo-800'
};

const actionIcons = {
  'CREATE': Plus,
  'MODIFY': Edit,
  'DELETE': Trash2,
  'APPROVE': FileText,
  'REJECT': AlertTriangle,
  'EXPORT': Download,
  'LOGIN': User,
  'LOGIN_FAILED': AlertTriangle,
  'AUTO_LOCK': Clock,
  'PERMISSION': User
};

const riskColors = {
  'high': 'bg-red-100 text-red-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'low': 'bg-green-100 text-green-800'
};

export default function AuditTrailViewerPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [expandedLog, setExpandedLog] = useState(null);

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      if (searchQuery && !log.details.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !log.target.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedModule !== 'all' && log.module !== selectedModule) return false;
      if (selectedUser !== 'all' && log.user !== selectedUser) return false;
      if (activeTab === 'security' && !['LOGIN', 'LOGIN_FAILED', 'PERMISSION'].includes(log.action)) return false;
      if (activeTab === 'changes' && !['CREATE', 'MODIFY', 'DELETE'].includes(log.action)) return false;
      if (activeTab === 'approvals' && !['APPROVE', 'REJECT'].includes(log.action)) return false;
      return true;
    });
  }, [searchQuery, selectedModule, selectedUser, activeTab]);

  const stats = useMemo(() => ({
    totalLogs: mockAuditLogs.length,
    changes: mockAuditLogs.filter(l => ['CREATE', 'MODIFY', 'DELETE'].includes(l.action)).length,
    approvals: mockAuditLogs.filter(l => ['APPROVE', 'REJECT'].includes(l.action)).length,
    securityEvents: mockAuditLogs.filter(l => ['LOGIN', 'LOGIN_FAILED', 'PERMISSION'].includes(l.action)).length,
    sensitiveUnreviewed: mockSensitiveChanges.filter(s => !s.reviewed).length
  }), []);

  const modules = [...new Set(mockAuditLogs.map(l => l.module))];
  const users = [...new Set(mockAuditLogs.map(l => l.user))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail Viewer</h1>
          <p className="text-gray-600">Complete activity log for compliance and security review</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Advanced Filters</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export Logs</Button>
        </div>
      </div>

      {/* Sensitive Changes Alert */}
      {stats.sensitiveUnreviewed > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">{stats.sensitiveUnreviewed} Sensitive Change(s) Pending Review</p>
            <p className="text-sm text-red-700">High-risk changes require supervisor review within 24 hours</p>
          </div>
          <Button size="sm" className="ml-auto bg-red-600 hover:bg-red-700" onClick={() => setActiveTab('sensitive')}>Review Now</Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Database className="w-4 h-4" />
            <span className="text-sm">Total Logs Today</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Edit className="w-4 h-4" />
            <span className="text-sm">Data Changes</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.changes}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Approvals</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.approvals}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <User className="w-4 h-4" />
            <span className="text-sm">Security Events</span>
          </div>
          <p className="text-2xl font-bold text-teal-600">{stats.securityEvents}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Pending Review</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.sensitiveUnreviewed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="today">Today</option>
          <option value="week">Past 7 Days</option>
          <option value="month">Past 30 Days</option>
          <option value="quarter">Past Quarter</option>
          <option value="custom">Custom Range</option>
        </select>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Modules</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Users</option>
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['all', 'changes', 'approvals', 'security', 'sensitive'].map((tab) => (
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
            {tab === 'all' && 'All Activity'}
            {tab === 'changes' && 'Data Changes'}
            {tab === 'approvals' && 'Approvals'}
            {tab === 'security' && 'Security Events'}
            {tab === 'sensitive' && `Sensitive (${stats.sensitiveUnreviewed})`}
          </button>
        ))}
      </div>

      {/* Audit Logs Table */}
      {activeTab !== 'sensitive' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Module</th>
                <th className="p-4">Target</th>
                <th className="p-4">Details</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const ActionIcon = actionIcons[log.action] || FileText;
                return (
                  <React.Fragment key={log.id}>
                    <tr className={cn("border-b hover:bg-gray-50", log.action === 'LOGIN_FAILED' && "bg-red-50")}>
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-4 text-sm font-medium">{log.user}</td>
                      <td className="p-4">
                        <span className={cn("px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit", actionColors[log.action])}>
                          <ActionIcon className="w-3 h-3" />
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{log.module}</td>
                      <td className="p-4 text-sm font-medium">{log.target}</td>
                      <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{log.details}</td>
                      <td className="p-4 text-sm text-gray-500 font-mono">{log.ipAddress}</td>
                      <td className="p-4">
                        <Button size="sm" variant="ghost" onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                    {expandedLog === log.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Previous Value:</p>
                              <p className="text-gray-600 mt-1">{log.oldValue || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">New Value:</p>
                              <p className="text-gray-600 mt-1">{log.newValue || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sensitive Changes Tab */}
      {activeTab === 'sensitive' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Sensitive Change Review Policy</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Bank account changes require review within 24 hours</li>
              <li>• Permission escalations require manager confirmation</li>
              <li>• Large transactions ($100K+) require CFO acknowledgment</li>
              <li>• Unreviewed changes are flagged to internal audit weekly</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Change Type</th>
                  <th className="p-4">Entity/Target</th>
                  <th className="p-4">Risk Level</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockSensitiveChanges.map((change) => (
                  <tr key={change.id} className={cn("border-b hover:bg-gray-50", !change.reviewed && "bg-yellow-50")}>
                    <td className="p-4 text-sm text-gray-600">{change.timestamp}</td>
                    <td className="p-4 text-sm font-medium">{change.user}</td>
                    <td className="p-4 text-sm">{change.type}</td>
                    <td className="p-4 text-sm text-gray-600">{change.entity}</td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs uppercase", riskColors[change.riskLevel])}>
                        {change.riskLevel}
                      </span>
                    </td>
                    <td className="p-4">
                      {change.reviewed ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">Reviewed</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">Pending Review</span>
                      )}
                    </td>
                    <td className="p-4">
                      {!change.reviewed && (
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">Acknowledge</Button>
                          <Button size="sm" variant="outline" className="text-red-600">Flag Issue</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
