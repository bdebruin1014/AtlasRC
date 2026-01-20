import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, MoreVertical, Calculator, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const BudgetTemplatesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    { id: 1, name: 'Single Family New Construction', projectType: 'New Construction', categories: 12, lineItems: 145, lastModified: '2024-12-15', usedIn: 8 },
    { id: 2, name: 'Lot Development', projectType: 'Land Development', categories: 8, lineItems: 78, lastModified: '2024-12-10', usedIn: 3 },
    { id: 3, name: 'Fix & Flip Residential', projectType: 'Renovation', categories: 10, lineItems: 92, lastModified: '2024-12-08', usedIn: 12 },
    { id: 4, name: 'Multi-Family Build', projectType: 'New Construction', categories: 14, lineItems: 168, lastModified: '2024-11-28', usedIn: 2 },
    { id: 5, name: 'Build-to-Rent', projectType: 'BTR', categories: 15, lineItems: 182, lastModified: '2024-11-20', usedIn: 1 },
  ];

  const budgetCategories = [
    { name: 'Land Acquisition', items: 8 }, { name: 'Site Work', items: 15 }, { name: 'Foundation', items: 12 },
    { name: 'Framing', items: 18 }, { name: 'Roofing', items: 8 }, { name: 'Plumbing', items: 14 },
    { name: 'Electrical', items: 16 }, { name: 'HVAC', items: 10 }, { name: 'Insulation', items: 6 },
    { name: 'Drywall', items: 8 }, { name: 'Finishes', items: 22 }, { name: 'Soft Costs', items: 8 },
  ];

  const getTypeColor = (type) => {
    const colors = { 'New Construction': 'bg-blue-100 text-blue-700', 'Land Development': 'bg-green-100 text-green-700', 'Renovation': 'bg-amber-100 text-amber-700', 'BTR': 'bg-purple-100 text-purple-700' };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Budget Templates</h1>
          <p className="text-sm text-gray-500">Create and manage budget templates for different project types</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />New Template</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.length}</p><p className="text-sm text-gray-500">Templates</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">4</p><p className="text-sm text-gray-500">Project Types</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.reduce((s, t) => s + t.usedIn, 0)}</p><p className="text-sm text-gray-500">Projects Using</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.reduce((s, t) => s + t.lineItems, 0)}</p><p className="text-sm text-gray-500">Total Line Items</p></div>
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
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Calculator className="w-5 h-5 text-gray-600" /></div>
                    <div>
                      <h3 className="font-semibold">{t.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn("px-2 py-0.5 rounded text-xs", getTypeColor(t.projectType))}>{t.projectType}</span>
                        <span className="text-xs text-gray-400">{t.categories} categories • {t.lineItems} items</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Used in {t.usedIn} projects</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-1">
          {selectedTemplate ? (
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b"><h3 className="font-semibold">{selectedTemplate.name}</h3><p className="text-xs text-gray-500">Last modified: {selectedTemplate.lastModified}</p></div>
              <div className="p-4"><p className="text-sm font-medium mb-3">Categories</p><div className="space-y-2">{budgetCategories.map((c, i) => (<div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0"><span>{c.name}</span><span className="text-gray-400">{c.items} items</span></div>))}</div></div>
              <div className="p-4 border-t bg-gray-50 flex gap-2"><Button variant="outline" size="sm" className="flex-1"><Edit2 className="w-4 h-4 mr-1" />Edit</Button><Button variant="outline" size="sm" className="flex-1"><Copy className="w-4 h-4 mr-1" />Duplicate</Button></div>
            </div>
          ) : (<div className="bg-white border rounded-lg p-8 text-center text-gray-500"><Calculator className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>Select a template to preview</p></div>)}
        </div>
      </div>
    </div>
  );
};

export default BudgetTemplatesPage;
