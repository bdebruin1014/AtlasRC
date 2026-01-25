import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// Demo team members with workload data
const demoTeamMembers = [
  {
    id: 'user-001',
    name: 'Michael Chen',
    email: 'michael.chen@atlas.com',
    role: 'Senior Developer',
    department: 'Acquisitions',
    avatar: null,
    initials: 'MC',
    status: 'active',
    capacity: 40, // hours per week
    currentLoad: 38,
    tasks: [
      { id: 't1', name: 'Highland Park due diligence', project: 'Highland Park Development', priority: 'high', hours: 12, dueDate: '2026-01-28' },
      { id: 't2', name: 'Review loan documents', project: 'Riverside Commons', priority: 'medium', hours: 8, dueDate: '2026-01-30' },
      { id: 't3', name: 'Investor presentation prep', project: 'Highland Park Development', priority: 'high', hours: 10, dueDate: '2026-01-27' },
      { id: 't4', name: 'Market analysis report', project: 'General', priority: 'low', hours: 8, dueDate: '2026-02-05' }
    ],
    projects: ['Highland Park Development', 'Riverside Commons'],
    completedThisWeek: 5,
    overdueItems: 0
  },
  {
    id: 'user-002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@atlas.com',
    role: 'Project Manager',
    department: 'Operations',
    avatar: null,
    initials: 'SJ',
    status: 'active',
    capacity: 40,
    currentLoad: 45,
    tasks: [
      { id: 't5', name: 'Coordinate contractor bids', project: 'Maple Grove', priority: 'high', hours: 15, dueDate: '2026-01-26' },
      { id: 't6', name: 'Budget reconciliation', project: 'Riverside Commons', priority: 'medium', hours: 10, dueDate: '2026-01-29' },
      { id: 't7', name: 'Permit application follow-up', project: 'Oak Street Townhomes', priority: 'high', hours: 6, dueDate: '2026-01-25' },
      { id: 't8', name: 'Weekly status reports', project: 'Multiple', priority: 'medium', hours: 8, dueDate: '2026-01-25' },
      { id: 't9', name: 'Vendor contract review', project: 'Highland Park Development', priority: 'low', hours: 6, dueDate: '2026-02-01' }
    ],
    projects: ['Maple Grove', 'Riverside Commons', 'Oak Street Townhomes', 'Highland Park Development'],
    completedThisWeek: 8,
    overdueItems: 2
  },
  {
    id: 'user-003',
    name: 'Emily Davis',
    email: 'emily.davis@atlas.com',
    role: 'Financial Analyst',
    department: 'Finance',
    avatar: null,
    initials: 'ED',
    status: 'active',
    capacity: 40,
    currentLoad: 32,
    tasks: [
      { id: 't10', name: 'Pro forma updates', project: 'Highland Park Development', priority: 'high', hours: 12, dueDate: '2026-01-28' },
      { id: 't11', name: 'Cash flow projections', project: 'Riverside Commons', priority: 'medium', hours: 10, dueDate: '2026-01-31' },
      { id: 't12', name: 'Draw request preparation', project: 'Maple Grove', priority: 'medium', hours: 10, dueDate: '2026-02-03' }
    ],
    projects: ['Highland Park Development', 'Riverside Commons', 'Maple Grove'],
    completedThisWeek: 4,
    overdueItems: 0
  },
  {
    id: 'user-004',
    name: 'David Park',
    email: 'david.park@atlas.com',
    role: 'Development Associate',
    department: 'Acquisitions',
    avatar: null,
    initials: 'DP',
    status: 'active',
    capacity: 40,
    currentLoad: 28,
    tasks: [
      { id: 't13', name: 'Site visits - Industrial Park', project: 'Industrial Park Land', priority: 'medium', hours: 8, dueDate: '2026-01-27' },
      { id: 't14', name: 'Comparable research', project: 'Downtown Retail', priority: 'low', hours: 12, dueDate: '2026-02-05' },
      { id: 't15', name: 'LOI drafting', project: 'Commerce Park', priority: 'medium', hours: 8, dueDate: '2026-01-30' }
    ],
    projects: ['Industrial Park Land', 'Downtown Retail', 'Commerce Park'],
    completedThisWeek: 3,
    overdueItems: 0
  },
  {
    id: 'user-005',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@atlas.com',
    role: 'Administrative Manager',
    department: 'Operations',
    avatar: null,
    initials: 'LT',
    status: 'active',
    capacity: 40,
    currentLoad: 35,
    tasks: [
      { id: 't16', name: 'Document organization', project: 'Multiple', priority: 'medium', hours: 15, dueDate: '2026-01-31' },
      { id: 't17', name: 'Contract filing', project: 'Highland Park Development', priority: 'low', hours: 5, dueDate: '2026-02-01' },
      { id: 't18', name: 'Meeting coordination', project: 'General', priority: 'high', hours: 10, dueDate: '2026-01-25' },
      { id: 't19', name: 'Expense report processing', project: 'General', priority: 'medium', hours: 5, dueDate: '2026-01-28' }
    ],
    projects: ['Highland Park Development', 'General'],
    completedThisWeek: 12,
    overdueItems: 1
  }
];

const demoProjects = [
  { id: 'p1', name: 'Highland Park Development', status: 'active', teamCount: 4 },
  { id: 'p2', name: 'Riverside Commons', status: 'active', teamCount: 3 },
  { id: 'p3', name: 'Maple Grove', status: 'active', teamCount: 2 },
  { id: 'p4', name: 'Oak Street Townhomes', status: 'active', teamCount: 1 },
  { id: 'p5', name: 'Industrial Park Land', status: 'prospecting', teamCount: 1 }
];

const departments = ['All', 'Acquisitions', 'Operations', 'Finance', 'Legal'];

export default function TeamWorkloadDashboard() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [viewMode, setViewMode] = useState('cards'); // cards, table, timeline
  const [selectedMember, setSelectedMember] = useState(null);
  const [sortBy, setSortBy] = useState('load'); // load, name, tasks

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      if (isDemoMode()) {
        setTeamMembers(demoTeamMembers);
        setProjects(demoProjects);
        setLoading(false);
        return;
      }

      const [membersRes, projectsRes] = await Promise.all([
        supabase.from('team_members').select('*'),
        supabase.from('projects').select('id, name, status')
      ]);

      setTeamMembers(membersRes.data || demoTeamMembers);
      setProjects(projectsRes.data || demoProjects);
    } catch (error) {
      console.error('Error fetching data:', error);
      setTeamMembers(demoTeamMembers);
      setProjects(demoProjects);
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = useMemo(() => {
    let members = teamMembers.filter(m =>
      departmentFilter === 'All' || m.department === departmentFilter
    );

    switch (sortBy) {
      case 'load':
        return members.sort((a, b) => (b.currentLoad / b.capacity) - (a.currentLoad / a.capacity));
      case 'name':
        return members.sort((a, b) => a.name.localeCompare(b.name));
      case 'tasks':
        return members.sort((a, b) => b.tasks.length - a.tasks.length);
      default:
        return members;
    }
  }, [teamMembers, departmentFilter, sortBy]);

  const teamStats = useMemo(() => {
    const totalCapacity = teamMembers.reduce((sum, m) => sum + m.capacity, 0);
    const totalLoad = teamMembers.reduce((sum, m) => sum + m.currentLoad, 0);
    const totalTasks = teamMembers.reduce((sum, m) => sum + m.tasks.length, 0);
    const overloaded = teamMembers.filter(m => m.currentLoad > m.capacity).length;
    const underutilized = teamMembers.filter(m => (m.currentLoad / m.capacity) < 0.6).length;
    const totalOverdue = teamMembers.reduce((sum, m) => sum + m.overdueItems, 0);
    const completedThisWeek = teamMembers.reduce((sum, m) => sum + m.completedThisWeek, 0);

    return {
      totalCapacity,
      totalLoad,
      utilization: totalCapacity > 0 ? Math.round((totalLoad / totalCapacity) * 100) : 0,
      totalTasks,
      overloaded,
      underutilized,
      totalOverdue,
      completedThisWeek
    };
  }, [teamMembers]);

  function getLoadColor(current, capacity) {
    const ratio = current / capacity;
    if (ratio > 1) return 'text-red-600 bg-red-50';
    if (ratio > 0.9) return 'text-orange-600 bg-orange-50';
    if (ratio > 0.7) return 'text-yellow-600 bg-yellow-50';
    if (ratio < 0.5) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  }

  function getLoadBarColor(current, capacity) {
    const ratio = current / capacity;
    if (ratio > 1) return 'bg-red-500';
    if (ratio > 0.9) return 'bg-orange-500';
    if (ratio > 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Workload Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor team capacity, assignments, and workload distribution</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-2 rounded-lg ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Team Size</div>
          <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Capacity</div>
          <div className="text-2xl font-bold text-gray-900">{teamStats.totalCapacity}h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Current Load</div>
          <div className="text-2xl font-bold text-blue-600">{teamStats.totalLoad}h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Utilization</div>
          <div className={`text-2xl font-bold ${teamStats.utilization > 100 ? 'text-red-600' : teamStats.utilization > 85 ? 'text-yellow-600' : 'text-green-600'}`}>
            {teamStats.utilization}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Tasks</div>
          <div className="text-2xl font-bold text-purple-600">{teamStats.totalTasks}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Overloaded</div>
          <div className="text-2xl font-bold text-red-600">{teamStats.overloaded}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Overdue</div>
          <div className="text-2xl font-bold text-orange-600">{teamStats.totalOverdue}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">{teamStats.completedThisWeek}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="load">Sort by Workload</option>
            <option value="name">Sort by Name</option>
            <option value="tasks">Sort by Tasks</option>
          </select>
        </div>
      </div>

      {/* Team Members - Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                      {member.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  {member.currentLoad > member.capacity && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                      Overloaded
                    </span>
                  )}
                </div>

                {/* Workload Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Workload</span>
                    <span className={`font-medium ${member.currentLoad > member.capacity ? 'text-red-600' : 'text-gray-900'}`}>
                      {member.currentLoad}h / {member.capacity}h
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getLoadBarColor(member.currentLoad, member.capacity)}`}
                      style={{ width: `${Math.min(100, (member.currentLoad / member.capacity) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{member.tasks.length}</div>
                    <div className="text-xs text-gray-500">Tasks</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">{member.completedThisWeek}</div>
                    <div className="text-xs text-gray-500">Done</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className={`text-lg font-bold ${member.overdueItems > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {member.overdueItems}
                    </div>
                    <div className="text-xs text-gray-500">Overdue</div>
                  </div>
                </div>

                {/* Projects */}
                <div className="flex flex-wrap gap-1">
                  {member.projects.slice(0, 3).map((project, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                      {project.length > 15 ? project.substring(0, 15) + '...' : project}
                    </span>
                  ))}
                  {member.projects.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      +{member.projects.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Members - Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workload</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overdue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map(member => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {member.initials}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{member.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getLoadBarColor(member.currentLoad, member.capacity)}`}
                            style={{ width: `${Math.min(100, (member.currentLoad / member.capacity) * 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${member.currentLoad > member.capacity ? 'text-red-600' : 'text-gray-700'}`}>
                          {Math.round((member.currentLoad / member.capacity) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{member.tasks.length}</td>
                    <td className="px-6 py-4 text-green-600 font-medium">{member.completedThisWeek}</td>
                    <td className="px-6 py-4">
                      <span className={member.overdueItems > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
                        {member.overdueItems}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{member.projects.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {selectedMember.initials}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedMember.name}</h2>
                    <p className="text-gray-600">{selectedMember.role} • {selectedMember.department}</p>
                    <p className="text-sm text-gray-500">{selectedMember.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Capacity Overview */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Capacity Overview</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedMember.capacity}h</div>
                    <div className="text-xs text-gray-500">Weekly Capacity</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className={`text-2xl font-bold ${selectedMember.currentLoad > selectedMember.capacity ? 'text-red-600' : 'text-blue-600'}`}>
                      {selectedMember.currentLoad}h
                    </div>
                    <div className="text-xs text-gray-500">Current Load</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className={`text-2xl font-bold ${selectedMember.capacity - selectedMember.currentLoad < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedMember.capacity - selectedMember.currentLoad}h
                    </div>
                    <div className="text-xs text-gray-500">Available</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className={`text-2xl font-bold ${(selectedMember.currentLoad / selectedMember.capacity) > 1 ? 'text-red-600' : 'text-green-600'}`}>
                      {Math.round((selectedMember.currentLoad / selectedMember.capacity) * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Utilization</div>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Assigned Tasks ({selectedMember.tasks.length})</h3>
                <div className="space-y-2">
                  {selectedMember.tasks.map(task => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{task.name}</div>
                          <div className="text-sm text-gray-500">{task.project}</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <div className="text-sm text-gray-600 mt-1">{task.hours}h</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Active Projects</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.projects.map((project, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
