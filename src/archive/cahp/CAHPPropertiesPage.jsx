// src/pages/cahp/CAHPPropertiesPage.jsx
// CAHP Properties List with compliance overview

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, Search, Filter, CheckCircle, AlertTriangle,
  XCircle, ChevronRight, DollarSign, Users, Loader2, MoreVertical,
  Calendar, FileText, Trash2, Edit, Eye, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getAllCAHPProperties,
  calculatePropertyCompliance,
  COMPLIANCE_STATUS,
  EXEMPTION_STATUS,
} from '@/services/cahpService';

const CAHPPropertiesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [propertyCompliance, setPropertyCompliance] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    const { data, error } = await getAllCAHPProperties();
    if (data) {
      setProperties(data);
      
      // Load compliance for each property
      const complianceMap = {};
      for (const prop of data) {
        const compliance = await calculatePropertyCompliance(prop.id);
        complianceMap[prop.id] = compliance;
      }
      setPropertyCompliance(complianceMap);
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getComplianceColor = (status) => {
    switch (status) {
      case COMPLIANCE_STATUS.COMPLIANT: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case COMPLIANCE_STATUS.AT_RISK: return 'text-amber-600 bg-amber-50 border-amber-200';
      case COMPLIANCE_STATUS.NON_COMPLIANT: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getExemptionStatusColor = (status) => {
    switch (status) {
      case EXEMPTION_STATUS.ACTIVE: return 'text-emerald-600 bg-emerald-50';
      case EXEMPTION_STATUS.APPROVED: return 'text-blue-600 bg-blue-50';
      case EXEMPTION_STATUS.PENDING: return 'text-amber-600 bg-amber-50';
      case EXEMPTION_STATUS.EXPIRED: return 'text-gray-600 bg-gray-50';
      case EXEMPTION_STATUS.REVOKED: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredProperties = properties.filter(prop => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (!prop.property_name.toLowerCase().includes(searchLower) &&
          !prop.property_address.toLowerCase().includes(searchLower) &&
          !prop.llc_entity.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (statusFilter && prop.current_compliance_status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Calculate totals
  const totalUnits = properties.reduce((sum, p) => sum + (p.total_units || 0), 0);
  const totalSavings = properties.reduce((sum, p) => sum + (p.estimated_tax_savings || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/cahp')}
              className="text-gray-400 hover:text-gray-600"
            >
              ← Back
            </button>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">CAHP Properties</h1>
              <p className="text-sm text-gray-500">
                {properties.length} properties • {totalUnits} units • {formatCurrency(totalSavings)} annual savings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadProperties} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button 
              onClick={() => navigate('/cahp/properties/new')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="at_risk">At Risk</option>
            <option value="non_compliant">Non-Compliant</option>
          </select>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Properties Found</h3>
            <p className="text-gray-500 mb-4">
              {search || statusFilter ? 'Try adjusting your filters' : 'Add your first CAHP property to get started'}
            </p>
            {!search && !statusFilter && (
              <Button 
                onClick={() => navigate('/cahp/properties/new')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProperties.map((property) => {
              const compliance = propertyCompliance[property.id];
              
              return (
                <div 
                  key={property.id}
                  className="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/cahp/properties/${property.id}`)}
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{property.property_name}</h3>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                            getComplianceColor(property.current_compliance_status)
                          )}>
                            {property.current_compliance_status === COMPLIANCE_STATUS.COMPLIANT && <CheckCircle className="w-3 h-3" />}
                            {property.current_compliance_status === COMPLIANCE_STATUS.AT_RISK && <AlertTriangle className="w-3 h-3" />}
                            {property.current_compliance_status === COMPLIANCE_STATUS.NON_COMPLIANT && <XCircle className="w-3 h-3" />}
                            {property.current_compliance_status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{property.property_address}</p>
                        <p className="text-sm text-gray-400">{property.county} County • {property.llc_entity}</p>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpen(actionMenuOpen === property.id ? null : property.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        {actionMenuOpen === property.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpen(null);
                              }}
                            />
                            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[140px] z-20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/cahp/properties/${property.id}`);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/cahp/properties/${property.id}/edit`);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/cahp/properties/${property.id}/tenants`);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Users className="w-4 h-4" />
                                Tenants
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-lg font-semibold">{property.total_units}</p>
                        <p className="text-xs text-gray-500">Units</p>
                      </div>
                      <div className="text-center p-2 bg-emerald-50 rounded">
                        <p className="text-lg font-semibold text-emerald-600">
                          {compliance?.veryLowIncomeUnits || 0}
                        </p>
                        <p className="text-xs text-gray-500">Very Low</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-lg font-semibold text-blue-600">
                          {compliance?.lowIncomeUnits || 0}
                        </p>
                        <p className="text-xs text-gray-500">Low</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-lg font-semibold text-gray-600">
                          {compliance?.marketRateUnits || 0}
                        </p>
                        <p className="text-xs text-gray-500">Market</p>
                      </div>
                    </div>

                    {/* Compliance Bars */}
                    <div className="space-y-2 mb-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Low Income (need ≥75%)</span>
                          <span className={cn(
                            "font-medium",
                            (compliance?.pctLowIncome || 0) >= 75 ? "text-emerald-600" : "text-red-600"
                          )}>
                            {(compliance?.pctLowIncome || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              (compliance?.pctLowIncome || 0) >= 75 ? "bg-emerald-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.min(compliance?.pctLowIncome || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Very Low (need ≥20%)</span>
                          <span className={cn(
                            "font-medium",
                            (compliance?.pctVeryLowIncome || 0) >= 20 ? "text-emerald-600" : "text-red-600"
                          )}>
                            {(compliance?.pctVeryLowIncome || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              (compliance?.pctVeryLowIncome || 0) >= 20 ? "bg-emerald-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.min((compliance?.pctVeryLowIncome || 0) * 5, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          getExemptionStatusColor(property.dor_exemption_status)
                        )}>
                          DOR: {property.dor_exemption_status || 'Pending'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600">
                          {formatCurrency(property.estimated_tax_savings)}
                        </p>
                        <p className="text-xs text-gray-500">Annual Savings</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CAHPPropertiesPage;
