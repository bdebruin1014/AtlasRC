// src/pages/projects/DrawRequests/DrawRequestsPage.jsx
// Main Draw Requests page with summary cards, list, and schedule views

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Download, Search, ChevronDown, ChevronRight, Calendar, DollarSign, TrendingUp, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProjectDrawRequests, useLoanInfo, useDrawSchedule } from '@/hooks/useDrawRequests';
import { getStatusConfig, DRAW_STATUSES } from '@/services/drawRequestService';
import DrawRequestForm from './DrawRequestForm';
import DrawRequestDetail from './DrawRequestDetail';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const DrawRequestsPage = ({ projectId: propProjectId }) => {
  const { projectId: paramProjectId } = useParams();
  const projectId = propProjectId || paramProjectId || 'demo-project-1';

  const { draws, loading, nextDrawNumber, totals, refetch } = useProjectDrawRequests(projectId);
  const { loanInfo } = useLoanInfo(projectId);
  const { schedule: drawSchedule } = useDrawSchedule(projectId);

  const [activeTab, setActiveTab] = useState('draws');
  const [showForm, setShowForm] = useState(false);
  const [selectedDrawId, setSelectedDrawId] = useState(null);
  const [expandedDraw, setExpandedDraw] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Budget integration calculations
  const budgetIntegration = useMemo(() => {
    if (!loanInfo) return null;
    const totalFunded = draws.filter(d => d.status === 'funded').reduce((s, d) => s + (d.funded_amount || 0), 0);
    const remaining = loanInfo.loan_amount - totalFunded;
    const percentDrawn = loanInfo.loan_amount > 0 ? (totalFunded / loanInfo.loan_amount) * 100 : 0;
    const totalRetainage = draws.filter(d => d.status === 'funded').reduce((s, d) => s + (d.retainage_amount || 0), 0);
    return { totalFunded, remaining, percentDrawn, totalRetainage };
  }, [draws, loanInfo]);

  // Filtered draws
  const filteredDraws = useMemo(() => {
    let result = draws;
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.notes?.toLowerCase().includes(term) ||
        `draw #${d.draw_number}`.includes(term)
      );
    }
    return result;
  }, [draws, statusFilter, searchTerm]);

  // Draw schedule with cumulative
  const scheduleWithCumulative = useMemo(() => {
    let cumulative = 0;
    return drawSchedule.map(m => {
      if (m.actual !== null) cumulative += m.actual;
      return { ...m, cumulative: m.actual !== null ? cumulative : null };
    });
  }, [drawSchedule]);

  const handleDrawCreated = () => {
    setShowForm(false);
    refetch();
  };

  const handleDrawUpdated = () => {
    setSelectedDrawId(null);
    refetch();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Draw Requests</h2>
          {loanInfo && (
            <p className="text-sm text-gray-500 mt-1">{loanInfo.lender_name} &middot; Construction Loan</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button size="sm" className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Draw Request
          </Button>
        </div>
      </div>

      {/* Loan Summary Cards */}
      {loanInfo && budgetIntegration && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(loanInfo.loan_amount)}</p>
          </div>
          <div className="bg-white rounded-lg border-l-4 border-l-green-500 border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Drawn</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(budgetIntegration.totalFunded)}</p>
            <p className="text-xs text-gray-400">{budgetIntegration.percentDrawn.toFixed(1)}% utilized</p>
          </div>
          <div className="bg-white rounded-lg border-l-4 border-l-blue-500 border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Available</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(budgetIntegration.remaining)}</p>
          </div>
          <div className="bg-white rounded-lg border-l-4 border-l-amber-500 border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Retainage Held</p>
            <p className="text-lg font-bold text-amber-600">{formatCurrency(budgetIntegration.totalRetainage)}</p>
            <p className="text-xs text-gray-400">{loanInfo.retainage_percentage}% of draws</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
            <p className="text-lg font-bold text-gray-900">{loanInfo.interest_rate}%</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Maturity</p>
            <p className="text-lg font-bold text-gray-900">{formatDate(loanInfo.maturity_date)}</p>
          </div>
        </div>
      )}

      {/* Loan Utilization Bar */}
      {budgetIntegration && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Loan Utilization</span>
            <span className="text-sm text-gray-500">
              {formatCurrency(budgetIntegration.totalFunded)} / {formatCurrency(loanInfo.loan_amount)}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2F855A] rounded-full transition-all"
              style={{ width: `${Math.min(budgetIntegration.percentDrawn, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>0%</span>
            <span>{budgetIntegration.percentDrawn.toFixed(1)}% drawn</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { id: 'draws', label: `Draw Requests (${draws.length})`, icon: DollarSign },
          { id: 'schedule', label: 'Draw Schedule', icon: Calendar },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[#2F855A] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Draw Requests Tab */}
      {activeTab === 'draws' && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search draws..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Statuses</option>
              {DRAW_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Draws Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-8 px-3 py-3" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Draw #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Approved</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Retainage</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Funded</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDraws.map(draw => (
                  <React.Fragment key={draw.id}>
                    <tr className={cn(
                      "hover:bg-gray-50 transition-colors",
                      draw.status === 'draft' && "bg-gray-50/50",
                      draw.status === 'approved' && "bg-green-50/30"
                    )}>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => setExpandedDraw(expandedDraw === draw.id ? null : draw.id)}
                          className="p-0.5 hover:bg-gray-200 rounded"
                        >
                          {expandedDraw === draw.id
                            ? <ChevronDown className="w-4 h-4 text-gray-500" />
                            : <ChevronRight className="w-4 h-4 text-gray-400" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">Draw #{draw.draw_number}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {draw.period_start && draw.period_end
                          ? `${formatDate(draw.period_start)} - ${formatDate(draw.period_end)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(draw.request_date)}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-gray-900">
                        {formatCurrency(draw.requested_amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-700">
                        {draw.approved_amount ? formatCurrency(draw.approved_amount) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-600">
                        {draw.retainage_amount ? formatCurrency(draw.retainage_amount) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-green-700">
                        {draw.net_amount ? formatCurrency(draw.net_amount) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <DrawStatusBadge status={draw.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedDrawId(draw.id)}
                          className="text-xs text-[#2F855A] hover:underline font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                    {/* Expanded Line Items */}
                    {expandedDraw === draw.id && (
                      <DrawExpandedItems drawId={draw.id} />
                    )}
                  </React.Fragment>
                ))}
              </tbody>
              {/* Totals Footer */}
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-semibold text-sm">
                <tr>
                  <td className="px-3 py-3" />
                  <td className="px-4 py-3 text-gray-700" colSpan={3}>TOTALS ({draws.length} draws)</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(totals.totalRequested)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(totals.totalApproved)}</td>
                  <td className="px-4 py-3 text-right font-mono text-amber-600">{formatCurrency(totals.totalRetainage)}</td>
                  <td className="px-4 py-3 text-right font-mono text-green-700">{formatCurrency(totals.totalNetFunded)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>

            {filteredDraws.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>No draw requests found.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Draw Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Monthly Draw Schedule</h3>
            <p className="text-xs text-gray-500 mt-0.5">Projected vs actual draws with cumulative tracking</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Projected</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cumulative</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scheduleWithCumulative.map((month, idx) => {
                const variance = month.actual !== null ? month.actual - month.projected : null;
                const cumulativePercent = month.cumulative && loanInfo
                  ? ((month.cumulative / loanInfo.loan_amount) * 100).toFixed(0)
                  : null;
                return (
                  <tr key={idx} className={cn("hover:bg-gray-50", month.actual === null && "text-gray-400")}>
                    <td className="px-4 py-3 font-medium">{month.month}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(month.projected)}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {month.actual !== null ? formatCurrency(month.actual) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {variance !== null && (
                        <span className={cn(variance > 0 ? 'text-amber-600' : variance < 0 ? 'text-green-600' : 'text-gray-500')}>
                          {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {month.cumulative !== null ? formatCurrency(month.cumulative) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {cumulativePercent && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2F855A] rounded-full"
                              style={{ width: `${cumulativePercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{cumulativePercent}%</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Draw Request Form */}
      {showForm && (
        <DrawRequestForm
          open={showForm}
          projectId={projectId}
          nextDrawNumber={nextDrawNumber}
          loanInfo={loanInfo}
          budgetRemaining={budgetIntegration?.remaining}
          onCreated={handleDrawCreated}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Draw Request Detail Modal */}
      {selectedDrawId && (
        <DrawRequestDetail
          open={!!selectedDrawId}
          drawId={selectedDrawId}
          projectId={projectId}
          onUpdated={handleDrawUpdated}
          onClose={() => setSelectedDrawId(null)}
        />
      )}
    </div>
  );
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const DrawStatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  return (
    <Badge variant="outline" className={cn("text-xs capitalize", config.color)}>
      {config.label}
    </Badge>
  );
};

const DrawExpandedItems = ({ drawId }) => {
  const { items, loading } = React.useMemo(() => {
    // Use inline hook-like pattern for expanded row
    return { items: [], loading: true };
  }, []);

  // Use a simple state approach for the expanded items
  const [lineItems, setLineItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  React.useEffect(() => {
    import('@/services/drawRequestService').then(({ getDrawRequestItems }) => {
      getDrawRequestItems(drawId).then(data => {
        setLineItems(data);
        setItemsLoading(false);
      });
    });
  }, [drawId]);

  if (itemsLoading) {
    return (
      <tr>
        <td colSpan={10} className="px-8 py-4 bg-gray-50 text-center text-xs text-gray-400">
          Loading line items...
        </td>
      </tr>
    );
  }

  if (lineItems.length === 0) {
    return (
      <tr>
        <td colSpan={10} className="px-8 py-4 bg-gray-50 text-center text-xs text-gray-400">
          No line items for this draw.
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={10} className="bg-gray-50/80 px-8 py-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-200">
              <th className="text-left py-2 pr-3">Cost Code</th>
              <th className="text-left py-2 pr-3">Description</th>
              <th className="text-right py-2 pr-3">Budget</th>
              <th className="text-right py-2 pr-3">Prev. Drawn</th>
              <th className="text-right py-2 pr-3">This Request</th>
              <th className="text-right py-2 pr-3">Approved</th>
              <th className="text-right py-2">% Complete</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map(item => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="py-2 pr-3 font-mono text-gray-600">{item.cost_code}</td>
                <td className="py-2 pr-3 text-gray-800">{item.description}</td>
                <td className="py-2 pr-3 text-right font-mono">{formatCurrency(item.budget_amount)}</td>
                <td className="py-2 pr-3 text-right font-mono text-gray-500">{formatCurrency(item.previously_drawn)}</td>
                <td className="py-2 pr-3 text-right font-mono font-medium text-[#2F855A]">{formatCurrency(item.current_request)}</td>
                <td className="py-2 pr-3 text-right font-mono">{item.approved_amount ? formatCurrency(item.approved_amount) : '—'}</td>
                <td className="py-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2F855A] rounded-full" style={{ width: `${item.percent_complete || 0}%` }} />
                    </div>
                    <span className="text-gray-600">{item.percent_complete || 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-300 font-medium">
            <tr>
              <td className="py-2 pr-3" colSpan={2}>Subtotal</td>
              <td className="py-2 pr-3 text-right font-mono">{formatCurrency(lineItems.reduce((s, i) => s + (i.budget_amount || 0), 0))}</td>
              <td className="py-2 pr-3 text-right font-mono">{formatCurrency(lineItems.reduce((s, i) => s + (i.previously_drawn || 0), 0))}</td>
              <td className="py-2 pr-3 text-right font-mono text-[#2F855A]">{formatCurrency(lineItems.reduce((s, i) => s + (i.current_request || 0), 0))}</td>
              <td className="py-2 pr-3 text-right font-mono">{formatCurrency(lineItems.reduce((s, i) => s + (i.approved_amount || 0), 0))}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </td>
    </tr>
  );
};

export default DrawRequestsPage;
