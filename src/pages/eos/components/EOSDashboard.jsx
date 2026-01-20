import React from 'react';
import { Target, Mountain, AlertTriangle, TrendingUp, Calendar, Users, CheckCircle, Clock, Play, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EOSDashboard = ({ program }) => {
  const stats = {
    rocksOnTrack: 3,
    rocksTotal: 5,
    scorecardHealth: 85,
    openIssues: 8,
    l10Streak: 12,
    todosComplete: 18,
    todosTotal: 22,
  };

  const upcomingMeetings = [
    { type: 'L10', date: '2025-01-02', time: '9:00 AM', attendees: 6 },
    { type: 'Quarterly', date: '2025-01-15', time: '8:00 AM', attendees: 6 },
  ];

  const currentRocks = [
    { id: 1, title: 'Launch new property management software', owner: 'Bryan V.', status: 'on-track', progress: 75 },
    { id: 2, title: 'Hire 2 project managers', owner: 'Sarah M.', status: 'on-track', progress: 60 },
    { id: 3, title: 'Complete ISO certification', owner: 'Mike J.', status: 'on-track', progress: 80 },
    { id: 4, title: 'Implement new CRM system', owner: 'Lisa C.', status: 'at-risk', progress: 35 },
    { id: 5, title: 'Establish vendor qualification process', owner: 'Tom W.', status: 'off-track', progress: 20 },
  ];

  const recentIssues = [
    { id: 1, title: 'Cash flow timing issues with large projects', priority: 'high', created: '2024-12-20' },
    { id: 2, title: 'Need better subcontractor vetting process', priority: 'medium', created: '2024-12-18' },
    { id: 3, title: 'Marketing lead quality declining', priority: 'medium', created: '2024-12-15' },
  ];

  const scorecardMetrics = [
    { name: 'Revenue', target: 500000, actual: 485000, trend: 'up' },
    { name: 'Gross Margin', target: 25, actual: 27.5, trend: 'up', isPercent: true },
    { name: 'Projects Active', target: 5, actual: 4, trend: 'down' },
    { name: 'Customer Satisfaction', target: 90, actual: 92, trend: 'up', isPercent: true },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-700';
      case 'at-risk': return 'bg-amber-100 text-amber-700';
      case 'off-track': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'on-track': return 'bg-green-500';
      case 'at-risk': return 'bg-amber-500';
      case 'off-track': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{program.name}</h1>
          <p className="text-sm text-gray-500">{program.currentQuarter} • {program.phase} Phase</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Play className="w-4 h-4 mr-2" />Start L10 Meeting
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Mountain className="w-5 h-5 text-[#047857]" />
            <span className={cn("text-xs px-2 py-0.5 rounded", stats.rocksOnTrack >= stats.rocksTotal * 0.8 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
              {Math.round((stats.rocksOnTrack / stats.rocksTotal) * 100)}% on track
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.rocksOnTrack}/{stats.rocksTotal}</p>
          <p className="text-xs text-gray-500">Quarterly Rocks</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className={cn("text-xs px-2 py-0.5 rounded", stats.scorecardHealth >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
              Healthy
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.scorecardHealth}%</p>
          <p className="text-xs text-gray-500">Scorecard Health</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold">{stats.openIssues}</p>
          <p className="text-xs text-gray-500">Open Issues</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
              Strong
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.l10Streak} weeks</p>
          <p className="text-xs text-gray-500">L10 Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Rocks Section */}
        <div className="col-span-2 bg-white border rounded-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Mountain className="w-4 h-4" />
              Q1 2025 Rocks
            </h3>
            <Button variant="outline" size="sm">View All <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
          <div className="divide-y">
            {currentRocks.map((rock) => (
              <div key={rock.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium">{rock.title}</p>
                    <p className="text-sm text-gray-500">{rock.owner}</p>
                  </div>
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(rock.status))}>
                    {rock.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", getProgressColor(rock.status))}
                      style={{ width: `${rock.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-10">{rock.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Meetings */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Meetings
              </h3>
            </div>
            <div className="divide-y">
              {upcomingMeetings.map((meeting, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{meeting.type} Meeting</p>
                      <p className="text-sm text-gray-500">{meeting.date} at {meeting.time}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {meeting.attendees} attendees
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scorecard Preview */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Scorecard
              </h3>
              <span className="text-xs text-gray-500">This Week</span>
            </div>
            <div className="divide-y">
              {scorecardMetrics.map((metric, idx) => {
                const isHit = metric.actual >= metric.target;
                return (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <span className="text-sm">{metric.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium", isHit ? "text-green-600" : "text-red-600")}>
                        {metric.actual}{metric.isPercent ? '%' : ''}
                      </span>
                      {metric.trend === 'up' ? (
                        <ArrowUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Issues */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Recent Issues
              </h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="divide-y">
              {recentIssues.map((issue) => (
                <div key={issue.id} className="p-3">
                  <p className="text-sm font-medium truncate">{issue.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded capitalize",
                      issue.priority === 'high' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {issue.priority}
                    </span>
                    <span className="text-xs text-gray-400">{issue.created}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* To-Dos Summary */}
      <div className="mt-6 bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium">To-Do Completion</p>
              <p className="text-sm text-gray-500">{stats.todosComplete} of {stats.todosTotal} completed this week</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(stats.todosComplete / stats.todosTotal) * 100}%` }}
              ></div>
            </div>
            <span className="font-medium">{Math.round((stats.todosComplete / stats.todosTotal) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EOSDashboard;
