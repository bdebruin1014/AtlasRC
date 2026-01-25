import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  LayoutDashboard,
  Plus,
  Save,
  Settings,
  Trash2,
  Move,
  GripVertical,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Activity,
  Target,
  Briefcase,
  X,
  Edit,
  Copy,
  Eye,
  ChevronDown,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Available widget types
const widgetTypes = [
  { id: 'stats', name: 'Statistics Card', icon: BarChart3, category: 'metrics' },
  { id: 'chart-bar', name: 'Bar Chart', icon: BarChart3, category: 'charts' },
  { id: 'chart-pie', name: 'Pie Chart', icon: PieChart, category: 'charts' },
  { id: 'chart-line', name: 'Line Chart', icon: TrendingUp, category: 'charts' },
  { id: 'tasks', name: 'Tasks List', icon: CheckCircle2, category: 'lists' },
  { id: 'projects', name: 'Projects Overview', icon: Building2, category: 'lists' },
  { id: 'contacts', name: 'Recent Contacts', icon: Users, category: 'lists' },
  { id: 'documents', name: 'Recent Documents', icon: FileText, category: 'lists' },
  { id: 'calendar', name: 'Calendar Preview', icon: Calendar, category: 'widgets' },
  { id: 'activity', name: 'Activity Feed', icon: Activity, category: 'widgets' },
  { id: 'goals', name: 'Goals Progress', icon: Target, category: 'metrics' },
  { id: 'deals', name: 'Deal Pipeline', icon: Briefcase, category: 'widgets' }
];

// Demo saved dashboards
const demoDashboards = [
  {
    id: '1',
    name: 'My Dashboard',
    description: 'Personal overview dashboard',
    is_default: true,
    layout: [
      { id: 'w1', type: 'stats', title: 'Total Revenue', config: { metric: 'revenue', period: 'month' }, position: { x: 0, y: 0, w: 1, h: 1 } },
      { id: 'w2', type: 'stats', title: 'Active Projects', config: { metric: 'projects' }, position: { x: 1, y: 0, w: 1, h: 1 } },
      { id: 'w3', type: 'stats', title: 'Pending Tasks', config: { metric: 'tasks' }, position: { x: 2, y: 0, w: 1, h: 1 } },
      { id: 'w4', type: 'stats', title: 'Open Deals', config: { metric: 'deals' }, position: { x: 3, y: 0, w: 1, h: 1 } },
      { id: 'w5', type: 'chart-bar', title: 'Monthly Revenue', config: { data: 'revenue', period: '6months' }, position: { x: 0, y: 1, w: 2, h: 2 } },
      { id: 'w6', type: 'tasks', title: 'My Tasks', config: { filter: 'assigned_to_me', limit: 5 }, position: { x: 2, y: 1, w: 2, h: 2 } },
      { id: 'w7', type: 'activity', title: 'Recent Activity', config: { limit: 10 }, position: { x: 0, y: 3, w: 2, h: 2 } },
      { id: 'w8', type: 'calendar', title: 'Upcoming Events', config: { days: 7 }, position: { x: 2, y: 3, w: 2, h: 2 } }
    ],
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2026-01-20T14:00:00Z'
  },
  {
    id: '2',
    name: 'Projects Overview',
    description: 'Project-focused dashboard',
    is_default: false,
    layout: [
      { id: 'w1', type: 'projects', title: 'Active Projects', config: { status: 'active', limit: 6 }, position: { x: 0, y: 0, w: 4, h: 2 } },
      { id: 'w2', type: 'chart-pie', title: 'Projects by Status', config: { data: 'project_status' }, position: { x: 0, y: 2, w: 2, h: 2 } },
      { id: 'w3', type: 'goals', title: 'Project Goals', config: { type: 'project' }, position: { x: 2, y: 2, w: 2, h: 2 } }
    ],
    created_at: '2025-11-15T08:00:00Z',
    updated_at: '2026-01-18T10:00:00Z'
  }
];

// Demo widget data
const demoWidgetData = {
  revenue: { value: 2450000, change: 12.5, period: 'vs last month' },
  projects: { value: 8, change: 2, period: 'active' },
  tasks: { value: 23, change: -5, period: 'pending' },
  deals: { value: 12, change: 3, period: 'in pipeline' },
  tasks_list: [
    { id: 1, title: 'Review lease agreement', due: '2026-01-26', priority: 'high' },
    { id: 2, title: 'Schedule property inspection', due: '2026-01-28', priority: 'medium' },
    { id: 3, title: 'Update vendor contracts', due: '2026-01-30', priority: 'low' },
    { id: 4, title: 'Prepare monthly report', due: '2026-01-31', priority: 'medium' },
    { id: 5, title: 'Follow up with investors', due: '2026-02-01', priority: 'high' }
  ],
  activity: [
    { id: 1, user: 'John Smith', action: 'updated', target: 'Sunset Towers budget', time: '5 min ago' },
    { id: 2, user: 'Sarah Johnson', action: 'created', target: 'new expense entry', time: '15 min ago' },
    { id: 3, user: 'Mike Chen', action: 'completed', target: 'Due diligence checklist', time: '1 hour ago' },
    { id: 4, user: 'Lisa Park', action: 'uploaded', target: '3 documents', time: '2 hours ago' },
    { id: 5, user: 'You', action: 'assigned', target: 'task to David', time: '3 hours ago' }
  ],
  calendar: [
    { id: 1, title: 'Team Meeting', date: '2026-01-26', time: '10:00 AM' },
    { id: 2, title: 'Property Tour - Harbor View', date: '2026-01-27', time: '2:00 PM' },
    { id: 3, title: 'Investor Call', date: '2026-01-28', time: '11:00 AM' },
    { id: 4, title: 'Contract Signing', date: '2026-01-29', time: '3:00 PM' }
  ],
  chart_revenue: [
    { month: 'Aug', value: 180000 },
    { month: 'Sep', value: 220000 },
    { month: 'Oct', value: 195000 },
    { month: 'Nov', value: 280000 },
    { month: 'Dec', value: 310000 },
    { month: 'Jan', value: 245000 }
  ]
};

export default function DashboardBuilder() {
  const [dashboards, setDashboards] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [selectedWidget, setSelectedWidget] = useState(null);

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setDashboards(demoDashboards);
        setCurrentDashboard(demoDashboards[0]);
      } else {
        const { data, error } = await supabase
          .from('custom_dashboards')
          .select('*')
          .order('is_default', { ascending: false });

        if (error) throw error;
        setDashboards(data || []);
        if (data?.length > 0) {
          setCurrentDashboard(data.find(d => d.is_default) || data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      setDashboards(demoDashboards);
      setCurrentDashboard(demoDashboards[0]);
    } finally {
      setLoading(false);
    }
  };

  const addWidget = (widgetType) => {
    if (!currentDashboard) return;

    const newWidget = {
      id: `w${Date.now()}`,
      type: widgetType.id,
      title: widgetType.name,
      config: {},
      position: { x: 0, y: 0, w: widgetType.id.includes('chart') ? 2 : 1, h: widgetType.id.includes('chart') || widgetType.id === 'tasks' || widgetType.id === 'activity' ? 2 : 1 }
    };

    setCurrentDashboard(prev => ({
      ...prev,
      layout: [...prev.layout, newWidget]
    }));
    setShowAddWidget(false);
  };

  const removeWidget = (widgetId) => {
    setCurrentDashboard(prev => ({
      ...prev,
      layout: prev.layout.filter(w => w.id !== widgetId)
    }));
  };

  const saveDashboard = () => {
    if (!dashboardName) return;

    const newDashboard = {
      ...currentDashboard,
      id: currentDashboard?.id || Date.now().toString(),
      name: dashboardName,
      description: dashboardDescription,
      updated_at: new Date().toISOString()
    };

    if (isDemoMode()) {
      const existingIndex = dashboards.findIndex(d => d.id === newDashboard.id);
      if (existingIndex >= 0) {
        setDashboards(prev => prev.map((d, i) => i === existingIndex ? newDashboard : d));
      } else {
        newDashboard.created_at = new Date().toISOString();
        setDashboards(prev => [...prev, newDashboard]);
      }
      setCurrentDashboard(newDashboard);
    }

    setShowSaveModal(false);
    setEditMode(false);
  };

  const createNewDashboard = () => {
    const newDashboard = {
      id: Date.now().toString(),
      name: 'New Dashboard',
      description: '',
      is_default: false,
      layout: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCurrentDashboard(newDashboard);
    setEditMode(true);
    setDashboardName('New Dashboard');
    setDashboardDescription('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const renderWidget = (widget) => {
    const widgetClass = `bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
      editMode ? 'cursor-move relative group' : ''
    }`;

    const header = (
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{widget.title}</h3>
        {editMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setSelectedWidget(widget)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Settings className="h-3 w-3 text-gray-500" />
            </button>
            <button
              onClick={() => removeWidget(widget.id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </button>
          </div>
        )}
      </div>
    );

    switch (widget.type) {
      case 'stats':
        const metric = widget.config.metric || 'revenue';
        const data = demoWidgetData[metric];
        return (
          <div className={widgetClass}>
            {editMode && <GripVertical className="absolute top-2 left-2 h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />}
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{widget.title}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metric === 'revenue' ? formatCurrency(data.value) : data.value}
            </div>
            <div className={`text-xs mt-1 flex items-center gap-1 ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
              {data.change >= 0 ? '+' : ''}{data.change}% {data.period}
            </div>
          </div>
        );

      case 'chart-bar':
        return (
          <div className={widgetClass}>
            {editMode && <GripVertical className="absolute top-2 left-2 h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />}
            {header}
            <div className="h-32 flex items-end justify-between gap-2">
              {demoWidgetData.chart_revenue.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(item.value / 320000) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-1">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'chart-pie':
        return (
          <div className={widgetClass}>
            {editMode && <GripVertical className="absolute top-2 left-2 h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />}
            {header}
            <div className="flex items-center justify-center h-32">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <circle cx="18" cy="18" r="15.91549431" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.91549431" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="40 60" strokeDashoffset="25" />
                  <circle cx="18" cy="18" r="15.91549431" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="30 70" strokeDashoffset="-15" />
                  <circle cx="18" cy="18" r="15.91549431" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-45" />
                </svg>
              </div>
              <div className="ml-4 text-xs space-y-1">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded" /> Active (40%)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded" /> Complete (30%)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded" /> Pending (20%)</div>
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className={widgetClass}>
            {editMode && <GripVertical className="absolute top-2 left-2 h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />}
            {header}
            <div className="space-y-2">
              {demoWidgetData.tasks_list.map(task => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-gray-300" />
                  <span className="flex-1 text-gray-700 dark:text-gray-300 truncate">{task.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{task.priority}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className={widgetClass}>
            {editMode && <GripVertical className="absolute top-2 left-2 h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />}
            {header}
            <div className="space-y-3">
              {demoWidgetData.activity.map(item => (
                <div key={item.id} className="flex items-start gap-2 text-sm">
                  <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white">{item.user}</span>
                    <span className="text-gray-600 dark:text-gray-400"> {item.action} </span>
                    <span className="text-gray-700 dark:text-gray-300">{item.target}</span>
                    <div className="text-xs text-gray-500">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className={widgetClass}>
            {editMode && <GripVertical className="absolute top-2 left-2 h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />}
            {header}
            <div className="space-y-2">
              {demoWidgetData.calendar.map(event => (
                <div key={event.id} className="flex items-center gap-3 text-sm">
                  <div className="w-10 text-center">
                    <div className="text-xs text-gray-500">{event.date.split('-')[1]}/{event.date.split('-')[2]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 dark:text-white">{event.title}</div>
                    <div className="text-xs text-gray-500">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className={widgetClass}>
            {editMode && <GripVertical className="absolute top-2 left-2 h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />}
            {header}
            <div className="grid grid-cols-2 gap-2">
              {['Sunset Towers', 'Harbor View', 'Mountain Ridge', 'Downtown Plaza'].map((project, idx) => (
                <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">{project}</div>
                  <div className="text-xs text-gray-500 mt-1">In Progress</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${60 + idx * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className={widgetClass}>
            {editMode && <GripVertical className="absolute top-2 left-2 h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />}
            {header}
            <div className="space-y-3">
              {[
                { name: 'Revenue Target', current: 2.4, target: 3, unit: 'M' },
                { name: 'Projects Completed', current: 3, target: 5, unit: '' },
                { name: 'New Acquisitions', current: 1, target: 2, unit: '' }
              ].map((goal, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{goal.name}</span>
                    <span className="text-gray-500">{goal.current}{goal.unit}/{goal.target}{goal.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(goal.current / goal.target) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className={widgetClass}>
            {header}
            <div className="text-center text-gray-500 py-4">
              Widget: {widget.type}
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-blue-600" />
            Dashboard Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and customize your personal dashboards
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button
                onClick={() => setShowAddWidget(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Plus className="h-4 w-4" />
                Add Widget
              </button>
              <button
                onClick={() => {
                  setDashboardName(currentDashboard?.name || '');
                  setDashboardDescription(currentDashboard?.description || '');
                  setShowSaveModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save Dashboard
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={createNewDashboard}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                New Dashboard
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dashboard Selector */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {dashboards.map(dashboard => (
            <button
              key={dashboard.id}
              onClick={() => {
                setCurrentDashboard(dashboard);
                setEditMode(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                currentDashboard?.id === dashboard.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              {dashboard.name}
              {dashboard.is_default && (
                <span className="text-xs bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded">Default</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Grid */}
      {currentDashboard ? (
        <div className="grid grid-cols-4 gap-4">
          {currentDashboard.layout.map(widget => {
            const colSpan = widget.position.w || 1;
            const rowSpan = widget.position.h || 1;
            return (
              <div
                key={widget.id}
                className={`col-span-${colSpan}`}
                style={{
                  gridColumn: `span ${colSpan}`,
                  gridRow: `span ${rowSpan}`
                }}
              >
                {renderWidget(widget)}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <LayoutDashboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No dashboard selected</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Create a new dashboard to get started</p>
          <button
            onClick={createNewDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Dashboard
          </button>
        </div>
      )}

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Widget</h2>
              <button
                onClick={() => setShowAddWidget(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-3 gap-3">
                {widgetTypes.map(widget => {
                  const IconComponent = widget.icon;
                  return (
                    <button
                      key={widget.id}
                      onClick={() => addWidget(widget)}
                      className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <IconComponent className="h-8 w-8 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{widget.name}</span>
                      <span className="text-xs text-gray-500 capitalize">{widget.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Dashboard Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Save Dashboard</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dashboard Name *
                </label>
                <input
                  type="text"
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="My Dashboard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={dashboardDescription}
                  onChange={(e) => setDashboardDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brief description"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveDashboard}
                disabled={!dashboardName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Save Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
