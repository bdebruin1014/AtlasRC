import React, { useState } from 'react';
import { Plus, Calendar, Target, Mountain, CheckCircle, Clock, AlertTriangle, Users, FileText, Edit2, Play, Download, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EOSQuarterlyPlanning = ({ program }) => {
  const [selectedSession, setSelectedSession] = useState('Q1 2025');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'rocks', 'agenda', 'review'

  const quarterlySessions = [
    { id: 'Q1 2025', status: 'upcoming', date: '2025-01-15', location: 'Office Conference Room' },
    { id: 'Q4 2024', status: 'complete', date: '2024-10-15', location: 'Office Conference Room' },
    { id: 'Q3 2024', status: 'complete', date: '2024-07-15', location: 'Offsite - Lake Keowee' },
    { id: 'Q2 2024', status: 'complete', date: '2024-04-15', location: 'Office Conference Room' },
  ];

  const currentSession = quarterlySessions.find(s => s.id === selectedSession);

  const quarterlyAgenda = [
    { time: '8:00 AM', duration: '15 min', item: 'Check-in / Segue', description: 'Personal and professional best since last quarterly' },
    { time: '8:15 AM', duration: '30 min', item: 'Review V/TO', description: 'Vision and Traction Organizer review' },
    { time: '8:45 AM', duration: '60 min', item: 'Previous Quarter Review', description: 'Rock completion, scorecard, issues solved' },
    { time: '9:45 AM', duration: '15 min', item: 'Break', description: '' },
    { time: '10:00 AM', duration: '90 min', item: 'Establish Next Quarter Rocks', description: 'Set company and individual rocks for Q1' },
    { time: '11:30 AM', duration: '30 min', item: 'Tackle Key Issues', description: 'IDS on top 2-3 strategic issues' },
    { time: '12:00 PM', duration: '45 min', item: 'Lunch', description: '' },
    { time: '12:45 PM', duration: '60 min', item: 'Continue IDS', description: 'Continue strategic issue solving' },
    { time: '1:45 PM', duration: '30 min', item: 'Next Steps & To-Dos', description: 'Capture all action items' },
    { time: '2:15 PM', duration: '15 min', item: 'Conclude', description: 'Rate meeting, cascading message, next quarterly date' },
  ];

  const lastQuarterRocks = [
    { rock: 'Complete Oakridge Phase 1 construction', owner: 'Mike Johnson', status: 'complete', completion: 100 },
    { rock: 'Hire Controller', owner: 'Bryan VanRock', status: 'complete', completion: 100 },
    { rock: 'Implement new accounting software', owner: 'Lisa Chen', status: 'complete', completion: 100 },
    { rock: 'Close 3 pre-sales at Oakridge', owner: 'Sarah Mitchell', status: 'incomplete', completion: 67 },
    { rock: 'Establish PM division business plan', owner: 'Bryan VanRock', status: 'complete', completion: 100 },
  ];

  const proposedRocks = [
    { rock: 'Launch new property management software', owner: 'Bryan VanRock', priority: 1 },
    { rock: 'Hire 2 project managers', owner: 'Sarah Mitchell', priority: 2 },
    { rock: 'Complete ISO certification', owner: 'Mike Johnson', priority: 3 },
    { rock: 'Implement new CRM system', owner: 'Lisa Chen', priority: 4 },
    { rock: 'Establish vendor qualification process', owner: 'Tom Wilson', priority: 5 },
  ];

  const completionRate = Math.round((lastQuarterRocks.filter(r => r.status === 'complete').length / lastQuarterRocks.length) * 100);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quarterly Planning</h1>
          <p className="text-sm text-gray-500">Plan rocks and review progress every 90 days</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="border rounded-md px-3 py-2"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            {quarterlySessions.map(s => (
              <option key={s.id} value={s.id}>{s.id} - {s.status}</option>
            ))}
          </select>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />Schedule Session
          </Button>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#047857] rounded-lg flex items-center justify-center text-white font-bold">
              {selectedSession.split(' ')[0]}
            </div>
            <div>
              <h2 className="font-semibold">{selectedSession} Quarterly Planning Session</h2>
              <p className="text-sm text-gray-500">{currentSession?.date} • {currentSession?.location}</p>
            </div>
          </div>
          <span className={cn(
            "px-3 py-1 rounded text-sm capitalize",
            currentSession?.status === 'upcoming' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
          )}>
            {currentSession?.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('overview')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'overview' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Overview
        </button>
        <button onClick={() => setActiveTab('review')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'review' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Last Quarter Review
        </button>
        <button onClick={() => setActiveTab('rocks')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'rocks' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          New Rocks
        </button>
        <button onClick={() => setActiveTab('agenda')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'agenda' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Agenda
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Quarterly Planning Purpose</h3>
              <p className="text-gray-600 mb-4">
                The Quarterly Planning Session is a full-day meeting where the leadership team reviews the past quarter, 
                celebrates wins, learns from misses, and sets new rocks for the coming 90 days.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
                  <p className="font-medium">Review &amp; Reflect</p>
                  <p className="text-sm text-gray-600">Evaluate last quarter&apos;s performance</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <Target className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="font-medium">Set New Rocks</p>
                  <p className="text-sm text-gray-600">Establish 3-7 priorities for next 90 days</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <Users className="w-5 h-5 text-purple-500 mb-2" />
                  <p className="font-medium">Team Alignment</p>
                  <p className="text-sm text-gray-600">Ensure everyone is on the same page</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
                  <p className="font-medium">Solve Issues</p>
                  <p className="text-sm text-gray-600">Address strategic challenges</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Key Metrics This Quarter</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-[#047857]">{completionRate}%</p>
                  <p className="text-sm text-gray-500">Rock Completion</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold">85%</p>
                  <p className="text-sm text-gray-500">Avg Scorecard</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-sm text-gray-500">L10 Streak</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Session Checklist</h3>
              <div className="space-y-3">
                {[
                  { item: 'Book meeting room', done: true },
                  { item: 'Send calendar invites', done: true },
                  { item: 'Prepare V/TO review', done: false },
                  { item: 'Compile rock status', done: false },
                  { item: 'Gather scorecard data', done: false },
                  { item: 'Order lunch', done: false },
                ].map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="checkbox" checked={task.done} className="w-4 h-4 rounded" onChange={() => {}} />
                    <span className={cn(task.done && "line-through text-gray-400")}>{task.item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Attendees</h3>
              <div className="space-y-2">
                {['Bryan VanRock', 'Sarah Mitchell', 'Mike Johnson', 'Lisa Chen', 'Tom Wilson', 'Dave Brown'].map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last Quarter Review Tab */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Q4 2024 Rock Results</h3>
              <span className={cn(
                "px-3 py-1 rounded text-sm font-medium",
                completionRate >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              )}>
                {completionRate}% Complete
              </span>
            </div>
            <div className="space-y-3">
              {lastQuarterRocks.map((rock, idx) => (
                <div key={idx} className={cn(
                  "flex items-center justify-between p-4 rounded-lg",
                  rock.status === 'complete' ? "bg-green-50" : "bg-red-50"
                )}>
                  <div className="flex items-center gap-3">
                    {rock.status === 'complete' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{rock.rock}</p>
                      <p className="text-sm text-gray-500">{rock.owner}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-bold",
                    rock.completion === 100 ? "text-green-600" : "text-red-600"
                  )}>
                    {rock.completion}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Rocks Tab */}
      {activeTab === 'rocks' && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{selectedSession} Proposed Rocks</h3>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Rock</Button>
          </div>
          <div className="space-y-3">
            {proposedRocks.map((rock, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <span className="w-8 h-8 bg-[#047857] text-white rounded-full flex items-center justify-center font-bold">
                  {rock.priority}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{rock.rock}</p>
                  <p className="text-sm text-gray-500">{rock.owner}</p>
                </div>
                <Button variant="outline" size="sm"><Edit2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agenda Tab */}
      {activeTab === 'agenda' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold">Quarterly Planning Session Agenda</h3>
            <p className="text-sm text-gray-500">8:00 AM - 2:30 PM (6.5 hours)</p>
          </div>
          <div className="divide-y">
            {quarterlyAgenda.map((item, idx) => (
              <div key={idx} className={cn("p-4 flex gap-4", item.item === 'Break' || item.item === 'Lunch' ? "bg-gray-50" : "")}>
                <div className="w-24 text-sm">
                  <p className="font-medium">{item.time}</p>
                  <p className="text-gray-500">{item.duration}</p>
                </div>
                <div>
                  <p className="font-medium">{item.item}</p>
                  {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EOSQuarterlyPlanning;
