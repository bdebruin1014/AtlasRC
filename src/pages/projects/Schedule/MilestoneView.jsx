// src/pages/projects/Schedule/MilestoneView.jsx
// Timeline view showing project milestones with status and progress

import React, { useMemo } from 'react';
import { Flag, CheckCircle2, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  completed: { label: 'Completed', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle2, dotColor: 'bg-green-500' },
  in_progress: { label: 'In Progress', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Clock, dotColor: 'bg-blue-500' },
  delayed: { label: 'Delayed', color: 'text-red-700 bg-red-50 border-red-200', icon: AlertTriangle, dotColor: 'bg-red-500' },
  not_started: { label: 'Not Started', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Clock, dotColor: 'bg-gray-400' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDaysFromNow = (dateStr) => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.round((target - now) / 86400000);
  return diff;
};

const MilestoneView = ({ milestones, schedule }) => {
  // Sort milestones by calculated start date
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => {
      const dateA = a.calculated_start_date || a.fixed_date || '';
      const dateB = b.calculated_start_date || b.fixed_date || '';
      return dateA.localeCompare(dateB);
    });
  }, [milestones]);

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const totalCount = milestones.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (milestones.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Milestones</h3>
        <p className="text-sm text-gray-400">
          Mark tasks as milestones to track key project events here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2F855A]/10 rounded-lg">
              <Flag className="w-5 h-5 text-[#2F855A]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Milestone Progress</h3>
              <p className="text-xs text-gray-500">
                {completedCount} of {totalCount} milestones completed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2F855A] rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">{progressPct}%</span>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = milestones.filter(m => m.status === key).length;
            if (count === 0) return null;
            return (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                <div className={cn("w-2 h-2 rounded-full", cfg.dotColor)} />
                <span className="text-gray-600">{cfg.label}: <span className="font-medium">{count}</span></span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Milestone Timeline</h3>
        </div>
        <div className="p-4">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {sortedMilestones.map((milestone, idx) => {
                const config = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.not_started;
                const StatusIcon = config.icon;
                const milestoneDate = milestone.calculated_start_date || milestone.fixed_date;
                const daysFromNow = getDaysFromNow(milestoneDate);
                const isOverdue = daysFromNow !== null && daysFromNow < 0 && milestone.status !== 'completed';
                const isUpcoming = daysFromNow !== null && daysFromNow >= 0 && daysFromNow <= 7 && milestone.status !== 'completed';

                return (
                  <div key={milestone.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-2.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm",
                      milestone.status === 'completed' ? 'bg-green-500' :
                      isOverdue ? 'bg-red-500' :
                      milestone.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-gray-400'
                    )} />

                    <div className={cn(
                      "p-4 rounded-lg border transition-colors",
                      milestone.status === 'completed' ? 'bg-green-50/50 border-green-200' :
                      isOverdue ? 'bg-red-50/50 border-red-200' :
                      isUpcoming ? 'bg-amber-50/50 border-amber-200' :
                      'bg-white border-gray-200 hover:border-gray-300'
                    )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Flag className={cn(
                              "w-4 h-4 flex-shrink-0",
                              milestone.status === 'completed' ? 'text-green-600' :
                              isOverdue ? 'text-red-600' :
                              'text-gray-500'
                            )} />
                            <h4 className={cn(
                              "text-sm font-medium truncate",
                              milestone.status === 'completed' ? 'text-green-800 line-through' : 'text-gray-900'
                            )}>
                              {milestone.name}
                            </h4>
                          </div>

                          {milestone.description && (
                            <p className="text-xs text-gray-500 mt-1 ml-6">{milestone.description}</p>
                          )}

                          <div className="flex items-center gap-3 mt-2 ml-6">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(milestoneDate)}</span>
                            </div>
                            {milestone.assigned_to_name && (
                              <span className="text-xs text-gray-400">
                                Assigned: {milestone.assigned_to_name}
                              </span>
                            )}
                            {daysFromNow !== null && milestone.status !== 'completed' && (
                              <span className={cn(
                                "text-xs font-medium",
                                isOverdue ? 'text-red-600' :
                                isUpcoming ? 'text-amber-600' :
                                'text-gray-500'
                              )}>
                                {isOverdue ? `${Math.abs(daysFromNow)} days overdue` :
                                 daysFromNow === 0 ? 'Today' :
                                 daysFromNow === 1 ? 'Tomorrow' :
                                 `${daysFromNow} days away`}
                              </span>
                            )}
                          </div>
                        </div>

                        <Badge variant="outline" className={cn("text-xs flex-shrink-0", config.color)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>

                      {/* Progress bar for in-progress milestones */}
                      {milestone.status === 'in_progress' && milestone.percent_complete > 0 && (
                        <div className="mt-3 ml-6">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${milestone.percent_complete}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{milestone.percent_complete}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneView;
