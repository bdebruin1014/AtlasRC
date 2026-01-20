import React, { useState } from 'react';
import { Calendar, Target, Eye, Mountain, CheckCircle, Star, TrendingUp, Users, FileText, Download, ChevronRight, Award, Compass, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EOSAnnualPlanning = ({ program }) => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'vto', 'goals', 'agenda'

  const annualSessions = [
    { year: '2025', status: 'upcoming', date: '2025-01-08', location: 'Offsite - Lake Keowee', duration: '2 days' },
    { year: '2024', status: 'complete', date: '2024-01-10', location: 'Offsite - Lake Keowee', duration: '2 days' },
  ];

  const currentSession = annualSessions.find(s => s.year === selectedYear);

  const annualAgendaDay1 = [
    { time: '8:00 AM', item: 'Check-in / Team Health', duration: '30 min' },
    { time: '8:30 AM', item: 'Review Core Values', duration: '30 min' },
    { time: '9:00 AM', item: 'Review/Revise Core Focus', duration: '45 min' },
    { time: '9:45 AM', item: 'Break', duration: '15 min' },
    { time: '10:00 AM', item: 'Review 10-Year Target', duration: '30 min' },
    { time: '10:30 AM', item: 'Review Marketing Strategy', duration: '60 min' },
    { time: '11:30 AM', item: 'Review 3-Year Picture', duration: '60 min' },
    { time: '12:30 PM', item: 'Lunch', duration: '60 min' },
    { time: '1:30 PM', item: 'Review Prior Year', duration: '90 min' },
    { time: '3:00 PM', item: 'Break', duration: '15 min' },
    { time: '3:15 PM', item: 'Team Health Exercises', duration: '90 min' },
    { time: '4:45 PM', item: 'Day 1 Wrap-up', duration: '15 min' },
    { time: '6:00 PM', item: 'Team Dinner', duration: '' },
  ];

  const annualAgendaDay2 = [
    { time: '8:00 AM', item: 'Day 2 Kickoff', duration: '15 min' },
    { time: '8:15 AM', item: 'Establish 1-Year Plan', duration: '90 min' },
    { time: '9:45 AM', item: 'Break', duration: '15 min' },
    { time: '10:00 AM', item: 'Set Q1 Rocks', duration: '90 min' },
    { time: '11:30 AM', item: 'Tackle Key Issues', duration: '60 min' },
    { time: '12:30 PM', item: 'Lunch', duration: '45 min' },
    { time: '1:15 PM', item: 'Continue IDS', duration: '60 min' },
    { time: '2:15 PM', item: 'Org Issues / People', duration: '60 min' },
    { time: '3:15 PM', item: 'Break', duration: '15 min' },
    { time: '3:30 PM', item: 'Next Steps & To-Dos', duration: '30 min' },
    { time: '4:00 PM', item: 'Conclude & Rate Session', duration: '30 min' },
  ];

  const yearlyGoals = [
    { goal: 'Reach $12M in revenue', status: 'on-track', progress: 85 },
    { goal: 'Complete 48 units', status: 'on-track', progress: 90 },
    { goal: 'Achieve 25%+ gross margin', status: 'complete', progress: 100 },
    { goal: 'Launch property management division', status: 'on-track', progress: 75 },
    { goal: 'Implement EOS across all entities', status: 'complete', progress: 100 },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Annual Planning</h1>
          <p className="text-sm text-gray-500">Set vision and annual goals for the year ahead</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="border rounded-md px-3 py-2"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {annualSessions.map(s => (
              <option key={s.year} value={s.year}>{s.year} Annual</option>
            ))}
          </select>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Calendar className="w-4 h-4 mr-2" />Schedule Session
          </Button>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-gradient-to-r from-[#047857] to-[#065f46] rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{selectedYear} Annual Planning</h2>
            <p className="text-green-100">{currentSession?.date} • {currentSession?.location}</p>
            <p className="text-green-200 text-sm">{currentSession?.duration}</p>
          </div>
          <div className="text-right">
            <span className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              currentSession?.status === 'upcoming' ? "bg-white text-[#047857]" : "bg-green-700 text-white"
            )}>
              {currentSession?.status === 'upcoming' ? 'Coming Up' : 'Completed'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('overview')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'overview' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Overview
        </button>
        <button onClick={() => setActiveTab('vto')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'vto' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          V/TO Review
        </button>
        <button onClick={() => setActiveTab('goals')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'goals' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Yearly Goals
        </button>
        <button onClick={() => setActiveTab('agenda')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'agenda' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          2-Day Agenda
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">What is Annual Planning?</h3>
              <p className="text-gray-600 mb-6">
                The Annual Planning session is a 2-day offsite where the leadership team steps back from 
                day-to-day operations to review the company&apos;s vision, set annual goals, and align on the 
                strategy for the coming year. It&apos;s the most important meeting of the year.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <Heart className="w-6 h-6 text-purple-500 mb-2" />
                  <h4 className="font-medium mb-1">Day 1: Vision</h4>
                  <p className="text-sm text-gray-500">Review Core Values, Core Focus, 10-Year Target, Marketing Strategy, 3-Year Picture</p>
                </div>
                <div className="border rounded-lg p-4">
                  <Target className="w-6 h-6 text-green-500 mb-2" />
                  <h4 className="font-medium mb-1">Day 2: Traction</h4>
                  <p className="text-sm text-gray-500">Set 1-Year Plan, Q1 Rocks, solve strategic issues, align on people</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">{selectedYear} Goal Progress</h3>
              <div className="space-y-4">
                {yearlyGoals.map((goal, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{goal.goal}</span>
                      <span className={cn(
                        "text-sm font-medium",
                        goal.status === 'complete' ? "text-green-600" : "text-blue-600"
                      )}>
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          goal.status === 'complete' ? "bg-green-500" : "bg-blue-500"
                        )}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Preparation Checklist</h3>
              <div className="space-y-3">
                {[
                  { item: 'Book offsite location', done: true },
                  { item: 'Send invitations to team', done: true },
                  { item: 'Prepare V/TO for review', done: false },
                  { item: 'Compile prior year results', done: false },
                  { item: 'Gather team input on issues', done: false },
                  { item: 'Book accommodations', done: false },
                  { item: 'Plan team dinner', done: false },
                ].map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="checkbox" checked={task.done} className="w-4 h-4 rounded" onChange={() => {}} />
                    <span className={cn(task.done && "line-through text-gray-400")}>{task.item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <Award className="w-8 h-8 text-blue-500 mb-3" />
              <h4 className="font-medium text-blue-800 mb-1">Annual Pro Tip</h4>
              <p className="text-sm text-blue-700">
                Hold your Annual off-site away from the office to minimize distractions 
                and encourage strategic thinking.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* V/TO Review Tab */}
      {activeTab === 'vto' && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-6">Vision/Traction Organizer Review Items</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-purple-700 flex items-center gap-2">
                <Eye className="w-4 h-4" />Vision (Day 1)
              </h4>
              {[
                { item: 'Core Values', time: '30 min', questions: 'Are these still our values? Any to add/remove?' },
                { item: 'Core Focus', time: '45 min', questions: 'Still our purpose? Still our niche?' },
                { item: '10-Year Target', time: '30 min', questions: 'Still compelling? Making progress?' },
                { item: 'Marketing Strategy', time: '60 min', questions: 'Target market? 3 Uniques? Proven Process?' },
                { item: '3-Year Picture', time: '60 min', questions: 'Revenue? Profit? What does it look like?' },
              ].map((item, idx) => (
                <div key={idx} className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{item.item}</span>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.questions}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-green-700 flex items-center gap-2">
                <Target className="w-4 h-4" />Traction (Day 2)
              </h4>
              {[
                { item: '1-Year Plan', time: '90 min', questions: 'Revenue? Profit? 3-7 goals for the year?' },
                { item: 'Q1 Rocks', time: '90 min', questions: 'What are the most important things for Q1?' },
                { item: 'Issues List', time: '120 min', questions: 'What strategic issues need solving?' },
                { item: 'People Issues', time: '60 min', questions: 'Right people? Right seats?' },
              ].map((item, idx) => (
                <div key={idx} className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{item.item}</span>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.questions}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4">{selectedYear} Annual Goals</h3>
          <div className="space-y-4">
            {yearlyGoals.map((goal, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {goal.status === 'complete' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <div className="w-6 h-6 border-2 border-blue-500 rounded-full"></div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{goal.goal}</p>
                </div>
                <div className="w-32">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", goal.status === 'complete' ? "bg-green-500" : "bg-blue-500")}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
                <span className="w-16 text-right font-medium">{goal.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agenda Tab */}
      {activeTab === 'agenda' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="p-4 bg-purple-50 border-b">
              <h3 className="font-semibold">Day 1 - Vision</h3>
              <p className="text-sm text-gray-500">Focus on the future</p>
            </div>
            <div className="divide-y">
              {annualAgendaDay1.map((item, idx) => (
                <div key={idx} className={cn("p-3 flex gap-3", item.item.includes('Break') || item.item.includes('Lunch') || item.item.includes('Dinner') ? "bg-gray-50" : "")}>
                  <span className="text-sm text-gray-500 w-20">{item.time}</span>
                  <div className="flex-1">
                    <p className="font-medium">{item.item}</p>
                    {item.duration && <p className="text-xs text-gray-500">{item.duration}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="p-4 bg-green-50 border-b">
              <h3 className="font-semibold">Day 2 - Traction</h3>
              <p className="text-sm text-gray-500">Execute on the vision</p>
            </div>
            <div className="divide-y">
              {annualAgendaDay2.map((item, idx) => (
                <div key={idx} className={cn("p-3 flex gap-3", item.item.includes('Break') || item.item.includes('Lunch') ? "bg-gray-50" : "")}>
                  <span className="text-sm text-gray-500 w-20">{item.time}</span>
                  <div className="flex-1">
                    <p className="font-medium">{item.item}</p>
                    {item.duration && <p className="text-xs text-gray-500">{item.duration}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EOSAnnualPlanning;
