import React, { useState, useMemo } from 'react';
import {
  Users, Shield, AlertTriangle, CheckCircle, XCircle, Eye,
  UserCheck, Lock, AlertCircle, FileText, Search, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/*
 * SEGREGATION OF DUTIES (SOD) CONTROLS
 *
 * Key Incompatible Functions:
 * 1. AP Invoice Entry ↔ AP Payment Approval
 * 2. Vendor Master Maintenance ↔ AP Payment Processing
 * 3. AR Invoice Entry ↔ Cash Receipts Processing
 * 4. Journal Entry Creation ↔ Journal Entry Approval
 * 5. Bank Reconciliation ↔ Cash Disbursement
 * 6. Payroll Processing ↔ Payroll Approval
 * 7. Asset Acquisition ↔ Asset Disposal Approval
 */

const mockSODMatrix = [
  {
    function1: 'AP Invoice Entry',
    function2: 'AP Payment Approval',
    riskLevel: 'high',
    status: 'compliant',
    users: [],
    description: 'Person entering invoices should not approve payments to prevent fraudulent disbursements'
  },
  {
    function1: 'Vendor Master Maintenance',
    function2: 'AP Payment Processing',
    riskLevel: 'high',
    status: 'violation',
    users: ['John Smith'],
    description: 'Person maintaining vendor records should not process payments to prevent fictitious vendor fraud',
    mitigatingControl: 'Monthly audit review of vendor additions'
  },
  {
    function1: 'Journal Entry Creation',
    function2: 'Journal Entry Approval',
    riskLevel: 'high',
    status: 'compliant',
    users: [],
    description: 'Person creating journal entries should not approve them to prevent unauthorized adjustments'
  },
  {
    function1: 'Bank Reconciliation',
    function2: 'Cash Disbursement',
    riskLevel: 'high',
    status: 'compliant',
    users: [],
    description: 'Person reconciling bank accounts should not have authority to disburse cash'
  },
  {
    function1: 'AR Invoice Entry',
    function2: 'Cash Receipts Processing',
    riskLevel: 'medium',
    status: 'compliant',
    users: [],
    description: 'Person entering AR invoices should not process cash receipts to prevent lapping'
  },
  {
    function1: 'Payroll Processing',
    function2: 'Payroll Approval',
    riskLevel: 'high',
    status: 'compliant',
    users: [],
    description: 'Person processing payroll should not approve it to prevent ghost employee fraud'
  },
  {
    function1: 'Credit Card Expenses',
    function2: 'Self-Approval',
    riskLevel: 'medium',
    status: 'violation',
    users: ['Tom Davis', 'Lisa Wang'],
    description: 'Users should not approve their own credit card expenses',
    mitigatingControl: 'Quarterly expense audit by external party'
  },
  {
    function1: 'Wire Transfer Initiation',
    function2: 'Wire Transfer Approval',
    riskLevel: 'high',
    status: 'compliant',
    users: [],
    description: 'Person initiating wire transfers should not approve them'
  }
];

const mockUserAccessReview = [
  {
    user: 'Sarah Johnson',
    role: 'Acquisitions Director',
    accessRights: ['AP Invoice View', 'Wire Request', 'JE View'],
    lastReview: '2024-01-15',
    reviewer: 'Mike Chen',
    status: 'approved',
    sodConflicts: 0
  },
  {
    user: 'John Smith',
    role: 'Staff Accountant',
    accessRights: ['AP Invoice Entry', 'Vendor Master', 'AP Payment Processing', 'JE Create'],
    lastReview: '2024-01-15',
    reviewer: 'Mike Chen',
    status: 'exception',
    sodConflicts: 1,
    conflictNote: 'Vendor Master + AP Processing - mitigating control in place'
  },
  {
    user: 'Tom Davis',
    role: 'Property Manager',
    accessRights: ['CC Expense Entry', 'CC Expense Approval'],
    lastReview: '2024-01-15',
    reviewer: 'Lisa Wang',
    status: 'exception',
    sodConflicts: 1,
    conflictNote: 'Self-approval enabled for emergency expenses only'
  },
  {
    user: 'Lisa Wang',
    role: 'Controller',
    accessRights: ['Full Accounting Access', 'System Admin'],
    lastReview: '2024-01-15',
    reviewer: 'Robert Johnson',
    status: 'approved',
    sodConflicts: 0
  },
  {
    user: 'Mike Chen',
    role: 'Accounting Manager',
    accessRights: ['AP Full', 'AR Full', 'GL Full', 'Bank Rec'],
    lastReview: '2024-01-15',
    reviewer: 'Lisa Wang',
    status: 'approved',
    sodConflicts: 0
  }
];

const riskColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

const statusConfig = {
  compliant: { label: 'Compliant', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  violation: { label: 'Violation', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  exception: { label: 'Exception', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
};

export default function SegregationOfDutiesDashboardPage() {
  const [view, setView] = useState('matrix');

  const stats = useMemo(() => ({
    totalControls: mockSODMatrix.length,
    compliant: mockSODMatrix.filter(s => s.status === 'compliant').length,
    violations: mockSODMatrix.filter(s => s.status === 'violation').length,
    highRiskViolations: mockSODMatrix.filter(s => s.status === 'violation' && s.riskLevel === 'high').length,
    usersWithConflicts: mockUserAccessReview.filter(u => u.sodConflicts > 0).length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Segregation of Duties</h1>
          <p className="text-gray-600">Monitor and enforce SOD controls across the organization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><FileText className="w-4 h-4 mr-2" />Export Report</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Shield className="w-4 h-4 mr-2" />Run SOD Analysis</Button>
        </div>
      </div>

      {stats.violations > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">{stats.violations} SOD Violation(s) Detected</p>
              <p className="text-sm text-red-700">Review and implement mitigating controls or remediate access.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.totalControls}</p>
          <p className="text-sm text-gray-600">SOD Controls</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
          <p className="text-sm text-gray-600">Compliant</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">{stats.violations}</p>
          <p className="text-sm text-gray-600">Violations</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">{stats.highRiskViolations}</p>
          <p className="text-sm text-gray-600">High Risk</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.usersWithConflicts}</p>
          <p className="text-sm text-gray-600">Users w/ Conflicts</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <Button variant={view === 'matrix' ? 'default' : 'outline'} onClick={() => setView('matrix')}>SOD Matrix</Button>
        <Button variant={view === 'users' ? 'default' : 'outline'} onClick={() => setView('users')}>User Access Review</Button>
      </div>

      {view === 'matrix' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Function 1</th>
                <th className="p-4">Function 2</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4">Status</th>
                <th className="p-4">Users in Conflict</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockSODMatrix.map((sod, idx) => (
                <tr key={idx} className={cn("border-b hover:bg-gray-50", sod.status === 'violation' && "bg-red-50")}>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{sod.function1}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{sod.function2}</p>
                  </td>
                  <td className="p-4">
                    <span className={cn("px-2 py-0.5 rounded text-xs", riskColors[sod.riskLevel])}>
                      {sod.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn("px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit", statusConfig[sod.status].color)}>
                      {React.createElement(statusConfig[sod.status].icon, { className: "w-3 h-3" })}
                      {statusConfig[sod.status].label}
                    </span>
                  </td>
                  <td className="p-4">
                    {sod.users.length > 0 ? (
                      <div>
                        {sod.users.map((user, i) => (
                          <span key={i} className="text-sm text-red-600">{user}{i < sod.users.length - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    {sod.status === 'violation' && (
                      <Button size="sm" variant="outline" className="text-red-600">Remediate</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'users' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Access Rights</th>
                <th className="p-4">SOD Conflicts</th>
                <th className="p-4">Last Review</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockUserAccessReview.map((user, idx) => (
                <tr key={idx} className={cn("border-b hover:bg-gray-50", user.sodConflicts > 0 && "bg-yellow-50")}>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{user.user}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{user.role}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {user.accessRights.slice(0, 3).map((right, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{right}</span>
                      ))}
                      {user.accessRights.length > 3 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">+{user.accessRights.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {user.sodConflicts > 0 ? (
                      <div>
                        <span className="text-red-600 font-semibold">{user.sodConflicts}</span>
                        {user.conflictNote && <p className="text-xs text-gray-500 mt-1">{user.conflictNote}</p>}
                      </div>
                    ) : (
                      <span className="text-green-600">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{user.lastReview}</p>
                    <p className="text-xs text-gray-500">by {user.reviewer}</p>
                  </td>
                  <td className="p-4">
                    <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[user.status].color)}>
                      {statusConfig[user.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
