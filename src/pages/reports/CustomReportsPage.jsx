import React, { useState } from 'react';
import { FileText, Plus, Play, Save, Trash2, Copy, Settings, Database, Filter, BarChart3, Table, PieChart, Calendar, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CustomReportsPage = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [savedReports] = useState([
    { id: 1, name: 'Monthly Project Summary', dataSource: 'projects', lastRun: '2024-01-20', schedule: 'Monthly', columns: 5, filters: 2 },
    { id: 2, name: 'Pipeline by Stage', dataSource: 'opportunities', lastRun: '2024-01-19', schedule: 'Weekly', columns: 4, filters: 1 },
    { id: 3, name: 'Vendor Payment History', dataSource: 'transactions', lastRun: '2024-01-18', schedule: null, columns: 6, filters: 3 },
    { id: 4, name: 'Budget vs Actual by Entity', dataSource: 'entities', lastRun: '2024-01-15', schedule: 'Weekly', columns: 8, filters: 2 },
    { id: 5, name: 'Contact Activity Log', dataSource: 'contacts', lastRun: '2024-01-10', schedule: null, columns: 5, filters: 1 },
  ]);

  const dataSources = [
    { id: 'projects', name: 'Projects', icon: '🏗️', fields: ['name', 'status', 'budget', 'start_date', 'entity', 'project_type'] },
    { id: 'opportunities', name: 'Opportunities', icon: '🎯', fields: ['deal_number', 'address', 'stage', 'estimated_value', 'assigned_to'] },
    { id: 'transactions', name: 'Transactions', icon: '💰', fields: ['date', 'description', 'amount', 'type', 'category', 'vendor'] },
    { id: 'entities', name: 'Entities', icon: '🏢', fields: ['name', 'type', 'tax_id', 'parent_entity'] },
    { id: 'contacts', name: 'Contacts', icon: '👥', fields: ['name', 'company', 'email', 'phone', 'type'] },
    { id: 'vendors', name: 'Vendors', icon: '🔧', fields: ['name', 'type', 'phone', 'email', 'payment_terms'] },
  ];

  const [builderState, setBuilderState] = useState({
    name: '',
    dataSource: '',
    selectedFields: [],
    filters: [],
    groupBy: '',
    sortBy: '',
    chartType: 'table',
  });

  const handleDataSourceSelect = (sourceId) => {
    setBuilderState(prev => ({
      ...prev,
      dataSource: sourceId,
      selectedFields: [],
    }));
  };

  const toggleField = (field) => {
    setBuilderState(prev => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(field)
        ? prev.selectedFields.filter(f => f !== field)
        : [...prev.selectedFields, field],
    }));
  };

  const selectedSource = dataSources.find(ds => ds.id === builderState.dataSource);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#2F855A]" />
          <h1 className="text-xl font-semibold text-gray-900">Custom Reports</h1>
        </div>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowBuilder(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Report
        </Button>
      </div>

      {showBuilder ? (
        /* Report Builder */
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Report Builder</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowBuilder(false)}>Cancel</Button>
                  <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" />Preview</Button>
                  <Button className="bg-[#2F855A] hover:bg-[#276749]" size="sm"><Save className="w-4 h-4 mr-1" />Save Report</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Report Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                <input
                  type="text"
                  value={builderState.name}
                  onChange={(e) => setBuilderState(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter report name..."
                  className="w-full max-w-md px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F855A]"
                />
              </div>

              {/* Step 1: Data Source */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Database className="w-4 h-4 inline mr-1" /> 1. Select Data Source
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {dataSources.map(source => (
                    <button
                      key={source.id}
                      onClick={() => handleDataSourceSelect(source.id)}
                      className={`p-4 border rounded-lg text-center transition-all ${
                        builderState.dataSource === source.id
                          ? 'border-[#2F855A] bg-green-50 ring-2 ring-[#2F855A]'
                          : 'hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{source.icon}</span>
                      <span className="text-sm font-medium">{source.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Fields */}
              {selectedSource && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Table className="w-4 h-4 inline mr-1" /> 2. Select Fields
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSource.fields.map(field => (
                      <button
                        key={field}
                        onClick={() => toggleField(field)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          builderState.selectedFields.includes(field)
                            ? 'bg-[#2F855A] text-white border-[#2F855A]'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        {field.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                  {builderState.selectedFields.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {builderState.selectedFields.length} field(s) selected
                    </p>
                  )}
                </div>
              )}

              {/* Step 3: Filters */}
              {builderState.selectedFields.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Filter className="w-4 h-4 inline mr-1" /> 3. Add Filters (Optional)
                  </label>
                  <div className="flex gap-3 items-center">
                    <select className="px-3 py-2 border rounded-lg text-sm">
                      <option value="">Select field...</option>
                      {builderState.selectedFields.map(f => (
                        <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                    <select className="px-3 py-2 border rounded-lg text-sm">
                      <option value="equals">equals</option>
                      <option value="contains">contains</option>
                      <option value="greater">greater than</option>
                      <option value="less">less than</option>
                    </select>
                    <input type="text" placeholder="Value..." className="px-3 py-2 border rounded-lg text-sm" />
                    <Button variant="outline" size="sm"><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}

              {/* Step 4: Visualization */}
              {builderState.selectedFields.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <BarChart3 className="w-4 h-4 inline mr-1" /> 4. Visualization Type
                  </label>
                  <div className="flex gap-3">
                    {[
                      { id: 'table', icon: Table, label: 'Table' },
                      { id: 'bar', icon: BarChart3, label: 'Bar Chart' },
                      { id: 'pie', icon: PieChart, label: 'Pie Chart' },
                    ].map(viz => (
                      <button
                        key={viz.id}
                        onClick={() => setBuilderState(prev => ({ ...prev, chartType: viz.id }))}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${
                          builderState.chartType === viz.id
                            ? 'border-[#2F855A] bg-green-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <viz.icon className="w-4 h-4" />
                        <span className="text-sm">{viz.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Saved Reports List */
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Total Reports</p>
                <p className="text-2xl font-semibold">{savedReports.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-2xl font-semibold">{savedReports.filter(r => r.schedule).length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Run This Week</p>
                <p className="text-2xl font-semibold">12</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Data Sources Used</p>
                <p className="text-2xl font-semibold">{new Set(savedReports.map(r => r.dataSource)).size}</p>
              </CardContent>
            </Card>
          </div>

          {/* Reports Table */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Saved Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="text-left p-4">Report Name</th>
                    <th className="text-left p-4">Data Source</th>
                    <th className="text-left p-4">Columns</th>
                    <th className="text-left p-4">Filters</th>
                    <th className="text-left p-4">Schedule</th>
                    <th className="text-left p-4">Last Run</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {savedReports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <span className="font-medium text-gray-900">{report.name}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">{report.dataSource}</Badge>
                      </td>
                      <td className="p-4 text-gray-600">{report.columns}</td>
                      <td className="p-4 text-gray-600">{report.filters}</td>
                      <td className="p-4">
                        {report.schedule ? (
                          <Badge className="bg-blue-100 text-blue-700">{report.schedule}</Badge>
                        ) : (
                          <span className="text-gray-400">Manual</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">{report.lastRun}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" title="Run"><Play className="w-4 h-4 text-green-600" /></Button>
                          <Button variant="ghost" size="sm" title="Download"><Download className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" title="Duplicate"><Copy className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" title="Settings"><Settings className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CustomReportsPage;
