import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Download, FileText, Calendar, CheckCircle, Clock, AlertTriangle, Shield, Building2, Upload, RefreshCw, Mail, Phone, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InsurancePage = ({ projectId }) => {
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState('project'); // 'project', 'vendor', 'claims'
  const [filterStatus, setFilterStatus] = useState('all');

  const [projectPolicies, setProjectPolicies] = useState([
    {
      id: 'POL-001',
      type: 'Builder Risk',
      policyNumber: 'BR-2024-OAK-001',
      carrier: 'Hartford Insurance',
      coverageAmount: 8500000,
      premium: 42000,
      premiumPaid: true,
      effectiveDate: '2024-03-01',
      expirationDate: '2025-03-01',
      status: 'active',
      namedInsured: 'Oakridge Estates LLC',
      additionalInsured: ['First National Bank', 'VanRock Holdings LLC'],
      deductible: 25000,
      agent: 'John Smith - ABC Insurance',
      agentPhone: '(555) 123-4567',
      agentEmail: 'jsmith@abcinsurance.com',
      documents: ['Policy Document.pdf', 'Certificate of Insurance.pdf'],
      notes: 'Covers all structures during construction. Includes theft and vandalism.',
    },
    {
      id: 'POL-002',
      type: 'General Liability',
      policyNumber: 'GL-2024-VRH-001',
      carrier: 'Travelers Insurance',
      coverageAmount: 2000000,
      premium: 18000,
      premiumPaid: true,
      effectiveDate: '2024-01-01',
      expirationDate: '2025-01-01',
      status: 'expiring-soon',
      namedInsured: 'VanRock Holdings LLC',
      additionalInsured: ['Oakridge Estates LLC'],
      deductible: 5000,
      agent: 'Sarah Johnson - XYZ Insurance',
      agentPhone: '(555) 234-5678',
      agentEmail: 'sjohnson@xyzinsurance.com',
      documents: ['GL Policy.pdf'],
      notes: 'Aggregate limit $2M. Per occurrence $1M.',
    },
    {
      id: 'POL-003',
      type: 'Workers Compensation',
      policyNumber: 'WC-2024-VRH-001',
      carrier: 'State Farm',
      coverageAmount: 1000000,
      premium: 15000,
      premiumPaid: true,
      effectiveDate: '2024-01-01',
      expirationDate: '2025-01-01',
      status: 'expiring-soon',
      namedInsured: 'VanRock Holdings LLC',
      additionalInsured: [],
      deductible: 0,
      agent: 'Sarah Johnson - XYZ Insurance',
      agentPhone: '(555) 234-5678',
      agentEmail: 'sjohnson@xyzinsurance.com',
      documents: ['WC Policy.pdf'],
      notes: 'Statutory limits per state requirements.',
    },
    {
      id: 'POL-004',
      type: 'Umbrella',
      policyNumber: 'UMB-2024-VRH-001',
      carrier: 'Chubb',
      coverageAmount: 5000000,
      premium: 8500,
      premiumPaid: true,
      effectiveDate: '2024-01-01',
      expirationDate: '2025-01-01',
      status: 'expiring-soon',
      namedInsured: 'VanRock Holdings LLC',
      additionalInsured: ['Oakridge Estates LLC'],
      deductible: 10000,
      agent: 'Sarah Johnson - XYZ Insurance',
      agentPhone: '(555) 234-5678',
      agentEmail: 'sjohnson@xyzinsurance.com',
      documents: ['Umbrella Policy.pdf'],
      notes: 'Excess liability coverage over GL and auto.',
    },
  ]);

  const vendorPolicies = [
    { id: 'VCOI-001', vendor: 'Johnson Construction', type: 'General Liability', coverageAmount: 2000000, expirationDate: '2025-06-30', status: 'active', coiOnFile: true },
    { id: 'VCOI-002', vendor: 'Johnson Construction', type: 'Workers Comp', coverageAmount: 1000000, expirationDate: '2025-06-30', status: 'active', coiOnFile: true },
    { id: 'VCOI-003', vendor: 'Sparks Electric', type: 'General Liability', coverageAmount: 1000000, expirationDate: '2025-04-15', status: 'active', coiOnFile: true },
    { id: 'VCOI-004', vendor: 'Sparks Electric', type: 'Workers Comp', coverageAmount: 500000, expirationDate: '2025-04-15', status: 'active', coiOnFile: true },
    { id: 'VCOI-005', vendor: 'ABC Plumbing', type: 'General Liability', coverageAmount: 1000000, expirationDate: '2025-03-20', status: 'expiring-soon', coiOnFile: true },
    { id: 'VCOI-006', vendor: 'ABC Plumbing', type: 'Workers Comp', coverageAmount: 500000, expirationDate: '2025-03-20', status: 'expiring-soon', coiOnFile: true },
    { id: 'VCOI-007', vendor: 'Cool Air HVAC', type: 'General Liability', coverageAmount: 1000000, expirationDate: '2025-05-10', status: 'active', coiOnFile: true },
    { id: 'VCOI-008', vendor: 'Cool Air HVAC', type: 'Workers Comp', coverageAmount: 500000, expirationDate: '2025-05-10', status: 'active', coiOnFile: true },
    { id: 'VCOI-009', vendor: 'Premium Cabinets', type: 'General Liability', coverageAmount: 1000000, expirationDate: '2025-01-15', status: 'expired', coiOnFile: false },
    { id: 'VCOI-010', vendor: 'Green Landscaping', type: 'General Liability', coverageAmount: 500000, expirationDate: '2025-02-28', status: 'expiring-soon', coiOnFile: true },
  ];

  const claims = [
    { id: 'CLM-001', policy: 'Builder Risk', description: 'Water damage - Unit 3 during storm', dateReported: '2024-08-15', claimAmount: 12500, status: 'paid', paidAmount: 12500, paidDate: '2024-09-20' },
    { id: 'CLM-002', policy: 'General Liability', description: 'Minor injury - visitor on site', dateReported: '2024-10-05', claimAmount: 5000, status: 'closed', paidAmount: 0, paidDate: null },
  ];

  const [newPolicy, setNewPolicy] = useState({
    type: '',
    carrier: '',
    policyNumber: '',
    coverageAmount: '',
    premium: '',
    effectiveDate: '',
    expirationDate: '',
    deductible: '',
    notes: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expiring-soon': return 'bg-amber-100 text-amber-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-600';
      case 'open': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const isExpiringSoon = (expirationDate) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntil = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil > 0;
  };

  const isExpired = (expirationDate) => {
    return new Date(expirationDate) < new Date();
  };

  const totalCoverage = projectPolicies.reduce((sum, p) => sum + p.coverageAmount, 0);
  const totalPremium = projectPolicies.reduce((sum, p) => sum + p.premium, 0);
  const expiringPolicies = projectPolicies.filter(p => p.status === 'expiring-soon').length;
  const vendorExpiring = vendorPolicies.filter(p => p.status === 'expiring-soon' || p.status === 'expired').length;

  const policyTypes = ['Builder Risk', 'General Liability', 'Workers Compensation', 'Umbrella', 'Auto', 'Professional Liability', 'Pollution', 'Other'];

  const handleSavePolicy = () => {
    const policy = {
      id: `POL-${String(projectPolicies.length + 1).padStart(3, '0')}`,
      ...newPolicy,
      coverageAmount: parseFloat(newPolicy.coverageAmount) || 0,
      premium: parseFloat(newPolicy.premium) || 0,
      deductible: parseFloat(newPolicy.deductible) || 0,
      premiumPaid: false,
      status: 'pending',
      namedInsured: 'Oakridge Estates LLC',
      additionalInsured: [],
      agent: '',
      agentPhone: '',
      agentEmail: '',
      documents: [],
    };
    setProjectPolicies(prev => [...prev, policy]);
    setShowPolicyModal(false);
    setNewPolicy({ type: '', carrier: '', policyNumber: '', coverageAmount: '', premium: '', effectiveDate: '', expirationDate: '', deductible: '', notes: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Insurance</h1>
          <p className="text-sm text-gray-500">Policy tracking and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowPolicyModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Policy
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Project Policies</p>
          <p className="text-2xl font-semibold">{projectPolicies.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Total Coverage</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(totalCoverage)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Annual Premiums</p>
          <p className="text-xl font-semibold">{formatCurrency(totalPremium)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500">Expiring Soon</p>
          <p className="text-xl font-semibold text-amber-600">{expiringPolicies}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Vendor COIs Needed</p>
          <p className="text-xl font-semibold text-red-600">{vendorExpiring}</p>
        </div>
      </div>

      {/* Expiring Alert */}
      {(expiringPolicies > 0 || vendorExpiring > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div>
            <p className="font-medium text-amber-800">Insurance Attention Required</p>
            <p className="text-sm text-amber-700">
              {expiringPolicies > 0 && `${expiringPolicies} project policies expiring soon. `}
              {vendorExpiring > 0 && `${vendorExpiring} vendor COIs need renewal.`}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('project')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'project' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Project Policies ({projectPolicies.length})
        </button>
        <button onClick={() => setActiveTab('vendor')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'vendor' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Vendor COIs ({vendorPolicies.length})
        </button>
        <button onClick={() => setActiveTab('claims')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'claims' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Claims ({claims.length})
        </button>
      </div>

      {/* Project Policies Tab */}
      {activeTab === 'project' && (
        <div className="space-y-4">
          {projectPolicies.map((policy) => (
            <div key={policy.id} className={cn("bg-white border rounded-lg overflow-hidden", policy.status === 'expiring-soon' && "border-amber-300")}>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Shield className={cn("w-6 h-6", policy.status === 'active' ? "text-green-500" : "text-amber-500")} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{policy.type}</h4>
                      <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getStatusColor(policy.status))}>
                        {policy.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{policy.carrier} • #{policy.policyNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Coverage</p>
                    <p className="font-semibold">{formatCurrency(policy.coverageAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Premium</p>
                    <p className="font-semibold">{formatCurrency(policy.premium)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Expires</p>
                    <p className={cn("font-semibold", isExpiringSoon(policy.expirationDate) && "text-amber-600")}>
                      {policy.expirationDate}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPolicy(policy)}>
                    <Eye className="w-4 h-4 mr-1" />Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vendor COIs Tab */}
      {activeTab === 'vendor' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Vendor</th>
                <th className="text-left px-4 py-3 font-medium">Policy Type</th>
                <th className="text-right px-4 py-3 font-medium">Coverage</th>
                <th className="text-left px-4 py-3 font-medium">Expires</th>
                <th className="text-left px-4 py-3 font-medium">COI on File</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vendorPolicies.map((policy) => (
                <tr key={policy.id} className={cn("hover:bg-gray-50", (policy.status === 'expired' || policy.status === 'expiring-soon') && "bg-amber-50")}>
                  <td className="px-4 py-3 font-medium">{policy.vendor}</td>
                  <td className="px-4 py-3">{policy.type}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(policy.coverageAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(isExpiringSoon(policy.expirationDate) || isExpired(policy.expirationDate) ? "text-amber-600 font-medium" : "")}>
                      {policy.expirationDate}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {policy.coiOnFile ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(policy.status))}>
                      {policy.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded"><Upload className="w-4 h-4 text-gray-500" /></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><Mail className="w-4 h-4 text-gray-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Claim #</th>
                <th className="text-left px-4 py-3 font-medium">Policy</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium">Date Reported</th>
                <th className="text-right px-4 py-3 font-medium">Claim Amount</th>
                <th className="text-right px-4 py-3 font-medium">Paid</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-[#047857]">{claim.id}</td>
                  <td className="px-4 py-3">{claim.policy}</td>
                  <td className="px-4 py-3">{claim.description}</td>
                  <td className="px-4 py-3 text-xs">{claim.dateReported}</td>
                  <td className="px-4 py-3 text-right font-medium">${claim.claimAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-600">{claim.paidAmount > 0 ? `$${claim.paidAmount.toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(claim.status))}>
                      {claim.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {claims.length === 0 && (
            <div className="text-center py-8 text-gray-500">No claims filed</div>
          )}
        </div>
      )}

      {/* Add Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Add Insurance Policy</h3>
              <button onClick={() => setShowPolicyModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Policy Type *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newPolicy.type} onChange={(e) => setNewPolicy(prev => ({ ...prev, type: e.target.value }))}>
                    <option value="">Select type...</option>
                    {policyTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Policy Number</label>
                  <Input value={newPolicy.policyNumber} onChange={(e) => setNewPolicy(prev => ({ ...prev, policyNumber: e.target.value }))} placeholder="Policy #" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Insurance Carrier *</label>
                <Input value={newPolicy.carrier} onChange={(e) => setNewPolicy(prev => ({ ...prev, carrier: e.target.value }))} placeholder="Carrier name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Coverage Amount *</label>
                  <Input type="number" value={newPolicy.coverageAmount} onChange={(e) => setNewPolicy(prev => ({ ...prev, coverageAmount: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Annual Premium</label>
                  <Input type="number" value={newPolicy.premium} onChange={(e) => setNewPolicy(prev => ({ ...prev, premium: e.target.value }))} placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Effective Date *</label>
                  <Input type="date" value={newPolicy.effectiveDate} onChange={(e) => setNewPolicy(prev => ({ ...prev, effectiveDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Expiration Date *</label>
                  <Input type="date" value={newPolicy.expirationDate} onChange={(e) => setNewPolicy(prev => ({ ...prev, expirationDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Deductible</label>
                <Input type="number" value={newPolicy.deductible} onChange={(e) => setNewPolicy(prev => ({ ...prev, deductible: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={newPolicy.notes} onChange={(e) => setNewPolicy(prev => ({ ...prev, notes: e.target.value }))} placeholder="Policy notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowPolicyModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSavePolicy}>Add Policy</Button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Detail Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedPolicy.type}</h3>
                <p className="text-sm text-gray-500">{selectedPolicy.carrier} • #{selectedPolicy.policyNumber}</p>
              </div>
              <button onClick={() => setSelectedPolicy(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedPolicy.status))}>
                  {selectedPolicy.status.replace('-', ' ')}
                </span>
                {selectedPolicy.premiumPaid && (
                  <span className="px-3 py-1 rounded text-sm bg-green-100 text-green-700">Premium Paid</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Coverage</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedPolicy.coverageAmount)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Premium</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedPolicy.premium)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Deductible</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedPolicy.deductible)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Effective Date</p>
                  <p className="font-medium">{selectedPolicy.effectiveDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Expiration Date</p>
                  <p className={cn("font-medium", isExpiringSoon(selectedPolicy.expirationDate) && "text-amber-600")}>
                    {selectedPolicy.expirationDate}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Named Insured</p>
                  <p className="font-medium">{selectedPolicy.namedInsured}</p>
                </div>
                <div>
                  <p className="text-gray-500">Additional Insured</p>
                  <p className="font-medium">{selectedPolicy.additionalInsured.length > 0 ? selectedPolicy.additionalInsured.join(', ') : 'None'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Agent Contact</p>
                <p className="font-medium">{selectedPolicy.agent}</p>
                <p className="text-sm text-gray-600">{selectedPolicy.agentPhone}</p>
                <p className="text-sm text-[#047857]">{selectedPolicy.agentEmail}</p>
              </div>

              {selectedPolicy.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedPolicy.notes}</p>
                </div>
              )}

              {selectedPolicy.documents.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Documents</p>
                  <div className="space-y-2">
                    {selectedPolicy.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{doc}</span>
                        </div>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Renew Policy</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedPolicy(null)}>Close</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsurancePage;
