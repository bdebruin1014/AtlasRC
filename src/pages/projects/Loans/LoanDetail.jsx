// src/pages/projects/Loans/LoanDetail.jsx
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Landmark, DollarSign, Calendar, Percent, TrendingUp,
  CheckCircle2, Clock, ArrowDown, CreditCard,
} from 'lucide-react';
import { useLoanDetail, useLoanActions } from '@/hooks/useLoans';
import {
  getLoanTypeLabel, getStatusConfig, calculateAmortizationSchedule,
  DRAW_STATUSES,
} from '@/services/loanService';

export default function LoanDetail({ open, loan: initialLoan, onClose, onUpdated }) {
  const { loan, draws, payments, loading, refetch } = useLoanDetail(initialLoan?.id);
  const { addDraw, approveDrawRequest, fundDrawRequest, paymentRecord, saving } = useLoanActions(initialLoan?.project_id);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDrawForm, setShowDrawForm] = useState(false);
  const [drawAmount, setDrawAmount] = useState('');
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split('T')[0]);

  const displayLoan = loan || initialLoan;
  if (!displayLoan) return null;

  const statusConfig = getStatusConfig(displayLoan.status);
  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);
  const fmtDec = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);
  const pct = (v) => `${((v || 0) * 100).toFixed(2)}%`;

  const utilization = displayLoan.commitment_amount > 0
    ? (displayLoan.funded_amount / displayLoan.commitment_amount) * 100
    : 0;

  // Amortization schedule
  const amortSchedule = useMemo(() => {
    if (!displayLoan.interest_rate || !displayLoan.term_months) return [];
    const principal = displayLoan.funded_amount || displayLoan.commitment_amount;
    return calculateAmortizationSchedule(
      principal,
      displayLoan.interest_rate,
      displayLoan.term_months,
      displayLoan.io_period_months || 0
    );
  }, [displayLoan]);

  const totalInterest = amortSchedule.reduce((s, p) => s + p.interest, 0);

  const handleSubmitDraw = async () => {
    await addDraw(displayLoan.id, { draw_date: drawDate, amount: drawAmount });
    setShowDrawForm(false);
    setDrawAmount('');
    refetch();
    onUpdated();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5" />
            {displayLoan.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status & Summary Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`text-sm px-3 py-1 ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
              <span className="text-sm text-gray-600">{getLoanTypeLabel(displayLoan.loan_type)}</span>
              <span className="text-sm text-gray-500">{displayLoan.lender_name}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{fmt(displayLoan.commitment_amount)}</div>
              <div className="text-xs text-gray-500">commitment</div>
            </div>
          </div>

          {/* Utilization */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Funded: {fmt(displayLoan.funded_amount)}</span>
              <span className="text-gray-600">Available: {fmt(displayLoan.commitment_amount - displayLoan.funded_amount)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${Math.min(utilization, 100)}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">{utilization.toFixed(1)}% utilized</div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-100">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="draws">Draws ({draws.length})</TabsTrigger>
              <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
              <TabsTrigger value="amortization">Amortization</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-700 uppercase">Terms</div>
                  <div className="space-y-2 text-sm">
                    <DetailRow label="Interest Rate" value={`${pct(displayLoan.interest_rate)} ${displayLoan.rate_type}`} />
                    {displayLoan.rate_type === 'floating' && (
                      <>
                        <DetailRow label="Index" value={displayLoan.index_rate?.toUpperCase()} />
                        <DetailRow label="Spread" value={pct(displayLoan.spread)} />
                        {displayLoan.floor_rate && <DetailRow label="Floor" value={pct(displayLoan.floor_rate)} />}
                      </>
                    )}
                    <DetailRow label="Term" value={`${displayLoan.term_months} months`} />
                    {displayLoan.amortization_months && (
                      <DetailRow label="Amortization" value={`${displayLoan.amortization_months} months`} />
                    )}
                    <DetailRow label="I/O Period" value={`${displayLoan.io_period_months || 0} months`} />
                    <DetailRow label="Position" value={displayLoan.position} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-700 uppercase">Dates & Fees</div>
                  <div className="space-y-2 text-sm">
                    {displayLoan.effective_date && <DetailRow label="Effective" value={displayLoan.effective_date} />}
                    {displayLoan.maturity_date && <DetailRow label="Maturity" value={displayLoan.maturity_date} />}
                    <DetailRow label="Origination Fee" value={`${pct(displayLoan.origination_fee_percent)} (${fmt(displayLoan.origination_fee_amount)})`} />
                    {displayLoan.exit_fee_percent && <DetailRow label="Exit Fee" value={pct(displayLoan.exit_fee_percent)} />}
                    {displayLoan.interest_reserve > 0 && <DetailRow label="Interest Reserve" value={fmt(displayLoan.interest_reserve)} />}
                    {displayLoan.max_ltc && <DetailRow label="Max LTC" value={pct(displayLoan.max_ltc)} />}
                    {displayLoan.max_ltv && <DetailRow label="Max LTV" value={pct(displayLoan.max_ltv)} />}
                  </div>
                </div>
              </div>
              {displayLoan.notes && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gray-700 uppercase mb-1">Notes</div>
                  <div className="text-sm text-gray-600 bg-gray-50 rounded p-3">{displayLoan.notes}</div>
                </div>
              )}
              {/* Interest Summary */}
              {amortSchedule.length > 0 && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-blue-800 mb-2">Interest Summary</div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-blue-600 text-xs">Total Interest</div>
                      <div className="font-bold text-blue-900">{fmt(totalInterest)}</div>
                    </div>
                    <div>
                      <div className="text-blue-600 text-xs">Monthly (avg)</div>
                      <div className="font-bold text-blue-900">{fmt(totalInterest / displayLoan.term_months)}</div>
                    </div>
                    <div>
                      <div className="text-blue-600 text-xs">Annual (avg)</div>
                      <div className="font-bold text-blue-900">{fmt(totalInterest / (displayLoan.term_months / 12))}</div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Draws Tab */}
            <TabsContent value="draws" className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-semibold text-gray-700">Loan Draws</div>
                <Button size="sm" variant="outline" onClick={() => setShowDrawForm(!showDrawForm)}>
                  <ArrowDown className="w-3.5 h-3.5 mr-1" /> Request Draw
                </Button>
              </div>

              {showDrawForm && (
                <div className="border rounded-md p-3 mb-4 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Draw Date</Label>
                      <Input type="date" value={drawDate} onChange={(e) => setDrawDate(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <Input type="number" value={drawAmount} onChange={(e) => setDrawAmount(e.target.value)} className="pl-7" placeholder="0" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowDrawForm(false)}>Cancel</Button>
                    <Button size="sm" className="bg-[#2F855A] hover:bg-[#276749]" onClick={handleSubmitDraw} disabled={saving || !drawAmount}>
                      Submit Draw
                    </Button>
                  </div>
                </div>
              )}

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase">
                    <th className="pb-2">#</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {draws.map(draw => {
                    const drawStatus = DRAW_STATUSES.find(s => s.value === draw.status);
                    return (
                      <tr key={draw.id}>
                        <td className="py-2 text-gray-600">{draw.draw_number}</td>
                        <td className="py-2">{draw.draw_date}</td>
                        <td className="py-2 text-right font-mono font-medium">{fmt(draw.amount)}</td>
                        <td className="py-2">
                          <Badge variant="outline" className={drawStatus?.color || ''}>
                            {drawStatus?.label || draw.status}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {draw.status === 'requested' && (
                            <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-700" onClick={async () => { await approveDrawRequest(draw.id); refetch(); }} disabled={saving}>
                              Approve
                            </Button>
                          )}
                          {draw.status === 'approved' && (
                            <Button size="sm" variant="ghost" className="h-6 text-xs text-green-700" onClick={async () => { await fundDrawRequest(draw.id); refetch(); onUpdated(); }} disabled={saving}>
                              Fund
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t font-bold">
                    <td colSpan={2} className="pt-2">Total Funded</td>
                    <td className="pt-2 text-right font-mono">{fmt(draws.filter(d => d.status === 'funded').reduce((s, d) => s + d.amount, 0))}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-4">
              <div className="text-sm font-semibold text-gray-700 mb-3">Payment History</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase">
                    <th className="pb-2">#</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Principal</th>
                    <th className="pb-2 text-right">Interest</th>
                    <th className="pb-2 text-right">Total</th>
                    <th className="pb-2 text-right">Balance</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono text-xs">
                  {payments.map(pmt => (
                    <tr key={pmt.id} className={pmt.status === 'paid' ? '' : 'bg-gray-50'}>
                      <td className="py-1.5">{pmt.payment_number}</td>
                      <td className="py-1.5 font-sans">{pmt.payment_date}</td>
                      <td className="py-1.5 text-right">{fmtDec(pmt.principal_payment)}</td>
                      <td className="py-1.5 text-right text-red-600">{fmtDec(pmt.interest_payment)}</td>
                      <td className="py-1.5 text-right font-medium">{fmtDec(pmt.total_payment)}</td>
                      <td className="py-1.5 text-right">{fmt(pmt.ending_balance)}</td>
                      <td className="py-1.5 font-sans">
                        {pmt.status === 'paid' ? (
                          <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Paid</span>
                        ) : (
                          <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-bold text-xs">
                    <td colSpan={2} className="pt-2 font-sans">Totals (Paid)</td>
                    <td className="pt-2 text-right">{fmtDec(payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.principal_payment, 0))}</td>
                    <td className="pt-2 text-right text-red-600">{fmtDec(payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.interest_payment, 0))}</td>
                    <td className="pt-2 text-right">{fmtDec(payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.total_payment, 0))}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </TabsContent>

            {/* Amortization Tab */}
            <TabsContent value="amortization" className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-semibold text-gray-700">
                  Amortization Schedule
                  <span className="text-xs text-gray-500 ml-2">
                    ({displayLoan.io_period_months > 0 ? `${displayLoan.io_period_months}mo I/O + ` : ''}
                    {displayLoan.term_months - (displayLoan.io_period_months || 0)}mo amortizing)
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Total Interest: <span className="font-bold text-red-600">{fmt(totalInterest)}</span>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase">
                      <th className="pb-2">Month</th>
                      <th className="pb-2 text-right">Payment</th>
                      <th className="pb-2 text-right">Principal</th>
                      <th className="pb-2 text-right">Interest</th>
                      <th className="pb-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono">
                    {amortSchedule.map((row) => (
                      <tr key={row.month} className={row.month <= (displayLoan.io_period_months || 0) ? 'bg-amber-50/50' : ''}>
                        <td className="py-1">{row.month}</td>
                        <td className="py-1 text-right">{fmtDec(row.payment)}</td>
                        <td className="py-1 text-right text-green-700">{fmtDec(row.principal)}</td>
                        <td className="py-1 text-right text-red-600">{fmtDec(row.interest)}</td>
                        <td className="py-1 text-right">{fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {displayLoan.io_period_months > 0 && (
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-2 bg-amber-50 border rounded" /> Interest-only period</span>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 capitalize">{value}</span>
    </div>
  );
}
