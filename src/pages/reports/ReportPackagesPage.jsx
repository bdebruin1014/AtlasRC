import React, { useState } from 'react';
import { FolderOpen, Plus, Play, Settings, Trash2, FileText, Calendar, Download, Edit2, ChevronDown, ChevronRight, Clock, Users, Building2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ReportPackagesPage = () => {
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [packages] = useState([
    {
      id: 1,
      name: 'Monthly Board Package',
      description: 'Comprehensive monthly report for board meetings',
      schedule: 'Monthly (1st)',
      lastGenerated: '2024-01-01',
      reports: [
        { id: 1, name: 'Executive Summary', type: 'summary' },
        { id: 2, name: 'Financial Overview', type: 'financial' },
        { id: 3, name: 'Project Status Report', type: 'projects' },
        { id: 4, name: 'Pipeline Analysis', type: 'pipeline' },
        { id: 5, name: 'Cash Flow Statement', type: 'financial' },
      ],
      recipients: ['board@company.com', 'executives@company.com'],
    },
    {
      id: 2,
      name: 'Investor Quarterly Report',
      description: 'Quarterly performance report for investors',
      schedule: 'Quarterly',
      lastGenerated: '2024-01-01',
      reports: [
        { id: 1, name: 'Portfolio Performance', type: 'financial' },
        { id: 2, name: 'Entity P&L Summary', type: 'financial' },
        { id: 3, name: 'Project ROI Analysis', type: 'projects' },
        { id: 4, name: 'Market Outlook', type: 'summary' },
      ],
      recipients: ['investors@company.com'],
    },
    {
      id: 3,
      name: 'Weekly Operations Brief',
      description: 'Weekly status update for operations team',
      schedule: 'Weekly (Mon)',
      lastGenerated: '2024-01-20',
      reports: [
        { id: 1, name: 'Active Projects Status', type: 'projects' },
        { id: 2, name: 'Upcoming Deadlines', type: 'schedule' },
        { id: 3, name: 'Budget vs Actual', type: 'financial' },
        { id: 4, name: 'Vendor Payments Due', type: 'financial' },
      ],
      recipients: ['ops-team@company.com'],
    },
    {
      id: 4,
      name: 'Deal Pipeline Report',
      description: 'Acquisition pipeline status and metrics',
      schedule: null,
      lastGenerated: '2024-01-18',
      reports: [
        { id: 1, name: 'Pipeline by Stage', type: 'pipeline' },
        { id: 2, name: 'Deal Velocity Analysis', type: 'pipeline' },
        { id: 3, name: 'Conversion Metrics', type: 'summary' },
      ],
      recipients: ['acquisitions@company.com'],
    },
  ]);

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'projects': return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'pipeline': return <ChevronRight className="w-4 h-4 text-purple-600" />;
      case 'schedule': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getReportTypeBadge = (type) => {
    const styles = {
      financial: 'bg-green-100 text-green-700',
      projects: 'bg-blue-100 text-blue-700',
      pipeline: 'bg-purple-100 text-purple-700',
      schedule: 'bg-orange-100 text-orange-700',
      summary: 'bg-gray-100 text-gray-700',
    };
    return styles[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-[#2F855A]" />
          <h1 className="text-xl font-semibold text-gray-900">Report Packages</h1>
        </div>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Package
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Packages</p>
            <p className="text-2xl font-semibold">{packages.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Scheduled</p>
            <p className="text-2xl font-semibold">{packages.filter(p => p.schedule).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Reports</p>
            <p className="text-2xl font-semibold">{packages.reduce((sum, p) => sum + p.reports.length, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Recipients</p>
            <p className="text-2xl font-semibold">{new Set(packages.flatMap(p => p.recipients)).size}</p>
          </CardContent>
        </Card>
      </div>

      {/* Packages List */}
      <div className="space-y-4">
        {packages.map(pkg => (
          <Card key={pkg.id} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedPackage(expandedPackage === pkg.id ? null : pkg.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {expandedPackage === pkg.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {pkg.reports.length} reports
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {pkg.recipients.length} recipients
                      </span>
                      {pkg.schedule && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          <Calendar className="w-3 h-3 mr-1" /> {pkg.schedule}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                    <Play className="w-4 h-4 mr-1" /> Generate
                  </Button>
                  <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedPackage === pkg.id && (
              <div className="border-t bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Reports in Package */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Reports in Package</h4>
                    <div className="space-y-2">
                      {pkg.reports.map((report, idx) => (
                        <div key={report.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400 w-6">{idx + 1}.</span>
                            {getReportTypeIcon(report.type)}
                            <span className="text-sm font-medium">{report.name}</span>
                          </div>
                          <Badge className={getReportTypeBadge(report.type)}>{report.type}</Badge>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="w-4 h-4 mr-1" /> Add Report
                    </Button>
                  </div>

                  {/* Package Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Package Details</h4>
                    <div className="bg-white p-4 rounded-lg border space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Schedule</span>
                        <span className="text-sm font-medium">{pkg.schedule || 'Manual'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Last Generated</span>
                        <span className="text-sm font-medium">{pkg.lastGenerated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Output Format</span>
                        <span className="text-sm font-medium">PDF + Excel</span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <span className="text-sm text-gray-500 block mb-2">Recipients</span>
                        <div className="flex flex-wrap gap-2">
                          {pkg.recipients.map((email, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{email}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create Package Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader className="border-b">
              <CardTitle>Create Report Package</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input
                  type="text"
                  placeholder="e.g., Monthly Board Package"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F855A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Brief description of this report package..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F855A]"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Manual (No Schedule)</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="pdf">PDF Only</option>
                    <option value="excel">Excel Only</option>
                    <option value="both">PDF + Excel</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipients (comma-separated emails)</label>
                <input
                  type="text"
                  placeholder="email1@company.com, email2@company.com"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F855A]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button className="bg-[#2F855A] hover:bg-[#276749]">Create Package</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportPackagesPage;
