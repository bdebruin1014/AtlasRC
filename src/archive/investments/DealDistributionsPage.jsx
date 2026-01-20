import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, Search, Download, MoreVertical, DollarSign, Calendar,
  CheckCircle, Clock, Send, Eye, Users, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DealDistributionsPage = () => {
  const { dealId } = useParams();
  const [selectedDistribution, setSelectedDistribution] = useState(null);

  const distributions = [
    {
      id: 'dist-001',
      memo: 'Q4 2024 Preferred Return',
      type: 'preferred_return',
      totalAmount: 50000,
      declaredDate: '2025-01-01',
      recordDate: '2024-12-31',
      paymentDate: '2025-01-15',
      status: 'scheduled',
      payments: [
        { investor: 'John Smith', amount: 5000, ownership: 10, status: 'pending' },
        { investor: 'Jane Doe', amount: 3000, ownership: 6, status: 'pending' },
        { investor: 'Acme Investments LLC', amount: 10000, ownership: 20, status: 'pending' },
      ],
    },
    {
      id: 'dist-002',
      memo: 'Q1 2025 Preferred Return',
      type: 'preferred_return',
      totalAmount: 50000,
      declaredDate: '2025-04-01',
      paymentDate: '2025-04-15',
      status: 'draft',
    },
  ];

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getStatusConfig = (status) => ({
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
    processing: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Processing' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
  }[status]);

  const getTypeLabel = (type) => ({
    preferred_return: 'Preferred Return',
    dividend: 'Dividend',
    return_of_capital: 'Return of Capital',
    profit_distribution: 'Profit Distribution',
    refinance_proceeds: 'Refinance Proceeds',
    sale_proceeds: 'Sale Proceeds',
  }[type] || type);

  const stats = {
    totalDistributed: 0,
    scheduled: distributions.filter(d => d.status === 'scheduled').reduce((s, d) => s + d.totalAmount, 0),
    nextPayment: '2025-01-15',
    distributionCount: distributions.length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Distributions</h1>
          <p className="text-sm text-gray-500">Manage investor distributions and payments</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />Create Distribution</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{formatCurrency(stats.totalDistributed)}</p><p className="text-sm text-gray-500">Total Distributed</p></div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{formatCurrency(stats.scheduled)}</p><p className="text-sm text-gray-500">Scheduled</p></div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{stats.nextPayment}</p><p className="text-sm text-gray-500">Next Payment</p></div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold">{stats.distributionCount}</p><p className="text-sm text-gray-500">Distributions</p></div>
          </div>
        </div>
      </div>

      {/* Distributions List */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Distribution History</h3>
        </div>
        <div className="divide-y">
          {distributions.map(dist => {
            const status = getStatusConfig(dist.status);
            return (
              <div 
                key={dist.id} 
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedDistribution(selectedDistribution === dist.id ? null : dist.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">{dist.memo}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{getTypeLabel(dist.type)}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">Payment: {dist.paymentDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-semibold">{formatCurrency(dist.totalAmount)}</p>
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", status.bg, status.text)}>
                      {status.label}
                    </span>
                    <button className="p-1 hover:bg-gray-200 rounded" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Expanded Payment Details */}
                {selectedDistribution === dist.id && dist.payments && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Payment Breakdown</h4>
                      <Button size="sm" variant="outline"><Send className="w-3 h-3 mr-1" />Process Payments</Button>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase">
                          <th className="pb-2">Investor</th>
                          <th className="pb-2 text-right">Ownership</th>
                          <th className="pb-2 text-right">Amount</th>
                          <th className="pb-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {dist.payments.map((payment, idx) => (
                          <tr key={idx}>
                            <td className="py-2">{payment.investor}</td>
                            <td className="py-2 text-right">{payment.ownership}%</td>
                            <td className="py-2 text-right font-medium">{formatCurrency(payment.amount)}</td>
                            <td className="py-2 text-right">
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">Pending</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {distributions.length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-1">No distributions yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first distribution to pay investors</p>
          <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-2" />Create Distribution</Button>
        </div>
      )}
    </div>
  );
};

export default DealDistributionsPage;
