// AtlasDev - Budget Module Router
// Central navigation component for all budget tools
// VanRock Holdings LLC

import React, { useState } from 'react';
import { HorizontalLotDevelopmentBudget } from './HorizontalLotDevelopmentBudget';
import { BuildToRentBudget } from './BuildToRentBudget';
import { BuildToSellBudget } from './BuildToSellBudget';
import { IndividualSpecHomeBudget } from './IndividualSpecHomeBudget';
import { PipelineDealAnalyzer } from './PipelineDealAnalyzer';
import { ConstructionBudgetTemplate } from './ConstructionBudgetTemplate';

// ============================================
// TYPES
// ============================================

type BudgetToolType = 
  | 'pipeline_analyzer'
  | 'spec_home'
  | 'construction_budget'
  | 'horizontal_lot'
  | 'build_to_rent'
  | 'build_to_sell'
  | null;

interface BudgetToolOption {
  id: BudgetToolType;
  name: string;
  description: string;
  module: 'Pipeline' | 'Construction';
  icon: string;
  color: string;
}

// ============================================
// TOOL OPTIONS
// ============================================

const budgetTools: BudgetToolOption[] = [
  {
    id: 'pipeline_analyzer',
    name: 'Deal Analyzer',
    description: 'Analyze potential deals with full proforma, ROI, and profit projections',
    module: 'Pipeline',
    icon: '📊',
    color: 'bg-slate-600',
  },
  {
    id: 'spec_home',
    name: 'Individual Spec Home',
    description: 'Single home construction budget with line-item costs and profit analysis',
    module: 'Construction',
    icon: '🏠',
    color: 'bg-emerald-600',
  },
  {
    id: 'construction_budget',
    name: 'Construction Budget (SOV)',
    description: 'Detailed construction budget with Schedule of Values draw system',
    module: 'Construction',
    icon: '🔨',
    color: 'bg-emerald-700',
  },
  {
    id: 'horizontal_lot',
    name: 'Horizontal Lot Development',
    description: '100-lot subdivision development budget with draw schedule',
    module: 'Construction',
    icon: '🗺️',
    color: 'bg-emerald-800',
  },
  {
    id: 'build_to_rent',
    name: 'Build to Rent Community',
    description: '100-home BTR community with unit mix and yield analysis',
    module: 'Construction',
    icon: '🏘️',
    color: 'bg-blue-700',
  },
  {
    id: 'build_to_sell',
    name: 'Build to Sell Community',
    description: '100-home for-sale community with product mix and absorption schedule',
    module: 'Construction',
    icon: '🏡',
    color: 'bg-purple-700',
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const BudgetModuleRouter: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<BudgetToolType>(null);

  // Render selected tool
  const renderTool = () => {
    switch (selectedTool) {
      case 'pipeline_analyzer':
        return <PipelineDealAnalyzer />;
      case 'spec_home':
        return <IndividualSpecHomeBudget />;
      case 'construction_budget':
        return <ConstructionBudgetTemplate />;
      case 'horizontal_lot':
        return <HorizontalLotDevelopmentBudget />;
      case 'build_to_rent':
        return <BuildToRentBudget />;
      case 'build_to_sell':
        return <BuildToSellBudget />;
      default:
        return null;
    }
  };

  // Show tool selector if no tool selected
  if (!selectedTool) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">AtlasDev Budget Tools</h1>
            <p className="text-slate-600">Select a budget tool to get started</p>
          </div>

          {/* Pipeline Module */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-500 rounded-full"></span>
              Pipeline Module
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgetTools
                .filter(tool => tool.module === 'Pipeline')
                .map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-slate-400 hover:shadow-lg transition-all group"
                  >
                    <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                      {tool.icon}
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">{tool.name}</h3>
                    <p className="text-sm text-slate-500">{tool.description}</p>
                  </button>
                ))}
            </div>
          </div>

          {/* Construction Module */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              Construction Module
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgetTools
                .filter(tool => tool.module === 'Construction')
                .map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-slate-400 hover:shadow-lg transition-all group"
                  >
                    <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                      {tool.icon}
                    </div>
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

  // Show selected tool with back button
  return (
    <div>
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setSelectedTool(null)}
          className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Budget Tools
        </button>
      </div>
      
      {/* Render Tool */}
      {renderTool()}
    </div>
  );
};

export default BudgetModuleRouter;
