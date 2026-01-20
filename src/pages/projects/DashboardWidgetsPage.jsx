import React, { useState } from 'react';
import { Plus, Settings, X, GripVertical, BarChart3, DollarSign, TrendingUp, Users, Home, Calendar, CheckCircle, AlertTriangle, Clock, ArrowUp, ArrowDown, FileText, HardHat, Percent, Target, Activity, PieChart, Eye, EyeOff, RefreshCw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DashboardWidgetsPage = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);

  const [widgets, setWidgets] = useState([
    { id: 'budget-summary', type: 'budget-summary', size: 'medium', visible: true },
    { id: 'construction-progress', type: 'construction-progress', size: 'medium', visible: true },
    { id: 'sales-pipeline', type: 'sales-pipeline', size: 'medium', visible: true },
    { id: 'upcoming-tasks', type: 'upcoming-tasks', size: 'medium', visible: true },
    { id: 'cash-flow-mini', type: 'cash-flow-mini', size: 'large', visible: true },
    { id: 'investor-returns', type: 'investor-returns', size: 'small', visible: true },
    { id: 'schedule-status', type: 'schedule-status', size: 'small', visible: true },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', visible: true },
  ]);

  const widgetTypes = [
    { type: 'budget-summary', name: 'Budget Summary', icon: DollarSign, description: 'Budget vs actuals overview' },
    { type: 'construction-progress', name: 'Construction Progress', icon: HardHat, description: 'Overall construction status' },
    { type: 'sales-pipeline', name: 'Sales Pipeline', icon: Home, description: 'Unit sales status' },
    { type: 'upcoming-tasks', name: 'Upcoming Tasks', icon: CheckCircle, description: 'Next tasks due' },
    { type: 'cash-flow-mini', name: 'Cash Flow Chart', icon: TrendingUp, description: 'Monthly cash flow' },
    { type: 'investor-returns', name: 'Investor Returns', icon: Users, description: 'IRR and equity multiple' },
    { type: 'schedule-status', name: 'Schedule Status', icon: Calendar, description: 'Project timeline' },
    { type: 'recent-activity', name: 'Recent Activity', icon: Activity, description: 'Latest updates' },
    { type: 'permit-status', name: 'Permit Status', icon: FileText, description: 'Permit tracking' },
    { type: 'draw-status', name: 'Draw Status', icon: BarChart3, description: 'Loan draw progress' },
  ];

  const toggleWidgetVisibility = (widgetId) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  };

  const addWidget = (type) => {
    const widgetType = widgetTypes.find(w => w.type === type);
    const newWidget = {
      id: `${type}-${Date.now()}`,
      type,
      size: 'medium',
      visible: true,
    };
    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetPicker(false);
  };

  // Widget Components
  const BudgetSummaryWidget = () => (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Total Budget</span>
        <span className="font-semibold">$6.85M</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Spent to Date</span>
        <span className="font-semibold text-blue-600">$4.65M</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Remaining</span>
        <span className="font-semibold">$2.20M</span>
      </div>
      <div className="pt-2">
        <div className="flex justify-between text-xs mb-1">
          <span>68% Complete</span>
          <span className="text-green-600">-2.3% Under Budget</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#047857] rounded-full" style={{ width: '68%' }}></div>
        </div>
      </div>
    </div>
  );

  const ConstructionProgressWidget = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">68%</span>
        <span className="text-green-600 text-sm flex items-center gap-1">
          <ArrowUp className="w-3 h-3" />+3% this month
        </span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#047857] rounded-full" style={{ width: '68%' }}></div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-green-50 rounded p-2">
          <p className="font-semibold text-green-700">8</p>
          <p className="text-green-600">Complete</p>
        </div>
        <div className="bg-blue-50 rounded p-2">
          <p className="font-semibold text-blue-700">3</p>
          <p className="text-blue-600">In Progress</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="font-semibold text-gray-700">1</p>
          <p className="text-gray-600">Not Started</p>
        </div>
      </div>
    </div>
  );

  const SalesPipelineWidget = () => (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span>Sold</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: '8.3%' }}></div>
          </div>
          <span className="font-semibold w-12 text-right">1/12</span>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span>Under Contract</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: '8.3%' }}></div>
          </div>
          <span className="font-semibold w-12 text-right">1/12</span>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span>Available</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gray-400" style={{ width: '83.3%' }}></div>
          </div>
          <span className="font-semibold w-12 text-right">10/12</span>
        </div>
      </div>
      <div className="pt-2 border-t mt-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Total Sales Value</span>
          <span className="font-medium text-gray-700">$520K / $4.84M</span>
        </div>
      </div>
    </div>
  );

  const UpcomingTasksWidget = () => (
    <div className="space-y-2">
      {[
        { task: 'Schedule Unit 5 framing inspection', due: 'Dec 30', priority: 'high' },
        { task: 'Follow up with Jennifer Martinez', due: 'Dec 29', priority: 'high' },
        { task: 'Review electrical change order', due: 'Dec 29', priority: 'medium' },
        { task: 'Coordinate HVAC rough-in Unit 4', due: 'Dec 31', priority: 'high' },
      ].map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <div className={cn("w-1.5 h-1.5 rounded-full", item.priority === 'high' ? "bg-red-500" : "bg-amber-500")}></div>
          <span className="flex-1 truncate">{item.task}</span>
          <span className="text-xs text-gray-500">{item.due}</span>
        </div>
      ))}
      <button className="text-xs text-[#047857] hover:underline mt-1">View all tasks →</button>
    </div>
  );

  const CashFlowMiniWidget = () => (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <div>
          <p className="text-gray-500">Cash In (MTD)</p>
          <p className="text-lg font-semibold text-green-600">+$520,000</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500">Cash Out (MTD)</p>
          <p className="text-lg font-semibold text-red-600">-$445,000</p>
        </div>
      </div>
      <div className="h-24 bg-gray-50 rounded flex items-end justify-around px-2">
        {[65, 40, 85, 55, 70, 45, 90, 60, 75, 50, 80, 55].map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div className="w-4 bg-green-400 rounded-t" style={{ height: `${h * 0.8}%` }}></div>
            <div className="w-4 bg-red-300 rounded-b" style={{ height: `${(100 - h) * 0.4}%` }}></div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Jan</span>
        <span>Jun</span>
        <span>Dec</span>
      </div>
    </div>
  );

  const InvestorReturnsWidget = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-[#047857]">32.5%</p>
        <p className="text-xs text-gray-500">Projected IRR</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-[#047857]">1.46x</p>
        <p className="text-xs text-gray-500">Equity Multiple</p>
      </div>
    </div>
  );

  const ScheduleStatusWidget = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Status</span>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">On Track</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Est. Completion</span>
        <span className="font-medium">Jun 2025</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Days Remaining</span>
        <span className="font-medium">185</span>
      </div>
    </div>
  );

  const RecentActivityWidget = () => (
    <div className="space-y-2">
      {[
        { action: 'Draw #12 approved', time: '2 hours ago', icon: DollarSign, color: 'text-green-500' },
        { action: 'Unit 5 framing complete', time: '5 hours ago', icon: CheckCircle, color: 'text-blue-500' },
        { action: 'New lead: Jennifer M.', time: 'Yesterday', icon: Users, color: 'text-purple-500' },
        { action: 'Investor report sent', time: 'Yesterday', icon: FileText, color: 'text-amber-500' },
      ].map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <Icon className={cn("w-4 h-4", item.color)} />
            <span className="flex-1 truncate">{item.action}</span>
            <span className="text-xs text-gray-400">{item.time}</span>
          </div>
        );
      })}
    </div>
  );

  const renderWidget = (widget) => {
    const widgetType = widgetTypes.find(w => w.type === widget.type);
    const Icon = widgetType?.icon || BarChart3;

    const content = {
      'budget-summary': <BudgetSummaryWidget />,
      'construction-progress': <ConstructionProgressWidget />,
      'sales-pipeline': <SalesPipelineWidget />,
      'upcoming-tasks': <UpcomingTasksWidget />,
      'cash-flow-mini': <CashFlowMiniWidget />,
      'investor-returns': <InvestorReturnsWidget />,
      'schedule-status': <ScheduleStatusWidget />,
      'recent-activity': <RecentActivityWidget />,
    }[widget.type] || <div className="text-gray-400 text-sm">Widget content</div>;

    return (
      <div 
        key={widget.id}
        className={cn(
          "bg-white border rounded-lg overflow-hidden",
          widget.size === 'small' && "col-span-1",
          widget.size === 'medium' && "col-span-1",
          widget.size === 'large' && "col-span-2",
          !widget.visible && "opacity-50"
        )}
      >
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            {isEditing && <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />}
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm">{widgetType?.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button onClick={() => toggleWidgetVisibility(widget.id)} className="p-1 hover:bg-gray-200 rounded">
                  {widget.visible ? <Eye className="w-4 h-4 text-gray-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </>
            ) : (
              <>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <RefreshCw className="w-3 h-3 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <Maximize2 className="w-3 h-3 text-gray-400" />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="p-4">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Project Dashboard</h1>
          <p className="text-sm text-gray-500">Oakridge Estates • Last updated: Just now</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowWidgetPicker(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Widget
          </Button>
          <Button 
            variant={isEditing ? "default" : "outline"} 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "bg-[#047857] hover:bg-[#065f46]" : ""}
          >
            <Settings className="w-4 h-4 mr-1" />{isEditing ? 'Done' : 'Customize'}
          </Button>
        </div>
      </div>

      {/* Key Metrics Bar */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#047857]">68%</p>
          <p className="text-xs text-gray-500">Construction</p>
        </div>
        <div className="bg-white border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">$4.65M</p>
          <p className="text-xs text-gray-500">Spent</p>
        </div>
        <div className="bg-white border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">1/12</p>
          <p className="text-xs text-gray-500">Units Sold</p>
        </div>
        <div className="bg-white border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">1</p>
          <p className="text-xs text-gray-500">Under Contract</p>
        </div>
        <div className="bg-white border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">32.5%</p>
          <p className="text-xs text-gray-500">IRR</p>
        </div>
        <div className="bg-white border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">On Track</p>
          <p className="text-xs text-gray-500">Schedule</p>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-3 gap-4">
        {widgets.filter(w => w.visible || isEditing).map(widget => renderWidget(widget))}
      </div>

      {/* Widget Picker Modal */}
      {showWidgetPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Add Widget</h3>
              <button onClick={() => setShowWidgetPicker(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {widgetTypes.map((widget) => {
                const Icon = widget.icon;
                const isAdded = widgets.some(w => w.type === widget.type);
                return (
                  <button
                    key={widget.type}
                    onClick={() => !isAdded && addWidget(widget.type)}
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg text-left hover:border-[#047857] transition-colors",
                      isAdded && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isAdded}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{widget.name}</p>
                      <p className="text-xs text-gray-500">{widget.description}</p>
                      {isAdded && <p className="text-xs text-[#047857] mt-1">Already added</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardWidgetsPage;
