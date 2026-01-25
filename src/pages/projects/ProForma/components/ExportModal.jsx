// src/pages/projects/ProForma/components/ExportModal.jsx
// Modal for exporting Pro Forma data to PDF, PowerPoint, CSV, and JSON

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  X, FileText, Presentation, FileSpreadsheet, FileJson,
  Download, Loader2, Check, ChevronDown, ChevronUp,
  BarChart3, Table, PieChart, LineChart,
} from 'lucide-react';
import { exportToPDF, exportToPresentation, exportToCSV, exportToJSON } from '@/utils/proformaExport';
import { ReturnsDashboard } from './ReturnCharts';

const EXPORT_FORMATS = [
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'Professional PDF report with charts and tables',
    icon: FileText,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'pptx',
    name: 'PowerPoint',
    description: 'Presentation slides for investor meetings',
    icon: Presentation,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'csv',
    name: 'CSV Spreadsheet',
    description: 'Raw data for Excel or Google Sheets',
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'json',
    name: 'JSON Data',
    description: 'Structured data for integrations',
    icon: FileJson,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
];

const CONTENT_OPTIONS = [
  { id: 'includeSummary', label: 'Executive Summary', description: 'Key metrics and project overview' },
  { id: 'includeWaterfall', label: 'Waterfall Distribution', description: 'Tier-by-tier breakdown' },
  { id: 'includeScenarios', label: 'Scenario Analysis', description: 'Downside/Base/Upside comparison' },
  { id: 'includeCharts', label: 'Charts & Graphs', description: 'Visual returns analysis' },
  { id: 'includeCosts', label: 'Cost Breakdown', description: 'Detailed cost analysis' },
];

export default function ExportModal({
  isOpen,
  onClose,
  proforma,
  calculations,
  waterfallResults,
  scenarios,
}) {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [contentOptions, setContentOptions] = useState({
    includeSummary: true,
    includeWaterfall: true,
    includeScenarios: true,
    includeCharts: true,
    includeCosts: true,
  });
  const [showOptions, setShowOptions] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportedFile, setExportedFile] = useState(null);

  const chartRef = useRef(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setExporting(true);
    setExportComplete(false);

    try {
      let filename;

      const exportParams = {
        proforma,
        calculations,
        waterfallResults,
        scenarios,
        chartRef,
        options: contentOptions,
      };

      switch (selectedFormat) {
        case 'pdf':
          filename = await exportToPDF(exportParams);
          break;
        case 'pptx':
          filename = await exportToPresentation(exportParams);
          break;
        case 'csv':
          filename = exportToCSV(exportParams);
          break;
        case 'json':
          filename = exportToJSON(exportParams);
          break;
        default:
          throw new Error('Unknown export format');
      }

      setExportedFile(filename);
      setExportComplete(true);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleClose = () => {
    setExportComplete(false);
    setExportedFile(null);
    onClose();
  };

  const toggleOption = (optionId) => {
    setContentOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  const selectedFormatInfo = EXPORT_FORMATS.find((f) => f.id === selectedFormat);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Export Pro Forma</h2>
            <p className="text-sm text-gray-500">{proforma?.name || 'Unnamed Pro Forma'}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {exportComplete ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Complete</h3>
              <p className="text-gray-500 mb-6">
                Your file <span className="font-medium text-gray-700">{exportedFile}</span> has been downloaded.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setExportComplete(false)}>
                  Export Another
                </Button>
                <Button onClick={handleClose} className="bg-[#2F855A] hover:bg-[#276749] text-white">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Format Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Select Format</h3>
                <div className="grid grid-cols-2 gap-3">
                  {EXPORT_FORMATS.map((format) => {
                    const Icon = format.icon;
                    const isSelected = selectedFormat === format.id;

                    return (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all
                          ${isSelected
                            ? 'border-[#2F855A] bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${format.bgColor}`}>
                            <Icon className={`h-5 w-5 ${format.color}`} />
                          </div>
                          <div>
                            <p className={`font-medium ${isSelected ? 'text-[#2F855A]' : 'text-gray-900'}`}>
                              {format.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{format.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Options (for PDF and PPTX) */}
              {(selectedFormat === 'pdf' || selectedFormat === 'pptx') && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-sm font-medium text-gray-700">Content Options</h3>
                    {showOptions ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {showOptions && (
                    <div className="mt-3 space-y-2">
                      {CONTENT_OPTIONS.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={contentOptions[option.id]}
                            onChange={() => toggleOption(option.id)}
                            className="w-4 h-4 rounded border-gray-300 text-[#2F855A] focus:ring-[#2F855A]"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{option.label}</p>
                            <p className="text-xs text-gray-500">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preview Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Export Preview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Format</p>
                    <p className="font-medium text-gray-900">{selectedFormatInfo?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pro Forma</p>
                    <p className="font-medium text-gray-900">{proforma?.name || 'Unnamed'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Template</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {proforma?.template_type?.replace(/_/g, ' ') || 'Standard'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Data Included</p>
                    <p className="font-medium text-gray-900">
                      {Object.values(contentOptions).filter(Boolean).length} sections
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart Preview (hidden, used for capture) */}
              {contentOptions.includeCharts && (
                <div className="hidden">
                  <ReturnsDashboard
                    ref={chartRef}
                    waterfallResults={waterfallResults}
                    calculations={calculations}
                    scenarios={scenarios}
                    proforma={proforma}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!exportComplete && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <p className="text-xs text-gray-500">
              Export includes all selected content sections
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="bg-[#2F855A] hover:bg-[#276749] text-white min-w-[120px]"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Quick Export Button Component (for use in toolbars)
export function ExportButton({ onClick, variant = 'default' }) {
  if (variant === 'icon') {
    return (
      <Button variant="outline" size="sm" onClick={onClick} title="Export Pro Forma">
        <Download className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Download className="h-4 w-4 mr-2" />
      Export
    </Button>
  );
}

// Charts Preview Modal (for viewing charts before export)
export function ChartsPreviewModal({
  isOpen,
  onClose,
  waterfallResults,
  calculations,
  scenarios,
  proforma,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-[#2F855A]" />
            <h2 className="text-xl font-semibold text-gray-900">Returns Charts</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <ReturnsDashboard
            waterfallResults={waterfallResults}
            calculations={calculations}
            scenarios={scenarios}
            proforma={proforma}
          />
        </div>
      </div>
    </div>
  );
}
