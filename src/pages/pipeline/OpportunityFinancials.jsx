import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, TrendingUp, DollarSign, BarChart3, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AbbreviatedDealSheet, DealSheetVarianceTracker } from '@/components/dealsheets';

export default function OpportunityFinancials({ opportunity, onNavigateToDealAnalyzer }) {
  const navigate = useNavigate();
  const [showVarianceTracker, setShowVarianceTracker] = useState(false);

  // Determine the default deal type based on opportunity type
  const getDefaultDealType = () => {
    const oppType = opportunity?.property_type || opportunity?.opportunity_type;
    switch (oppType) {
      case 'vacant-lot':
      case 'scattered-lot':
        return 'scattered_lot';
      case 'development-btr':
        return 'build_to_rent';
      case 'development-lot-sale':
        return 'horizontal_development';
      case 'flip-property':
      case 'BRRR':
        return 'multifamily_acquisition';
      default:
        return 'scattered_lot';
    }
  };

  const handleSaveDealSheet = async (data) => {
    console.log('Deal sheet saved:', data);
    // Deal sheet is saved by the component itself
    // This callback can be used for additional actions like showing a toast
  };

  const handleCreateProject = (data) => {
    // Navigate to project creation with deal sheet data pre-populated
    const queryParams = new URLSearchParams({
      fromOpportunity: opportunity?.id,
      dealType: data.dealType,
      dealSheetId: data.dealSheetId || ''
    });

    // Could navigate to a project creation page with pre-filled data
    console.log('Create project from deal sheet:', data);
    // navigate(`/projects/new?${queryParams.toString()}`);

    // For now, show an alert
    alert('Project creation from deal sheet will navigate to project setup with pre-filled financial data.');
  };

  // Check if opportunity has been converted to a project
  const hasProject = opportunity?.project_id || false;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Financial Analysis</h2>
          <p className="text-sm text-gray-500">
            Quick deal evaluation and variance tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasProject && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVarianceTracker(!showVarianceTracker)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showVarianceTracker ? 'Hide' : 'Show'} Variance
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToDealAnalyzer}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Legacy Analyzer
          </Button>
        </div>
      </div>

      {/* Quick Stats from Opportunity */}
      {opportunity && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <DollarSign className="w-4 h-4" />
              Asking Price
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {opportunity.asking_price
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(opportunity.asking_price)
                : '-'
              }
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              Estimated Value
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {opportunity.estimated_value
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(opportunity.estimated_value)
                : '-'
              }
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Calculator className="w-4 h-4" />
              Assignment Fee
            </div>
            <p className="text-xl font-semibold text-green-600">
              {opportunity.assignment_fee
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(opportunity.assignment_fee)
                : '-'
              }
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <BarChart3 className="w-4 h-4" />
              Property Type
            </div>
            <p className="text-xl font-semibold text-gray-900 capitalize">
              {(opportunity.property_type || opportunity.opportunity_type || '-').replace(/-/g, ' ')}
            </p>
          </div>
        </div>
      )}

      {/* Variance Tracker (if project exists) */}
      {showVarianceTracker && hasProject && (
        <DealSheetVarianceTracker
          opportunityId={opportunity?.id}
          projectId={opportunity?.project_id}
          showActuals={true}
        />
      )}

      {/* Abbreviated Deal Sheet */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Abbreviated Deal Sheet</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Quick Analysis</span>
        </div>

        <AbbreviatedDealSheet
          opportunityId={opportunity?.id}
          opportunityType={getDefaultDealType()}
          onSave={handleSaveDealSheet}
          onCreateProject={handleCreateProject}
        />
      </div>

      {/* Conversion Guidance */}
      {!hasProject && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Ready to Convert to Project?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Once you've completed your deal sheet analysis and the deal passes your thresholds,
                click "Create Project" to convert this opportunity into a full project. The deal sheet
                data will pre-populate your pro forma, and you'll be able to track variance between
                your initial estimates and actual costs throughout the project lifecycle.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* If already converted to project */}
      {hasProject && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Converted to Project</h4>
                <p className="text-sm text-green-700 mt-1">
                  This opportunity has been converted to a project. Use the variance tracker above to
                  monitor how actuals compare to your original deal sheet estimates.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => navigate(`/project/${opportunity.project_id}`)}
            >
              View Project
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
