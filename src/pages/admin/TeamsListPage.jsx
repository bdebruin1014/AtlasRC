// src/pages/admin/TeamsListPage.jsx
// Admin Teams management page

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getTeams, createTeam, updateTeam, deleteTeam } from '@/services/teamService';

const TeamsListPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#047857', department: '' });

  useEffect(() => { loadTeams(); }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await getTeams();
      setTeams(data);
    } catch (err) {
      console.error('Error loading teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newTeam = await createTeam(formData);
      setTeams(prev => [...prev, newTeam]);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', color: '#047857', department: '' });
    } catch (err) {
      console.error('Error creating team:', err);
    }
  };

  const handleUpdate = async () => {
    if (!editingTeam) return;
    try {
      const updated = await updateTeam(editingTeam.id, formData);
      setTeams(prev => prev.map(t => t.id === editingTeam.id ? { ...t, ...updated } : t));
      setEditingTeam(null);
      setFormData({ name: '', description: '', color: '#047857', department: '' });
    } catch (err) {
      console.error('Error updating team:', err);
    }
  };

  const handleDelete = async (teamId) => {
    if (!confirm('Delete this team?')) return;
    try {
      await deleteTeam(teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
    } catch (err) {
      console.error('Error deleting team:', err);
    }
  };

  const openEdit = (team) => {
    setEditingTeam(team);
    setFormData({ name: team.name, description: team.description || '', color: team.color || '#047857', department: team.department || '' });
  };

  const filteredTeams = teams.filter(t =>
    !searchTerm || t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2F855A] focus:border-transparent';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-sm text-gray-500">Manage organization teams and members</p>
        </div>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Team
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search teams..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map(team => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: team.color || '#047857' }}>
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{team.name}</CardTitle>
                      {team.department && <p className="text-xs text-gray-500">{team.department}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(team)} className="p-1 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(team.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {team.description && <p className="text-sm text-gray-600 mb-3">{team.description}</p>}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" /> {team.members?.length || 0} members
                  </Badge>
                  {team.is_active && <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>}
                </div>
                {team.members?.length > 0 && (
                  <div className="mt-3 flex -space-x-2">
                    {team.members.slice(0, 5).map((m, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600" title={m.full_name}>
                        {m.full_name?.charAt(0)}
                      </div>
                    ))}
                    {team.members.length > 5 && (
                      <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">+{team.members.length - 5}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal || !!editingTeam} onOpenChange={() => { setShowCreateModal(false); setEditingTeam(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Edit Team' : 'Create Team'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={2} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input type="text" value={formData.department} onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input type="color" value={formData.color} onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); setEditingTeam(null); }}>Cancel</Button>
            <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={editingTeam ? handleUpdate : handleCreate} disabled={!formData.name}>
              {editingTeam ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsListPage;
