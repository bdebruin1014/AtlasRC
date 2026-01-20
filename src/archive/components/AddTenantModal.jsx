// src/components/cahp/AddTenantModal.jsx
// Modal for adding new tenants to CAHP properties

import React, { useState, useEffect } from 'react';
import { 
  X, User, DollarSign, Home, Calendar, Users, Loader2,
  AlertCircle, CheckCircle, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createTenant,
  calculateAMIStatus,
  calculateMaxRent,
  AMI_LIMITS_2024,
  INCOME_CATEGORIES,
  INCOME_CATEGORY_LABELS,
} from '@/services/cahpService';

const AddTenantModal = ({
  isOpen,
  onClose,
  propertyId,
  property,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    unitNumber: '',
    tenantName: '',
    moveInDate: new Date().toISOString().split('T')[0],
    leaseExpiration: '',
    householdSize: 1,
    grossAnnualIncome: '',
    monthlyRent: '',
    utilityAllowance: 0,
  });

  const [amiStatus, setAmiStatus] = useState(null);
  const [maxRent, setMaxRent] = useState(null);

  // Calculate AMI status when income or household size changes
  useEffect(() => {
    if (formData.grossAnnualIncome && formData.householdSize) {
      const income = parseFloat(formData.grossAnnualIncome);
      if (!isNaN(income)) {
        const status = calculateAMIStatus(income, formData.householdSize);
        setAmiStatus(status);
        
        if (status.category !== INCOME_CATEGORIES.MARKET_RATE) {
          const max = calculateMaxRent(formData.householdSize, status.category);
          setMaxRent(max);
        } else {
          setMaxRent(null);
        }
      }
    } else {
      setAmiStatus(null);
      setMaxRent(null);
    }
  }, [formData.grossAnnualIncome, formData.householdSize]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: createError } = await createTenant({
        propertyId,
        unitNumber: formData.unitNumber,
        tenantName: formData.tenantName,
        moveInDate: formData.moveInDate,
        leaseExpiration: formData.leaseExpiration || null,
        householdSize: parseInt(formData.householdSize),
        grossAnnualIncome: parseFloat(formData.grossAnnualIncome),
        monthlyRent: parseFloat(formData.monthlyRent),
        utilityAllowance: parseFloat(formData.utilityAllowance) || 0,
      });

      if (createError) throw createError;
      
      onSuccess?.();
    } catch (err) {
      console.error('Error creating tenant:', err);
      setError(err.message || 'Failed to add tenant');
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
      case INCOME_CATEGORIES.MARKET_RATE: return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Add Tenant</h2>
              <p className="text-sm text-gray-500">{property?.property_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Unit & Tenant Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                placeholder="e.g., 101, A, Unit 1"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.tenantName}
                onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                placeholder="Full legal name"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Move-In Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.moveInDate}
                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lease Expiration
              </label>
              <input
                type="date"
                value={formData.leaseExpiration}
                onChange={(e) => setFormData({ ...formData, leaseExpiration: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Household & Income */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Household Size <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.householdSize}
                onChange={(e) => setFormData({ ...formData, householdSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Income Qualification Result */}
          {amiStatus && (
            <div className={cn(
              "p-4 rounded-lg border",
              getIncomeColor(amiStatus.category)
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {amiStatus.category === INCOME_CATEGORIES.VERY_LOW && (
                      <><CheckCircle className="w-4 h-4 inline mr-1" /> Qualifies as Very Low Income</>
                    )}
                    {amiStatus.category === INCOME_CATEGORIES.LOW && (
                      <><CheckCircle className="w-4 h-4 inline mr-1" /> Qualifies as Low Income</>
                    )}
                    {amiStatus.category === INCOME_CATEGORIES.MARKET_RATE && (
                      <><AlertCircle className="w-4 h-4 inline mr-1" /> Does Not Qualify (Market Rate)</>
                    )}
                  </p>
                  <p className="text-sm mt-1">
                    {amiStatus.amiPercentage}% of Area Median Income
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p>Limit for {formData.householdSize} person{formData.householdSize > 1 ? 's' : ''}:</p>
                  <p>Very Low: {formatCurrency(amiStatus.limits.very_low)}</p>
                  <p>Low: {formatCurrency(amiStatus.limits.low)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Rent Information */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
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
                Utility Allowance
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.utilityAllowance}
                  onChange={(e) => setFormData({ ...formData, utilityAllowance: e.target.value })}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Allowable Rent
              </label>
              <div className="px-3 py-2 bg-gray-50 border rounded-lg text-gray-600">
                {maxRent ? formatCurrency(maxRent) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Rent Warning */}
          {maxRent && formData.monthlyRent && parseFloat(formData.monthlyRent) > maxRent && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Rent Exceeds Maximum</p>
                <p>Monthly rent should not exceed 30% of income limit ({formatCurrency(maxRent)}/mo) for qualifying tenants.</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Income Documentation Required</p>
              <p>Collect pay stubs, tax returns, and employer verification for all household members 18+ before lease execution.</p>
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
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Tenant'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddTenantModal;
