import React, { useState } from 'react';
import { Plus, Search, Edit2, Copy, Target, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DealTemplatesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    { id: 1, name: 'Quick Flip Analysis', projectType: 'Renovation', inputs: 12, outputs: 8, criteria: ['ARV', 'MAO', '70% Rule', 'Profit'], lastModified: '2024-12-15', usedIn: 45 },
    { id: 2, name: 'Land Acquisition Analyzer', projectType: 'Land Development', inputs: 18, outputs: 12, criteria: ['$/Lot', 'Development Spread', 'ROI'], lastModified: '2024-12-10', usedIn: 12 },
    { id: 3, name: 'Spec Build Deal Analysis', projectType: 'New Construction', inputs: 22, outputs: 15, criteria: ['Profit Margin', 'ROI', 'Breakeven'], lastModified: '2024-12-08', usedIn: 28 },
    { id: 4, name: 'BTR Acquisition Model', projectType: 'BTR', inputs: 28, outputs: 18, criteria: ['Cap Rate', 'NOI', 'Cash Flow', 'IRR'], lastModified: '2024-11-28', usedIn: 5 },
    { id: 5, name: 'Wholesale Deal Calculator', projectType: 'Wholesale', inputs: 8, outputs: 5, criteria: ['Assignment Fee', 'ARV', 'MAO'], lastModified: '2024-11-20', usedIn: 62 },
  ];

  const dealInputs = [
    { name: 'Purchase Price', type: 'Currency' }, { name: 'ARV / Sale Price', type: 'Currency' }, { name: 'Rehab Estimate', type: 'Currency' },
    { name: 'Holding Period', type: 'Months' }, { name: 'Interest Rate', type: 'Percent' }, { name: 'Closing Costs', type: 'Percent' },
    { name: 'Agent Commission', type: 'Percent' }, { name: 'Contingency', type: 'Percent' },
  ];

  const getTypeColor = (type) => {
    const colors = { 'New Construction': 'bg-blue-100 text-blue-700', 'Land Development': 'bg-green-100 text-green-700', 'Renovation': 'bg-amber-100 text-amber-700', 'BTR': 'bg-purple-100 text-purple-700', 'Wholesale': 'bg-pink-100 text-pink-700' };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Deal Analyzer Templates</h1>
          <p className="text-sm text-gray-500">Quick analysis tools for evaluating potential deals</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />New Template</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.length}</p><p className="text-sm text-gray-500">Templates</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">5</p><p className="text-sm text-gray-500">Deal Types</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.reduce((s, t) => s + t.usedIn, 0)}</p><p className="text-sm text-gray-500">Deals Analyzed</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-2xl font-bold">{templates.reduce((s, t) => s + t.inputs, 0)}</p><p className="text-sm text-gray-500">Total Inputs</p></div>
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
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Target className="w-5 h-5 text-gray-600" /></div>
                    <div>
                      <h3 className="font-semibold">{t.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn("px-2 py-0.5 rounded text-xs", getTypeColor(t.projectType))}>{t.projectType}</span>
                        <span className="text-xs text-gray-400">{t.inputs} inputs • {t.outputs} outputs</span>
                      </div>
                      <div className="flex gap-2 mt-2">{t.criteria.map((c, i) => (<span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">{c}</span>))}</div>
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
              <div className="p-4 border-b"><h3 className="font-semibold">{selectedTemplate.name}</h3><p className="text-xs text-gray-500">Last modified: {selectedTemplate.lastModified}</p></div>
              <div className="p-4"><p className="text-sm font-medium mb-3">Input Fields</p><div className="space-y-2">{dealInputs.map((i, idx) => (<div key={idx} className="flex items-center justify-between text-sm py-2 border-b last:border-0"><span>{i.name}</span><span className="text-gray-400 text-xs">{i.type}</span></div>))}</div></div>
              <div className="p-4 border-t bg-gray-50 flex gap-2"><Button variant="outline" size="sm" className="flex-1"><Edit2 className="w-4 h-4 mr-1" />Edit</Button><Button variant="outline" size="sm" className="flex-1"><Copy className="w-4 h-4 mr-1" />Duplicate</Button></div>
            </div>
          ) : (<div className="bg-white border rounded-lg p-8 text-center text-gray-500"><Target className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>Select a template to preview</p></div>)}
        </div>
      </div>
    </div>
  );
};

export default DealTemplatesPage;
