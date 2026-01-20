import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Home, Users, Calendar, CheckCircle, Clock, AlertTriangle, Building2, HardHat, Percent, ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ProjectOverviewPage = ({ projectId }) => {
  const project = {
    name: 'Oakridge Estates',
    type: 'Spec Build',
    address: '1250 Oakridge Drive, Greenville, SC 29607',
    status: 'Under Construction',
    startDate: '2024-01-15',
    estCompletion: '2025-06-30',
    daysRemaining: 185,
    totalUnits: 12,
  };

  const metrics = {
    // Construction
    constructionProgress: 68,
    tasksComplete: 24,
    tasksPending: 8,
    inspectionsPassed: 18,
    inspectionsPending: 3,
    
    // Budget
    totalBudget: 6850000,
    spentToDate: 4650000,
    remaining: 2200000,
    budgetVariance: -2.3,
    contingencyUsed: 45000,
    contingencyRemaining: 147000,
    
    // Sales
    unitsSold: 1,
    unitsUnderContract: 1,
    unitsAvailable: 10,
    salesRevenue: 420000,
    projectedRevenue: 4840000,
    
    // Finance
    loanBalance: 3950000,
    equityCalled: 2125000,
    irr: 32.5,
    equityMultiple: 1.46,
    cashOnCash: 18.2,
    
    // Timeline
    onSchedule: true,
    daysAhead: 5,
  };

  const recentActivity = [
    { action: 'Draw #12 funded', amount: 445000, date: 'Today', type: 'finance' },
    { action: 'Unit 1 closed', amount: 420000, date: 'Dec 20', type: 'sales' },
    { action: 'Framing inspection passed - Unit 5', date: 'Dec 18', type: 'construction' },
    { action: 'Q4 Investor report sent', date: 'Dec 15', type: 'investor' },
    { action: 'Change order approved - Electrical', amount: 4500, date: 'Dec 12', type: 'budget' },
  ];

  const upcomingTasks = [
    { task: 'Schedule Unit 5 framing inspection', due: 'Dec 30', priority: 'high' },
    { task: 'Follow up with Jennifer Martinez', due: 'Dec 29', priority: 'high' },
    { task: 'Review electrical change order', due: 'Dec 29', priority: 'medium' },
    { task: 'Prepare Draw #13 request', due: 'Jan 2', priority: 'medium' },
  ];

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{project.status}</span>
          </div>
          <p className="text-sm text-gray-500">{project.address}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><BarChart3 className="w-4 h-4 mr-1" />Reports</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm">Project Settings</Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <HardHat className="w-5 h-5 text-blue-500" />
            <span className={cn("text-xs px-2 py-0.5 rounded", metrics.onSchedule ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
              {metrics.onSchedule ? `${metrics.daysAhead} days ahead` : 'Behind'}
            </span>
          </div>
          <p className="text-2xl font-bold">{metrics.constructionProgress}%</p>
          <p className="text-xs text-gray-500">Construction</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-xs text-green-600 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />{Math.abs(metrics.budgetVariance)}% under
            </span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(metrics.spentToDate)}</p>
          <p className="text-xs text-gray-500">Spent / {formatCurrency(metrics.totalBudget)}</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Home className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{metrics.unitsSold + metrics.unitsUnderContract}/{project.totalUnits}</p>
          <p className="text-xs text-gray-500">Units Sold/Contract</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Percent className="w-5 h-5 text-[#047857]" />
          </div>
          <p className="text-2xl font-bold">{metrics.irr}%</p>
          <p className="text-xs text-gray-500">Projected IRR</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-[#047857]" />
          </div>
          <p className="text-2xl font-bold">{metrics.equityMultiple}x</p>
          <p className="text-xs text-gray-500">Equity Multiple</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold">{metrics.daysRemaining}</p>
          <p className="text-xs text-gray-500">Days to Completion</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Progress & Budget */}
        <div className="col-span-2 space-y-6">
          {/* Construction Progress */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Construction Progress</h3>
              <Button variant="outline" size="sm">View Details <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>{metrics.constructionProgress}% Complete</span>
                <span className="text-gray-500">Est. Completion: {project.estCompletion}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#047857] rounded-full" style={{ width: `${metrics.constructionProgress}%` }}></div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="font-semibold text-green-700">{metrics.tasksComplete}</p>
                <p className="text-green-600 text-xs">Tasks Done</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="font-semibold text-amber-700">{metrics.tasksPending}</p>
                <p className="text-amber-600 text-xs">Pending</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="font-semibold text-green-700">{metrics.inspectionsPassed}</p>
                <p className="text-green-600 text-xs">Inspections ✓</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="font-semibold text-blue-700">{metrics.inspectionsPending}</p>
                <p className="text-blue-600 text-xs">Pending Insp.</p>
              </div>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Budget Summary</h3>
              <Button variant="outline" size="sm">View Budget <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-xl font-semibold">{formatCurrency(metrics.totalBudget)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Spent to Date</p>
                <p className="text-xl font-semibold text-blue-600">{formatCurrency(metrics.spentToDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-xl font-semibold">{formatCurrency(metrics.remaining)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Budget Variance</span>
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />{Math.abs(metrics.budgetVariance)}% under budget
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Contingency Remaining</span>
                <span className="font-medium">{formatCurrency(metrics.contingencyRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Sales Pipeline */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Sales Pipeline</h3>
              <Button variant="outline" size="sm">View Sales <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-green-700">{metrics.unitsSold}</span>
                </div>
                <p className="text-sm text-gray-600">Sold</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-blue-700">{metrics.unitsUnderContract}</span>
                </div>
                <p className="text-sm text-gray-600">Under Contract</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-gray-700">{metrics.unitsAvailable}</span>
                </div>
                <p className="text-sm text-gray-600">Available</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-purple-700">{project.totalUnits}</span>
                </div>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
            <div className="flex justify-between text-sm pt-4 border-t">
              <span className="text-gray-500">Revenue Collected</span>
              <span className="font-semibold text-green-600">{formatCurrency(metrics.salesRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Projected Total</span>
              <span className="font-semibold">{formatCurrency(metrics.projectedRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Activity & Tasks */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5",
                    item.type === 'finance' ? "bg-green-500" :
                    item.type === 'sales' ? "bg-purple-500" :
                    item.type === 'construction' ? "bg-blue-500" :
                    item.type === 'investor' ? "bg-amber-500" :
                    "bg-gray-500"
                  )}></div>
                  <div className="flex-1">
                    <p>{item.action}</p>
                    {item.amount && <p className="text-green-600 font-medium">{formatCurrency(item.amount)}</p>}
                  </div>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Upcoming Tasks</h3>
            <div className="space-y-3">
              {upcomingTasks.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    item.priority === 'high' ? "bg-red-500" : "bg-amber-500"
                  )}></div>
                  <div className="flex-1">
                    <p className="truncate">{item.task}</p>
                  </div>
                  <span className="text-xs text-gray-500">{item.due}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">View All Tasks</Button>
          </div>

          {/* Investor Metrics */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Investor Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Equity Called</span>
                <span className="font-medium">{formatCurrency(metrics.equityCalled)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Loan Balance</span>
                <span className="font-medium">{formatCurrency(metrics.loanBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Projected IRR</span>
                <span className="font-medium text-[#047857]">{metrics.irr}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Equity Multiple</span>
                <span className="font-medium text-[#047857]">{metrics.equityMultiple}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Cash on Cash</span>
                <span className="font-medium">{metrics.cashOnCash}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewPage;
