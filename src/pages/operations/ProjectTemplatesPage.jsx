import React from 'react';
import { Layers, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ProjectTemplatesPage = () => {
  const templates = [
    { id: 1, name: 'Lot Development', modules: ['Acquisition', 'Entitlement', 'Construction'], projects: 5 },
    { id: 2, name: 'Spec Home Build', modules: ['Acquisition', 'Construction', 'Sales'], projects: 12 },
    { id: 3, name: 'Fix & Flip', modules: ['Acquisition', 'Renovation', 'Disposition'], projects: 8 },
    { id: 4, name: 'Build-to-Rent', modules: ['Acquisition', 'Construction', 'Leasing'], projects: 3 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Project Templates</h1>
          <p className="text-sm text-gray-500">Standard project configurations by type</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-1" />New Template</Button>
      </div>
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search templates..." className="pl-9" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm cursor-pointer">
            <div className="flex items-start justify-between">
              <Layers className="w-8 h-8 text-[#047857]" />
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{t.projects} projects</span>
            </div>
            <h3 className="font-medium text-gray-900 mt-3">{t.name}</h3>
            <div className="flex flex-wrap gap-1 mt-2">
              {t.modules.map(m => (
                <span key={m} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{m}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTemplatesPage;
