import React, { useState } from 'react';
import { Plus, Search, List, LayoutGrid, Columns, Eye, Edit2, Trash2, Building2, Users, Target, CheckCircle, Clock, AlertTriangle, Calendar, TrendingUp, MoreVertical, Link2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const EOSMainPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', 'grid'
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Entities from accounting module that can be linked
  const availableEntities = [
    { id: 'ent-1', name: 'VanRock Holdings LLC', type: 'Holding Company' },
    { id: 'ent-2', name: 'Oakridge Estates LLC', type: 'Project Entity' },
    { id: 'ent-3', name: 'VanRock Construction LLC', type: 'Operating Company' },
    { id: 'ent-4', name: 'VanRock Property Management LLC', type: 'Operating Company' },
    { id: 'ent-5', name: 'Riverside Development LLC', type: 'Project Entity' },
    { id: 'ent-6', name: 'Olive Brynn LLC', type: 'Family Office' },
  ];

  const [eosPrograms, setEosPrograms] = useState([
    {
      id: 'eos-1',
      name: 'VanRock Holdings EOS',
      entityId: 'ent-1',
      entityName: 'VanRock Holdings LLC',
      status: 'active',
      implementationDate: '2024-01-15',
      currentQuarter: 'Q1 2025',
      rocksComplete: 3,
      rocksTotal: 5,
      l10Streak: 12,
      scorecardHealth: 85,
      lastMeeting: '2024-12-26',
      nextMeeting: '2025-01-02',
      teamMembers: 6,
      openIssues: 8,
      phase: 'Traction',
    },
    {
      id: 'eos-2',
      name: 'VanRock Construction EOS',
      entityId: 'ent-3',
      entityName: 'VanRock Construction LLC',
      status: 'active',
      implementationDate: '2024-06-01',
      currentQuarter: 'Q1 2025',
      rocksComplete: 2,
      rocksTotal: 4,
      l10Streak: 8,
      scorecardHealth: 72,
      lastMeeting: '2024-12-26',
      nextMeeting: '2025-01-02',
      teamMembers: 4,
      openIssues: 12,
      phase: 'Building',
    },
    {
      id: 'eos-3',
      name: 'Property Management EOS',
      entityId: 'ent-4',
      entityName: 'VanRock Property Management LLC',
      status: 'setup',
      implementationDate: '2024-12-01',
      currentQuarter: 'Q1 2025',
      rocksComplete: 0,
      rocksTotal: 3,
      l10Streak: 2,
      scorecardHealth: 45,
      lastMeeting: '2024-12-19',
      nextMeeting: '2025-01-02',
      teamMembers: 3,
      openIssues: 5,
      phase: 'Vision Building',
    },
  ]);

  const [newProgram, setNewProgram] = useState({
    name: '',
    entityId: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'setup': return 'bg-blue-100 text-blue-700';
      case 'paused': return 'bg-amber-100 text-amber-700';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'Vision Building': return 'bg-purple-100 text-purple-700';
      case 'Building': return 'bg-blue-100 text-blue-700';
      case 'Traction': return 'bg-green-100 text-green-700';
      case 'Mastery': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getHealthColor = (health) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const filteredPrograms = eosPrograms.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.entityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProgram = () => {
    if (!newProgram.name || !newProgram.entityId) return;
    const entity = availableEntities.find(e => e.id === newProgram.entityId);
    const program = {
      id: `eos-${Date.now()}`,
      name: newProgram.name,
      entityId: newProgram.entityId,
      entityName: entity?.name || '',
      status: 'setup',
      implementationDate: new Date().toISOString().split('T')[0],
      currentQuarter: 'Q1 2025',
      rocksComplete: 0,
      rocksTotal: 0,
      l10Streak: 0,
      scorecardHealth: 0,
      lastMeeting: null,
      nextMeeting: null,
      teamMembers: 0,
      openIssues: 0,
      phase: 'Vision Building',
    };
    setEosPrograms(prev => [...prev, program]);
    setShowNewModal(false);
    setNewProgram({ name: '', entityId: '' });
  };

  const totalRocks = eosPrograms.reduce((sum, p) => sum + p.rocksTotal, 0);
  const completedRocks = eosPrograms.reduce((sum, p) => sum + p.rocksComplete, 0);
  const totalIssues = eosPrograms.reduce((sum, p) => sum + p.openIssues, 0);
  const avgHealth = Math.round(eosPrograms.reduce((sum, p) => sum + p.scorecardHealth, 0) / eosPrograms.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">EOS® Implementation</h1>
            <p className="text-sm text-gray-500">Entrepreneur Operating System tracking across your entities</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/eos/cadence')}>
              <RefreshCw className="w-4 h-4 mr-2" />Team Cadence
            </Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowNewModal(true)}>
              <Plus className="w-4 h-4 mr-2" />New EOS Program
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{eosPrograms.length}</p>
                <p className="text-xs text-gray-500">EOS Programs</p>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedRocks}/{totalRocks}</p>
                <p className="text-xs text-gray-500">Rocks Complete</p>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalIssues}</p>
                <p className="text-xs text-gray-500">Open Issues</p>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className={cn("text-2xl font-bold", getHealthColor(avgHealth))}>{avgHealth}%</p>
                <p className="text-xs text-gray-500">Avg Scorecard</p>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{eosPrograms.reduce((sum, p) => sum + p.teamMembers, 0)}</p>
                <p className="text-xs text-gray-500">Team Members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search EOS programs..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border rounded-lg overflow-hidden">
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-2", viewMode === 'list' ? "bg-gray-100" : "hover:bg-gray-50")}
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('kanban')}
                  className={cn("p-2", viewMode === 'kanban' ? "bg-gray-100" : "hover:bg-gray-50")}
                >
                  <Columns className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2", viewMode === 'grid' ? "bg-gray-100" : "hover:bg-gray-50")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Program</th>
                  <th className="text-left px-4 py-3 font-medium">Entity</th>
                  <th className="text-left px-4 py-3 font-medium">Phase</th>
                  <th className="text-center px-4 py-3 font-medium">Rocks</th>
                  <th className="text-center px-4 py-3 font-medium">L10 Streak</th>
                  <th className="text-center px-4 py-3 font-medium">Scorecard</th>
                  <th className="text-center px-4 py-3 font-medium">Issues</th>
                  <th className="text-left px-4 py-3 font-medium">Next Meeting</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/eos/${program.id}`)}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{program.name}</p>
                      <p className="text-xs text-gray-500">Since {program.implementationDate}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-3 h-3 text-gray-400" />
                        <span>{program.entityName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs", getPhaseColor(program.phase))}>
                        {program.phase}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">{program.rocksComplete}/{program.rocksTotal}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">{program.l10Streak} weeks</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("font-medium", getHealthColor(program.scorecardHealth))}>
                        {program.scorecardHealth}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("font-medium", program.openIssues > 10 ? "text-red-600" : "")}>
                        {program.openIssues}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{program.nextMeeting || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(program.status))}>
                        {program.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-4 gap-4">
            {['Vision Building', 'Building', 'Traction', 'Mastery'].map((phase) => {
              const phasePrograms = filteredPrograms.filter(p => p.phase === phase);
              return (
                <div key={phase} className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{phase}</h3>
                    <span className="text-sm text-gray-500">{phasePrograms.length}</span>
                  </div>
                  <div className="space-y-3">
                    {phasePrograms.map((program) => (
                      <div 
                        key={program.id} 
                        className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/eos/${program.id}`)}
                      >
                        <h4 className="font-medium mb-2">{program.name}</h4>
                        <p className="text-xs text-gray-500 mb-3">{program.entityName}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span>Rocks: {program.rocksComplete}/{program.rocksTotal}</span>
                          <span className={getHealthColor(program.scorecardHealth)}>{program.scorecardHealth}%</span>
                        </div>
                        <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs text-gray-500">
                          <span>L10: {program.l10Streak}w</span>
                          <span>{program.openIssues} issues</span>
                        </div>
                      </div>
                    ))}
                    {phasePrograms.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No programs</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-3 gap-4">
            {filteredPrograms.map((program) => (
              <div 
                key={program.id} 
                className="bg-white border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/eos/${program.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{program.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Link2 className="w-3 h-3" />{program.entityName}
                    </p>
                  </div>
                  <span className={cn("px-2 py-1 rounded text-xs", getPhaseColor(program.phase))}>
                    {program.phase}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold">{program.rocksComplete}/{program.rocksTotal}</p>
                    <p className="text-xs text-gray-500">Rocks</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className={cn("text-xl font-bold", getHealthColor(program.scorecardHealth))}>{program.scorecardHealth}%</p>
                    <p className="text-xs text-gray-500">Scorecard</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{program.l10Streak} week L10 streak</span>
                  <span>{program.openIssues} issues</span>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-xs text-gray-500">Next: {program.nextMeeting || 'Not scheduled'}</span>
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(program.status))}>
                    {program.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Program Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">New EOS Program</h3>
              <button onClick={() => setShowNewModal(false)}>
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Program Name *</label>
                <Input 
                  value={newProgram.name} 
                  onChange={(e) => setNewProgram(prev => ({ ...prev, name: e.target.value }))} 
                  placeholder="e.g., VanRock Holdings EOS"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Link to Entity *</label>
                <select 
                  className="w-full border rounded-md px-3 py-2"
                  value={newProgram.entityId}
                  onChange={(e) => setNewProgram(prev => ({ ...prev, entityId: e.target.value }))}
                >
                  <option value="">Select an entity...</option>
                  {availableEntities.map(entity => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name} ({entity.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-800 mb-1">What is EOS®?</p>
                <p className="text-blue-700 text-xs">
                  The Entrepreneur Operating System is a complete set of simple concepts and practical tools 
                  that has helped thousands of entrepreneurs get what they want from their businesses.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowNewModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleCreateProgram}>
                Create Program
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EOSMainPage;
