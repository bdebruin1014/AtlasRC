import React, { useState } from 'react';
import { FileText, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, Download, Upload, Calculator, Building2, ChevronDown, ChevronRight, Plus, Filter, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TaxTrackingPage = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState(['property', 'income']);
  const [activeTab, setActiveTab] = useState('obligations');

  const taxSummary = {
    totalLiability: 485000,
    paid: 325000,
    remaining: 160000,
    upcomingDue: 85000,
    overdue: 12500,
  };

  const taxObligations = [
    {
      id: 'tax-1',
      category: 'property',
      name: 'Property Tax - VanRock HQ',
      entity: 'VanRock Development',
      taxYear: '2024',
      jurisdiction: 'Harris County, TX',
      assessedValue: 2500000,
      taxRate: 2.15,
      annualAmount: 53750,
      quarterlyAmount: 13437.50,
      paidYTD: 40312.50,
      remaining: 13437.50,
      nextDueDate: '2025-01-31',
      status: 'current',
    },
    {
      id: 'tax-2',
      category: 'property',
      name: 'Property Tax - Sunset Ridge Land',
      entity: 'Sunset Ridge SPE',
      taxYear: '2024',
      jurisdiction: 'Fort Bend County, TX',
      assessedValue: 4200000,
      taxRate: 2.35,
      annualAmount: 98700,
      quarterlyAmount: 24675,
      paidYTD: 74025,
      remaining: 24675,
      nextDueDate: '2025-01-31',
      status: 'current',
    },
    {
      id: 'tax-3',
      category: 'property',
      name: 'Property Tax - Watson Project',
      entity: 'Watson Project SPE',
      taxYear: '2024',
      jurisdiction: 'Montgomery County, TX',
      assessedValue: 3800000,
      taxRate: 2.25,
      annualAmount: 85500,
      quarterlyAmount: 21375,
      paidYTD: 64125,
      remaining: 21375,
      nextDueDate: '2025-01-31',
      status: 'current',
    },
    {
      id: 'tax-4',
      category: 'franchise',
      name: 'Texas Franchise Tax',
      entity: 'VanRock Development',
      taxYear: '2024',
      jurisdiction: 'State of Texas',
      taxableMargin: 850000,
      taxRate: 0.75,
      annualAmount: 6375,
      paidYTD: 0,
      remaining: 6375,
      nextDueDate: '2025-05-15',
      status: 'upcoming',
    },
    {
      id: 'tax-5',
      category: 'payroll',
      name: 'Federal Payroll Tax - Q4',
      entity: 'VanRock Development',
      taxYear: '2024',
      jurisdiction: 'Federal',
      taxableWages: 425000,
      taxRate: 7.65,
      quarterlyAmount: 32512.50,
      paidYTD: 97537.50,
      remaining: 32512.50,
      nextDueDate: '2025-01-15',
      status: 'due-soon',
    },
    {
      id: 'tax-6',
      category: 'payroll',
      name: 'State Unemployment Tax - Q4',
      entity: 'VanRock Development',
      taxYear: '2024',
      jurisdiction: 'Texas',
      taxableWages: 425000,
      taxRate: 2.7,
      quarterlyAmount: 11475,
      paidYTD: 34425,
      remaining: 11475,
      nextDueDate: '2025-01-31',
      status: 'current',
    },
    {
      id: 'tax-7',
      category: 'sales',
      name: 'Sales Tax - December',
      entity: 'VanRock Development',
      taxYear: '2024',
      jurisdiction: 'State of Texas',
      taxableSales: 185000,
      taxRate: 8.25,
      monthlyAmount: 15262.50,
      paidYTD: 152625,
      remaining: 15262.50,
      nextDueDate: '2025-01-20',
      status: 'due-soon',
    },
  ];

  const taxCategories = [
    { id: 'property', name: 'Property Taxes', icon: Building2, color: 'blue' },
    { id: 'income', name: 'Income Taxes', icon: DollarSign, color: 'green' },
    { id: 'payroll', name: 'Payroll Taxes', icon: FileText, color: 'purple' },
    { id: 'sales', name: 'Sales & Use Taxes', icon: Calculator, color: 'amber' },
    { id: 'franchise', name: 'Franchise Taxes', icon: Building2, color: 'red' },
  ];

  const upcomingDeadlines = [
    { date: '2025-01-15', description: 'Federal Payroll Tax Q4', amount: 32512.50, status: 'due-soon' },
    { date: '2025-01-20', description: 'Sales Tax - December', amount: 15262.50, status: 'due-soon' },
    { date: '2025-01-31', description: 'Property Tax Q4 (Multiple)', amount: 59487.50, status: 'current' },
    { date: '2025-01-31', description: 'State Unemployment Tax Q4', amount: 11475, status: 'current' },
    { date: '2025-05-15', description: 'Texas Franchise Tax', amount: 6375, status: 'upcoming' },
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" />Paid</span>;
      case 'current':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Current</span>;
      case 'due-soon':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded flex items-center gap-1"><Clock className="w-3 h-3" />Due Soon</span>;
      case 'overdue':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Overdue</span>;
      case 'upcoming':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">Upcoming</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Tax Tracking & Compliance</h1>
            <p className="text-sm text-gray-500">Monitor tax obligations, payments, and deadlines</p>
          </div>
          <div className="flex gap-2">
            <select className="border rounded-md px-3 py-1.5 text-sm" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="2024">Tax Year 2024</option>
              <option value="2023">Tax Year 2023</option>
              <option value="2022">Tax Year 2022</option>
            </select>
            <select className="border rounded-md px-3 py-1.5 text-sm" value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)}>
              <option value="all">All Entities</option>
              <option value="vanrock">VanRock Development</option>
              <option value="watson">Watson Project SPE</option>
              <option value="sunset">Sunset Ridge SPE</option>
            </select>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm"><Plus className="w-4 h-4 mr-1" />Add Tax</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Total Liability</p>
            <p className="text-xl font-bold text-blue-700">${(taxSummary.totalLiability / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Paid YTD</p>
            <p className="text-xl font-bold text-green-700">${(taxSummary.paid / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-xl font-bold text-purple-700">${(taxSummary.remaining / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Due Next 30 Days</p>
            <p className="text-xl font-bold text-amber-700">${(taxSummary.upcomingDue / 1000).toFixed(0)}K</p>
          </div>
          <div className={cn("rounded-lg p-3 text-center", taxSummary.overdue > 0 ? "bg-red-50" : "bg-gray-50")}>
            <p className="text-xs text-gray-500">Overdue</p>
            <p className={cn("text-xl font-bold", taxSummary.overdue > 0 ? "text-red-700" : "text-gray-500")}>
              ${(taxSummary.overdue / 1000).toFixed(1)}K
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-4">
        <div className="flex gap-4">
          {['obligations', 'payments', 'deadlines', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize",
                activeTab === tab
                  ? "border-[#047857] text-[#047857]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tax List */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'obligations' && (
            <div className="space-y-4">
              {taxCategories.map((category) => {
                const categoryTaxes = taxObligations.filter(t => t.category === category.id);
                if (categoryTaxes.length === 0) return null;

                const Icon = category.icon;
                const categoryTotal = categoryTaxes.reduce((sum, t) => sum + (t.remaining || 0), 0);

                return (
                  <div key={category.id} className="bg-white border rounded-lg overflow-hidden">
                    <div
                      onClick={() => toggleCategory(category.id)}
                      className={cn("px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between", `bg-${category.color}-50`)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <Icon className={cn("w-5 h-5", `text-${category.color}-600`)} />
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-xs text-gray-500">{categoryTaxes.length} obligations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${categoryTotal.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">remaining</p>
                      </div>
                    </div>

                    {expandedCategories.includes(category.id) && (
                      <div className="divide-y">
                        {categoryTaxes.map((tax) => (
                          <div key={tax.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{tax.name}</span>
                                  {getStatusBadge(tax.status)}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{tax.entity}</span>
                                  <span>{tax.jurisdiction}</span>
                                  <span>Tax Year: {tax.taxYear}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">${tax.remaining?.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Due: {tax.nextDueDate}</p>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                              {tax.assessedValue && (
                                <div>
                                  <p className="text-xs text-gray-500">Assessed Value</p>
                                  <p className="font-medium">${tax.assessedValue.toLocaleString()}</p>
                                </div>
                              )}
                              {tax.taxableWages && (
                                <div>
                                  <p className="text-xs text-gray-500">Taxable Wages</p>
                                  <p className="font-medium">${tax.taxableWages.toLocaleString()}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-gray-500">Tax Rate</p>
                                <p className="font-medium">{tax.taxRate}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Annual Amount</p>
                                <p className="font-medium">${(tax.annualAmount || tax.quarterlyAmount * 4 || tax.monthlyAmount * 12).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Paid YTD</p>
                                <p className="font-medium text-green-600">${tax.paidYTD.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button variant="outline" size="sm">Record Payment</Button>
                              <Button variant="outline" size="sm">View History</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'deadlines' && (
            <div className="bg-white border rounded-lg">
              <div className="px-4 py-3 border-b">
                <h3 className="font-semibold">Upcoming Tax Deadlines</h3>
              </div>
              <div className="divide-y">
                {upcomingDeadlines.map((deadline, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex flex-col items-center justify-center text-center",
                        deadline.status === 'due-soon' ? "bg-amber-100" :
                          deadline.status === 'overdue' ? "bg-red-100" : "bg-gray-100"
                      )}>
                        <span className="text-xs font-medium">{deadline.date.split('-')[1]}/{deadline.date.split('-')[2]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{deadline.description}</p>
                        <p className="text-sm text-gray-500">Due: {deadline.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">${deadline.amount.toLocaleString()}</p>
                        {getStatusBadge(deadline.status)}
                      </div>
                      <Button variant="outline" size="sm">Pay Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Quick Actions */}
        <div className="w-80 border-l bg-white p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start"><Calculator className="w-4 h-4 mr-2" />Calculate Estimated Tax</Button>
            <Button variant="outline" className="w-full justify-start"><Upload className="w-4 h-4 mr-2" />Upload Tax Document</Button>
            <Button variant="outline" className="w-full justify-start"><Download className="w-4 h-4 mr-2" />Generate Tax Report</Button>
            <Button variant="outline" className="w-full justify-start"><Calendar className="w-4 h-4 mr-2" />Set Payment Reminder</Button>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-4">Tax Calendar</h3>
            <div className="space-y-2">
              {upcomingDeadlines.slice(0, 4).map((deadline, idx) => (
                <div key={idx} className={cn(
                  "p-3 rounded-lg border",
                  deadline.status === 'due-soon' ? "border-amber-200 bg-amber-50" :
                    deadline.status === 'overdue' ? "border-red-200 bg-red-50" : "border-gray-200"
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{deadline.date}</span>
                    {getStatusBadge(deadline.status)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{deadline.description}</p>
                  <p className="text-sm font-semibold mt-1">${deadline.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxTrackingPage;
