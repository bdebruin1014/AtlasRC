// src/pages/cahp/CAHPDashboardPage.jsx
// CAHP Safe Harbor Tax Abatement Dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, DollarSign, AlertTriangle, CheckCircle, 
  XCircle, Clock, ChevronRight, Plus, RefreshCw, FileText,
  TrendingUp, Percent, Calendar, Bell, ArrowRight, Home,
  Loader2, ExternalLink, AlertCircle, Shield, Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getAllCAHPProperties,
  getComplianceAlerts,
  getPortfolioSummary,
  getTenantRecertificationsDue,
  COMPLIANCE_STATUS,
  INCOME_CATEGORIES,
  INCOME_CATEGORY_LABELS,
  CAHP_ENTITY_INFO,
  SAFE_HARBOR_THRESHOLDS,
  FEE_STRUCTURE,
} from '@/services/cahpService';

const CAHPDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recertsDue, setRecertsDue] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [propertiesRes, summaryRes, alertsRes, recertsRes] = await Promise.all([
        getAllCAHPProperties(),
        getPortfolioSummary(),
        getComplianceAlerts(),
        getTenantRecertificationsDue(90),
      ]);

      setProperties(propertiesRes.data || []);
      setSummary(summaryRes);
      setAlerts(alertsRes || []);
      setRecertsDue(recertsRes.data || []);
    } catch (error) {
      console.error('Error loading CAHP dashboard:', error);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getComplianceColor = (status) => {
    switch (status) {
      case COMPLIANCE_STATUS.COMPLIANT: return 'text-emerald-600 bg-emerald-50';
      case COMPLIANCE_STATUS.AT_RISK: return 'text-amber-600 bg-amber-50';
      case COMPLIANCE_STATUS.NON_COMPLIANT: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplianceIcon = (status) => {
    switch (status) {
      case COMPLIANCE_STATUS.COMPLIANT: return <CheckCircle className="w-4 h-4" />;
      case COMPLIANCE_STATUS.AT_RISK: return <AlertTriangle className="w-4 h-4" />;
      case COMPLIANCE_STATUS.NON_COMPLIANT: return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Calculate days until October 1 (certification due date)
  const getDaysUntilCertification = () => {
    const now = new Date();
    let certDate = new Date(now.getFullYear(), 9, 1); // October 1
    if (now > certDate) {
      certDate = new Date(now.getFullYear() + 1, 9, 1);
    }
    return Math.ceil((certDate - now) / (1000 * 60 * 60 * 24));
  };

  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');
  const daysUntilCert = getDaysUntilCertification();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading CAHP Dashboard...</p>
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
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">CAHP Safe Harbor</h1>
              <p className="text-sm text-gray-500">Tax Abatement Compliance Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadDashboardData}>
              <RefreshCw className="w-4 h-4 mr-2" />
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
        {/* Critical Alerts Banner */}
        {criticalAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">
                  {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} Require Immediate Attention
                </h3>
                <ul className="mt-2 space-y-1">
                  {criticalAlerts.slice(0, 3).map((alert, idx) => (
                    <li key={idx} className="text-sm text-red-700">
                      <strong>{alert.propertyName}:</strong> {alert.message}
                    </li>
                  ))}
                </ul>
                {criticalAlerts.length > 3 && (
                  <button className="mt-2 text-sm text-red-600 font-medium hover:underline">
                    View all {criticalAlerts.length} alerts →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certification Due Banner */}
        {daysUntilCert <= 60 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <span className="font-medium text-amber-800">
                  Annual DOR Certification due in {daysUntilCert} days (October 1)
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => navigate('/cahp/certifications')}
              >
                Prepare Certification
              </Button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Properties</span>
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-semibold">{summary?.propertyCount || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              {summary?.totalUnits || 0} total units
            </p>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Annual Tax Savings</span>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-semibold text-emerald-600">
              {formatCurrency(summary?.totalTaxSavings)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              CAHP Fee: {formatCurrency(summary?.annualCAHPFees)}
            </p>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Portfolio Compliance</span>
              <Percent className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Income (≤80%)</span>
                <span className={cn(
                  "font-semibold",
                  (summary?.overallPctLow || 0) >= 75 ? "text-emerald-600" : "text-red-600"
                )}>
                  {(summary?.overallPctLow || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Very Low (≤50%)</span>
                <span className={cn(
                  "font-semibold",
                  (summary?.overallPctVeryLow || 0) >= 20 ? "text-emerald-600" : "text-red-600"
                )}>
                  {(summary?.overallPctVeryLow || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Status Overview</span>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">{summary?.compliantCount || 0} Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm">{summary?.atRiskCount || 0} At Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm">{summary?.nonCompliantCount || 0} Non-Compliant</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Properties List */}
          <div className="col-span-2 bg-white rounded-lg border">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-semibold">Properties</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/cahp/properties')}
              >
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {properties.length === 0 ? (
              <div className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No CAHP properties yet</p>
                <Button 
                  onClick={() => navigate('/cahp/properties/new')}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Property
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {properties.slice(0, 5).map((property) => (
                  <div 
                    key={property.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/cahp/properties/${property.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{property.property_name}</h3>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                            getComplianceColor(property.current_compliance_status)
                          )}>
                            {getComplianceIcon(property.current_compliance_status)}
                            {property.current_compliance_status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{property.property_address}</p>
                        <p className="text-sm text-gray-400">
                          {property.total_units} units • {property.llc_entity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-emerald-600">
                          {formatCurrency(property.estimated_tax_savings)}/yr
                        </p>
                        <p className="text-xs text-gray-500">Tax Savings</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Safe Harbor Thresholds */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Safe Harbor Thresholds</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/cahp/calculator')}
                >
                  <Calculator className="w-4 h-4 mr-1" />
                  Calculator
                </Button>
              </div>
              <div className="space-y-3">
                {/* 75% at 80% AMI */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Qualifying (≤80% AMI)</span>
                    <span className="font-medium">≥{SAFE_HARBOR_THRESHOLDS.QUALIFYING_MIN_PCT}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        (summary?.overallPctLow || 0) >= 75 ? "bg-emerald-500" : "bg-red-500"
                      )}
                      style={{ width: `${Math.min(summary?.overallPctLow || 0, 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* Deep Affordability Options */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-2">Deep Affordability (choose one):</p>
                  
                  {/* Option A: 20% at 50% */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-emerald-700">Option A: ≤50% AMI</span>
                      <span className="font-medium text-emerald-700">≥{SAFE_HARBOR_THRESHOLDS.OPTION_A.threshold_pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          (summary?.overallPctVeryLow || 0) >= 20 ? "bg-emerald-500" : "bg-gray-400"
                        )}
                        style={{ width: `${Math.min((summary?.overallPctVeryLow || 0) * 5, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Option B: 40% at 60% */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-teal-700">Option B: ≤60% AMI</span>
                      <span className="font-medium text-teal-700">≥{SAFE_HARBOR_THRESHOLDS.OPTION_B.threshold_pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gray-400"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Per IRS Rev. Proc. 96-32 • S.C. Code § 12-37-220(B)(11)(e)
              </p>
            </div>

            {/* Upcoming Recertifications */}
            <div className="bg-white rounded-lg border">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">Recertifications Due</h3>
                <span className="text-sm text-gray-500">
                  {recertsDue.length} pending
                </span>
              </div>
              {recertsDue.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No recertifications due in next 90 days
                </div>
              ) : (
                <div className="divide-y max-h-64 overflow-y-auto">
                  {recertsDue.slice(0, 5).map((tenant) => (
                    <div key={tenant.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{tenant.tenant_name}</p>
                          <p className="text-xs text-gray-500">
                            Unit {tenant.unit_number} • {tenant.property?.property_name}
                          </p>
                        </div>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded",
                          new Date(tenant.next_recertification_due) < new Date()
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        )}>
                          {formatDate(tenant.next_recertification_due)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold mb-3">Resources</h3>
              <div className="space-y-2">
                <a 
                  href="https://www.huduser.gov/portal/datasets/il.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  HUD Income Limits
                </a>
                <a 
                  href="https://dor.sc.gov/forms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  SC DOR Property Tax Forms
                </a>
                <a 
                  href="https://www.irs.gov/pub/irs-tege/rp_1996-32.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  IRS Rev. Proc. 96-32
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Entity Information Footer */}
        <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <div>
              <span className="font-medium">Managing Member:</span>{' '}
              {CAHP_ENTITY_INFO.subsidiary.name}
            </div>
            <div>
              <span className="font-medium">Parent Org:</span>{' '}
              {CAHP_ENTITY_INFO.parent.name}
            </div>
            <div>
              <span className="font-medium">IRS Status:</span>{' '}
              {CAHP_ENTITY_INFO.parent.irsStatus}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CAHPDashboardPage;
