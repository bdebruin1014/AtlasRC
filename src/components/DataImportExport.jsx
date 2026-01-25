import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  Database,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Settings,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  File,
  Building2,
  Users,
  DollarSign,
  Briefcase,
  MapPin
} from 'lucide-react';

// Demo import history
const demoImportHistory = [
  {
    id: '1',
    filename: 'contacts_january_2026.csv',
    type: 'contacts',
    status: 'completed',
    records_total: 150,
    records_imported: 148,
    records_failed: 2,
    created_at: '2026-01-20T10:30:00Z',
    completed_at: '2026-01-20T10:31:45Z'
  },
  {
    id: '2',
    filename: 'properties_data.xlsx',
    type: 'properties',
    status: 'completed',
    records_total: 25,
    records_imported: 25,
    records_failed: 0,
    created_at: '2026-01-18T14:00:00Z',
    completed_at: '2026-01-18T14:02:30Z'
  },
  {
    id: '3',
    filename: 'transactions_q4.csv',
    type: 'transactions',
    status: 'failed',
    records_total: 500,
    records_imported: 0,
    records_failed: 500,
    error: 'Invalid date format in column "transaction_date"',
    created_at: '2026-01-15T09:00:00Z',
    completed_at: '2026-01-15T09:00:15Z'
  }
];

// Demo export history
const demoExportHistory = [
  {
    id: '1',
    name: 'All Contacts Export',
    type: 'contacts',
    format: 'csv',
    records: 450,
    file_size: '125 KB',
    status: 'completed',
    created_at: '2026-01-24T16:00:00Z',
    download_url: '#'
  },
  {
    id: '2',
    name: 'Active Projects Report',
    type: 'projects',
    format: 'xlsx',
    records: 12,
    file_size: '45 KB',
    status: 'completed',
    created_at: '2026-01-22T11:30:00Z',
    download_url: '#'
  },
  {
    id: '3',
    name: 'Financial Transactions',
    type: 'transactions',
    format: 'csv',
    records: 2500,
    file_size: '890 KB',
    status: 'processing',
    created_at: '2026-01-25T10:00:00Z',
    download_url: null
  }
];

const dataTypes = [
  { id: 'contacts', name: 'Contacts', icon: Users, fields: ['name', 'email', 'phone', 'company', 'type', 'address', 'notes'] },
  { id: 'properties', name: 'Properties', icon: Building2, fields: ['name', 'address', 'city', 'state', 'zip', 'type', 'status', 'value'] },
  { id: 'transactions', name: 'Transactions', icon: DollarSign, fields: ['date', 'description', 'amount', 'type', 'category', 'account', 'reference'] },
  { id: 'entities', name: 'Entities', icon: Briefcase, fields: ['name', 'type', 'ein', 'address', 'state', 'status'] },
  { id: 'opportunities', name: 'Opportunities', icon: MapPin, fields: ['name', 'address', 'status', 'value', 'contact', 'notes'] }
];

export default function DataImportExport() {
  const [activeTab, setActiveTab] = useState('import');
  const [importHistory, setImportHistory] = useState([]);
  const [exportHistory, setExportHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Import state
  const [importStep, setImportStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDataType, setSelectedDataType] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [importProgress, setImportProgress] = useState(null);

  // Export state
  const [exportDataType, setExportDataType] = useState(null);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFilters, setExportFilters] = useState({});
  const [selectedFields, setSelectedFields] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setImportHistory(demoImportHistory);
        setExportHistory(demoExportHistory);
      } else {
        const [importRes, exportRes] = await Promise.all([
          supabase.from('import_history').select('*').order('created_at', { ascending: false }).limit(10),
          supabase.from('export_history').select('*').order('created_at', { ascending: false }).limit(10)
        ]);

        setImportHistory(importRes.data || []);
        setExportHistory(exportRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setImportHistory(demoImportHistory);
      setExportHistory(demoExportHistory);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Simulate file preview
      setFilePreview({
        headers: ['Name', 'Email', 'Phone', 'Company', 'Type', 'Address'],
        rows: [
          ['John Smith', 'john@example.com', '555-0100', 'ABC Corp', 'Investor', '123 Main St'],
          ['Sarah Johnson', 'sarah@example.com', '555-0101', 'XYZ Holdings', 'Vendor', '456 Oak Ave'],
          ['Mike Chen', 'mike@example.com', '555-0102', 'Global Props', 'Partner', '789 Pine Rd']
        ]
      });
      setImportStep(2);
    }
  };

  const handleFieldMapping = (fileHeader, systemField) => {
    setFieldMapping(prev => ({ ...prev, [fileHeader]: systemField }));
  };

  const startImport = () => {
    setImportStep(4);
    setImportProgress({ current: 0, total: 150, status: 'processing' });

    // Simulate import progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 150) {
        clearInterval(interval);
        setImportProgress({ current: 148, total: 150, status: 'completed', failed: 2 });
      } else {
        setImportProgress({ current: Math.floor(progress), total: 150, status: 'processing' });
      }
    }, 500);
  };

  const resetImport = () => {
    setImportStep(1);
    setSelectedFile(null);
    setSelectedDataType(null);
    setFilePreview(null);
    setFieldMapping({});
    setImportProgress(null);
  };

  const startExport = () => {
    if (!exportDataType) return;

    const newExport = {
      id: Date.now().toString(),
      name: `${exportDataType.name} Export`,
      type: exportDataType.id,
      format: exportFormat,
      records: Math.floor(Math.random() * 500) + 50,
      file_size: `${Math.floor(Math.random() * 500) + 50} KB`,
      status: 'processing',
      created_at: new Date().toISOString(),
      download_url: null
    };

    setExportHistory(prev => [newExport, ...prev]);

    // Simulate export completion
    setTimeout(() => {
      setExportHistory(prev => prev.map(e =>
        e.id === newExport.id
          ? { ...e, status: 'completed', download_url: '#' }
          : e
      ));
    }, 3000);

    // Reset export form
    setExportDataType(null);
    setSelectedFields([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center gap-1 text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs"><CheckCircle2 className="h-3 w-3" /> Completed</span>;
      case 'processing':
        return <span className="flex items-center gap-1 text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-xs"><RefreshCw className="h-3 w-3 animate-spin" /> Processing</span>;
      case 'failed':
        return <span className="flex items-center gap-1 text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-xs"><X className="h-3 w-3" /> Failed</span>;
      default:
        return <span className="flex items-center gap-1 text-gray-600 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs"><Clock className="h-3 w-3" /> Pending</span>;
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
          <Database className="h-7 w-7 text-blue-600" />
          Data Import / Export
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Import data from files or export your data to various formats
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'import'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Upload className="h-4 w-4" />
          Import Data
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'export'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      {activeTab === 'import' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Import Wizard */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {['Select File', 'Choose Type', 'Map Fields', 'Import'].map((step, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      importStep > idx + 1
                        ? 'bg-green-500 text-white'
                        : importStep === idx + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {importStep > idx + 1 ? <Check className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span className={`ml-2 text-sm ${importStep >= idx + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                      {step}
                    </span>
                    {idx < 3 && <ArrowRight className="h-4 w-4 mx-4 text-gray-300" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Select File */}
              {importStep === 1 && (
                <div className="text-center py-8">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-blue-500 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports CSV, XLSX, and XLS files up to 10MB
                    </p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Select File
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Choose Data Type */}
              {importStep === 2 && (
                <div>
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{selectedFile?.name}</div>
                      <div className="text-sm text-gray-500">{(selectedFile?.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>

                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">What type of data is this?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {dataTypes.map(type => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => {
                            setSelectedDataType(type);
                            setImportStep(3);
                          }}
                          className={`flex items-center gap-3 p-4 border rounded-lg hover:border-blue-500 transition-colors ${
                            selectedDataType?.id === type.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <IconComponent className="h-6 w-6 text-blue-600" />
                          <span className="font-medium text-gray-900 dark:text-white">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setImportStep(1)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Map Fields */}
              {importStep === 3 && filePreview && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Map your columns to system fields</h3>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Your Column</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500"></th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Maps To</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Preview</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filePreview.headers.map((header, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{header}</td>
                            <td className="px-4 py-3 text-center">
                              <ArrowRight className="h-4 w-4 text-gray-400 mx-auto" />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={fieldMapping[header] || ''}
                                onChange={(e) => handleFieldMapping(header, e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                              >
                                <option value="">-- Skip --</option>
                                {selectedDataType?.fields.map(field => (
                                  <option key={field} value={field}>{field}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {filePreview.rows[0]?.[idx]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setImportStep(2)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      onClick={startImport}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Start Import
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Import Progress */}
              {importStep === 4 && importProgress && (
                <div className="text-center py-8">
                  {importProgress.status === 'processing' ? (
                    <>
                      <RefreshCw className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Importing data...</h3>
                      <p className="text-gray-500 mb-4">
                        {importProgress.current} of {importProgress.total} records processed
                      </p>
                      <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Import Complete!</h3>
                      <div className="flex justify-center gap-8 mb-6">
                        <div>
                          <div className="text-2xl font-bold text-green-600">{importProgress.current}</div>
                          <div className="text-sm text-gray-500">Imported</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">{importProgress.failed}</div>
                          <div className="text-sm text-gray-500">Failed</div>
                        </div>
                      </div>
                      <button
                        onClick={resetImport}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Import Another File
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Import History */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Recent Imports</h3>
              <div className="space-y-3">
                {importHistory.map(item => (
                  <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.filename}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.records_imported}/{item.records_total} records • {formatDate(item.created_at)}
                    </div>
                    {item.error && (
                      <div className="text-xs text-red-600 mt-1">{item.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Export Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-6">Create New Export</h3>

              <div className="space-y-6">
                {/* Data Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Data to Export
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {dataTypes.map(type => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => {
                            setExportDataType(type);
                            setSelectedFields(type.fields);
                          }}
                          className={`flex flex-col items-center gap-2 p-4 border rounded-lg hover:border-blue-500 transition-colors ${
                            exportDataType?.id === type.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <IconComponent className="h-6 w-6 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Export Format
                  </label>
                  <div className="flex gap-3">
                    {[
                      { id: 'csv', name: 'CSV', desc: 'Comma-separated values' },
                      { id: 'xlsx', name: 'Excel', desc: 'Microsoft Excel format' },
                      { id: 'json', name: 'JSON', desc: 'JavaScript Object Notation' }
                    ].map(format => (
                      <button
                        key={format.id}
                        onClick={() => setExportFormat(format.id)}
                        className={`flex-1 p-3 border rounded-lg transition-colors ${
                          exportFormat === format.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{format.name}</div>
                        <div className="text-xs text-gray-500">{format.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field Selection */}
                {exportDataType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fields to Include
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {exportDataType.fields.map(field => (
                        <button
                          key={field}
                          onClick={() => {
                            setSelectedFields(prev =>
                              prev.includes(field)
                                ? prev.filter(f => f !== field)
                                : [...prev, field]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedFields.includes(field)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {field}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Export Button */}
                <button
                  onClick={startExport}
                  disabled={!exportDataType || selectedFields.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-5 w-5" />
                  Generate Export
                </button>
              </div>
            </div>
          </div>

          {/* Export History */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Recent Exports</h3>
              <div className="space-y-3">
                {exportHistory.map(item => (
                  <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {item.records} records • {item.file_size} • {item.format.toUpperCase()}
                    </div>
                    {item.status === 'completed' && item.download_url && (
                      <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
