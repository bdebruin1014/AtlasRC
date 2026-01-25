import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Calculator,
  DollarSign,
  BarChart3,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  RefreshCw,
  Clock
} from 'lucide-react';

// Demo data for variance tracking
const demoDealSheet = {
  id: 'ds-001',
  deal_type: 'scattered_lot',
  created_at: '2024-01-15T10:00:00Z',
  anticipated_sale_price: 385000,
  land_purchase_cost: 55000,
  site_prep_cost: 8000,
  sticks_bricks: 215000,
  soft_costs: 16800,
  total_project_cost: 319800,
  all_in_cost: 339500,
  net_profit: 37700,
  net_margin: 0.098,
  land_site_pct: 0.164
};

const demoProForma = {
  id: 'pf-001',
  version: 1,
  status: 'approved',
  created_at: '2024-01-20T14:00:00Z',
  sale_price: 392000,
  land_cost: 55000,
  site_prep: 9500,
  construction_cost: 222000,
  soft_costs: 18200,
  total_project_cost: 329700,
  all_in_cost: 351200,
  net_profit: 38900,
  net_margin: 0.099,
  land_site_pct: 0.165
};

const demoActuals = {
  id: 'act-001',
  as_of_date: '2024-06-15T00:00:00Z',
  percent_complete: 75,
  sale_price: 392000, // Under contract
  land_cost: 55000,
  site_prep: 11200,
  construction_cost: 178500, // In progress
  soft_costs: 14800,
  total_spent: 259500,
  projected_total: 345200,
  projected_profit: 38800,
  projected_margin: 0.099
};

export default function DealSheetVarianceTracker({
  opportunityId,
  projectId,
  showActuals = true,
  expanded: initialExpanded = true
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [loading, setLoading] = useState(true);
  const [dealSheet, setDealSheet] = useState(null);
  const [proForma, setProForma] = useState(null);
  const [actuals, setActuals] = useState(null);
  const [activeView, setActiveView] = useState('summary');

  useEffect(() => {
    fetchVarianceData();
  }, [opportunityId, projectId]);

  const fetchVarianceData = async () => {
    if (isDemoMode()) {
      setDealSheet(demoDealSheet);
      setProForma(demoProForma);
      if (showActuals) setActuals(demoActuals);
      setLoading(false);
      return;
    }

    try {
      // Fetch deal sheet from opportunity
      if (opportunityId) {
        const { data: ds } = await supabase
          .from('opportunity_deal_sheets')
          .select('*')
          .eq('opportunity_id', opportunityId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        setDealSheet(ds);
      }

      // Fetch pro forma from project
      if (projectId) {
        const { data: pf } = await supabase
          .from('proformas')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .single();
        setProForma(pf);

        // Fetch actuals
        if (showActuals) {
          const { data: act } = await supabase
            .from('project_actuals')
            .select('*')
            .eq('project_id', projectId)
            .order('as_of_date', { ascending: false })
            .limit(1)
            .single();
          setActuals(act);
        }
      }
    } catch (error) {
      console.error('Error fetching variance data:', error);
      // Use demo data as fallback
      setDealSheet(demoDealSheet);
      setProForma(demoProForma);
      if (showActuals) setActuals(demoActuals);
    } finally {
      setLoading(false);
    }
  };

  // Calculate variances
  const variances = useMemo(() => {
    if (!dealSheet) return null;

    const dsToProForma = proForma ? {
      sale_price: {
        ds: dealSheet.anticipated_sale_price || 0,
        pf: proForma.sale_price || 0,
        variance: (proForma.sale_price || 0) - (dealSheet.anticipated_sale_price || 0),
        variancePct: dealSheet.anticipated_sale_price ? ((proForma.sale_price - dealSheet.anticipated_sale_price) / dealSheet.anticipated_sale_price) : 0
      },
      total_cost: {
        ds: dealSheet.all_in_cost || dealSheet.total_project_cost || 0,
        pf: proForma.all_in_cost || proForma.total_project_cost || 0,
        variance: (proForma.all_in_cost || proForma.total_project_cost || 0) - (dealSheet.all_in_cost || dealSheet.total_project_cost || 0),
        variancePct: (dealSheet.all_in_cost || dealSheet.total_project_cost) ?
          ((proForma.all_in_cost || proForma.total_project_cost) - (dealSheet.all_in_cost || dealSheet.total_project_cost)) /
          (dealSheet.all_in_cost || dealSheet.total_project_cost) : 0
      },
      net_profit: {
        ds: dealSheet.net_profit || 0,
        pf: proForma.net_profit || 0,
        variance: (proForma.net_profit || 0) - (dealSheet.net_profit || 0),
        variancePct: dealSheet.net_profit ? ((proForma.net_profit - dealSheet.net_profit) / dealSheet.net_profit) : 0
      },
      net_margin: {
        ds: dealSheet.net_margin || 0,
        pf: proForma.net_margin || 0,
        variance: (proForma.net_margin || 0) - (dealSheet.net_margin || 0),
        variancePct: dealSheet.net_margin ? ((proForma.net_margin - dealSheet.net_margin) / dealSheet.net_margin) : 0
      }
    } : null;

    const pfToActuals = proForma && actuals ? {
      total_cost: {
        pf: proForma.all_in_cost || proForma.total_project_cost || 0,
        actual: actuals.projected_total || 0,
        variance: (actuals.projected_total || 0) - (proForma.all_in_cost || proForma.total_project_cost || 0),
        variancePct: (proForma.all_in_cost || proForma.total_project_cost) ?
          ((actuals.projected_total - (proForma.all_in_cost || proForma.total_project_cost)) /
          (proForma.all_in_cost || proForma.total_project_cost)) : 0
      },
      net_profit: {
        pf: proForma.net_profit || 0,
        actual: actuals.projected_profit || 0,
        variance: (actuals.projected_profit || 0) - (proForma.net_profit || 0),
        variancePct: proForma.net_profit ? ((actuals.projected_profit - proForma.net_profit) / proForma.net_profit) : 0
      }
    } : null;

    const dsToActuals = actuals ? {
      total_cost: {
        ds: dealSheet.all_in_cost || dealSheet.total_project_cost || 0,
        actual: actuals.projected_total || 0,
        variance: (actuals.projected_total || 0) - (dealSheet.all_in_cost || dealSheet.total_project_cost || 0),
        variancePct: (dealSheet.all_in_cost || dealSheet.total_project_cost) ?
          ((actuals.projected_total - (dealSheet.all_in_cost || dealSheet.total_project_cost)) /
          (dealSheet.all_in_cost || dealSheet.total_project_cost)) : 0
      },
      net_profit: {
        ds: dealSheet.net_profit || 0,
        actual: actuals.projected_profit || 0,
        variance: (actuals.projected_profit || 0) - (dealSheet.net_profit || 0),
        variancePct: dealSheet.net_profit ? ((actuals.projected_profit - dealSheet.net_profit) / dealSheet.net_profit) : 0
      }
    } : null;

    return { dsToProForma, pfToActuals, dsToActuals };
  }, [dealSheet, proForma, actuals]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    return `${((value || 0) * 100).toFixed(1)}%`;
  };

  const formatVariance = (value, showSign = true) => {
    const formatted = formatCurrency(Math.abs(value));
    if (value === 0) return formatted;
    return showSign ? (value > 0 ? `+${formatted}` : `-${formatted}`) : formatted;
  };

  const formatVariancePct = (value) => {
    const pct = ((value || 0) * 100).toFixed(1);
    if (value === 0) return '0%';
    return value > 0 ? `+${pct}%` : `${pct}%`;
  };

  const getVarianceIcon = (value, invertColor = false) => {
    if (value === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    if (invertColor) {
      return value > 0 ?
        <TrendingUp className="w-4 h-4 text-red-500" /> :
        <TrendingDown className="w-4 h-4 text-green-500" />;
    }
    return value > 0 ?
      <TrendingUp className="w-4 h-4 text-green-500" /> :
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getVarianceColor = (value, invertColor = false) => {
    if (value === 0) return 'text-gray-500 bg-gray-100';
    if (invertColor) {
      return value > 0 ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100';
    }
    return value > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading variance data...</span>
        </div>
      </div>
    );
  }

  if (!dealSheet) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No deal sheet data available</p>
          <p className="text-sm mt-1">Create a deal sheet to start tracking variances</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-white" />
          <div>
            <h3 className="font-semibold text-white">Variance Tracker</h3>
            <p className="text-xs text-gray-300">Deal Sheet → Pro Forma → Actuals</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {variances?.dsToActuals && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              getVarianceColor(variances.dsToActuals.net_profit.variancePct)
            }`}>
              {formatVariancePct(variances.dsToActuals.net_profit.variancePct)} vs Deal Sheet
            </span>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Timeline Visualization */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            {/* Deal Sheet */}
            <div className="text-center flex-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Deal Sheet</div>
              <div className="text-xs text-gray-500">{formatDate(dealSheet.created_at)}</div>
              <div className="text-xs font-medium text-blue-600 mt-1">
                {formatCurrency(dealSheet.net_profit)} profit
              </div>
            </div>

            {/* Arrow & Variance */}
            {variances?.dsToProForma && (
              <div className="flex flex-col items-center px-4">
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <div className={`text-xs font-medium mt-1 px-2 py-0.5 rounded ${
                  getVarianceColor(variances.dsToProForma.net_profit.variancePct)
                }`}>
                  {formatVariancePct(variances.dsToProForma.net_profit.variancePct)}
                </div>
              </div>
            )}

            {/* Pro Forma */}
            <div className="text-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                proForma ? 'bg-purple-100' : 'bg-gray-200'
              }`}>
                <Calculator className={`w-5 h-5 ${proForma ? 'text-purple-600' : 'text-gray-400'}`} />
              </div>
              <div className="text-sm font-medium text-gray-900">Pro Forma</div>
              {proForma ? (
                <>
                  <div className="text-xs text-gray-500">{formatDate(proForma.created_at)}</div>
                  <div className="text-xs font-medium text-purple-600 mt-1">
                    {formatCurrency(proForma.net_profit)} profit
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400">Not created</div>
              )}
            </div>

            {/* Arrow & Variance */}
            {showActuals && variances?.pfToActuals && (
              <div className="flex flex-col items-center px-4">
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <div className={`text-xs font-medium mt-1 px-2 py-0.5 rounded ${
                  getVarianceColor(variances.pfToActuals.net_profit.variancePct)
                }`}>
                  {formatVariancePct(variances.pfToActuals.net_profit.variancePct)}
                </div>
              </div>
            )}

            {/* Actuals */}
            {showActuals && (
              <div className="text-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  actuals ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  <DollarSign className={`w-5 h-5 ${actuals ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div className="text-sm font-medium text-gray-900">Actuals</div>
                {actuals ? (
                  <>
                    <div className="text-xs text-gray-500">{actuals.percent_complete}% complete</div>
                    <div className="text-xs font-medium text-green-600 mt-1">
                      {formatCurrency(actuals.projected_profit)} projected
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400">Project not started</div>
                )}
              </div>
            )}
          </div>

          {/* View Tabs */}
          <div className="flex items-center gap-2 border-b">
            <button
              onClick={() => setActiveView('summary')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeView === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveView('detail')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeView === 'detail' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Detail View
            </button>
          </div>

          {/* Summary View */}
          {activeView === 'summary' && (
            <div className="space-y-4">
              {/* Key Metrics Comparison */}
              <div className="grid grid-cols-3 gap-4">
                {/* Deal Sheet */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-xs font-medium text-blue-600 uppercase mb-3">Deal Sheet</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sale Price</span>
                      <span className="text-sm font-medium">{formatCurrency(dealSheet.anticipated_sale_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Cost</span>
                      <span className="text-sm font-medium">{formatCurrency(dealSheet.all_in_cost || dealSheet.total_project_cost)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm font-medium text-gray-800">Net Profit</span>
                      <span className="text-sm font-bold text-blue-600">{formatCurrency(dealSheet.net_profit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Net Margin</span>
                      <span className="text-sm font-medium">{formatPercent(dealSheet.net_margin)}</span>
                    </div>
                  </div>
                </div>

                {/* Pro Forma */}
                <div className={`rounded-lg p-4 ${proForma ? 'bg-purple-50' : 'bg-gray-100'}`}>
                  <div className={`text-xs font-medium uppercase mb-3 ${proForma ? 'text-purple-600' : 'text-gray-400'}`}>
                    Pro Forma {proForma && `(v${proForma.version})`}
                  </div>
                  {proForma ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sale Price</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{formatCurrency(proForma.sale_price)}</span>
                          {variances?.dsToProForma?.sale_price && (
                            <span className={`text-xs ${variances.dsToProForma.sale_price.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({formatVariancePct(variances.dsToProForma.sale_price.variancePct)})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Cost</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{formatCurrency(proForma.all_in_cost || proForma.total_project_cost)}</span>
                          {variances?.dsToProForma?.total_cost && (
                            <span className={`text-xs ${variances.dsToProForma.total_cost.variance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({formatVariancePct(variances.dsToProForma.total_cost.variancePct)})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm font-medium text-gray-800">Net Profit</span>
                        <span className="text-sm font-bold text-purple-600">{formatCurrency(proForma.net_profit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Net Margin</span>
                        <span className="text-sm font-medium">{formatPercent(proForma.net_margin)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 text-center py-4">
                      Pro forma not yet created
                    </div>
                  )}
                </div>

                {/* Actuals */}
                {showActuals && (
                  <div className={`rounded-lg p-4 ${actuals ? 'bg-green-50' : 'bg-gray-100'}`}>
                    <div className={`text-xs font-medium uppercase mb-3 ${actuals ? 'text-green-600' : 'text-gray-400'}`}>
                      Actuals {actuals && `(${actuals.percent_complete}%)`}
                    </div>
                    {actuals ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Sale Price</span>
                          <span className="text-sm font-medium">{formatCurrency(actuals.sale_price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Proj. Total Cost</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{formatCurrency(actuals.projected_total)}</span>
                            {variances?.dsToActuals?.total_cost && (
                              <span className={`text-xs ${variances.dsToActuals.total_cost.variance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ({formatVariancePct(variances.dsToActuals.total_cost.variancePct)})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-sm font-medium text-gray-800">Proj. Profit</span>
                          <span className="text-sm font-bold text-green-600">{formatCurrency(actuals.projected_profit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Spent to Date</span>
                          <span className="text-sm font-medium">{formatCurrency(actuals.total_spent)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 text-center py-4">
                        Project not yet started
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Variance Summary */}
              {variances?.dsToActuals && (
                <div className={`rounded-lg p-4 border-2 ${
                  variances.dsToActuals.net_profit.variance >= 0 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}>
                  <div className="flex items-center gap-3">
                    {variances.dsToActuals.net_profit.variance >= 0 ? (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        Overall Variance: Deal Sheet → Projected Actuals
                      </div>
                      <div className={`text-lg font-bold ${
                        variances.dsToActuals.net_profit.variance >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {formatVariance(variances.dsToActuals.net_profit.variance)} profit
                        ({formatVariancePct(variances.dsToActuals.net_profit.variancePct)})
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detail View */}
          {activeView === 'detail' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2 font-medium text-gray-700">Line Item</th>
                    <th className="text-right px-4 py-2 font-medium text-blue-600">Deal Sheet</th>
                    <th className="text-right px-4 py-2 font-medium text-purple-600">Pro Forma</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">DS→PF Var</th>
                    {showActuals && (
                      <>
                        <th className="text-right px-4 py-2 font-medium text-green-600">Actuals</th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600">DS→Act Var</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-2 text-gray-700">Sale Price</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(dealSheet.anticipated_sale_price)}</td>
                    <td className="px-4 py-2 text-right">{proForma ? formatCurrency(proForma.sale_price) : '-'}</td>
                    <td className={`px-4 py-2 text-right ${variances?.dsToProForma?.sale_price?.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {variances?.dsToProForma?.sale_price ? formatVariance(variances.dsToProForma.sale_price.variance) : '-'}
                    </td>
                    {showActuals && (
                      <>
                        <td className="px-4 py-2 text-right">{actuals ? formatCurrency(actuals.sale_price) : '-'}</td>
                        <td className="px-4 py-2 text-right">-</td>
                      </>
                    )}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 text-gray-700 font-medium">Total Cost</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(dealSheet.all_in_cost || dealSheet.total_project_cost)}</td>
                    <td className="px-4 py-2 text-right font-medium">{proForma ? formatCurrency(proForma.all_in_cost || proForma.total_project_cost) : '-'}</td>
                    <td className={`px-4 py-2 text-right font-medium ${variances?.dsToProForma?.total_cost?.variance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {variances?.dsToProForma?.total_cost ? formatVariance(variances.dsToProForma.total_cost.variance) : '-'}
                    </td>
                    {showActuals && (
                      <>
                        <td className="px-4 py-2 text-right font-medium">{actuals ? formatCurrency(actuals.projected_total) : '-'}</td>
                        <td className={`px-4 py-2 text-right font-medium ${variances?.dsToActuals?.total_cost?.variance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variances?.dsToActuals?.total_cost ? formatVariance(variances.dsToActuals.total_cost.variance) : '-'}
                        </td>
                      </>
                    )}
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-700 font-semibold">Net Profit</td>
                    <td className="px-4 py-2 text-right font-bold text-blue-600">{formatCurrency(dealSheet.net_profit)}</td>
                    <td className="px-4 py-2 text-right font-bold text-purple-600">{proForma ? formatCurrency(proForma.net_profit) : '-'}</td>
                    <td className={`px-4 py-2 text-right font-bold ${variances?.dsToProForma?.net_profit?.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {variances?.dsToProForma?.net_profit ? formatVariance(variances.dsToProForma.net_profit.variance) : '-'}
                    </td>
                    {showActuals && (
                      <>
                        <td className="px-4 py-2 text-right font-bold text-green-600">{actuals ? formatCurrency(actuals.projected_profit) : '-'}</td>
                        <td className={`px-4 py-2 text-right font-bold ${variances?.dsToActuals?.net_profit?.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variances?.dsToActuals?.net_profit ? formatVariance(variances.dsToActuals.net_profit.variance) : '-'}
                        </td>
                      </>
                    )}
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-700">Net Margin</td>
                    <td className="px-4 py-2 text-right">{formatPercent(dealSheet.net_margin)}</td>
                    <td className="px-4 py-2 text-right">{proForma ? formatPercent(proForma.net_margin) : '-'}</td>
                    <td className={`px-4 py-2 text-right ${variances?.dsToProForma?.net_margin?.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {variances?.dsToProForma?.net_margin ? formatVariancePct(variances.dsToProForma.net_margin.variance) : '-'}
                    </td>
                    {showActuals && (
                      <>
                        <td className="px-4 py-2 text-right">{actuals ? formatPercent(actuals.projected_margin) : '-'}</td>
                        <td className="px-4 py-2 text-right">-</td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Info Banner */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600">
              <strong>Variance Tracking:</strong> This tracker shows how your estimates evolve from initial deal sheet
              through detailed pro forma and into actual project costs. Use it to improve future deal sheet accuracy.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
