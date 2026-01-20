import React, { useState } from 'react';
import { Plus, Search, Edit2, Copy, Milestone, Flag, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const MilestoneTemplatesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    { id: 1, name: 'New Construction Milestones', projectType: 'New Construction', milestones: 12, lastModified: '2024-12-15', usedIn: 18 },
    { id: 2, name: 'Land Development Milestones', projectType: 'Land Development', milestones: 8, lastModified: '2024-12-10', usedIn: 6 },
    { id: 3, name: 'Renovation Milestones', projectType: 'Renovation', milestones: 10, lastModified: '2024-12-08', usedIn: 24 },
    { id: 4, name: 'BTR Community Milestones', projectType: 'BTR', milestones: 15, lastModified: '2024-11-28', usedIn: 2 },
    { id: 5, name: 'Draw Schedule Milestones', projectType: 'All', milestones: 6, lastModified: '2024-11-20', usedIn: 35 },
  ];

  const milestonesList = [
    { name: 'Land Closing', offset: 'Day 0', payment: '10%', critical: true },
    { name: 'Permits Approved', offset: '+30 days', payment: null, critical: true },
    { name: 'Foundation Complete', offset: '+45 days', payment: '15%', critical: true },
    { name: 'Framing Complete', offset: '+75 days', payment: '20%', critical: true },
    { name: 'Dry-In', offset: '+90 days', payment: '15%', critical: false },
    { name: 'MEP Rough Complete', offset: '+105 days', payment: '10%', critical: false },
    { name: 'Drywall Complete', offset: '+120 days', payment: '10%', critical: false },
    { name: 'Final Inspection', offset: '+150 days', payment: '15%', critical: true },
    { name: 'Certificate of Occupancy', offset: '+160 days', payment: '5%', critical: true },
  ];

  const getTypeColor = (type) => {
    const colors = { 'New Construction': 'bg-blue-100 text-blue-700', 'Land Development': 'bg-green-100 text-green-700', 'Renovation': 'bg-amber-100 text-amber-700', 'BTR': 'bg-purple-100 text-purple-700', 'All': 'bg-gray-100 text-gray-700' };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Milestone Templates</h1>
          <p className="text-sm text-gray-500">Key project milestones and payment schedules</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />New Template</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.length}</p><p className="text-sm text-gray-500">Templates</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.reduce((s, t) => s + t.milestones, 0)}</p><p className="text-sm text-gray-500">Total Milestones</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.reduce((s, t) => s + t.usedIn, 0)}</p><p className="text-sm text-gray-500">Times Used</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">4</p><p className="text-sm text-gray-500">Project Types</p></div>
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
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Flag className="w-5 h-5 text-gray-600" /></div>
                    <div>
                      <h3 className="font-semibold">{t.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn("px-2 py-0.5 rounded text-xs", getTypeColor(t.projectType))}>{t.projectType}</span>
                        <span className="text-xs text-gray-400">{t.milestones} milestones</span>
                      </div>
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
              <div className="p-4 border-b"><h3 className="font-semibold">{selectedTemplate.name}</h3><p className="text-xs text-gray-500">{selectedTemplate.milestones} milestones</p></div>
              <div className="p-4 max-h-[400px] overflow-y-auto"><p className="text-sm font-medium mb-3">Milestones</p><div className="space-y-2">{milestonesList.map((m, i) => (<div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0"><div className="flex items-center gap-2">{m.critical ? <Flag className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-gray-300" />}<div><span className="font-medium">{m.name}</span><span className="text-gray-400 text-xs ml-2">{m.offset}</span></div></div>{m.payment && <span className="text-green-600 text-xs font-medium">{m.payment}</span>}</div>))}</div></div>
              <div className="p-4 border-t bg-gray-50 flex gap-2"><Button variant="outline" size="sm" className="flex-1"><Edit2 className="w-4 h-4 mr-1" />Edit</Button><Button variant="outline" size="sm" className="flex-1"><Copy className="w-4 h-4 mr-1" />Duplicate</Button></div>
            </div>
          ) : (<div className="bg-white border rounded-lg p-8 text-center text-gray-500"><Flag className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>Select a template to preview</p></div>)}
        </div>
      </div>
    </div>
  );
};

export default MilestoneTemplatesPage;
