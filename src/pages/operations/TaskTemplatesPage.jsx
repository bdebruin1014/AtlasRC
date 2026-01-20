import React from 'react';
import { FileText, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TaskTemplatesPage = () => {
  const templates = [
    { id: 1, name: 'Due Diligence Checklist', tasks: 12, category: 'Acquisition' },
    { id: 2, name: 'Construction Milestones', tasks: 8, category: 'Construction' },
    { id: 3, name: 'Closing Checklist', tasks: 15, category: 'Disposition' },
    { id: 4, name: 'Permit Application', tasks: 6, category: 'Entitlement' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Task Templates</h1>
          <p className="text-sm text-gray-500">Reusable task lists for common workflows</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-1" />New Template</Button>
      </div>
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search templates..." className="pl-9" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm cursor-pointer">
            <FileText className="w-8 h-8 text-[#047857] mb-3" />
            <h3 className="font-medium text-gray-900">{t.name}</h3>
            <p className="text-sm text-gray-500">{t.tasks} tasks • {t.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskTemplatesPage;
