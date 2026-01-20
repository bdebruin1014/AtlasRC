import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, FileText, Calendar, Clock, CheckCircle, AlertTriangle, XCircle, Download, ExternalLink, Building2, Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PermitsPage = ({ projectId }) => {
  const [showPermitModal, setShowPermitModal] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [permits, setPermits] = useState([
    {
      id: 'PRM-001',
      type: 'Building Permit',
      permitNumber: 'BP-2024-45678',
      description: 'New residential construction - 12 units',
      jurisdiction: 'City of Greenville',
      status: 'approved',
      applicationDate: '2024-02-15',
      approvalDate: '2024-03-01',
      expirationDate: '2025-03-01',
      fee: 12500,
      feePaid: true,
      inspector: 'John Smith',
      inspectorPhone: '(555) 123-4567',
      notes: 'Main building permit for all 12 units. Includes structural, mechanical, electrical, and plumbing.',
      documents: ['Building Permit Application.pdf', 'Approved Plans.pdf'],
      renewalRequired: true,
    },
    {
      id: 'PRM-002',
      type: 'Grading Permit',
      permitNumber: 'GP-2024-12345',
      description: 'Site grading and earthwork',
      jurisdiction: 'Greenville County',
      status: 'approved',
      applicationDate: '2024-02-10',
      approvalDate: '2024-02-28',
      expirationDate: '2025-02-28',
      fee: 2500,
      feePaid: true,
      inspector: 'Mike Johnson',
      inspectorPhone: '(555) 234-5678',
      notes: 'Grading permit for 4.5 acre site. Erosion control measures required.',
      documents: ['Grading Permit.pdf', 'Erosion Control Plan.pdf'],
      renewalRequired: true,
    },
    {
      id: 'PRM-003',
      type: 'Stormwater Permit',
      permitNumber: 'SW-2024-7890',
      description: 'Stormwater management and detention',
      jurisdiction: 'Greenville County',
      status: 'approved',
      applicationDate: '2024-02-12',
      approvalDate: '2024-03-05',
      expirationDate: '2025-03-05',
      fee: 1800,
      feePaid: true,
      inspector: 'Sarah Davis',
      inspectorPhone: '(555) 345-6789',
      notes: 'Detention pond and stormwater management system.',
      documents: ['Stormwater Permit.pdf'],
      renewalRequired: true,
    },
    {
      id: 'PRM-004',
      type: 'Utility Connection',
      permitNumber: 'UC-2024-3456',
      description: 'Water and sewer connection',
      jurisdiction: 'Greenville Water',
      status: 'approved',
      applicationDate: '2024-03-01',
      approvalDate: '2024-03-15',
      expirationDate: null,
      fee: 45000,
      feePaid: true,
      inspector: 'Greenville Water Dept',
      inspectorPhone: '(555) 456-7890',
      notes: 'Connection fees for 12 residential units. Includes tap fees and impact fees.',
      documents: ['Utility Agreement.pdf'],
      renewalRequired: false,
    },
    {
      id: 'PRM-005',
      type: 'Electrical Permit',
      permitNumber: 'EP-2024-8901',
      description: 'Electrical service and distribution',
      jurisdiction: 'City of Greenville',
      status: 'approved',
      applicationDate: '2024-03-10',
      approvalDate: '2024-03-20',
      expirationDate: '2025-03-20',
      fee: 3500,
      feePaid: true,
      inspector: 'Tom Wilson',
      inspectorPhone: '(555) 567-8901',
      notes: 'Electrical permits for all 12 units. Duke Energy coordination required.',
      documents: ['Electrical Permit.pdf'],
      renewalRequired: true,
    },
    {
      id: 'PRM-006',
      type: 'Driveway Permit',
      permitNumber: 'DP-2024-2345',
      description: 'Driveway curb cut and access',
      jurisdiction: 'City of Greenville',
      status: 'approved',
      applicationDate: '2024-02-20',
      approvalDate: '2024-03-08',
      expirationDate: '2025-03-08',
      fee: 750,
      feePaid: true,
      inspector: 'City Engineering',
      inspectorPhone: '(555) 678-9012',
      notes: 'Two driveway access points approved.',
      documents: ['Driveway Permit.pdf'],
      renewalRequired: false,
    },
    {
      id: 'PRM-007',
      type: 'Tree Removal',
      permitNumber: 'TR-2024-1111',
      description: 'Tree removal and mitigation',
      jurisdiction: 'City of Greenville',
      status: 'approved',
      applicationDate: '2024-02-08',
      approvalDate: '2024-02-22',
      expirationDate: '2024-08-22',
      fee: 500,
      feePaid: true,
      inspector: 'Parks Dept',
      inspectorPhone: '(555) 789-0123',
      notes: '15 trees removed, 20 replacement trees required.',
      documents: ['Tree Survey.pdf', 'Mitigation Plan.pdf'],
      renewalRequired: false,
    },
    {
      id: 'PRM-008',
      type: 'Certificate of Occupancy',
      permitNumber: 'CO-2024-0001',
      description: 'Unit 1 - Certificate of Occupancy',
      jurisdiction: 'City of Greenville',
      status: 'approved',
      applicationDate: '2024-12-10',
      approvalDate: '2024-12-18',
      expirationDate: null,
      fee: 250,
      feePaid: true,
      inspector: 'John Smith',
      inspectorPhone: '(555) 123-4567',
      notes: 'CO issued for Unit 1 after final inspection passed.',
      documents: ['CO - Unit 1.pdf'],
      renewalRequired: false,
    },
    {
      id: 'PRM-009',
      type: 'Certificate of Occupancy',
      permitNumber: 'Pending',
      description: 'Unit 2 - Certificate of Occupancy',
      jurisdiction: 'City of Greenville',
      status: 'pending',
      applicationDate: '2024-12-20',
      approvalDate: null,
      expirationDate: null,
      fee: 250,
      feePaid: true,
      inspector: 'John Smith',
      inspectorPhone: '(555) 123-4567',
      notes: 'Awaiting final inspection for Unit 2.',
      documents: [],
      renewalRequired: false,
    },
    {
      id: 'PRM-010',
      type: 'Fire Sprinkler',
      permitNumber: 'FS-2024-5555',
      description: 'Fire sprinkler system installation',
      jurisdiction: 'Greenville Fire Marshal',
      status: 'in-review',
      applicationDate: '2024-12-15',
      approvalDate: null,
      expirationDate: null,
      fee: 1200,
      feePaid: true,
      inspector: 'Fire Marshal Office',
      inspectorPhone: '(555) 890-1234',
      notes: 'Submitted for review. Expecting approval within 2 weeks.',
      documents: ['Sprinkler Plans.pdf'],
      renewalRequired: false,
    },
  ]);

  const [newPermit, setNewPermit] = useState({
    type: '',
    description: '',
    jurisdiction: '',
    applicationDate: '',
    fee: '',
    notes: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'in-review': return 'bg-blue-100 text-blue-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'in-review': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredPermits = permits.filter(permit => {
    if (filterStatus === 'all') return true;
    return permit.status === filterStatus;
  });

  const approvedPermits = permits.filter(p => p.status === 'approved').length;
  const pendingPermits = permits.filter(p => p.status === 'pending' || p.status === 'in-review').length;
  const totalFees = permits.reduce((sum, p) => sum + p.fee, 0);
  const paidFees = permits.filter(p => p.feePaid).reduce((sum, p) => sum + p.fee, 0);

  const isExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const handleSavePermit = () => {
    const permit = {
      id: `PRM-${String(permits.length + 1).padStart(3, '0')}`,
      ...newPermit,
      permitNumber: 'Pending',
      status: 'pending',
      approvalDate: null,
      expirationDate: null,
      fee: parseFloat(newPermit.fee) || 0,
      feePaid: false,
      inspector: '',
      inspectorPhone: '',
      documents: [],
      renewalRequired: false,
    };
    setPermits(prev => [...prev, permit]);
    setShowPermitModal(false);
    setNewPermit({ type: '', description: '', jurisdiction: '', applicationDate: '', fee: '', notes: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Permits</h1>
          <p className="text-sm text-gray-500">Track permits and approvals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowPermitModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Permit
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Permits</p>
          <p className="text-2xl font-semibold">{permits.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Approved</p>
          <p className="text-2xl font-semibold text-green-600">{approvedPermits}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500">Pending/In Review</p>
          <p className="text-2xl font-semibold text-amber-600">{pendingPermits}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Fees</p>
          <p className="text-2xl font-semibold">${totalFees.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Fees Paid</p>
          <p className="text-2xl font-semibold text-green-600">${paidFees.toLocaleString()}</p>
        </div>
      </div>

      {/* Expiring Soon Alert */}
      {permits.some(p => isExpiringSoon(p.expirationDate)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div>
            <p className="font-medium text-amber-800">Permits Expiring Soon</p>
            <p className="text-sm text-amber-700">
              {permits.filter(p => isExpiringSoon(p.expirationDate)).map(p => p.type).join(', ')} - renewal may be required
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search permits..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="in-review">In Review</option>
            <option value="expired">Expired</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Types</option>
            <option>Building Permit</option>
            <option>Grading Permit</option>
            <option>Electrical Permit</option>
            <option>Certificate of Occupancy</option>
          </select>
        </div>
      </div>

      {/* Permits Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Permit</th>
              <th className="text-left px-4 py-3 font-medium">Permit #</th>
              <th className="text-left px-4 py-3 font-medium">Jurisdiction</th>
              <th className="text-left px-4 py-3 font-medium">Applied</th>
              <th className="text-left px-4 py-3 font-medium">Approved</th>
              <th className="text-left px-4 py-3 font-medium">Expires</th>
              <th className="text-right px-4 py-3 font-medium">Fee</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPermits.map((permit) => (
              <tr key={permit.id} className={cn("hover:bg-gray-50", isExpiringSoon(permit.expirationDate) && "bg-amber-50")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(permit.status)}
                    <div>
                      <p className="font-medium">{permit.type}</p>
                      <p className="text-xs text-gray-500">{permit.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("font-mono text-xs", permit.permitNumber === 'Pending' && "text-gray-400")}>
                    {permit.permitNumber}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{permit.jurisdiction}</td>
                <td className="px-4 py-3 text-xs">{permit.applicationDate}</td>
                <td className="px-4 py-3 text-xs">{permit.approvalDate || '-'}</td>
                <td className="px-4 py-3 text-xs">
                  {permit.expirationDate ? (
                    <span className={cn(isExpiringSoon(permit.expirationDate) && "text-amber-600 font-medium")}>
                      {permit.expirationDate}
                      {isExpiringSoon(permit.expirationDate) && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={cn(permit.feePaid ? "text-green-600" : "text-amber-600")}>
                    ${permit.fee.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(permit.status))}>
                    {permit.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedPermit(permit)}>
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Permit Modal */}
      {showPermitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Add Permit</h3>
              <button onClick={() => setShowPermitModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Permit Type *</label>
                <select className="w-full border rounded-md px-3 py-2" value={newPermit.type} onChange={(e) => setNewPermit(prev => ({ ...prev, type: e.target.value }))}>
                  <option value="">Select type...</option>
                  <option>Building Permit</option>
                  <option>Grading Permit</option>
                  <option>Stormwater Permit</option>
                  <option>Utility Connection</option>
                  <option>Electrical Permit</option>
                  <option>Plumbing Permit</option>
                  <option>Mechanical Permit</option>
                  <option>Fire Sprinkler</option>
                  <option>Driveway Permit</option>
                  <option>Tree Removal</option>
                  <option>Certificate of Occupancy</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <Input value={newPermit.description} onChange={(e) => setNewPermit(prev => ({ ...prev, description: e.target.value }))} placeholder="Brief description" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Jurisdiction *</label>
                <Input value={newPermit.jurisdiction} onChange={(e) => setNewPermit(prev => ({ ...prev, jurisdiction: e.target.value }))} placeholder="City, County, or Agency" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Application Date</label>
                  <Input type="date" value={newPermit.applicationDate} onChange={(e) => setNewPermit(prev => ({ ...prev, applicationDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Fee Amount</label>
                  <Input type="number" value={newPermit.fee} onChange={(e) => setNewPermit(prev => ({ ...prev, fee: e.target.value }))} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={newPermit.notes} onChange={(e) => setNewPermit(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowPermitModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSavePermit}>Add Permit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Permit Detail Modal */}
      {selectedPermit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedPermit.type}</h3>
                <p className="text-sm text-gray-500">{selectedPermit.id}</p>
              </div>
              <button onClick={() => setSelectedPermit(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedPermit.status))}>
                  {selectedPermit.status.replace('-', ' ')}
                </span>
                {selectedPermit.feePaid ? (
                  <span className="px-3 py-1 rounded text-sm bg-green-100 text-green-700">Fee Paid</span>
                ) : (
                  <span className="px-3 py-1 rounded text-sm bg-amber-100 text-amber-700">Fee Pending</span>
                )}
                {selectedPermit.renewalRequired && (
                  <span className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-700">Renewal Required</span>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Permit Number</p>
                  <p className="font-mono font-medium">{selectedPermit.permitNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jurisdiction</p>
                  <p className="font-medium">{selectedPermit.jurisdiction}</p>
                </div>
                <div>
                  <p className="text-gray-500">Application Date</p>
                  <p className="font-medium">{selectedPermit.applicationDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Approval Date</p>
                  <p className="font-medium">{selectedPermit.approvalDate || 'Pending'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Expiration Date</p>
                  <p className={cn("font-medium", isExpiringSoon(selectedPermit.expirationDate) && "text-amber-600")}>
                    {selectedPermit.expirationDate || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Fee</p>
                  <p className="font-medium">${selectedPermit.fee.toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p>{selectedPermit.description}</p>
              </div>

              {/* Inspector */}
              {selectedPermit.inspector && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Inspector / Contact</p>
                  <p className="font-medium">{selectedPermit.inspector}</p>
                  <p className="text-sm text-gray-600">{selectedPermit.inspectorPhone}</p>
                </div>
              )}

              {/* Notes */}
              {selectedPermit.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedPermit.notes}</p>
                </div>
              )}

              {/* Documents */}
              {selectedPermit.documents.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Documents</p>
                  <div className="space-y-2">
                    {selectedPermit.documents.map((doc, idx) => (
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
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setSelectedPermit(null)}>Close</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermitsPage;
