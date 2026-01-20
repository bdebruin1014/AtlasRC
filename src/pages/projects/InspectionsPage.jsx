import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Calendar, Clock, CheckCircle, AlertTriangle, XCircle, Download, ClipboardCheck, User, Building2, Camera, FileText, Phone, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InspectionsPage = ({ projectId }) => {
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'scheduled', 'completed'

  const [inspections, setInspections] = useState([
    // Scheduled
    {
      id: 'INS-001',
      type: 'Framing',
      subType: 'Rough Framing',
      unit: 'Unit 5',
      scheduledDate: '2024-12-30',
      scheduledTime: '09:00 AM',
      inspector: 'John Smith',
      inspectorPhone: '(555) 123-4567',
      agency: 'City of Greenville',
      status: 'scheduled',
      result: null,
      notes: 'Framing inspection for Unit 5. All structural members must be visible.',
      deficiencies: [],
      photos: 0,
      requestedBy: 'Mike Johnson (GC)',
      requestedDate: '2024-12-27',
    },
    {
      id: 'INS-002',
      type: 'Mechanical',
      subType: 'HVAC Rough-in',
      unit: 'Unit 4',
      scheduledDate: '2024-12-31',
      scheduledTime: '10:00 AM',
      inspector: 'Tom Wilson',
      inspectorPhone: '(555) 234-5678',
      agency: 'City of Greenville',
      status: 'scheduled',
      result: null,
      notes: 'HVAC rough-in inspection. Ductwork and equipment placement.',
      deficiencies: [],
      photos: 0,
      requestedBy: 'Cool Air HVAC',
      requestedDate: '2024-12-26',
    },
    {
      id: 'INS-003',
      type: 'Bank Draw',
      subType: 'Draw #13',
      unit: 'All Units',
      scheduledDate: '2025-01-02',
      scheduledTime: '02:00 PM',
      inspector: 'Bank Inspector',
      inspectorPhone: '(555) 345-6789',
      agency: 'First National Bank',
      status: 'scheduled',
      result: null,
      notes: 'Monthly draw inspection for Draw #13. Verify completion percentages.',
      deficiencies: [],
      photos: 0,
      requestedBy: 'Bryan VanRock',
      requestedDate: '2024-12-28',
    },
    // Completed - Passed
    {
      id: 'INS-004',
      type: 'Foundation',
      subType: 'Footing',
      unit: 'Unit 1',
      scheduledDate: '2024-05-15',
      scheduledTime: '08:00 AM',
      completedDate: '2024-05-15',
      inspector: 'John Smith',
      inspectorPhone: '(555) 123-4567',
      agency: 'City of Greenville',
      status: 'completed',
      result: 'passed',
      notes: 'Footing inspection passed. Rebar placement and dimensions verified.',
      deficiencies: [],
      photos: 3,
      requestedBy: 'Mike Johnson (GC)',
      requestedDate: '2024-05-12',
    },
    {
      id: 'INS-005',
      type: 'Electrical',
      subType: 'Rough Electrical',
      unit: 'Unit 1',
      scheduledDate: '2024-09-20',
      scheduledTime: '10:00 AM',
      completedDate: '2024-09-20',
      inspector: 'Tom Wilson',
      inspectorPhone: '(555) 234-5678',
      agency: 'City of Greenville',
      status: 'completed',
      result: 'passed',
      notes: 'Rough electrical passed. All boxes and wiring per code.',
      deficiencies: [],
      photos: 2,
      requestedBy: 'Sparks Electric',
      requestedDate: '2024-09-17',
    },
    {
      id: 'INS-006',
      type: 'Plumbing',
      subType: 'Rough Plumbing',
      unit: 'Unit 1',
      scheduledDate: '2024-09-18',
      scheduledTime: '09:00 AM',
      completedDate: '2024-09-18',
      inspector: 'Sarah Davis',
      inspectorPhone: '(555) 456-7890',
      agency: 'City of Greenville',
      status: 'completed',
      result: 'passed',
      notes: 'Rough plumbing passed. Water test completed - no leaks.',
      deficiencies: [],
      photos: 2,
      requestedBy: 'ABC Plumbing',
      requestedDate: '2024-09-15',
    },
    {
      id: 'INS-007',
      type: 'Final',
      subType: 'Final Building',
      unit: 'Unit 1',
      scheduledDate: '2024-12-15',
      scheduledTime: '09:00 AM',
      completedDate: '2024-12-15',
      inspector: 'John Smith',
      inspectorPhone: '(555) 123-4567',
      agency: 'City of Greenville',
      status: 'completed',
      result: 'passed',
      notes: 'Final building inspection passed. All systems operational.',
      deficiencies: [],
      photos: 5,
      requestedBy: 'Mike Johnson (GC)',
      requestedDate: '2024-12-10',
    },
    {
      id: 'INS-008',
      type: 'Bank Draw',
      subType: 'Draw #12',
      unit: 'All Units',
      scheduledDate: '2024-12-12',
      scheduledTime: '02:00 PM',
      completedDate: '2024-12-12',
      inspector: 'Bank Inspector',
      inspectorPhone: '(555) 345-6789',
      agency: 'First National Bank',
      status: 'completed',
      result: 'passed',
      notes: 'Draw inspection completed. 68% completion verified. Draw approved for $445,000.',
      deficiencies: [],
      photos: 8,
      requestedBy: 'Bryan VanRock',
      requestedDate: '2024-12-08',
    },
    // Completed - Failed
    {
      id: 'INS-009',
      type: 'Framing',
      subType: 'Rough Framing',
      unit: 'Unit 3',
      scheduledDate: '2024-10-05',
      scheduledTime: '09:00 AM',
      completedDate: '2024-10-05',
      inspector: 'John Smith',
      inspectorPhone: '(555) 123-4567',
      agency: 'City of Greenville',
      status: 'completed',
      result: 'failed',
      notes: 'Initial framing inspection failed. Issues identified - see deficiencies.',
      deficiencies: [
        { item: 'Missing hurricane clips at 3 locations', resolved: true, resolvedDate: '2024-10-08' },
        { item: 'Improper header size at garage opening', resolved: true, resolvedDate: '2024-10-07' },
      ],
      photos: 4,
      requestedBy: 'Mike Johnson (GC)',
      requestedDate: '2024-10-02',
    },
    {
      id: 'INS-010',
      type: 'Framing',
      subType: 'Re-inspection',
      unit: 'Unit 3',
      scheduledDate: '2024-10-10',
      scheduledTime: '09:00 AM',
      completedDate: '2024-10-10',
      inspector: 'John Smith',
      inspectorPhone: '(555) 123-4567',
      agency: 'City of Greenville',
      status: 'completed',
      result: 'passed',
      notes: 'Re-inspection passed. All deficiencies corrected.',
      deficiencies: [],
      photos: 2,
      requestedBy: 'Mike Johnson (GC)',
      requestedDate: '2024-10-08',
    },
  ]);

  const [newInspection, setNewInspection] = useState({
    type: '',
    subType: '',
    unit: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
  });

  const inspectionTypes = [
    { type: 'Foundation', subTypes: ['Footing', 'Slab', 'Stem Wall'] },
    { type: 'Framing', subTypes: ['Rough Framing', 'Sheathing', 'Re-inspection'] },
    { type: 'Electrical', subTypes: ['Rough Electrical', 'Final Electrical', 'Service'] },
    { type: 'Plumbing', subTypes: ['Rough Plumbing', 'Final Plumbing', 'Water Test'] },
    { type: 'Mechanical', subTypes: ['HVAC Rough-in', 'HVAC Final', 'Ductwork'] },
    { type: 'Insulation', subTypes: ['Wall Insulation', 'Ceiling Insulation'] },
    { type: 'Drywall', subTypes: ['Drywall Inspection'] },
    { type: 'Final', subTypes: ['Final Building', 'Fire Final', 'Health Final'] },
    { type: 'Bank Draw', subTypes: ['Draw Inspection', 'Progress Inspection'] },
    { type: 'Other', subTypes: ['Other'] },
  ];

  const getStatusColor = (status, result) => {
    if (status === 'scheduled') return 'bg-blue-100 text-blue-700';
    if (status === 'in-progress') return 'bg-amber-100 text-amber-700';
    if (status === 'completed') {
      if (result === 'passed') return 'bg-green-100 text-green-700';
      if (result === 'failed') return 'bg-red-100 text-red-700';
      if (result === 'partial') return 'bg-amber-100 text-amber-700';
    }
    return 'bg-gray-100 text-gray-600';
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'partial': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const filteredInspections = inspections.filter(insp => {
    const matchesStatus = filterStatus === 'all' || insp.status === filterStatus;
    const matchesType = filterType === 'all' || insp.type === filterType;
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'scheduled' && insp.status === 'scheduled') ||
                       (activeTab === 'completed' && insp.status === 'completed');
    return matchesStatus && matchesType && matchesTab;
  }).sort((a, b) => {
    // Sort by date - scheduled first (upcoming), then completed (most recent)
    if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
    if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
    return new Date(b.scheduledDate) - new Date(a.scheduledDate);
  });

  const scheduledCount = inspections.filter(i => i.status === 'scheduled').length;
  const passedCount = inspections.filter(i => i.result === 'passed').length;
  const failedCount = inspections.filter(i => i.result === 'failed').length;
  const passRate = ((passedCount / (passedCount + failedCount)) * 100).toFixed(0);

  const handleSaveInspection = () => {
    const inspection = {
      id: `INS-${String(inspections.length + 1).padStart(3, '0')}`,
      ...newInspection,
      inspector: 'TBD',
      inspectorPhone: '',
      agency: '',
      status: 'scheduled',
      result: null,
      completedDate: null,
      deficiencies: [],
      photos: 0,
      requestedBy: 'Bryan VanRock',
      requestedDate: new Date().toISOString().split('T')[0],
    };
    setInspections(prev => [...prev, inspection]);
    setShowInspectionModal(false);
    setNewInspection({ type: '', subType: '', unit: '', scheduledDate: '', scheduledTime: '', notes: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Inspections</h1>
          <p className="text-sm text-gray-500">Schedule and track inspections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowInspectionModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Schedule Inspection
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Inspections</p>
          <p className="text-2xl font-semibold">{inspections.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Scheduled</p>
          <p className="text-2xl font-semibold text-blue-600">{scheduledCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Passed</p>
          <p className="text-2xl font-semibold text-green-600">{passedCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Failed</p>
          <p className="text-2xl font-semibold text-red-600">{failedCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Pass Rate</p>
          <p className="text-2xl font-semibold">{passRate}%</p>
        </div>
      </div>

      {/* Upcoming Inspections Alert */}
      {scheduledCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-blue-800">Upcoming Inspections</p>
              <p className="text-sm text-blue-700">
                {inspections.filter(i => i.status === 'scheduled').slice(0, 3).map(i => `${i.type} (${i.unit}) - ${i.scheduledDate}`).join(' | ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('all')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'all' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          All ({inspections.length})
        </button>
        <button onClick={() => setActiveTab('scheduled')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'scheduled' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Scheduled ({scheduledCount})
        </button>
        <button onClick={() => setActiveTab('completed')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'completed' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Completed ({inspections.length - scheduledCount})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search inspections..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            {inspectionTypes.map(t => (
              <option key={t.type} value={t.type}>{t.type}</option>
            ))}
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Units</option>
            <option>Unit 1</option>
            <option>Unit 2</option>
            <option>Unit 3</option>
            <option>Unit 4</option>
            <option>Unit 5</option>
            <option>All Units</option>
          </select>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Inspection</th>
              <th className="text-left px-4 py-3 font-medium">Unit</th>
              <th className="text-left px-4 py-3 font-medium">Date/Time</th>
              <th className="text-left px-4 py-3 font-medium">Inspector</th>
              <th className="text-left px-4 py-3 font-medium">Agency</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Result</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredInspections.map((inspection) => (
              <tr key={inspection.id} className={cn("hover:bg-gray-50", inspection.result === 'failed' && "bg-red-50")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{inspection.type}</p>
                      <p className="text-xs text-gray-500">{inspection.subType}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{inspection.unit}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{inspection.scheduledDate}</p>
                    <p className="text-xs text-gray-500">{inspection.scheduledTime}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{inspection.inspector}</td>
                <td className="px-4 py-3 text-xs">{inspection.agency}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(inspection.status, inspection.result))}>
                    {inspection.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {inspection.result ? (
                    <div className="flex items-center gap-1">
                      {getResultIcon(inspection.result)}
                      <span className={cn("text-xs capitalize", inspection.result === 'passed' ? "text-green-600" : inspection.result === 'failed' ? "text-red-600" : "text-amber-600")}>
                        {inspection.result}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedInspection(inspection)}>
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Inspection Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Schedule Inspection</h3>
              <button onClick={() => setShowInspectionModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Inspection Type *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newInspection.type} onChange={(e) => setNewInspection(prev => ({ ...prev, type: e.target.value, subType: '' }))}>
                    <option value="">Select type...</option>
                    {inspectionTypes.map(t => (
                      <option key={t.type} value={t.type}>{t.type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Sub-Type *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newInspection.subType} onChange={(e) => setNewInspection(prev => ({ ...prev, subType: e.target.value }))} disabled={!newInspection.type}>
                    <option value="">Select sub-type...</option>
                    {newInspection.type && inspectionTypes.find(t => t.type === newInspection.type)?.subTypes.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Unit *</label>
                <select className="w-full border rounded-md px-3 py-2" value={newInspection.unit} onChange={(e) => setNewInspection(prev => ({ ...prev, unit: e.target.value }))}>
                  <option value="">Select unit...</option>
                  <option>Unit 1</option>
                  <option>Unit 2</option>
                  <option>Unit 3</option>
                  <option>Unit 4</option>
                  <option>Unit 5</option>
                  <option>Unit 6</option>
                  <option>Unit 7</option>
                  <option>Unit 8</option>
                  <option>Unit 9</option>
                  <option>Unit 10</option>
                  <option>Unit 11</option>
                  <option>Unit 12</option>
                  <option>All Units</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Scheduled Date *</label>
                  <Input type="date" value={newInspection.scheduledDate} onChange={(e) => setNewInspection(prev => ({ ...prev, scheduledDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Scheduled Time</label>
                  <Input type="time" value={newInspection.scheduledTime} onChange={(e) => setNewInspection(prev => ({ ...prev, scheduledTime: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={newInspection.notes} onChange={(e) => setNewInspection(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes for inspector..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowInspectionModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSaveInspection}>Schedule</Button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Detail Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedInspection.type} - {selectedInspection.subType}</h3>
                <p className="text-sm text-gray-500">{selectedInspection.id} • {selectedInspection.unit}</p>
              </div>
              <button onClick={() => setSelectedInspection(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status & Result */}
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedInspection.status, selectedInspection.result))}>
                  {selectedInspection.status}
                </span>
                {selectedInspection.result && (
                  <span className={cn("px-3 py-1 rounded text-sm capitalize flex items-center gap-1", selectedInspection.result === 'passed' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {getResultIcon(selectedInspection.result)}
                    {selectedInspection.result}
                  </span>
                )}
              </div>

              {/* Schedule Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Scheduled Date</p>
                  <p className="font-medium">{selectedInspection.scheduledDate} at {selectedInspection.scheduledTime}</p>
                </div>
                {selectedInspection.completedDate && (
                  <div>
                    <p className="text-gray-500">Completed Date</p>
                    <p className="font-medium">{selectedInspection.completedDate}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Requested By</p>
                  <p className="font-medium">{selectedInspection.requestedBy}</p>
                </div>
                <div>
                  <p className="text-gray-500">Request Date</p>
                  <p className="font-medium">{selectedInspection.requestedDate}</p>
                </div>
              </div>

              {/* Inspector Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">Inspector</p>
                <p className="font-medium">{selectedInspection.inspector}</p>
                <p className="text-sm text-gray-600">{selectedInspection.agency}</p>
                {selectedInspection.inspectorPhone && (
                  <p className="text-sm text-[#047857]">{selectedInspection.inspectorPhone}</p>
                )}
              </div>

              {/* Notes */}
              {selectedInspection.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedInspection.notes}</p>
                </div>
              )}

              {/* Deficiencies */}
              {selectedInspection.deficiencies.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-600 mb-2">Deficiencies ({selectedInspection.deficiencies.length})</p>
                  <div className="space-y-2">
                    {selectedInspection.deficiencies.map((def, idx) => (
                      <div key={idx} className={cn("flex items-center justify-between p-3 rounded-lg", def.resolved ? "bg-green-50" : "bg-red-50")}>
                        <div className="flex items-center gap-2">
                          {def.resolved ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                          <span className="text-sm">{def.item}</span>
                        </div>
                        {def.resolved && (
                          <span className="text-xs text-green-600">Resolved {def.resolvedDate}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedInspection.photos > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Camera className="w-4 h-4" />
                  <span>{selectedInspection.photos} photos attached</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setSelectedInspection(null)}>Close</Button>
              {selectedInspection.status === 'scheduled' && (
                <Button className="bg-[#047857] hover:bg-[#065f46]">Record Result</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionsPage;
