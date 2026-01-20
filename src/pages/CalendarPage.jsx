import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const events = [
    { date: 15, title: 'Site Walk - Highland Park', type: 'meeting' },
    { date: 18, title: 'Investor Call', type: 'call' },
    { date: 22, title: 'Permit Review', type: 'deadline' },
    { date: 28, title: 'Closing - Unit 4B', type: 'closing' },
  ];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const today = new Date();
  const isToday = (day) => day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      {/* Dark Sidebar */}
      <div className="w-52 bg-[#1e2a3a] flex-shrink-0 p-3">
        <Button className="w-full bg-[#047857] hover:bg-[#065f46] mb-4"><Plus className="w-4 h-4 mr-1" />New Event</Button>
        <div className="space-y-1">
          <button className="w-full text-left px-3 py-2 text-xs text-white bg-white/10 rounded">All Events</button>
          <button className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded">Meetings</button>
          <button className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded">Deadlines</button>
          <button className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded">Closings</button>
          <button className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded">Tasks</button>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Upcoming</h3>
          <div className="space-y-2">
            {events.map((e, i) => (
              <div key={i} className="p-2 bg-white/5 rounded text-xs">
                <p className="text-white font-medium truncate">{e.title}</p>
                <p className="text-gray-500">{monthNames[currentDate.getMonth()]} {e.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h1>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm bg-gray-100 rounded">Month</button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">Week</button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">Day</button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden h-full">
              {daysOfWeek.map(day => (
                <div key={day} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-600">{day}</div>
              ))}
              {getDaysInMonth(currentDate).map((day, i) => (
                <div key={i} className={cn("bg-white p-2 min-h-[80px]", !day && "bg-gray-50")}>
                  {day && (
                    <>
                      <span className={cn(
                        "inline-flex items-center justify-center w-6 h-6 text-sm rounded-full",
                        isToday(day) ? "bg-[#047857] text-white" : "text-gray-700"
                      )}>{day}</span>
                      {events.filter(e => e.date === day).map((e, j) => (
                        <div key={j} className="mt-1 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded truncate">{e.title}</div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
