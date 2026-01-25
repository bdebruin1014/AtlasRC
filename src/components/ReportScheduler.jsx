import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  CalendarClock,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Trash2,
  Edit,
  Clock,
  Mail,
  Calendar,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  X,
  ChevronDown,
  Eye,
  Copy
} from 'lucide-react';

// Demo scheduled reports
const demoScheduledReports = [
  {
    id: '1',
    name: 'Weekly Financial Summary',
    description: 'Consolidated financial metrics across all projects',
    report_type: 'financial',
    format: 'pdf',
    schedule: {
      frequency: 'weekly',
      day: 'monday',
      time: '08:00'
    },
    recipients: ['john@example.com', 'sarah@example.com'],
    filters: { date_range: 'last_week' },
    status: 'active',
    last_run: '2026-01-20T08:00:00Z',
    next_run: '2026-01-27T08:00:00Z',
    created_at: '2025-09-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Monthly Project Status',
    description: 'Status update for all active projects',
    report_type: 'project',
    format: 'xlsx',
    schedule: {
      frequency: 'monthly',
      day: '1',
      time: '09:00'
    },
    recipients: ['team@example.com', 'executives@example.com'],
    filters: { status: 'active' },
    status: 'active',
    last_run: '2026-01-01T09:00:00Z',
    next_run: '2026-02-01T09:00:00Z',
    created_at: '2025-10-01T14:00:00Z'
  },
  {
    id: '3',
    name: 'Daily Task Digest',
    description: 'Summary of overdue and upcoming tasks',
    report_type: 'tasks',
    format: 'pdf',
    schedule: {
      frequency: 'daily',
      time: '07:00'
    },
    recipients: ['manager@example.com'],
    filters: { include_overdue: true, days_ahead: 7 },
    status: 'active',
    last_run: '2026-01-25T07:00:00Z',
    next_run: '2026-01-26T07:00:00Z',
    created_at: '2025-11-20T08:00:00Z'
  },
  {
    id: '4',
    name: 'Quarterly Investor Report',
    description: 'Comprehensive quarterly performance report',
    report_type: 'investor',
    format: 'pdf',
    schedule: {
      frequency: 'quarterly',
      day: '1',
      time: '10:00'
    },
    recipients: ['investors@example.com', 'cfo@example.com'],
    filters: {},
    status: 'paused',
    last_run: '2026-01-01T10:00:00Z',
    next_run: null,
    created_at: '2025-08-01T12:00:00Z'
  }
];

// Demo report history
const demoReportHistory = [
  { id: '1', schedule_id: '1', name: 'Weekly Financial Summary', status: 'sent', sent_at: '2026-01-20T08:02:00Z', recipients: 2, file_size: '245 KB' },
  { id: '2', schedule_id: '3', name: 'Daily Task Digest', status: 'sent', sent_at: '2026-01-25T07:01:00Z', recipients: 1, file_size: '89 KB' },
  { id: '3', schedule_id: '2', name: 'Monthly Project Status', status: 'sent', sent_at: '2026-01-01T09:03:00Z', recipients: 2, file_size: '1.2 MB' },
  { id: '4', schedule_id: '1', name: 'Weekly Financial Summary', status: 'failed', sent_at: '2026-01-13T08:00:00Z', error: 'Email delivery failed' },
  { id: '5', schedule_id: '3', name: 'Daily Task Digest', status: 'sent', sent_at: '2026-01-24T07:01:00Z', recipients: 1, file_size: '92 KB' }
];

const reportTypes = [
  { id: 'financial', name: 'Financial Report', icon: DollarSign, description: 'Revenue, expenses, P&L' },
  { id: 'project', name: 'Project Report', icon: Building2, description: 'Project status and progress' },
  { id: 'tasks', name: 'Task Report', icon: CheckCircle2, description: 'Task completion and deadlines' },
  { id: 'contacts', name: 'Contacts Report', icon: Users, description: 'Contact activity summary' },
  { id: 'custom', name: 'Custom Report', icon: BarChart3, description: 'Build your own report' }
];

const frequencies = [
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' }
];

export default function ReportScheduler() {
  const [scheduledReports, setScheduledReports] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setScheduledReports(demoScheduledReports);
        setReportHistory(demoReportHistory);
      } else {
        const [schedulesRes, historyRes] = await Promise.all([
          supabase.from('scheduled_reports').select('*').order('created_at', { ascending: false }),
          supabase.from('report_history').select('*').order('sent_at', { ascending: false }).limit(20)
        ]);

        setScheduledReports(schedulesRes.data || []);
        setReportHistory(historyRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setScheduledReports(demoScheduledReports);
      setReportHistory(demoReportHistory);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = scheduledReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (reportId) => {
    setScheduledReports(prev => prev.map(r =>
      r.id === reportId
        ? { ...r, status: r.status === 'active' ? 'paused' : 'active' }
        : r
    ));
  };

  const deleteReport = (reportId) => {
    setScheduledReports(prev => prev.filter(r => r.id !== reportId));
  };

  const runNow = (report) => {
    const newHistory = {
      id: Date.now().toString(),
      schedule_id: report.id,
      name: report.name,
      status: 'sending',
      sent_at: new Date().toISOString(),
      recipients: report.recipients.length
    };

    setReportHistory(prev => [newHistory, ...prev]);

    // Simulate sending
    setTimeout(() => {
      setReportHistory(prev => prev.map(h =>
        h.id === newHistory.id
          ? { ...h, status: 'sent', file_size: `${Math.floor(Math.random() * 500) + 50} KB` }
          : h
      ));
    }, 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScheduleText = (schedule) => {
    switch (schedule.frequency) {
      case 'daily':
        return `Daily at ${schedule.time}`;
      case 'weekly':
        return `Every ${schedule.day} at ${schedule.time}`;
      case 'monthly':
        return `Monthly on day ${schedule.day} at ${schedule.time}`;
      case 'quarterly':
        return `Quarterly on day ${schedule.day} at ${schedule.time}`;
      default:
        return 'Custom schedule';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1 text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs"><CheckCircle2 className="h-3 w-3" /> Active</span>;
      case 'paused':
        return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded text-xs"><Pause className="h-3 w-3" /> Paused</span>;
      case 'sent':
        return <span className="flex items-center gap-1 text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs"><CheckCircle2 className="h-3 w-3" /> Sent</span>;
      case 'sending':
        return <span className="flex items-center gap-1 text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-xs"><RefreshCw className="h-3 w-3 animate-spin" /> Sending</span>;
      case 'failed':
        return <span className="flex items-center gap-1 text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-xs"><AlertCircle className="h-3 w-3" /> Failed</span>;
      default:
        return null;
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarClock className="h-7 w-7 text-blue-600" />
            Report Scheduler
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Schedule automated report generation and delivery
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Schedule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{scheduledReports.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Schedules</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{scheduledReports.filter(r => r.status === 'active').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{reportHistory.filter(h => h.status === 'sent').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Reports Sent</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(scheduledReports.flatMap(r => r.recipients)).size}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Recipients</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scheduled Reports */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarClock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No scheduled reports</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first scheduled report</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    New Schedule
                  </button>
                </div>
              ) : (
                filteredReports.map(report => {
                  const ReportIcon = reportTypes.find(t => t.id === report.report_type)?.icon || FileText;
                  return (
                    <div key={report.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            report.status === 'active'
                              ? 'bg-blue-100 dark:bg-blue-900/30'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <ReportIcon className={`h-5 w-5 ${
                              report.status === 'active' ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{report.name}</h3>
                            <p className="text-sm text-gray-500">{report.description}</p>
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getScheduleText(report.schedule)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {report.format.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="text-gray-500 dark:text-gray-400">
                          {report.next_run ? (
                            <span>Next run: {formatDate(report.next_run)}</span>
                          ) : (
                            <span>Paused - no upcoming runs</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => runNow(report)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            title="Run Now"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleStatus(report.id)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title={report.status === 'active' ? 'Pause' : 'Resume'}
                          >
                            {report.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingReport(report);
                              setShowCreateModal(true);
                            }}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteReport(report.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Report History */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {reportHistory.slice(0, 10).map(history => (
                <div key={history.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {history.name}
                    </span>
                    {getStatusBadge(history.status)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(history.sent_at)}
                    {history.file_size && <span> • {history.file_size}</span>}
                    {history.recipients && <span> • {history.recipients} recipient{history.recipients !== 1 ? 's' : ''}</span>}
                  </div>
                  {history.error && (
                    <div className="text-xs text-red-600 mt-1">{history.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateScheduleModal
          report={editingReport}
          onClose={() => {
            setShowCreateModal(false);
            setEditingReport(null);
          }}
          onSave={(newReport) => {
            if (editingReport) {
              setScheduledReports(prev => prev.map(r =>
                r.id === editingReport.id ? { ...r, ...newReport } : r
              ));
            } else {
              setScheduledReports(prev => [{
                ...newReport,
                id: Date.now().toString(),
                status: 'active',
                last_run: null,
                next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString()
              }, ...prev]);
            }
            setShowCreateModal(false);
            setEditingReport(null);
          }}
        />
      )}
    </div>
  );
}

function CreateScheduleModal({ report, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: report?.name || '',
    description: report?.description || '',
    report_type: report?.report_type || 'financial',
    format: report?.format || 'pdf',
    schedule: report?.schedule || { frequency: 'weekly', day: 'monday', time: '08:00' },
    recipients: report?.recipients?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      recipients: formData.recipients.split(',').map(r => r.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {report ? 'Edit Schedule' : 'Create New Schedule'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Schedule Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Weekly Financial Summary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Brief description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Type
            </label>
            <select
              value={formData.report_type}
              onChange={(e) => setFormData(prev => ({ ...prev, report_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select
                value={formData.schedule.frequency}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, frequency: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {frequencies.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.schedule.time}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, time: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {formData.schedule.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Day of Week
              </label>
              <select
                value={formData.schedule.day}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, day: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <option key={day} value={day} className="capitalize">{day}</option>
                ))}
              </select>
            </div>
          )}

          {(formData.schedule.frequency === 'monthly' || formData.schedule.frequency === 'quarterly') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Day of Month
              </label>
              <select
                value={formData.schedule.day}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, day: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString()}>{day}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Format
            </label>
            <div className="flex gap-2">
              {['pdf', 'xlsx', 'csv'].map(format => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, format }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.format === format
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipients *
            </label>
            <input
              type="text"
              required
              value={formData.recipients}
              onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="email1@example.com, email2@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
          </div>
        </form>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {report ? 'Save Changes' : 'Create Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
