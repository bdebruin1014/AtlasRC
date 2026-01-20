import React, { useState } from 'react';
import { Users, Plus, Search, MoreHorizontal, Edit2, UserPlus, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TeamsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);

  const [teams] = useState([
    { id: 1, name: 'Development', description: 'Land development and entitlement team', color: '#047857', members: [
      { id: 1, name: 'Bryan De Bruin', email: 'bryan@vanrock.com', role: 'Team Lead', avatar: 'BD' },
      { id: 2, name: 'John Smith', email: 'john@vanrock.com', role: 'Project Manager', avatar: 'JS' },
      { id: 3, name: 'Sarah Johnson', email: 'sarah@vanrock.com', role: 'Analyst', avatar: 'SJ' },
    ]},
    { id: 2, name: 'Construction', description: 'Construction management and oversight', color: '#2563eb', members: [
      { id: 4, name: 'Mike Williams', email: 'mike@vanrock.com', role: 'Team Lead', avatar: 'MW' },
      { id: 5, name: 'Emily Davis', email: 'emily@vanrock.com', role: 'Site Manager', avatar: 'ED' },
    ]},
    { id: 3, name: 'Finance', description: 'Accounting and investor relations', color: '#7c3aed', members: [
      { id: 6, name: 'Robert Brown', email: 'robert@vanrock.com', role: 'Team Lead', avatar: 'RB' },
      { id: 7, name: 'Lisa Anderson', email: 'lisa@vanrock.com', role: 'Accountant', avatar: 'LA' },
    ]},
    { id: 4, name: 'Sales', description: 'Property sales and disposition', color: '#dc2626', members: [
      { id: 8, name: 'Jennifer Taylor', email: 'jen@vanrock.com', role: 'Team Lead', avatar: 'JT' },
    ]},
  ]);

  const availableUsers = [
    { id: 10, name: 'Alex Johnson', email: 'alex@vanrock.com', avatar: 'AJ' },
    { id: 11, name: 'Chris Lee', email: 'chris@vanrock.com', avatar: 'CL' },
    { id: 12, name: 'Morgan Smith', email: 'morgan@vanrock.com', avatar: 'MS' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Teams</h1>
          <p className="text-sm text-gray-500">Manage teams and team membership</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1" />New Team
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search teams..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: team.color + '20' }}>
                  <Users className="w-5 h-5" style={{ color: team.color }} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-500">{team.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {team.members.slice(0, 4).map((member) => (
                    <div key={member.id} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium" title={member.name}>{member.avatar}</div>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{team.members.length} members</span>
                <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", expandedTeam === team.id && "rotate-180")} />
              </div>
            </div>

            {expandedTeam === team.id && (
              <div className="border-t border-gray-200">
                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Team Members</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowAddMemberModal(team); }}><UserPlus className="w-4 h-4 mr-1" />Add Member</Button>
                    <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1" />Edit Team</Button>
                  </div>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Member</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {team.members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">{member.avatar}</div>
                            <span className="font-medium text-gray-900">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex px-2 py-1 text-xs rounded-full", member.role === 'Team Lead' ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700")}>{member.role}</span>
                        </td>
                        <td className="px-4 py-3"><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Create New Team</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label><Input placeholder="e.g., Acquisitions" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><Input placeholder="What does this team do?" /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2">
                  {['#047857', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#0891b2'].map((c) => (
                    <button key={c} className="w-8 h-8 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Create Team</Button>
            </div>
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Add Members to {showAddMemberModal.name}</h2>
              <button onClick={() => setShowAddMemberModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Users</label>
              <div className="border rounded-md divide-y max-h-48 overflow-auto">
                {availableUsers.map((user) => (
                  <button key={user.id} className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">{user.avatar}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowAddMemberModal(null)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Add Members</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
