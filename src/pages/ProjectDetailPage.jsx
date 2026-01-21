import React, { useState, useMemo } from 'react';
import ProjectContactsSection from '@/pages/projects/ContactsPage';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, ChevronDown, FileText, Building2, Users, DollarSign, FolderOpen, ClipboardList, MapPin, Calendar, Landmark, HardHat, Truck, FileCheck, AlertTriangle, Receipt, Shield, Mail, MessageSquare, Video, Settings, TrendingUp, Package, PlusCircle, CreditCard, PieChart, ArrowUpRight, Calculator, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProject, PROJECT_TYPES } from '@/hooks/useProjects';

// Import ALL Budget Components
import IndividualSpecHomeBudget from '@/features/budgets/components/IndividualSpecHomeBudget';
import HorizontalLotDevelopmentBudget from '@/features/budgets/components/HorizontalLotDevelopmentBudget';
import BuildToRentBudget from '@/features/budgets/components/BuildToRentBudget';
import BuildToSellBudget from '@/features/budgets/components/BuildToSellBudget';
import { budgetTypes } from '@/features/budgets/components/BudgetModuleRouter';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('basic-info');
  const [expandedGroups, setExpandedGroups] = useState(['overview', 'acquisition', 'construction', 'finance', 'documents']);

  // Fetch project data from database
  const { project: rawProject, isLoading, error, refetch } = useProject(projectId);

  // Transform database project to display format
  const project = useMemo(() => {
    if (!rawProject) return null;

    // Map project_type to budgetType
    const budgetTypeMap = {
      'spec-build': 'spec-home',
      'lot-development': 'horizontal-lot',
      'build-to-rent': 'btr',
      'fix-flip': 'spec-home',
    };

    return {
      id: rawProject.id,
      name: rawProject.name || 'Unnamed Project',
      code: `PRJ-${rawProject.id?.slice(0, 3)?.toUpperCase() || '000'}`,
      status: rawProject.status || 'active',
      entity: rawProject.entity?.name || 'No Entity',
      type: PROJECT_TYPES.find(t => t.key === rawProject.project_type)?.label || rawProject.project_type || 'Unknown',
      budgetType: budgetTypeMap[rawProject.project_type] || 'spec-home',
      address: rawProject.address?.split(',')[0] || 'No address',
      city: rawProject.address?.split(',')[1]?.trim() || '',
      state: rawProject.address?.split(',')[2]?.trim()?.split(' ')[0] || 'SC',
      zip: rawProject.address?.split(',')[2]?.trim()?.split(' ')[1] || '',
      description: rawProject.notes || '',
      budget: parseFloat(rawProject.budget) || 0,
      spent: 0, // TODO: Calculate from transactions
      projectedSalePrice: (parseFloat(rawProject.budget) || 0) * 1.5, // Placeholder
      projectedProfit: (parseFloat(rawProject.budget) || 0) * 0.25, // Placeholder
      startDate: rawProject.start_date,
      targetCompletion: rawProject.target_completion_date,
    };
  }, [rawProject]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#047857]" />
        <span className="ml-2">Loading project...</span>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Building2 className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Project Not Found</h2>
        <p className="text-gray-500 mb-4">{error || 'The requested project could not be found.'}</p>
        <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  // Get budget component based on project type
  const getBudgetComponent = () => {
    switch (project.budgetType) {
      case 'spec-home':
        return <IndividualSpecHomeBudget />;
      case 'horizontal-lot':
        return <HorizontalLotDevelopmentBudget />;
      case 'btr':
        return <BuildToRentBudget />;
      case 'bts':
        return <BuildToSellBudget />;
      default:
        return <IndividualSpecHomeBudget />;
    }
  };

  // Get budget type info for display
  const budgetTypeInfo = budgetTypes.find(bt => bt.id === project.budgetType);

  const sidebarGroups = [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        { id: 'basic-info', label: 'Basic Info', icon: FileText },
        { id: 'property', label: 'Property Details', icon: MapPin },
        { id: 'contacts', label: 'Contacts', icon: Users },
        { id: 'project-settings', label: 'Project Settings', icon: Settings },
      ]
    },
    {
      id: 'acquisition',
      label: 'Acquisition',
      items: [
        { id: 'purchase-contract', label: 'Purchase Contract', icon: FileCheck },
        { id: 'due-diligence', label: 'Due Diligence', icon: ClipboardList },
        { id: 'closing', label: 'Closing', icon: Landmark },
      ]
    },
    {
      id: 'construction',
      label: 'Construction',
      items: [
        { id: 'budget', label: 'Budget', icon: Calculator },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'draws', label: 'Draw Requests', icon: Receipt },
        { id: 'change-orders', label: 'Change Orders', icon: FileCheck },
        { id: 'permits', label: 'Permits', icon: Shield },
        { id: 'bids', label: 'Bids', icon: Truck },
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      items: [
        { id: 'finance-summary', label: 'Summary', icon: PieChart },
        { id: 'pro-forma', label: 'Pro Forma', icon: FileText },
        { id: 'budget-vs-actual', label: 'Budget vs Actual', icon: TrendingUp },
        { id: 'expenses', label: 'Expenses', icon: CreditCard },
        { id: 'revenue', label: 'Revenue & Sales', icon: DollarSign },
        { id: 'loans', label: 'Loans', icon: Landmark },
        { id: 'draws-finance', label: 'Draw Schedule', icon: Receipt },
        { id: 'cash-flow', label: 'Cash Flow', icon: TrendingUp },
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      items: [
        { id: 'files', label: 'Files', icon: FolderOpen },
        { id: 'mailing', label: 'Mailing', icon: Mail },
        { id: 'communications', label: 'Communications', icon: MessageSquare },
      ]
    },
  ];

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'basic-info':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Project Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Project Name</p><p className="font-medium">{project.name}</p></div>
                  <div><p className="text-xs text-gray-500">Project Code</p><p className="font-medium">{project.code}</p></div>
                  <div><p className="text-xs text-gray-500">Entity</p><p className="font-medium">{project.entity}</p></div>
                  <div><p className="text-xs text-gray-500">Project Type</p><p className="font-medium">{project.type}</p></div>
                  <div><p className="text-xs text-gray-500">Status</p><p className="font-medium"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">{project.status}</span></p></div>
                  <div><p className="text-xs text-gray-500">Square Feet</p><p className="font-medium">{project.sqft}</p></div>
                </div>
                <div className="mt-4"><p className="text-xs text-gray-500">Description</p><p className="text-sm mt-1">{project.description}</p></div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Budget Configuration</h3>
                {budgetTypeInfo && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                    <div className={`w-10 h-10 ${budgetTypeInfo.color} rounded-lg flex items-center justify-center text-xl`}>
                      {budgetTypeInfo.icon}
                    </div>
                    <div>
                      <p className="font-medium">{budgetTypeInfo.name}</p>
                      <p className="text-xs text-gray-500">{budgetTypeInfo.description}</p>
                    </div>
                  </div>
                )}
                <Button variant="outline" className="w-full" onClick={() => setActiveSection('budget')}>
                  <Calculator className="w-4 h-4 mr-2" />Open Budget
                </Button>
              </div>
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="h-full">
            {getBudgetComponent()}
          </div>
        );

      case 'pro-forma':
        // Pro Forma syncs with budget data
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pro Forma Analysis</h2>
              <div className="flex gap-2">
                <Button variant="outline">Export</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setActiveSection('budget')}>
                  <Calculator className="w-4 h-4 mr-2" />Open Budget
                </Button>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Pro Forma data is synced from your project budget. 
                To update projections, modify values in the Budget tool.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-semibold">${project.budget.toLocaleString()}</p>
                <p className="text-xs text-gray-500">From Budget Tool</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Projected Sale</p>
                <p className="text-2xl font-semibold">${project.projectedSalePrice.toLocaleString()}</p>
                <p className="text-xs text-gray-500">From Budget Analysis</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Gross Profit</p>
                <p className="text-2xl font-semibold text-emerald-600">${project.projectedProfit.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Net of selling costs</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Gross Margin</p>
                <p className="text-2xl font-semibold text-emerald-600">{((project.projectedProfit / project.projectedSalePrice) * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Sources & Uses</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 pb-2 border-b">SOURCES</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Construction Loan (90% LTC)</span><span className="font-mono">${Math.round(project.budget * 0.9).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Equity Required (10%)</span><span className="font-mono">${Math.round(project.budget * 0.1).toLocaleString()}</span></div>
                    <div className="flex justify-between pt-2 border-t font-semibold"><span>Total Sources</span><span className="font-mono">${project.budget.toLocaleString()}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 pb-2 border-b">USES</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Hard Costs</span><span className="font-mono">${Math.round(project.budget * 0.75).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Soft Costs</span><span className="font-mono">${Math.round(project.budget * 0.10).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Financing</span><span className="font-mono">${Math.round(project.budget * 0.08).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Contingency</span><span className="font-mono">${Math.round(project.budget * 0.07).toLocaleString()}</span></div>
                    <div className="flex justify-between pt-2 border-t font-semibold"><span>Total Uses</span><span className="font-mono">${project.budget.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'finance-summary':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Financial Summary</h2>
              <Button variant="outline">Export Report</Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-semibold">${project.budget.toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-semibold">${project.spent.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{Math.round(project.spent / project.budget * 100)}% of budget</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-2xl font-semibold text-[#047857]">${(project.budget - project.spent).toLocaleString()}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Projected Profit</p>
                <p className="text-2xl font-semibold text-[#047857]">${project.projectedProfit.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{((project.projectedProfit / project.projectedSalePrice) * 100).toFixed(1)}% margin</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Quick Actions</h3>
              </div>
              <div className="flex gap-3">
                <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setActiveSection('budget')}>
                  <Calculator className="w-4 h-4 mr-2" />Open Full Budget
                </Button>
                <Button variant="outline" onClick={() => setActiveSection('pro-forma')}>
                  <FileText className="w-4 h-4 mr-2" />View Pro Forma
                </Button>
                <Button variant="outline" onClick={() => setActiveSection('budget-vs-actual')}>
                  <TrendingUp className="w-4 h-4 mr-2" />Budget vs Actual
                </Button>
              </div>
            </div>
          </div>
        );

      case 'budget-vs-actual':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Budget vs Actual</h2>
              <div className="flex gap-2">
                <Button variant="outline">Export</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setActiveSection('budget')}>
                  <Calculator className="w-4 h-4 mr-2" />Full Budget
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Data synced from your project budget. Updates made in the Budget tool will reflect here automatically.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4"><p className="text-sm text-gray-500">Total Budget</p><p className="text-2xl font-semibold">${project.budget.toLocaleString()}</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-sm text-gray-500">Actual Spent</p><p className="text-2xl font-semibold">${project.spent.toLocaleString()}</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-sm text-gray-500">Variance</p><p className="text-2xl font-semibold text-green-600">+$5,000</p><p className="text-xs text-green-600">Under budget</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-sm text-gray-500">Projected Final</p><p className="text-2xl font-semibold">$260,000</p></div>
            </div>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3 font-medium">Category</th><th className="text-right px-4 py-3 font-medium">Budget</th><th className="text-right px-4 py-3 font-medium">Actual</th><th className="text-right px-4 py-3 font-medium">Variance</th><th className="text-right px-4 py-3 font-medium">%</th></tr></thead>
                <tbody className="divide-y">
                  <tr><td className="px-4 py-3">Lot Acquisition</td><td className="px-4 py-3 text-right">$43,494</td><td className="px-4 py-3 text-right">$43,494</td><td className="px-4 py-3 text-right text-gray-500">$0</td><td className="px-4 py-3 text-right">100%</td></tr>
                  <tr><td className="px-4 py-3">Site Specific</td><td className="px-4 py-3 text-right">$13,375</td><td className="px-4 py-3 text-right">$12,500</td><td className="px-4 py-3 text-right text-green-600">+$875</td><td className="px-4 py-3 text-right">93%</td></tr>
                  <tr><td className="px-4 py-3">Vertical Construction</td><td className="px-4 py-3 text-right">$150,016</td><td className="px-4 py-3 text-right">$55,000</td><td className="px-4 py-3 text-right text-green-600">+$95,016</td><td className="px-4 py-3 text-right">37%</td></tr>
                  <tr><td className="px-4 py-3">Soft Costs</td><td className="px-4 py-3 text-right">$2,650</td><td className="px-4 py-3 text-right">$2,500</td><td className="px-4 py-3 text-right text-green-600">+$150</td><td className="px-4 py-3 text-right">94%</td></tr>
                  <tr><td className="px-4 py-3">Builder Profit</td><td className="px-4 py-3 text-right">$31,340</td><td className="px-4 py-3 text-right">$0</td><td className="px-4 py-3 text-right text-green-600">+$31,340</td><td className="px-4 py-3 text-right">0%</td></tr>
                  <tr><td className="px-4 py-3">Financing</td><td className="px-4 py-3 text-right">$11,185</td><td className="px-4 py-3 text-right">$6,506</td><td className="px-4 py-3 text-right text-green-600">+$4,679</td><td className="px-4 py-3 text-right">58%</td></tr>
                  <tr><td className="px-4 py-3">Contingency</td><td className="px-4 py-3 text-right">$5,000</td><td className="px-4 py-3 text-right">$5,000</td><td className="px-4 py-3 text-right text-gray-500">$0</td><td className="px-4 py-3 text-right">100%</td></tr>
                </tbody>
                <tfoot className="bg-gray-100 font-semibold"><tr><td className="px-4 py-3">TOTAL</td><td className="px-4 py-3 text-right">${project.budget.toLocaleString()}</td><td className="px-4 py-3 text-right">${project.spent.toLocaleString()}</td><td className="px-4 py-3 text-right text-green-600">+$5,000</td><td className="px-4 py-3 text-right">47%</td></tr></tfoot>
              </table>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Construction Schedule</h2><Button className="bg-[#047857] hover:bg-[#065f46] h-8 text-sm">Update Schedule</Button></div>
            <div className="bg-white border rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4"><div><p className="text-sm text-gray-500">Overall Progress</p><p className="text-2xl font-semibold">35% Complete</p></div><div className="text-right"><p className="text-sm text-gray-500">Est. Completion</p><p className="text-lg font-medium">May 2025</p></div></div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-[#047857] h-3 rounded-full" style={{ width: '35%' }}></div></div>
            </div>
            <div className="bg-white border rounded-lg">
              <table className="w-full text-sm"><thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3 font-medium">Phase</th><th className="text-left px-4 py-3 font-medium">Start</th><th className="text-left px-4 py-3 font-medium">End</th><th className="text-left px-4 py-3 font-medium">Status</th><th className="text-right px-4 py-3 font-medium">Progress</th></tr></thead>
                <tbody className="divide-y">
                  <tr><td className="px-4 py-3">Site Prep</td><td className="px-4 py-3">Dec 1</td><td className="px-4 py-3">Dec 10</td><td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Complete</span></td><td className="px-4 py-3 text-right">100%</td></tr>
                  <tr><td className="px-4 py-3">Foundation</td><td className="px-4 py-3">Dec 11</td><td className="px-4 py-3">Dec 20</td><td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Complete</span></td><td className="px-4 py-3 text-right">100%</td></tr>
                  <tr><td className="px-4 py-3">Framing</td><td className="px-4 py-3">Dec 21</td><td className="px-4 py-3">Jan 15</td><td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">In Progress</span></td><td className="px-4 py-3 text-right">40%</td></tr>
                  <tr><td className="px-4 py-3">MEP Rough</td><td className="px-4 py-3">Jan 16</td><td className="px-4 py-3">Feb 15</td><td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Pending</span></td><td className="px-4 py-3 text-right">0%</td></tr>
                  <tr><td className="px-4 py-3">Finishes</td><td className="px-4 py-3">Feb 16</td><td className="px-4 py-3">Apr 30</td><td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Pending</span></td><td className="px-4 py-3 text-right">0%</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'draws':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Draw Requests</h2><Button className="bg-[#047857] hover:bg-[#065f46] h-8 text-sm">New Draw Request</Button></div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4"><p className="text-sm text-gray-500">Total Drawn</p><p className="text-2xl font-semibold">$125,000</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-sm text-gray-500">Remaining</p><p className="text-2xl font-semibold text-[#047857]">$140,000</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-sm text-gray-500">Pending Draws</p><p className="text-2xl font-semibold">$35,000</p></div>
            </div>
            <div className="bg-white border rounded-lg">
              <table className="w-full text-sm"><thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3 font-medium">Draw #</th><th className="text-left px-4 py-3 font-medium">Date</th><th className="text-right px-4 py-3 font-medium">Amount</th><th className="text-left px-4 py-3 font-medium">Status</th></tr></thead>
                <tbody className="divide-y">
                  <tr><td className="px-4 py-3 font-medium">Draw #3</td><td className="px-4 py-3">Dec 20, 2024</td><td className="px-4 py-3 text-right">$35,000</td><td className="px-4 py-3"><span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded">Pending</span></td></tr>
                  <tr><td className="px-4 py-3 font-medium">Draw #2</td><td className="px-4 py-3">Dec 10, 2024</td><td className="px-4 py-3 text-right">$45,000</td><td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Funded</span></td></tr>
                  <tr><td className="px-4 py-3 font-medium">Draw #1</td><td className="px-4 py-3">Dec 1, 2024</td><td className="px-4 py-3 text-right">$45,000</td><td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Funded</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'contacts':
        return <ProjectContactsSection projectId={projectId} />;

      default:
        return (
          <div className="p-6">
            <div className="bg-white border rounded-lg p-12 text-center">
              <p className="text-gray-600 capitalize font-medium">{activeSection.replace(/-/g, ' ')}</p>
              <p className="text-gray-400 text-sm mt-2">Mock data interface - Real integration coming</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      <div className="w-56 bg-[#1e2a3a] flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-2 uppercase tracking-wide">
            <ArrowLeft className="w-3 h-3" /> Back to Projects
          </button>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-white font-semibold truncate">{project.name}</h2>
              <p className="text-gray-500 text-xs">{project.code} • {project.entity}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded">{project.status}</span>
            {budgetTypeInfo && (
              <span className="text-xs bg-gray-600 text-gray-200 px-2 py-0.5 rounded">{budgetTypeInfo.name}</span>
            )}
          </div>
        </div>
        
        <nav className="flex-1 p-2 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.id} className="mb-1">
              <button onClick={() => toggleGroup(group.id)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-white hover:bg-white/5 rounded">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {group.label}
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedGroups.includes(group.id) ? "" : "-rotate-90")} />
              </button>
              {expandedGroups.includes(group.id) && (
                <div className="ml-4 border-l border-gray-700 space-y-0.5">
                  {group.items.map((item) => (
                    <button key={item.id} onClick={() => setActiveSection(item.id)} className={cn("w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-r transition-colors", activeSection === item.id ? "bg-[#047857] text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
