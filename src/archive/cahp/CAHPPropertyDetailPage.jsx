// src/pages/cahp/CAHPPropertyDetailPage.jsx
// CAHP Property Detail with tenant list and compliance

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, Users, DollarSign, Plus, ChevronRight, CheckCircle,
  AlertTriangle, XCircle, Edit, Trash2, FileText, Calendar, 
  Loader2, MoreVertical, RefreshCw, Download, Clock, Home,
  User, Phone, Mail, ArrowUpRight, Percent, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AddTenantModal from '@/components/cahp/AddTenantModal';
import RecertifyTenantModal from '@/components/cahp/RecertifyTenantModal';
import {
  getCAHPProperty,
  getPropertyTenants,
  calculatePropertyCompliance,
  deleteTenant,
  COMPLIANCE_STATUS,
  INCOME_CATEGORIES,
  INCOME_CATEGORY_LABELS,
  INCOME_CATEGORY_COLORS,
  SAFE_HARBOR_THRESHOLDS,
  AMI_LIMITS_2024,
} from '@/services/cahpService';

const CAHPPropertyDetailPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showRecertify, setShowRecertify] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [activeTab, setActiveTab] = useState('tenants');

  useEffect(() => {
    loadPropertyData();
  }, [propertyId]);

  const loadPropertyData = async () => {
    setLoading(true);
    try {
      const [propRes, tenantsRes, complianceRes] = await Promise.all([
        getCAHPProperty(propertyId),
        getPropertyTenants(propertyId),
        calculatePropertyCompliance(propertyId),
      ]);

      setProperty(propRes.data);
      setTenants(tenantsRes.data || []);
      setCompliance(complianceRes);
    } catch (error) {
      console.error('Error loading property:', error);
    }
    setLoading(false);
  };

  const handleDeleteTenant = async (tenantId) => {
    if (!confirm('Are you sure you want to remove this tenant?')) return;
    
    await deleteTenant(tenantId);
    await loadPropertyData();
  };

  const handleRecertify = (tenant) => {
    setSelectedTenant(tenant);
    setShowRecertify(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getIncomeColor = (category) => {
    switch (category) {
      case INCOME_CATEGORIES.VERY_LOW: return 'text-emerald-600 bg-emerald-50';
      case INCOME_CATEGORIES.LOW: return 'text-blue-600 bg-blue-50';
      case INCOME_CATEGORIES.OVER_INCOME: return 'text-orange-600 bg-orange-50';
      case INCOME_CATEGORIES.MARKET_RATE: return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplianceColor = (status) => {
    switch (status) {
      case COMPLIANCE_STATUS.COMPLIANT: return 'text-emerald-600 bg-emerald-50';
      case COMPLIANCE_STATUS.AT_RISK: return 'text-amber-600 bg-amber-50';
      case COMPLIANCE_STATUS.NON_COMPLIANT: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isRecertDue = (tenant) => {
    if (!tenant.next_recertification_due) return false;
    const dueDate = new Date(tenant.next_recertification_due);
    const now = new Date();
    return dueDate <= now || (dueDate - now) / (1000 * 60 * 60 * 24) <= 30;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">Property Not Found</h3>
          <Button onClick={() => navigate('/cahp/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/cahp/properties')}
              className="text-gray-400 hover:text-gray-600"
            >
              ← Back
            </button>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{property.property_name}</h1>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  getComplianceColor(compliance?.complianceStatus)
                )}>
                  {compliance?.complianceStatus === COMPLIANCE_STATUS.COMPLIANT && <CheckCircle className="w-3 h-3" />}
                  {compliance?.complianceStatus === COMPLIANCE_STATUS.AT_RISK && <AlertTriangle className="w-3 h-3" />}
                  {compliance?.complianceStatus === COMPLIANCE_STATUS.NON_COMPLIANT && <XCircle className="w-3 h-3" />}
                  {compliance?.complianceStatus || 'Pending'}
                </span>
              </div>
              <p className="text-sm text-gray-500">{property.property_address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadPropertyData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowAddTenant(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Compliance Warning */}
        {compliance?.complianceStatus === COMPLIANCE_STATUS.NON_COMPLIANT && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Non-Compliant - Action Required</h3>
                <p className="text-sm text-red-700 mt-1">
                  This property does not meet Safe Harbor thresholds. 
                  Low Income: {compliance.pctLowIncome}% (need ≥75%), 
                  Very Low: {compliance.pctVeryLowIncome}% (need ≥20%).
                  Fill vacant units with qualifying tenants immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Units</span>
              <Home className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-semibold">{property.total_units}</p>
            <p className="text-sm text-gray-500">
              {compliance?.occupiedUnits || 0} occupied, {compliance?.vacantUnits || 0} vacant
            </p>
          </div>

          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-emerald-700">Very Low Income</span>
              <span className="text-xs font-medium text-emerald-600">≤50% AMI</span>
            </div>
            <p className="text-2xl font-semibold text-emerald-700">
              {compliance?.veryLowIncomeUnits || 0}
            </p>
            <p className={cn(
              "text-sm font-medium",
              (compliance?.pctVeryLowIncome || 0) >= 20 ? "text-emerald-600" : "text-red-600"
            )}>
              {(compliance?.pctVeryLowIncome || 0).toFixed(1)}% (need ≥20%)
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">Low Income</span>
              <span className="text-xs font-medium text-blue-600">51-80% AMI</span>
            </div>
            <p className="text-2xl font-semibold text-blue-700">
              {compliance?.lowIncomeUnits || 0}
            </p>
            <p className={cn(
              "text-sm font-medium",
              (compliance?.pctLowIncome || 0) >= 75 ? "text-emerald-600" : "text-red-600"
            )}>
              {(compliance?.pctLowIncome || 0).toFixed(1)}% total (need ≥75%)
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-700">Over-Income</span>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-semibold text-orange-700">
              {compliance?.overIncomeUnits || 0}
            </p>
            <p className="text-sm text-orange-600">
              {compliance?.overIncomeUnits > 0 ? 'Cure required' : 'None'}
            </p>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Tax Savings</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-semibold text-emerald-600">
              {formatCurrency(property.estimated_tax_savings)}
            </p>
            <p className="text-sm text-gray-500">Annual</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border">
          <div className="border-b px-4">
            <nav className="flex gap-6">
              {[
                { id: 'tenants', label: 'Tenants', icon: Users, count: tenants.length },
                { id: 'details', label: 'Property Details', icon: Building2 },
                { id: 'documents', label: 'Documents', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tenants Tab */}
          {activeTab === 'tenants' && (
            <div>
              {tenants.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Tenants Yet</h3>
                  <p className="text-gray-500 mb-4">
                    Add tenants to track income qualification and compliance
                  </p>
                  <Button 
                    onClick={() => setShowAddTenant(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Tenant
                  </Button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tenant</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Income</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rent</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Recert Due</th>
                      <th className="w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-medium">{tenant.unit_number}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{tenant.tenant_name}</p>
                            <p className="text-sm text-gray-500">
                              {tenant.household_size} person{tenant.household_size > 1 ? 's' : ''}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{formatCurrency(tenant.gross_annual_income)}</p>
                            <p className="text-sm text-gray-500">{tenant.ami_percentage}% AMI</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                            getIncomeColor(tenant.income_category)
                          )}>
                            {INCOME_CATEGORY_LABELS[tenant.income_category]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium">{formatCurrency(tenant.monthly_rent)}/mo</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "text-sm",
                            isRecertDue(tenant) ? "text-red-600 font-medium" : "text-gray-500"
                          )}>
                            {formatDate(tenant.next_recertification_due)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button 
                              onClick={() => setActionMenuOpen(actionMenuOpen === tenant.id ? null : tenant.id)}
                              className="p-1.5 hover:bg-gray-100 rounded"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            {actionMenuOpen === tenant.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActionMenuOpen(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[160px] z-20">
                                  <button
                                    onClick={() => {
                                      handleRecertify(tenant);
                                      setActionMenuOpen(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                    Recertify Income
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigate(`/cahp/tenants/${tenant.id}/edit`);
                                      setActionMenuOpen(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit Tenant
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteTenant(tenant.id);
                                      setActionMenuOpen(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remove Tenant
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="p-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Property Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{property.property_address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">County</p>
                        <p className="font-medium">{property.county}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Parcel Number</p>
                        <p className="font-medium">{property.parcel_number || '—'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Units</p>
                        <p className="font-medium">{property.total_units}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">DOR Status</p>
                        <p className="font-medium capitalize">{property.dor_exemption_status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">CAHP Structure</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Owning LLC</p>
                      <p className="font-medium">{property.llc_entity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Managing Member</p>
                      <p className="font-medium">{property.managing_member || 'CAHP SC, LLC'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">CAHP Ownership %</p>
                        <p className="font-medium">{(property.cahp_ownership_percentage * 100).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Effective Date</p>
                        <p className="font-medium">{formatDate(property.exemption_effective_date)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Tax Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Assessed Value</p>
                        <p className="font-medium">{formatCurrency(property.annual_assessed_value)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tax Rate</p>
                        <p className="font-medium">{(property.standard_tax_rate * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Annual Tax Savings</p>
                      <p className="text-xl font-semibold text-emerald-600">
                        {formatCurrency(property.estimated_tax_savings)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Fees</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Setup Fee</p>
                        <p className="font-medium">{formatCurrency(property.initial_setup_fee)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Annual Fee Rate</p>
                        <p className="font-medium">{(property.annual_fee_percentage * 100).toFixed(0)}% of savings</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Annual CAHP Fee</p>
                      <p className="font-medium">
                        {formatCurrency(property.estimated_tax_savings * property.annual_fee_percentage)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="p-6">
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Documents</h3>
                <p className="text-gray-500 mb-4">
                  Store operating agreements, certifications, and compliance documents
                </p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* AMI Limits Reference */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3">2024 Income Limits ({AMI_LIMITS_2024.area})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Household Size</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                    <th key={size} className="text-center py-2 px-3">{size}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium text-emerald-700">Very Low (50%)</td>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                    <td key={size} className="text-center py-2 px-3">
                      {formatCurrency(AMI_LIMITS_2024.limits_by_household_size[size].very_low)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-blue-700">Low (80%)</td>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                    <td key={size} className="text-center py-2 px-3">
                      {formatCurrency(AMI_LIMITS_2024.limits_by_household_size[size].low)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Source: HUD FY2024 Income Limits • Median Income: {formatCurrency(AMI_LIMITS_2024.median_income)}
          </p>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {showAddTenant && (
        <AddTenantModal
          isOpen={showAddTenant}
          onClose={() => setShowAddTenant(false)}
          propertyId={propertyId}
          property={property}
          onSuccess={() => {
            setShowAddTenant(false);
            loadPropertyData();
          }}
        />
      )}

      {/* Recertify Modal */}
      {showRecertify && selectedTenant && (
        <RecertifyTenantModal
          isOpen={showRecertify}
          onClose={() => {
            setShowRecertify(false);
            setSelectedTenant(null);
          }}
          tenant={selectedTenant}
          onSuccess={() => {
            setShowRecertify(false);
            setSelectedTenant(null);
            loadPropertyData();
          }}
        />
      )}
    </div>
  );
};

export default CAHPPropertyDetailPage;
