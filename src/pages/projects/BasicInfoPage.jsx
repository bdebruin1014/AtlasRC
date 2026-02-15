// src/pages/projects/BasicInfoPage.jsx
// Consolidated project settings page with all basic info and team/entity assignments

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Building2, Users, Calendar, CheckCircle, Plus, Search, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EntitySelector } from '@/components/shared/EntitySelector';
import { getTeams, createTeam, TEAM_COLORS } from '@/services/teamService';

const PROJECT_TYPES = [
  { id: 'build-to-rent', label: 'Build to Rent' },
  { id: 'lot-development', label: 'Lot Development' },
  { id: 'community-development', label: 'Community Development' },
  { id: 'scattered-lot', label: 'Scattered Lot' },
  { id: 'fix-n-flip', label: 'Fix n Flip' },
];

const PROJECT_STATUSES = [
  { id: 'planning', label: 'Planning' },
  { id: 'active', label: 'Active' },
  { id: 'on-hold', label: 'On Hold' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const PROJECT_TEMPLATES = [
  { id: 'blank', label: 'Blank Project' },
  { id: 'single-family', label: 'Single Family Build' },
  { id: 'multi-family', label: 'Multi-Family Development' },
  { id: 'subdivision', label: 'Subdivision Development' },
  { id: 'land-acquisition', label: 'Land Acquisition' },
  { id: 'renovation', label: 'Renovation/Rehab' },
];

const BasicInfoPage = () => {
  const { projectId: _projectId } = useParams();
  const [saved, setSaved] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamData, setNewTeamData] = useState({ name: '', description: '', color: TEAM_COLORS[0] });
  const [creatingTeam, setCreatingTeam] = useState(false);

  const [formData, setFormData] = useState({
    projectName: 'Watson House',
    projectNumber: '25-001',
    projectType: 'build-to-rent',
    status: 'active',
    entityId: null,
    teamId: null,
    templateId: 'blank',
    unitsToDevelop: 1,
    description: 'Spec home build in Highland Park subdivision',
    startDate: '2025-01-15',
    targetCompletion: '2025-08-30',
    // Address & Location
    address: '',
    city: 'Greenville',
    state: 'SC',
    zip: '',
    county: 'Greenville County',
    parcelId: '',
    lotSize: '',
    zoning: '',
  });

  // Load teams on mount
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setTeamsLoading(true);
    try {
      const data = await getTeams({ isActive: true });
      setTeams(data || []);
    } catch {
      setTeams([]);
    } finally {
      setTeamsLoading(false);
    }
  };

  const filteredTeams = teams.filter(team =>
    !teamSearchQuery || team.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

  const selectedTeam = teams.find(t => t.id === formData.teamId);

  const handleCreateTeam = async () => {
    if (!newTeamData.name.trim()) return;
    setCreatingTeam(true);
    try {
      const { data, error } = await createTeam(newTeamData);
      if (data && !error) {
        setTeams(prev => [...prev, data]);
        setFormData(prev => ({ ...prev, teamId: data.id }));
        setShowCreateTeamModal(false);
        setNewTeamData({ name: '', description: '', color: TEAM_COLORS[0] });
      }
    } catch {
      // Error handled silently
    } finally {
      setCreatingTeam(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent text-sm';

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>
          <p className="text-sm text-gray-500">Manage project information, team assignments, and timeline</p>
        </div>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={handleSave}>
          {saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2F855A]" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                  className={inputClass}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Number</label>
                <input type="text" value={formData.projectNumber} readOnly className={`${inputClass} bg-gray-50`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type *</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => updateField('projectType', e.target.value)}
                  className={inputClass}
                >
                  {PROJECT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className={inputClass}
                >
                  {PROJECT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Units to Develop</label>
                <input
                  type="number"
                  min="1"
                  value={formData.unitsToDevelop}
                  onChange={(e) => updateField('unitsToDevelop', parseInt(e.target.value) || 1)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Template</label>
                <select
                  value={formData.templateId}
                  onChange={(e) => updateField('templateId', e.target.value)}
                  className={inputClass}
                >
                  {PROJECT_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="Enter project description..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2F855A]" />
              Address & Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  className={inputClass}
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city || 'Greenville'}
                  onChange={(e) => updateField('city', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state || 'SC'}
                  onChange={(e) => updateField('state', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  value={formData.zip || ''}
                  onChange={(e) => updateField('zip', e.target.value)}
                  className={inputClass}
                  placeholder="29601"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                <input
                  type="text"
                  value={formData.county || ''}
                  onChange={(e) => updateField('county', e.target.value)}
                  className={inputClass}
                  placeholder="Greenville County"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parcel / Tax ID</label>
                <input
                  type="text"
                  value={formData.parcelId || ''}
                  onChange={(e) => updateField('parcelId', e.target.value)}
                  className={inputClass}
                  placeholder="0123-45-67-890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lot Size (acres)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lotSize || ''}
                  onChange={(e) => updateField('lotSize', e.target.value)}
                  className={inputClass}
                  placeholder="0.25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zoning</label>
                <input
                  type="text"
                  value={formData.zoning || ''}
                  onChange={(e) => updateField('zoning', e.target.value)}
                  className={inputClass}
                  placeholder="R-1, PD, C-2..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team & Entity Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2F855A]" />
              Team & Entity Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Project Team Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Team</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div
                      className={`${inputClass} cursor-pointer flex items-center justify-between`}
                      onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                    >
                      {selectedTeam ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: selectedTeam.color || '#047857' }}
                          />
                          <span>{selectedTeam.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Select team...</span>
                      )}
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>

                    {showTeamDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        <div className="p-2 border-b">
                          <input
                            type="text"
                            placeholder="Search teams..."
                            value={teamSearchQuery}
                            onChange={(e) => setTeamSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                            autoFocus
                          />
                        </div>
                        {teamsLoading ? (
                          <div className="p-3 text-sm text-gray-500 text-center">Loading...</div>
                        ) : filteredTeams.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500 text-center">No teams found</div>
                        ) : (
                          <div className="py-1">
                            {filteredTeams.map(team => (
                              <div
                                key={team.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                onClick={() => {
                                  updateField('teamId', team.id);
                                  setShowTeamDropdown(false);
                                  setTeamSearchQuery('');
                                }}
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: team.color || '#047857' }}
                                />
                                <span className="text-sm">{team.name}</span>
                                <span className="text-xs text-gray-400 ml-auto">
                                  {team.members?.length || 0} members
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div
                          className="p-2 border-t hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setShowTeamDropdown(false);
                            setShowCreateTeamModal(true);
                          }}
                        >
                          <div className="flex items-center gap-2 text-[#2F855A] text-sm font-medium">
                            <Plus className="w-4 h-4" />
                            Create New Team
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedTeam && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateField('teamId', null)}
                      className="h-10 w-10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Project Entity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Entity *</label>
                <EntitySelector
                  value={formData.entityId}
                  onChange={(value) => updateField('entityId', value)}
                  placeholder="Select entity..."
                  showCreateButton={true}
                  filterTypes={['project_entity', 'holding_company', 'operating_entity']}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2F855A]" />
              Project Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Completion</label>
                <input
                  type="date"
                  value={formData.targetCompletion}
                  onChange={(e) => updateField('targetCompletion', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            {formData.startDate && formData.targetCompletion && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Project Duration:</span>{' '}
                  {Math.ceil((new Date(formData.targetCompletion) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Team Modal */}
      <Dialog open={showCreateTeamModal} onOpenChange={setShowCreateTeamModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a new team that can be assigned to projects.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="teamName">Team Name *</Label>
              <Input
                id="teamName"
                value={newTeamData.name}
                onChange={(e) => setNewTeamData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Development Team"
              />
            </div>
            <div>
              <Label htmlFor="teamDescription">Description</Label>
              <Input
                id="teamDescription"
                value={newTeamData.description}
                onChange={(e) => setNewTeamData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Team description..."
              />
            </div>
            <div>
              <Label>Team Color</Label>
              <div className="flex gap-2 mt-2">
                {TEAM_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${newTeamData.color === color ? 'border-gray-800' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTeamData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTeamModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTeam}
              disabled={creatingTeam || !newTeamData.name.trim()}
              className="bg-[#2F855A] hover:bg-[#276749]"
            >
              {creatingTeam ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Click outside to close team dropdown */}
      {showTeamDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowTeamDropdown(false)}
        />
      )}
    </div>
  );
};

export default BasicInfoPage;
