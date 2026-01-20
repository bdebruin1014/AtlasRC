import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit2, X, MessageSquare, Clock, CheckCircle, AlertTriangle, Send, Paperclip, User, Calendar, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const RFIsPage = ({ projectId }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRFI, setSelectedRFI] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [rfis, setRfis] = useState([
    {
      id: 'RFI-001',
      subject: 'Foundation wall thickness clarification',
      description: 'Drawing A-101 shows 8" foundation walls but structural notes indicate 10". Please clarify which dimension is correct.',
      category: 'Structural',
      submittedBy: 'Smith Framing',
      submittedDate: '2024-12-20',
      assignedTo: 'Johnson Architects',
      dueDate: '2024-12-27',
      status: 'answered',
      priority: 'high',
      response: 'Use 10" foundation walls per structural calculations. Drawing A-101 will be revised in next ASI.',
      responseDate: '2024-12-23',
      responseBy: 'Mike Johnson, PE',
      costImpact: false,
      scheduleImpact: false,
      attachments: 2,
    },
    {
      id: 'RFI-002',
      subject: 'Window header size for 8\' opening',
      description: 'Plan shows (2) 2x10 header for 8\' window opening on north elevation. Typical detail shows (2) 2x12. Which is correct?',
      category: 'Structural',
      submittedBy: 'Smith Framing',
      submittedDate: '2024-12-22',
      assignedTo: 'Johnson Architects',
      dueDate: '2024-12-29',
      status: 'open',
      priority: 'high',
      response: null,
      responseDate: null,
      responseBy: null,
      costImpact: true,
      scheduleImpact: false,
      attachments: 1,
    },
    {
      id: 'RFI-003',
      subject: 'Electrical panel location conflict',
      description: 'Electrical plan shows panel in garage but HVAC plan shows air handler in same location. Please advise on relocation.',
      category: 'MEP Coordination',
      submittedBy: 'Sparks Electric',
      submittedDate: '2024-12-18',
      assignedTo: 'MEP Engineer',
      dueDate: '2024-12-25',
      status: 'overdue',
      priority: 'critical',
      response: null,
      responseDate: null,
      responseBy: null,
      costImpact: true,
      scheduleImpact: true,
      attachments: 3,
    },
    {
      id: 'RFI-004',
      subject: 'Exterior paint color confirmation',
      description: 'Owner has requested review of exterior paint colors. Please confirm SW 7015 Repose Gray for siding and SW 7069 Iron Ore for trim.',
      category: 'Finishes',
      submittedBy: 'VanRock PM',
      submittedDate: '2024-12-15',
      assignedTo: 'Owner',
      dueDate: '2024-12-22',
      status: 'answered',
      priority: 'low',
      response: 'Colors approved as submitted. Proceed with SW 7015 for siding and SW 7069 for trim.',
      responseDate: '2024-12-19',
      responseBy: 'Bryan VanRock',
      costImpact: false,
      scheduleImpact: false,
      attachments: 0,
    },
    {
      id: 'RFI-005',
      subject: 'Slab reinforcement at garage door',
      description: 'Is additional slab reinforcement required at 16\' garage door opening? Structural drawings are unclear.',
      category: 'Structural',
      submittedBy: 'Foundation Pro',
      submittedDate: '2024-12-10',
      assignedTo: 'Johnson Architects',
      dueDate: '2024-12-17',
      status: 'closed',
      priority: 'medium',
      response: 'Add #4 rebar @ 12" O.C. each way for 3\' beyond door opening. See attached sketch.',
      responseDate: '2024-12-14',
      responseBy: 'Mike Johnson, PE',
      costImpact: true,
      scheduleImpact: false,
      attachments: 1,
    },
    {
      id: 'RFI-006',
      subject: 'HVAC duct routing through trusses',
      description: 'Trusses do not have adequate openings for 8" duct runs shown on HVAC plans. Request truss modifications or alternate routing.',
      category: 'MEP Coordination',
      submittedBy: 'Cool Air HVAC',
      submittedDate: '2024-12-24',
      assignedTo: 'Truss Manufacturer',
      dueDate: '2024-12-31',
      status: 'open',
      priority: 'high',
      response: null,
      responseDate: null,
      responseBy: null,
      costImpact: true,
      scheduleImpact: true,
      attachments: 2,
    },
  ]);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'Structural',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
  });

  const filteredRFIs = rfis.filter(rfi => {
    if (filterStatus === 'all') return true;
    return rfi.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'answered': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-600';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const openRFIs = rfis.filter(r => r.status === 'open').length;
  const overdueRFIs = rfis.filter(r => r.status === 'overdue').length;
  const avgResponseDays = 4.2;

  const handleSave = () => {
    const newRFI = {
      id: `RFI-${String(rfis.length + 1).padStart(3, '0')}`,
      ...formData,
      submittedBy: 'VanRock PM',
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'open',
      response: null,
      responseDate: null,
      responseBy: null,
      costImpact: false,
      scheduleImpact: false,
      attachments: 0,
    };
    setRfis(prev => [newRFI, ...prev]);
    setShowModal(false);
    setFormData({ subject: '', description: '', category: 'Structural', assignedTo: '', dueDate: '', priority: 'medium' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">RFIs</h1>
          <p className="text-sm text-gray-500">Requests for Information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New RFI
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total RFIs</p>
          <p className="text-2xl font-semibold">{rfis.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-2xl font-semibold text-blue-600">{openRFIs}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">{overdueRFIs}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Answered</p>
          <p className="text-2xl font-semibold text-green-600">{rfis.filter(r => r.status === 'answered' || r.status === 'closed').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Avg Response</p>
          <p className="text-2xl font-semibold">{avgResponseDays} days</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search RFIs..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="overdue">Overdue</option>
            <option value="closed">Closed</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Categories</option>
            <option>Structural</option>
            <option>MEP Coordination</option>
            <option>Finishes</option>
            <option>Site Work</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* RFI Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">RFI #</th>
              <th className="text-left px-4 py-3 font-medium">Subject</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">From</th>
              <th className="text-left px-4 py-3 font-medium">Assigned To</th>
              <th className="text-left px-4 py-3 font-medium">Due Date</th>
              <th className="text-left px-4 py-3 font-medium">Priority</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRFIs.map((rfi) => (
              <tr key={rfi.id} className={cn("hover:bg-gray-50", rfi.status === 'overdue' && "bg-red-50")}>
                <td className="px-4 py-3">
                  <span className="font-medium text-[#047857]">{rfi.id}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{rfi.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {rfi.costImpact && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">$ Impact</span>}
                      {rfi.scheduleImpact && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Schedule Impact</span>}
                      {rfi.attachments > 0 && <span className="text-xs text-gray-500 flex items-center gap-0.5"><Paperclip className="w-3 h-3" />{rfi.attachments}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{rfi.category}</td>
                <td className="px-4 py-3 text-xs">{rfi.submittedBy}</td>
                <td className="px-4 py-3 text-xs">{rfi.assignedTo}</td>
                <td className="px-4 py-3">
                  <div className={cn("text-xs", new Date(rfi.dueDate) < new Date() && rfi.status === 'open' && "text-red-600 font-medium")}>
                    {rfi.dueDate}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getPriorityColor(rfi.priority))}>
                    {rfi.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(rfi.status))}>
                    {rfi.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded" title="View" onClick={() => setSelectedRFI(rfi)}>
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New RFI Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New RFI</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Subject *</label>
                <Input value={formData.subject} onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))} placeholder="Brief description of the question" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2" 
                  rows={4} 
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                  placeholder="Provide detailed description of the information needed..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Category *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                    <option>Structural</option>
                    <option>MEP Coordination</option>
                    <option>Finishes</option>
                    <option>Site Work</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Priority *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.priority} onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Assigned To *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.assignedTo} onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}>
                    <option value="">Select...</option>
                    <option>Johnson Architects</option>
                    <option>MEP Engineer</option>
                    <option>Structural Engineer</option>
                    <option>Owner</option>
                    <option>General Contractor</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Response Due Date *</label>
                  <Input type="date" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Attachments</label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Paperclip className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Drag & drop files or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, images, or drawings</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>
                <Send className="w-4 h-4 mr-1" />Submit RFI
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RFI Detail Modal */}
      {selectedRFI && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedRFI.id}</h3>
                <p className="text-sm text-gray-500">{selectedRFI.category}</p>
              </div>
              <button onClick={() => setSelectedRFI(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status & Priority */}
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedRFI.status))}>
                  {selectedRFI.status}
                </span>
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getPriorityColor(selectedRFI.priority))}>
                  {selectedRFI.priority} priority
                </span>
                {selectedRFI.costImpact && <span className="text-sm bg-amber-100 text-amber-700 px-2 py-1 rounded">Cost Impact</span>}
                {selectedRFI.scheduleImpact && <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">Schedule Impact</span>}
              </div>

              {/* Subject */}
              <div>
                <h4 className="text-lg font-semibold">{selectedRFI.subject}</h4>
              </div>

              {/* Question */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Question</span>
                </div>
                <p className="text-sm text-gray-700">{selectedRFI.description}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200 text-xs text-gray-500">
                  <span>From: {selectedRFI.submittedBy}</span>
                  <span>{selectedRFI.submittedDate}</span>
                </div>
              </div>

              {/* Response */}
              {selectedRFI.response ? (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Response</span>
                  </div>
                  <p className="text-sm text-gray-700">{selectedRFI.response}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-200 text-xs text-gray-500">
                    <span>From: {selectedRFI.responseBy}</span>
                    <span>{selectedRFI.responseDate}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-800">Awaiting response from {selectedRFI.assignedTo}</span>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">Due: {selectedRFI.dueDate}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Assigned To</p>
                  <p className="font-medium">{selectedRFI.assignedTo}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium">{selectedRFI.dueDate}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedRFI.attachments > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Attachments ({selectedRFI.attachments})</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Drawing_A101_Markup.pdf</span>
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
                <Button variant="outline" onClick={() => setSelectedRFI(null)}>Close</Button>
                {selectedRFI.status === 'open' && (
                  <Button className="bg-[#047857] hover:bg-[#065f46]">
                    <Send className="w-4 h-4 mr-1" />Add Response
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

export default RFIsPage;
