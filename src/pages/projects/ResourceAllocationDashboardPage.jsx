import React, { useState, useEffect, useMemo } from 'react';
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
import { projectService } from '@/services/projectService';
import { getTeams } from '@/services/teamService';

const ResourceAllocationDashboardPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('team');
  const [timeRange, setTimeRange] = useState('month');
  const [department, setDepartment] = useState('all');
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [teamsResult, allProjects] = await Promise.all([
          getTeams(),
          projectService.getAll(),
        ]);
        setTeams(teamsResult || []);
        setProjects(allProjects || []);
        if (teamsResult?.length > 0) {
          setExpandedTeams(new Set(teamsResult.slice(0, 2).map(t => t.id)));
        }
      } catch (err) {
        console.error('Failed to load resource data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeProjects = useMemo(() =>
    projects.filter(p => p.status === 'active' || p.status === 'in_progress'),
    [projects]
  );

  // Build resource data from real teams + projects
  const resourceData = useMemo(() => {
    const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);

    const teamData = teams.map(team => {
      const members = (team.members || []).map(m => {
        const memberName = m.user?.full_name || m.full_name || 'Unknown';
        const memberRole = m.team_role === 'lead' ? 'Team Lead' : 'Member';
        const assignedCount = activeProjects.filter(p =>
          p.manager_id === m.user_id || p.manager_id === m.user?.id
        ).length;
        const utilization = activeProjects.length > 0
          ? Math.min(100, Math.round((assignedCount / Math.max(activeProjects.length * 0.3, 1)) * 100))
          : 0;
        const status = utilization >= 90 ? 'overallocated' : utilization < 40 ? 'underutilized' : 'optimal';
        return { id: m.id || m.user_id, name: memberName, role: memberRole, utilization, projects: assignedCount, status };
      });

      const avgUtil = members.length > 0
        ? Math.round(members.reduce((s, m) => s + m.utilization, 0) / members.length)
        : 0;
      const lead = members.find(m => m.role === 'Team Lead');

      return {
        id: team.id,
        name: team.name,
        head: lead?.name || members[0]?.name || 'Unassigned',
        members,
        avgUtilization: avgUtil,
        totalProjects: members.reduce((s, m) => s + m.projects, 0),
      };
    });

    const allMembers = teamData.flatMap(t => t.members);
    const overallocated = allMembers.filter(m => m.status === 'overallocated').length;
    const underutilized = allMembers.filter(m => m.status === 'underutilized').length;
    const avgUtilization = allMembers.length > 0
      ? Math.round(allMembers.reduce((s, m) => s + m.utilization, 0) / allMembers.length)
      : 0;

    const projectAllocations = activeProjects.slice(0, 10).map(p => ({
      id: p.id,
      name: p.name,
      type: p.project_type || p.property_type || 'General',
      resources: 1,
      totalHours: 40,
      status: p.status === 'active' ? 'on_track' : p.status === 'on_hold' ? 'delayed' : 'on_track',
    }));

    const availableHours = Math.max(totalMembers * 40, 1);
    return {
      summary: {
        totalTeamMembers: totalMembers,
        activeProjects: activeProjects.length,
        avgUtilization,
        overallocated,
        underutilized,
        onTrack: activeProjects.filter(p => p.status === 'active').length,
      },
      teams: teamData,
      projectAllocations,
      weeklySchedule: [
        { week: 'Week 1', available: availableHours, allocated: Math.round(availableHours * (avgUtilization / 100)), projects: activeProjects.length },
        { week: 'Week 2', available: availableHours, allocated: Math.round(availableHours * (avgUtilization / 100) * 1.02), projects: activeProjects.length },
        { week: 'Week 3', available: availableHours, allocated: Math.round(availableHours * (avgUtilization / 100) * 0.98), projects: activeProjects.length },
        { week: 'Week 4', available: availableHours, allocated: Math.round(availableHours * (avgUtilization / 100) * 1.05), projects: activeProjects.length },
      ],
      skills: [
        { skill: 'Project Management', available: Math.max(teamData.length, 1), allocated: Math.min(teamData.length, activeProjects.length), demand: activeProjects.length > teamData.length ? 'high' : 'medium' },
        { skill: 'Construction Mgmt', available: Math.max((teamData.find(t => t.name?.toLowerCase().includes('construction'))?.members?.length || 2), 1), allocated: Math.min(Math.round(activeProjects.length * 0.4), totalMembers), demand: 'high' },
        { skill: 'Financial Analysis', available: Math.max((teamData.find(t => t.name?.toLowerCase().includes('finance'))?.members?.length || 2), 1), allocated: Math.min(Math.round(activeProjects.length * 0.3), totalMembers), demand: 'high' },
        { skill: 'Site Supervision', available: Math.max(Math.round(totalMembers * 0.3), 1), allocated: Math.min(Math.round(activeProjects.length * 0.5), totalMembers), demand: 'medium' },
      ],
    };
  }, [teams, projects, activeProjects]);

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
              <button
                className="flex items-center gap-2 px-4 py-2 bg-[#047857] text-white rounded-lg hover:bg-[#065f46]"
                onClick={() => navigate('/admin/teams')}
              >
                <Plus className="w-4 h-4" />
                Manage Teams
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
        {loading && (
          <div className="text-center py-12 text-gray-500">Loading resource data...</div>
        )}

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
              {resourceData.teams.filter(t => department === 'all' || t.name.toLowerCase().includes(department)).map(team => {
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
                    <tr key={project.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/project/${project.id}`)}>
                      <td className="px-4 py-4">
                        <p className="font-medium text-[#047857] hover:underline">{project.name}</p>
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
