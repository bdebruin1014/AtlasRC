import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, CheckCircle, Clock, Users, AlertTriangle, Target, MessageSquare, Plus, X, ChevronRight, Volume2, Bell, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EOSL10Meeting = ({ program }) => {
  const [meetingActive, setMeetingActive] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionTimer, setSectionTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);

  const meetingAgenda = [
    { id: 0, name: 'Segue', duration: 5, description: 'Share personal and professional good news' },
    { id: 1, name: 'Scorecard', duration: 5, description: 'Review weekly metrics - are we on track?' },
    { id: 2, name: 'Rock Review', duration: 5, description: 'Quick status on quarterly rocks - on/off track?' },
    { id: 3, name: 'Customer/Employee Headlines', duration: 5, description: 'Quick updates on customer and employee news' },
    { id: 4, name: 'To-Do List', duration: 5, description: 'Review last week\'s to-dos - done or not done?' },
    { id: 5, name: 'IDS (Issues)', duration: 60, description: 'Identify, Discuss, Solve the most important issues' },
    { id: 6, name: 'Conclude', duration: 5, description: 'Recap to-dos, rate meeting, share feedback' },
  ];

  const [attendees, setAttendees] = useState([
    { id: 1, name: 'Bryan VanRock', present: true, rating: null },
    { id: 2, name: 'Sarah Mitchell', present: true, rating: null },
    { id: 3, name: 'Mike Johnson', present: true, rating: null },
    { id: 4, name: 'Lisa Chen', present: true, rating: null },
    { id: 5, name: 'Tom Wilson', present: false, rating: null },
    { id: 6, name: 'Dave Brown', present: true, rating: null },
  ]);

  const [scorecardItems, setScorecardItems] = useState([
    { id: 1, metric: 'Revenue', target: 125000, actual: 132000, owner: 'Bryan V.', hit: true },
    { id: 2, metric: 'Gross Margin %', target: 25, actual: 27.5, owner: 'Lisa C.', hit: true },
    { id: 3, metric: 'Active Projects', target: 5, actual: 4, owner: 'Mike J.', hit: false },
    { id: 4, metric: 'Leads Generated', target: 20, actual: 18, owner: 'Sarah M.', hit: false },
    { id: 5, metric: 'Customer Satisfaction', target: 90, actual: 92, owner: 'Sarah M.', hit: true },
  ]);

  const [rocks, setRocks] = useState([
    { id: 1, title: 'Launch property management software', owner: 'Bryan V.', onTrack: true },
    { id: 2, title: 'Hire 2 project managers', owner: 'Sarah M.', onTrack: true },
    { id: 3, title: 'Complete ISO certification', owner: 'Mike J.', onTrack: true },
    { id: 4, title: 'Implement new CRM system', owner: 'Lisa C.', onTrack: false },
    { id: 5, title: 'Establish vendor qualification process', owner: 'Tom W.', onTrack: false },
  ]);

  const [todos, setTodos] = useState([
    { id: 1, task: 'Follow up with AppFolio on implementation timeline', owner: 'Bryan V.', done: true },
    { id: 2, task: 'Schedule second round interviews for PM candidates', owner: 'Sarah M.', done: true },
    { id: 3, task: 'Submit ISO documentation to auditor', owner: 'Mike J.', done: true },
    { id: 4, task: 'Complete data migration plan for CRM', owner: 'Lisa C.', done: false },
    { id: 5, task: 'Draft vendor qualification criteria', owner: 'Tom W.', done: false },
  ]);

  const [issues, setIssues] = useState([
    { id: 1, issue: 'CRM data migration taking longer than expected', priority: 1, owner: null },
    { id: 2, issue: 'Cash flow timing with large project payments', priority: 2, owner: null },
    { id: 3, issue: 'Need better subcontractor vetting process', priority: 3, owner: null },
    { id: 4, issue: 'Marketing lead quality declining', priority: 4, owner: null },
    { id: 5, issue: 'Office space constraints', priority: 5, owner: null },
  ]);

  const [newTodos, setNewTodos] = useState([]);
  const [headlines, setHeadlines] = useState([]);
  const [segueItems, setSegueItems] = useState([]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (meetingActive && !isPaused) {
      interval = setInterval(() => {
        setSectionTimer(prev => prev + 1);
        setTotalTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [meetingActive, isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startMeeting = () => {
    setMeetingActive(true);
    setCurrentSection(0);
    setSectionTimer(0);
    setTotalTimer(0);
  };

  const nextSection = () => {
    if (currentSection < meetingAgenda.length - 1) {
      setCurrentSection(prev => prev + 1);
      setSectionTimer(0);
    }
  };

  const endMeeting = () => {
    setMeetingActive(false);
    // Would save meeting data here
  };

  const getSectionTimeColor = () => {
    const targetTime = meetingAgenda[currentSection].duration * 60;
    if (sectionTimer > targetTime) return 'text-red-600';
    if (sectionTimer > targetTime * 0.8) return 'text-amber-600';
    return 'text-green-600';
  };

  const presentCount = attendees.filter(a => a.present).length;
  const scorecardHitRate = Math.round((scorecardItems.filter(s => s.hit).length / scorecardItems.length) * 100);
  const rocksOnTrack = rocks.filter(r => r.onTrack).length;
  const todosComplete = todos.filter(t => t.done).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Level 10 Meeting™</h1>
          <p className="text-sm text-gray-500">
            {meetingActive ? 'Meeting in progress' : 'Start your weekly L10 meeting'}
          </p>
        </div>
        {!meetingActive ? (
          <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={startMeeting}>
            <Play className="w-4 h-4 mr-2" />Start Meeting
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Time</p>
              <p className="text-xl font-mono font-bold">{formatTime(totalTimer)}</p>
            </div>
            <Button variant="outline" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button variant="destructive" onClick={endMeeting}>End Meeting</Button>
          </div>
        )}
      </div>

      {!meetingActive ? (
        /* Pre-Meeting View */
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xl font-bold">{presentCount}/{attendees.length}</p>
                  <p className="text-xs text-gray-500">Attendees</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xl font-bold">{scorecardHitRate}%</p>
                  <p className="text-xs text-gray-500">Scorecard Hit Rate</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xl font-bold">{rocksOnTrack}/{rocks.length}</p>
                  <p className="text-xs text-gray-500">Rocks On Track</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xl font-bold">{issues.length}</p>
                  <p className="text-xs text-gray-500">Issues to Solve</p>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Agenda Preview */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold">L10 Meeting Agenda</h3>
              <p className="text-sm text-gray-500">90 minutes to solve issues and create accountability</p>
            </div>
            <div className="divide-y">
              {meetingAgenda.map((section, idx) => (
                <div key={section.id} className="p-4 flex items-center gap-4">
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{section.name}</p>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                  <span className="text-sm text-gray-400">{section.duration} min</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attendees */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Attendees</h3>
            <div className="flex flex-wrap gap-3">
              {attendees.map((attendee) => (
                <div 
                  key={attendee.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border",
                    attendee.present ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    attendee.present ? "bg-green-500" : "bg-gray-300"
                  )}></div>
                  <span className={cn(!attendee.present && "text-gray-400")}>{attendee.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active Meeting View */
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex gap-2 mb-4">
              {meetingAgenda.map((section, idx) => (
                <div 
                  key={section.id}
                  className={cn(
                    "flex-1 h-2 rounded-full",
                    idx < currentSection ? "bg-green-500" :
                    idx === currentSection ? "bg-[#047857]" : "bg-gray-200"
                  )}
                ></div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{meetingAgenda[currentSection].name}</h2>
                <p className="text-sm text-gray-500">{meetingAgenda[currentSection].description}</p>
              </div>
              <div className="text-right">
                <p className={cn("text-3xl font-mono font-bold", getSectionTimeColor())}>
                  {formatTime(sectionTimer)}
                </p>
                <p className="text-xs text-gray-500">Target: {meetingAgenda[currentSection].duration} min</p>
              </div>
            </div>
          </div>

          {/* Section Content */}
          <div className="bg-white border rounded-lg">
            {/* Segue */}
            {currentSection === 0 && (
              <div className="p-6">
                <h3 className="font-semibold mb-4">Share Good News</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Go around the room. Each person shares one personal and one professional good news.
                </p>
                <div className="space-y-2">
                  {attendees.filter(a => a.present).map((attendee) => (
                    <div key={attendee.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-gray-300 cursor-pointer hover:text-green-500" />
                      <span>{attendee.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scorecard */}
            {currentSection === 1 && (
              <div className="p-6">
                <h3 className="font-semibold mb-4">Weekly Scorecard</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Metric</th>
                      <th className="text-left p-3">Owner</th>
                      <th className="text-right p-3">Target</th>
                      <th className="text-right p-3">Actual</th>
                      <th className="text-center p-3">Hit?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {scorecardItems.map((item) => (
                      <tr key={item.id} className={cn(!item.hit && "bg-red-50")}>
                        <td className="p-3 font-medium">{item.metric}</td>
                        <td className="p-3 text-gray-500">{item.owner}</td>
                        <td className="p-3 text-right">{item.target}</td>
                        <td className="p-3 text-right font-medium">{item.actual}</td>
                        <td className="p-3 text-center">
                          {item.hit ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 text-center text-sm">
                  <span className={cn("font-bold", scorecardHitRate >= 80 ? "text-green-600" : "text-red-600")}>
                    {scorecardHitRate}%
                  </span> hit rate this week
                </p>
              </div>
            )}

            {/* Rocks */}
            {currentSection === 2 && (
              <div className="p-6">
                <h3 className="font-semibold mb-4">Rock Review - On Track or Off Track?</h3>
                <div className="space-y-2">
                  {rocks.map((rock) => (
                    <div key={rock.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{rock.title}</p>
                        <p className="text-sm text-gray-500">{rock.owner}</p>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded text-sm font-medium",
                        rock.onTrack ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {rock.onTrack ? 'On Track' : 'Off Track'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Headlines */}
            {currentSection === 3 && (
              <div className="p-6">
                <h3 className="font-semibold mb-4">Customer/Employee Headlines</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Quick updates only. Any issues go to the Issues List.
                </p>
                <div className="space-y-2">
                  <Input placeholder="Add a headline..." />
                </div>
              </div>
            )}

            {/* To-Dos */}
            {currentSection === 4 && (
              <div className="p-6">
                <h3 className="font-semibold mb-4">To-Do Review - Done or Not Done?</h3>
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" checked={todo.done} className="w-5 h-5" onChange={() => {}} />
                      <div className="flex-1">
                        <p className={cn(todo.done && "line-through text-gray-400")}>{todo.task}</p>
                        <p className="text-xs text-gray-500">{todo.owner}</p>
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        todo.done ? "text-green-600" : "text-red-600"
                      )}>
                        {todo.done ? 'Done' : 'Not Done'}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-sm">
                  <span className={cn("font-bold", (todosComplete / todos.length) >= 0.9 ? "text-green-600" : "text-red-600")}>
                    {todosComplete}/{todos.length}
                  </span> completed ({Math.round((todosComplete / todos.length) * 100)}%)
                </p>
              </div>
            )}

            {/* IDS */}
            {currentSection === 5 && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">IDS - Identify, Discuss, Solve</h3>
                    <p className="text-sm text-gray-500">Prioritize and solve the most important issues</p>
                  </div>
                  <Button size="sm" onClick={() => setShowIssueModal(true)}>
                    <Plus className="w-4 h-4 mr-1" />Add Issue
                  </Button>
                </div>
                <div className="space-y-2">
                  {issues.sort((a, b) => a.priority - b.priority).map((issue, idx) => (
                    <div key={issue.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 bg-[#047857] text-white rounded-full flex items-center justify-center text-sm">
                        {idx + 1}
                      </span>
                      <p className="flex-1">{issue.issue}</p>
                      <Button variant="outline" size="sm">Solve</Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">IDS Process:</p>
                  <ol className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>1. <strong>Identify</strong> - What is the real issue? (Not the symptom)</li>
                    <li>2. <strong>Discuss</strong> - Open discussion, everyone contributes</li>
                    <li>3. <strong>Solve</strong> - Decide on a solution, assign a to-do, set due date</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Conclude */}
            {currentSection === 6 && (
              <div className="p-6">
                <h3 className="font-semibold mb-4">Conclude</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">New To-Dos Created</p>
                    <div className="space-y-2">
                      {newTodos.length === 0 ? (
                        <p className="text-sm text-gray-400">No new to-dos this meeting</p>
                      ) : (
                        newTodos.map((todo, idx) => (
                          <div key={idx} className="p-2 bg-gray-50 rounded text-sm">{todo}</div>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Rate this meeting (1-10)</p>
                    <div className="flex gap-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button 
                          key={num}
                          className="w-10 h-10 rounded-lg border hover:bg-[#047857] hover:text-white transition-colors"
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentSection > 0) {
                  setCurrentSection(prev => prev - 1);
                  setSectionTimer(0);
                }
              }}
              disabled={currentSection === 0}
            >
              Previous
            </Button>
            {currentSection < meetingAgenda.length - 1 ? (
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={nextSection}>
                Next Section <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700" onClick={endMeeting}>
                Complete Meeting
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EOSL10Meeting;
