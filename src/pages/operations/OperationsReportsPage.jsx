import React, { useState } from 'react';
import { ClipboardList, Download, Calendar, Building2, Users, Clock, TrendingUp, AlertTriangle, CheckCircle2, FileText, Filter, RefreshCw, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const OperationsReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState('daily-ops');
  const [dateRange, setDateRange] = useState('today');

  const reportTypes = [
    { id: 'daily-ops', name: 'Daily Operations', icon: ClipboardList, description: 'Daily activity and status summary' },
    { id: 'project-status', name: 'Project Status', icon: Building2, description: 'All active project updates' },
    { id: 'team-activity', name: 'Team Activity', icon: Users, description: 'Team member activities and tasks' },
    { id: 'upcoming-deadlines', name: 'Upcoming Deadlines', icon: Clock, description: 'Critical dates and milestones' },
    { id: 'risk-issues', name: 'Risks & Issues', icon: AlertTriangle, description: 'Outstanding risks and issues' },
    { id: 'weekly-summary', name: 'Weekly Summary', icon: FileText, description: 'Comprehensive weekly review' },
  ];

  const dailyOpsData = {
    summary: {
      activeProjects: 12,
      tasksCompleted: 24,
      tasksOverdue: 3,
      inspectionsPending: 2,
    },
    recentActivities: [
      { time: '9:45 AM', user: 'John Smith', action: 'Completed rough-in inspection', project: '123 Oak Street' },
      { time: '9:30 AM', user: 'Sarah Johnson', action: 'Updated budget forecast', project: '456 Pine Avenue' },
      { time: '9:15 AM', user: 'Mike Williams', action: 'Submitted permit application', project: 'Riverside Lots' },
      { time: '8:45 AM', user: 'Emily Davis', action: 'Approved change order #5', project: '123 Oak Street' },
      { time: '8:30 AM', user: 'David Miller', action: 'Scheduled site inspection', project: '456 Pine Avenue' },
    ],
    projectUpdates: [
      { name: '123 Oak Street', status: 'On Track', completion: 65, nextMilestone: 'Framing complete', daysToMilestone: 5 },
      { name: '456 Pine Avenue', status: 'At Risk', completion: 42, nextMilestone: 'Foundation pour', daysToMilestone: 2 },
      { name: 'Riverside Lots', status: 'On Track', completion: 28, nextMilestone: 'Permit approval', daysToMilestone: 8 },
    ],
    upcomingTasks: [
      { task: 'Final electrical inspection', project: '123 Oak Street', dueDate: 'Today', assignee: 'Mike Williams', priority: 'high' },
      { task: 'Foundation contractor meeting', project: '456 Pine Avenue', dueDate: 'Today', assignee: 'John Smith', priority: 'high' },
      { task: 'Submit draw request #4', project: '123 Oak Street', dueDate: 'Tomorrow', assignee: 'Sarah Johnson', priority: 'medium' },
      { task: 'Site cleanup coordination', project: 'Riverside Lots', dueDate: 'Tomorrow', assignee: 'David Miller', priority: 'low' },
    ],
    issues: [
      { issue: 'Material delivery delayed', project: '456 Pine Avenue', severity: 'high', daysOpen: 2 },
      { issue: 'Permit revision required', project: 'Riverside Lots', severity: 'medium', daysOpen: 5 },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Track': return 'bg-green-100 text-green-700';
      case 'At Risk': return 'bg-amber-100 text-amber-700';
      case 'Delayed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#2F855A]" />
          <h1 className="text-xl font-semibold text-gray-900">Operations Reports</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button className="bg-[#2F855A] hover:bg-[#276749]" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Left Sidebar - Report Types */}
        <div className="col-span-1">
          <Card>
            <CardHeader className="border-b py-3">
              <CardTitle className="text-sm">Report Type</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {reportTypes.map(report => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedReport === report.id
                        ? 'bg-green-50 border border-[#2F855A]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <report.icon className={`w-5 h-5 mt-0.5 ${selectedReport === report.id ? 'text-[#2F855A]' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm font-medium ${selectedReport === report.id ? 'text-[#2F855A]' : 'text-gray-900'}`}>
                        {report.name}
                      </p>
                      <p className="text-xs text-gray-400">{report.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Filter */}
          <Card className="mt-4">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-sm">Date Range</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this-week">This Week</option>
                <option value="last-week">Last Week</option>
                <option value="this-month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Report Display */}
        <div className="col-span-3 space-y-6">
          {/* Report Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Daily Operations Report</h2>
                  <p className="text-sm text-gray-500">Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Live Data
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{dailyOpsData.summary.activeProjects}</p>
                    <p className="text-xs text-gray-500">Active Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{dailyOpsData.summary.tasksCompleted}</p>
                    <p className="text-xs text-gray-500">Tasks Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{dailyOpsData.summary.tasksOverdue}</p>
                    <p className="text-xs text-gray-500">Tasks Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{dailyOpsData.summary.inspectionsPending}</p>
                    <p className="text-xs text-gray-500">Inspections Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Project Status */}
            <Card>
              <CardHeader className="border-b py-3">
                <CardTitle className="text-sm">Project Status</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {dailyOpsData.projectUpdates.map((project, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{project.name}</span>
                        <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{project.completion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${project.status === 'At Risk' ? 'bg-amber-500' : 'bg-[#2F855A]'}`}
                            style={{ width: `${project.completion}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Next: {project.nextMilestone}</span>
                        <span className="text-gray-400">{project.daysToMilestone} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="border-b py-3">
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {dailyOpsData.recentActivities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-xs text-gray-400 w-16 shrink-0">{activity.time}</span>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>
                          <span className="text-gray-600"> {activity.action}</span>
                        </p>
                        <p className="text-xs text-gray-400">{activity.project}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Upcoming Tasks */}
            <Card>
              <CardHeader className="border-b py-3">
                <CardTitle className="text-sm">Today's Tasks</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {dailyOpsData.upcomingTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{task.task}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{task.project}</span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-400">{task.assignee}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{task.dueDate}</span>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Open Issues */}
            <Card>
              <CardHeader className="border-b py-3">
                <CardTitle className="text-sm">Open Issues</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {dailyOpsData.issues.length > 0 ? (
                  <div className="space-y-3">
                    {dailyOpsData.issues.map((issue, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{issue.issue}</p>
                              <p className="text-xs text-gray-500">{issue.project}</p>
                            </div>
                          </div>
                          <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Open for {issue.daysOpen} days</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No open issues</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsReportsPage;
