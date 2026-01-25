import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowRight,
  Building2,
  Briefcase,
  TrendingUp,
  TrendingDown,
  User,
  Settings,
  Eye,
  Edit3,
  MapPin,
  Target,
  Activity,
  Layers
} from 'lucide-react';

const ResourceAllocationDashboardPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('team'); // team, project, timeline
  const [timeRange, setTimeRange] = useState('month');
  const [department, setDepartment] = useState('all');
  const [expandedTeams, setExpandedTeams] = useState(new Set(['acquisitions', 'construction']));

  // Mock resource data
  const resourceData = {
    summary: {
      totalTeamMembers: 46,
      activeProjects: 32,
      avgUtilization: 78,
      overallocated: 5,
      underutilized: 8,
      onTrack: 33,
    },
    teams: [
      {
        id: 'acquisitions',
        name: 'Acquisitions',
        head: 'Sarah Johnson',
        members: [
          { id: 1, name: 'Sarah Johnson', role: 'Director', utilization: 95, projects: 8, status: 'overallocated' },
          { id: 2, name: 'John Smith', role: 'Senior Analyst', utilization: 82, projects: 5, status: 'optimal' },
          { id: 3, name: 'Emily Chen', role: 'Analyst', utilization: 75, projects: 4, status: 'optimal' },
          { id: 4, name: 'Michael Brown', role: 'Associate', utilization: 68, projects: 3, status: 'optimal' },
          { id: 5, name: 'Lisa Wang', role: 'Associate', utilization: 45, projects: 2, status: 'underutilized' },
        ],
        avgUtilization: 73,
        totalProjects: 22,
      },
      {
        id: 'construction',
        name: 'Construction',
        head: 'David Wilson',
        members: [
          { id: 6, name: 'David Wilson', role: 'Director', utilization: 88, projects: 12, status: 'optimal' },
          { id: 7, name: 'James Taylor', role: 'Project Manager', utilization: 92, projects: 6, status: 'overallocated' },
          { id: 8, name: 'Robert Garcia', role: 'Project Manager', utilization: 85, projects: 5, status: 'optimal' },
          { id: 9, name: 'Jennifer Martinez', role: 'Coordinator', utilization: 78, projects: 4, status: 'optimal' },
          { id: 10, name: 'Chris Anderson', role: 'Coordinator', utilization: 72, projects: 3, status: 'optimal' },
          { id: 11, name: 'Amanda White', role: 'Assistant', utilization: 55, projects: 2, status: 'underutilized' },
        ],
        avgUtilization: 78,
        totalProjects: 32,
      },
      {
        id: 'finance',
        name: 'Finance',
        head: 'Patricia Lee',
        members: [
          { id: 12, name: 'Patricia Lee', role: 'Controller', utilization: 85, projects: 15, status: 'optimal' },
          { id: 13, name: 'Kevin Thompson', role: 'Senior Accountant', utilization: 90, projects: 10, status: 'overallocated' },
          { id: 14, name: 'Nancy Harris', role: 'Accountant', utilization: 75, projects: 8, status: 'optimal' },
          { id: 15, name: 'Steven Clark', role: 'Analyst', utilization: 65, projects: 5, status: 'optimal' },
        ],
        avgUtilization: 79,
        totalProjects: 38,
      },
      {
        id: 'operations',
        name: 'Operations',
        head: 'Mark Robinson',
        members: [
          { id: 16, name: 'Mark Robinson', role: 'VP Operations', utilization: 80, projects: 20, status: 'optimal' },
          { id: 17, name: 'Susan Lewis', role: 'Operations Manager', utilization: 85, projects: 12, status: 'optimal' },
          { id: 18, name: 'Daniel Walker', role: 'Coordinator', utilization: 70, projects: 6, status: 'optimal' },
        ],
        avgUtilization: 78,
        totalProjects: 38,
      },
    ],
    projectAllocations: [
      { id: 1, name: 'Oakwood Estates Phase 2', type: 'Subdivision', resources: 8, totalHours: 320, status: 'on_track' },
      { id: 2, name: 'Charlotte Scattered Lots - Q1', type: 'Scattered Lot', resources: 5, totalHours: 180, status: 'on_track' },
      { id: 3, name: 'Downtown Mixed-Use Tower', type: 'Commercial', resources: 12, totalHours: 480, status: 'at_risk' },
      { id: 4, name: 'Greenville Renovation Portfolio', type: 'Renovation', resources: 4, totalHours: 160, status: 'on_track' },
      { id: 5, name: 'Lake Norman Waterfront', type: 'Subdivision', resources: 6, totalHours: 240, status: 'delayed' },
      { id: 6, name: 'Raleigh Tech Campus', type: 'Commercial', resources: 10, totalHours: 400, status: 'on_track' },
    ],
    weeklySchedule: [
      { week: 'Week 1', available: 1840, allocated: 1650, projects: 28 },
      { week: 'Week 2', available: 1840, allocated: 1720, projects: 30 },
      { week: 'Week 3', available: 1760, allocated: 1680, projects: 29 },
      { week: 'Week 4', available: 1840, allocated: 1780, projects: 32 },
    ],
    skills: [
      { skill: 'Project Management', available: 12, allocated: 10, demand: 'high' },
      { skill: 'Financial Analysis', available: 8, allocated: 7, demand: 'high' },
      { skill: 'Site Supervision', available: 15, allocated: 12, demand: 'medium' },
      { skill: 'Due Diligence', available: 6, allocated: 6, demand: 'high' },
      { skill: 'Contract Negotiation', available: 5, allocated: 4, demand: 'medium' },
      { skill: 'Accounting', available: 4, allocated: 4, demand: 'high' },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overallocated':
        return 'text-red-600 bg-red-100';
      case 'optimal':
        return 'text-green-600 bg-green-100';
      case 'underutilized':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'bg-red-500';
    if (utilization >= 75) return 'bg-green-500';
    if (utilization >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'on_track':
        return 'text-green-600 bg-green-100';
      case 'at_risk':
        return 'text-yellow-600 bg-yellow-100';
      case 'delayed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleTeam = (teamId) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-7 h-7 text-blue-600" />
                Resource Allocation
              </h1>
              <p className="text-gray-600 mt-1">
                Team workload and project resource management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Assign Resources
              </button>
            </div>
          </div>

          {/* View Tabs & Filters */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('team')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  view === 'team'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                By Team
              </button>
              <button
                onClick={() => setView('project')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  view === 'project'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                By Project
              </button>
              <button
                onClick={() => setView('timeline')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  view === 'timeline'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Timeline
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                <option value="acquisitions">Acquisitions</option>
                <option value="construction">Construction</option>
                <option value="finance">Finance</option>
                <option value="operations">Operations</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resourceData.summary.totalTeamMembers}</p>
                <p className="text-xs text-gray-500">Team Members</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resourceData.summary.activeProjects}</p>
                <p className="text-xs text-gray-500">Active Projects</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resourceData.summary.avgUtilization}%</p>
                <p className="text-xs text-gray-500">Avg Utilization</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resourceData.summary.overallocated}</p>
                <p className="text-xs text-gray-500">Overallocated</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resourceData.summary.underutilized}</p>
                <p className="text-xs text-gray-500">Underutilized</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resourceData.summary.onTrack}</p>
                <p className="text-xs text-gray-500">On Track</p>
              </div>
            </div>
          </div>
        </div>

        {view === 'team' && (
          <>
            {/* Team View */}
            <div className="space-y-4 mb-6">
              {resourceData.teams.map(team => {
                const isExpanded = expandedTeams.has(team.id);
                return (
                  <div key={team.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Team Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                      onClick={() => toggleTeam(team.id)}
                    >
                      <div className="flex items-center gap-4">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-500">Led by {team.head} • {team.members.length} members</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{team.avgUtilization}%</p>
                          <p className="text-xs text-gray-500">Utilization</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{team.totalProjects}</p>
                          <p className="text-xs text-gray-500">Projects</p>
                        </div>
                        <div className="w-32">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Capacity</span>
                            <span>{team.avgUtilization}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getUtilizationColor(team.avgUtilization)}`}
                              style={{ width: `${team.avgUtilization}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team Members */}
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Name</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Role</th>
                              <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">Projects</th>
                              <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">Utilization</th>
                              <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">Status</th>
                              <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {team.members.map(member => (
                              <tr key={member.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                                      {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className="font-medium text-gray-900">{member.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{member.role}</td>
                                <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">{member.projects}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${getUtilizationColor(member.utilization)}`}
                                        style={{ width: `${member.utilization}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-600">{member.utilization}%</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                                    {member.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button className="p-1 text-gray-400 hover:text-blue-600">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === 'project' && (
          <>
            {/* Project View */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Project</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Type</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Resources</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Hours/Week</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resourceData.projectAllocations.map(project => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{project.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{project.type}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{project.resources}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{project.totalHours}h</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-blue-600">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'timeline' && (
          <>
            {/* Timeline View */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Capacity Overview</h3>
              <div className="space-y-4">
                {resourceData.weeklySchedule.map((week, idx) => {
                  const utilizationPercent = (week.allocated / week.available) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-20 flex-shrink-0">
                        <span className="text-sm font-medium text-gray-700">{week.week}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">{week.allocated}h / {week.available}h allocated</span>
                          <span className="font-medium text-gray-900">{utilizationPercent.toFixed(0)}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-4 rounded-full transition-all ${getUtilizationColor(utilizationPercent)}`}
                            style={{ width: `${utilizationPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <span className="text-sm text-gray-500">{week.projects} projects</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Skills Capacity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Skills Capacity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourceData.skills.map((skill, idx) => {
              const utilizationPercent = (skill.allocated / skill.available) * 100;
              return (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{skill.skill}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      skill.demand === 'high' ? 'bg-red-100 text-red-700' :
                      skill.demand === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {skill.demand} demand
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getUtilizationColor(utilizationPercent)}`}
                        style={{ width: `${utilizationPercent}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{utilizationPercent.toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {skill.allocated} of {skill.available} resources allocated
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceAllocationDashboardPage;
