import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, AlertTriangle, CheckCircle, Clock, Calendar, Home, User, Wrench, Phone, Mail, Download, FileText, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const WarrantyPage = ({ projectId }) => {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('claims'); // 'claims', 'coverage', 'contacts'

  const [claims, setClaims] = useState([
    {
      id: 'WC-001',
      unit: 'Unit 1',
      owner: 'James & Emily Rodriguez',
      ownerPhone: '(555) 111-2222',
      ownerEmail: 'jrodriguez@email.com',
      closingDate: '2024-12-20',
      category: 'Plumbing',
      issue: 'Kitchen faucet leaking at base',
      description: 'Owner reports water pooling around kitchen faucet base when running. Appears to be seal issue.',
      priority: 'medium',
      status: 'in-progress',
      reportedDate: '2024-12-26',
      scheduledDate: '2024-12-30',
      assignedTo: 'ABC Plumbing',
      resolution: null,
      completedDate: null,
      cost: 0,
      photos: 2,
      warrantyType: 'builder',
      notes: 'Plumber scheduled for Monday morning.',
    },
    {
      id: 'WC-002',
      unit: 'Unit 1',
      owner: 'James & Emily Rodriguez',
      ownerPhone: '(555) 111-2222',
      ownerEmail: 'jrodriguez@email.com',
      closingDate: '2024-12-20',
      category: 'HVAC',
      issue: 'Furnace making loud noise on startup',
      priority: 'low',
      description: 'Homeowner reports loud banging noise when furnace kicks on. Normal operation otherwise.',
      status: 'scheduled',
      reportedDate: '2024-12-27',
      scheduledDate: '2025-01-02',
      assignedTo: 'Cool Air HVAC',
      resolution: null,
      completedDate: null,
      cost: 0,
      photos: 0,
      warrantyType: 'builder',
      notes: 'HVAC tech will check ductwork and blower motor.',
    },
    {
      id: 'WC-003',
      unit: 'Unit 2',
      owner: 'Michael & Lisa Chen',
      ownerPhone: '(555) 345-6789',
      ownerEmail: 'mchen@email.com',
      closingDate: '2024-12-20',
      category: 'Drywall',
      issue: 'Nail pop in living room ceiling',
      description: 'Small nail pop visible in living room ceiling near light fixture.',
      priority: 'low',
      status: 'open',
      reportedDate: '2024-12-28',
      scheduledDate: null,
      assignedTo: null,
      resolution: null,
      completedDate: null,
      cost: 0,
      photos: 1,
      warrantyType: 'builder',
      notes: '',
    },
    {
      id: 'WC-004',
      unit: 'Unit 3',
      owner: 'Jennifer Martinez',
      ownerPhone: '(555) 234-5678',
      ownerEmail: 'jmartinez@email.com',
      closingDate: '2024-12-20',
      category: 'Electrical',
      issue: 'Garage outlet not working',
      description: 'Right side garage outlet has no power. Other outlets in garage work fine.',
      priority: 'medium',
      status: 'completed',
      reportedDate: '2024-12-22',
      scheduledDate: '2024-12-23',
      assignedTo: 'Sparks Electric',
      resolution: 'Loose wire connection at outlet. Reconnected and tested - working properly.',
      completedDate: '2024-12-23',
      cost: 0,
      photos: 1,
      warrantyType: 'builder',
      notes: 'No charge - covered under builder warranty.',
    },
    {
      id: 'WC-005',
      unit: 'Unit 1',
      owner: 'James & Emily Rodriguez',
      ownerPhone: '(555) 111-2222',
      ownerEmail: 'jrodriguez@email.com',
      closingDate: '2024-12-20',
      category: 'Appliances',
      issue: 'Dishwasher not draining properly',
      description: 'Dishwasher leaving standing water after cycle completes. About 1" of water remaining.',
      priority: 'medium',
      status: 'completed',
      reportedDate: '2024-12-21',
      scheduledDate: '2024-12-22',
      assignedTo: 'Appliance Pros',
      resolution: 'Drain hose was kinked. Repositioned hose and tested - draining properly now.',
      completedDate: '2024-12-22',
      cost: 0,
      photos: 0,
      warrantyType: 'manufacturer',
      notes: 'Covered under GE manufacturer warranty.',
    },
  ]);

  const warrantyContacts = [
    { trade: 'Plumbing', company: 'ABC Plumbing', contact: 'Mike Johnson', phone: '(555) 222-3333', email: 'mike@abcplumbing.com' },
    { trade: 'Electrical', company: 'Sparks Electric', contact: 'Tom Wilson', phone: '(555) 333-4444', email: 'tom@sparkselectric.com' },
    { trade: 'HVAC', company: 'Cool Air HVAC', contact: 'Dave Brown', phone: '(555) 444-5555', email: 'dave@coolairhvac.com' },
    { trade: 'Appliances', company: 'Appliance Pros', contact: 'Service Dept', phone: '(555) 555-6666', email: 'service@appliancepros.com' },
    { trade: 'Drywall/Paint', company: 'Paint Crew', contact: 'Carlos Garcia', phone: '(555) 666-7777', email: 'carlos@paintcrew.com' },
    { trade: 'Roofing', company: 'Top Roofing', contact: 'Steve Miller', phone: '(555) 777-8888', email: 'steve@toproofing.com' },
  ];

  const warrantyCoverage = [
    { item: 'Workmanship & Materials', duration: '1 Year', startDate: 'Closing Date', description: 'Covers defects in workmanship and materials' },
    { item: 'Major Systems (HVAC, Plumbing, Electrical)', duration: '2 Years', startDate: 'Closing Date', description: 'Covers major mechanical and electrical systems' },
    { item: 'Structural', duration: '10 Years', startDate: 'Closing Date', description: 'Covers major structural defects' },
    { item: 'Roofing Materials', duration: '25 Years', startDate: 'Installation', description: 'Manufacturer warranty on roofing materials' },
    { item: 'Appliances', duration: '1 Year', startDate: 'Closing Date', description: 'Manufacturer warranties vary by appliance' },
    { item: 'Windows', duration: '20 Years', startDate: 'Installation', description: 'Manufacturer warranty on windows and seals' },
  ];

  const [newClaim, setNewClaim] = useState({
    unit: '',
    category: '',
    issue: '',
    description: '',
    priority: 'medium',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700';
      case 'scheduled': return 'bg-amber-100 text-amber-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'denied': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const filteredClaims = claims.filter(claim => {
    if (filterStatus === 'all') return true;
    return claim.status === filterStatus;
  });

  const openClaims = claims.filter(c => c.status === 'open').length;
  const inProgressClaims = claims.filter(c => c.status === 'in-progress' || c.status === 'scheduled').length;
  const completedClaims = claims.filter(c => c.status === 'completed').length;
  const totalCost = claims.reduce((sum, c) => sum + c.cost, 0);
  const avgResolutionDays = 2.3;

  const handleSaveClaim = () => {
    const claim = {
      id: `WC-${String(claims.length + 1).padStart(3, '0')}`,
      ...newClaim,
      owner: 'TBD',
      ownerPhone: '',
      ownerEmail: '',
      closingDate: '',
      status: 'open',
      reportedDate: new Date().toISOString().split('T')[0],
      scheduledDate: null,
      assignedTo: null,
      resolution: null,
      completedDate: null,
      cost: 0,
      photos: 0,
      warrantyType: 'builder',
      notes: '',
    };
    setClaims(prev => [claim, ...prev]);
    setShowClaimModal(false);
    setNewClaim({ unit: '', category: '', issue: '', description: '', priority: 'medium' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Warranty</h1>
          <p className="text-sm text-gray-500">Post-closing warranty claims and service requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowClaimModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Claim
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Claims</p>
          <p className="text-2xl font-semibold">{claims.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Open</p>
          <p className="text-2xl font-semibold text-red-600">{openClaims}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-2xl font-semibold text-blue-600">{inProgressClaims}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">{completedClaims}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Avg Resolution</p>
          <p className="text-2xl font-semibold">{avgResolutionDays} days</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Cost</p>
          <p className="text-2xl font-semibold">${totalCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('claims')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'claims' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Claims ({claims.length})
        </button>
        <button onClick={() => setActiveTab('coverage')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'coverage' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Coverage
        </button>
        <button onClick={() => setActiveTab('contacts')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'contacts' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Contacts
        </button>
      </div>

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <>
          {/* Filters */}
          <div className="bg-white border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search claims..." className="pl-9" />
              </div>
              <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Categories</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>HVAC</option>
                <option>Drywall</option>
                <option>Appliances</option>
                <option>Roofing</option>
              </select>
              <select className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Units</option>
                <option>Unit 1</option>
                <option>Unit 2</option>
                <option>Unit 3</option>
              </select>
            </div>
          </div>

          {/* Claims Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-8 px-4 py-3"></th>
                  <th className="text-left px-4 py-3 font-medium">Claim #</th>
                  <th className="text-left px-4 py-3 font-medium">Unit / Owner</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Issue</th>
                  <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                  <th className="text-left px-4 py-3 font-medium">Scheduled</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className={cn("hover:bg-gray-50", claim.status === 'completed' && "opacity-60")}>
                    <td className="px-4 py-3">
                      <div className={cn("w-2 h-2 rounded-full", getPriorityColor(claim.priority))} title={`${claim.priority} priority`}></div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-[#047857]">{claim.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{claim.unit}</p>
                        <p className="text-xs text-gray-500">{claim.owner}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{claim.category}</td>
                    <td className="px-4 py-3">
                      <p className="truncate max-w-[200px]">{claim.issue}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{claim.assignedTo || '-'}</td>
                    <td className="px-4 py-3 text-xs">{claim.scheduledDate || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(claim.status))}>
                        {claim.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedClaim(claim)}>
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Coverage Tab */}
      {activeTab === 'coverage' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Item</th>
                <th className="text-left px-4 py-3 font-medium">Duration</th>
                <th className="text-left px-4 py-3 font-medium">Start Date</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {warrantyCoverage.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.item}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">{item.duration}</span>
                  </td>
                  <td className="px-4 py-3">{item.startDate}</td>
                  <td className="px-4 py-3 text-gray-600">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Trade</th>
                <th className="text-left px-4 py-3 font-medium">Company</th>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {warrantyContacts.map((contact, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{contact.trade}</td>
                  <td className="px-4 py-3">{contact.company}</td>
                  <td className="px-4 py-3">{contact.contact}</td>
                  <td className="px-4 py-3">
                    <a href={`tel:${contact.phone}`} className="text-[#047857] hover:underline">{contact.phone}</a>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${contact.email}`} className="text-[#047857] hover:underline">{contact.email}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Warranty Claim</h3>
              <button onClick={() => setShowClaimModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Unit *</label>
                <select className="w-full border rounded-md px-3 py-2" value={newClaim.unit} onChange={(e) => setNewClaim(prev => ({ ...prev, unit: e.target.value }))}>
                  <option value="">Select unit...</option>
                  <option>Unit 1</option>
                  <option>Unit 2</option>
                  <option>Unit 3</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Category *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newClaim.category} onChange={(e) => setNewClaim(prev => ({ ...prev, category: e.target.value }))}>
                    <option value="">Select...</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>HVAC</option>
                    <option>Drywall</option>
                    <option>Appliances</option>
                    <option>Roofing</option>
                    <option>Flooring</option>
                    <option>Doors/Windows</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Priority</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newClaim.priority} onChange={(e) => setNewClaim(prev => ({ ...prev, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Issue Summary *</label>
                <Input value={newClaim.issue} onChange={(e) => setNewClaim(prev => ({ ...prev, issue: e.target.value }))} placeholder="Brief description of issue" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Detailed Description</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={4} value={newClaim.description} onChange={(e) => setNewClaim(prev => ({ ...prev, description: e.target.value }))} placeholder="Provide detailed description of the issue..." />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Photos</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Camera className="w-6 h-6 mx-auto text-gray-300 mb-1" />
                  <p className="text-sm text-gray-500">Add photos of the issue</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowClaimModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSaveClaim}>Create Claim</Button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedClaim.id}</h3>
                <p className="text-sm text-gray-500">{selectedClaim.category}</p>
              </div>
              <button onClick={() => setSelectedClaim(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status & Priority */}
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedClaim.status))}>
                  {selectedClaim.status.replace('-', ' ')}
                </span>
                <span className={cn("px-3 py-1 rounded text-sm capitalize text-white", getPriorityColor(selectedClaim.priority))}>
                  {selectedClaim.priority} priority
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{selectedClaim.warrantyType} warranty</span>
              </div>

              {/* Issue */}
              <div>
                <h4 className="text-lg font-semibold">{selectedClaim.issue}</h4>
                <p className="text-sm text-gray-600 mt-2">{selectedClaim.description}</p>
              </div>

              {/* Unit & Owner */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Unit</p>
                  <p className="font-medium">{selectedClaim.unit}</p>
                  <p className="text-xs text-gray-500">Closed: {selectedClaim.closingDate}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Owner</p>
                  <p className="font-medium">{selectedClaim.owner}</p>
                  <p className="text-xs">{selectedClaim.ownerPhone}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Reported</p>
                  <p className="font-medium">{selectedClaim.reportedDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Scheduled</p>
                  <p className="font-medium">{selectedClaim.scheduledDate || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Completed</p>
                  <p className="font-medium">{selectedClaim.completedDate || '-'}</p>
                </div>
              </div>

              {/* Assignment */}
              {selectedClaim.assignedTo && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Assigned To</p>
                  <p className="font-medium">{selectedClaim.assignedTo}</p>
                </div>
              )}

              {/* Resolution */}
              {selectedClaim.resolution && (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">Resolution</p>
                  </div>
                  <p className="text-sm text-gray-700">{selectedClaim.resolution}</p>
                </div>
              )}

              {/* Notes */}
              {selectedClaim.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedClaim.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <span className="text-xs text-gray-500">{selectedClaim.photos} photos attached</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedClaim(null)}>Close</Button>
                {selectedClaim.status !== 'completed' && (
                  <Button className="bg-[#047857] hover:bg-[#065f46]">Update Claim</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarrantyPage;
