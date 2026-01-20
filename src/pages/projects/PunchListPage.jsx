import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, CheckCircle, Clock, AlertTriangle, Camera, MapPin, User, Calendar, Filter, Download, Printer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PunchListPage = ({ projectId }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const [punchItems, setPunchItems] = useState([
    {
      id: 'PL-001',
      description: 'Touch up paint on living room wall - scuff marks near entry',
      location: 'Unit 1',
      area: 'Living Room',
      trade: 'Paint',
      assignedTo: 'Paint Crew',
      priority: 'low',
      status: 'complete',
      createdDate: '2024-12-15',
      dueDate: '2024-12-20',
      completedDate: '2024-12-18',
      photos: 2,
      notes: 'Touched up with matching SW 7015',
    },
    {
      id: 'PL-002',
      description: 'Adjust cabinet door - not closing flush',
      location: 'Unit 1',
      area: 'Kitchen',
      trade: 'Carpentry',
      assignedTo: 'Smith Framing',
      priority: 'medium',
      status: 'complete',
      createdDate: '2024-12-15',
      dueDate: '2024-12-20',
      completedDate: '2024-12-19',
      photos: 1,
      notes: 'Adjusted hinges and door now closes properly',
    },
    {
      id: 'PL-003',
      description: 'Caulk gap at tub/tile intersection',
      location: 'Unit 1',
      area: 'Master Bath',
      trade: 'Tile',
      assignedTo: 'Tile Works',
      priority: 'high',
      status: 'in-progress',
      createdDate: '2024-12-16',
      dueDate: '2024-12-21',
      completedDate: null,
      photos: 2,
      notes: '',
    },
    {
      id: 'PL-004',
      description: 'GFCI outlet not working in garage',
      location: 'Unit 2',
      area: 'Garage',
      trade: 'Electrical',
      assignedTo: 'Sparks Electric',
      priority: 'high',
      status: 'open',
      createdDate: '2024-12-18',
      dueDate: '2024-12-22',
      completedDate: null,
      photos: 1,
      notes: 'May need new GFCI - tripped and won\'t reset',
    },
    {
      id: 'PL-005',
      description: 'Drywall crack above window - settling crack',
      location: 'Unit 2',
      area: 'Bedroom 2',
      trade: 'Drywall',
      assignedTo: 'Drywall Pro',
      priority: 'medium',
      status: 'open',
      createdDate: '2024-12-18',
      dueDate: '2024-12-23',
      completedDate: null,
      photos: 3,
      notes: 'Tape and float, then paint',
    },
    {
      id: 'PL-006',
      description: 'Toilet running - flapper valve',
      location: 'Unit 3',
      area: 'Hall Bath',
      trade: 'Plumbing',
      assignedTo: 'ABC Plumbing',
      priority: 'medium',
      status: 'in-progress',
      createdDate: '2024-12-19',
      dueDate: '2024-12-22',
      completedDate: null,
      photos: 0,
      notes: 'Scheduled for 12/21',
    },
    {
      id: 'PL-007',
      description: 'Missing outlet cover plate',
      location: 'Unit 3',
      area: 'Master Bedroom',
      trade: 'Electrical',
      assignedTo: 'Sparks Electric',
      priority: 'low',
      status: 'open',
      createdDate: '2024-12-19',
      dueDate: '2024-12-24',
      completedDate: null,
      photos: 1,
      notes: '',
    },
    {
      id: 'PL-008',
      description: 'Squeaky floor near stairs',
      location: 'Unit 4',
      area: 'Hallway',
      trade: 'Carpentry',
      assignedTo: 'Smith Framing',
      priority: 'low',
      status: 'open',
      createdDate: '2024-12-20',
      dueDate: '2024-12-27',
      completedDate: null,
      photos: 0,
      notes: 'May need to screw subfloor to joists',
    },
    {
      id: 'PL-009',
      description: 'Weather stripping gap at front door',
      location: 'Unit 4',
      area: 'Entry',
      trade: 'Doors',
      assignedTo: 'Glass Masters',
      priority: 'high',
      status: 'open',
      createdDate: '2024-12-20',
      dueDate: '2024-12-23',
      completedDate: null,
      photos: 2,
      notes: 'Daylight visible at bottom of door',
    },
    {
      id: 'PL-010',
      description: 'HVAC register not opening fully',
      location: 'Unit 4',
      area: 'Great Room',
      trade: 'HVAC',
      assignedTo: 'Cool Air HVAC',
      priority: 'medium',
      status: 'open',
      createdDate: '2024-12-21',
      dueDate: '2024-12-26',
      completedDate: null,
      photos: 1,
      notes: 'Damper may be stuck',
    },
  ]);

  const [formData, setFormData] = useState({
    description: '',
    location: '',
    area: '',
    trade: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    notes: '',
  });

  const locations = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Common Area', 'Exterior'];
  const trades = ['Paint', 'Carpentry', 'Drywall', 'Electrical', 'Plumbing', 'HVAC', 'Tile', 'Doors', 'Flooring', 'General'];

  const filteredItems = punchItems.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterLocation !== 'all' && item.location !== filterLocation) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700';
      case 'in-progress': return 'bg-amber-100 text-amber-700';
      case 'complete': return 'bg-green-100 text-green-700';
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

  const openItems = punchItems.filter(p => p.status === 'open').length;
  const inProgressItems = punchItems.filter(p => p.status === 'in-progress').length;
  const completeItems = punchItems.filter(p => p.status === 'complete').length;
  const completionRate = Math.round((completeItems / punchItems.length) * 100);

  // Group by location for summary
  const itemsByLocation = locations.map(loc => ({
    location: loc,
    total: punchItems.filter(p => p.location === loc).length,
    open: punchItems.filter(p => p.location === loc && p.status !== 'complete').length,
  })).filter(l => l.total > 0);

  const handleSave = () => {
    const newItem = {
      id: `PL-${String(punchItems.length + 1).padStart(3, '0')}`,
      ...formData,
      status: 'open',
      createdDate: new Date().toISOString().split('T')[0],
      completedDate: null,
      photos: 0,
    };
    setPunchItems(prev => [newItem, ...prev]);
    setShowModal(false);
    setFormData({ description: '', location: '', area: '', trade: '', assignedTo: '', priority: 'medium', dueDate: '', notes: '' });
  };

  const markComplete = (id) => {
    setPunchItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'complete', completedDate: new Date().toISOString().split('T')[0] } : item
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Punch List</h1>
          <p className="text-sm text-gray-500">Final walkthrough items and corrections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-1" />Print</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-semibold">{punchItems.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-2xl font-semibold text-red-600">{openItems}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-semibold text-amber-600">{inProgressItems}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Complete</p>
          <p className="text-2xl font-semibold text-green-600">{completeItems}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Completion</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold">{completionRate}%</p>
            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Summary */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-3">Items by Location</h3>
        <div className="flex gap-4">
          {itemsByLocation.map(loc => (
            <div key={loc.location} className={cn("flex-1 rounded-lg p-3 text-center", loc.open > 0 ? "bg-amber-50" : "bg-green-50")}>
              <p className="text-sm font-medium">{loc.location}</p>
              <p className="text-xl font-semibold">{loc.open} <span className="text-sm font-normal text-gray-500">/ {loc.total}</span></p>
              <p className="text-xs text-gray-500">remaining</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search items..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
            <option value="all">All Locations</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Trades</option>
            {trades.map(trade => <option key={trade} value={trade}>{trade}</option>)}
          </select>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode('list')} className={cn("px-3 py-1 rounded text-sm", viewMode === 'list' && "bg-white shadow")}>List</button>
            <button onClick={() => setViewMode('grid')} className={cn("px-3 py-1 rounded text-sm", viewMode === 'grid' && "bg-white shadow")}>Grid</button>
          </div>
        </div>
      </div>

      {/* Punch List Items */}
      {viewMode === 'list' ? (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-8 px-4 py-3"></th>
                <th className="text-left px-4 py-3 font-medium">Item</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
                <th className="text-left px-4 py-3 font-medium">Trade</th>
                <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                <th className="text-left px-4 py-3 font-medium">Due Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map((item) => (
                <tr key={item.id} className={cn("hover:bg-gray-50", item.status === 'complete' && "opacity-60")}>
                  <td className="px-4 py-3">
                    <div className={cn("w-2 h-2 rounded-full", getPriorityColor(item.priority))} title={`${item.priority} priority`}></div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{item.id}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      {item.photos > 0 && <span className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Camera className="w-3 h-3" />{item.photos}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <div>
                        <p>{item.location}</p>
                        <p className="text-gray-500">{item.area}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{item.trade}</td>
                  <td className="px-4 py-3 text-xs">{item.assignedTo}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={cn(new Date(item.dueDate) < new Date() && item.status !== 'complete' && "text-red-600 font-medium")}>
                      {item.dueDate}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(item.status))}>
                      {item.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View" onClick={() => setSelectedItem(item)}>
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      {item.status !== 'complete' && (
                        <button className="p-1 hover:bg-green-100 rounded" title="Mark Complete" onClick={() => markComplete(item.id)}>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className={cn("bg-white border rounded-lg p-4 hover:shadow-md transition-shadow", item.status === 'complete' && "opacity-60")}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", getPriorityColor(item.priority))}></div>
                  <span className="font-medium text-[#047857]">{item.id}</span>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getStatusColor(item.status))}>
                  {item.status.replace('-', ' ')}
                </span>
              </div>
              <p className="text-sm mb-3">{item.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location} - {item.area}</span>
                {item.photos > 0 && <span className="flex items-center gap-1"><Camera className="w-3 h-3" />{item.photos}</span>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-xs text-gray-500">{item.trade}</span>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedItem(item)}>
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                  {item.status !== 'complete' && (
                    <button className="p-1 hover:bg-green-100 rounded" onClick={() => markComplete(item.id)}>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Add Punch List Item</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2" 
                  rows={2} 
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                  placeholder="Describe the issue..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Location *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}>
                    <option value="">Select...</option>
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Area</label>
                  <Input value={formData.area} onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))} placeholder="e.g., Kitchen, Master Bath" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Trade *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.trade} onChange={(e) => setFormData(prev => ({ ...prev, trade: e.target.value }))}>
                    <option value="">Select...</option>
                    {trades.map(trade => <option key={trade} value={trade}>{trade}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Assigned To</label>
                  <Input value={formData.assignedTo} onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))} placeholder="Contractor name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Priority</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.priority} onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Due Date</label>
                  <Input type="date" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2" 
                  rows={2} 
                  value={formData.notes} 
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
                  placeholder="Additional notes..."
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Photos</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Camera className="w-6 h-6 mx-auto text-gray-300 mb-1" />
                  <p className="text-sm text-gray-500">Add photos</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>Add Item</Button>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{selectedItem.id}</h3>
                <div className={cn("w-2 h-2 rounded-full", getPriorityColor(selectedItem.priority))}></div>
              </div>
              <button onClick={() => setSelectedItem(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedItem.status))}>
                  {selectedItem.status.replace('-', ' ')}
                </span>
                <span className="text-xs text-gray-500 capitalize">{selectedItem.priority} priority</span>
              </div>

              <div>
                <p className="text-lg">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium">{selectedItem.location} - {selectedItem.area}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Assigned To</p>
                    <p className="font-medium">{selectedItem.assignedTo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Due Date</p>
                    <p className="font-medium">{selectedItem.dueDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500">Trade</p>
                  <p className="font-medium">{selectedItem.trade}</p>
                </div>
              </div>

              {selectedItem.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedItem.notes}</p>
                </div>
              )}

              {selectedItem.completedDate && (
                <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Completed</p>
                    <p className="text-xs text-green-600">{selectedItem.completedDate}</p>
                  </div>
                </div>
              )}

              {selectedItem.photos > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Photos ({selectedItem.photos})</p>
                  <div className="flex gap-2">
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
                {selectedItem.status !== 'complete' && (
                  <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => { markComplete(selectedItem.id); setSelectedItem(null); }}>
                    <CheckCircle className="w-4 h-4 mr-1" />Mark Complete
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

export default PunchListPage;
