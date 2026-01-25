import React, { useState, useMemo } from 'react';
import {
  Calendar, CheckCircle, XCircle, Clock, AlertTriangle, Lock,
  User, FileText, RefreshCw, ChevronDown, ChevronRight, Play,
  Pause, SkipForward, CheckSquare, Square, AlertCircle, Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mockClosePeriods = [
  {
    id: 'CLOSE-2024-01',
    period: 'January 2024',
    startDate: '2024-02-01',
    targetDate: '2024-02-10',
    status: 'in_progress',
    progress: 65,
    assignedTo: 'Mike Chen',
    tasks: [
      {
        category: 'Accounts Receivable',
        items: [
          { id: 1, task: 'Review and post all cash receipts', status: 'completed', assignee: 'Lisa Wang', completedDate: '2024-02-02' },
          { id: 2, task: 'Reconcile AR subledger to GL', status: 'completed', assignee: 'Lisa Wang', completedDate: '2024-02-03' },
          { id: 3, task: 'Review AR aging and bad debt allowance', status: 'completed', assignee: 'Lisa Wang', completedDate: '2024-02-04' },
          { id: 4, task: 'Post AR adjustments', status: 'in_progress', assignee: 'Lisa Wang', completedDate: null }
        ]
      },
      {
        category: 'Accounts Payable',
        items: [
          { id: 5, task: 'Review and post all invoices received', status: 'completed', assignee: 'Tom Davis', completedDate: '2024-02-02' },
          { id: 6, task: 'Reconcile AP subledger to GL', status: 'completed', assignee: 'Tom Davis', completedDate: '2024-02-03' },
          { id: 7, task: 'Review accrued expenses', status: 'in_progress', assignee: 'Tom Davis', completedDate: null },
          { id: 8, task: 'Verify vendor statement reconciliations', status: 'pending', assignee: 'Tom Davis', completedDate: null }
        ]
      },
      {
        category: 'Cash & Bank',
        items: [
          { id: 9, task: 'Complete all bank reconciliations', status: 'completed', assignee: 'Sarah Johnson', completedDate: '2024-02-05' },
          { id: 10, task: 'Record bank fees and interest', status: 'completed', assignee: 'Sarah Johnson', completedDate: '2024-02-05' },
          { id: 11, task: 'Review outstanding checks', status: 'in_progress', assignee: 'Sarah Johnson', completedDate: null }
        ]
      },
      {
        category: 'Fixed Assets',
        items: [
          { id: 12, task: 'Post depreciation entries', status: 'pending', assignee: 'Mike Chen', completedDate: null },
          { id: 13, task: 'Review asset additions/disposals', status: 'pending', assignee: 'Mike Chen', completedDate: null },
          { id: 14, task: 'Reconcile fixed asset register to GL', status: 'pending', assignee: 'Mike Chen', completedDate: null }
        ]
      },
      {
        category: 'Final Review',
        items: [
          { id: 21, task: 'Run trial balance and review for anomalies', status: 'pending', assignee: 'Mike Chen', completedDate: null },
          { id: 22, task: 'Review intercompany eliminations', status: 'pending', assignee: 'Mike Chen', completedDate: null },
          { id: 23, task: 'CFO final review and sign-off', status: 'pending', assignee: 'CFO', completedDate: null },
          { id: 24, task: 'Lock period in system', status: 'pending', assignee: 'Mike Chen', completedDate: null }
        ]
      }
    ]
  },
  {
    id: 'CLOSE-2023-12',
    period: 'December 2023',
    startDate: '2024-01-02',
    targetDate: '2024-01-12',
    status: 'completed',
    progress: 100,
    assignedTo: 'Mike Chen',
    completedDate: '2024-01-11',
    tasks: []
  }
];

const statusConfig = {
  pending: { label: 'Not Started', color: 'bg-gray-100 text-gray-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
};

export default function MonthEndCloseWorkflowPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(mockClosePeriods[0]);
  const [expandedCategories, setExpandedCategories] = useState(['Accounts Receivable', 'Accounts Payable', 'Cash & Bank']);

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const taskStats = useMemo(() => {
    if (!selectedPeriod.tasks.length) return { total: 0, completed: 0, inProgress: 0, pending: 0 };
    const allTasks = selectedPeriod.tasks.flatMap(cat => cat.items);
    return {
      total: allTasks.length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      inProgress: allTasks.filter(t => t.status === 'in_progress').length,
      pending: allTasks.filter(t => t.status === 'pending').length
    };
  }, [selectedPeriod]);

  const daysRemaining = useMemo(() => {
    if (selectedPeriod.status === 'completed') return 0;
    const target = new Date(selectedPeriod.targetDate);
    const today = new Date();
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }, [selectedPeriod]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Month-End Close Workflow</h1>
          <p className="text-gray-600">Manage and track the month-end closing process</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><FileText className="w-4 h-4 mr-2" />Close Template</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Play className="w-4 h-4 mr-2" />Start New Period</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Close Periods</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {mockClosePeriods.map((period) => (
                <div
                  key={period.id}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                    selectedPeriod?.id === period.id && "bg-blue-50 border-l-4 border-blue-500"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{period.period}</span>
                    {period.status === 'completed' ? <Lock className="w-4 h-4 text-green-600" /> : <Unlock className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", period.progress === 100 ? "bg-green-500" : "bg-blue-500")} style={{ width: `${period.progress}%` }} />
                    </div>
                    <span className="text-sm text-gray-600">{period.progress}%</span>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[period.status].color)}>{statusConfig[period.status].label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">{selectedPeriod.period} Close</h2>
                  <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedPeriod.status].color)}>{statusConfig[selectedPeriod.status].label}</span>
                </div>
                <p className="text-gray-600 mt-1">Lead: {selectedPeriod.assignedTo}</p>
              </div>
              {selectedPeriod.status !== 'completed' && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700"><Lock className="w-4 h-4 mr-1" />Complete & Lock</Button>
              )}
            </div>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                <p className="text-sm text-gray-600">Total Tasks</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className={cn("text-center p-3 rounded-lg", daysRemaining < 0 ? "bg-red-50" : "bg-gray-50")}>
                <p className={cn("text-2xl font-bold", daysRemaining < 0 ? "text-red-600" : "text-gray-900")}>{selectedPeriod.status === 'completed' ? '✓' : `${daysRemaining}d`}</p>
                <p className="text-sm text-gray-600">{selectedPeriod.status === 'completed' ? 'Closed' : 'Remaining'}</p>
              </div>
            </div>
          </div>

          {selectedPeriod.status !== 'completed' && (
            <div className="space-y-3">
              {selectedPeriod.tasks.map((category) => {
                const completedCount = category.items.filter(i => i.status === 'completed').length;
                const isExpanded = expandedCategories.includes(category.category);
                return (
                  <div key={category.category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => toggleCategory(category.category)}>
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        <h3 className="font-semibold text-gray-900">{category.category}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{completedCount} / {category.items.length}</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${(completedCount / category.items.length) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        {category.items.map((item) => (
                          <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                              {item.status === 'completed' ? <CheckSquare className="w-5 h-5 text-green-600" /> : item.status === 'in_progress' ? <RefreshCw className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                              <div>
                                <p className={cn("text-sm", item.status === 'completed' ? "text-gray-500 line-through" : "text-gray-900")}>{item.task}</p>
                                <p className="text-xs text-gray-500">{item.assignee}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.completedDate && <span className="text-xs text-gray-500">{item.completedDate}</span>}
                              {item.status === 'pending' && <Button variant="ghost" size="sm" className="text-blue-600">Start</Button>}
                              {item.status === 'in_progress' && <Button variant="ghost" size="sm" className="text-green-600">Complete</Button>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedPeriod.status === 'completed' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Period Successfully Closed</h3>
                  <p className="text-sm text-gray-600">Completed on {selectedPeriod.completedDate}</p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">This accounting period has been closed and locked. All transactions for {selectedPeriod.period} have been finalized.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
