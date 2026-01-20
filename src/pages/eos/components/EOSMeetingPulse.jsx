import React, { useState } from 'react';
import { Calendar, Clock, Users, Star, CheckCircle, AlertTriangle, TrendingUp, Download, Eye, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EOSMeetingPulse = ({ program }) => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'l10', 'quarterly', 'annual'

  const meetings = [
    { id: 1, type: 'L10', date: '2024-12-26', duration: '92 min', attendees: 5, rating: 8.5, todoComplete: 18, todoTotal: 22, issuesSolved: 3, scorecardHit: 80 },
    { id: 2, type: 'L10', date: '2024-12-19', duration: '88 min', attendees: 6, rating: 9.0, todoComplete: 20, todoTotal: 20, issuesSolved: 4, scorecardHit: 85 },
    { id: 3, type: 'L10', date: '2024-12-12', duration: '95 min', attendees: 5, rating: 7.5, todoComplete: 15, todoTotal: 18, issuesSolved: 2, scorecardHit: 75 },
    { id: 4, type: 'L10', date: '2024-12-05', duration: '90 min', attendees: 6, rating: 8.0, todoComplete: 17, todoTotal: 19, issuesSolved: 3, scorecardHit: 82 },
    { id: 5, type: 'L10', date: '2024-11-28', duration: '85 min', attendees: 4, rating: 7.0, todoComplete: 14, todoTotal: 20, issuesSolved: 2, scorecardHit: 70 },
    { id: 6, type: 'L10', date: '2024-11-21', duration: '91 min', attendees: 6, rating: 8.5, todoComplete: 19, todoTotal: 21, issuesSolved: 4, scorecardHit: 85 },
    { id: 7, type: 'L10', date: '2024-11-14', duration: '87 min', attendees: 5, rating: 8.0, todoComplete: 16, todoTotal: 18, issuesSolved: 3, scorecardHit: 78 },
    { id: 8, type: 'L10', date: '2024-11-07', duration: '93 min', attendees: 6, rating: 9.0, todoComplete: 21, todoTotal: 22, issuesSolved: 5, scorecardHit: 90 },
    { id: 9, type: 'Quarterly', date: '2024-10-15', duration: '6 hrs', attendees: 6, rating: 9.2, rocksSet: 5, issuesSolved: 8, notes: 'Q4 2024 Quarterly' },
    { id: 10, type: 'L10', date: '2024-10-31', duration: '89 min', attendees: 5, rating: 8.0, todoComplete: 17, todoTotal: 20, issuesSolved: 3, scorecardHit: 80 },
    { id: 11, type: 'Annual', date: '2024-01-10', duration: '2 days', attendees: 6, rating: 9.5, notes: '2024 Annual Planning' },
  ];

  const filteredMeetings = meetings.filter(m => filterType === 'all' || m.type.toLowerCase() === filterType);

  const l10Meetings = meetings.filter(m => m.type === 'L10');
  const avgRating = (l10Meetings.reduce((sum, m) => sum + m.rating, 0) / l10Meetings.length).toFixed(1);
  const avgDuration = Math.round(l10Meetings.reduce((sum, m) => sum + parseInt(m.duration), 0) / l10Meetings.length);
  const totalIssuesSolved = meetings.reduce((sum, m) => sum + (m.issuesSolved || 0), 0);
  const streakCount = 12; // consecutive weeks

  const getTypeColor = (type) => {
    switch (type) {
      case 'L10': return 'bg-blue-100 text-blue-700';
      case 'Quarterly': return 'bg-purple-100 text-purple-700';
      case 'Annual': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8.5) return 'text-green-600';
    if (rating >= 7.0) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Meeting Pulse</h1>
          <p className="text-sm text-gray-500">Track meeting consistency and effectiveness</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-600">{streakCount}</p>
              <p className="text-xs text-gray-500">Week L10 Streak</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-500" />
            <div>
              <p className={cn("text-2xl font-bold", getRatingColor(avgRating))}>{avgRating}</p>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{avgDuration} min</p>
              <p className="text-xs text-gray-500">Avg Duration</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{totalIssuesSolved}</p>
              <p className="text-xs text-gray-500">Issues Solved</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{meetings.length}</p>
              <p className="text-xs text-gray-500">Total Meetings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Visualization */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">L10 Meeting Streak</h3>
        <div className="flex gap-1">
          {[...Array(13)].map((_, idx) => {
            const hasL10 = l10Meetings[idx];
            return (
              <div 
                key={idx}
                className={cn(
                  "flex-1 h-8 rounded",
                  hasL10 ? "bg-green-500" : "bg-gray-200"
                )}
                title={hasL10 ? `Week ${13 - idx}: ${hasL10.date}` : `Week ${13 - idx}: No meeting`}
              ></div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>13 weeks ago</span>
          <span>This week</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilterType('all')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", filterType === 'all' ? "bg-gray-900 text-white" : "bg-white border hover:bg-gray-50")}>
          All ({meetings.length})
        </button>
        <button onClick={() => setFilterType('l10')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", filterType === 'l10' ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-50")}>
          L10 ({meetings.filter(m => m.type === 'L10').length})
        </button>
        <button onClick={() => setFilterType('quarterly')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", filterType === 'quarterly' ? "bg-purple-600 text-white" : "bg-white border hover:bg-gray-50")}>
          Quarterly ({meetings.filter(m => m.type === 'Quarterly').length})
        </button>
        <button onClick={() => setFilterType('annual')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", filterType === 'annual' ? "bg-green-600 text-white" : "bg-white border hover:bg-gray-50")}>
          Annual ({meetings.filter(m => m.type === 'Annual').length})
        </button>
      </div>

      {/* Meeting History */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-center px-4 py-3 font-medium">Duration</th>
              <th className="text-center px-4 py-3 font-medium">Attendees</th>
              <th className="text-center px-4 py-3 font-medium">Rating</th>
              <th className="text-center px-4 py-3 font-medium">To-Dos</th>
              <th className="text-center px-4 py-3 font-medium">Issues</th>
              <th className="text-center px-4 py-3 font-medium">Scorecard</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredMeetings.map((meeting) => (
              <tr key={meeting.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{meeting.date}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs", getTypeColor(meeting.type))}>
                    {meeting.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{meeting.duration}</td>
                <td className="px-4 py-3 text-center">{meeting.attendees}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("font-bold", getRatingColor(meeting.rating))}>
                    {meeting.rating}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {meeting.todoComplete !== undefined ? (
                    <span className={cn(
                      "font-medium",
                      (meeting.todoComplete / meeting.todoTotal) >= 0.9 ? "text-green-600" : "text-amber-600"
                    )}>
                      {meeting.todoComplete}/{meeting.todoTotal}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-center">{meeting.issuesSolved || '-'}</td>
                <td className="px-4 py-3 text-center">
                  {meeting.scorecardHit !== undefined ? (
                    <span className={cn(
                      "font-medium",
                      meeting.scorecardHit >= 80 ? "text-green-600" : "text-amber-600"
                    )}>
                      {meeting.scorecardHit}%
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EOSMeetingPulse;
