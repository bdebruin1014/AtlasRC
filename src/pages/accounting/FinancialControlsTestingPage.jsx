import React, { useState, useMemo } from 'react';
import {
  Shield, CheckCircle, XCircle, Clock, AlertTriangle, FileText,
  Calendar, User, ChevronRight, RefreshCw, Download, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/*
 * FINANCIAL CONTROLS TESTING - SOX COMPLIANCE & INTERNAL AUDIT
 *
 * 1. CONTROL CATEGORIES
 *    - Segregation of Duties (SOD)
 *    - Authorization Controls
 *    - Access Controls
 *    - Reconciliation Controls
 *    - Physical Controls
 *    - Data Processing Controls
 *
 * 2. TESTING FREQUENCY
 *    - Key controls: Quarterly testing
 *    - High-risk controls: Monthly testing
 *    - IT general controls: Semi-annual testing
 *    - All controls: Annual comprehensive review
 *
 * 3. TESTING METHODS
 *    - Inquiry: Interview control owners
 *    - Observation: Watch control being performed
 *    - Inspection: Review documentation/evidence
 *    - Re-performance: Execute the control
 *
 * 4. DEFICIENCY CLASSIFICATION
 *    - Control Deficiency: Minor gap in design or operation
 *    - Significant Deficiency: More than remote likelihood of error
 *    - Material Weakness: Reasonable possibility of material misstatement
 *
 * 5. REMEDIATION REQUIREMENTS
 *    - All deficiencies require remediation plan
 *    - Material weaknesses: Immediate escalation to Audit Committee
 *    - Re-testing required after remediation
 */

const mockControls = [
  {
    id: 1,
    controlId: 'FIN-001',
    name: 'Journal Entry Approval',
    category: 'Authorization',
    description: 'All journal entries over $5,000 require manager approval before posting',
    owner: 'Controller',
    frequency: 'Continuous',
    lastTested: '2024-01-15',
    nextTest: '2024-04-15',
    status: 'effective',
    riskRating: 'high'
  },
  {
    id: 2,
    controlId: 'FIN-002',
    name: 'Bank Reconciliation',
    category: 'Reconciliation',
    description: 'Monthly bank reconciliations completed by 5th of following month',
    owner: 'Senior Accountant',
    frequency: 'Monthly',
    lastTested: '2024-01-20',
    nextTest: '2024-04-20',
    status: 'effective',
    riskRating: 'high'
  },
  {
    id: 3,
    controlId: 'FIN-003',
    name: 'Vendor Master Changes',
    category: 'Access',
    description: 'Changes to vendor bank information require dual approval',
    owner: 'AP Manager',
    frequency: 'Continuous',
    lastTested: '2024-01-10',
    nextTest: '2024-04-10',
    status: 'deficiency',
    riskRating: 'high'
  },
  {
    id: 4,
    controlId: 'FIN-004',
    name: 'Wire Transfer Authorization',
    category: 'Authorization',
    description: 'Wire transfers require dual authorization with documented approval',
    owner: 'Treasury',
    frequency: 'Continuous',
    lastTested: '2024-01-25',
    nextTest: '2024-04-25',
    status: 'effective',
    riskRating: 'high'
  },
  {
    id: 5,
    controlId: 'FIN-005',
    name: 'Period Close Lock',
    category: 'Data Processing',
    description: 'GL periods locked within 15 days of month-end close',
    owner: 'Controller',
    frequency: 'Monthly',
    lastTested: '2024-01-30',
    nextTest: '2024-04-30',
    status: 'effective',
    riskRating: 'medium'
  },
  {
    id: 6,
    controlId: 'FIN-006',
    name: 'Segregation of Duties - AP',
    category: 'SOD',
    description: 'AP entry, approval, and payment functions separated',
    owner: 'CFO',
    frequency: 'Continuous',
    lastTested: '2024-01-05',
    nextTest: '2024-04-05',
    status: 'testing',
    riskRating: 'high'
  },
  {
    id: 7,
    controlId: 'FIN-007',
    name: 'Physical Check Security',
    category: 'Physical',
    description: 'Blank checks stored in locked safe with limited access',
    owner: 'Office Manager',
    frequency: 'Quarterly',
    lastTested: '2023-12-15',
    nextTest: '2024-03-15',
    status: 'overdue',
    riskRating: 'medium'
  }
];

const mockTestHistory = [
  { id: 1, controlId: 'FIN-001', testDate: '2024-01-15', tester: 'Internal Audit', result: 'Pass', sampleSize: 25, exceptions: 0, notes: 'All sampled JEs had proper approval' },
  { id: 2, controlId: 'FIN-002', testDate: '2024-01-20', tester: 'Internal Audit', result: 'Pass', sampleSize: 12, exceptions: 0, notes: 'All reconciliations completed timely' },
  { id: 3, controlId: 'FIN-003', testDate: '2024-01-10', tester: 'Internal Audit', result: 'Fail', sampleSize: 15, exceptions: 3, notes: '3 vendor changes missing second approval' },
  { id: 4, controlId: 'FIN-004', testDate: '2024-01-25', tester: 'External Audit', result: 'Pass', sampleSize: 20, exceptions: 0, notes: 'Strong controls observed' }
];

const mockDeficiencies = [
  {
    id: 1,
    controlId: 'FIN-003',
    type: 'Control Deficiency',
    description: '3 of 15 vendor bank changes missing dual approval',
    identifiedDate: '2024-01-10',
    rootCause: 'New employees not trained on dual approval requirement',
    remediation: 'Implement mandatory training and system enforcement',
    targetDate: '2024-02-28',
    owner: 'AP Manager',
    status: 'in_progress'
  }
];

const statusConfig = {
  effective: { label: 'Effective', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  deficiency: { label: 'Deficiency', color: 'bg-red-100 text-red-800', icon: XCircle },
  testing: { label: 'Testing', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  overdue: { label: 'Test Overdue', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
};

const riskColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

const categoryColors = {
  'Authorization': 'bg-purple-100 text-purple-800',
  'Reconciliation': 'bg-blue-100 text-blue-800',
  'Access': 'bg-teal-100 text-teal-800',
  'SOD': 'bg-indigo-100 text-indigo-800',
  'Data Processing': 'bg-orange-100 text-orange-800',
  'Physical': 'bg-gray-100 text-gray-800'
};

export default function FinancialControlsTestingPage() {
  const [activeTab, setActiveTab] = useState('controls');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredControls = useMemo(() => {
    return mockControls.filter(control => {
      if (selectedCategory !== 'all' && control.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && control.status !== selectedStatus) return false;
      return true;
    });
  }, [selectedCategory, selectedStatus]);

  const stats = useMemo(() => ({
    totalControls: mockControls.length,
    effective: mockControls.filter(c => c.status === 'effective').length,
    deficiencies: mockControls.filter(c => c.status === 'deficiency').length,
    testingOverdue: mockControls.filter(c => c.status === 'overdue').length,
    highRisk: mockControls.filter(c => c.riskRating === 'high').length
  }), []);

  const categories = [...new Set(mockControls.map(c => c.category))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Controls Testing</h1>
          <p className="text-gray-600">SOX compliance and internal control effectiveness testing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export Report</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><PlayCircle className="w-4 h-4 mr-2" />Run Test</Button>
        </div>
      </div>

      {/* Alerts */}
      {(stats.deficiencies > 0 || stats.testingOverdue > 0) && (
        <div className="space-y-2">
          {stats.deficiencies > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">{stats.deficiencies} Control Deficiency(ies) Identified</p>
                <p className="text-sm text-red-700">Remediation required - review deficiency details</p>
              </div>
              <Button size="sm" className="ml-auto bg-red-600 hover:bg-red-700" onClick={() => setActiveTab('deficiencies')}>View Deficiencies</Button>
            </div>
          )}
          {stats.testingOverdue > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">{stats.testingOverdue} Control(s) Overdue for Testing</p>
                <p className="text-sm text-orange-700">Schedule testing immediately to maintain compliance</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto border-orange-600 text-orange-600">Schedule Tests</Button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Total Controls</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalControls}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Effective</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.effective}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Deficiencies</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.deficiencies}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Test Overdue</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.testingOverdue}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">High Risk</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.highRisk}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="effective">Effective</option>
          <option value="deficiency">Deficiency</option>
          <option value="testing">In Testing</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['controls', 'testing', 'deficiencies'].map((tab) => (
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
            {tab === 'controls' && 'Control Inventory'}
            {tab === 'testing' && 'Test History'}
            {tab === 'deficiencies' && `Deficiencies (${stats.deficiencies})`}
          </button>
        ))}
      </div>

      {/* Controls Inventory Tab */}
      {activeTab === 'controls' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Control ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Risk</th>
                <th className="p-4">Last Tested</th>
                <th className="p-4">Next Test</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredControls.map((control) => {
                const StatusIcon = statusConfig[control.status].icon;
                return (
                  <tr key={control.id} className={cn("border-b hover:bg-gray-50", control.status === 'deficiency' && "bg-red-50")}>
                    <td className="p-4 font-mono text-sm">{control.controlId}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{control.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{control.description}</p>
                    </td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs", categoryColors[control.category])}>
                        {control.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{control.owner}</td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs uppercase", riskColors[control.riskRating])}>
                        {control.riskRating}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{control.lastTested}</td>
                    <td className="p-4 text-sm text-gray-600">{control.nextTest}</td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit", statusConfig[control.status].color)}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[control.status].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="outline">Test Now</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Test History Tab */}
      {activeTab === 'testing' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Test Date</th>
                <th className="p-4">Control ID</th>
                <th className="p-4">Tester</th>
                <th className="p-4">Sample Size</th>
                <th className="p-4">Exceptions</th>
                <th className="p-4">Result</th>
                <th className="p-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {mockTestHistory.map((test) => (
                <tr key={test.id} className={cn("border-b hover:bg-gray-50", test.result === 'Fail' && "bg-red-50")}>
                  <td className="p-4 text-sm">{test.testDate}</td>
                  <td className="p-4 font-mono text-sm">{test.controlId}</td>
                  <td className="p-4 text-sm">{test.tester}</td>
                  <td className="p-4 text-sm text-center">{test.sampleSize}</td>
                  <td className="p-4 text-sm text-center">
                    <span className={cn(test.exceptions > 0 && "text-red-600 font-medium")}>{test.exceptions}</span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      test.result === 'Pass' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    )}>
                      {test.result}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{test.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deficiencies Tab */}
      {activeTab === 'deficiencies' && (
        <div className="space-y-4">
          {mockDeficiencies.map((deficiency) => (
            <div key={deficiency.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-500">{deficiency.controlId}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">{deficiency.type}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mt-1">{deficiency.description}</h3>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded text-xs",
                  deficiency.status === 'in_progress' ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                )}>
                  {deficiency.status === 'in_progress' ? 'In Progress' : 'Remediated'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Identified Date</p>
                  <p className="font-medium">{deficiency.identifiedDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Target Remediation</p>
                  <p className="font-medium">{deficiency.targetDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Root Cause</p>
                  <p className="font-medium">{deficiency.rootCause}</p>
                </div>
                <div>
                  <p className="text-gray-500">Owner</p>
                  <p className="font-medium">{deficiency.owner}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-500 text-sm">Remediation Plan</p>
                <p className="mt-1">{deficiency.remediation}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">Update Status</Button>
                <Button size="sm" variant="outline">Schedule Re-Test</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
