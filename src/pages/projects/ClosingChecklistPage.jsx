import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Download, FileText, Calendar, CheckCircle, Circle, Clock, AlertTriangle, Home, User, DollarSign, ClipboardCheck, ChevronDown, ChevronRight, Phone, Mail, MapPin, Building2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ClosingChecklistPage = ({ projectId }) => {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState('unit-2');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showClosingModal, setShowClosingModal] = useState(false);

  const [units, setUnits] = useState([
    {
      id: 'unit-1',
      name: 'Unit 1',
      address: '1250 Oakridge Dr, Unit 1',
      buyer: 'Michael & Sarah Thompson',
      buyerEmail: 'thompson@email.com',
      buyerPhone: '(555) 111-2222',
      contractPrice: 420000,
      contractDate: '2024-10-15',
      closingDate: '2024-12-20',
      status: 'closed',
      agent: 'Sarah Agent',
      titleCompany: 'Greenville Title Services',
      lender: 'First Mortgage Corp',
      escrowAmount: 12000,
      completionPercent: 100,
      checklist: [
        { id: 1, category: 'Contract', item: 'Purchase agreement signed', status: 'complete', dueDate: '2024-10-15', completedDate: '2024-10-15', assignee: 'Sarah Agent', notes: '' },
        { id: 2, category: 'Contract', item: 'Earnest money deposited', status: 'complete', dueDate: '2024-10-18', completedDate: '2024-10-17', assignee: 'Title Company', notes: '$12,000 deposited' },
        { id: 3, category: 'Contract', item: 'Contract to title company', status: 'complete', dueDate: '2024-10-20', completedDate: '2024-10-18', assignee: 'Sarah Agent', notes: '' },
        { id: 4, category: 'Inspections', item: 'Buyer inspection complete', status: 'complete', dueDate: '2024-10-30', completedDate: '2024-10-28', assignee: 'Buyer', notes: 'Minor items noted' },
        { id: 5, category: 'Inspections', item: 'Inspection items resolved', status: 'complete', dueDate: '2024-11-10', completedDate: '2024-11-08', assignee: 'GC', notes: 'All items completed' },
        { id: 6, category: 'Financing', item: 'Loan application submitted', status: 'complete', dueDate: '2024-10-25', completedDate: '2024-10-22', assignee: 'Buyer', notes: '' },
        { id: 7, category: 'Financing', item: 'Appraisal ordered', status: 'complete', dueDate: '2024-11-01', completedDate: '2024-10-30', assignee: 'Lender', notes: '' },
        { id: 8, category: 'Financing', item: 'Appraisal received', status: 'complete', dueDate: '2024-11-15', completedDate: '2024-11-12', assignee: 'Lender', notes: 'Appraised at $425,000' },
        { id: 9, category: 'Financing', item: 'Clear to close', status: 'complete', dueDate: '2024-12-10', completedDate: '2024-12-08', assignee: 'Lender', notes: '' },
        { id: 10, category: 'Title', item: 'Title search complete', status: 'complete', dueDate: '2024-11-15', completedDate: '2024-11-14', assignee: 'Title Company', notes: 'Clear title' },
        { id: 11, category: 'Title', item: 'Title commitment issued', status: 'complete', dueDate: '2024-11-20', completedDate: '2024-11-18', assignee: 'Title Company', notes: '' },
        { id: 12, category: 'Construction', item: 'CO issued', status: 'complete', dueDate: '2024-12-15', completedDate: '2024-12-15', assignee: 'GC', notes: 'Certificate of Occupancy' },
        { id: 13, category: 'Construction', item: 'Final walkthrough', status: 'complete', dueDate: '2024-12-18', completedDate: '2024-12-18', assignee: 'Buyer', notes: 'Buyer satisfied' },
        { id: 14, category: 'Construction', item: 'Punch list complete', status: 'complete', dueDate: '2024-12-19', completedDate: '2024-12-19', assignee: 'GC', notes: '' },
        { id: 15, category: 'Closing', item: 'Closing docs prepared', status: 'complete', dueDate: '2024-12-18', completedDate: '2024-12-17', assignee: 'Title Company', notes: '' },
        { id: 16, category: 'Closing', item: 'Final figures confirmed', status: 'complete', dueDate: '2024-12-19', completedDate: '2024-12-19', assignee: 'Title Company', notes: '' },
        { id: 17, category: 'Closing', item: 'Closing complete', status: 'complete', dueDate: '2024-12-20', completedDate: '2024-12-20', assignee: 'All', notes: 'Closed on schedule' },
        { id: 18, category: 'Post-Closing', item: 'Keys delivered', status: 'complete', dueDate: '2024-12-20', completedDate: '2024-12-20', assignee: 'Sarah Agent', notes: '' },
        { id: 19, category: 'Post-Closing', item: 'Warranty package delivered', status: 'complete', dueDate: '2024-12-20', completedDate: '2024-12-20', assignee: 'Bryan VanRock', notes: '' },
      ],
    },
    {
      id: 'unit-2',
      name: 'Unit 2',
      address: '1250 Oakridge Dr, Unit 2',
      buyer: 'Jennifer Martinez',
      buyerEmail: 'jmartinez@email.com',
      buyerPhone: '(555) 333-4444',
      contractPrice: 385000,
      contractDate: '2024-11-20',
      closingDate: '2025-01-25',
      status: 'in-progress',
      agent: 'Sarah Agent',
      titleCompany: 'Greenville Title Services',
      lender: 'Bank of America',
      escrowAmount: 10000,
      completionPercent: 65,
      checklist: [
        { id: 1, category: 'Contract', item: 'Purchase agreement signed', status: 'complete', dueDate: '2024-11-20', completedDate: '2024-11-20', assignee: 'Sarah Agent', notes: '' },
        { id: 2, category: 'Contract', item: 'Earnest money deposited', status: 'complete', dueDate: '2024-11-23', completedDate: '2024-11-22', assignee: 'Title Company', notes: '$10,000 deposited' },
        { id: 3, category: 'Contract', item: 'Contract to title company', status: 'complete', dueDate: '2024-11-25', completedDate: '2024-11-23', assignee: 'Sarah Agent', notes: '' },
        { id: 4, category: 'Inspections', item: 'Buyer inspection complete', status: 'complete', dueDate: '2024-12-05', completedDate: '2024-12-03', assignee: 'Buyer', notes: '' },
        { id: 5, category: 'Inspections', item: 'Inspection items resolved', status: 'in-progress', dueDate: '2024-12-15', completedDate: null, assignee: 'GC', notes: '2 items remaining' },
        { id: 6, category: 'Financing', item: 'Loan application submitted', status: 'complete', dueDate: '2024-11-30', completedDate: '2024-11-28', assignee: 'Buyer', notes: '' },
        { id: 7, category: 'Financing', item: 'Appraisal ordered', status: 'complete', dueDate: '2024-12-05', completedDate: '2024-12-04', assignee: 'Lender', notes: '' },
        { id: 8, category: 'Financing', item: 'Appraisal received', status: 'complete', dueDate: '2024-12-20', completedDate: '2024-12-18', assignee: 'Lender', notes: 'Appraised at $390,000' },
        { id: 9, category: 'Financing', item: 'Clear to close', status: 'pending', dueDate: '2025-01-15', completedDate: null, assignee: 'Lender', notes: '' },
        { id: 10, category: 'Title', item: 'Title search complete', status: 'complete', dueDate: '2024-12-15', completedDate: '2024-12-12', assignee: 'Title Company', notes: '' },
        { id: 11, category: 'Title', item: 'Title commitment issued', status: 'complete', dueDate: '2024-12-20', completedDate: '2024-12-18', assignee: 'Title Company', notes: '' },
        { id: 12, category: 'Construction', item: 'CO issued', status: 'pending', dueDate: '2025-01-15', completedDate: null, assignee: 'GC', notes: '' },
        { id: 13, category: 'Construction', item: 'Final walkthrough', status: 'pending', dueDate: '2025-01-22', completedDate: null, assignee: 'Buyer', notes: '' },
        { id: 14, category: 'Construction', item: 'Punch list complete', status: 'pending', dueDate: '2025-01-24', completedDate: null, assignee: 'GC', notes: '' },
        { id: 15, category: 'Closing', item: 'Closing docs prepared', status: 'pending', dueDate: '2025-01-22', completedDate: null, assignee: 'Title Company', notes: '' },
        { id: 16, category: 'Closing', item: 'Final figures confirmed', status: 'pending', dueDate: '2025-01-24', completedDate: null, assignee: 'Title Company', notes: '' },
        { id: 17, category: 'Closing', item: 'Closing complete', status: 'pending', dueDate: '2025-01-25', completedDate: null, assignee: 'All', notes: '' },
        { id: 18, category: 'Post-Closing', item: 'Keys delivered', status: 'pending', dueDate: '2025-01-25', completedDate: null, assignee: 'Sarah Agent', notes: '' },
        { id: 19, category: 'Post-Closing', item: 'Warranty package delivered', status: 'pending', dueDate: '2025-01-25', completedDate: null, assignee: 'Bryan VanRock', notes: '' },
      ],
    },
    {
      id: 'unit-3',
      name: 'Unit 3',
      address: '1250 Oakridge Dr, Unit 3',
      buyer: null,
      buyerEmail: null,
      buyerPhone: null,
      contractPrice: null,
      contractDate: null,
      closingDate: null,
      status: 'available',
      agent: 'Sarah Agent',
      titleCompany: null,
      lender: null,
      escrowAmount: 0,
      completionPercent: 0,
      checklist: [],
    },
  ]);

  const categories = ['Contract', 'Inspections', 'Financing', 'Title', 'Construction', 'Closing', 'Post-Closing'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'closed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'complete': return 'bg-green-100 text-green-700';
      case 'available': return 'bg-gray-100 text-gray-600';
      case 'at-risk': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getItemStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Circle className="w-4 h-4 text-gray-300" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    return `$${value.toLocaleString()}`;
  };

  const getCompletedCount = (checklist) => {
    return checklist.filter(item => item.status === 'complete').length;
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'complete') return false;
    return new Date(dueDate) < new Date();
  };

  const toggleItem = (unitId, itemId) => {
    setUnits(prev => prev.map(unit => {
      if (unit.id === unitId) {
        const updatedChecklist = unit.checklist.map(item => {
          if (item.id === itemId) {
            const newStatus = item.status === 'complete' ? 'pending' : 'complete';
            return { ...item, status: newStatus, completedDate: newStatus === 'complete' ? new Date().toISOString().split('T')[0] : null };
          }
          return item;
        });
        const completedCount = updatedChecklist.filter(i => i.status === 'complete').length;
        return { ...unit, checklist: updatedChecklist, completionPercent: Math.round((completedCount / updatedChecklist.length) * 100) };
      }
      return unit;
    }));
  };

  const closedUnits = units.filter(u => u.status === 'closed').length;
  const inProgressUnits = units.filter(u => u.status === 'in-progress').length;
  const totalContractValue = units.filter(u => u.contractPrice).reduce((sum, u) => sum + u.contractPrice, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Closing Checklists</h1>
          <p className="text-sm text-gray-500">Track closings for all units</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowClosingModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Closing
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Units</p>
          <p className="text-2xl font-semibold">12</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Closed</p>
          <p className="text-2xl font-semibold text-green-600">{closedUnits}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Under Contract</p>
          <p className="text-2xl font-semibold text-blue-600">{inProgressUnits}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Available</p>
          <p className="text-2xl font-semibold">{12 - closedUnits - inProgressUnits}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Contract Value</p>
          <p className="text-xl font-semibold">{formatCurrency(totalContractValue)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search units or buyers..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="closed">Closed</option>
            <option value="in-progress">In Progress</option>
            <option value="available">Available</option>
          </select>
        </div>
      </div>

      {/* Units List */}
      <div className="space-y-4">
        {units.filter(u => filterStatus === 'all' || u.status === filterStatus).map((unit) => (
          <div key={unit.id} className={cn("bg-white border rounded-lg overflow-hidden", unit.status === 'in-progress' && "border-blue-300")}>
            {/* Unit Header */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Home className={cn("w-6 h-6", unit.status === 'closed' ? "text-green-500" : unit.status === 'in-progress' ? "text-blue-500" : "text-gray-400")} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {expandedUnit === unit.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <h4 className="font-semibold">{unit.name}</h4>
                    <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getStatusColor(unit.status))}>
                      {unit.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{unit.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {unit.buyer && (
                  <>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Buyer</p>
                      <p className="font-medium">{unit.buyer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Contract Price</p>
                      <p className="font-semibold">{formatCurrency(unit.contractPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Closing Date</p>
                      <p className="font-medium">{unit.closingDate}</p>
                    </div>
                  </>
                )}
                {unit.checklist.length > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Progress</p>
                    <p className="font-semibold">{getCompletedCount(unit.checklist)}/{unit.checklist.length}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {unit.checklist.length > 0 && (
              <div className="px-4 pb-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", unit.status === 'closed' ? "bg-green-500" : "bg-blue-500")} 
                    style={{ width: `${unit.completionPercent}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Expanded Checklist */}
            {expandedUnit === unit.id && unit.checklist.length > 0 && (
              <div className="border-t">
                {/* Buyer Info */}
                {unit.buyer && (
                  <div className="p-4 bg-gray-50 border-b grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Buyer</p>
                      <p className="font-medium">{unit.buyer}</p>
                      <p className="text-xs text-gray-400">{unit.buyerEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Title Company</p>
                      <p className="font-medium">{unit.titleCompany}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Lender</p>
                      <p className="font-medium">{unit.lender}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Earnest Money</p>
                      <p className="font-medium">{formatCurrency(unit.escrowAmount)}</p>
                    </div>
                  </div>
                )}

                {/* Checklist by Category */}
                {categories.map(category => {
                  const categoryItems = unit.checklist.filter(item => item.category === category);
                  if (categoryItems.length === 0) return null;
                  const categoryComplete = categoryItems.filter(i => i.status === 'complete').length;

                  return (
                    <div key={category} className="border-b last:border-b-0">
                      <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                        <span className="font-medium text-sm">{category}</span>
                        <span className="text-xs text-gray-500">{categoryComplete}/{categoryItems.length}</span>
                      </div>
                      <div className="divide-y">
                        {categoryItems.map(item => (
                          <div 
                            key={item.id} 
                            className={cn("px-4 py-3 flex items-center gap-3 hover:bg-gray-50", isOverdue(item.dueDate, item.status) && "bg-red-50")}
                          >
                            <button onClick={() => toggleItem(unit.id, item.id)}>
                              {getItemStatusIcon(isOverdue(item.dueDate, item.status) && item.status !== 'complete' ? 'overdue' : item.status)}
                            </button>
                            <div className="flex-1">
                              <p className={cn("text-sm", item.status === 'complete' && "text-gray-500 line-through")}>{item.item}</p>
                              {item.notes && <p className="text-xs text-gray-400">{item.notes}</p>}
                            </div>
                            <div className="text-right text-xs text-gray-500 w-24">
                              <p>Due: {item.dueDate}</p>
                              {item.completedDate && <p className="text-green-600">Done: {item.completedDate}</p>}
                            </div>
                            <div className="text-xs text-gray-400 w-24 text-right">{item.assignee}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Available Unit */}
            {expandedUnit === unit.id && unit.status === 'available' && (
              <div className="p-8 text-center text-gray-500">
                <Home className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium">Unit Available</p>
                <p className="text-sm">No active contract for this unit</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClosingChecklistPage;
