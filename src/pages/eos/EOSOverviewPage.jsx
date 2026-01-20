import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Target, BarChart3, AlertTriangle, Calendar, Users, CheckCircle, Clock, 
  TrendingUp, ArrowRight, Mountain, Star, Play, CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EOSOverviewPage = () => {
  const { programId } = useParams();
  const navigate = useNavigate();

  const program = {
    name: 'VanRock Holdings EOS',
    entityName: 'VanRock Holdings LLC',
    phase: 'Traction',
    currentQuarter: 'Q1 2025',
    implementationDate: '2024-01-15',
    implementor: 'EOS Worldwide',
    teamSize: 6,
  };

  const metrics = {
    rocksOnTrack: 3,
    rocksTotal: 5,
    rocksOffTrack: 1,
    rocksDone: 1,
    scorecardHealth: 85,
    scorecardOnTrack: 12,
    scorecardTotal: 15,
    openIssues: 8,
    issuesSolvedThisWeek: 3,
    l10Streak: 12,
    lastL10Rating: 8.5,
    todosComplete: 18,
    todosTotal: 22,
    quarterProgress: 65,
  };

  const upcomingMeetings = [
    { type: 'L10', date: '2025-01-02', time: '9:00 AM', attendees: 6 },
    { type: 'L10', date: '2025-01-09', time: '9:00 AM', attendees: 6 },
    { type: 'Quarterly', date: '2025-01-15', time: '8:00 AM', duration: 'Full Day' },
  ];

  const recentActivity = [
    { action: 'Rock completed: Launch new CRM system', user: 'Bryan V.', time: '2 days ago', type: 'rock' },
    { action: 'Issue solved: Hiring timeline delays', user: 'Sarah M.', time: '3 days ago', type: 'issue' },
    { action: 'L10 Meeting completed (Rating: 8.5)', user: 'Team', time: '5 days ago', type: 'meeting' },
    { action: 'New issue added: Vendor contract renewal', user: 'Mike J.', time: '1 week ago', type: 'issue' },
    { action: 'Scorecard updated', user: 'Bryan V.', time: '1 week ago', type: 'scorecard' },
  ];

  const topIssues = [
    { title: 'Need to hire project manager', priority: 'high', weeks: 4 },
    { title: 'Cash flow timing with draws', priority: 'high', weeks: 3 },
    { title: 'Subcontractor availability Q1', priority: 'medium', weeks: 2 },
  ];

  const currentRocks = [
    { title: 'Launch new CRM system', owner: 'Bryan V.', status: 'complete', progress: 100 },
    { title: 'Hire 2 project managers', owner: 'Sarah M.', status: 'on-track', progress: 60 },
    { title: 'Complete Oakridge Phase 1', owner: 'Mike J.', status: 'on-track', progress: 75 },
    { title: 'Establish PM division SOPs', owner: 'Tom W.', status: 'off-track', progress: 30 },
    { title: 'Secure $5M credit facility', owner: 'Bryan V.', status: 'on-track', progress: 80 },
  ];

  const getRockStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700';
      case 'on-track': return 'bg-blue-100 text-blue-700';
      case 'off-track': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{program.name}</h1>
        <p className="text-gray-500">EOS Implementation Overview • {program.currentQuarter}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Mountain className="w-5 h-5 text-[#047857]" />
            <span className="text-xs text-gray-500">{program.currentQuarter}</span>
          </div>
          <p className="text-2xl font-bold">{metrics.rocksOnTrack}/{metrics.rocksTotal}</p>
          <p className="text-xs text-gray-500">Rocks On Track</p>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#047857] rounded-full" style={{ width: `${(metrics.rocksOnTrack / metrics.rocksTotal) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <p className={cn("text-2xl font-bold", metrics.scorecardHealth >= 80 ? "text-green-600" : metrics.scorecardHealth >= 60 ? "text-amber-600" : "text-red-600")}>
            {metrics.scorecardHealth}%
          </p>
          <p className="text-xs text-gray-500">Scorecard Health</p>
          <p className="text-xs text-gray-400 mt-1">{metrics.scorecardOnTrack}/{metrics.scorecardTotal} on track</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold">{metrics.openIssues}</p>
          <p className="text-xs text-gray-500">Open Issues</p>
          <p className="text-xs text-green-600 mt-1">+{metrics.issuesSolvedThisWeek} solved this week</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{metrics.l10Streak}</p>
          <p className="text-xs text-gray-500">L10 Streak (weeks)</p>
          <p className="text-xs text-gray-400 mt-1">Last rating: {metrics.lastL10Rating}/10</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckSquare className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{metrics.todosComplete}/{metrics.todosTotal}</p>
          <p className="text-xs text-gray-500">To-Dos Complete</p>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(metrics.todosComplete / metrics.todosTotal) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Quarter Progress */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Quarter Progress</span>
          <span className="text-sm text-gray-500">{metrics.quarterProgress}% through {program.currentQuarter}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#047857] rounded-full" style={{ width: `${metrics.quarterProgress}%` }}></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Jan 1, 2025</span>
          <span>Mar 31, 2025</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Current Rocks */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Mountain className="w-5 h-5 text-[#047857]" />
                {program.currentQuarter} Rocks
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigate(`/eos/${programId}/rocks`)}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {currentRocks.map((rock, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{rock.title}</p>
                      <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getRockStatusColor(rock.status))}>
                        {rock.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Owner: {rock.owner}</p>
                  </div>
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{rock.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", rock.status === 'complete' ? "bg-green-500" : rock.status === 'off-track' ? "bg-red-500" : "bg-blue-500")}
                        style={{ width: `${rock.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Issues */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Top Issues (IDS)
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigate(`/eos/${programId}/issues`)}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {topIssues.map((issue, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      issue.priority === 'high' ? "bg-red-500" : "bg-amber-500"
                    )}></span>
                    <span>{issue.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{issue.weeks} weeks</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5",
                    activity.type === 'rock' ? "bg-green-500" :
                    activity.type === 'issue' ? "bg-amber-500" :
                    activity.type === 'meeting' ? "bg-blue-500" :
                    "bg-gray-500"
                  )}></div>
                  <div className="flex-1">
                    <p>{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full bg-[#047857] hover:bg-[#065f46]" onClick={() => navigate(`/eos/${programId}/l10`)}>
                <Play className="w-4 h-4 mr-2" />Start L10 Meeting
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/eos/${programId}/issues`)}>
                <AlertTriangle className="w-4 h-4 mr-2" />Add Issue
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/eos/${programId}/scorecard`)}>
                <BarChart3 className="w-4 h-4 mr-2" />Update Scorecard
              </Button>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Upcoming Meetings
            </h3>
            <div className="space-y-3">
              {upcomingMeetings.map((meeting, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{meeting.type}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      meeting.type === 'L10' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    )}>{meeting.type}</span>
                  </div>
                  <p className="text-sm text-gray-500">{meeting.date} at {meeting.time}</p>
                  {meeting.duration && <p className="text-xs text-gray-400">{meeting.duration}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* EOS Health */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">EOS Health Check</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Vision Clarity</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">90%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Traction</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">People</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">70%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">80%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Process</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">60%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Issues</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">75%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              Leadership Team
            </h3>
            <p className="text-2xl font-bold">{program.teamSize} members</p>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate(`/eos/${programId}/accountability`)}>
              View Accountability Chart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EOSOverviewPage;
