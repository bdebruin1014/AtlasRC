/**
 * Atlas - Disposition Management Page
 * Comprehensive disposition tracking for all project types:
 * - Lot Development: Bulk sales schedules to builders
 * - BTR Development: Lease-up tracking & stabilization
 * - For-Sale Development: Individual home sales
 * - Fix & Flip: Single property sale
 * - Scattered Lot: Individual lot or home sales
 * 
 * Handles contracts, settlement statements, and sales transactions
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Download, Calendar, DollarSign, TrendingUp, 
  CheckCircle2, Clock, AlertCircle, FileText, Users, Home, Building2,
  Key, ChevronDown, Eye, Edit2, MoreHorizontal, ArrowRight, 
  FileSignature, Receipt, BarChart3, Target, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DispositionPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock project - determines disposition type
  const project = {
    id: projectId,
    name: 'Riverside Commons',
    type: 'lot-development', // lot-development, btr-development, for-sale-development, fix-flip, scattered-lot
    totalUnits: 48,
    entity: 'VanRock Holdings LLC',
    dispositionStrategy: 'bulk-sale', // bulk-sale, individual-sale, lease-up, mixed
    targetPrice: 4500000,
    targetCloseDate: '2025-06-30'
  };

  // Disposition type configurations
  const dispositionTypes = {
    'lot-development': {
      label: 'Lot Development',
      unitLabel: 'Lots',
      salesType: 'Bulk Sales to Builders',
      tabs: ['overview', 'bulk-schedules', 'contracts', 'settlements', 'reports']
    },
    'btr-development': {
      label: 'BTR Development',
      unitLabel: 'Units',
      salesType: 'Lease-Up & Stabilization',
      tabs: ['overview', 'lease-up', 'tenant-contracts', 'rent-roll', 'reports']
    },
    'for-sale-development': {
      label: 'For Sale Development',
      unitLabel: 'Homes',
      salesType: 'Individual Home Sales',
      tabs: ['overview', 'sales-schedule', 'contracts', 'settlements', 'reports']
    },
    'fix-flip': {
      label: 'Fix & Flip',
      unitLabel: 'Property',
      salesType: 'Property Sale',
      tabs: ['overview', 'listing', 'offers', 'contract', 'settlement']
    },
    'scattered-lot': {
      label: 'Scattered Lot',
      unitLabel: 'Property',
      salesType: 'Individual Sale',
      tabs: ['overview', 'listing', 'contract', 'settlement']
    }
  };

  const config = dispositionTypes[project.type] || dispositionTypes['lot-development'];

  // Mock bulk sales schedule data (for lot development)
  const bulkSalesSchedule = [
    {
      id: 1,
      buyer: 'Red Cedar Homes LLC',
      buyerContact: 'Mike Johnson',
      totalLots: 24,
      pricePerLot: 95000,
      totalPrice: 2280000,
      status: 'active',
      takedowns: [
        { id: 1, scheduledDate: '2025-02-15', lots: 8, amount: 760000, status: 'completed', actualDate: '2025-02-15', actualAmount: 760000 },
        { id: 2, scheduledDate: '2025-05-15', lots: 8, amount: 760000, status: 'upcoming' },
        { id: 3, scheduledDate: '2025-08-15', lots: 8, amount: 760000, status: 'scheduled' }
      ],
      contractDate: '2024-12-01',
      escalation: 0.02,
      notes: 'Primary builder partner for Phase 1'
    },
    {
      id: 2,
      buyer: 'Greenville Custom Homes',
      buyerContact: 'Sarah Williams',
      totalLots: 12,
      pricePerLot: 98000,
      totalPrice: 1176000,
      status: 'active',
      takedowns: [
        { id: 1, scheduledDate: '2025-03-01', lots: 6, amount: 588000, status: 'upcoming' },
        { id: 2, scheduledDate: '2025-06-01', lots: 6, amount: 588000, status: 'scheduled' }
      ],
      contractDate: '2025-01-05',
      escalation: 0.015,
      notes: 'Premium lot allocation'
    },
    {
      id: 3,
      buyer: 'Upstate Builders Inc',
      buyerContact: 'David Chen',
      totalLots: 12,
      pricePerLot: 92000,
      totalPrice: 1104000,
      status: 'negotiating',
      takedowns: [],
      contractDate: null,
      notes: 'In negotiation for remaining Phase 2 lots'
    }
  ];

  // Mock contracts data
  const contracts = [
    {
      id: 'CON-001',
      type: 'bulk-sale',
      buyer: 'Red Cedar Homes LLC',
      seller: 'VanRock Holdings LLC',
      units: 24,
      contractPrice: 2280000,
      earnestMoney: 50000,
      contractDate: '2024-12-01',
      effectiveDate: '2024-12-01',
      ddDeadline: '2025-01-15',
      closeDate: '2025-02-15',
      status: 'active',
      signedDate: '2024-12-03',
      documents: ['Purchase Agreement', 'Exhibit A - Lot List', 'Takedown Schedule']
    },
    {
      id: 'CON-002',
      type: 'bulk-sale',
      buyer: 'Greenville Custom Homes',
      seller: 'VanRock Holdings LLC',
      units: 12,
      contractPrice: 1176000,
      earnestMoney: 30000,
      contractDate: '2025-01-05',
      effectiveDate: '2025-01-05',
      ddDeadline: '2025-02-05',
      closeDate: '2025-03-01',
      status: 'active',
      signedDate: '2025-01-08',
      documents: ['Purchase Agreement', 'Exhibit A - Lot List', 'Takedown Schedule']
    }
  ];

  // Mock settlement statements
  const settlements = [
    {
      id: 'SET-001',
      contractId: 'CON-001',
      takedownNumber: 1,
      buyer: 'Red Cedar Homes LLC',
      closingDate: '2025-02-15',
      lots: 8,
      grossSalePrice: 760000,
      status: 'closed',
      titleCompany: 'First American Title',
      escrowNumber: 'FA-2025-12345',
      // Settlement statement line items
      sellerCredits: 760000,
      sellerDebits: [
        { description: 'Commission (3%)', amount: 22800 },
        { description: 'Title Insurance - Owner', amount: 2500 },
        { description: 'Recording Fees', amount: 150 },
        { description: 'Prorated Taxes', amount: 1850 },
        { description: 'HOA Transfer Fee', amount: 500 }
      ],
      netToSeller: 732200,
      fundsReceived: true,
      fundedDate: '2025-02-15'
    }
  ];

  // Calculate summary stats
  const summary = useMemo(() => {
    const activeBulkSales = bulkSalesSchedule.filter(s => s.status === 'active');
    const totalContracted = activeBulkSales.reduce((sum, s) => sum + s.totalPrice, 0);
    const lotsContracted = activeBulkSales.reduce((sum, s) => sum + s.totalLots, 0);
    const completedTakedowns = bulkSalesSchedule.flatMap(s => s.takedowns).filter(t => t.status === 'completed');
    const amountReceived = completedTakedowns.reduce((sum, t) => sum + (t.actualAmount || 0), 0);
    const lotsSold = completedTakedowns.reduce((sum, t) => sum + t.lots, 0);
    
    return {
      totalLots: project.totalUnits,
      lotsContracted,
      lotsSold,
      lotsRemaining: project.totalUnits - lotsContracted,
      totalContracted,
      amountReceived,
      amountPending: totalContracted - amountReceived,
      targetPrice: project.targetPrice,
      percentToTarget: Math.round((totalContracted / project.targetPrice) * 100),
      activeContracts: activeBulkSales.length,
      pendingTakedowns: bulkSalesSchedule.flatMap(s => s.takedowns).filter(t => t.status === 'upcoming').length
    };
  }, [bulkSalesSchedule, project]);

  const formatCurrency = (val) => {
    if (!val) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const configs = {
      active: { label: 'Active', color: 'bg-green-100 text-green-700' },
      negotiating: { label: 'Negotiating', color: 'bg-amber-100 text-amber-700' },
      pending: { label: 'Pending', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Completed', color: 'bg-purple-100 text-purple-700' },
      scheduled: { label: 'Scheduled', color: 'bg-gray-100 text-gray-600' },
      upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' },
      closed: { label: 'Closed', color: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' }
    };
    const config = configs[status] || configs.pending;
    return <span className={cn("px-2 py-1 rounded text-xs font-medium", config.color)}>{config.label}</span>;
  };

  const renderOverview = () => (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Total {config.unitLabel}</p>
          <p className="text-2xl font-bold">{summary.totalLots}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Contracted</p>
          <p className="text-2xl font-bold text-blue-600">{summary.lotsContracted}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Sold/Closed</p>
          <p className="text-2xl font-bold text-green-600">{summary.lotsSold}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Remaining</p>
          <p className="text-2xl font-bold text-amber-600">{summary.lotsRemaining}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Amount Received</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.amountReceived)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.amountPending)}</p>
        </div>
      </div>

      {/* Progress to Target */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Disposition Progress</h3>
          <span className="text-sm text-gray-500">Target: {formatCurrency(summary.targetPrice)}</span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Contracted Revenue</span>
              <span className="font-medium">{formatCurrency(summary.totalContracted)} ({summary.percentToTarget}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${Math.min(summary.percentToTarget, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Received Revenue</span>
              <span className="font-medium">{formatCurrency(summary.amountReceived)} ({Math.round((summary.amountReceived / summary.targetPrice) * 100)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${Math.min((summary.amountReceived / summary.targetPrice) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Active Buyer Agreements */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Active Buyer Agreements</h3>
          <Button size="sm" className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-1" />New Agreement
          </Button>
        </div>
        <div className="divide-y">
          {bulkSalesSchedule.filter(s => s.status === 'active').map(schedule => (
            <div key={schedule.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{schedule.buyer}</p>
                  <p className="text-sm text-gray-500">{schedule.totalLots} lots • {formatCurrency(schedule.pricePerLot)}/lot</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-700">{formatCurrency(schedule.totalPrice)}</p>
                  <p className="text-xs text-gray-500">Contract: {formatDate(schedule.contractDate)}</p>
                </div>
              </div>
              {/* Takedown Progress */}
              <div className="mt-3 flex items-center gap-2">
                {schedule.takedowns.map((td, idx) => (
                  <div 
                    key={td.id} 
                    className={cn(
                      "flex-1 h-2 rounded",
                      td.status === 'completed' ? 'bg-green-500' :
                      td.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-200'
                    )}
                    title={`Takedown ${idx + 1}: ${formatDate(td.scheduledDate)} - ${td.lots} lots`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {schedule.takedowns.filter(t => t.status === 'completed').length} of {schedule.takedowns.length} takedowns complete
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Closings */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Upcoming Closings</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {bulkSalesSchedule.flatMap(s => s.takedowns.filter(t => t.status === 'upcoming').map(t => ({
              ...t,
              buyer: s.buyer
            }))).map((takedown, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{takedown.buyer}</p>
                    <p className="text-xs text-gray-500">{takedown.lots} lots</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(takedown.amount)}</p>
                  <p className="text-xs text-blue-600">{formatDate(takedown.scheduledDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBulkSchedules = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bulk Sales Schedules</h2>
        <Button className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-1" />New Bulk Sale Agreement
        </Button>
      </div>

      {bulkSalesSchedule.map(schedule => (
        <div key={schedule.id} className="bg-white border rounded-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{schedule.buyer}</h3>
                  {getStatusBadge(schedule.status)}
                </div>
                <p className="text-sm text-gray-500">Contact: {schedule.buyerContact}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(schedule.totalPrice)}</p>
              <p className="text-sm text-gray-500">{schedule.totalLots} lots @ {formatCurrency(schedule.pricePerLot)}/lot</p>
            </div>
          </div>
          
          {/* Takedown Schedule */}
          <div className="p-4">
            <h4 className="font-medium mb-3">Takedown Schedule</h4>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">#</th>
                  <th className="text-left px-4 py-2 font-medium">Scheduled Date</th>
                  <th className="text-right px-4 py-2 font-medium">Lots</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Actual Date</th>
                  <th className="text-right px-4 py-2 font-medium">Actual Amount</th>
                  <th className="w-12 px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {schedule.takedowns.map((takedown, idx) => (
                  <tr key={takedown.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{idx + 1}</td>
                    <td className="px-4 py-3">{formatDate(takedown.scheduledDate)}</td>
                    <td className="px-4 py-3 text-right">{takedown.lots}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(takedown.amount)}</td>
                    <td className="px-4 py-3">{getStatusBadge(takedown.status)}</td>
                    <td className="px-4 py-3">{takedown.actualDate ? formatDate(takedown.actualDate) : '-'}</td>
                    <td className="px-4 py-3 text-right">{takedown.actualAmount ? formatCurrency(takedown.actualAmount) : '-'}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-4 py-2">Total</td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2 text-right">{schedule.totalLots}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(schedule.totalPrice)}</td>
                  <td colSpan={4} className="px-4 py-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Contract Details */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Contract Date</p>
                <p className="font-medium">{schedule.contractDate ? formatDate(schedule.contractDate) : 'Pending'}</p>
              </div>
              <div>
                <p className="text-gray-500">Escalation Rate</p>
                <p className="font-medium">{(schedule.escalation * 100).toFixed(1)}% per period</p>
              </div>
              <div>
                <p className="text-gray-500">Notes</p>
                <p className="font-medium">{schedule.notes || '-'}</p>
              </div>
              <div className="text-right">
                <Button variant="outline" size="sm" className="mr-2">
                  <Edit2 className="w-4 h-4 mr-1" />Edit
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />Documents
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContracts = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Contracts</h2>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowContractModal(true)}>
          <Plus className="w-4 h-4 mr-1" />New Contract
        </Button>
      </div>

      <div className="bg-white border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Contract ID</th>
              <th className="text-left px-4 py-3 font-medium">Buyer</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-right px-4 py-3 font-medium">Units</th>
              <th className="text-right px-4 py-3 font-medium">Contract Price</th>
              <th className="text-left px-4 py-3 font-medium">Contract Date</th>
              <th className="text-left px-4 py-3 font-medium">Close Date</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contracts.map(contract => (
              <tr key={contract.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-emerald-700">{contract.id}</td>
                <td className="px-4 py-3">{contract.buyer}</td>
                <td className="px-4 py-3 capitalize">{contract.type.replace('-', ' ')}</td>
                <td className="px-4 py-3 text-right">{contract.units}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(contract.contractPrice)}</td>
                <td className="px-4 py-3">{formatDate(contract.contractDate)}</td>
                <td className="px-4 py-3">{formatDate(contract.closeDate)}</td>
                <td className="px-4 py-3">{getStatusBadge(contract.status)}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedContract(contract)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettlements = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Settlement Statements</h2>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowSettlementModal(true)}>
          <Plus className="w-4 h-4 mr-1" />Record Settlement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Total Closed</p>
          <p className="text-2xl font-bold">{settlements.filter(s => s.status === 'closed').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Gross Sales</p>
          <p className="text-2xl font-bold">{formatCurrency(settlements.reduce((sum, s) => sum + s.grossSalePrice, 0))}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Net to Seller</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(settlements.reduce((sum, s) => sum + s.netToSeller, 0))}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Closing Costs</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(settlements.reduce((sum, s) => sum + s.sellerDebits.reduce((d, item) => d + item.amount, 0), 0))}</p>
        </div>
      </div>

      {/* Settlement List */}
      <div className="bg-white border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Settlement ID</th>
              <th className="text-left px-4 py-3 font-medium">Buyer</th>
              <th className="text-left px-4 py-3 font-medium">Closing Date</th>
              <th className="text-right px-4 py-3 font-medium">Units</th>
              <th className="text-right px-4 py-3 font-medium">Gross Price</th>
              <th className="text-right px-4 py-3 font-medium">Net to Seller</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {settlements.map(settlement => (
              <tr key={settlement.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-emerald-700">{settlement.id}</td>
                <td className="px-4 py-3">{settlement.buyer}</td>
                <td className="px-4 py-3">{formatDate(settlement.closingDate)}</td>
                <td className="px-4 py-3 text-right">{settlement.lots}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(settlement.grossSalePrice)}</td>
                <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(settlement.netToSeller)}</td>
                <td className="px-4 py-3">{getStatusBadge(settlement.status)}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Settlement Detail View */}
      {settlements.length > 0 && (
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Settlement Statement: {settlements[0].id}</h3>
            <p className="text-sm text-gray-500">Takedown #{settlements[0].takedownNumber} • {settlements[0].buyer}</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-8">
              {/* Closing Info */}
              <div>
                <h4 className="font-medium mb-3 text-gray-700">Closing Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Closing Date</span>
                    <span className="font-medium">{formatDate(settlements[0].closingDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Title Company</span>
                    <span className="font-medium">{settlements[0].titleCompany}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Escrow Number</span>
                    <span className="font-medium">{settlements[0].escrowNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lots Conveyed</span>
                    <span className="font-medium">{settlements[0].lots}</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h4 className="font-medium mb-3 text-gray-700">Financial Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gross Sale Price</span>
                    <span className="font-medium">{formatCurrency(settlements[0].grossSalePrice)}</span>
                  </div>
                  {settlements[0].sellerDebits.map((debit, idx) => (
                    <div key={idx} className="flex justify-between text-red-600">
                      <span>{debit.description}</span>
                      <span>-{formatCurrency(debit.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Net to Seller</span>
                    <span className="text-green-600">{formatCurrency(settlements[0].netToSeller)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settlements[0].fundsReceived ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />Funds Received {formatDate(settlements[0].fundedDate)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 text-sm">
                    <Clock className="w-4 h-4" />Funds Pending
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />Download HUD
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />View Documents
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Disposition Reports</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-6 hover:shadow-md cursor-pointer">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Sales Summary Report</h3>
          <p className="text-sm text-gray-500">Overview of all sales activity, contracts, and closings</p>
        </div>
        <div className="bg-white border rounded-lg p-6 hover:shadow-md cursor-pointer">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Net Proceeds Report</h3>
          <p className="text-sm text-gray-500">Detailed breakdown of gross sales vs net proceeds</p>
        </div>
        <div className="bg-white border rounded-lg p-6 hover:shadow-md cursor-pointer">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Absorption Analysis</h3>
          <p className="text-sm text-gray-500">Sales velocity and projected sellout timeline</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'bulk-schedules':
        return renderBulkSchedules();
      case 'contracts':
        return renderContracts();
      case 'settlements':
        return renderSettlements();
      case 'reports':
        return renderReports();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Disposition</h1>
            <p className="text-sm text-gray-500">{project.name} • {config.label} • {config.salesType}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />Export
            </Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]">
              <Plus className="w-4 h-4 mr-1" />Add Transaction
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {config.tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize",
                activeTab === tab
                  ? "bg-[#047857] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default DispositionPage;
