import React, { useState } from 'react';
import { Plus, Search, Edit2, Copy, CheckSquare, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TaskTemplatesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    { id: 1, name: 'Pre-Construction Checklist', category: 'Construction', tasks: 24, assignees: ['Project Manager', 'Superintendent'], lastModified: '2024-12-15', usedIn: 18 },
    { id: 2, name: 'Closing Checklist', category: 'Sales', tasks: 32, assignees: ['Sales Manager', 'Title Company'], lastModified: '2024-12-10', usedIn: 45 },
    { id: 3, name: 'Due Diligence Tasks', category: 'Acquisition', tasks: 18, assignees: ['Acquisitions', 'Attorney'], lastModified: '2024-12-08', usedIn: 28 },
    { id: 4, name: 'Permit Application Tasks', category: 'Construction', tasks: 15, assignees: ['Project Manager'], lastModified: '2024-11-28', usedIn: 22 },
    { id: 5, name: 'Final Walkthrough', category: 'Construction', tasks: 42, assignees: ['Superintendent', 'Quality Control'], lastModified: '2024-11-20', usedIn: 35 },
    { id: 6, name: 'Investor Onboarding', category: 'Finance', tasks: 12, assignees: ['Investor Relations'], lastModified: '2024-11-15', usedIn: 15 },
  ];

  const tasksList = [
    { name: 'Review plans and specifications', duration: '2 days', required: true },
    { name: 'Verify permits on file', duration: '1 day', required: true },
    { name: 'Schedule pre-construction meeting', duration: '1 day', required: true },
    { name: 'Confirm subcontractor availability', duration: '3 days', required: true },
    { name: 'Order materials', duration: '5 days', required: false },
    { name: 'Set up job site', duration: '1 day', required: true },
  ];

  const getCategoryColor = (cat) => {
    const colors = { 'Construction': 'bg-blue-100 text-blue-700', 'Sales': 'bg-green-100 text-green-700', 'Acquisition': 'bg-amber-100 text-amber-700', 'Finance': 'bg-purple-100 text-purple-700' };
    return colors[cat] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Task List Templates</h1>
          <p className="text-sm text-gray-500">Reusable task checklists for common workflows</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />New Template</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.length}</p><p className="text-sm text-gray-500">Templates</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">4</p><p className="text-sm text-gray-500">Categories</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.reduce((s, t) => s + t.usedIn, 0)}</p><p className="text-sm text-gray-500">Times Used</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.reduce((s, t) => s + t.tasks, 0)}</p><p className="text-sm text-gray-500">Total Tasks</p></div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border rounded-lg">
          <div className="p-4 border-b">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search templates..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          </div>
          <div className="divide-y">
            {templates.map((t) => (
              <div key={t.id} className={cn("p-4 cursor-pointer hover:bg-gray-50", selectedTemplate?.id === t.id && "bg-green-50 border-l-4 border-l-[#047857]")} onClick={() => setSelectedTemplate(t)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><CheckSquare className="w-5 h-5 text-gray-600" /></div>
                    <div>
                      <h3 className="font-semibold">{t.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn("px-2 py-0.5 rounded text-xs", getCategoryColor(t.category))}>{t.category}</span>
                        <span className="text-xs text-gray-400">{t.tasks} tasks</span>
                      </div>
                      <div className="flex gap-2 mt-2">{t.assignees.map((a, i) => (<span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs flex items-center gap-1"><Users className="w-3 h-3" />{a}</span>))}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Used {t.usedIn} times</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-1">
          {selectedTemplate ? (
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b"><h3 className="font-semibold">{selectedTemplate.name}</h3><p className="text-xs text-gray-500">{selectedTemplate.tasks} tasks</p></div>
              <div className="p-4"><p className="text-sm font-medium mb-3">Sample Tasks</p><div className="space-y-2">{tasksList.map((t, i) => (<div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0"><div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-gray-300" /><span>{t.name}</span>{t.required && <span className="text-red-500 text-xs">*</span>}</div><span className="text-gray-400 text-xs">{t.duration}</span></div>))}</div></div>
              <div className="p-4 border-t bg-gray-50 flex gap-2"><Button variant="outline" size="sm" className="flex-1"><Edit2 className="w-4 h-4 mr-1" />Edit</Button><Button variant="outline" size="sm" className="flex-1"><Copy className="w-4 h-4 mr-1" />Duplicate</Button></div>
            </div>
          ) : (<div className="bg-white border rounded-lg p-8 text-center text-gray-500"><CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>Select a template to preview</p></div>)}
        </div>
      </div>
    </div>
  );
};

export default TaskTemplatesPage;
