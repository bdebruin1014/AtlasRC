import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, AlertTriangle, FileText, User, Calendar, ChevronDown, ChevronRight, Plus, Edit2, Trash2, Upload, Download, Filter, Search, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DueDiligenceChecklistPage = () => {
  const [expandedCategories, setExpandedCategories] = useState(['legal', 'environmental', 'financial']);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddItem, setShowAddItem] = useState(null);

  const opportunityInfo = {
    name: 'Sunset Ridge Phase 3',
    stage: 'Due Diligence',
    daysRemaining: 28,
    startDate: '2024-12-01',
    endDate: '2025-01-28',
  };

  const [categories, setCategories] = useState([
    {
      id: 'legal',
      name: 'Legal & Title',
      items: [
        { id: 'l1', name: 'Title Commitment Review', status: 'completed', assignee: 'John Smith', dueDate: '2024-12-10', completedDate: '2024-12-08', notes: 'Clear title, no liens', documents: ['Title_Commitment.pdf'] },
        { id: 'l2', name: 'Survey Review', status: 'completed', assignee: 'John Smith', dueDate: '2024-12-12', completedDate: '2024-12-11', notes: 'Minor boundary adjustment needed', documents: ['Survey_2024.pdf'] },
        { id: 'l3', name: 'Easement Analysis', status: 'in-progress', assignee: 'Sarah Johnson', dueDate: '2024-12-20', notes: 'Reviewing utility easements', documents: [] },
        { id: 'l4', name: 'HOA Documents Review', status: 'pending', assignee: 'Mike Davis', dueDate: '2024-12-25', documents: [] },
        { id: 'l5', name: 'Contract Review (Attorney)', status: 'in-progress', assignee: 'External - ABC Law', dueDate: '2024-12-18', notes: 'Awaiting attorney comments', documents: ['PSA_Draft.pdf'] },
      ],
    },
    {
      id: 'environmental',
      name: 'Environmental',
      items: [
        { id: 'e1', name: 'Phase I ESA', status: 'completed', assignee: 'EcoTech Environmental', dueDate: '2024-12-15', completedDate: '2024-12-14', notes: 'No RECs identified', documents: ['Phase1_ESA.pdf'] },
        { id: 'e2', name: 'Wetlands Delineation', status: 'completed', assignee: 'EcoTech Environmental', dueDate: '2024-12-18', completedDate: '2024-12-16', notes: '0.5 acres wetlands identified', documents: ['Wetlands_Report.pdf'] },
        { id: 'e3', name: 'Endangered Species Review', status: 'in-progress', assignee: 'EcoTech Environmental', dueDate: '2024-12-22', documents: [] },
        { id: 'e4', name: 'Floodplain Analysis', status: 'completed', assignee: 'Sarah Johnson', dueDate: '2024-12-10', completedDate: '2024-12-09', notes: 'No FEMA floodplain on site', documents: ['FEMA_Map.pdf'] },
      ],
    },
    {
      id: 'financial',
      name: 'Financial Analysis',
      items: [
        { id: 'f1', name: 'Pro Forma Development', status: 'completed', assignee: 'John Smith', dueDate: '2024-12-08', completedDate: '2024-12-07', notes: 'IRR 24.5%, ROI 38%', documents: ['ProForma_v3.xlsx'] },
        { id: 'f2', name: 'Market Study Review', status: 'completed', assignee: 'Sarah Johnson', dueDate: '2024-12-10', completedDate: '2024-12-09', notes: 'Strong demand confirmed', documents: ['Market_Study.pdf'] },
        { id: 'f3', name: 'Comparable Sales Analysis', status: 'completed', assignee: 'Mike Davis', dueDate: '2024-12-12', completedDate: '2024-12-11', documents: ['Comps_Analysis.xlsx'] },
        { id: 'f4', name: 'Lender Discussions', status: 'in-progress', assignee: 'John Smith', dueDate: '2025-01-05', notes: 'Term sheet expected next week', documents: [] },
        { id: 'f5', name: 'Tax Assessment Review', status: 'pending', assignee: 'Mike Davis', dueDate: '2025-01-10', documents: [] },
      ],
    },
    {
      id: 'entitlements',
      name: 'Entitlements & Zoning',
      items: [
        { id: 'z1', name: 'Zoning Verification', status: 'completed', assignee: 'Sarah Johnson', dueDate: '2024-12-05', completedDate: '2024-12-04', notes: 'Confirmed PUD zoning', documents: ['Zoning_Letter.pdf'] },
        { id: 'z2', name: 'Plat Review', status: 'in-progress', assignee: 'Mike Davis', dueDate: '2024-12-20', notes: 'Reviewing preliminary plat', documents: ['Prelim_Plat.pdf'] },
        { id: 'z3', name: 'Utility Availability Letters', status: 'in-progress', assignee: 'Sarah Johnson', dueDate: '2024-12-22', notes: 'Water/Sewer confirmed, awaiting electric', documents: ['Will_Serve_Water.pdf'] },
        { id: 'z4', name: 'Traffic Impact Analysis', status: 'pending', assignee: 'Traffic Engineers Inc', dueDate: '2025-01-08', documents: [] },
        { id: 'z5', name: 'Development Agreement Review', status: 'pending', assignee: 'John Smith', dueDate: '2025-01-15', documents: [] },
      ],
    },
    {
      id: 'physical',
      name: 'Physical Inspection',
      items: [
        { id: 'p1', name: 'Site Visit / Walk', status: 'completed', assignee: 'John Smith', dueDate: '2024-12-03', completedDate: '2024-12-02', notes: 'Site in good condition', documents: ['Site_Photos.zip'] },
        { id: 'p2', name: 'Geotechnical Report', status: 'completed', assignee: 'ABC Geotech', dueDate: '2024-12-15', completedDate: '2024-12-13', notes: 'Soil suitable for development', documents: ['Geotech_Report.pdf'] },
        { id: 'p3', name: 'Topographic Survey', status: 'completed', assignee: 'XYZ Surveying', dueDate: '2024-12-10', completedDate: '2024-12-08', documents: ['Topo_Survey.dwg'] },
        { id: 'p4', name: 'Infrastructure Assessment', status: 'in-progress', assignee: 'Mike Davis', dueDate: '2024-12-28', documents: [] },
      ],
    },
  ]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending': return <Circle className="w-5 h-5 text-gray-300" />;
      case 'blocked': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'in-progress': return 'bg-blue-50 border-blue-200';
      case 'pending': return 'bg-gray-50 border-gray-200';
      case 'blocked': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const allItems = categories.flatMap(c => c.items);
  const stats = {
    total: allItems.length,
    completed: allItems.filter(i => i.status === 'completed').length,
    inProgress: allItems.filter(i => i.status === 'in-progress').length,
    pending: allItems.filter(i => i.status === 'pending').length,
    blocked: allItems.filter(i => i.status === 'blocked').length,
  };
  const progressPercent = (stats.completed / stats.total) * 100;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Due Diligence Checklist</h1>
            <p className="text-sm text-gray-500">{opportunityInfo.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1" />Upload Document</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export Report</Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm"><Plus className="w-4 h-4 mr-1" />Add Item</Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-500">{stats.completed} of {stats.total} items complete ({progressPercent.toFixed(0)}%)</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Total Items</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-700">{stats.pending}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Days Remaining</p>
            <p className="text-2xl font-bold text-amber-700">{opportunityInfo.daysRemaining}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search items..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {['all', 'completed', 'in-progress', 'pending'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-3 py-1 rounded text-sm capitalize",
                filterStatus === status ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
              )}
            >
              {status === 'in-progress' ? 'In Progress' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryItems = category.items.filter(item => {
              const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
              const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assignee?.toLowerCase().includes(searchTerm.toLowerCase());
              return matchesStatus && matchesSearch;
            });

            const categoryCompleted = category.items.filter(i => i.status === 'completed').length;
            const categoryTotal = category.items.length;

            if (categoryItems.length === 0 && filterStatus !== 'all') return null;

            return (
              <div key={category.id} className="bg-white border rounded-lg overflow-hidden">
                {/* Category Header */}
                <div
                  onClick={() => toggleCategory(category.id)}
                  className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {expandedCategories.includes(category.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <h3 className="font-semibold">{category.name}</h3>
                    <span className="text-sm text-gray-500">({categoryCompleted}/{categoryTotal})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(categoryCompleted / categoryTotal) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{((categoryCompleted / categoryTotal) * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Items */}
                {expandedCategories.includes(category.id) && (
                  <div className="divide-y">
                    {categoryItems.map((item) => (
                      <div key={item.id} className={cn("p-4 hover:bg-gray-50", getStatusColor(item.status))}>
                        <div className="flex items-start gap-3">
                          <button className="mt-0.5">
                            {getStatusIcon(item.status)}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                {item.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />{item.assignee}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />Due: {item.dueDate}
                                  </span>
                                  {item.completedDate && (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="w-3 h-3" />Completed: {item.completedDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.documents?.length > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <FileText className="w-3 h-3" />{item.documents.length}
                                  </span>
                                )}
                                <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="p-2 bg-gray-50">
                      <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500">
                        <Plus className="w-4 h-4 mr-1" />Add item to {category.name}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DueDiligenceChecklistPage;
