// src/pages/projects/Loans/LoansPage.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Landmark, Plus, DollarSign, TrendingUp, Clock,
  Percent, AlertCircle, ChevronRight,
} from 'lucide-react';
import { useProjectLoans } from '@/hooks/useLoans';
import {
  getLoanTypeLabel, getStatusConfig, LOAN_TYPES, LOAN_STATUSES,
} from '@/services/loanService';
import LoanForm from './LoanForm';
import LoanDetail from './LoanDetail';

export default function LoansPage() {
  const { projectId } = useParams();
  const pid = projectId || 'demo-project-1';
  const { loans, loading, summary, refetch } = useProjectLoans(pid);

  const [showForm, setShowForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = loans.filter(loan => {
    if (filterStatus !== 'all' && loan.status !== filterStatus) return false;
    if (filterType !== 'all' && loan.loan_type !== filterType) return false;
    return true;
  });

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);
  const pct = (v) => `${((v || 0) * 100).toFixed(2)}%`;

  if (loading) {
    return <div className="p-6 text-gray-500">Loading loans...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
          <p className="text-sm text-gray-500 mt-1">Track project financing and debt service</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-[#2F855A] hover:bg-[#276749]">
          <Plus className="w-4 h-4 mr-2" /> New Loan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
            <Landmark className="w-3.5 h-3.5" /> COMMITMENT
          </div>
          <div className="text-xl font-bold text-gray-900">{fmt(summary.totalCommitment)}</div>
          <div className="text-xs text-gray-500">{summary.totalCount} loans</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-medium mb-1">
            <DollarSign className="w-3.5 h-3.5" /> FUNDED
          </div>
          <div className="text-xl font-bold text-blue-700">{fmt(summary.totalFunded)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 text-xs font-medium mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> AVAILABLE
          </div>
          <div className="text-xl font-bold text-green-700">{fmt(summary.availableToFund)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 text-xs font-medium mb-1">
            <Percent className="w-3.5 h-3.5" /> WEIGHTED RATE
          </div>
          <div className="text-xl font-bold text-purple-700">{pct(summary.weightedRate)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-600 text-xs font-medium mb-1">
            <Clock className="w-3.5 h-3.5" /> INT. RESERVE
          </div>
          <div className="text-xl font-bold text-amber-700">{fmt(summary.totalInterestReserve)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
            <AlertCircle className="w-3.5 h-3.5" /> ORIG. FEES
          </div>
          <div className="text-xl font-bold text-gray-700">{fmt(summary.totalOriginationFees)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          {LOAN_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Types</option>
          {LOAN_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Loans List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
            No loans found.
          </div>
        ) : (
          filtered.map(loan => {
            const statusConfig = getStatusConfig(loan.status);
            const utilization = loan.commitment_amount > 0
              ? (loan.funded_amount / loan.commitment_amount) * 100
              : 0;
            return (
              <div
                key={loan.id}
                className="bg-white border rounded-lg p-5 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => setSelectedLoan(loan)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{loan.name}</h3>
                      <Badge variant="outline" className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                      <span>{getLoanTypeLabel(loan.loan_type)}</span>
                      <span>{loan.lender_name}</span>
                      <span>{pct(loan.interest_rate)} {loan.rate_type === 'floating' ? `(${loan.index_rate?.toUpperCase()} + ${pct(loan.spread)})` : 'Fixed'}</span>
                      <span>{loan.term_months}mo term</span>
                      {loan.io_period_months > 0 && <span>{loan.io_period_months}mo I/O</span>}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold text-gray-900">{fmt(loan.commitment_amount)}</div>
                    <div className="text-xs text-gray-500">commitment</div>
                  </div>
                </div>

                {/* Utilization Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Funded: {fmt(loan.funded_amount)}</span>
                    <span>{utilization.toFixed(0)}% drawn</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Key Dates */}
                {(loan.effective_date || loan.maturity_date) && (
                  <div className="mt-3 flex gap-6 text-xs text-gray-500">
                    {loan.effective_date && <span>Effective: {loan.effective_date}</span>}
                    {loan.maturity_date && <span>Maturity: {loan.maturity_date}</span>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Form Dialog */}
      {showForm && (
        <LoanForm
          open={showForm}
          projectId={pid}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); refetch(); }}
        />
      )}

      {/* Detail Dialog */}
      {selectedLoan && (
        <LoanDetail
          open={!!selectedLoan}
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
          onUpdated={refetch}
        />
      )}
    </div>
  );
}
