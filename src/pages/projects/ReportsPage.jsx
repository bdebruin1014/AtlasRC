import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, ChevronRight, BarChart3, PieChart, TrendingUp, DollarSign, Users, HardHat, Home, Clock, Play, Eye, Send, Printer, Settings, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ReportsPage = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('standard'); // 'standard', 'custom', 'scheduled'
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const standardReports = [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level project overview including financials, progress, and key metrics',
      category: 'overview',
      icon: FileText,
      lastGenerated: '2024-12-28',
      frequency: 'Weekly',
    },
    {
      id: 'investor-report',
      name: 'Investor Report',
      description: 'Comprehensive report for LP investors with returns, distributions, and progress updates',
      category: 'investor',
      icon: Users,
      lastGenerated: '2024-12-28',
      frequency: 'Quarterly',
    },
    {
      id: 'construction-progress',
      name: 'Construction Progress',
      description: 'Detailed construction status, schedule, and milestone tracking',
      category: 'construction',
      icon: HardHat,
      lastGenerated: '2024-12-20',
      frequency: 'Weekly',
    },
    {
      id: 'budget-variance',
      name: 'Budget vs Actuals',
      description: 'Line-by-line comparison of budgeted vs actual costs with variance analysis',
      category: 'financial',
      icon: DollarSign,
      lastGenerated: '2024-12-15',
      frequency: 'Monthly',
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Report',
      description: 'Monthly cash flow projections, sources, and uses of funds',
      category: 'financial',
      icon: TrendingUp,
      lastGenerated: '2024-12-15',
      frequency: 'Monthly',
    },
    {
      id: 'draw-summary',
      name: 'Draw Request Summary',
      description: 'Construction loan draw history and utilization report',
      category: 'financial',
      icon: DollarSign,
      lastGenerated: '2024-12-15',
      frequency: 'Per Draw',
    },
    {
      id: 'sales-status',
      name: 'Sales Status Report',
      description: 'Unit inventory, sales pipeline, and absorption analysis',
      category: 'sales',
      icon: Home,
      lastGenerated: '2024-12-20',
      frequency: 'Weekly',
    },
    {
      id: 'proforma-comparison',
      name: 'Proforma vs Actual',
      description: 'Compare original proforma projections against actual performance',
      category: 'financial',
      icon: BarChart3,
      lastGenerated: '2024-12-01',
      frequency: 'Monthly',
    },
    {
      id: 'distribution-report',
      name: 'Distribution Report',
      description: 'Investor distribution history with waterfall calculations',
      category: 'investor',
      icon: PieChart,
      lastGenerated: '2024-12-20',
      frequency: 'Per Distribution',
    },
  ];

  const recentReports = [
    { id: 1, name: 'Q4 2024 Investor Report', type: 'Investor Report', generatedDate: '2024-12-28', generatedBy: 'Bryan VanRock', format: 'PDF', size: '2.4 MB' },
    { id: 2, name: 'Weekly Progress Report - 12/20', type: 'Construction Progress', generatedDate: '2024-12-20', generatedBy: 'Sarah Mitchell', format: 'PDF', size: '1.8 MB' },
    { id: 3, name: 'December Budget Variance', type: 'Budget vs Actuals', generatedDate: '2024-12-15', generatedBy: 'Bryan VanRock', format: 'Excel', size: '456 KB' },
    { id: 4, name: 'Draw #12 Summary', type: 'Draw Request Summary', generatedDate: '2024-12-15', generatedBy: 'System', format: 'PDF', size: '892 KB' },
    { id: 5, name: 'Sales Status - Week 50', type: 'Sales Status Report', generatedDate: '2024-12-13', generatedBy: 'Sarah Agent', format: 'PDF', size: '1.2 MB' },
  ];

  const scheduledReports = [
    { id: 1, name: 'Weekly Executive Summary', type: 'Executive Summary', schedule: 'Every Monday 8:00 AM', recipients: ['bryan@vanrock.com', 'sarah@vanrock.com'], nextRun: '2024-12-30', status: 'active' },
    { id: 2, name: 'Weekly Construction Progress', type: 'Construction Progress', schedule: 'Every Friday 5:00 PM', recipients: ['bryan@vanrock.com', 'mike@johnsonconstruction.com'], nextRun: '2024-12-27', status: 'active' },
    { id: 3, name: 'Monthly Budget Report', type: 'Budget vs Actuals', schedule: '1st of month 9:00 AM', recipients: ['bryan@vanrock.com'], nextRun: '2025-01-01', status: 'active' },
    { id: 4, name: 'Quarterly Investor Report', type: 'Investor Report', schedule: '15th of quarter end', recipients: ['All Investors'], nextRun: '2025-01-15', status: 'active' },
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'overview': return 'bg-purple-100 text-purple-700';
      case 'financial': return 'bg-green-100 text-green-700';
      case 'construction': return 'bg-orange-100 text-orange-700';
      case 'investor': return 'bg-blue-100 text-blue-700';
      case 'sales': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const [generateConfig, setGenerateConfig] = useState({
    reportType: '',
    dateRange: 'last-month',
    startDate: '',
    endDate: '',
    format: 'pdf',
    includeCharts: true,
    includePhotos: false,
  });

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-sm text-gray-500">Generate and manage project reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Settings className="w-4 h-4 mr-1" />Report Settings</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowGenerateModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Reports This Month</p>
          <p className="text-2xl font-semibold">12</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Scheduled Reports</p>
          <p className="text-2xl font-semibold">{scheduledReports.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Last Generated</p>
          <p className="text-2xl font-semibold">Today</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Report Templates</p>
          <p className="text-2xl font-semibold">{standardReports.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('standard')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'standard' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Report Templates
        </button>
        <button onClick={() => setActiveTab('recent')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'recent' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Recent Reports
        </button>
        <button onClick={() => setActiveTab('scheduled')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'scheduled' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Scheduled ({scheduledReports.length})
        </button>
      </div>

      {/* Standard Reports Tab */}
      {activeTab === 'standard' && (
        <div className="grid grid-cols-3 gap-4">
          {standardReports.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getCategoryColor(report.category))}>
                    {report.category}
                  </span>
                </div>
                <h4 className="font-semibold mb-1">{report.name}</h4>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{report.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>Last: {report.lastGenerated}</span>
                  <span>{report.frequency}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedReport(report); setShowGenerateModal(true); }}>
                    <Play className="w-3 h-3 mr-1" />Generate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Reports Tab */}
      {activeTab === 'recent' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Report Name</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Generated</th>
                <th className="text-left px-4 py-3 font-medium">By</th>
                <th className="text-left px-4 py-3 font-medium">Format</th>
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{report.type}</td>
                  <td className="px-4 py-3">{report.generatedDate}</td>
                  <td className="px-4 py-3 text-gray-600">{report.generatedBy}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs", report.format === 'PDF' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
                      {report.format}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{report.size}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><Download className="w-4 h-4 text-gray-500" /></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><Send className="w-4 h-4 text-gray-500" /></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><Printer className="w-4 h-4 text-gray-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'scheduled' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Report Name</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Schedule</th>
                <th className="text-left px-4 py-3 font-medium">Recipients</th>
                <th className="text-left px-4 py-3 font-medium">Next Run</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scheduledReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{report.type}</td>
                  <td className="px-4 py-3 text-xs">{report.schedule}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{Array.isArray(report.recipients) ? report.recipients.length : 1} recipient(s)</span>
                  </td>
                  <td className="px-4 py-3">{report.nextRun}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", report.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded"><Play className="w-4 h-4 text-gray-500" /></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><Settings className="w-4 h-4 text-gray-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Generate Report</h3>
              <button onClick={() => { setShowGenerateModal(false); setSelectedReport(null); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Report Type *</label>
                <select 
                  className="w-full border rounded-md px-3 py-2" 
                  value={selectedReport?.id || generateConfig.reportType}
                  onChange={(e) => setGenerateConfig(prev => ({ ...prev, reportType: e.target.value }))}
                >
                  <option value="">Select report type...</option>
                  {standardReports.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Date Range</label>
                <select 
                  className="w-full border rounded-md px-3 py-2"
                  value={generateConfig.dateRange}
                  onChange={(e) => setGenerateConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                >
                  <option value="last-week">Last Week</option>
                  <option value="last-month">Last Month</option>
                  <option value="last-quarter">Last Quarter</option>
                  <option value="ytd">Year to Date</option>
                  <option value="project-to-date">Project to Date</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {generateConfig.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Start Date</label>
                    <Input type="date" value={generateConfig.startDate} onChange={(e) => setGenerateConfig(prev => ({ ...prev, startDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">End Date</label>
                    <Input type="date" value={generateConfig.endDate} onChange={(e) => setGenerateConfig(prev => ({ ...prev, endDate: e.target.value }))} />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium block mb-1">Output Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="format" value="pdf" checked={generateConfig.format === 'pdf'} onChange={(e) => setGenerateConfig(prev => ({ ...prev, format: e.target.value }))} />
                    <span className="text-sm">PDF</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="format" value="excel" checked={generateConfig.format === 'excel'} onChange={(e) => setGenerateConfig(prev => ({ ...prev, format: e.target.value }))} />
                    <span className="text-sm">Excel</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="format" value="word" checked={generateConfig.format === 'word'} onChange={(e) => setGenerateConfig(prev => ({ ...prev, format: e.target.value }))} />
                    <span className="text-sm">Word</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium block">Options</label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={generateConfig.includeCharts} onChange={(e) => setGenerateConfig(prev => ({ ...prev, includeCharts: e.target.checked }))} />
                  <span className="text-sm">Include charts and graphs</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={generateConfig.includePhotos} onChange={(e) => setGenerateConfig(prev => ({ ...prev, includePhotos: e.target.checked }))} />
                  <span className="text-sm">Include progress photos</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => { setShowGenerateModal(false); setSelectedReport(null); }}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">
                <Play className="w-4 h-4 mr-1" />Generate Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
