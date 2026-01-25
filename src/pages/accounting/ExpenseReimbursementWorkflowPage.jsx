import React, { useState, useMemo } from 'react';
import {
  Receipt, CheckCircle, XCircle, Clock, AlertTriangle, User,
  DollarSign, Calendar, Filter, Search, Eye, ThumbsUp, Plus,
  ThumbsDown, MessageSquare, Upload, Image, FileText, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockExpenseReports = [
  {
    id: 'EXP-2024-0156',
    employee: 'Sarah Johnson',
    employeeId: 'E-102',
    department: 'Finance',
    title: 'Q1 Property Site Visits',
    submittedDate: '2024-01-20',
    totalAmount: 2847.50,
    status: 'pending_approval',
    currentApprover: 'Mike Chen',
    expenses: [
      { id: 1, date: '2024-01-15', category: 'Travel', description: 'Flight to Denver - Riverside inspection', amount: 485.00, receipt: true },
      { id: 2, date: '2024-01-15', category: 'Lodging', description: 'Hotel - 2 nights Denver', amount: 378.00, receipt: true },
      { id: 3, date: '2024-01-16', category: 'Meals', description: 'Client dinner - Riverside team', amount: 245.50, receipt: true },
      { id: 4, date: '2024-01-17', category: 'Travel', description: 'Rental car - Denver', amount: 189.00, receipt: true },
      { id: 5, date: '2024-01-18', category: 'Travel', description: 'Flight to Phoenix - Oak St inspection', amount: 425.00, receipt: true },
      { id: 6, date: '2024-01-18', category: 'Lodging', description: 'Hotel - 1 night Phoenix', amount: 195.00, receipt: true },
      { id: 7, date: '2024-01-19', category: 'Transportation', description: 'Uber/Lyft - Phoenix', amount: 85.00, receipt: true },
      { id: 8, date: '2024-01-19', category: 'Meals', description: 'Team lunch - Phoenix office', amount: 145.00, receipt: true },
      { id: 9, date: '2024-01-20', category: 'Parking', description: 'Airport parking - 5 days', amount: 125.00, receipt: true },
      { id: 10, date: '2024-01-20', category: 'Mileage', description: 'Personal vehicle - 350 miles @ $0.67', amount: 234.50, receipt: false },
      { id: 11, date: '2024-01-20', category: 'Office Supplies', description: 'Presentation materials', amount: 45.00, receipt: true },
      { id: 12, date: '2024-01-20', category: 'Misc', description: 'Printing/copying at hotel', amount: 15.50, receipt: true }
    ],
    approvalChain: [
      { name: 'Sarah Johnson', role: 'Submitter', action: 'submitted', date: '2024-01-20' },
      { name: 'Mike Chen', role: 'Manager', action: 'pending', date: null }
    ],
    policyViolations: []
  },
  {
    id: 'EXP-2024-0155',
    employee: 'Tom Davis',
    employeeId: 'E-108',
    department: 'Accounting',
    title: 'Conference - NAREIT Annual',
    submittedDate: '2024-01-18',
    totalAmount: 4125.00,
    status: 'pending_approval',
    currentApprover: 'Sarah Johnson',
    expenses: [
      { id: 1, date: '2024-01-10', category: 'Conference', description: 'NAREIT registration fee', amount: 1500.00, receipt: true },
      { id: 2, date: '2024-01-12', category: 'Travel', description: 'Flight to Las Vegas', amount: 425.00, receipt: true },
      { id: 3, date: '2024-01-12', category: 'Lodging', description: 'Hotel - 3 nights', amount: 875.00, receipt: true },
      { id: 4, date: '2024-01-13', category: 'Meals', description: 'Per diem - 3 days', amount: 225.00, receipt: false },
      { id: 5, date: '2024-01-14', category: 'Transportation', description: 'Ground transport', amount: 150.00, receipt: true },
      { id: 6, date: '2024-01-15', category: 'Meals', description: 'Networking dinner', amount: 350.00, receipt: true },
      { id: 7, date: '2024-01-15', category: 'Entertainment', description: 'Client entertainment', amount: 600.00, receipt: true }
    ],
    approvalChain: [
      { name: 'Tom Davis', role: 'Submitter', action: 'submitted', date: '2024-01-18' },
      { name: 'Sarah Johnson', role: 'Manager', action: 'pending', date: null },
      { name: 'Mike Chen', role: 'Director', action: 'pending', date: null }
    ],
    policyViolations: [
      { expense: 'Client entertainment', violation: 'Exceeds $500 limit - requires additional approval' }
    ]
  },
  {
    id: 'EXP-2024-0154',
    employee: 'Lisa Wang',
    employeeId: 'E-115',
    department: 'Operations',
    title: 'January Office Supplies',
    submittedDate: '2024-01-15',
    totalAmount: 342.75,
    status: 'approved',
    currentApprover: null,
    expenses: [
      { id: 1, date: '2024-01-08', category: 'Office Supplies', description: 'Printer cartridges', amount: 156.00, receipt: true },
      { id: 2, date: '2024-01-10', category: 'Office Supplies', description: 'Paper and folders', amount: 89.50, receipt: true },
      { id: 3, date: '2024-01-12', category: 'Software', description: 'Monthly subscription - Adobe', amount: 54.99, receipt: true },
      { id: 4, date: '2024-01-14', category: 'Office Supplies', description: 'Desk organizers', amount: 42.26, receipt: true }
    ],
    approvalChain: [
      { name: 'Lisa Wang', role: 'Submitter', action: 'submitted', date: '2024-01-15' },
      { name: 'Tom Davis', role: 'Manager', action: 'approved', date: '2024-01-16' }
    ],
    policyViolations: []
  }
];

const categoryIcons = {
  Travel: '✈️',
  Lodging: '🏨',
  Meals: '🍽️',
  Transportation: '🚗',
  Conference: '🎫',
  'Office Supplies': '📎',
  Software: '💻',
  Entertainment: '🎭',
  Parking: '🅿️',
  Mileage: '🛣️',
  Misc: '📦'
};

const statusConfig = {
  pending_approval: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  paid: { label: 'Paid', color: 'bg-blue-100 text-blue-800' }
};

export default function ExpenseReimbursementWorkflowPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(mockExpenseReports[0]);

  const filteredReports = useMemo(() => {
    return mockExpenseReports.filter(report => {
      const matchesFilter = filter === 'all' || report.status === filter;
      const matchesSearch = report.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => ({
    pending: mockExpenseReports.filter(r => r.status === 'pending_approval').length,
    pendingAmount: mockExpenseReports.filter(r => r.status === 'pending_approval').reduce((sum, r) => sum + r.totalAmount, 0),
    approved: mockExpenseReports.filter(r => r.status === 'approved').length,
    violations: mockExpenseReports.reduce((sum, r) => sum + r.policyViolations.length, 0)
  }), []);

  const expensesByCategory = useMemo(() => {
    if (!selectedReport) return [];
    const categories = {};
    selectedReport.expenses.forEach(exp => {
      if (!categories[exp.category]) categories[exp.category] = 0;
      categories[exp.category] += exp.amount;
    });
    return Object.entries(categories).sort((a, b) => b[1] - a[1]);
  }, [selectedReport]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Reimbursement</h1>
          <p className="text-gray-600">Submit and approve employee expense reports</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />New Expense Report
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><DollarSign className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${stats.pendingAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Pending Amount</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.violations}</p>
              <p className="text-sm text-gray-600">Policy Violations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search expense reports..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'pending_approval', 'approved'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : statusConfig[f]?.label || f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedReport?.id === report.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{report.employee}</p>
                  <p className="text-sm text-gray-500">{report.id}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[report.status].color)}>{statusConfig[report.status].label}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{report.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">${report.totalAmount.toLocaleString()}</span>
                <span className="text-xs text-gray-500">{report.expenses.length} items</span>
              </div>
              {report.policyViolations.length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">{report.policyViolations.length} policy violation(s)</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedReport && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedReport.title}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedReport.status].color)}>{statusConfig[selectedReport.status].label}</span>
                    </div>
                    <p className="text-gray-600">{selectedReport.employee} • {selectedReport.department}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${selectedReport.totalAmount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {expensesByCategory.slice(0, 4).map(([category, amount]) => (
                    <div key={category} className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-lg">{categoryIcons[category] || '📄'}</p>
                      <p className="text-sm font-medium text-gray-900">${amount.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">{category}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReport.policyViolations.length > 0 && (
                <div className="px-6 py-3 bg-red-50 border-b border-red-100">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Policy Violations</span>
                  </div>
                  {selectedReport.policyViolations.map((v, idx) => (
                    <p key={idx} className="text-sm text-red-600 mt-1">• {v.expense}: {v.violation}</p>
                  ))}
                </div>
              )}

              <div className="p-6 border-b border-gray-200 max-h-80 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Expense Items</h3>
                <div className="space-y-2">
                  {selectedReport.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{categoryIcons[expense.category] || '📄'}</span>
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <p className="text-sm text-gray-500">{expense.date} • {expense.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</span>
                        {expense.receipt ? (
                          <span className="text-green-600"><Image className="w-4 h-4" /></span>
                        ) : (
                          <span className="text-gray-400" title="No receipt"><FileText className="w-4 h-4" /></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Approval History</h3>
                <div className="space-y-3">
                  {selectedReport.approvalChain.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        step.action === 'approved' || step.action === 'submitted' ? "bg-green-100" :
                        step.action === 'rejected' ? "bg-red-100" : "bg-gray-100"
                      )}>
                        {step.action === 'approved' || step.action === 'submitted' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                         step.action === 'rejected' ? <XCircle className="w-4 h-4 text-red-600" /> :
                         <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{step.name} <span className="font-normal text-gray-500">({step.role})</span></p>
                        <p className="text-sm text-gray-500 capitalize">{step.action} {step.date && `• ${step.date}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReport.status === 'pending_approval' && (
                <div className="p-6 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Input placeholder="Add a comment..." className="flex-1" />
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"><ThumbsDown className="w-4 h-4 mr-2" />Reject</Button>
                    <Button className="bg-green-600 hover:bg-green-700"><ThumbsUp className="w-4 h-4 mr-2" />Approve</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
