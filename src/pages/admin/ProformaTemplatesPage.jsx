import React, { useState } from 'react';
import { Plus, Search, Edit2, Copy, LineChart, DollarSign, TrendingUp, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ProformaTemplatesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    { id: 1, name: 'Single Family Spec Build', projectType: 'New Construction', metrics: ['ROI', 'IRR', 'Cash-on-Cash', 'Profit Margin'], assumptions: 24, lastModified: '2024-12-15', usedIn: 15 },
    { id: 2, name: 'Lot Development Pro Forma', projectType: 'Land Development', metrics: ['ROI', 'Profit per Lot', 'Development Spread'], assumptions: 18, lastModified: '2024-12-10', usedIn: 5 },
    { id: 3, name: 'Fix & Flip Analysis', projectType: 'Renovation', metrics: ['ROI', 'Profit Margin', 'ARV', 'MAO'], assumptions: 16, lastModified: '2024-12-08', usedIn: 22 },
    { id: 4, name: 'Build-to-Rent Pro Forma', projectType: 'BTR', metrics: ['Cap Rate', 'NOI', 'Cash Flow', 'IRR'], assumptions: 28, lastModified: '2024-11-28', usedIn: 3 },
    { id: 5, name: 'Multi-Family Development', projectType: 'New Construction', metrics: ['IRR', 'Equity Multiple', 'Cash-on-Cash', 'NOI'], assumptions: 32, lastModified: '2024-11-20', usedIn: 2 },
  ];

  const proformaCategories = [
    { name: 'Revenue Assumptions', items: 6 }, { name: 'Construction Costs', items: 4 }, { name: 'Soft Costs', items: 5 },
    { name: 'Financing', items: 4 }, { name: 'Operating Expenses', items: 6 }, { name: 'Exit Assumptions', items: 3 },
  ];

  const getTypeColor = (type) => {
    const colors = { 'New Construction': 'bg-blue-100 text-blue-700', 'Land Development': 'bg-green-100 text-green-700', 'Renovation': 'bg-amber-100 text-amber-700', 'BTR': 'bg-purple-100 text-purple-700' };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Proforma Templates</h1>
          <p className="text-sm text-gray-500">Financial modeling templates for project analysis</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />New Template</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.length}</p><p className="text-sm text-gray-500">Templates</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">4</p><p className="text-sm text-gray-500">Project Types</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.reduce((s, t) => s + t.usedIn, 0)}</p><p className="text-sm text-gray-500">Projects Using</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.reduce((s, t) => s + t.assumptions, 0)}</p><p className="text-sm text-gray-500">Total Assumptions</p></div>
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
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><LineChart className="w-5 h-5 text-gray-600" /></div>
                    <div>
                      <h3 className="font-semibold">{t.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn("px-2 py-0.5 rounded text-xs", getTypeColor(t.projectType))}>{t.projectType}</span>
                        <span className="text-xs text-gray-400">{t.assumptions} assumptions</span>
                      </div>
                      <div className="flex gap-2 mt-2">{t.metrics.map((m, i) => (<span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{m}</span>))}</div>
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
              <div className="p-4"><p className="text-sm font-medium mb-3">Assumption Categories</p><div className="space-y-2">{proformaCategories.map((c, i) => (<div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0"><span>{c.name}</span><span className="text-gray-400">{c.items} fields</span></div>))}</div></div>
              <div className="p-4 border-t bg-gray-50 flex gap-2"><Button variant="outline" size="sm" className="flex-1"><Edit2 className="w-4 h-4 mr-1" />Edit</Button><Button variant="outline" size="sm" className="flex-1"><Copy className="w-4 h-4 mr-1" />Duplicate</Button></div>
            </div>
          ) : (<div className="bg-white border rounded-lg p-8 text-center text-gray-500"><LineChart className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>Select a template to preview</p></div>)}
        </div>
      </div>
    </div>
  );
};

export default ProformaTemplatesPage;
