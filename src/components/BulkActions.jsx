import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Layers,
  Search,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  Edit,
  Tag,
  UserPlus,
  FolderInput,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  Building2,
  Users,
  FileText,
  DollarSign,
  Briefcase,
  ArrowRight,
  Play,
  Clock,
  XCircle
} from 'lucide-react';

// Demo data for different entity types
const demoData = {
  contacts: [
    { id: 'c1', name: 'John Smith', email: 'john@example.com', company: 'ABC Investments', type: 'investor', status: 'active' },
    { id: 'c2', name: 'Sarah Johnson', email: 'sarah@example.com', company: 'XYZ Holdings', type: 'vendor', status: 'active' },
    { id: 'c3', name: 'Mike Chen', email: 'mike@example.com', company: 'Global Properties', type: 'partner', status: 'inactive' },
    { id: 'c4', name: 'Lisa Park', email: 'lisa@example.com', company: 'Tenant Services', type: 'vendor', status: 'active' },
    { id: 'c5', name: 'David Lee', email: 'david@example.com', company: 'Construction Pros', type: 'vendor', status: 'active' },
    { id: 'c6', name: 'Emily Brown', email: 'emily@example.com', company: 'Brown Realty', type: 'broker', status: 'active' },
    { id: 'c7', name: 'James Wilson', email: 'james@example.com', company: 'Wilson Fund', type: 'investor', status: 'inactive' },
    { id: 'c8', name: 'Anna Davis', email: 'anna@example.com', company: 'Davis Law', type: 'partner', status: 'active' }
  ],
  projects: [
    { id: 'p1', name: 'Sunset Towers', address: 'Los Angeles, CA', status: 'active', type: 'multifamily' },
    { id: 'p2', name: 'Harbor View Apartments', address: 'San Diego, CA', status: 'active', type: 'multifamily' },
    { id: 'p3', name: 'Mountain Ridge Complex', address: 'Denver, CO', status: 'pending', type: 'commercial' },
    { id: 'p4', name: 'Downtown Plaza', address: 'Phoenix, AZ', status: 'active', type: 'mixed-use' },
    { id: 'p5', name: 'Riverside Lofts', address: 'Austin, TX', status: 'completed', type: 'residential' }
  ],
  documents: [
    { id: 'd1', name: 'Lease Agreement - Unit 101', type: 'Lease', status: 'active', created: '2026-01-15' },
    { id: 'd2', name: 'Purchase Contract - Harbor View', type: 'Contract', status: 'pending', created: '2026-01-10' },
    { id: 'd3', name: 'Insurance Policy - Sunset', type: 'Insurance', status: 'active', created: '2026-01-05' },
    { id: 'd4', name: 'Vendor Agreement - Construction', type: 'Agreement', status: 'draft', created: '2026-01-20' },
    { id: 'd5', name: 'Title Report - Mountain Ridge', type: 'Legal', status: 'active', created: '2026-01-12' },
    { id: 'd6', name: 'Environmental Study', type: 'Report', status: 'archived', created: '2025-12-01' }
  ],
  tasks: [
    { id: 't1', title: 'Review lease agreement', assigned: 'John Smith', due: '2026-01-26', status: 'pending', priority: 'high' },
    { id: 't2', title: 'Schedule property inspection', assigned: 'Sarah Johnson', due: '2026-01-28', status: 'in_progress', priority: 'medium' },
    { id: 't3', title: 'Update vendor contracts', assigned: 'Mike Chen', due: '2026-01-30', status: 'pending', priority: 'low' },
    { id: 't4', title: 'Prepare monthly report', assigned: 'Lisa Park', due: '2026-01-31', status: 'pending', priority: 'medium' },
    { id: 't5', title: 'Follow up with investors', assigned: 'John Smith', due: '2026-02-01', status: 'pending', priority: 'high' },
    { id: 't6', title: 'Complete due diligence', assigned: 'David Lee', due: '2026-01-25', status: 'overdue', priority: 'high' }
  ]
};

const entityTypes = [
  { id: 'contacts', name: 'Contacts', icon: Users },
  { id: 'projects', name: 'Projects', icon: Building2 },
  { id: 'documents', name: 'Documents', icon: FileText },
  { id: 'tasks', name: 'Tasks', icon: CheckSquare }
];

const availableActions = {
  contacts: [
    { id: 'update_status', name: 'Update Status', icon: RefreshCw, fields: [{ name: 'status', type: 'select', options: ['active', 'inactive', 'archived'] }] },
    { id: 'update_type', name: 'Change Type', icon: Tag, fields: [{ name: 'type', type: 'select', options: ['investor', 'vendor', 'partner', 'broker', 'tenant'] }] },
    { id: 'add_tag', name: 'Add Tag', icon: Tag, fields: [{ name: 'tag', type: 'text' }] },
    { id: 'assign_to', name: 'Assign To User', icon: UserPlus, fields: [{ name: 'user', type: 'select', options: ['John Smith', 'Sarah Johnson', 'Mike Chen'] }] },
    { id: 'export', name: 'Export Selected', icon: Download },
    { id: 'delete', name: 'Delete', icon: Trash2, destructive: true }
  ],
  projects: [
    { id: 'update_status', name: 'Update Status', icon: RefreshCw, fields: [{ name: 'status', type: 'select', options: ['active', 'pending', 'completed', 'on_hold'] }] },
    { id: 'assign_to', name: 'Assign Team', icon: UserPlus, fields: [{ name: 'team', type: 'select', options: ['Development', 'Operations', 'Finance'] }] },
    { id: 'add_tag', name: 'Add Tag', icon: Tag, fields: [{ name: 'tag', type: 'text' }] },
    { id: 'export', name: 'Export Selected', icon: Download },
    { id: 'delete', name: 'Delete', icon: Trash2, destructive: true }
  ],
  documents: [
    { id: 'update_status', name: 'Update Status', icon: RefreshCw, fields: [{ name: 'status', type: 'select', options: ['active', 'pending', 'draft', 'archived'] }] },
    { id: 'move_folder', name: 'Move to Folder', icon: FolderInput, fields: [{ name: 'folder', type: 'select', options: ['Contracts', 'Leases', 'Insurance', 'Legal', 'Financial'] }] },
    { id: 'add_tag', name: 'Add Tag', icon: Tag, fields: [{ name: 'tag', type: 'text' }] },
    { id: 'export', name: 'Download All', icon: Download },
    { id: 'delete', name: 'Delete', icon: Trash2, destructive: true }
  ],
  tasks: [
    { id: 'update_status', name: 'Update Status', icon: RefreshCw, fields: [{ name: 'status', type: 'select', options: ['pending', 'in_progress', 'completed', 'cancelled'] }] },
    { id: 'update_priority', name: 'Change Priority', icon: AlertCircle, fields: [{ name: 'priority', type: 'select', options: ['high', 'medium', 'low'] }] },
    { id: 'reassign', name: 'Reassign', icon: UserPlus, fields: [{ name: 'assignee', type: 'select', options: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Park'] }] },
    { id: 'update_due', name: 'Change Due Date', icon: Clock, fields: [{ name: 'due_date', type: 'date' }] },
    { id: 'delete', name: 'Delete', icon: Trash2, destructive: true }
  ]
};

export default function BulkActions() {
  const [selectedType, setSelectedType] = useState('contacts');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionValues, setActionValues] = useState({});
  const [actionResult, setActionResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const fetchData = async () => {
    setLoading(true);
    setSelectedItems([]);
    try {
      if (isDemoMode()) {
        setData(demoData[selectedType] || []);
      } else {
        const { data: result, error } = await supabase
          .from(selectedType)
          .select('*')
          .limit(100);

        if (error) throw error;
        setData(result || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(demoData[selectedType] || []);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchStr = JSON.stringify(item).toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map(item => item.id));
    }
  };

  const toggleSelect = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const executeAction = async () => {
    if (!selectedAction) return;

    setProcessing(true);
    setActionResult(null);

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (selectedAction.id === 'delete') {
        setData(prev => prev.filter(item => !selectedItems.includes(item.id)));
        setActionResult({
          success: true,
          message: `Successfully deleted ${selectedItems.length} items`
        });
      } else if (selectedAction.id === 'export') {
        setActionResult({
          success: true,
          message: `Exported ${selectedItems.length} items to file`
        });
      } else {
        // Update items
        const fieldName = selectedAction.fields?.[0]?.name;
        const fieldValue = actionValues[fieldName];

        setData(prev => prev.map(item =>
          selectedItems.includes(item.id)
            ? { ...item, [fieldName]: fieldValue }
            : item
        ));

        setActionResult({
          success: true,
          message: `Successfully updated ${selectedItems.length} items`
        });
      }

      setSelectedItems([]);
    } catch (error) {
      setActionResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setProcessing(false);
    }
  };

  const openActionModal = (action) => {
    setSelectedAction(action);
    setActionValues({});
    setActionResult(null);
    setShowActionModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'pending':
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'inactive':
      case 'archived':
      case 'cancelled':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case 'overdue':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const renderItemRow = (item) => {
    switch (selectedType) {
      case 'contacts':
        return (
          <>
            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.email}</td>
            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.company}</td>
            <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-400">{item.type}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </td>
          </>
        );
      case 'projects':
        return (
          <>
            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.address}</td>
            <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-400">{item.type}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </td>
          </>
        );
      case 'documents':
        return (
          <>
            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.type}</td>
            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.created}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </td>
          </>
        );
      case 'tasks':
        return (
          <>
            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.title}</td>
            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.assigned}</td>
            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.due}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                item.priority === 'high' ? 'text-red-600 bg-red-100' :
                item.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                'text-gray-600 bg-gray-100'
              }`}>
                {item.priority}
              </span>
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </td>
          </>
        );
      default:
        return null;
    }
  };

  const getTableHeaders = () => {
    switch (selectedType) {
      case 'contacts':
        return ['Name', 'Email', 'Company', 'Type', 'Status'];
      case 'projects':
        return ['Name', 'Address', 'Type', 'Status'];
      case 'documents':
        return ['Name', 'Type', 'Created', 'Status'];
      case 'tasks':
        return ['Title', 'Assigned To', 'Due Date', 'Priority', 'Status'];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers className="h-7 w-7 text-blue-600" />
          Bulk Actions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Select multiple items and perform bulk operations
        </p>
      </div>

      {/* Entity Type Selector */}
      <div className="flex gap-2 mb-6">
        {entityTypes.map(type => {
          const IconComponent = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              {type.name}
            </button>
          );
        })}
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedItems.length} selected
              </span>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
              {availableActions[selectedType]?.map(action => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => openActionModal(action)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                      action.destructive
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {action.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    {selectedItems.length === filteredData.length && filteredData.length > 0 ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </th>
                {getTableHeaders().map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={getTableHeaders().length + 1} className="px-4 py-12 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedItems.includes(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelect(item.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        {selectedItems.includes(item.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    {renderItemRow(item)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredData.length} of {data.length} items
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {React.createElement(selectedAction.icon, { className: 'h-5 w-5' })}
                {selectedAction.name}
              </h2>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              {actionResult ? (
                <div className={`flex items-center gap-3 p-4 rounded-lg ${
                  actionResult.success
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  {actionResult.success ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <span className={actionResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                    {actionResult.message}
                  </span>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected items</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedItems.length} {selectedType}
                    </div>
                  </div>

                  {selectedAction.fields?.map(field => (
                    <div key={field.name} className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                        {field.name.replace('_', ' ')}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={actionValues[field.name] || ''}
                          onChange={(e) => setActionValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select...</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt} className="capitalize">{opt.replace('_', ' ')}</option>
                          ))}
                        </select>
                      ) : field.type === 'date' ? (
                        <input
                          type="date"
                          value={actionValues[field.name] || ''}
                          onChange={(e) => setActionValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <input
                          type="text"
                          value={actionValues[field.name] || ''}
                          onChange={(e) => setActionValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder={`Enter ${field.name}`}
                        />
                      )}
                    </div>
                  ))}

                  {selectedAction.destructive && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex gap-2 mb-4">
                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-200">
                        This action cannot be undone. {selectedItems.length} items will be permanently deleted.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-end">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {actionResult ? 'Close' : 'Cancel'}
              </button>
              {!actionResult && (
                <button
                  onClick={executeAction}
                  disabled={processing || (selectedAction.fields?.length > 0 && !Object.values(actionValues).some(v => v))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                    selectedAction.destructive
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {processing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {processing ? 'Processing...' : 'Execute'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
