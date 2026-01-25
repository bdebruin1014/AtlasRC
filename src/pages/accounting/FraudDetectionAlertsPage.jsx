import React, { useState, useMemo } from 'react';
import {
  Shield, AlertTriangle, AlertCircle, CheckCircle, XCircle, Eye,
  Clock, User, DollarSign, Search, Filter, FileText, Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockAlerts = [
  {
    id: 'ALERT-2024-089',
    type: 'duplicate_payment',
    severity: 'high',
    status: 'open',
    title: 'Potential Duplicate Payment Detected',
    description: 'Invoice #INV-4521 from ABC Contractors may have been paid twice. Amounts match within $50.',
    amount: 45000,
    detectedDate: '2024-01-30 09:15',
    entity: 'Downtown Tower LLC',
    relatedTransactions: ['AP-2024-0312', 'AP-2024-0315'],
    assignedTo: 'Mike Chen',
    riskScore: 85
  },
  {
    id: 'ALERT-2024-088',
    type: 'unusual_vendor',
    severity: 'high',
    status: 'investigating',
    title: 'New Vendor with Large First Payment',
    description: 'New vendor "XYZ Services LLC" received $125,000 payment within 5 days of being added to vendor master.',
    amount: 125000,
    detectedDate: '2024-01-29 14:30',
    entity: 'Atlas Holdings LLC',
    relatedTransactions: ['AP-2024-0308'],
    assignedTo: 'Lisa Wang',
    riskScore: 78,
    investigationNotes: 'Verified vendor legitimacy with contracts team. Awaiting supporting documentation.'
  },
  {
    id: 'ALERT-2024-087',
    type: 'round_amount',
    severity: 'medium',
    status: 'false_positive',
    title: 'Multiple Round Dollar Payments',
    description: '5 payments of exactly $10,000 to same vendor within 7 days - potential structuring.',
    amount: 50000,
    detectedDate: '2024-01-28 11:00',
    entity: 'Riverside Plaza LLC',
    relatedTransactions: ['AP-2024-0298', 'AP-2024-0299', 'AP-2024-0300', 'AP-2024-0301', 'AP-2024-0302'],
    assignedTo: 'Tom Davis',
    riskScore: 62,
    resolution: 'Confirmed scheduled maintenance payments per contract terms. Closed as false positive.'
  },
  {
    id: 'ALERT-2024-086',
    type: 'ghost_employee',
    severity: 'critical',
    status: 'escalated',
    title: 'Employee Without Activity Receiving Payroll',
    description: 'Employee ID E-2847 has no system login activity for 90+ days but continues to receive payroll.',
    amount: 18500,
    detectedDate: '2024-01-27 08:45',
    entity: 'Atlas Management Co.',
    relatedTransactions: ['PAY-2024-JAN-047'],
    assignedTo: 'Robert Johnson',
    riskScore: 95,
    escalatedTo: 'CEO / Legal'
  },
  {
    id: 'ALERT-2024-085',
    type: 'weekend_transaction',
    severity: 'low',
    status: 'resolved',
    title: 'Wire Transfer Initiated on Weekend',
    description: 'Wire transfer of $75,000 initiated on Saturday outside normal business hours.',
    amount: 75000,
    detectedDate: '2024-01-27 14:20',
    entity: 'Atlas Holdings LLC',
    relatedTransactions: ['WIRE-2024-0085'],
    assignedTo: 'Mike Chen',
    riskScore: 45,
    resolution: 'Emergency vendor payment for property repair. Approved by on-call manager.'
  },
  {
    id: 'ALERT-2024-084',
    type: 'split_transaction',
    severity: 'high',
    status: 'open',
    title: 'Transaction Splitting Suspected',
    description: 'Multiple invoices from same vendor totaling $48,500 submitted same day, each under $10K approval threshold.',
    amount: 48500,
    detectedDate: '2024-01-26 16:00',
    entity: 'Riverside Plaza LLC',
    relatedTransactions: ['AP-2024-0285', 'AP-2024-0286', 'AP-2024-0287', 'AP-2024-0288', 'AP-2024-0289'],
    assignedTo: 'Lisa Wang',
    riskScore: 82
  }
];

const alertTypes = {
  duplicate_payment: { label: 'Duplicate Payment', icon: '💳' },
  unusual_vendor: { label: 'Unusual Vendor', icon: '🏢' },
  round_amount: { label: 'Round Amounts', icon: '🎯' },
  ghost_employee: { label: 'Ghost Employee', icon: '👻' },
  weekend_transaction: { label: 'Off-Hours Activity', icon: '🌙' },
  split_transaction: { label: 'Transaction Splitting', icon: '✂️' }
};

const severityConfig = {
  critical: { label: 'Critical', color: 'bg-red-600 text-white' },
  high: { label: 'High', color: 'bg-red-100 text-red-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  low: { label: 'Low', color: 'bg-blue-100 text-blue-800' }
};

const statusConfig = {
  open: { label: 'Open', color: 'bg-red-100 text-red-800' },
  investigating: { label: 'Investigating', color: 'bg-yellow-100 text-yellow-800' },
  escalated: { label: 'Escalated', color: 'bg-purple-100 text-purple-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  false_positive: { label: 'False Positive', color: 'bg-gray-100 text-gray-800' }
};

export default function FraudDetectionAlertsPage() {
  const [filter, setFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(mockAlerts[0]);

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return mockAlerts;
    if (filter === 'active') return mockAlerts.filter(a => ['open', 'investigating', 'escalated'].includes(a.status));
    return mockAlerts.filter(a => a.status === filter);
  }, [filter]);

  const stats = useMemo(() => ({
    total: mockAlerts.length,
    open: mockAlerts.filter(a => a.status === 'open').length,
    investigating: mockAlerts.filter(a => a.status === 'investigating').length,
    escalated: mockAlerts.filter(a => a.status === 'escalated').length,
    critical: mockAlerts.filter(a => a.severity === 'critical' && a.status !== 'resolved' && a.status !== 'false_positive').length,
    totalAtRisk: mockAlerts.filter(a => ['open', 'investigating', 'escalated'].includes(a.status)).reduce((sum, a) => sum + a.amount, 0)
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fraud Detection Alerts</h1>
          <p className="text-gray-600">AI-powered monitoring for suspicious transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><FileText className="w-4 h-4 mr-2" />Export Report</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Shield className="w-4 h-4 mr-2" />Run Detection</Button>
        </div>
      </div>

      {stats.critical > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">{stats.critical} Critical Alert(s) Require Immediate Attention</p>
              <p className="text-sm text-red-700">Review and investigate urgently to prevent potential losses.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Alerts</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">{stats.open}</p>
          <p className="text-sm text-gray-600">Open</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.investigating}</p>
          <p className="text-sm text-gray-600">Investigating</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.escalated}</p>
          <p className="text-sm text-gray-600">Escalated</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
          <p className="text-sm text-gray-600">Critical</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-orange-600">${(stats.totalAtRisk / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600">At Risk</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'open', 'investigating', 'resolved'].map((f) => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedAlert?.id === alert.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200",
                alert.severity === 'critical' && alert.status !== 'resolved' && "border-red-300 bg-red-50"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{alertTypes[alert.type].icon}</span>
                  <span className="font-medium text-gray-900">{alert.id}</span>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs", severityConfig[alert.severity].color)}>
                  {severityConfig[alert.severity].label}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">{alert.title}</p>
              <div className="flex items-center justify-between">
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[alert.status].color)}>
                  {statusConfig[alert.status].label}
                </span>
                <span className="font-semibold text-gray-900">${alert.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedAlert && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">{alertTypes[selectedAlert.type].icon}</span>
                      <h2 className="text-xl font-bold text-gray-900">{selectedAlert.id}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", severityConfig[selectedAlert.severity].color)}>
                        {severityConfig[selectedAlert.severity].label}
                      </span>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedAlert.status].color)}>
                        {statusConfig[selectedAlert.status].label}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{selectedAlert.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${selectedAlert.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Risk Score: {selectedAlert.riskScore}/100</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedAlert.description}</p>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Entity</p>
                    <p className="font-medium text-gray-900">{selectedAlert.entity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Detected</p>
                    <p className="font-medium text-gray-900">{selectedAlert.detectedDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Assigned To</p>
                    <p className="font-medium text-gray-900">{selectedAlert.assignedTo}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Related Transactions</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.relatedTransactions.map((txn, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded-lg text-sm">{txn}</span>
                  ))}
                </div>
              </div>

              {selectedAlert.investigationNotes && (
                <div className="p-6 border-b border-gray-200 bg-yellow-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Investigation Notes</h3>
                  <p className="text-sm text-gray-700">{selectedAlert.investigationNotes}</p>
                </div>
              )}

              {selectedAlert.resolution && (
                <div className="p-6 bg-green-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Resolution</h3>
                  <p className="text-sm text-gray-700">{selectedAlert.resolution}</p>
                </div>
              )}

              {selectedAlert.escalatedTo && (
                <div className="p-6 bg-purple-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Escalated To</h3>
                  <p className="text-sm text-gray-700">{selectedAlert.escalatedTo}</p>
                </div>
              )}

              {['open', 'investigating'].includes(selectedAlert.status) && (
                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                  <Button variant="outline">Mark False Positive</Button>
                  <Button variant="outline" className="text-purple-600">Escalate</Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />Resolve
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
