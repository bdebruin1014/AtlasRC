import React, { useState } from 'react';
import { 
  Plus, Search, MoreVertical, Copy, Edit2, Trash2, Eye, 
  FileText, CheckCircle, Building2, Layers, ChevronRight, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const COATemplatesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(['Assets', 'Liabilities']);

  const templates = [
    {
      id: 'coa-001',
      name: 'Real Estate Development LLC',
      description: 'Standard chart of accounts for development project SPVs',
      accountCount: 85,
      usedBy: 12,
      isDefault: true,
      lastUpdated: '2024-11-15',
      categories: [
        {
          name: 'Assets',
          accounts: [
            { number: '1000', name: 'Cash - Operating', type: 'Bank' },
            { number: '1010', name: 'Cash - Construction', type: 'Bank' },
            { number: '1020', name: 'Cash - Reserve', type: 'Bank' },
            { number: '1100', name: 'Accounts Receivable', type: 'Current Asset' },
            { number: '1200', name: 'Due from Related Parties', type: 'Current Asset' },
            { number: '1300', name: 'Prepaid Expenses', type: 'Current Asset' },
            { number: '1400', name: 'Land', type: 'Fixed Asset' },
            { number: '1410', name: 'Land Improvements', type: 'Fixed Asset' },
            { number: '1420', name: 'Construction in Progress', type: 'Fixed Asset' },
            { number: '1500', name: 'Buildings', type: 'Fixed Asset' },
            { number: '1510', name: 'Accumulated Depreciation - Buildings', type: 'Fixed Asset' },
          ]
        },
        {
          name: 'Liabilities',
          accounts: [
            { number: '2000', name: 'Accounts Payable', type: 'Current Liability' },
            { number: '2100', name: 'Accrued Expenses', type: 'Current Liability' },
            { number: '2200', name: 'Construction Loan Payable', type: 'Long-term Liability' },
            { number: '2210', name: 'Permanent Loan Payable', type: 'Long-term Liability' },
            { number: '2300', name: 'Due to Related Parties', type: 'Current Liability' },
            { number: '2400', name: 'Investor Capital Contributions', type: 'Equity' },
            { number: '2410', name: 'Investor Distributions', type: 'Equity' },
          ]
        },
        {
          name: 'Equity',
          accounts: [
            { number: '3000', name: 'Member Capital - Class A', type: 'Equity' },
            { number: '3010', name: 'Member Capital - Class B', type: 'Equity' },
            { number: '3100', name: 'Retained Earnings', type: 'Equity' },
            { number: '3200', name: 'Current Year Earnings', type: 'Equity' },
          ]
        },
        {
          name: 'Revenue',
          accounts: [
            { number: '4000', name: 'Lot Sales Revenue', type: 'Revenue' },
            { number: '4010', name: 'Home Sales Revenue', type: 'Revenue' },
            { number: '4100', name: 'Rental Income', type: 'Revenue' },
            { number: '4200', name: 'Interest Income', type: 'Revenue' },
            { number: '4900', name: 'Other Income', type: 'Revenue' },
          ]
        },
        {
          name: 'Cost of Sales',
          accounts: [
            { number: '5000', name: 'Land Cost', type: 'Cost of Sales' },
            { number: '5100', name: 'Direct Construction Costs', type: 'Cost of Sales' },
            { number: '5200', name: 'Indirect Construction Costs', type: 'Cost of Sales' },
            { number: '5300', name: 'Closing Costs', type: 'Cost of Sales' },
            { number: '5400', name: 'Sales Commissions', type: 'Cost of Sales' },
          ]
        },
        {
          name: 'Operating Expenses',
          accounts: [
            { number: '6000', name: 'Management Fees', type: 'Expense' },
            { number: '6100', name: 'Professional Fees - Legal', type: 'Expense' },
            { number: '6110', name: 'Professional Fees - Accounting', type: 'Expense' },
            { number: '6200', name: 'Insurance', type: 'Expense' },
            { number: '6300', name: 'Property Taxes', type: 'Expense' },
            { number: '6400', name: 'Interest Expense', type: 'Expense' },
            { number: '6500', name: 'Loan Fees & Points', type: 'Expense' },
            { number: '6600', name: 'Marketing & Advertising', type: 'Expense' },
            { number: '6700', name: 'Utilities', type: 'Expense' },
            { number: '6800', name: 'Repairs & Maintenance', type: 'Expense' },
            { number: '6900', name: 'Miscellaneous Expenses', type: 'Expense' },
          ]
        },
      ]
    },
    {
      id: 'coa-002',
      name: 'Holding Company',
      description: 'Chart of accounts for parent holding entities',
      accountCount: 45,
      usedBy: 3,
      isDefault: false,
      lastUpdated: '2024-10-20',
    },
    {
      id: 'coa-003',
      name: 'Property Management',
      description: 'For entities managing rental properties',
      accountCount: 62,
      usedBy: 5,
      isDefault: false,
      lastUpdated: '2024-09-15',
    },
    {
      id: 'coa-004',
      name: 'Fix & Flip Project',
      description: 'Simplified COA for short-term flip projects',
      accountCount: 38,
      usedBy: 8,
      isDefault: false,
      lastUpdated: '2024-11-01',
    },
  ];

  const toggleCategory = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selected = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chart of Accounts Templates</h1>
          <p className="text-sm text-gray-500">Create and manage COA templates for new entities</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-2" />New Template
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Template List */}
        <div className="col-span-1">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search templates..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white border rounded-lg divide-y">
            {filteredTemplates.map(template => (
              <div 
                key={template.id}
                className={cn(
                  "p-4 cursor-pointer transition-colors",
                  selectedTemplate === template.id ? "bg-emerald-50 border-l-2 border-l-emerald-600" : "hover:bg-gray-50"
                )}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Layers className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{template.name}</p>
                        {template.isDefault && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{template.accountCount} accounts</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{template.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>Used by {template.usedBy} entities</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Preview */}
        <div className="col-span-2">
          {selected ? (
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  <p className="text-sm text-gray-500">{selected.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Copy className="w-4 h-4 mr-1" />Duplicate</Button>
                  <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Account Structure</h3>
                  <span className="text-sm text-gray-500">{selected.accountCount} accounts</span>
                </div>

                {selected.categories?.map(category => (
                  <div key={category.name} className="mb-2">
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <span className="font-medium text-sm">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{category.accounts.length} accounts</span>
                        {expandedCategories.includes(category.name) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {expandedCategories.includes(category.name) && (
                      <div className="mt-1 ml-4 border-l-2 border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-gray-500 uppercase">
                              <th className="py-2 pl-4 w-24">Number</th>
                              <th className="py-2">Account Name</th>
                              <th className="py-2 w-32">Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {category.accounts.map(account => (
                              <tr key={account.number} className="hover:bg-gray-50">
                                <td className="py-2 pl-4 font-mono text-xs">{account.number}</td>
                                <td className="py-2">{account.name}</td>
                                <td className="py-2 text-xs text-gray-500">{account.type}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}

                {!selected.categories && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Click &quot;Edit&quot; to view and modify accounts</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-8 text-center">
              <Layers className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-1">Select a Template</h3>
              <p className="text-sm text-gray-500">Choose a template from the list to preview its accounts</p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Using COA Templates</p>
            <p className="text-sm text-blue-700 mt-1">
              When creating a new entity in the Accounting module, you can select a COA template to automatically populate 
              the chart of accounts. You can then customize the accounts as needed for the specific entity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default COATemplatesPage;
