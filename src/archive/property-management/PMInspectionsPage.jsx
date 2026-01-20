// src/pages/property-management/PMInspectionsPage.jsx
// Property Management Inspections Dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, Plus, Search, Filter, Calendar, Building2,
  AlertTriangle, CheckCircle, Clock, RefreshCw, Loader2,
  ChevronRight, Eye, Play, MoreVertical, Trash2, Edit,
  Home, AlertCircle, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CreateInspectionModal from '@/components/inspections/CreateInspectionModal';
import { 
  getAllInspections, 
  getUpcomingInspections,
  getOverdueInspections,
  getInspectionStats,
  deleteInspection,
  INSPECTION_TYPES,
  INSPECTION_STATUSES,
} from '@/services/inspectionService';

const STATUS_STYLES = {
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Play },
  completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', icon: null },
  requires_followup: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertTriangle },
};

const PMInspectionsPage = () => {
  const navigate = useNavigate();
  
  const [inspections, setInspections] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Mock properties for now - would come from a properties service
  const [properties] = useState([
    { id: '1', name: '123 Main Street', address: '123 Main St, City, ST 12345' },
    { id: '2', name: 'Oak Grove Apartments', address: '456 Oak Ave, City, ST 12345' },
    { id: '3', name: 'Sunset Villas', address: '789 Sunset Blvd, City, ST 12345' },
  ]);

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    
    const [inspectionsResult, upcomingResult, overdueResult, statsResult] = await Promise.all([
      getAllInspections({ status: statusFilter || undefined, type: typeFilter || undefined }),
      getUpcomingInspections(7),
      getOverdueInspections(),
      getInspectionStats(),
    ]);

    if (inspectionsResult.data) setInspections(inspectionsResult.data);
    if (upcomingResult.data) setUpcoming(upcomingResult.data);
    if (overdueResult.data) setOverdue(overdueResult.data);
    if (statsResult.data) setStats(statsResult.data);
    
    setLoading(false);
  };

  const filteredInspections = inspections.filter(insp => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        insp.property?.name?.toLowerCase().includes(searchLower) ||
        insp.property?.address?.toLowerCase().includes(searchLower) ||
        insp.inspector_name?.toLowerCase().includes(searchLower) ||
        insp.tenant_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleDelete = async (inspectionId) => {
    if (!confirm('Are you sure you want to delete this inspection?')) return;
    
    await deleteInspection(inspectionId);
    loadData();
    setActionMenuOpen(null);
  };

  const handleStartInspection = (inspectionId) => {
    navigate(`/property-management/inspections/${inspectionId}/conduct`);
  };

  const handleViewInspection = (inspectionId) => {
    navigate(`/property-management/inspections/${inspectionId}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (typeId) => {
    return INSPECTION_TYPES.find(t => t.id === typeId)?.label || typeId;
  };

  const StatCard = ({ icon: Icon, label, value, subValue, color, onClick }) => (
    <div 
      className={cn(
        "bg-white border rounded-lg p-4 transition-shadow",
        onClick && "cursor-pointer hover:shadow-md"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Property Inspections</h1>
              <p className="text-sm text-gray-500">Schedule and conduct property inspections</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Inspection
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard 
            icon={ClipboardCheck} 
            label="Total Inspections" 
            value={stats?.total || 0}
            color="bg-blue-500" 
          />
          <StatCard 
            icon={Clock} 
            label="Scheduled" 
            value={stats?.scheduled || 0}
            color="bg-yellow-500" 
          />
          <StatCard 
            icon={CheckCircle} 
            label="Completed" 
            value={stats?.completed || 0}
            subValue={stats?.averageScore ? `Avg Score: ${stats.averageScore}` : null}
            color="bg-green-500" 
          />
          <StatCard 
            icon={AlertTriangle} 
            label="Requires Follow-up" 
            value={stats?.requiresFollowup || 0}
            color="bg-orange-500" 
          />
        </div>

        {/* Alerts */}
        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-700">Overdue Inspections ({overdue.length})</span>
            </div>
            <div className="space-y-2">
              {overdue.slice(0, 3).map(insp => (
                <div 
                  key={insp.id}
                  className="flex items-center justify-between bg-white rounded p-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleStartInspection(insp.id)}
                >
                  <div>
                    <p className="text-sm font-medium">{insp.property?.name || insp.property?.address}</p>
                    <p className="text-xs text-gray-500">
                      {getTypeLabel(insp.inspection_type)} • Due {formatDate(insp.scheduled_date)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-blue-700">Upcoming This Week ({upcoming.length})</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {upcoming.slice(0, 6).map(insp => (
                <div 
                  key={insp.id}
                  className="bg-white rounded p-3 cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => handleStartInspection(insp.id)}
                >
                  <p className="text-sm font-medium truncate">{insp.property?.name || insp.property?.address}</p>
                  <p className="text-xs text-gray-500">{getTypeLabel(insp.inspection_type)}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {formatDate(insp.scheduled_date)} at {formatTime(insp.scheduled_date)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white rounded-lg border">
          {/* Filters */}
          <div className="p-4 border-b flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inspections..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {INSPECTION_STATUSES.map(status => (
                <option key={status.id} value={status.id}>{status.label}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {INSPECTION_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredInspections.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No inspections found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule First Inspection
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-20">Score</th>
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInspections.map((insp) => {
                  const statusStyle = STATUS_STYLES[insp.status] || STATUS_STYLES.scheduled;
                  const StatusIcon = statusStyle.icon;
                  
                  return (
                    <tr key={insp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {insp.property?.name || insp.property?.address || 'Unknown Property'}
                            </p>
                            {insp.inspector_name && (
                              <p className="text-xs text-gray-500">Inspector: {insp.inspector_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{getTypeLabel(insp.inspection_type)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{formatDate(insp.scheduled_date)}</p>
                        <p className="text-xs text-gray-500">{formatTime(insp.scheduled_date)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          statusStyle.bg,
                          statusStyle.text
                        )}>
                          {StatusIcon && <StatusIcon className="w-3 h-3" />}
                          {INSPECTION_STATUSES.find(s => s.id === insp.status)?.label || insp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {insp.overall_score ? (
                          <span className={cn(
                            "font-medium",
                            parseFloat(insp.overall_score) >= 4 ? "text-green-600" :
                            parseFloat(insp.overall_score) >= 3 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {insp.overall_score}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {['scheduled', 'in_progress'].includes(insp.status) ? (
                            <Button
                              size="sm"
                              onClick={() => handleStartInspection(insp.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              {insp.status === 'in_progress' ? 'Continue' : 'Start'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewInspection(insp.id)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                          
                          <div className="relative">
                            <button
                              onClick={() => setActionMenuOpen(actionMenuOpen === insp.id ? null : insp.id)}
                              className="p-1.5 hover:bg-gray-100 rounded"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            
                            {actionMenuOpen === insp.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setActionMenuOpen(null)} 
                                />
                                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[120px] z-20">
                                  <button
                                    onClick={() => handleViewInspection(insp.id)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => handleDelete(insp.id)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <CreateInspectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadData();
        }}
        properties={properties}
      />
    </div>
  );
};

export default PMInspectionsPage;
