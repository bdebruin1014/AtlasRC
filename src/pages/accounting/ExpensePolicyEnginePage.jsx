import React, { useState, useMemo } from 'react';
import {
  Shield, Settings, AlertTriangle, CheckCircle, XCircle, FileText,
  DollarSign, Clock, User, Building, Edit, Plus, Trash2, Eye, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * EXPENSE POLICY ENGINE - AUTOMATED POLICY ENFORCEMENT
 *
 * 1. POLICY CATEGORIES
 *    - Spending Limits: Per-transaction, daily, monthly caps by category
 *    - Approval Thresholds: Amount-based approval routing
 *    - Category Restrictions: Prohibited expense types
 *    - Time-Based Rules: Weekend/holiday restrictions
 *    - Vendor Rules: Preferred vendors, blacklisted merchants
 *
 * 2. ENFORCEMENT LEVELS
 *    - Block: Transaction denied, cannot proceed
 *    - Warn: Alert shown, user can override with justification
 *    - Flag: Transaction proceeds, flagged for review
 *    - Audit: Transaction proceeds, logged for periodic audit
 *
 * 3. RULE HIERARCHY
 *    - Company-wide policies (base)
 *    - Department-level overrides
 *    - Role-based exceptions
 *    - Individual user exceptions (rare, requires CFO approval)
 *
 * 4. COMPLIANCE MONITORING
 *    - Real-time policy violation alerts
 *    - Weekly compliance reports
 *    - Trend analysis for policy adjustments
 *    - Employee policy violation history
 */

const mockPolicies = [
  {
    id: 1,
    name: 'Meals & Entertainment Limit',
    category: 'Meals & Entertainment',
    type: 'spending_limit',
    rule: 'Per transaction max $100, monthly max $500',
    threshold: 100,
    monthlyLimit: 500,
    enforcement: 'warn',
    scope: 'Company-wide',
    exceptions: ['Executive Team'],
    status: 'active'
  },
  {
    id: 2,
    name: 'Travel Pre-Approval',
    category: 'Travel',
    type: 'approval_required',
    rule: 'All travel expenses over $500 require manager pre-approval',
    threshold: 500,
    monthlyLimit: null,
    enforcement: 'block',
    scope: 'Company-wide',
    exceptions: [],
    status: 'active'
  },
  {
    id: 3,
    name: 'Prohibited Merchant - Alcohol',
    category: 'Prohibited',
    type: 'merchant_block',
    rule: 'Block transactions at liquor stores and bars',
    threshold: null,
    monthlyLimit: null,
    enforcement: 'block',
    scope: 'Company-wide',
    exceptions: ['Client Entertainment - Pre-approved'],
    status: 'active'
  },
  {
    id: 4,
    name: 'Weekend Transaction Review',
    category: 'All',
    type: 'time_restriction',
    rule: 'All weekend transactions flagged for Monday review',
    threshold: null,
    monthlyLimit: null,
    enforcement: 'flag',
    scope: 'Company-wide',
    exceptions: ['Field Operations'],
    status: 'active'
  },
  {
    id: 5,
    name: 'Office Supplies Preferred Vendor',
    category: 'Office Supplies',
    type: 'vendor_preference',
    rule: 'Office Depot preferred - others require justification',
    threshold: null,
    monthlyLimit: null,
    enforcement: 'warn',
    scope: 'Company-wide',
    exceptions: [],
    status: 'active'
  },
  {
    id: 6,
    name: 'Executive Approval Threshold',
    category: 'All',
    type: 'approval_required',
    rule: 'Expenses over $5,000 require CFO approval',
    threshold: 5000,
    monthlyLimit: null,
    enforcement: 'block',
    scope: 'Company-wide',
    exceptions: [],
    status: 'active'
  }
];

const mockViolations = [
  { id: 1, date: '2024-02-02', employee: 'Tom Davis', policy: 'Meals & Entertainment Limit', amount: 145.00, vendor: 'Steakhouse 55', action: 'Override - Manager Approved', status: 'resolved' },
  { id: 2, date: '2024-02-02', employee: 'Lisa Wang', policy: 'Weekend Transaction Review', amount: 89.00, vendor: 'Amazon.com', action: 'Pending Review', status: 'pending' },
  { id: 3, date: '2024-02-01', employee: 'Mike Chen', policy: 'Travel Pre-Approval', amount: 750.00, vendor: 'Delta Airlines', action: 'Blocked - No Pre-Approval', status: 'blocked' },
  { id: 4, date: '2024-01-31', employee: 'Sarah Johnson', policy: 'Office Supplies Preferred Vendor', amount: 234.50, vendor: 'Staples', action: 'Approved with Justification', status: 'resolved' }
];

const mockEmployeeCompliance = [
  { id: 1, employee: 'Tom Davis', violations30d: 3, lastViolation: '2024-02-02', complianceScore: 78, trend: 'declining' },
  { id: 2, employee: 'Lisa Wang', violations30d: 1, lastViolation: '2024-02-02', complianceScore: 92, trend: 'stable' },
  { id: 3, employee: 'Mike Chen', violations30d: 2, lastViolation: '2024-02-01', complianceScore: 85, trend: 'improving' },
  { id: 4, employee: 'Sarah Johnson', violations30d: 1, lastViolation: '2024-01-31', complianceScore: 95, trend: 'stable' }
];

const enforcementConfig = {
  block: { label: 'Block', color: 'bg-red-100 text-red-800' },
  warn: { label: 'Warn', color: 'bg-yellow-100 text-yellow-800' },
  flag: { label: 'Flag', color: 'bg-orange-100 text-orange-800' },
  audit: { label: 'Audit', color: 'bg-blue-100 text-blue-800' }
};

const violationStatusConfig = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' }
};

const trendConfig = {
  improving: { label: 'Improving', color: 'text-green-600' },
  stable: { label: 'Stable', color: 'text-gray-600' },
  declining: { label: 'Declining', color: 'text-red-600' }
};

export default function ExpensePolicyEnginePage() {
  const [activeTab, setActiveTab] = useState('policies');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showAddPolicy, setShowAddPolicy] = useState(false);

  const stats = useMemo(() => ({
    activePolicies: mockPolicies.filter(p => p.status === 'active').length,
    pendingViolations: mockViolations.filter(v => v.status === 'pending').length,
    blockedToday: mockViolations.filter(v => v.status === 'blocked' && v.date === '2024-02-02').length,
    avgComplianceScore: Math.round(mockEmployeeCompliance.reduce((sum, e) => sum + e.complianceScore, 0) / mockEmployeeCompliance.length),
    atRiskEmployees: mockEmployeeCompliance.filter(e => e.complianceScore < 80).length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Policy Engine</h1>
          <p className="text-gray-600">Automated expense policy enforcement and compliance monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><FileText className="w-4 h-4 mr-2" />Compliance Report</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Add Policy</Button>
        </div>
      </div>

      {/* Alerts */}
      {(stats.pendingViolations > 0 || stats.atRiskEmployees > 0) && (
        <div className="space-y-2">
          {stats.pendingViolations > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">{stats.pendingViolations} Policy Violation(s) Pending Review</p>
                <p className="text-sm text-yellow-700">Review and resolve flagged transactions</p>
              </div>
              <Button size="sm" className="ml-auto" onClick={() => setActiveTab('violations')}>Review Now</Button>
            </div>
          )}
          {stats.atRiskEmployees > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <User className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">{stats.atRiskEmployees} Employee(s) Below Compliance Threshold</p>
                <p className="text-sm text-orange-700">Consider policy training or card review</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto border-orange-600 text-orange-600" onClick={() => setActiveTab('compliance')}>View Details</Button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Active Policies</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activePolicies}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending Review</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingViolations}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Blocked Today</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.blockedToday}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Avg Compliance</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.avgComplianceScore}%</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">At-Risk Employees</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.atRiskEmployees}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['policies', 'violations', 'compliance'].map((tab) => (
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
            {tab === 'policies' && 'Policy Rules'}
            {tab === 'violations' && `Violations (${stats.pendingViolations})`}
            {tab === 'compliance' && 'Employee Compliance'}
          </button>
        ))}
      </div>

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Policy Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Rule</th>
                <th className="p-4">Enforcement</th>
                <th className="p-4">Scope</th>
                <th className="p-4">Exceptions</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockPolicies.map((policy) => (
                <tr key={policy.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{policy.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{policy.category}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs">{policy.rule}</td>
                  <td className="p-4">
                    <span className={cn("px-2 py-0.5 rounded text-xs", enforcementConfig[policy.enforcement].color)}>
                      {enforcementConfig[policy.enforcement].label}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{policy.scope}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {policy.exceptions.length > 0 ? policy.exceptions.join(', ') : 'None'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Date</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Policy Violated</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Action Taken</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockViolations.map((violation) => (
                <tr key={violation.id} className={cn("border-b hover:bg-gray-50", violation.status === 'pending' && "bg-yellow-50")}>
                  <td className="p-4 text-sm">{violation.date}</td>
                  <td className="p-4 text-sm font-medium">{violation.employee}</td>
                  <td className="p-4 text-sm">{violation.policy}</td>
                  <td className="p-4 text-sm text-gray-600">{violation.vendor}</td>
                  <td className="p-4 text-sm font-medium">${violation.amount.toFixed(2)}</td>
                  <td className="p-4 text-sm text-gray-600">{violation.action}</td>
                  <td className="p-4">
                    <span className={cn("px-2 py-0.5 rounded text-xs", violationStatusConfig[violation.status].color)}>
                      {violationStatusConfig[violation.status].label}
                    </span>
                  </td>
                  <td className="p-4">
                    {violation.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                        <Button size="sm" variant="outline" className="text-red-600">Reject</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Compliance Score Thresholds</h3>
            <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium text-green-600">90-100%: Excellent</p>
                <p>No action required</p>
              </div>
              <div>
                <p className="font-medium text-yellow-600">80-89%: Acceptable</p>
                <p>Monitor for improvement</p>
              </div>
              <div>
                <p className="font-medium text-red-600">Below 80%: At Risk</p>
                <p>Policy training required, potential card review</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Compliance Score</th>
                  <th className="p-4">Violations (30d)</th>
                  <th className="p-4">Last Violation</th>
                  <th className="p-4">Trend</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockEmployeeCompliance.map((emp) => (
                  <tr key={emp.id} className={cn("border-b hover:bg-gray-50", emp.complianceScore < 80 && "bg-red-50")}>
                    <td className="p-4 font-medium text-gray-900">{emp.employee}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full",
                              emp.complianceScore >= 90 ? "bg-green-500" :
                              emp.complianceScore >= 80 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: `${emp.complianceScore}%` }}
                          />
                        </div>
                        <span className={cn(
                          "font-medium",
                          emp.complianceScore >= 90 ? "text-green-600" :
                          emp.complianceScore >= 80 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {emp.complianceScore}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={cn(emp.violations30d > 2 && "text-red-600 font-medium")}>{emp.violations30d}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{emp.lastViolation}</td>
                    <td className="p-4">
                      <span className={cn("text-sm font-medium", trendConfig[emp.trend].color)}>
                        {trendConfig[emp.trend].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View History</Button>
                        {emp.complianceScore < 80 && (
                          <Button size="sm" variant="outline" className="text-orange-600">Schedule Training</Button>
                        )}
                      </div>
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
