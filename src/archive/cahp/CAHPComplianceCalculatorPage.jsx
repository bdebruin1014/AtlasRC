// src/pages/cahp/CAHPComplianceCalculatorPage.jsx
// Compliance Calculator - Upload rent roll and analyze Safe Harbor thresholds

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, Upload, FileSpreadsheet, CheckCircle, XCircle, 
  AlertTriangle, ArrowLeft, Download, RefreshCw, Trash2, Plus,
  Info, ChevronDown, ChevronUp, Percent, Users, DollarSign, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  analyzeRentRoll,
  parseRentRollCSV,
  calculateAMIStatus,
  AMI_LIMITS_2024,
  SAFE_HARBOR_THRESHOLDS,
  COMPLIANCE_STATUS,
} from '@/services/cahpService';

const CAHPComplianceCalculatorPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [totalUnits, setTotalUnits] = useState('');
  const [units, setUnits] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [showUnitDetails, setShowUnitDetails] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    unitNumber: '',
    tenantName: '',
    householdSize: 1,
    grossAnnualIncome: '',
    monthlyRent: '',
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const parsedUnits = parseRentRollCSV(text);
        setUnits(parsedUnits);
        if (!totalUnits) {
          setTotalUnits(parsedUnits.length.toString());
        }
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (units.length === 0) return;
    
    const effectiveTotal = totalUnits ? parseInt(totalUnits) : units.length;
    const result = analyzeRentRoll(units, effectiveTotal);
    setAnalysis(result);
  };

  const handleAddManualUnit = () => {
    if (!manualEntry.grossAnnualIncome) return;

    const newUnit = {
      unitNumber: manualEntry.unitNumber || `Unit ${units.length + 1}`,
      tenantName: manualEntry.tenantName,
      householdSize: parseInt(manualEntry.householdSize) || 1,
      grossAnnualIncome: parseFloat(manualEntry.grossAnnualIncome) || 0,
      monthlyRent: parseFloat(manualEntry.monthlyRent) || 0,
    };

    setUnits([...units, newUnit]);
    setManualEntry({
      unitNumber: '',
      tenantName: '',
      householdSize: 1,
      grossAnnualIncome: '',
      monthlyRent: '',
    });
    setAnalysis(null); // Clear previous analysis
  };

  const handleRemoveUnit = (index) => {
    setUnits(units.filter((_, i) => i !== index));
    setAnalysis(null);
  };

  const handleClearAll = () => {
    setUnits([]);
    setAnalysis(null);
    setTotalUnits('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const downloadTemplate = () => {
    const template = `Unit,Tenant Name,Household Size,Annual Income,Monthly Rent
101,John Smith,2,35000,850
102,Jane Doe,1,28000,750
103,Bob Johnson,4,52000,1100
104,Mary Williams,3,42000,950`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rent_roll_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case '50_AMI': return 'bg-emerald-100 text-emerald-800';
      case '60_AMI': return 'bg-teal-100 text-teal-800';
      case '80_AMI': return 'bg-blue-100 text-blue-800';
      case 'MARKET': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/cahp')}
              className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Compliance Calculator</h1>
              <p className="text-sm text-gray-500">Analyze rent roll for Safe Harbor compliance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Threshold Reference */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-800">Safe Harbor Requirements</h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <p className="font-medium">Overall Threshold:</p>
                  <p>• 75% of units at ≤80% AMI</p>
                  <p>• Maximum 25% market rate (&gt;80% AMI)</p>
                </div>
                <div>
                  <p className="font-medium">Deep Affordability (choose one):</p>
                  <p>• <strong>Option A:</strong> 20% at ≤50% AMI</p>
                  <p>• <strong>Option B:</strong> 40% at ≤60% AMI</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Data Entry */}
          <div className="col-span-2 space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-gray-400" />
                Upload Rent Roll
              </h2>

              <div className="flex items-center gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Units in Property
                  </label>
                  <input
                    type="number"
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(e.target.value)}
                    placeholder="e.g., 16"
                    className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Include vacant units</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV
                </Button>
                <Button 
                  variant="ghost"
                  onClick={downloadTemplate}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                {units.length > 0 && (
                  <Button 
                    variant="ghost"
                    onClick={handleClearAll}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                CSV columns: Unit, Tenant Name, Household Size, Annual Income, Monthly Rent
              </p>
            </div>

            {/* Manual Entry */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-gray-400" />
                Add Unit Manually
              </h2>

              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit #</label>
                  <input
                    type="text"
                    value={manualEntry.unitNumber}
                    onChange={(e) => setManualEntry({ ...manualEntry, unitNumber: e.target.value })}
                    placeholder="101"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">HH Size</label>
                  <select
                    value={manualEntry.householdSize}
                    onChange={(e) => setManualEntry({ ...manualEntry, householdSize: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Annual Income</label>
                  <input
                    type="number"
                    value={manualEntry.grossAnnualIncome}
                    onChange={(e) => setManualEntry({ ...manualEntry, grossAnnualIncome: e.target.value })}
                    placeholder="35000"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Rent</label>
                  <input
                    type="number"
                    value={manualEntry.monthlyRent}
                    onChange={(e) => setManualEntry({ ...manualEntry, monthlyRent: e.target.value })}
                    placeholder="850"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleAddManualUnit}
                    disabled={!manualEntry.grossAnnualIncome}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Units Table */}
            {units.length > 0 && (
              <div className="bg-white rounded-lg border">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <h2 className="font-semibold">Units Entered ({units.length})</h2>
                  <Button 
                    onClick={handleAnalyze}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Analyze Compliance
                  </Button>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Unit</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">HH Size</th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600">Income</th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600">Rent</th>
                        <th className="text-center px-4 py-2 font-medium text-gray-600">AMI %</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {units.map((unit, idx) => {
                        const status = calculateAMIStatus(unit.grossAnnualIncome, unit.householdSize);
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium">{unit.unitNumber}</td>
                            <td className="px-4 py-2">{unit.householdSize}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(unit.grossAnnualIncome)}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(unit.monthlyRent)}</td>
                            <td className="px-4 py-2 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-xs font-medium",
                                status.qualifiesAt50 ? "bg-emerald-100 text-emerald-800" :
                                status.qualifiesAt60 ? "bg-teal-100 text-teal-800" :
                                status.qualifiesAt80 ? "bg-blue-100 text-blue-800" :
                                "bg-gray-100 text-gray-800"
                              )}>
                                {status.amiPercentage}%
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <button 
                                onClick={() => handleRemoveUnit(idx)}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - AMI Reference */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold mb-3">2024 Income Limits</h3>
              <p className="text-xs text-gray-500 mb-3">{AMI_LIMITS_2024.area}</p>
              
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">HH</th>
                    <th className="text-right py-1">50%</th>
                    <th className="text-right py-1">60%</th>
                    <th className="text-right py-1">80%</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5,6,7,8].map(size => (
                    <tr key={size} className="border-b border-gray-100">
                      <td className="py-1 font-medium">{size}</td>
                      <td className="py-1 text-right text-emerald-600">
                        {formatCurrency(AMI_LIMITS_2024.limits_by_household_size[size].very_low)}
                      </td>
                      <td className="py-1 text-right text-teal-600">
                        {formatCurrency(AMI_LIMITS_2024.limits_by_household_size[size].low_60)}
                      </td>
                      <td className="py-1 text-right text-blue-600">
                        {formatCurrency(AMI_LIMITS_2024.limits_by_household_size[size].low)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold mb-3">Category Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                  <span>≤50% AMI (Very Low)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-teal-500 rounded-full"></span>
                  <span>51-60% AMI (Low)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span>61-80% AMI (Moderate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                  <span>&gt;80% AMI (Market Rate)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Compliance Status Banner */}
            <div className={cn(
              "rounded-lg border p-6",
              analysis.compliance.isCompliant 
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center gap-4">
                {analysis.compliance.isCompliant ? (
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-600" />
                )}
                <div>
                  <h2 className={cn(
                    "text-2xl font-bold",
                    analysis.compliance.isCompliant ? "text-emerald-800" : "text-red-800"
                  )}>
                    {analysis.compliance.isCompliant ? 'COMPLIANT' : 'NOT COMPLIANT'}
                  </h2>
                  <p className={cn(
                    "text-lg",
                    analysis.compliance.isCompliant ? "text-emerald-700" : "text-red-700"
                  )}>
                    {analysis.compliance.isCompliant 
                      ? `Using ${analysis.compliance.deepAffordabilityOption}`
                      : 'Does not meet Safe Harbor requirements'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Threshold Results */}
            <div className="bg-white rounded-lg border">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold">Threshold Analysis</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Qualifying Threshold */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">75% Qualifying Threshold</h3>
                      {analysis.thresholds.qualifying.met ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Required:</span>
                        <span>≥75% at ≤80% AMI</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Actual:</span>
                        <span className={cn(
                          "font-semibold",
                          analysis.thresholds.qualifying.met ? "text-emerald-600" : "text-red-600"
                        )}>
                          {analysis.percentages.at80AMI}% ({analysis.counts.at80OrLess} of {analysis.totalUnits} units)
                        </span>
                      </div>
                      {!analysis.thresholds.qualifying.met && (
                        <p className="text-sm text-red-600 mt-2">
                          Need {analysis.thresholds.qualifying.unitsNeeded} more qualifying unit(s)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Market Rate Limit */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">25% Market Rate Limit</h3>
                      {analysis.thresholds.marketRate.met ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Required:</span>
                        <span>≤25% &gt;80% AMI</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Actual:</span>
                        <span className={cn(
                          "font-semibold",
                          analysis.thresholds.marketRate.met ? "text-emerald-600" : "text-red-600"
                        )}>
                          {analysis.percentages.marketRate}% ({analysis.counts.marketRate} of {analysis.totalUnits} units)
                        </span>
                      </div>
                      {!analysis.thresholds.marketRate.met && (
                        <p className="text-sm text-red-600 mt-2">
                          {analysis.thresholds.marketRate.unitsExcess} unit(s) over limit
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Option A */}
                  <div className={cn(
                    "p-4 rounded-lg border",
                    analysis.thresholds.optionA.met ? "bg-emerald-50 border-emerald-200" : ""
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Option A: 20% at ≤50% AMI</h3>
                      {analysis.thresholds.optionA.met ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                          Not Met
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Required:</span>
                        <span>≥20% at ≤50% AMI</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Actual:</span>
                        <span className={cn(
                          "font-semibold",
                          analysis.thresholds.optionA.met ? "text-emerald-600" : "text-gray-600"
                        )}>
                          {analysis.percentages.at50AMI}% ({analysis.counts.at50AMI} of {analysis.totalUnits} units)
                        </span>
                      </div>
                      {!analysis.thresholds.optionA.met && (
                        <p className="text-sm text-gray-600 mt-2">
                          Need {analysis.thresholds.optionA.unitsNeeded} more at ≤50% AMI
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Option B */}
                  <div className={cn(
                    "p-4 rounded-lg border",
                    analysis.thresholds.optionB.met ? "bg-emerald-50 border-emerald-200" : ""
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Option B: 40% at ≤60% AMI</h3>
                      {analysis.thresholds.optionB.met ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                          Not Met
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Required:</span>
                        <span>≥40% at ≤60% AMI</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Actual:</span>
                        <span className={cn(
                          "font-semibold",
                          analysis.thresholds.optionB.met ? "text-emerald-600" : "text-gray-600"
                        )}>
                          {analysis.percentages.at60AMI}% ({analysis.counts.at60OrLess} of {analysis.totalUnits} units)
                        </span>
                      </div>
                      {!analysis.thresholds.optionB.met && (
                        <p className="text-sm text-gray-600 mt-2">
                          Need {analysis.thresholds.optionB.unitsNeeded} more at ≤60% AMI
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unit Breakdown */}
            <div className="bg-white rounded-lg border">
              <button
                onClick={() => setShowUnitDetails(!showUnitDetails)}
                className="w-full px-4 py-3 border-b flex items-center justify-between hover:bg-gray-50"
              >
                <h2 className="font-semibold">Unit-by-Unit Analysis</h2>
                {showUnitDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {showUnitDetails && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Unit</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Tenant</th>
                        <th className="text-center px-4 py-2 font-medium text-gray-600">HH Size</th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600">Income</th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600">Rent</th>
                        <th className="text-center px-4 py-2 font-medium text-gray-600">AMI %</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Category</th>
                        <th className="text-center px-4 py-2 font-medium text-gray-600">Rent/Income</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {analysis.units.map((unit, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{unit.unitNumber}</td>
                          <td className="px-4 py-2">{unit.tenantName || '—'}</td>
                          <td className="px-4 py-2 text-center">{unit.householdSize}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(unit.grossAnnualIncome)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(unit.monthlyRent)}</td>
                          <td className="px-4 py-2 text-center font-medium">{unit.amiPercentage}%</td>
                          <td className="px-4 py-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              getCategoryColor(unit.category)
                            )}>
                              {unit.categoryLabel}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className={cn(
                              unit.rentExceeds30Pct && unit.qualifiesAt80 ? "text-amber-600" : ""
                            )}>
                              {unit.rentToIncomeRatio}%
                              {unit.rentExceeds30Pct && unit.qualifiesAt80 && (
                                <AlertTriangle className="w-3 h-3 inline ml-1" />
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="bg-white rounded-lg border p-4">
                <h2 className="font-semibold mb-3">Recommendations</h2>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className={cn(
                      "flex items-start gap-2 text-sm p-2 rounded",
                      rec.type === 'critical' ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"
                    )}>
                      {rec.type === 'critical' ? (
                        <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      {rec.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border p-4 text-center">
                <p className="text-sm text-gray-500">Total Units</p>
                <p className="text-2xl font-bold">{analysis.totalUnits}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 text-center">
                <p className="text-sm text-emerald-700">≤50% AMI</p>
                <p className="text-2xl font-bold text-emerald-700">{analysis.counts.at50AMI}</p>
                <p className="text-sm text-emerald-600">{analysis.percentages.at50AMI}%</p>
              </div>
              <div className="bg-teal-50 rounded-lg border border-teal-200 p-4 text-center">
                <p className="text-sm text-teal-700">≤60% AMI</p>
                <p className="text-2xl font-bold text-teal-700">{analysis.counts.at60OrLess}</p>
                <p className="text-sm text-teal-600">{analysis.percentages.at60AMI}%</p>
              </div>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
                <p className="text-sm text-blue-700">≤80% AMI</p>
                <p className="text-2xl font-bold text-blue-700">{analysis.counts.at80OrLess}</p>
                <p className="text-sm text-blue-600">{analysis.percentages.at80AMI}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CAHPComplianceCalculatorPage;
