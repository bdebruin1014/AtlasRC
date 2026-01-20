import React, { useState } from 'react';
import { Plus, Edit2, X, FileText, CheckCircle, Clock, Users, ChevronDown, ChevronRight, Zap, Settings, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EOSProcesses = ({ program }) => {
  const [showNewProcessModal, setShowNewProcessModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [expandedProcess, setExpandedProcess] = useState(null);

  const [processes, setProcesses] = useState([
    {
      id: 1,
      name: 'Project Development Process',
      owner: 'Bryan VanRock',
      status: 'documented',
      lastUpdated: '2024-11-15',
      category: 'Operations',
      steps: [
        { step: 1, name: 'Site Selection', description: 'Identify and evaluate potential development sites' },
        { step: 2, name: 'Due Diligence', description: 'Complete feasibility studies, surveys, environmental' },
        { step: 3, name: 'Deal Analysis', description: 'Run proforma, determine pricing, negotiate terms' },
        { step: 4, name: 'Contract & Close', description: 'Execute purchase agreement, complete closing' },
        { step: 5, name: 'Entitlements', description: 'Secure zoning, permits, approvals' },
        { step: 6, name: 'Construction', description: 'Build according to plans and specs' },
        { step: 7, name: 'Sales & Marketing', description: 'Market units, manage sales process' },
        { step: 8, name: 'Closeout', description: 'Complete project, deliver to buyers' },
      ],
    },
    {
      id: 2,
      name: 'Construction Management Process',
      owner: 'Mike Johnson',
      status: 'documented',
      lastUpdated: '2024-10-20',
      category: 'Construction',
      steps: [
        { step: 1, name: 'Pre-Construction', description: 'Plans review, budgeting, scheduling' },
        { step: 2, name: 'Permitting', description: 'Submit and obtain building permits' },
        { step: 3, name: 'Site Prep', description: 'Clear, grade, utilities' },
        { step: 4, name: 'Foundation', description: 'Footings, foundation, slab' },
        { step: 5, name: 'Framing', description: 'Structure, roof, windows' },
        { step: 6, name: 'MEP Rough', description: 'Mechanical, electrical, plumbing rough-in' },
        { step: 7, name: 'Finishes', description: 'Drywall, paint, flooring, fixtures' },
        { step: 8, name: 'Final/Punch', description: 'Inspections, punch list, CO' },
      ],
    },
    {
      id: 3,
      name: 'Sales Process',
      owner: 'Sarah Mitchell',
      status: 'documented',
      lastUpdated: '2024-09-15',
      category: 'Sales',
      steps: [
        { step: 1, name: 'Lead Capture', description: 'Receive and log new leads' },
        { step: 2, name: 'Qualification', description: 'Assess buyer readiness and fit' },
        { step: 3, name: 'Showing', description: 'Tour property, answer questions' },
        { step: 4, name: 'Offer', description: 'Receive and present offer' },
        { step: 5, name: 'Negotiation', description: 'Counter, terms discussion' },
        { step: 6, name: 'Contract', description: 'Execute purchase agreement' },
        { step: 7, name: 'Closing Prep', description: 'Coordinate inspections, financing, title' },
        { step: 8, name: 'Closing', description: 'Close transaction, hand over keys' },
      ],
    },
    {
      id: 4,
      name: 'Investor Relations Process',
      owner: 'Bryan VanRock',
      status: 'in-progress',
      lastUpdated: '2024-12-01',
      category: 'Finance',
      steps: [
        { step: 1, name: 'Investor Onboarding', description: 'Introduce, documents, funding' },
        { step: 2, name: 'Monthly Updates', description: 'Progress reports, photos' },
        { step: 3, name: 'Quarterly Reports', description: 'Financial statements, distributions' },
        { step: 4, name: 'K-1 Distribution', description: 'Annual tax documents' },
        { step: 5, name: 'Exit/Distribution', description: 'Final accounting, capital return' },
      ],
    },
    {
      id: 5,
      name: 'Vendor Qualification Process',
      owner: 'Tom Wilson',
      status: 'needs-documentation',
      lastUpdated: null,
      category: 'Operations',
      steps: [],
    },
    {
      id: 6,
      name: 'Hiring Process',
      owner: 'Sarah Mitchell',
      status: 'needs-documentation',
      lastUpdated: null,
      category: 'HR',
      steps: [],
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'documented': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'needs-documentation': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const documentedCount = processes.filter(p => p.status === 'documented').length;
  const inProgressCount = processes.filter(p => p.status === 'in-progress').length;
  const needsDocCount = processes.filter(p => p.status === 'needs-documentation').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Core Processes</h1>
          <p className="text-sm text-gray-500">Document the 6-10 core processes that run your business</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowNewProcessModal(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Process
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{processes.length}</p>
          <p className="text-sm text-gray-500">Total Processes</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-2xl font-bold text-green-600">{documentedCount}</p>
          <p className="text-sm text-gray-500">Documented</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-2xl font-bold text-amber-600">{needsDocCount}</p>
          <p className="text-sm text-gray-500">Needs Documentation</p>
        </div>
      </div>

      {/* Documentation Tip */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">20/80 Rule</p>
            <p className="text-sm text-blue-700">
              Document your processes at the 20% level - just the major steps. 
              This captures 80% of the value while keeping processes simple and followable.
            </p>
          </div>
        </div>
      </div>

      {/* Processes List */}
      <div className="space-y-4">
        {processes.map((process) => (
          <div key={process.id} className="bg-white border rounded-lg overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedProcess(expandedProcess === process.id ? null : process.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {expandedProcess === process.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-semibold">{process.name}</h3>
                    <p className="text-sm text-gray-500">
                      {process.owner} • {process.category} • {process.steps.length} steps
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {process.lastUpdated && (
                    <span className="text-xs text-gray-400">Updated {process.lastUpdated}</span>
                  )}
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(process.status))}>
                    {process.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {expandedProcess === process.id && (
              <div className="border-t bg-gray-50 p-4">
                {process.steps.length > 0 ? (
                  <div className="space-y-3">
                    {process.steps.map((step) => (
                      <div key={step.step} className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-[#047857] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {step.step}
                        </span>
                        <div className="flex-1 bg-white rounded-lg p-3">
                          <p className="font-medium">{step.name}</p>
                          <p className="text-sm text-gray-500">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>This process needs documentation</p>
                    <Button size="sm" className="mt-3 bg-[#047857] hover:bg-[#065f46]">
                      <Plus className="w-4 h-4 mr-1" />Add Steps
                    </Button>
                  </div>
                )}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
                  <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Process Modal */}
      {showNewProcessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Add Core Process</h3>
              <button onClick={() => setShowNewProcessModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Process Name *</label>
                <Input placeholder="e.g., Sales Process, Hiring Process" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Owner *</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option>Select owner...</option>
                    <option>Bryan VanRock</option>
                    <option>Sarah Mitchell</option>
                    <option>Mike Johnson</option>
                    <option>Lisa Chen</option>
                    <option>Tom Wilson</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option>Operations</option>
                    <option>Sales</option>
                    <option>Finance</option>
                    <option>Construction</option>
                    <option>HR</option>
                    <option>Marketing</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowNewProcessModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Add Process</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EOSProcesses;
