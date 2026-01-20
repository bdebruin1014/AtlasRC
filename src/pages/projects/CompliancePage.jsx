import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Download, Calendar, CheckCircle, Circle, Clock, AlertTriangle, Shield, FileText, Upload, RefreshCw, Building2, ClipboardCheck, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const CompliancePage = ({ projectId }) => {
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [activeTab, setActiveTab] = useState('requirements'); // 'requirements', 'filings', 'deadlines'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [requirements, setRequirements] = useState([
    // Environmental
    { id: 'COMP-001', category: 'Environmental', name: 'Stormwater Pollution Prevention Plan (SWPPP)', status: 'compliant', dueDate: null, lastUpdated: '2024-03-01', renewalDate: null, agency: 'SC DHEC', documents: ['SWPPP_Plan.pdf'], notes: 'Active throughout construction', inspector: 'Environmental Services Inc' },
    { id: 'COMP-002', category: 'Environmental', name: 'NPDES Permit', status: 'compliant', dueDate: null, lastUpdated: '2024-02-15', renewalDate: '2025-02-15', agency: 'SC DHEC', documents: ['NPDES_Permit.pdf'], notes: 'Renewal due annually', inspector: null },
    { id: 'COMP-003', category: 'Environmental', name: 'Erosion Control Inspection', status: 'compliant', dueDate: null, lastUpdated: '2024-12-20', renewalDate: null, agency: 'SC DHEC', documents: ['Erosion_Inspection_12-20.pdf'], notes: 'Weekly inspections required', inspector: 'Environmental Services Inc' },
    
    // Building & Safety
    { id: 'COMP-004', category: 'Building & Safety', name: 'Building Permit', status: 'compliant', dueDate: null, lastUpdated: '2024-03-15', renewalDate: null, agency: 'Greenville County', documents: ['Building_Permit.pdf'], notes: 'BP-2024-45678', inspector: 'County Building Dept' },
    { id: 'COMP-005', category: 'Building & Safety', name: 'OSHA Safety Compliance', status: 'compliant', dueDate: null, lastUpdated: '2024-12-15', renewalDate: null, agency: 'OSHA', documents: ['Safety_Audit_12-15.pdf'], notes: 'Monthly safety audits', inspector: 'Johnson Construction' },
    { id: 'COMP-006', category: 'Building & Safety', name: 'Fire Safety Plan', status: 'compliant', dueDate: null, lastUpdated: '2024-03-10', renewalDate: null, agency: 'Greenville Fire Dept', documents: ['Fire_Safety_Plan.pdf'], notes: 'Approved with building permit', inspector: null },
    
    // Financial & Reporting
    { id: 'COMP-007', category: 'Financial', name: 'Quarterly Investor Reports', status: 'action-needed', dueDate: '2024-12-31', lastUpdated: '2024-09-30', renewalDate: null, agency: 'Internal', documents: ['Q3_Report.pdf'], notes: 'Q4 report due', inspector: null },
    { id: 'COMP-008', category: 'Financial', name: 'Bank Covenant Compliance', status: 'compliant', dueDate: null, lastUpdated: '2024-12-15', renewalDate: null, agency: 'First National Bank', documents: ['Covenant_Cert_Q4.pdf'], notes: 'Quarterly certification', inspector: null },
    { id: 'COMP-009', category: 'Financial', name: 'Property Tax Filing', status: 'compliant', dueDate: null, lastUpdated: '2024-01-15', renewalDate: '2025-01-15', agency: 'Greenville County', documents: ['Tax_Receipt_2024.pdf'], notes: '2024 taxes paid', inspector: null },
    
    // Entity & Legal
    { id: 'COMP-010', category: 'Legal', name: 'LLC Annual Report', status: 'action-needed', dueDate: '2025-01-15', lastUpdated: '2024-01-10', renewalDate: '2025-01-15', agency: 'SC Secretary of State', documents: ['Annual_Report_2024.pdf'], notes: 'Oakridge Estates LLC', inspector: null },
    { id: 'COMP-011', category: 'Legal', name: 'Registered Agent', status: 'compliant', dueDate: null, lastUpdated: '2024-01-01', renewalDate: '2025-01-01', agency: 'SC Secretary of State', documents: [], notes: 'VanRock Holdings as RA', inspector: null },
    { id: 'COMP-012', category: 'Legal', name: 'Business License', status: 'expiring-soon', dueDate: '2025-01-31', lastUpdated: '2024-02-01', renewalDate: '2025-01-31', agency: 'City of Greenville', documents: ['Business_License_2024.pdf'], notes: 'Renewal application submitted', inspector: null },
    
    // Insurance
    { id: 'COMP-013', category: 'Insurance', name: 'Builder Risk Insurance', status: 'compliant', dueDate: null, lastUpdated: '2024-03-01', renewalDate: '2025-03-01', agency: 'Hartford Insurance', documents: ['Builder_Risk_COI.pdf'], notes: '$8.5M coverage', inspector: null },
    { id: 'COMP-014', category: 'Insurance', name: 'General Liability Insurance', status: 'expiring-soon', dueDate: '2025-01-01', lastUpdated: '2024-01-01', renewalDate: '2025-01-01', agency: 'Travelers Insurance', documents: ['GL_Policy.pdf'], notes: 'Renewal in process', inspector: null },
    { id: 'COMP-015', category: 'Insurance', name: 'Workers Compensation', status: 'expiring-soon', dueDate: '2025-01-01', lastUpdated: '2024-01-01', renewalDate: '2025-01-01', agency: 'State Farm', documents: ['WC_Policy.pdf'], notes: 'Renewal in process', inspector: null },
  ]);

  const filings = [
    { id: 'FILE-001', name: 'Q4 2024 Investor Report', type: 'Quarterly Report', dueDate: '2024-12-31', status: 'pending', agency: 'Investors' },
    { id: 'FILE-002', name: '2024 K-1 Preparation', type: 'Tax Document', dueDate: '2025-03-15', status: 'not-started', agency: 'IRS' },
    { id: 'FILE-003', name: 'LLC Annual Report - Oakridge Estates', type: 'Annual Filing', dueDate: '2025-01-15', status: 'pending', agency: 'SC SOS' },
    { id: 'FILE-004', name: 'Property Tax Return 2025', type: 'Tax Filing', dueDate: '2025-01-15', status: 'not-started', agency: 'Greenville County' },
    { id: 'FILE-005', name: 'NPDES Permit Renewal', type: 'Permit Renewal', dueDate: '2025-02-15', status: 'not-started', agency: 'SC DHEC' },
  ];

  const categories = ['Environmental', 'Building & Safety', 'Financial', 'Legal', 'Insurance'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-700';
      case 'action-needed': return 'bg-amber-100 text-amber-700';
      case 'expiring-soon': return 'bg-amber-100 text-amber-700';
      case 'non-compliant': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'not-started': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'action-needed': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'expiring-soon': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'non-compliant': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const filteredRequirements = requirements.filter(r => {
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const compliantCount = requirements.filter(r => r.status === 'compliant').length;
  const actionNeededCount = requirements.filter(r => r.status === 'action-needed' || r.status === 'expiring-soon').length;
  const nonCompliantCount = requirements.filter(r => r.status === 'non-compliant').length;
  const upcomingDeadlines = filings.filter(f => f.status !== 'complete').length;

  // Group requirements by category
  const groupedRequirements = filteredRequirements.reduce((acc, req) => {
    if (!acc[req.category]) acc[req.category] = [];
    acc[req.category].push(req);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Compliance</h1>
          <p className="text-sm text-gray-500">Regulatory requirements and filings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowRequirementModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Requirement
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Requirements</p>
          <p className="text-2xl font-semibold">{requirements.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Compliant</p>
          <p className="text-2xl font-semibold text-green-600">{compliantCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500">Action Needed</p>
          <p className="text-2xl font-semibold text-amber-600">{actionNeededCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Non-Compliant</p>
          <p className="text-2xl font-semibold text-red-600">{nonCompliantCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Upcoming Filings</p>
          <p className="text-2xl font-semibold">{upcomingDeadlines}</p>
        </div>
      </div>

      {/* Compliance Score */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Compliance Score</span>
          <span className="text-sm text-gray-500">{compliantCount}/{requirements.length} requirements met</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full", compliantCount === requirements.length ? "bg-green-500" : "bg-amber-500")} 
            style={{ width: `${(compliantCount / requirements.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-right text-sm font-medium mt-1">{Math.round((compliantCount / requirements.length) * 100)}%</p>
      </div>

      {/* Action Needed Alert */}
      {actionNeededCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div>
            <p className="font-medium text-amber-800">Action Required</p>
            <p className="text-sm text-amber-700">{actionNeededCount} items need attention before their deadlines.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('requirements')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'requirements' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Requirements ({requirements.length})
        </button>
        <button onClick={() => setActiveTab('filings')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'filings' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Upcoming Filings ({filings.length})
        </button>
        <button onClick={() => setActiveTab('deadlines')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'deadlines' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Calendar
        </button>
      </div>

      {/* Requirements Tab */}
      {activeTab === 'requirements' && (
        <>
          <div className="bg-white border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search requirements..." className="pl-9" />
              </div>
              <select className="border rounded-md px-3 py-2 text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="compliant">Compliant</option>
                <option value="action-needed">Action Needed</option>
                <option value="expiring-soon">Expiring Soon</option>
                <option value="non-compliant">Non-Compliant</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedRequirements).map(([category, reqs]) => (
              <div key={category}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  {category}
                  <span className="text-sm font-normal text-gray-500">({reqs.length})</span>
                </h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="w-10 px-4 py-3"></th>
                        <th className="text-left px-4 py-3 font-medium">Requirement</th>
                        <th className="text-left px-4 py-3 font-medium">Agency</th>
                        <th className="text-left px-4 py-3 font-medium">Last Updated</th>
                        <th className="text-left px-4 py-3 font-medium">Due/Renewal</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                        <th className="text-left px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reqs.map((req) => (
                        <tr key={req.id} className={cn("hover:bg-gray-50", (req.status === 'action-needed' || req.status === 'expiring-soon') && "bg-amber-50")}>
                          <td className="px-4 py-3">{getStatusIcon(req.status)}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{req.name}</p>
                            {req.notes && <p className="text-xs text-gray-500">{req.notes}</p>}
                          </td>
                          <td className="px-4 py-3 text-xs">{req.agency}</td>
                          <td className="px-4 py-3 text-xs">{req.lastUpdated}</td>
                          <td className="px-4 py-3 text-xs">
                            {req.renewalDate || req.dueDate || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(req.status))}>
                              {req.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedRequirement(req)}>
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                              {req.documents.length > 0 && (
                                <button className="p-1 hover:bg-gray-100 rounded">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Filings Tab */}
      {activeTab === 'filings' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Filing</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Agency</th>
                <th className="text-left px-4 py-3 font-medium">Due Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filings.map((filing) => {
                const isOverdue = filing.status !== 'complete' && new Date(filing.dueDate) < new Date();
                const isDueSoon = !isOverdue && filing.status !== 'complete' && new Date(filing.dueDate) <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
                return (
                  <tr key={filing.id} className={cn("hover:bg-gray-50", isOverdue && "bg-red-50", isDueSoon && !isOverdue && "bg-amber-50")}>
                    <td className="px-4 py-3 font-medium">{filing.name}</td>
                    <td className="px-4 py-3 text-xs">{filing.type}</td>
                    <td className="px-4 py-3 text-xs">{filing.agency}</td>
                    <td className="px-4 py-3">
                      <span className={cn(isOverdue && "text-red-600 font-medium", isDueSoon && "text-amber-600 font-medium")}>
                        {filing.dueDate}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(filing.status))}>
                        {filing.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm">Start</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'deadlines' && (
        <div className="bg-white border rounded-lg p-6">
          <div className="space-y-4">
            {[...filings, ...requirements.filter(r => r.renewalDate || r.dueDate)]
              .sort((a, b) => new Date(a.dueDate || a.renewalDate) - new Date(b.dueDate || b.renewalDate))
              .slice(0, 10)
              .map((item, idx) => {
                const date = item.dueDate || item.renewalDate;
                const isPast = new Date(date) < new Date();
                return (
                  <div key={idx} className={cn("flex items-center gap-4 p-3 rounded-lg", isPast ? "bg-red-50" : "bg-gray-50")}>
                    <div className="w-16 text-center">
                      <p className="text-xs text-gray-500">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</p>
                      <p className="text-xl font-bold">{new Date(date).getDate()}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.agency || item.type}</p>
                    </div>
                    <span className={cn("px-2 py-1 rounded text-xs", isPast ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700")}>
                      {isPast ? 'Overdue' : 'Upcoming'}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Requirement Detail Modal */}
      {selectedRequirement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedRequirement.name}</h3>
                <p className="text-sm text-gray-500">{selectedRequirement.category}</p>
              </div>
              <button onClick={() => setSelectedRequirement(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedRequirement.status)}
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedRequirement.status))}>
                  {selectedRequirement.status.replace('-', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Agency</p>
                  <p className="font-medium">{selectedRequirement.agency}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium">{selectedRequirement.lastUpdated}</p>
                </div>
                {selectedRequirement.renewalDate && (
                  <div>
                    <p className="text-gray-500">Renewal Date</p>
                    <p className="font-medium">{selectedRequirement.renewalDate}</p>
                  </div>
                )}
                {selectedRequirement.inspector && (
                  <div>
                    <p className="text-gray-500">Inspector</p>
                    <p className="font-medium">{selectedRequirement.inspector}</p>
                  </div>
                )}
              </div>

              {selectedRequirement.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedRequirement.notes}</p>
                </div>
              )}

              {selectedRequirement.documents.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Documents</p>
                  <div className="space-y-2">
                    {selectedRequirement.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{doc}</span>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setSelectedRequirement(null)}>Close</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompliancePage;
