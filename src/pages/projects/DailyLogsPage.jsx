import React, { useState } from 'react';
import { Plus, Search, Calendar, Sun, Cloud, CloudRain, CloudSnow, Wind, Thermometer, Clock, Users, Truck, Camera, FileText, AlertTriangle, Eye, Edit2, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DailyLogsPage = ({ projectId }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 11, 1)); // December 2024

  const [logs, setLogs] = useState([
    {
      id: 'DL-2024-1228',
      date: '2024-12-28',
      weather: { condition: 'sunny', tempHigh: 45, tempLow: 28, wind: 5, precipitation: 0 },
      workHours: { start: '07:00', end: '16:30' },
      manpower: [
        { trade: 'Framing', company: 'Smith Framing', count: 8, hours: 9.5 },
        { trade: 'Electrical', company: 'Sparks Electric', count: 3, hours: 8 },
        { trade: 'Plumbing', company: 'ABC Plumbing', count: 2, hours: 6 },
      ],
      equipment: [
        { name: 'Crane', hours: 4, notes: 'Roof truss setting' },
        { name: 'Forklift', hours: 8, notes: 'Material handling' },
      ],
      workCompleted: [
        'Completed roof truss installation on Building A',
        'Rough electrical started in Unit 1-4',
        'Plumbing top-out inspection passed',
      ],
      materials: [
        { item: 'Roof Trusses', quantity: 24, unit: 'ea', delivered: true },
        { item: '2x6 Lumber', quantity: 200, unit: 'bf', delivered: true },
      ],
      visitors: ['City Inspector - Plumbing', 'Owner Site Visit'],
      issues: [],
      photos: 4,
      notes: 'Good progress day. Weather cooperated.',
      createdBy: 'John Foreman',
    },
    {
      id: 'DL-2024-1227',
      date: '2024-12-27',
      weather: { condition: 'cloudy', tempHigh: 38, tempLow: 25, wind: 12, precipitation: 0 },
      workHours: { start: '07:00', end: '16:00' },
      manpower: [
        { trade: 'Framing', company: 'Smith Framing', count: 10, hours: 9 },
        { trade: 'Concrete', company: 'Ready Mix Co', count: 4, hours: 6 },
      ],
      equipment: [
        { name: 'Crane', hours: 8, notes: 'Truss delivery and setting' },
        { name: 'Concrete Pump', hours: 4, notes: 'Garage slab pour' },
      ],
      workCompleted: [
        'Poured garage slab for Units 5-8',
        'Set 16 roof trusses on Building A',
        'Completed second floor sheathing',
      ],
      materials: [
        { item: 'Concrete', quantity: 45, unit: 'cy', delivered: true },
        { item: 'Roof Trusses', quantity: 16, unit: 'ea', delivered: true },
      ],
      visitors: [],
      issues: [{ description: 'Concrete truck delayed 2 hours due to plant breakdown', severity: 'minor' }],
      photos: 8,
      notes: 'Concrete delay pushed pour to afternoon but completed successfully.',
      createdBy: 'John Foreman',
    },
    {
      id: 'DL-2024-1226',
      date: '2024-12-26',
      weather: { condition: 'snow', tempHigh: 32, tempLow: 22, wind: 8, precipitation: 2 },
      workHours: { start: '08:00', end: '14:00' },
      manpower: [
        { trade: 'Framing', company: 'Smith Framing', count: 6, hours: 6 },
      ],
      equipment: [],
      workCompleted: [
        'Limited work due to weather',
        'Interior framing on Unit 1-2 only',
        'Site cleanup and snow removal',
      ],
      materials: [],
      visitors: [],
      issues: [{ description: 'Work stopped early due to snow accumulation', severity: 'weather' }],
      photos: 2,
      notes: 'Weather day - 2" snow. Sent crews home early for safety.',
      createdBy: 'John Foreman',
    },
    {
      id: 'DL-2024-1224',
      date: '2024-12-24',
      weather: { condition: 'sunny', tempHigh: 42, tempLow: 26, wind: 3, precipitation: 0 },
      workHours: { start: '07:00', end: '12:00' },
      manpower: [
        { trade: 'Framing', company: 'Smith Framing', count: 4, hours: 5 },
        { trade: 'Site Work', company: 'Site Prep Inc', count: 2, hours: 5 },
      ],
      equipment: [],
      workCompleted: [
        'Half day - Christmas Eve',
        'Secured site for holiday',
        'Material organization',
      ],
      materials: [],
      visitors: [],
      issues: [],
      photos: 1,
      notes: 'Half day schedule for Christmas Eve.',
      createdBy: 'John Foreman',
    },
  ]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weather: { condition: 'sunny', tempHigh: '', tempLow: '', wind: '', precipitation: '' },
    workHours: { start: '07:00', end: '16:00' },
    manpower: [{ trade: '', company: '', count: '', hours: '' }],
    equipment: [{ name: '', hours: '', notes: '' }],
    workCompleted: [''],
    materials: [{ item: '', quantity: '', unit: 'ea', delivered: false }],
    visitors: '',
    issues: '',
    notes: '',
  });

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />;
      case 'rain': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'snow': return <CloudSnow className="w-5 h-5 text-blue-300" />;
      default: return <Sun className="w-5 h-5 text-gray-400" />;
    }
  };

  const totalManHours = logs.reduce((sum, log) => sum + log.manpower.reduce((s, m) => s + (m.count * m.hours), 0), 0);
  const avgCrewSize = Math.round(logs.reduce((sum, log) => sum + log.manpower.reduce((s, m) => s + m.count, 0), 0) / logs.length);
  const weatherDays = logs.filter(l => l.issues.some(i => i.severity === 'weather')).length;

  // Calendar helpers
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const logDates = logs.map(l => l.date);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleSave = () => {
    const newLog = {
      id: `DL-2024-${new Date(formData.date).toISOString().slice(5, 10).replace('-', '')}`,
      ...formData,
      manpower: formData.manpower.filter(m => m.trade),
      equipment: formData.equipment.filter(e => e.name),
      workCompleted: formData.workCompleted.filter(w => w),
      materials: formData.materials.filter(m => m.item),
      visitors: formData.visitors.split(',').map(v => v.trim()).filter(v => v),
      issues: formData.issues ? [{ description: formData.issues, severity: 'minor' }] : [],
      photos: 0,
      createdBy: 'Current User',
    };
    setLogs(prev => [newLog, ...prev]);
    setShowModal(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Daily Logs</h1>
          <p className="text-sm text-gray-500">Construction site daily reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Log
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Logs</p>
          <p className="text-2xl font-semibold">{logs.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Man-Hours</p>
          <p className="text-2xl font-semibold">{totalManHours.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Avg Crew Size</p>
          <p className="text-2xl font-semibold">{avgCrewSize}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500">Weather Days</p>
          <p className="text-2xl font-semibold text-amber-600">{weatherDays}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Photos Taken</p>
          <p className="text-2xl font-semibold">{logs.reduce((s, l) => s + l.photos, 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
            <span className="font-semibold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasLog = logDates.includes(dateStr);
                const log = logs.find(l => l.date === dateStr);
                return (
                  <div
                    key={day}
                    className={cn(
                      "aspect-square flex items-center justify-center text-sm rounded cursor-pointer",
                      hasLog ? "bg-[#047857] text-white" : "hover:bg-gray-100",
                      log?.issues.some(i => i.severity === 'weather') && "bg-amber-500"
                    )}
                    onClick={() => log && setSelectedLog(log)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#047857] rounded"></div>Log entered</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded"></div>Weather day</div>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="col-span-3 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-gray-500">{log.id}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                      {getWeatherIcon(log.weather.condition)}
                      <span className="text-sm">{log.weather.tempHigh}°/{log.weather.tempLow}°F</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {log.workHours.start} - {log.workHours.end}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {log.issues.length > 0 && (
                      <span className={cn("px-2 py-1 rounded text-xs", log.issues[0].severity === 'weather' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {log.issues.length} issue{log.issues.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <button onClick={() => setSelectedLog(log)} className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                    <button className="p-1 hover:bg-gray-100 rounded"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Manpower</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{log.manpower.reduce((s, m) => s + m.count, 0)} workers</span>
                      <span className="text-xs text-gray-500">({log.manpower.reduce((s, m) => s + (m.count * m.hours), 0)} hrs)</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Equipment</p>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{log.equipment.length > 0 ? log.equipment.map(e => e.name).join(', ') : 'None'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Photos</p>
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{log.photos} photos</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Work Completed</p>
                  <ul className="text-sm space-y-1">
                    {log.workCompleted.slice(0, 3).map((work, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#047857] mt-1">•</span>
                        {work}
                      </li>
                    ))}
                    {log.workCompleted.length > 3 && (
                      <li className="text-gray-500 text-xs">+{log.workCompleted.length - 3} more items</li>
                    )}
                  </ul>
                </div>

                {log.notes && (
                    <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600 italic">&quot;{log.notes}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Log Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-semibold">New Daily Log</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Date & Weather */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium block mb-1">Date *</label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Work Hours</label>
                  <div className="flex gap-2">
                    <Input type="time" value={formData.workHours.start} onChange={(e) => setFormData(prev => ({ ...prev, workHours: { ...prev.workHours, start: e.target.value } }))} />
                    <span className="self-center">to</span>
                    <Input type="time" value={formData.workHours.end} onChange={(e) => setFormData(prev => ({ ...prev, workHours: { ...prev.workHours, end: e.target.value } }))} />
                  </div>
                </div>
              </div>

              {/* Weather */}
              <div>
                <label className="text-sm font-medium block mb-2">Weather</label>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Condition</label>
                    <select className="w-full border rounded-md px-3 py-2" value={formData.weather.condition} onChange={(e) => setFormData(prev => ({ ...prev, weather: { ...prev.weather, condition: e.target.value } }))}>
                      <option value="sunny">Sunny</option>
                      <option value="cloudy">Cloudy</option>
                      <option value="rain">Rain</option>
                      <option value="snow">Snow</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">High (°F)</label>
                    <Input type="number" value={formData.weather.tempHigh} onChange={(e) => setFormData(prev => ({ ...prev, weather: { ...prev.weather, tempHigh: e.target.value } }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Low (°F)</label>
                    <Input type="number" value={formData.weather.tempLow} onChange={(e) => setFormData(prev => ({ ...prev, weather: { ...prev.weather, tempLow: e.target.value } }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Wind (mph)</label>
                    <Input type="number" value={formData.weather.wind} onChange={(e) => setFormData(prev => ({ ...prev, weather: { ...prev.weather, wind: e.target.value } }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Precip (in)</label>
                    <Input type="number" step="0.1" value={formData.weather.precipitation} onChange={(e) => setFormData(prev => ({ ...prev, weather: { ...prev.weather, precipitation: e.target.value } }))} />
                  </div>
                </div>
              </div>

              {/* Manpower */}
              <div>
                <label className="text-sm font-medium block mb-2">Manpower</label>
                {formData.manpower.map((m, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                    <Input placeholder="Trade" value={m.trade} onChange={(e) => {
                      const newManpower = [...formData.manpower];
                      newManpower[idx].trade = e.target.value;
                      setFormData(prev => ({ ...prev, manpower: newManpower }));
                    }} />
                    <Input placeholder="Company" value={m.company} onChange={(e) => {
                      const newManpower = [...formData.manpower];
                      newManpower[idx].company = e.target.value;
                      setFormData(prev => ({ ...prev, manpower: newManpower }));
                    }} />
                    <Input type="number" placeholder="# Workers" value={m.count} onChange={(e) => {
                      const newManpower = [...formData.manpower];
                      newManpower[idx].count = e.target.value;
                      setFormData(prev => ({ ...prev, manpower: newManpower }));
                    }} />
                    <Input type="number" placeholder="Hours" value={m.hours} onChange={(e) => {
                      const newManpower = [...formData.manpower];
                      newManpower[idx].hours = e.target.value;
                      setFormData(prev => ({ ...prev, manpower: newManpower }));
                    }} />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setFormData(prev => ({ ...prev, manpower: [...prev.manpower, { trade: '', company: '', count: '', hours: '' }] }))}>
                  <Plus className="w-4 h-4 mr-1" />Add Row
                </Button>
              </div>

              {/* Work Completed */}
              <div>
                <label className="text-sm font-medium block mb-2">Work Completed</label>
                {formData.workCompleted.map((w, idx) => (
                  <Input key={idx} className="mb-2" placeholder="Describe work completed" value={w} onChange={(e) => {
                    const newWork = [...formData.workCompleted];
                    newWork[idx] = e.target.value;
                    setFormData(prev => ({ ...prev, workCompleted: newWork }));
                  }} />
                ))}
                <Button variant="outline" size="sm" onClick={() => setFormData(prev => ({ ...prev, workCompleted: [...prev.workCompleted, ''] }))}>
                  <Plus className="w-4 h-4 mr-1" />Add Item
                </Button>
              </div>

              {/* Issues */}
              <div>
                <label className="text-sm font-medium block mb-1">Issues / Delays</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={2} value={formData.issues} onChange={(e) => setFormData(prev => ({ ...prev, issues: e.target.value }))} placeholder="Describe any issues or delays..." />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={2} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>Save Log</Button>
            </div>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{new Date(selectedLog.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                <p className="text-sm text-gray-500">{selectedLog.id}</p>
              </div>
              <button onClick={() => setSelectedLog(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Weather & Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(selectedLog.weather.condition)}
                    <div>
                      <p className="font-medium capitalize">{selectedLog.weather.condition}</p>
                      <p className="text-sm text-gray-500">{selectedLog.weather.tempHigh}°/{selectedLog.weather.tempLow}°F, Wind: {selectedLog.weather.wind}mph</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Work Hours</p>
                      <p className="text-sm text-gray-500">{selectedLog.workHours.start} - {selectedLog.workHours.end}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manpower */}
              <div>
                <h4 className="font-medium mb-2">Manpower ({selectedLog.manpower.reduce((s, m) => s + m.count, 0)} workers)</h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-3 py-2">Trade</th>
                        <th className="text-left px-3 py-2">Company</th>
                        <th className="text-right px-3 py-2">Workers</th>
                        <th className="text-right px-3 py-2">Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedLog.manpower.map((m, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{m.trade}</td>
                          <td className="px-3 py-2">{m.company}</td>
                          <td className="px-3 py-2 text-right">{m.count}</td>
                          <td className="px-3 py-2 text-right">{m.hours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Work Completed */}
              <div>
                <h4 className="font-medium mb-2">Work Completed</h4>
                <ul className="space-y-2">
                  {selectedLog.workCompleted.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-[#047857] mt-0.5">✓</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Issues */}
              {selectedLog.issues.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-2">Issues / Delays</h4>
                  {selectedLog.issues.map((issue, idx) => (
                    <p key={idx} className="text-sm text-amber-700">{issue.description}</p>
                  ))}
                </div>
              )}

              {/* Notes */}
              {selectedLog.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedLog.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-500">Created by {selectedLog.createdBy}</p>
              <Button variant="outline" onClick={() => setSelectedLog(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLogsPage;
