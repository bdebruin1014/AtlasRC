// src/pages/cahp/CAHPAddPropertyPage.jsx
// Form for adding new CAHP properties

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, DollarSign, Percent, Calendar, FileText, 
  Loader2, AlertCircle, CheckCircle, ArrowLeft, Save,
  Shield, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createCAHPProperty,
  CAHP_ENTITY_INFO,
  FEE_STRUCTURE,
} from '@/services/cahpService';

const CAHPAddPropertyPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    propertyName: '',
    propertyAddress: '',
    city: 'Greenville',
    state: 'SC',
    zip: '',
    county: 'Greenville',
    parcelNumber: '',
    totalUnits: 1,
    llcEntity: '',
    cahpOwnershipPercentage: 0.01,
    effectiveDate: new Date().toISOString().split('T')[0],
    annualAssessedValue: '',
    standardTaxRate: 0.06,
    notes: '',
  });

  // Calculate estimated savings
  const estimatedTaxSavings = formData.annualAssessedValue 
    ? parseFloat(formData.annualAssessedValue) * formData.standardTaxRate 
    : 0;
  
  const annualCAHPFee = estimatedTaxSavings * FEE_STRUCTURE.ANNUAL_FEE_PERCENTAGE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: createError } = await createCAHPProperty({
        propertyName: formData.propertyName,
        propertyAddress: `${formData.propertyAddress}, ${formData.city}, ${formData.state} ${formData.zip}`,
        county: formData.county,
        parcelNumber: formData.parcelNumber,
        totalUnits: parseInt(formData.totalUnits),
        effectiveDate: formData.effectiveDate,
        llcEntity: formData.llcEntity,
        cahpOwnershipPercentage: parseFloat(formData.cahpOwnershipPercentage),
        annualAssessedValue: parseFloat(formData.annualAssessedValue),
        standardTaxRate: parseFloat(formData.standardTaxRate),
      });

      if (createError) throw createError;

      setSuccess(true);
      setTimeout(() => {
        navigate(`/cahp/properties/${data.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error creating property:', err);
      setError(err.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const scCounties = [
    'Abbeville', 'Aiken', 'Allendale', 'Anderson', 'Bamberg', 'Barnwell',
    'Beaufort', 'Berkeley', 'Calhoun', 'Charleston', 'Cherokee', 'Chester',
    'Chesterfield', 'Clarendon', 'Colleton', 'Darlington', 'Dillon', 'Dorchester',
    'Edgefield', 'Fairfield', 'Florence', 'Georgetown', 'Greenville', 'Greenwood',
    'Hampton', 'Horry', 'Jasper', 'Kershaw', 'Lancaster', 'Laurens', 'Lee',
    'Lexington', 'Marion', 'Marlboro', 'McCormick', 'Newberry', 'Oconee',
    'Orangeburg', 'Pickens', 'Richland', 'Saluda', 'Spartanburg', 'Sumter',
    'Union', 'Williamsburg', 'York'
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Property Created!</h2>
          <p className="text-gray-500">Redirecting to property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/cahp/properties')}
              className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Add CAHP Property</h1>
              <p className="text-sm text-gray-500">Register a new Safe Harbor property</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              Property Information
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.propertyName}
                  onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                  placeholder="e.g., Arlington Apartments"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.propertyAddress}
                  onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="29601"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  County <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {scCounties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parcel Number
                </label>
                <input
                  type="text"
                  value={formData.parcelNumber}
                  onChange={(e) => setFormData({ ...formData, parcelNumber: e.target.value })}
                  placeholder="Tax map parcel ID"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Units <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.totalUnits}
                  onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* CAHP Structure */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" />
              CAHP Structure
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owning LLC <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.llcEntity}
                  onChange={(e) => setFormData({ ...formData, llcEntity: e.target.value })}
                  placeholder="e.g., Arlington 16, LLC"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CAHP Ownership %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.cahpOwnershipPercentage * 100}
                    onChange={(e) => setFormData({ ...formData, cahpOwnershipPercentage: parseFloat(e.target.value) / 100 })}
                    step="0.01"
                    min="0.01"
                    max="100"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Typically 1% for Managing Member</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Managing Member
                </label>
                <input
                  type="text"
                  value={CAHP_ENTITY_INFO.subsidiary.name}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Operating Agreement Required</p>
                <p>The LLC must have an executed Operating Agreement designating {CAHP_ENTITY_INFO.subsidiary.name} as Managing Member with Safe Harbor compliance provisions.</p>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              Tax Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Assessed Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.annualAssessedValue}
                    onChange={(e) => setFormData({ ...formData, annualAssessedValue: e.target.value })}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard Tax Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.standardTaxRate * 100}
                    onChange={(e) => setFormData({ ...formData, standardTaxRate: parseFloat(e.target.value) / 100 })}
                    step="0.01"
                    min="0"
                    max="20"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Default: 6% for SC</p>
              </div>
            </div>

            {/* Savings Calculator */}
            {formData.annualAssessedValue && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h3 className="font-medium text-emerald-800 mb-3">Estimated Savings</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-emerald-600">Annual Tax Savings</p>
                    <p className="text-xl font-semibold text-emerald-700">
                      {formatCurrency(estimatedTaxSavings)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600">CAHP Annual Fee (20%)</p>
                    <p className="text-xl font-semibold text-emerald-700">
                      {formatCurrency(annualCAHPFee)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600">Net Annual Savings</p>
                    <p className="text-xl font-semibold text-emerald-700">
                      {formatCurrency(estimatedTaxSavings - annualCAHPFee)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Notes
            </h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this property..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/cahp/properties')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Property
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CAHPAddPropertyPage;
