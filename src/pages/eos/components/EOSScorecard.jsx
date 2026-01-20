import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, X, Edit2, MoreVertical, ArrowUp, ArrowDown, Minus, Calendar, User, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EOSScorecard = ({ program }) => {
  const [showNewMetricModal, setShowNewMetricModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState('2024-12-23');

  const weeks = [
    '2024-12-23', '2024-12-16', '2024-12-09', '2024-12-02', 
    '2024-11-25', '2024-11-18', '2024-11-11', '2024-11-04',
    '2024-10-28', '2024-10-21', '2024-10-14', '2024-10-07',
    '2024-09-30',
  ];

  const [metrics, setMetrics] = useState([
    {
      id: 1,
      name: 'Weekly Revenue',
      owner: 'Bryan VanRock',
      goal: 125000,
      type: '>=',
      format: 'currency',
      data: {
        '2024-12-23': 132000,
        '2024-12-16': 128000,
        '2024-12-09': 118000,
        '2024-12-02': 142000,
        '2024-11-25': 95000,
        '2024-11-18': 131000,
        '2024-11-11': 127000,
        '2024-11-04': 135000,
        '2024-10-28': 122000,
        '2024-10-21': 119000,
        '2024-10-14': 126000,
        '2024-10-07': 138000,
        '2024-09-30': 124000,
      }
    },
    {
      id: 2,
      name: 'Gross Margin %',
      owner: 'Lisa Chen',
      goal: 25,
      type: '>=',
      format: 'percent',
      data: {
        '2024-12-23': 27.5,
        '2024-12-16': 26.2,
        '2024-12-09': 24.8,
        '2024-12-02': 28.1,
        '2024-11-25': 23.5,
        '2024-11-18': 26.8,
        '2024-11-11': 25.2,
        '2024-11-04': 27.3,
        '2024-10-28': 24.9,
        '2024-10-21': 25.1,
        '2024-10-14': 26.0,
        '2024-10-07': 27.8,
        '2024-09-30': 25.5,
      }
    },
    {
      id: 3,
      name: 'Active Projects',
      owner: 'Mike Johnson',
      goal: 5,
      type: '>=',
      format: 'number',
      data: {
        '2024-12-23': 4,
        '2024-12-16': 4,
        '2024-12-09': 5,
        '2024-12-02': 5,
        '2024-11-25': 5,
        '2024-11-18': 5,
        '2024-11-11': 4,
        '2024-11-04': 4,
        '2024-10-28': 4,
        '2024-10-21': 4,
        '2024-10-14': 5,
        '2024-10-07': 5,
        '2024-09-30': 5,
      }
    },
    {
      id: 4,
      name: 'Leads Generated',
      owner: 'Sarah Mitchell',
      goal: 20,
      type: '>=',
      format: 'number',
      data: {
        '2024-12-23': 18,
        '2024-12-16': 22,
        '2024-12-09': 19,
        '2024-12-02': 25,
        '2024-11-25': 12,
        '2024-11-18': 21,
        '2024-11-11': 23,
        '2024-11-04': 20,
        '2024-10-28': 18,
        '2024-10-21': 17,
        '2024-10-14': 24,
        '2024-10-07': 22,
        '2024-09-30': 19,
      }
    },
    {
      id: 5,
      name: 'Customer Satisfaction',
      owner: 'Sarah Mitchell',
      goal: 90,
      type: '>=',
      format: 'percent',
      data: {
        '2024-12-23': 92,
        '2024-12-16': 94,
        '2024-12-09': 88,
        '2024-12-02': 91,
        '2024-11-25': 93,
        '2024-11-18': 89,
        '2024-11-11': 92,
        '2024-11-04': 95,
        '2024-10-28': 90,
        '2024-10-21': 91,
        '2024-10-14': 94,
        '2024-10-07': 92,
        '2024-09-30': 88,
      }
    },
    {
      id: 6,
      name: 'Avg Days to Close',
      owner: 'Tom Wilson',
      goal: 45,
      type: '<=',
      format: 'number',
      data: {
        '2024-12-23': 42,
        '2024-12-16': 48,
        '2024-12-09': 44,
        '2024-12-02': 39,
        '2024-11-25': 52,
        '2024-11-18': 46,
        '2024-11-11': 43,
        '2024-11-04': 41,
        '2024-10-28': 47,
        '2024-10-21': 45,
        '2024-10-14': 42,
        '2024-10-07': 38,
        '2024-09-30': 44,
      }
    },
  ]);

  const isHit = (metric, value) => {
    if (value === null || value === undefined) return null;
    if (metric.type === '>=') return value >= metric.goal;
    if (metric.type === '<=') return value <= metric.goal;
    return value === metric.goal;
  };

  const formatValue = (value, format) => {
    if (value === null || value === undefined) return '-';
    switch (format) {
      case 'currency': return `$${value.toLocaleString()}`;
      case 'percent': return `${value}%`;
      default: return value;
    }
  };

  const getTrend = (metric, week) => {
    const currentIdx = weeks.indexOf(week);
    if (currentIdx === weeks.length - 1) return null;
    const prevWeek = weeks[currentIdx + 1];
    const current = metric.data[week];
    const previous = metric.data[prevWeek];
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'same';
  };

  const getWeeklyHitRate = (week) => {
    let hits = 0;
    let total = 0;
    metrics.forEach(metric => {
      const value = metric.data[week];
      if (value !== null && value !== undefined) {
        total++;
        if (isHit(metric, value)) hits++;
      }
    });
    return total > 0 ? Math.round((hits / total) * 100) : 0;
  };

  const last13WeeksHitRate = () => {
    let hits = 0;
    let total = 0;
    weeks.forEach(week => {
      metrics.forEach(metric => {
        const value = metric.data[week];
        if (value !== null && value !== undefined) {
          total++;
          if (isHit(metric, value)) hits++;
        }
      });
    });
    return total > 0 ? Math.round((hits / total) * 100) : 0;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Scorecard</h1>
          <p className="text-sm text-gray-500">Weekly measurables that indicate health</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowNewMetricModal(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Metric
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{metrics.length}</p>
          <p className="text-sm text-gray-500">Total Metrics</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-2xl font-bold text-green-600">{getWeeklyHitRate(selectedWeek)}%</p>
          <p className="text-sm text-gray-500">This Week Hit Rate</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{last13WeeksHitRate()}%</p>
          <p className="text-sm text-gray-500">13-Week Average</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">80%</p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Target <Target className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Scorecard Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium sticky left-0 bg-gray-50 min-w-[200px]">Measurable</th>
                <th className="text-left px-4 py-3 font-medium min-w-[120px]">Owner</th>
                <th className="text-right px-4 py-3 font-medium min-w-[80px]">Goal</th>
                {weeks.slice(0, 13).map((week) => (
                  <th key={week} className={cn(
                    "text-center px-3 py-3 font-medium min-w-[80px]",
                    week === selectedWeek && "bg-[#047857] text-white"
                  )}>
                    {new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {metrics.map((metric) => (
                <tr key={metric.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium sticky left-0 bg-white">
                    {metric.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{metric.owner}</td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {metric.type}{formatValue(metric.goal, metric.format)}
                  </td>
                  {weeks.slice(0, 13).map((week) => {
                    const value = metric.data[week];
                    const hit = isHit(metric, value);
                    const trend = getTrend(metric, week);
                    return (
                      <td 
                        key={week} 
                        className={cn(
                          "px-3 py-3 text-center",
                          hit === true && "bg-green-50",
                          hit === false && "bg-red-50",
                          week === selectedWeek && "ring-2 ring-[#047857] ring-inset"
                        )}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className={cn(
                            "font-medium",
                            hit === true && "text-green-700",
                            hit === false && "text-red-700"
                          )}>
                            {formatValue(value, metric.format)}
                          </span>
                          {trend === 'up' && <ArrowUp className="w-3 h-3 text-green-500" />}
                          {trend === 'down' && <ArrowDown className="w-3 h-3 text-red-500" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 border-t-2">
              <tr>
                <td className="px-4 py-3 font-semibold sticky left-0 bg-gray-100" colSpan={3}>Weekly Hit Rate</td>
                {weeks.slice(0, 13).map((week) => {
                  const rate = getWeeklyHitRate(week);
                  return (
                    <td key={week} className={cn(
                      "px-3 py-3 text-center font-bold",
                      rate >= 80 ? "text-green-600" : "text-red-600",
                      week === selectedWeek && "bg-[#047857]/10"
                    )}>
                      {rate}%
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
          <span>Hit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
          <span>Miss</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUp className="w-4 h-4 text-green-500" />
          <span>Improving</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowDown className="w-4 h-4 text-red-500" />
          <span>Declining</span>
        </div>
      </div>

      {/* New Metric Modal */}
      {showNewMetricModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Add Scorecard Metric</h3>
              <button onClick={() => setShowNewMetricModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Metric Name *</label>
                <Input placeholder="e.g., Weekly Revenue, Leads Generated" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Owner *</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option>Select owner...</option>
                    <option>Bryan VanRock</option>
                    <option>Sarah Mitchell</option>
                    <option>Mike Johnson</option>
                    <option>Lisa Chen</option>
                    <option>Tom Wilson</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Goal Type</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value=">=">&gt;= (Greater or equal)</option>
                    <option value="<=">&lt;= (Less or equal)</option>
                    <option value="=">=  (Exactly)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Goal Value *</label>
                  <Input type="number" placeholder="100" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Format</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="number">Number</option>
                    <option value="currency">Currency ($)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-800 mb-1">Scorecard Best Practices</p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>• 5-15 metrics that predict success</li>
                  <li>• Each metric has one owner</li>
                  <li>• Weekly numbers (not monthly)</li>
                  <li>• Target 80%+ hit rate</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowNewMetricModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Add Metric</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EOSScorecard;
