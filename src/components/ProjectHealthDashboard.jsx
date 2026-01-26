import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Calendar,
  Users,
  FileText,
  BarChart2,
  PieChart,
  Target,
  Zap,
  Shield,
  RefreshCw,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

// Demo health data for a project
const generateDemoHealthData = (projectId) => ({
  overall_score: 78,
  overall_status: 'good', // healthy, good, at_risk, critical
  last_updated: new Date().toISOString(),

  categories: {
    budget: {
      score: 85,
      status: 'healthy',
      trend: 'stable',
      metrics: {
        total_budget: 5000000,
        spent: 3200000,
        committed: 800000,
        variance: -2.5,
        forecast_completion: 4850000
      },
      issues: [
        { severity: 'warning', message: 'Framing costs trending 5% over budget' }
      ]
    },
    schedule: {
      score: 72,
      status: 'good',
      trend: 'improving',
      metrics: {
        total_tasks: 145,
        completed_tasks: 98,
        overdue_tasks: 3,
        on_track: 44,
        days_remaining: 89,
        projected_completion: '2026-06-15',
        original_completion: '2026-06-01'
      },
      issues: [
        { severity: 'warning', message: '3 tasks overdue by more than 5 days' },
        { severity: 'info', message: 'Milestone "Framing Complete" achieved ahead of schedule' }
      ]
    },
    quality: {
      score: 92,
      status: 'healthy',
      trend: 'stable',
      metrics: {
        inspection_pass_rate: 96.5,
        punch_list_items: 12,
        resolved_items: 8,
        rework_percentage: 1.2
      },
      issues: []
    },
    risk: {
      score: 65,
      status: 'at_risk',
      trend: 'declining',
      metrics: {
        total_risks: 8,
        high_priority: 2,
        medium_priority: 4,
        low_priority: 2,
        mitigated: 3
      },
      issues: [
        { severity: 'critical', message: 'Supply chain delays affecting electrical materials' },
        { severity: 'warning', message: 'Weather forecast shows potential rain delays next week' }
      ]
    },
    compliance: {
      score: 88,
      status: 'good',
      trend: 'stable',
      metrics: {
        permits_approved: 8,
        permits_pending: 1,
        inspections_passed: 12,
        documents_expiring_soon: 2
      },
      issues: [
        { severity: 'warning', message: 'Insurance certificate expires in 25 days' }
      ]
    },
    team: {
      score: 82,
      status: 'healthy',
      trend: 'improving',
      metrics: {
        team_members: 15,
        tasks_per_member: 9.7,
        response_time_hours: 4.2,
        collaboration_score: 4.5
      },
      issues: []
    }
  },

  recent_changes: [
    { type: 'improvement', category: 'schedule', message: 'On-time completion rate improved by 8%', date: '2026-01-24' },
    { type: 'decline', category: 'risk', message: 'New supply chain risk identified', date: '2026-01-23' },
    { type: 'stable', category: 'budget', message: 'Budget variance holding steady at -2.5%', date: '2026-01-22' }
  ],

  action_items: [
    { priority: 'high', action: 'Review and mitigate supply chain risk', due: '2026-01-28', owner: 'John Smith' },
    { priority: 'medium', action: 'Renew insurance certificate', due: '2026-02-15', owner: 'Sarah Johnson' },
    { priority: 'medium', action: 'Address overdue tasks', due: '2026-01-30', owner: 'Mike Williams' }
  ]
});

const STATUS_CONFIG = {
  healthy: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2, label: 'Healthy' },
  good: { color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle2, label: 'Good' },
  at_risk: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle, label: 'At Risk' },
  critical: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, label: 'Critical' }
};

const CATEGORY_ICONS = {
  budget: DollarSign,
  schedule: Calendar,
  quality: Shield,
  risk: AlertTriangle,
  compliance: FileText,
  team: Users
};

const TREND_CONFIG = {
  improving: { icon: TrendingUp, color: 'text-green-600', label: 'Improving' },
  stable: { icon: Minus, color: 'text-gray-500', label: 'Stable' },
  declining: { icon: TrendingDown, color: 'text-red-600', label: 'Declining' }
};

const SEVERITY_CONFIG = {
  critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  warning: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
  info: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const ScoreGauge = ({ score, size = 'lg' }) => {
  const radius = size === 'lg' ? 60 : 40;
  const strokeWidth = size === 'lg' ? 10 : 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = radius + strokeWidth;

  const getColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>{score}</span>
        <span className={`text-gray-500 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>/ 100</span>
      </div>
    </div>
  );
};

const ProgressBar = ({ value, max, color = 'blue', showLabel = true }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="w-full">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs mt-1 text-gray-500">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

const ProjectHealthDashboard = ({ projectId = null }) => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadHealthData();
  }, [projectId]);

  const loadHealthData = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setHealthData(generateDemoHealthData(projectId || 'demo-project'));
      } else {
        // In real implementation, fetch from API
        const { data, error } = await supabase
          .from('project_health')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (error) throw error;
        setHealthData(data);
      }
    } catch (error) {
      console.error('Error loading health data:', error);
      // Fallback to demo data on error
      setHealthData(generateDemoHealthData(projectId || 'demo-project'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No health data available</p>
      </div>
    );
  }

  const overallStatus = STATUS_CONFIG[healthData.overall_status];
  const StatusIcon = overallStatus?.icon || CheckCircle2;

  return (
    <div className="space-y-6">
      {/* Overall Health Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <ScoreGauge score={healthData.overall_score} size="lg" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Project Health Score</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${overallStatus?.bg} ${overallStatus?.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {overallStatus?.label}
                </span>
                <span className="text-sm text-gray-500">
                  Last updated: {new Date(healthData.last_updated).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={loadHealthData}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(healthData.categories).map(([key, category]) => {
          const CategoryIcon = CATEGORY_ICONS[key];
          const status = STATUS_CONFIG[category.status];
          const trend = TREND_CONFIG[category.trend];
          const TrendIcon = trend?.icon;

          return (
            <div
              key={key}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === key ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${status?.bg}`}>
                    <CategoryIcon className={`w-5 h-5 ${status?.color}`} />
                  </div>
                  <span className="font-medium text-gray-900 capitalize">{key}</span>
                </div>
                <div className={`flex items-center gap-1 ${trend?.color}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-xs">{trend?.label}</span>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <ScoreGauge score={category.score} size="sm" />
                <div className="text-right">
                  {category.issues.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                      {category.issues.length} issue{category.issues.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Category Details */}
      {selectedCategory && healthData.categories[selectedCategory] && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 capitalize mb-4">
            {selectedCategory} Details
          </h3>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(healthData.categories[selectedCategory].metrics).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 capitalize mb-1">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {typeof value === 'number' && key.includes('amount') || key.includes('budget') || key.includes('spent') || key.includes('forecast')
                    ? formatCurrency(value)
                    : typeof value === 'number' && key.includes('percentage') || key.includes('rate') || key.includes('variance')
                    ? `${value}%`
                    : value}
                </div>
              </div>
            ))}
          </div>

          {/* Issues */}
          {healthData.categories[selectedCategory].issues.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Active Issues</h4>
              <div className="space-y-2">
                {healthData.categories[selectedCategory].issues.map((issue, idx) => {
                  const severity = SEVERITY_CONFIG[issue.severity];
                  const SeverityIcon = severity?.icon;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${severity?.color}`}
                    >
                      <SeverityIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{issue.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Changes & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Changes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Changes</h3>
          <div className="space-y-3">
            {healthData.recent_changes.map((change, idx) => {
              const isImprovement = change.type === 'improvement';
              const isDecline = change.type === 'decline';

              return (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1.5 rounded-full ${
                    isImprovement ? 'bg-green-100' : isDecline ? 'bg-red-100' : 'bg-gray-200'
                  }`}>
                    {isImprovement ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : isDecline ? (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-gray-900">{change.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="capitalize">{change.category}</span>
                      <span>•</span>
                      <span>{change.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            {healthData.action_items.map((action, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  action.priority === 'high'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`p-1.5 rounded ${
                  action.priority === 'high' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <Target className={`w-4 h-4 ${
                    action.priority === 'high' ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">{action.action}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due: {action.due}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {action.owner}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHealthDashboard;
