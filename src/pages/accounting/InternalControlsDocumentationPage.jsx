import React, { useState } from 'react';
import {
  Shield, CheckCircle, Clock, AlertTriangle, FileText, Search,
  ChevronDown, ChevronRight, Calendar, User, Eye, Edit, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockControls = [
  {
    category: 'Cash & Treasury',
    controls: [
      { id: 'CTRL-001', name: 'Bank Reconciliation', description: 'Monthly reconciliation of all bank accounts by 5th', frequency: 'Monthly', owner: 'Accounting Manager', lastTested: '2024-01-15', status: 'effective', riskLevel: 'high' },
      { id: 'CTRL-002', name: 'Wire Transfer Dual Approval', description: 'All wires over $10K require dual approval', frequency: 'Per Transaction', owner: 'Controller', lastTested: '2024-01-10', status: 'effective', riskLevel: 'high' },
      { id: 'CTRL-003', name: 'Petty Cash Reconciliation', description: 'Weekly count and reconciliation of petty cash', frequency: 'Weekly', owner: 'Office Manager', lastTested: '2024-01-20', status: 'effective', riskLevel: 'low' }
    ]
  },
  {
    category: 'Accounts Payable',
    controls: [
      { id: 'CTRL-004', name: '3-Way Match', description: 'Match PO, Receipt, and Invoice before payment', frequency: 'Per Transaction', owner: 'AP Manager', lastTested: '2024-01-18', status: 'effective', riskLevel: 'high' },
      { id: 'CTRL-005', name: 'Vendor Master Changes', description: 'Changes to vendor bank info require verification callback', frequency: 'Per Change', owner: 'AP Manager', lastTested: '2024-01-12', status: 'needs_improvement', riskLevel: 'high' },
      { id: 'CTRL-006', name: 'Payment Batch Approval', description: 'All payment batches require manager approval', frequency: 'Per Batch', owner: 'Controller', lastTested: '2024-01-08', status: 'effective', riskLevel: 'medium' }
    ]
  },
  {
    category: 'Credit Card & Expenses',
    controls: [
      { id: 'CTRL-007', name: 'Receipt Requirement', description: 'Receipts required for all transactions over $50', frequency: 'Per Transaction', owner: 'Expense Admin', lastTested: '2024-01-15', status: 'effective', riskLevel: 'medium' },
      { id: 'CTRL-008', name: 'Expense Pre-Approval', description: 'Expenses over $2,500 require pre-approval', frequency: 'Per Transaction', owner: 'Department Managers', lastTested: '2024-01-10', status: 'effective', riskLevel: 'medium' },
      { id: 'CTRL-009', name: 'Card Suspension Policy', description: 'Auto-suspend cards with 5+ overdue receipts', frequency: 'Daily', owner: 'System', lastTested: '2024-01-20', status: 'effective', riskLevel: 'low' }
    ]
  },
  {
    category: 'Journal Entries',
    controls: [
      { id: 'CTRL-010', name: 'JE Segregation of Duties', description: 'Preparer cannot approve own entries', frequency: 'Per Entry', owner: 'System', lastTested: '2024-01-05', status: 'effective', riskLevel: 'high' },
      { id: 'CTRL-011', name: 'Large JE Approval', description: 'Entries over $50K require Controller approval', frequency: 'Per Entry', owner: 'Controller', lastTested: '2024-01-15', status: 'effective', riskLevel: 'high' },
      { id: 'CTRL-012', name: 'Supporting Documentation', description: 'All manual JEs require attached documentation', frequency: 'Per Entry', owner: 'Accounting Staff', lastTested: '2024-01-18', status: 'effective', riskLevel: 'medium' }
    ]
  },
  {
    category: 'Intercompany',
    controls: [
      { id: 'CTRL-013', name: 'IC Transfer Dual Approval', description: 'IC transfers require both entity controllers', frequency: 'Per Transfer', owner: 'Controllers', lastTested: '2024-01-12', status: 'effective', riskLevel: 'high' },
      { id: 'CTRL-014', name: 'IC Balance Reconciliation', description: 'Monthly reconciliation of IC balances', frequency: 'Monthly', owner: 'Corporate Accounting', lastTested: '2024-01-08', status: 'effective', riskLevel: 'high' },
      { id: 'CTRL-015', name: 'IC Agreement Documentation', description: 'All IC arrangements documented and on file', frequency: 'Annual', owner: 'Legal/Accounting', lastTested: '2023-12-15', status: 'needs_improvement', riskLevel: 'medium' }
    ]
  }
];

const statusConfig = {
  effective: { label: 'Effective', color: 'bg-green-100 text-green-800' },
  needs_improvement: { label: 'Needs Improvement', color: 'bg-yellow-100 text-yellow-800' },
  deficient: { label: 'Deficient', color: 'bg-red-100 text-red-800' },
  not_tested: { label: 'Not Tested', color: 'bg-gray-100 text-gray-800' }
};

const riskColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

export default function InternalControlsDocumentationPage() {
  const [expandedCategories, setExpandedCategories] = useState(['Cash & Treasury', 'Accounts Payable']);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const allControls = mockControls.flatMap(c => c.controls);
  const stats = {
    total: allControls.length,
    effective: allControls.filter(c => c.status === 'effective').length,
    needsImprovement: allControls.filter(c => c.status === 'needs_improvement').length,
    highRisk: allControls.filter(c => c.riskLevel === 'high').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Internal Controls Documentation</h1>
          <p className="text-gray-600">Document and track internal control effectiveness</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><FileText className="w-4 h-4 mr-2" />Export Matrix</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Add Control</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Controls</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{stats.effective}</p>
          <p className="text-sm text-gray-600">Effective</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.needsImprovement}</p>
          <p className="text-sm text-gray-600">Needs Improvement</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
          <p className="text-sm text-gray-600">High Risk Controls</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input placeholder="Search controls..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-4">
        {mockControls.map((category) => {
          const isExpanded = expandedCategories.includes(category.category);
          const categoryStats = {
            effective: category.controls.filter(c => c.status === 'effective').length,
            total: category.controls.length
          };

          return (
            <div key={category.category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCategory(category.category)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{category.category}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{categoryStats.effective}/{categoryStats.total} effective</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(categoryStats.effective / categoryStats.total) * 100}%` }} />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-sm text-gray-500">
                        <th className="p-4">Control</th>
                        <th className="p-4">Frequency</th>
                        <th className="p-4">Owner</th>
                        <th className="p-4">Risk</th>
                        <th className="p-4">Last Tested</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.controls.map((control) => (
                        <tr key={control.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <p className="font-medium text-gray-900">{control.name}</p>
                            <p className="text-sm text-gray-500">{control.description}</p>
                          </td>
                          <td className="p-4 text-sm">{control.frequency}</td>
                          <td className="p-4 text-sm">{control.owner}</td>
                          <td className="p-4">
                            <span className={cn("px-2 py-0.5 rounded text-xs", riskColors[control.riskLevel])}>
                              {control.riskLevel.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-sm">{control.lastTested}</td>
                          <td className="p-4">
                            <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[control.status].color)}>
                              {statusConfig[control.status].label}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
