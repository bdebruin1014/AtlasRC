import React, { useState } from 'react';
import { Plus, Search, Mountain, CheckCircle, Clock, AlertTriangle, X, Edit2, Trash2, ChevronDown, ChevronRight, User, Calendar, Target, Filter, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EOSRocks = ({ program }) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedRock, setSelectedRock] = useState(null);
  const [filterQuarter, setFilterQuarter] = useState('Q1 2025');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRock, setExpandedRock] = useState(null);

  const quarters = ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'];

  const teamMembers = [
    { id: 1, name: 'Bryan VanRock', role: 'Visionary/Integrator' },
    { id: 2, name: 'Sarah Mitchell', role: 'Director of Operations' },
    { id: 3, name: 'Mike Johnson', role: 'Director of Construction' },
    { id: 4, name: 'Lisa Chen', role: 'Controller' },
    { id: 5, name: 'Tom Wilson', role: 'Project Manager' },
    { id: 6, name: 'Dave Brown', role: 'Superintendent' },
  ];

  const [rocks, setRocks] = useState([
    {
      id: 1,
      title: 'Launch new property management software',
      description: 'Research, select, and implement a property management software solution for the PM division',
      owner: 'Bryan VanRock',
      ownerId: 1,
      quarter: 'Q1 2025',
      status: 'on-track',
      progress: 75,
      dueDate: '2025-03-31',
      milestones: [
        { id: 1, text: 'Complete software research', done: true, dueDate: '2025-01-15' },
        { id: 2, text: 'Select vendor', done: true, dueDate: '2025-01-31' },
        { id: 3, text: 'Complete implementation', done: false, dueDate: '2025-02-28' },
        { id: 4, text: 'Train team', done: false, dueDate: '2025-03-15' },
        { id: 5, text: 'Go live', done: false, dueDate: '2025-03-31' },
      ],
      updates: [
        { date: '2024-12-26', text: 'Selected AppFolio as our vendor. Starting implementation next week.' },
        { date: '2024-12-19', text: 'Narrowed down to 3 vendors. Scheduling demos.' },
      ],
    },
    {
      id: 2,
      title: 'Hire 2 project managers',
      description: 'Recruit, interview, and onboard two experienced project managers to support growth',
      owner: 'Sarah Mitchell',
      ownerId: 2,
      quarter: 'Q1 2025',
      status: 'on-track',
      progress: 60,
      dueDate: '2025-03-31',
      milestones: [
        { id: 1, text: 'Create job description', done: true, dueDate: '2025-01-10' },
        { id: 2, text: 'Post job listings', done: true, dueDate: '2025-01-15' },
        { id: 3, text: 'First round interviews', done: true, dueDate: '2025-02-15' },
        { id: 4, text: 'Final interviews', done: false, dueDate: '2025-02-28' },
        { id: 5, text: 'Make offers', done: false, dueDate: '2025-03-15' },
        { id: 6, text: 'Onboard new hires', done: false, dueDate: '2025-03-31' },
      ],
      updates: [
        { date: '2024-12-26', text: '8 candidates in pipeline. 3 strong candidates for second round.' },
      ],
    },
    {
      id: 3,
      title: 'Complete ISO certification',
      description: 'Achieve ISO 9001:2015 certification for quality management systems',
      owner: 'Mike Johnson',
      ownerId: 3,
      quarter: 'Q1 2025',
      status: 'on-track',
      progress: 80,
      dueDate: '2025-03-31',
      milestones: [
        { id: 1, text: 'Gap analysis complete', done: true, dueDate: '2024-12-15' },
        { id: 2, text: 'Documentation updated', done: true, dueDate: '2025-01-31' },
        { id: 3, text: 'Internal audit', done: true, dueDate: '2025-02-15' },
        { id: 4, text: 'Corrective actions', done: true, dueDate: '2025-02-28' },
        { id: 5, text: 'External audit', done: false, dueDate: '2025-03-20' },
      ],
      updates: [
        { date: '2024-12-26', text: 'Internal audit complete with minor findings. Addressing now.' },
      ],
    },
    {
      id: 4,
      title: 'Implement new CRM system',
      description: 'Deploy HubSpot CRM for sales and marketing automation',
      owner: 'Lisa Chen',
      ownerId: 4,
      quarter: 'Q1 2025',
      status: 'at-risk',
      progress: 35,
      dueDate: '2025-03-31',
      milestones: [
        { id: 1, text: 'CRM selection', done: true, dueDate: '2025-01-15' },
        { id: 2, text: 'Data migration plan', done: true, dueDate: '2025-01-31' },
        { id: 3, text: 'System configuration', done: false, dueDate: '2025-02-28' },
        { id: 4, text: 'Team training', done: false, dueDate: '2025-03-15' },
        { id: 5, text: 'Go live', done: false, dueDate: '2025-03-31' },
      ],
      updates: [
        { date: '2024-12-26', text: 'Data migration taking longer than expected. May need to adjust timeline.' },
      ],
    },
    {
      id: 5,
      title: 'Establish vendor qualification process',
      description: 'Create and implement a standardized vendor qualification and approval process',
      owner: 'Tom Wilson',
      ownerId: 5,
      quarter: 'Q1 2025',
      status: 'off-track',
      progress: 20,
      dueDate: '2025-03-31',
      milestones: [
        { id: 1, text: 'Define requirements', done: true, dueDate: '2025-01-15' },
        { id: 2, text: 'Create application form', done: false, dueDate: '2025-01-31' },
        { id: 3, text: 'Build evaluation criteria', done: false, dueDate: '2025-02-15' },
        { id: 4, text: 'Pilot with 5 vendors', done: false, dueDate: '2025-03-15' },
        { id: 5, text: 'Full rollout', done: false, dueDate: '2025-03-31' },
      ],
      updates: [
        { date: '2024-12-26', text: 'Been pulled into other projects. Need to refocus on this rock.' },
      ],
    },
  ]);

  const [newRock, setNewRock] = useState({
    title: '',
    description: '',
    ownerId: '',
    dueDate: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-700';
      case 'at-risk': return 'bg-amber-100 text-amber-700';
      case 'off-track': return 'bg-red-100 text-red-700';
      case 'complete': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'on-track': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'at-risk': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'off-track': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'complete': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'on-track': return 'bg-green-500';
      case 'at-risk': return 'bg-amber-500';
      case 'off-track': return 'bg-red-500';
      case 'complete': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredRocks = rocks.filter(rock => {
    const matchesQuarter = rock.quarter === filterQuarter;
    const matchesStatus = filterStatus === 'all' || rock.status === filterStatus;
    return matchesQuarter && matchesStatus;
  });

  const onTrack = filteredRocks.filter(r => r.status === 'on-track').length;
  const atRisk = filteredRocks.filter(r => r.status === 'at-risk').length;
  const offTrack = filteredRocks.filter(r => r.status === 'off-track').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Rocks</h1>
          <p className="text-sm text-gray-500">Quarterly priorities that move your company forward</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />New Rock
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{filteredRocks.length}</p>
          <p className="text-sm text-gray-500">Total Rocks</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-2xl font-bold text-green-600">{onTrack}</p>
          <p className="text-sm text-gray-500">On Track</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-2xl font-bold text-amber-600">{atRisk}</p>
          <p className="text-sm text-gray-500">At Risk</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-2xl font-bold text-red-600">{offTrack}</p>
          <p className="text-sm text-gray-500">Off Track</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <select 
            className="border rounded-md px-3 py-2 text-sm"
            value={filterQuarter}
            onChange={(e) => setFilterQuarter(e.target.value)}
          >
            {quarters.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          <select 
            className="border rounded-md px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="on-track">On Track</option>
            <option value="at-risk">At Risk</option>
            <option value="off-track">Off Track</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      {/* Rocks List */}
      <div className="space-y-4">
        {filteredRocks.map((rock) => (
          <div key={rock.id} className="bg-white border rounded-lg overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedRock(expandedRock === rock.id ? null : rock.id)}
            >
              <div className="flex items-start gap-4">
                {getStatusIcon(rock.status)}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{rock.title}</h3>
                      <p className="text-sm text-gray-500">{rock.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(rock.status))}>
                        {rock.status.replace('-', ' ')}
                      </span>
                      {expandedRock === rock.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <User className="w-4 h-4" />{rock.owner}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-4 h-4" />Due: {rock.dueDate}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs">
                        <div 
                          className={cn("h-full rounded-full", getProgressColor(rock.status))}
                          style={{ width: `${rock.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-10">{rock.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedRock === rock.id && (
              <div className="border-t bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Milestones */}
                  <div>
                    <h4 className="font-medium mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {rock.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-3 text-sm">
                          <input 
                            type="checkbox" 
                            checked={milestone.done} 
                            className="w-4 h-4 rounded border-gray-300"
                            onChange={() => {}}
                          />
                          <span className={cn(milestone.done && "line-through text-gray-400")}>{milestone.text}</span>
                          <span className="text-xs text-gray-400 ml-auto">{milestone.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Updates */}
                  <div>
                    <h4 className="font-medium mb-3">Recent Updates</h4>
                    <div className="space-y-2">
                      {rock.updates.map((update, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="text-xs text-gray-400">{update.date}</p>
                          <p>{update.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
                  <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" />Add Update</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Rock Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">New Rock</h3>
              <button onClick={() => setShowNewModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Rock Title *</label>
                <Input 
                  value={newRock.title} 
                  onChange={(e) => setNewRock(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What needs to be accomplished?"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2"
                  rows={3}
                  value={newRock.description}
                  onChange={(e) => setNewRock(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about this rock..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Owner *</label>
                  <select 
                    className="w-full border rounded-md px-3 py-2"
                    value={newRock.ownerId}
                    onChange={(e) => setNewRock(prev => ({ ...prev, ownerId: e.target.value }))}
                  >
                    <option value="">Select owner...</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Due Date</label>
                  <Input 
                    type="date"
                    value={newRock.dueDate}
                    onChange={(e) => setNewRock(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-800 mb-1">What makes a good Rock?</p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>• SMART: Specific, Measurable, Attainable, Realistic, Timely</li>
                  <li>• Should be completable within the quarter (90 days)</li>
                  <li>• One owner - someone who is accountable</li>
                  <li>• Should move the company closer to its vision</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowNewModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Create Rock</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EOSRocks;
