import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Send, Paperclip, RotateCcw, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SubmittalsPage = ({ projectId }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmittal, setSelectedSubmittal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [submittals, setSubmittals] = useState([
    {
      id: 'SUB-001',
      number: '03.30.001',
      title: 'Concrete Mix Design',
      specSection: '03 30 00',
      description: 'Foundation and slab concrete mix design submittal including 4000 PSI and 5000 PSI mixes.',
      submittedBy: 'Foundation Pro',
      submittedDate: '2024-11-01',
      requiredDate: '2024-11-15',
      assignedTo: 'Structural Engineer',
      status: 'approved',
      reviewDate: '2024-11-10',
      reviewedBy: 'Mike Johnson, PE',
      reviewComments: 'Approved as submitted. Ensure batch tickets match approved mix numbers.',
      revision: 0,
      attachments: 3,
      leadTime: '5 days',
    },
    {
      id: 'SUB-002',
      number: '06.10.001',
      title: 'Framing Lumber & Hardware',
      specSection: '06 10 00',
      description: 'Wood framing materials including dimensional lumber, engineered wood products, and connectors.',
      submittedBy: 'Smith Framing',
      submittedDate: '2024-11-15',
      requiredDate: '2024-11-30',
      assignedTo: 'Architect',
      status: 'approved-as-noted',
      reviewDate: '2024-11-22',
      reviewedBy: 'Johnson Architects',
      reviewComments: 'Approved as noted. Use Simpson HDU2 holdowns in lieu of submitted HDU5. See markups.',
      revision: 1,
      attachments: 5,
      leadTime: '2 weeks',
    },
    {
      id: 'SUB-003',
      number: '08.50.001',
      title: 'Windows & Doors',
      specSection: '08 50 00',
      description: 'Milgard Essence Series windows and Therma-Tru entry doors.',
      submittedBy: 'Glass Masters',
      submittedDate: '2024-12-01',
      requiredDate: '2024-12-15',
      assignedTo: 'Architect',
      status: 'pending',
      reviewDate: null,
      reviewedBy: null,
      reviewComments: null,
      revision: 0,
      attachments: 8,
      leadTime: '6 weeks',
    },
    {
      id: 'SUB-004',
      number: '07.21.001',
      title: 'Roof Insulation',
      specSection: '07 21 00',
      description: 'R-49 blown insulation for cathedral ceiling areas.',
      submittedBy: 'Insulation Pros',
      submittedDate: '2024-12-05',
      requiredDate: '2024-12-20',
      assignedTo: 'Architect',
      status: 'revise-resubmit',
      reviewDate: '2024-12-12',
      reviewedBy: 'Johnson Architects',
      reviewComments: 'R-value insufficient for cathedral areas. Resubmit with R-60 minimum or provide thermal calculation.',
      revision: 0,
      attachments: 2,
      leadTime: '1 week',
    },
    {
      id: 'SUB-005',
      number: '22.00.001',
      title: 'Plumbing Fixtures',
      specSection: '22 00 00',
      description: 'Kohler bathroom fixtures and Delta kitchen fixtures package.',
      submittedBy: 'ABC Plumbing',
      submittedDate: '2024-12-10',
      requiredDate: '2024-12-24',
      assignedTo: 'Architect',
      status: 'pending',
      reviewDate: null,
      reviewedBy: null,
      reviewComments: null,
      revision: 0,
      attachments: 4,
      leadTime: '4 weeks',
    },
    {
      id: 'SUB-006',
      number: '23.00.001',
      title: 'HVAC Equipment',
      specSection: '23 00 00',
      description: 'Carrier Infinity Series heat pumps and air handlers.',
      submittedBy: 'Cool Air HVAC',
      submittedDate: '2024-11-20',
      requiredDate: '2024-12-05',
      assignedTo: 'MEP Engineer',
      status: 'approved',
      reviewDate: '2024-11-28',
      reviewedBy: 'MEP Engineering',
      reviewComments: 'Approved. Verify refrigerant line sizes match equipment requirements.',
      revision: 0,
      attachments: 6,
      leadTime: '3 weeks',
    },
    {
      id: 'SUB-007',
      number: '09.29.001',
      title: 'Interior Paint Colors',
      specSection: '09 29 00',
      description: 'Sherwin-Williams interior paint color schedule and specifications.',
      submittedBy: 'Paint Crew',
      submittedDate: '2024-12-15',
      requiredDate: '2024-12-30',
      assignedTo: 'Owner',
      status: 'pending',
      reviewDate: null,
      reviewedBy: null,
      reviewComments: null,
      revision: 0,
      attachments: 2,
      leadTime: '3 days',
    },
    {
      id: 'SUB-008',
      number: '26.00.001',
      title: 'Electrical Panel Schedule',
      specSection: '26 00 00',
      description: 'Main panel schedules and circuit layouts for all units.',
      submittedBy: 'Sparks Electric',
      submittedDate: '2024-11-25',
      requiredDate: '2024-12-10',
      assignedTo: 'MEP Engineer',
      status: 'rejected',
      reviewDate: '2024-12-02',
      reviewedBy: 'MEP Engineering',
      reviewComments: 'Rejected. Panel size inadequate per CO-004. Resubmit with 200A panels.',
      revision: 0,
      attachments: 3,
      leadTime: '2 weeks',
    },
  ]);

  const [formData, setFormData] = useState({
    number: '',
    title: '',
    specSection: '',
    description: '',
    assignedTo: '',
    requiredDate: '',
    leadTime: '',
  });

  const filteredSubmittals = submittals.filter(sub => {
    if (filterStatus === 'all') return true;
    return sub.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'approved-as-noted': return 'bg-emerald-100 text-emerald-700';
      case 'revise-resubmit': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved-as-noted': return 'Approved as Noted';
      case 'revise-resubmit': return 'Revise & Resubmit';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const pendingSubmittals = submittals.filter(s => s.status === 'pending').length;
  const overdueSubmittals = submittals.filter(s => s.status === 'pending' && new Date(s.requiredDate) < new Date()).length;
  const approvedSubmittals = submittals.filter(s => s.status === 'approved' || s.status === 'approved-as-noted').length;
  const needsRevision = submittals.filter(s => s.status === 'revise-resubmit' || s.status === 'rejected').length;

  const handleSave = () => {
    const newSubmittal = {
      id: `SUB-${String(submittals.length + 1).padStart(3, '0')}`,
      ...formData,
      submittedBy: 'VanRock PM',
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      reviewDate: null,
      reviewedBy: null,
      reviewComments: null,
      revision: 0,
      attachments: 0,
    };
    setSubmittals(prev => [newSubmittal, ...prev]);
    setShowModal(false);
    setFormData({ number: '', title: '', specSection: '', description: '', assignedTo: '', requiredDate: '', leadTime: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Submittals</h1>
          <p className="text-sm text-gray-500">Product data, shop drawings, and samples</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export Log</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Submittal
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Submittals</p>
          <p className="text-2xl font-semibold">{submittals.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">Pending Review</p>
          <p className="text-2xl font-semibold text-blue-600">{pendingSubmittals}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">{overdueSubmittals}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-semibold text-green-600">{approvedSubmittals}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500">Needs Revision</p>
          <p className="text-2xl font-semibold text-amber-600">{needsRevision}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search submittals..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="approved-as-noted">Approved as Noted</option>
            <option value="revise-resubmit">Revise & Resubmit</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Spec Sections</option>
            <option>03 - Concrete</option>
            <option>06 - Wood & Plastics</option>
            <option>07 - Thermal & Moisture</option>
            <option>08 - Openings</option>
            <option>09 - Finishes</option>
            <option>22 - Plumbing</option>
            <option>23 - HVAC</option>
            <option>26 - Electrical</option>
          </select>
        </div>
      </div>

      {/* Submittals Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Number</th>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Spec Section</th>
              <th className="text-left px-4 py-3 font-medium">From</th>
              <th className="text-left px-4 py-3 font-medium">Assigned To</th>
              <th className="text-left px-4 py-3 font-medium">Required Date</th>
              <th className="text-left px-4 py-3 font-medium">Lead Time</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSubmittals.map((sub) => (
              <tr key={sub.id} className={cn("hover:bg-gray-50", sub.status === 'pending' && new Date(sub.requiredDate) < new Date() && "bg-red-50")}>
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium text-[#047857]">{sub.number}</span>
                    {sub.revision > 0 && <span className="text-xs text-gray-500 ml-1">Rev {sub.revision}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{sub.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />{sub.attachments} files
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-mono">{sub.specSection}</td>
                <td className="px-4 py-3 text-xs">{sub.submittedBy}</td>
                <td className="px-4 py-3 text-xs">{sub.assignedTo}</td>
                <td className="px-4 py-3">
                  <div className={cn("text-xs", sub.status === 'pending' && new Date(sub.requiredDate) < new Date() && "text-red-600 font-medium")}>
                    {sub.requiredDate}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{sub.leadTime}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs", getStatusColor(sub.status))}>
                    {getStatusLabel(sub.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded" title="View" onClick={() => setSelectedSubmittal(sub)}>
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    {(sub.status === 'revise-resubmit' || sub.status === 'rejected') && (
                      <button className="p-1 hover:bg-blue-100 rounded" title="Resubmit">
                        <RotateCcw className="w-4 h-4 text-blue-500" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Submittal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Submittal</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Submittal Number *</label>
                  <Input value={formData.number} onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))} placeholder="e.g., 03.30.001" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Spec Section *</label>
                  <Input value={formData.specSection} onChange={(e) => setFormData(prev => ({ ...prev, specSection: e.target.value }))} placeholder="e.g., 03 30 00" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Title *</label>
                <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Submittal title" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2" 
                  rows={3} 
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                  placeholder="Detailed description of submittal contents..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Assigned To *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.assignedTo} onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}>
                    <option value="">Select...</option>
                    <option>Architect</option>
                    <option>Structural Engineer</option>
                    <option>MEP Engineer</option>
                    <option>Owner</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Required Date *</label>
                  <Input type="date" value={formData.requiredDate} onChange={(e) => setFormData(prev => ({ ...prev, requiredDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Material Lead Time</label>
                <Input value={formData.leadTime} onChange={(e) => setFormData(prev => ({ ...prev, leadTime: e.target.value }))} placeholder="e.g., 4 weeks" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Attachments</label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Paperclip className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Drag & drop files or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">Product data, shop drawings, samples, etc.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>
                <Send className="w-4 h-4 mr-1" />Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submittal Detail Modal */}
      {selectedSubmittal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedSubmittal.number}</h3>
                <p className="text-sm text-gray-500">Spec Section {selectedSubmittal.specSection}</p>
              </div>
              <button onClick={() => setSelectedSubmittal(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm", getStatusColor(selectedSubmittal.status))}>
                  {getStatusLabel(selectedSubmittal.status)}
                </span>
                {selectedSubmittal.revision > 0 && (
                  <span className="text-sm text-gray-500">Revision {selectedSubmittal.revision}</span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-lg font-semibold mb-2">{selectedSubmittal.title}</h4>
                <p className="text-sm text-gray-600">{selectedSubmittal.description}</p>
              </div>

              {/* Submission Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Submitted</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">From</p>
                    <p className="font-medium">{selectedSubmittal.submittedBy}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium">{selectedSubmittal.submittedDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Required By</p>
                    <p className="font-medium">{selectedSubmittal.requiredDate}</p>
                  </div>
                </div>
              </div>

              {/* Review Comments */}
              {selectedSubmittal.reviewComments ? (
                <div className={cn("rounded-lg p-4", selectedSubmittal.status === 'approved' || selectedSubmittal.status === 'approved-as-noted' ? "bg-green-50" : selectedSubmittal.status === 'rejected' ? "bg-red-50" : "bg-amber-50")}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedSubmittal.status === 'approved' || selectedSubmittal.status === 'approved-as-noted' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : selectedSubmittal.status === 'rejected' ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className={cn("text-sm font-medium", selectedSubmittal.status === 'approved' || selectedSubmittal.status === 'approved-as-noted' ? "text-green-800" : selectedSubmittal.status === 'rejected' ? "text-red-800" : "text-amber-800")}>
                      Review Comments
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{selectedSubmittal.reviewComments}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    <span>Reviewed by: {selectedSubmittal.reviewedBy}</span>
                    <span>{selectedSubmittal.reviewDate}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Awaiting review by {selectedSubmittal.assignedTo}</span>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Lead Time</p>
                  <p className="font-medium">{selectedSubmittal.leadTime}</p>
                </div>
                <div>
                  <p className="text-gray-500">Attachments</p>
                  <p className="font-medium">{selectedSubmittal.attachments} files</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedSubmittal.attachments > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Attached Files</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Product_Data.pdf</span>
                      </div>
                      <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Shop_Drawings.pdf</span>
                      </div>
                      <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm">
                <Paperclip className="w-4 h-4 mr-1" />Add Attachment
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedSubmittal(null)}>Close</Button>
                {selectedSubmittal.status === 'pending' && (
                  <Button className="bg-[#047857] hover:bg-[#065f46]">Submit Review</Button>
                )}
                {(selectedSubmittal.status === 'revise-resubmit' || selectedSubmittal.status === 'rejected') && (
                  <Button className="bg-[#047857] hover:bg-[#065f46]">
                    <RotateCcw className="w-4 h-4 mr-1" />Resubmit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmittalsPage;
