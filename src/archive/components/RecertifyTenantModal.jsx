// src/components/cahp/RecertifyTenantModal.jsx
// Modal for annual income recertification of CAHP tenants

import React, { useState, useEffect } from 'react';
import { 
  X, RefreshCw, DollarSign, Users, Loader2,
  AlertCircle, CheckCircle, AlertTriangle, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  recertifyTenant,
  calculateAMIStatus,
  AMI_LIMITS_2024,
  INCOME_CATEGORIES,
  INCOME_CATEGORY_LABELS,
  SAFE_HARBOR_THRESHOLDS,
} from '@/services/cahpService';

const RecertifyTenantModal = ({
  isOpen,
  onClose,
  tenant,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    householdSize: tenant?.household_size || 1,
    grossAnnualIncome: tenant?.gross_annual_income || '',
    documentationNotes: '',
  });

  const [amiStatus, setAmiStatus] = useState(null);
  const [previousStatus, setPreviousStatus] = useState(null);

  // Calculate previous status
  useEffect(() => {
    if (tenant) {
      const prev = calculateAMIStatus(tenant.gross_annual_income, tenant.household_size);
      setPreviousStatus(prev);
    }
  }, [tenant]);

  // Calculate new AMI status when income or household size changes
  useEffect(() => {
    if (formData.grossAnnualIncome && formData.householdSize) {
      const income = parseFloat(formData.grossAnnualIncome);
      if (!isNaN(income)) {
        const status = calculateAMIStatus(income, formData.householdSize);
        setAmiStatus(status);
      }
    } else {
      setAmiStatus(null);
    }
  }, [formData.grossAnnualIncome, formData.householdSize]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: recertError } = await recertifyTenant(tenant.id, {
        grossAnnualIncome: parseFloat(formData.grossAnnualIncome),
        householdSize: parseInt(formData.householdSize),
        documentationNotes: formData.documentationNotes,
      });

      if (recertError) throw recertError;
      
      onSuccess?.();
    } catch (err) {
      console.error('Error recertifying tenant:', err);
      setError(err.message || 'Failed to recertify tenant');
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

  const getIncomeColor = (category) => {
    switch (category) {
      case INCOME_CATEGORIES.VERY_LOW: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case INCOME_CATEGORIES.LOW: return 'text-blue-600 bg-blue-50 border-blue-200';
      case INCOME_CATEGORIES.OVER_INCOME: return 'text-orange-600 bg-orange-50 border-orange-200';
      case INCOME_CATEGORIES.MARKET_RATE: return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Check if tenant is going over-income (140% threshold)
  const isGoingOverIncome = () => {
    if (!amiStatus || !previousStatus) return false;
    
    // Only applies if tenant was previously qualifying
    if (previousStatus.category === INCOME_CATEGORIES.MARKET_RATE) return false;
    
    // Check if new income exceeds 140% of applicable limit
    const limits = AMI_LIMITS_2024.limits_by_household_size[formData.householdSize];
    const applicableLimit = previousStatus.category === INCOME_CATEGORIES.VERY_LOW 
      ? limits.very_low 
      : limits.low;
    
    const overIncomeThreshold = applicableLimit * (SAFE_HARBOR_THRESHOLDS.OVER_INCOME_TRIGGER / 100);
    const newIncome = parseFloat(formData.grossAnnualIncome);
    
    return newIncome > overIncomeThreshold;
  };

  if (!isOpen || !tenant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Annual Recertification</h2>
              <p className="text-sm text-gray-500">{tenant.tenant_name} • Unit {tenant.unit_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Previous Certification */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Previous Certification</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Household Size</p>
                <p className="font-medium">{tenant.household_size} person{tenant.household_size > 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-gray-500">Annual Income</p>
                <p className="font-medium">{formatCurrency(tenant.gross_annual_income)}</p>
              </div>
              <div>
                <p className="text-gray-500">Category</p>
                <span className={cn(
                  "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                  getIncomeColor(tenant.income_category)
                )}>
                  {INCOME_CATEGORY_LABELS[tenant.income_category]}
                </span>
              </div>
            </div>
          </div>

          {/* New Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Updated Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Household Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.householdSize}
                  onChange={(e) => setFormData({ ...formData, householdSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                    <option key={size} value={size}>{size} person{size > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gross Annual Income <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.grossAnnualIncome}
                    onChange={(e) => setFormData({ ...formData, grossAnnualIncome: e.target.value })}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* New Income Qualification Result */}
          {amiStatus && (
            <div className={cn(
              "p-4 rounded-lg border",
              isGoingOverIncome() 
                ? 'text-orange-600 bg-orange-50 border-orange-200'
                : getIncomeColor(amiStatus.category)
            )}>
              <div className="flex items-start gap-3">
                {isGoingOverIncome() ? (
                  <AlertTriangle className="w-5 h-5 mt-0.5" />
                ) : amiStatus.category === INCOME_CATEGORIES.MARKET_RATE ? (
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {isGoingOverIncome() 
                      ? 'Over-Income (140% Threshold Exceeded)'
                      : amiStatus.category === INCOME_CATEGORIES.VERY_LOW
                        ? 'Still Qualifies as Very Low Income'
                        : amiStatus.category === INCOME_CATEGORIES.LOW
                          ? 'Still Qualifies as Low Income'
                          : 'No Longer Qualifies'
                    }
                  </p>
                  <p className="text-sm mt-1">
                    New AMI: {amiStatus.amiPercentage}% 
                    (was {tenant.ami_percentage}%)
                  </p>
                  
                  {isGoingOverIncome() && (
                    <p className="text-sm mt-2">
                      <strong>Action Required:</strong> The next available comparable unit must be rented 
                      to a qualifying tenant to maintain Safe Harbor compliance.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Documentation Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documentation Notes
            </label>
            <textarea
              value={formData.documentationNotes}
              onChange={(e) => setFormData({ ...formData, documentationNotes: e.target.value })}
              placeholder="Note verification methods, documents collected, etc."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Documentation Checklist */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-2">Required Documentation:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pay stubs for all household members 18+</li>
                  <li>Most recent tax returns</li>
                  <li>Employer verification (if applicable)</li>
                  <li>Other income documentation (benefits, pension, etc.)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Recertification'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecertifyTenantModal;
