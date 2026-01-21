import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, ChevronDown, FileText, Building2, Users, DollarSign, FolderOpen,
  ClipboardList, MapPin, Calculator, TrendingUp, Target, ArrowRight, Mail, MessageSquare,
  FileSignature, CheckCircle, Send, FileCheck, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOpportunity, OPPORTUNITY_STAGES } from '@/hooks/useOpportunities';

// Import Deal Analyzer
import PipelineDealAnalyzer from '@/features/budgets/components/PipelineDealAnalyzer';

// Import Pipeline Page Components
import OpportunityOverview from '@/pages/pipeline/OpportunityOverview';
import OpportunityStageTracker from '@/pages/pipeline/OpportunityStageTracker';
import OpportunityContacts from '@/pages/pipeline/OpportunityContacts';
import OpportunityTasks from '@/pages/pipeline/OpportunityTasks';
import OpportunityPropertyDetails from '@/pages/pipeline/OpportunityPropertyDetails';
import OpportunityComparables from '@/pages/pipeline/OpportunityComparables';
import OpportunityFiles from '@/pages/pipeline/OpportunityFiles';

const OpportunityDetailPage = () => {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedGroups, setExpandedGroups] = useState(['overview', 'stage-tracker', 'documents']);

  // Fetch opportunity from database
  const { opportunity: rawOpportunity, isLoading, error, refetch } = useOpportunity(opportunityId);

  // Updated stages per requirements
  const stages = [
    { id: 'Prospecting', label: 'Prospecting', color: '#6B7280', description: 'Initial contact, sending letters/communications' },
    { id: 'Contacted', label: 'Contacted', color: '#3B82F6', description: 'Seller responded, analyzing property' },
    { id: 'Qualified', label: 'Qualified', color: '#F59E0B', description: 'Deal analyzed, preparing contract' },
    { id: 'Negotiating', label: 'Negotiating', color: '#8B5CF6', description: 'Contract generation and e-sign' },
    { id: 'Under Contract', label: 'Under Contract', color: '#10B981', description: 'Signed contract, ready to convert' },
  ];

  // Opportunity types matching project types
  const opportunityTypes = {
    'lot-dev': 'Lot Development',
    'for-sale-dev': 'For Sale Development',
    'btr-dev': 'BTR Development',
    'for-sale-lot': 'For Sale Lot Purchase',
    'btr-lot': 'BTR Lot Purchase',
    'fix-flip': 'Fix and Flip',
    'brrr': 'BRRR',
    'vacant-lot': 'Vacant Lot',
    'flip-property': 'Flip Property',
    'development-lot-sale': 'Development Lot Sale',
    'development-for-sale': 'Development For Sale',
    'development-btr': 'Development BTR',
    'scattered-lot': 'Scattered Lot',
  };

  // Transform database opportunity to display format
  const opportunity = useMemo(() => {
    if (!rawOpportunity) return null;

    return {
      id: rawOpportunity.id,
      name: rawOpportunity.deal_number || 'Unnamed Deal',
      type: rawOpportunity.opportunity_type || rawOpportunity.property_type || 'vacant-lot',
      stage: rawOpportunity.stage || 'Prospecting',
      address: rawOpportunity.address || 'No address',
      city: rawOpportunity.city || '',
      state: rawOpportunity.state || 'SC',
      zip: rawOpportunity.zip_code || '',
      askingPrice: rawOpportunity.asking_price || rawOpportunity.estimated_value || 0,
      estimatedValue: rawOpportunity.estimated_value || 0,
      seller: {
        name: rawOpportunity.seller_name || '',
        email: rawOpportunity.seller_email || '',
        phone: rawOpportunity.seller_phone || '',
      },
      notes: rawOpportunity.notes || '',
      team: rawOpportunity.assigned_to || 'Unassigned',
      raw: rawOpportunity,
    };
  }, [rawOpportunity]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#047857]" />
        <span className="ml-2">Loading opportunity...</span>
      </div>
    );
  }

  // Error state
  if (error || !opportunity) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Building2 className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Opportunity Not Found</h2>
        <p className="text-gray-500 mb-4">{error || 'The requested opportunity could not be found.'}</p>
        <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
      </div>
    );
  }

  const sidebarGroups = [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'tasks', label: 'Tasks & Checklist', icon: ClipboardList },
        { id: 'property-details', label: 'Property Details', icon: MapPin },
        { id: 'contacts', label: 'Contacts', icon: Users },
        { id: 'comps', label: 'Comps', icon: TrendingUp },
        { id: 'deal-analyzer', label: 'Deal Analyzer', icon: Calculator },
      ]
    },
    {
      id: 'stage-tracker',
      label: 'Stage Tracker',
      items: [
        { id: 'stage-prospecting', label: 'Prospecting', icon: Target },
        { id: 'stage-contacted', label: 'Contacted', icon: MessageSquare },
        { id: 'stage-qualified', label: 'Qualified', icon: CheckCircle },
        { id: 'stage-negotiating', label: 'Negotiating', icon: FileSignature },
        { id: 'stage-under-contract', label: 'Under Contract', icon: FileCheck },
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      items: [
        { id: 'files', label: 'Files', icon: FolderOpen },
        { id: 'mailing', label: 'Mailing', icon: Mail },
        { id: 'communications', label: 'Communications', icon: MessageSquare },
        { id: 'esigned', label: 'E-Signed Documents', icon: FileSignature },
      ]
    },
  ];

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
    );
  };

  const handleConvertToProject = () => {
    // In a real app, this would create the project and redirect
    alert('Converting opportunity to project...');
    navigate('/projects');
  };

  const renderStageContent = (stageId) => {
    const stageInfo = {
      'stage-prospecting': {
        title: 'Prospecting Stage',
        description: 'Property information and outreach tracking. Seller has not yet responded.',
        nextSteps: [
          'Send initial contact letter or postcard',
          'Record all outreach attempts',
          'Update property information as available',
          'Track response to marketing efforts'
        ],
        tools: ['Direct Mail Tracking', 'Call Log', 'Property Research']
      },
      'stage-contacted': {
        title: 'Contacted Stage',
        description: 'Seller has responded. Update information and begin property analysis.',
        nextSteps: [
          'Gather detailed seller information',
          'Request property documents',
          'Conduct initial property analysis',
          'Determine deal type and potential'
        ],
        tools: ['Property Details Form', 'Document Upload', 'Initial Analysis']
      },
      'stage-qualified': {
        title: 'Qualified Stage',
        description: 'Deal analyzed and seller is qualified. Prepare contract terms.',
        nextSteps: [
          'Select comparable properties',
          'Finalize deal type and structure',
          'Prepare contract terms and conditions',
          'Set purchase price and earnest money'
        ],
        tools: ['Comp Selection', 'Deal Analyzer', 'Contract Preparation']
      },
      'stage-negotiating': {
        title: 'Negotiating Stage',
        description: 'Generate and send contract for signatures.',
        nextSteps: [
          'Complete contract form with all terms',
          'Generate contract from template',
          'Send for e-signature to seller and buyer',
          'Track signature status'
        ],
        tools: ['Contract Generator', 'E-Sign Integration', 'Negotiation Notes']
      },
      'stage-under-contract': {
        title: 'Under Contract Stage',
        description: 'Contract signed. Ready to convert to project.',
        nextSteps: [
          'Verify signed contract is uploaded',
          'Review all due diligence items',
          'Prepare for closing',
          'Convert to Project when ready'
        ],
        tools: ['Contract Verification', 'Due Diligence Checklist', 'Convert to Project']
      },
    };

    const stage = stageInfo[stageId];
    if (!stage) return null;

    return (
      <div className="p-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">{stage.title}</h2>
          <p className="text-gray-600 mb-6">{stage.description}</p>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#047857]" />
                Next Steps
              </h3>
              <ul className="space-y-2">
                {stage.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-gray-500">{idx + 1}</span>
                    </div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#047857]" />
                Available Tools
              </h3>
              <div className="space-y-2">
                {stage.tools.map((tool, idx) => (
                  <Button key={idx} variant="outline" className="w-full justify-start text-sm">
                    {tool}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {stageId === 'stage-negotiating' && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3">Contract Generation</h3>
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Generate a contract based on the deal type and send for e-signature.
                </p>
                <div className="flex gap-3">
                  <Button className="bg-[#047857] hover:bg-[#065f46]">
                    <FileSignature className="w-4 h-4 mr-2" />
                    Generate Contract
                  </Button>
                  <Button variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    Send for E-Sign
                  </Button>
                </div>
              </div>
            </div>
          )}

          {stageId === 'stage-under-contract' && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3">Convert to Project</h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  This opportunity is under contract and ready to be converted to a project.
                  All data will be transferred to the new project record.
                </p>
                <Button 
                  onClick={handleConvertToProject}
                  className="bg-[#047857] hover:bg-[#065f46]"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Convert to Project
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Handle stage tracker pages
    if (activeSection.startsWith('stage-')) {
      return renderStageContent(activeSection);
    }

    switch (activeSection) {
      case 'overview':
        return <OpportunityOverview opportunity={opportunity} opportunityTypes={opportunityTypes} />;
      
      case 'deal-analyzer':
        return (
          <div className="h-full">
            <PipelineDealAnalyzer />
          </div>
        );
      
      case 'tasks':
        return <OpportunityTasks opportunity={opportunity} />;
      
      case 'property-details':
        return <OpportunityPropertyDetails opportunity={opportunity} />;
      
      case 'contacts':
        return <OpportunityContacts opportunity={opportunity} />;
      
      case 'comps':
        return <OpportunityComparables opportunity={opportunity} />;
      
      case 'files':
        return <OpportunityFiles />;
      
      case 'mailing':
      case 'communications':
      case 'esigned':
        return (
          <div className="p-6">
            <div className="bg-white border rounded-lg p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 capitalize font-medium">{activeSection.replace('-', ' ')}</p>
              <p className="text-gray-400 text-sm mt-2">Document management interface coming soon</p>
              <p className="text-gray-400 text-xs mt-1">SharePoint integration will be available here</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="bg-white border rounded-lg p-12 text-center">
              <p className="text-gray-600 capitalize font-medium">{activeSection.replace('-', ' ')}</p>
              <p className="text-gray-400 text-sm mt-2">Content coming soon</p>
            </div>
          </div>
        );
    }
  };

  const currentStage = stages.find(s => s.id === opportunity.stage);

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      {/* Dark Sidebar */}
      <div className="w-52 bg-[#1e2a3a] flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <button onClick={() => navigate('/opportunities')} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Pipeline
          </button>
          <h2 className="text-white font-semibold truncate text-sm">{opportunity.name}</h2>
          <p className="text-gray-500 text-xs mt-1">{opportunityTypes[opportunity.type]}</p>
          <p className="text-gray-500 text-xs">{opportunity.acres} acres • {opportunity.team}</p>
        </div>
        
        <nav className="flex-1 p-2 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.id} className="mb-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-400 hover:text-white"
              >
                {group.label}
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedGroups.includes(group.id) ? "" : "-rotate-90")} />
              </button>
              {expandedGroups.includes(group.id) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors",
                          activeSection === item.id 
                            ? "bg-white/10 text-white" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <IconComponent className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Stage Progress */}
        <div className="p-3 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Current Stage</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentStage?.color }} />
            <span className="text-white text-sm font-medium">{currentStage?.label}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#047857]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{opportunity.name}</h1>
                <span className="text-xs px-2 py-1 rounded font-medium" style={{ backgroundColor: currentStage?.color + '20', color: currentStage?.color }}>
                  {currentStage?.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{opportunity.address}, {opportunity.city}, {opportunity.state} {opportunity.zip}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
            {opportunity.stage === 'Under Contract' ? (
              <Button onClick={handleConvertToProject} className="bg-[#047857] hover:bg-[#065f46]">
                <ArrowRight className="w-4 h-4 mr-1" />Convert to Project
              </Button>
            ) : (
              <Button className="bg-[#047857] hover:bg-[#065f46]">Advance Stage</Button>
            )}
          </div>
        </div>

        {/* Stage Progress Bar */}
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center gap-2">
            {stages.map((stage, idx) => {
              const isCurrent = stage.id === opportunity.stage;
              const isPast = stages.findIndex(s => s.id === opportunity.stage) > idx;
              return (
                <React.Fragment key={stage.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                        isCurrent ? "ring-2 ring-offset-2" : "",
                        isPast || isCurrent ? "text-white" : "bg-gray-200 text-gray-500"
                      )}
                      style={{ 
                        backgroundColor: isPast || isCurrent ? stage.color : undefined,
                        ringColor: isCurrent ? stage.color : undefined 
                      }}
                    >
                      {isPast ? '✓' : idx + 1}
                    </div>
                    <span className={cn("text-xs font-medium", isCurrent ? "text-gray-900" : "text-gray-500")}>
                      {stage.label}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className={cn("flex-1 h-1 rounded", isPast ? "bg-[#047857]" : "bg-gray-200")} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default OpportunityDetailPage;
