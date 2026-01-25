// src/pages/CalendarPage.jsx
// Enhanced Calendar with full CRUD, multiple views, and integrations

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Search, Filter, Calendar as CalendarIcon,
  Clock, MapPin, Users, Tag, Bell, Repeat, X, Edit2, Trash2, CheckSquare,
  Target, AlertTriangle, FileText, Building2, DollarSign, Video, Phone,
  MoreVertical, ExternalLink, Link2, Download, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * ENHANCED CALENDAR PAGE
 *
 * Features:
 * 1. Month, Week, Day views
 * 2. Full CRUD for events
 * 3. Event categories (meetings, deadlines, closings, tasks, milestones)
 * 4. Integration with projects, opportunities, tasks
 * 5. Recurring events
 * 6. Event reminders
 * 7. Multi-user visibility
 * 8. Color coding by type
 */

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Event categories with colors
  const eventCategories = {
    meeting: { label: 'Meeting', color: 'bg-blue-500', bgLight: 'bg-blue-100', textColor: 'text-blue-700', icon: Users },
    deadline: { label: 'Deadline', color: 'bg-red-500', bgLight: 'bg-red-100', textColor: 'text-red-700', icon: AlertTriangle },
    closing: { label: 'Closing', color: 'bg-green-500', bgLight: 'bg-green-100', textColor: 'text-green-700', icon: DollarSign },
    task: { label: 'Task', color: 'bg-purple-500', bgLight: 'bg-purple-100', textColor: 'text-purple-700', icon: CheckSquare },
    milestone: { label: 'Milestone', color: 'bg-amber-500', bgLight: 'bg-amber-100', textColor: 'text-amber-700', icon: Target },
    inspection: { label: 'Inspection', color: 'bg-orange-500', bgLight: 'bg-orange-100', textColor: 'text-orange-700', icon: FileText },
    call: { label: 'Call', color: 'bg-cyan-500', bgLight: 'bg-cyan-100', textColor: 'text-cyan-700', icon: Phone },
    site_visit: { label: 'Site Visit', color: 'bg-emerald-500', bgLight: 'bg-emerald-100', textColor: 'text-emerald-700', icon: MapPin },
  };

  // Mock events data with full details
  const [events, setEvents] = useState([
    {
      id: 'e1',
      title: 'Site Walk - Highland Park',
      category: 'site_visit',
      date: '2025-01-27',
      startTime: '09:00',
      endTime: '11:00',
      allDay: false,
      location: '123 Highland Park Dr, Charlotte, NC',
      description: 'Initial site assessment with contractor team',
      attendees: [
        { id: 'u1', name: 'John Smith', avatar: 'JS' },
        { id: 'u2', name: 'Mike Williams', avatar: 'MW' },
      ],
      project: { id: 'p1', name: 'Highland Park Development' },
      reminder: '1_hour',
      recurring: null,
      status: 'confirmed',
      createdBy: 'John Smith',
    },
    {
      id: 'e2',
      title: 'Investor Call - Q1 Update',
      category: 'call',
      date: '2025-01-28',
      startTime: '14:00',
      endTime: '15:00',
      allDay: false,
      location: 'Zoom Meeting',
      description: 'Quarterly update call with investor group',
      attendees: [
        { id: 'u1', name: 'John Smith', avatar: 'JS' },
        { id: 'u3', name: 'Robert Van', avatar: 'RV' },
      ],
      project: null,
      reminder: '15_min',
      recurring: null,
      status: 'confirmed',
      createdBy: 'John Smith',
    },
    {
      id: 'e3',
      title: 'Permit Submission Deadline',
      category: 'deadline',
      date: '2025-01-30',
      startTime: null,
      endTime: null,
      allDay: true,
      location: null,
      description: 'Final deadline for Pine Street permit application',
      attendees: [],
      project: { id: 'p2', name: 'Pine Street Townhomes' },
      reminder: '1_day',
      recurring: null,
      status: 'pending',
      createdBy: 'Sarah Johnson',
    },
    {
      id: 'e4',
      title: 'Closing - 456 Oak Avenue',
      category: 'closing',
      date: '2025-01-31',
      startTime: '10:00',
      endTime: '12:00',
      allDay: false,
      location: 'First National Title, 500 Main St',
      description: 'Closing for Oak Avenue acquisition',
      attendees: [
        { id: 'u1', name: 'John Smith', avatar: 'JS' },
        { id: 'u2', name: 'Sarah Johnson', avatar: 'SJ' },
      ],
      project: { id: 'p3', name: 'Oak Avenue Project' },
      reminder: '1_day',
      recurring: null,
      status: 'confirmed',
      createdBy: 'Sarah Johnson',
    },
    {
      id: 'e5',
      title: 'Scattered Lot Team Weekly',
      category: 'meeting',
      date: '2025-01-27',
      startTime: '09:00',
      endTime: '10:00',
      allDay: false,
      location: 'Conference Room A',
      description: 'Weekly team sync meeting',
      attendees: [
        { id: 'u1', name: 'John Smith', avatar: 'JS' },
        { id: 'u2', name: 'Sarah Johnson', avatar: 'SJ' },
        { id: 'u3', name: 'Mike Williams', avatar: 'MW' },
        { id: 'u4', name: 'Lisa Chen', avatar: 'LC' },
      ],
      project: null,
      reminder: '15_min',
      recurring: { frequency: 'weekly', day: 1 },
      status: 'confirmed',
      createdBy: 'John Smith',
    },
    {
      id: 'e6',
      title: 'Foundation Inspection',
      category: 'inspection',
      date: '2025-01-29',
      startTime: '08:00',
      endTime: '10:00',
      allDay: false,
      location: '789 Cedar Lane, Greenville',
      description: 'County foundation inspection for Cedar Lane project',
      attendees: [
        { id: 'u3', name: 'Mike Williams', avatar: 'MW' },
      ],
      project: { id: 'p4', name: 'Cedar Lane Development' },
      reminder: '1_day',
      recurring: null,
      status: 'confirmed',
      createdBy: 'Mike Williams',
    },
    {
      id: 'e7',
      title: 'Q1 Rock Review - Milestone',
      category: 'milestone',
      date: '2025-01-31',
      startTime: null,
      endTime: null,
      allDay: true,
      location: null,
      description: 'End of month review for Q1 quarterly rocks',
      attendees: [],
      project: null,
      reminder: '1_week',
      recurring: { frequency: 'monthly', dayOfMonth: -1 },
      status: 'pending',
      createdBy: 'Emily Davis',
    },
    {
      id: 'e8',
      title: 'Complete permit application',
      category: 'task',
      date: '2025-01-28',
      startTime: null,
      endTime: null,
      allDay: true,
      location: null,
      description: 'Finalize and submit permit application for Pine Street',
      attendees: [
        { id: 'u4', name: 'Lisa Chen', avatar: 'LC' },
      ],
      project: { id: 'p2', name: 'Pine Street Townhomes' },
      reminder: '1_day',
      recurring: null,
      status: 'in_progress',
      createdBy: 'John Smith',
    },
  ]);

  // Calendar calculations
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    }

    // Next month days to complete grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
    }

    return days;
  };

  const getWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => {
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;
      if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return e.date === dateStr;
    });
  };

  const today = new Date();
  const isToday = (date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Upcoming events for sidebar
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return events
      .filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= now && eventDate <= twoWeeksFromNow;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 8);
  }, [events]);

  // Event counts by category
  const eventCounts = useMemo(() => {
    const counts = { all: events.length };
    Object.keys(eventCategories).forEach(cat => {
      counts[cat] = events.filter(e => e.category === cat).length;
    });
    return counts;
  }, [events]);

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowNewEventModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const getHeaderTitle = () => {
    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${monthNames[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      } else {
        return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
      }
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-[#1e2a3a] flex-shrink-0 flex flex-col">
        <div className="p-4">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setSelectedDate(new Date());
              setShowNewEventModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>

        {/* Mini Calendar */}
        <div className="px-4 pb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white">
                {monthNames[currentDate.getMonth()].slice(0, 3)} {currentDate.getFullYear()}
              </span>
              <div className="flex gap-1">
                <button onClick={prevPeriod} className="p-0.5 hover:bg-white/10 rounded">
                  <ChevronLeft className="w-3 h-3 text-gray-400" />
                </button>
                <button onClick={nextPeriod} className="p-0.5 hover:bg-white/10 rounded">
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {daysOfWeekShort.map(d => (
                <div key={d} className="text-[10px] text-gray-500 py-1">{d.charAt(0)}</div>
              ))}
              {getDaysInMonth(currentDate).slice(0, 35).map((d, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentDate(d.date);
                    setViewMode('day');
                  }}
                  className={cn(
                    'text-[10px] py-1 rounded',
                    d.currentMonth ? 'text-white' : 'text-gray-600',
                    isToday(d.date) && 'bg-emerald-600 text-white',
                    getEventsForDate(d.date).length > 0 && !isToday(d.date) && 'font-bold'
                  )}
                >
                  {d.day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-4 pb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Categories</h3>
          <div className="space-y-1">
            <button
              onClick={() => setFilterCategory('all')}
              className={cn(
                'w-full text-left px-3 py-2 text-xs rounded flex items-center justify-between',
                filterCategory === 'all' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span>All Events</span>
              <span className="text-gray-500">{eventCounts.all}</span>
            </button>
            {Object.entries(eventCategories).map(([key, cat]) => {
              const Icon = cat.icon;
              return (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs rounded flex items-center justify-between',
                    filterCategory === key ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', cat.color)} />
                    {cat.label}
                  </span>
                  <span className="text-gray-500">{eventCounts[key] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="flex-1 px-4 pb-4 overflow-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Upcoming</h3>
          <div className="space-y-2">
            {upcomingEvents.map((event) => {
              const cat = eventCategories[event.category];
              return (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  className="p-2 bg-white/5 rounded cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className={cn('w-2 h-2 rounded-full mt-1 flex-shrink-0', cat.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{event.title}</p>
                      <p className="text-gray-500 text-[10px]">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {event.startTime && ` at ${formatTime(event.startTime)}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {upcomingEvents.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">{getHeaderTitle()}</h1>
              <div className="flex items-center gap-1">
                <button onClick={prevPeriod} className="p-1.5 hover:bg-gray-100 rounded">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded"
                >
                  Today
                </button>
                <button onClick={nextPeriod} className="p-1.5 hover:bg-gray-100 rounded">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <div className="flex border rounded-lg overflow-hidden">
                {['month', 'week', 'day'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'px-4 py-1.5 text-sm font-medium capitalize',
                      viewMode === mode ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Month View */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-lg border h-full flex flex-col">
              <div className="grid grid-cols-7 border-b">
                {daysOfWeekShort.map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="flex-1 grid grid-cols-7 grid-rows-6">
                {getDaysInMonth(currentDate).map((d, i) => {
                  const dayEvents = getEventsForDate(d.date);
                  return (
                    <div
                      key={i}
                      onClick={() => handleDayClick(d.date)}
                      className={cn(
                        'border-r border-b p-1 min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors',
                        !d.currentMonth && 'bg-gray-50',
                        i % 7 === 6 && 'border-r-0'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1',
                        isToday(d.date) && 'bg-emerald-600 text-white',
                        !d.currentMonth && 'text-gray-400'
                      )}>
                        {d.day}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((event) => {
                          const cat = eventCategories[event.category];
                          return (
                            <div
                              key={event.id}
                              onClick={(e) => handleEventClick(event, e)}
                              className={cn(
                                'px-1.5 py-0.5 text-xs rounded truncate cursor-pointer',
                                cat.bgLight, cat.textColor
                              )}
                            >
                              {event.startTime && (
                                <span className="font-medium">{formatTime(event.startTime).replace(' ', '')} </span>
                              )}
                              {event.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 pl-1.5">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week View */}
          {viewMode === 'week' && (
            <div className="bg-white rounded-lg border h-full flex flex-col">
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-center text-sm font-medium text-gray-400 border-r w-16" />
                {getWeekDays(currentDate).map((date, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-3 text-center border-r last:border-r-0',
                      isToday(date) && 'bg-emerald-50'
                    )}
                  >
                    <div className="text-sm font-medium text-gray-600">{daysOfWeekShort[i]}</div>
                    <div className={cn(
                      'w-8 h-8 mx-auto flex items-center justify-center rounded-full text-lg',
                      isToday(date) ? 'bg-emerald-600 text-white' : 'text-gray-900'
                    )}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex-1 overflow-auto">
                {Array.from({ length: 12 }, (_, i) => i + 7).map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
                    <div className="p-2 text-xs text-gray-500 text-right pr-3 border-r w-16">
                      {hour % 12 || 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                    </div>
                    {getWeekDays(currentDate).map((date, i) => {
                      const dayEvents = getEventsForDate(date).filter(e => {
                        if (!e.startTime) return false;
                        const eventHour = parseInt(e.startTime.split(':')[0]);
                        return eventHour === hour;
                      });
                      return (
                        <div
                          key={i}
                          className={cn(
                            'border-r last:border-r-0 p-1',
                            isToday(date) && 'bg-emerald-50/50'
                          )}
                          onClick={() => handleDayClick(date)}
                        >
                          {dayEvents.map((event) => {
                            const cat = eventCategories[event.category];
                            return (
                              <div
                                key={event.id}
                                onClick={(e) => handleEventClick(event, e)}
                                className={cn(
                                  'px-2 py-1 text-xs rounded mb-1 cursor-pointer',
                                  cat.bgLight, cat.textColor
                                )}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="text-[10px] opacity-75">
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day View */}
          {viewMode === 'day' && (
            <div className="bg-white rounded-lg border h-full flex flex-col">
              <div className="p-4 border-b">
                <div className={cn(
                  'text-center',
                  isToday(currentDate) && 'text-emerald-600'
                )}>
                  <div className="text-sm font-medium text-gray-500">
                    {daysOfWeek[currentDate.getDay()]}
                  </div>
                  <div className="text-4xl font-bold">{currentDate.getDate()}</div>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {/* All-day events */}
                {getEventsForDate(currentDate).filter(e => e.allDay).length > 0 && (
                  <div className="p-3 border-b bg-gray-50">
                    <div className="text-xs text-gray-500 mb-2">All Day</div>
                    <div className="space-y-1">
                      {getEventsForDate(currentDate).filter(e => e.allDay).map((event) => {
                        const cat = eventCategories[event.category];
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => handleEventClick(event, e)}
                            className={cn(
                              'px-3 py-2 rounded cursor-pointer',
                              cat.bgLight, cat.textColor
                            )}
                          >
                            <div className="font-medium">{event.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Timed events */}
                {Array.from({ length: 14 }, (_, i) => i + 6).map((hour) => {
                  const hourEvents = getEventsForDate(currentDate).filter(e => {
                    if (!e.startTime || e.allDay) return false;
                    const eventHour = parseInt(e.startTime.split(':')[0]);
                    return eventHour === hour;
                  });
                  return (
                    <div key={hour} className="flex border-b min-h-[60px]">
                      <div className="w-20 p-2 text-sm text-gray-500 text-right pr-4 border-r flex-shrink-0">
                        {hour % 12 || 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                      </div>
                      <div className="flex-1 p-1">
                        {hourEvents.map((event) => {
                          const cat = eventCategories[event.category];
                          return (
                            <div
                              key={event.id}
                              onClick={(e) => handleEventClick(event, e)}
                              className={cn(
                                'px-3 py-2 rounded cursor-pointer mb-1',
                                cat.bgLight, cat.textColor
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{event.title}</div>
                                <div className="text-xs opacity-75">
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </div>
                              </div>
                              {event.location && (
                                <div className="text-xs opacity-75 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          categories={eventCategories}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onDelete={handleDeleteEvent}
          formatTime={formatTime}
        />
      )}

      {/* New Event Modal */}
      {showNewEventModal && (
        <NewEventModal
          initialDate={selectedDate}
          categories={eventCategories}
          onClose={() => {
            setShowNewEventModal(false);
            setSelectedDate(null);
          }}
          onSave={(newEvent) => {
            setEvents([...events, { ...newEvent, id: `e${Date.now()}` }]);
            setShowNewEventModal(false);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
};

// Event Detail Modal Component
const EventDetailModal = ({ event, categories, onClose, onDelete, formatTime }) => {
  const cat = categories[event.category];
  const Icon = cat.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        <div className={cn('p-4 rounded-t-lg', cat.bgLight)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', cat.color)}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{event.title}</h2>
                <span className={cn('text-sm', cat.textColor)}>{cat.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-white/50 rounded">
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => onDelete(event.id)}
                className="p-1.5 hover:bg-white/50 rounded"
              >
                <Trash2 className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              {event.allDay ? (
                <div className="text-sm text-gray-500">All day</div>
              ) : (
                <div className="text-sm text-gray-500">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
              )}
              {event.recurring && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Repeat className="w-3 h-3" />
                  Repeats {event.recurring.frequency}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">{event.location}</div>
                <button className="text-sm text-emerald-600 hover:underline">View on map</button>
              </div>
            </div>
          )}

          {/* Project */}
          {event.project && (
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Project</div>
                <div className="font-medium text-gray-900">{event.project.name}</div>
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.attendees.length > 0 && (
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 mb-2">Attendees ({event.attendees.length})</div>
                <div className="flex flex-wrap gap-2">
                  {event.attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                        {attendee.avatar}
                      </div>
                      <span className="text-sm text-gray-700">{attendee.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 mb-1">Description</div>
                <p className="text-gray-700">{event.description}</p>
              </div>
            </div>
          )}

          {/* Reminder */}
          {event.reminder && (
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Reminder</div>
                <div className="text-gray-700">
                  {event.reminder.replace('_', ' ')} before
                </div>
              </div>
            </div>
          )}

          {/* Created by */}
          <div className="pt-4 border-t text-sm text-gray-500">
            Created by {event.createdBy}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Event
          </Button>
        </div>
      </div>
    </div>
  );
};

// New Event Modal Component
const NewEventModal = ({ initialDate, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'meeting',
    date: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    allDay: false,
    location: '',
    description: '',
    reminder: '15_min',
  });

  const handleSubmit = () => {
    if (!formData.title) return;
    onSave({
      ...formData,
      attendees: [],
      project: null,
      recurring: null,
      status: 'confirmed',
      createdBy: 'Current User',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Event</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              {Object.entries(categories).map(([key, cat]) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="allDay" className="text-sm text-gray-700">All day event</label>
          </div>

          {/* Time */}
          {!formData.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Add location..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add description..."
              className="w-full border rounded-md px-3 py-2 h-24"
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder</label>
            <select
              value={formData.reminder}
              onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="none">No reminder</option>
              <option value="15_min">15 minutes before</option>
              <option value="30_min">30 minutes before</option>
              <option value="1_hour">1 hour before</option>
              <option value="1_day">1 day before</option>
              <option value="1_week">1 week before</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSubmit}
            disabled={!formData.title}
          >
            Create Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
