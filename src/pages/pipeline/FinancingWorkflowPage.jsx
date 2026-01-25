import React, { useState, useMemo } from 'react';
import {
  DollarSign, Building, CheckCircle, Clock, AlertTriangle,
  FileText, Users, Calendar, TrendingUp, Percent, ChevronDown,
  ChevronRight, Send, Eye, Plus, RefreshCw, Scale, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockFinancingDeals = [
  {
    id: 'FIN-2024-0015',
    property: 'Metro Industrial Complex',
    purchasePrice: 30500000,
    loanAmount: 21350000,
    ltv: 70,
    status: 'commitment_received',
    stage: 'Documentation',
    selectedLender: 'Wells Fargo Commercial',
    interestRate: 6.5,
    term: 10,
    amortization: 30,
    io_period: 2,
    closingDate: '2024-03-15',
    quotes: [
      { lender: 'Wells Fargo Commercial', amount: 21350000, rate: 6.5, term: 10, ltv: 70, status: 'selected', contact: 'James Wilson' },
      { lender: 'Bank of America', amount: 21350000, rate: 6.75, term: 7, ltv: 70, status: 'declined', contact: 'Michael Brown' },
      { lender: 'JP Morgan', amount: 19825000, rate: 6.25, term: 10, ltv: 65, status: 'passed', contact: 'Robert Lee' }
    ],
    milestones: [
      { name: 'Loan Application Submitted', status: 'completed', date: '2024-01-22', assignee: 'Sarah Johnson' },
      { name: 'Term Sheet Received', status: 'completed', date: '2024-01-25', assignee: 'Wells Fargo' },
      { name: 'Term Sheet Executed', status: 'completed', date: '2024-01-26', assignee: 'Mike Chen' },
      { name: 'Appraisal Ordered', status: 'completed', date: '2024-01-27', assignee: 'Wells Fargo' },
      { name: 'Appraisal Received', status: 'completed', date: '2024-02-08', assignee: 'Wells Fargo' },
      { name: 'Loan Commitment Issued', status: 'completed', date: '2024-02-15', assignee: 'Wells Fargo' },
      { name: 'Loan Documents Drafted', status: 'in_progress', date: null, assignee: 'Legal Team' },
      { name: 'Loan Documents Signed', status: 'pending', date: null, assignee: 'Mike Chen' },
      { name: 'Funding', status: 'pending', date: null, assignee: 'Wells Fargo' }
    ],
    fees: {
      originationFee: 106750,
      appraisalFee: 8500,
      legalFees: 45000,
      titleInsurance: 25000,
      environmentalReview: 5000,
      total: 190250
    }
  },
  {
    id: 'FIN-2024-0014',
    property: 'Harbor View Apartments',
    purchasePrice: 42500000,
    loanAmount: 29750000,
    ltv: 70,
    status: 'quoting',
    stage: 'Lender Selection',
    selectedLender: null,
    interestRate: null,
    term: null,
    amortization: null,
    io_period: null,
    closingDate: '2024-04-01',
    quotes: [
      { lender: 'Fannie Mae (Walker & Dunlop)', amount: 31875000, rate: 5.85, term: 10, ltv: 75, status: 'pending', contact: 'Amy Chen' },
      { lender: 'Freddie Mac (CBRE)', amount: 31875000, rate: 5.90, term: 10, ltv: 75, status: 'pending', contact: 'Tom Harris' },
      { lender: 'Life Company', amount: 29750000, rate: 5.50, term: 15, ltv: 70, status: 'pending', contact: 'Linda Park' }
    ],
    milestones: [
      { name: 'Financing Package Prepared', status: 'completed', date: '2024-01-20', assignee: 'John Smith' },
      { name: 'RFP Sent to Lenders', status: 'completed', date: '2024-01-22', assignee: 'Sarah Johnson' },
      { name: 'Quotes Received', status: 'in_progress', date: null, assignee: 'Multiple Lenders' },
      { name: 'Lender Selected', status: 'pending', date: null, assignee: 'Sarah Johnson' }
    ],
    fees: null
  }
];

const statusConfig = {
  quoting: { label: 'Quoting', color: 'bg-yellow-100 text-yellow-800' },
  term_sheet: { label: 'Term Sheet', color: 'bg-blue-100 text-blue-800' },
  commitment_received: { label: 'Commitment', color: 'bg-green-100 text-green-800' },
  documentation: { label: 'Documentation', color: 'bg-purple-100 text-purple-800' },
  funded: { label: 'Funded', color: 'bg-green-100 text-green-800' }
};

const quoteStatusConfig = {
  selected: { label: 'Selected', color: 'bg-green-100 text-green-800' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  declined: { label: 'Declined', color: 'bg-gray-100 text-gray-800' },
  passed: { label: 'Passed', color: 'bg-gray-100 text-gray-800' }
};

export default function FinancingWorkflowPage() {
  const [selectedDeal, setSelectedDeal] = useState(mockFinancingDeals[0]);
  const [expandedSections, setExpandedSections] = useState(['quotes', 'milestones']);

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const getProgress = (milestones) => {
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  const stats = useMemo(() => ({
    activeDeals: mockFinancingDeals.length,
    totalLoanAmount: mockFinancingDeals.reduce((sum, d) => sum + d.loanAmount, 0),
    pendingCommitment: mockFinancingDeals.filter(d => d.status === 'quoting' || d.status === 'term_sheet').length,
    closingSoon: mockFinancingDeals.filter(d => {
      const closeDate = new Date(d.closingDate);
      const today = new Date();
      const diff = Math.ceil((closeDate - today) / (1000 * 60 * 60 * 24));
      return diff <= 30 && diff > 0;
    }).length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financing Workflow</h1>
          <p className="text-gray-600">Track acquisition financing from quote to funding</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />New Financing Request
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><CreditCard className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDeals}</p>
              <p className="text-sm text-gray-600">Active Deals</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalLoanAmount / 1000000).toFixed(0)}M</p>
              <p className="text-sm text-gray-600">Total Loan Amount</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCommitment}</p>
              <p className="text-sm text-gray-600">Pending Commitment</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Calendar className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.closingSoon}</p>
              <p className="text-sm text-gray-600">Closing in 30 Days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          {mockFinancingDeals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => setSelectedDeal(deal)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedDeal?.id === deal.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-gray-900">{deal.property}</p>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[deal.status].color)}>{statusConfig[deal.status].label}</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">Loan: ${(deal.loanAmount / 1000000).toFixed(1)}M @ {deal.ltv}% LTV</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${getProgress(deal.milestones)}%` }} />
                </div>
                <span className="text-xs text-gray-500">{getProgress(deal.milestones)}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-3 space-y-4">
          {selectedDeal && (
            <>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedDeal.property}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedDeal.status].color)}>{statusConfig[selectedDeal.status].label}</span>
                    </div>
                    <p className="text-gray-600">Stage: {selectedDeal.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Loan Amount</p>
                    <p className="text-2xl font-bold text-gray-900">${(selectedDeal.loanAmount / 1000000).toFixed(2)}M</p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Purchase Price</p>
                    <p className="text-lg font-bold text-gray-900">${(selectedDeal.purchasePrice / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">LTV</p>
                    <p className="text-lg font-bold text-gray-900">{selectedDeal.ltv}%</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Rate</p>
                    <p className="text-lg font-bold text-gray-900">{selectedDeal.interestRate ? `${selectedDeal.interestRate}%` : 'TBD'}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Term</p>
                    <p className="text-lg font-bold text-gray-900">{selectedDeal.term ? `${selectedDeal.term} yr` : 'TBD'}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Target Close</p>
                    <p className="text-lg font-bold text-gray-900">{selectedDeal.closingDate}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleSection('quotes')}
                >
                  <div className="flex items-center gap-3">
                    {expandedSections.includes('quotes') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    <h3 className="font-semibold text-gray-900">Lender Quotes</h3>
                  </div>
                  <span className="text-sm text-gray-500">{selectedDeal.quotes.length} quotes</span>
                </div>

                {expandedSections.includes('quotes') && (
                  <div className="border-t border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 bg-gray-50 border-b">
                          <th className="p-3">Lender</th>
                          <th className="p-3 text-right">Amount</th>
                          <th className="p-3 text-right">Rate</th>
                          <th className="p-3 text-right">Term</th>
                          <th className="p-3 text-right">LTV</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDeal.quotes.map((quote, idx) => (
                          <tr key={idx} className={cn("border-b border-gray-100", quote.status === 'selected' && "bg-green-50")}>
                            <td className="p-3">
                              <p className="font-medium text-gray-900">{quote.lender}</p>
                              <p className="text-xs text-gray-500">{quote.contact}</p>
                            </td>
                            <td className="p-3 text-right">${(quote.amount / 1000000).toFixed(2)}M</td>
                            <td className="p-3 text-right">{quote.rate}%</td>
                            <td className="p-3 text-right">{quote.term} yr</td>
                            <td className="p-3 text-right">{quote.ltv}%</td>
                            <td className="p-3 text-center">
                              <span className={cn("px-2 py-1 rounded text-xs", quoteStatusConfig[quote.status].color)}>{quoteStatusConfig[quote.status].label}</span>
                            </td>
                            <td className="p-3">
                              {quote.status === 'pending' && <Button size="sm" variant="outline">Select</Button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleSection('milestones')}
                >
                  <div className="flex items-center gap-3">
                    {expandedSections.includes('milestones') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    <h3 className="font-semibold text-gray-900">Milestones</h3>
                  </div>
                  <span className="text-sm text-gray-500">{getProgress(selectedDeal.milestones)}% complete</span>
                </div>

                {expandedSections.includes('milestones') && (
                  <div className="border-t border-gray-200 divide-y divide-gray-100">
                    {selectedDeal.milestones.map((milestone, idx) => (
                      <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {milestone.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : milestone.status === 'in_progress' ? (
                            <RefreshCw className="w-5 h-5 text-blue-600" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                          <div>
                            <p className={cn("text-sm", milestone.status === 'completed' && "text-gray-500")}>{milestone.name}</p>
                            <p className="text-xs text-gray-500">{milestone.assignee}</p>
                          </div>
                        </div>
                        {milestone.date && <span className="text-xs text-gray-500">{milestone.date}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedDeal.fees && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Estimated Closing Costs</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Origination Fee (0.5%)</span><span className="font-medium">${selectedDeal.fees.originationFee.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Appraisal Fee</span><span className="font-medium">${selectedDeal.fees.appraisalFee.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Legal Fees</span><span className="font-medium">${selectedDeal.fees.legalFees.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Title Insurance</span><span className="font-medium">${selectedDeal.fees.titleInsurance.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Environmental Review</span><span className="font-medium">${selectedDeal.fees.environmentalReview.toLocaleString()}</span></div>
                    <div className="flex justify-between pt-2 border-t border-gray-200"><span className="font-semibold text-gray-900">Total Estimated Costs</span><span className="font-bold text-gray-900">${selectedDeal.fees.total.toLocaleString()}</span></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
