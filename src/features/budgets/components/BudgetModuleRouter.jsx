// AtlasDev - Budget Module Router
import React, { useState } from 'react';
import IndividualSpecHomeBudget from './IndividualSpecHomeBudget';
import HorizontalLotDevelopmentBudget from './HorizontalLotDevelopmentBudget';
import BuildToRentBudget from './BuildToRentBudget';
import BuildToSellBudget from './BuildToSellBudget';
import PipelineDealAnalyzer from './PipelineDealAnalyzer';

export const budgetTypes = [
  { 
    id: 'spec-home', 
    name: 'Individual Spec Home', 
    description: 'Single home construction budget with line-item costs and profit analysis', 
    category: 'Construction',
    icon: '🏠', 
    color: 'bg-emerald-600',
    component: IndividualSpecHomeBudget 
  },
  { 
    id: 'horizontal-lot', 
    name: 'Horizontal Lot Development', 
    description: 'Subdivision/land development with infrastructure and lot sales', 
    category: 'Land Development',
    icon: '🗺️', 
    color: 'bg-blue-600',
    component: HorizontalLotDevelopmentBudget 
  },
  { 
    id: 'btr', 
    name: 'Build to Rent', 
    description: 'Rental community development with NOI and yield analysis', 
    category: 'Multifamily',
    icon: '🏘️', 
    color: 'bg-purple-600',
    component: BuildToRentBudget 
  },
  { 
    id: 'bts', 
    name: 'Build to Sell', 
    description: 'Multi-home spec community with absorption and profit tracking', 
    category: 'Construction',
    icon: '🏗️', 
    color: 'bg-amber-600',
    component: BuildToSellBudget 
  },
];

export const getBudgetComponent = (budgetTypeId) => {
  const budgetType = budgetTypes.find(bt => bt.id === budgetTypeId);
  return budgetType?.component || IndividualSpecHomeBudget;
};

export const BudgetModuleRouter = () => {
  const [selectedTool, setSelectedTool] = useState(null);

  const renderTool = () => {
    const budgetType = budgetTypes.find(bt => bt.id === selectedTool);
    if (budgetType) {
      const BudgetComponent = budgetType.component;
      return <BudgetComponent />;
    }
    if (selectedTool === 'pipeline_analyzer') {
      return <PipelineDealAnalyzer />;
    }
    return null;
  };

  if (!selectedTool) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">AtlasDev Budget Tools</h1>
            <p className="text-slate-600">Select a budget tool to get started</p>
          </div>

          {/* Pipeline Tools */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-500 rounded-full"></span>
              Pipeline Module
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setSelectedTool('pipeline_analyzer')}
                className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-slate-400 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                <h3 className="font-semibold text-slate-800 mb-2">Deal Analyzer</h3>
                <p className="text-sm text-slate-500">Analyze potential deals with full proforma, ROI, and profit projections</p>
              </button>
            </div>
          </div>

          {/* Construction Budgets */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              Construction Budgets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetTypes.filter(bt => bt.category === 'Construction').map(tool => (
                <button key={tool.id} onClick={() => setSelectedTool(tool.id)}
                  className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-slate-400 hover:shadow-lg transition-all group">
                  <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>{tool.icon}</div>
                  <h3 className="font-semibold text-slate-800 mb-2">{tool.name}</h3>
                  <p className="text-sm text-slate-500">{tool.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Land Development */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Land Development
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetTypes.filter(bt => bt.category === 'Land Development').map(tool => (
                <button key={tool.id} onClick={() => setSelectedTool(tool.id)}
                  className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-slate-400 hover:shadow-lg transition-all group">
                  <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>{tool.icon}</div>
                  <h3 className="font-semibold text-slate-800 mb-2">{tool.name}</h3>
                  <p className="text-sm text-slate-500">{tool.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Multifamily */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              Multifamily / BTR
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetTypes.filter(bt => bt.category === 'Multifamily').map(tool => (
                <button key={tool.id} onClick={() => setSelectedTool(tool.id)}
                  className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-slate-400 hover:shadow-lg transition-all group">
                  <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>{tool.icon}</div>
                  <h3 className="font-semibold text-slate-800 mb-2">{tool.name}</h3>
                  <p className="text-sm text-slate-500">{tool.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed top-16 left-4 z-40">
        <button onClick={() => setSelectedTool(null)}
          className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Budget Tools
        </button>
      </div>
      {renderTool()}
    </div>
  );
};

export default BudgetModuleRouter;
