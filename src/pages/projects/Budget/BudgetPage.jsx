// src/pages/projects/Budget/BudgetPage.jsx
// Main Budget Module container with tabs for Construction Budget, Project Budgets, and Profit Analysis

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, List, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProjectBudgets, useActiveBudget } from '@/hooks/useBudget';
import BudgetHeader from './BudgetHeader';
import BudgetLineItems from './BudgetLineItems';
import BudgetSummary from './BudgetSummary';
import BudgetVersionsList from './BudgetVersionsList';
import CreateBudgetModal from './CreateBudgetModal';
import ProfitAnalysis from './ProfitAnalysis';

const TABS = [
  { id: 'budget', label: 'Construction Budget', icon: FileText },
  { id: 'versions', label: 'Project Budgets', icon: List },
  { id: 'analysis', label: 'Profit Analysis', icon: TrendingUp },
];

const BudgetPage = ({ projectId: propProjectId }) => {
  const { projectId: paramProjectId } = useParams();
  const projectId = propProjectId || paramProjectId;

  const [activeTab, setActiveTab] = useState('budget');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { budgets, loading: budgetsLoading, refetch: refetchBudgets } = useProjectBudgets(projectId);
  const { budget: activeBudget, loading: activeBudgetLoading, refetch: refetchActive } = useActiveBudget(projectId);

  const handleBudgetCreated = () => {
    refetchBudgets();
    refetchActive();
    setShowCreateModal(false);
    setActiveTab('budget');
  };

  const handleActiveChanged = () => {
    refetchBudgets();
    refetchActive();
  };

  // Demo project info (in production, fetch from project data)
  const project = {
    id: projectId || 'demo-project-1',
    name: 'Highland Park Townhomes',
    property_address: '1250 Highland Park Drive',
    city: 'Charlotte',
    state: 'NC',
    zip_code: '28205',
    project_type: 'spec_home',
    purchase_price: 1200000,
    lot_count: 8,
  };

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-[#2F855A] text-[#2F855A]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'budget' && (
        <div>
          {activeBudgetLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
            </div>
          ) : activeBudget ? (
            <div className="space-y-6">
              <BudgetHeader
                budget={activeBudget}
                project={project}
                onBudgetUpdated={refetchActive}
              />
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <BudgetLineItems budgetId={activeBudget.id} budget={activeBudget} project={project} />
                </div>
                <div>
                  <BudgetSummary budgetId={activeBudget.id} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Budget</h3>
              <p className="text-sm text-gray-500 mb-6">Create a budget to start tracking costs for this project.</p>
              <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowCreateModal(true)}>
                Create First Budget
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'versions' && (
        <BudgetVersionsList
          projectId={projectId || 'demo-project-1'}
          budgets={budgets}
          activeBudgetId={activeBudget?.id}
          loading={budgetsLoading}
          onActiveChanged={handleActiveChanged}
          onCreateNew={() => setShowCreateModal(true)}
        />
      )}

      {activeTab === 'analysis' && (
        <ProfitAnalysis budget={activeBudget} project={project} />
      )}

      {/* Create Budget Modal */}
      <CreateBudgetModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={projectId || 'demo-project-1'}
        project={project}
        existingCount={budgets.length}
        onCreated={handleBudgetCreated}
      />
    </div>
  );
};

export default BudgetPage;
