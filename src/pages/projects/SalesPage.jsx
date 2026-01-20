import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, DollarSign, Calendar, User, Home, FileText, Download, TrendingUp, TrendingDown, CheckCircle, Clock, AlertTriangle, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SalesPage = ({ projectId }) => {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showClosingModal, setShowClosingModal] = useState(false);

  const [units, setUnits] = useState([
    {
      id: 'UNIT-001',
      unitNumber: '1',
      type: 'Type A - 3BR/2BA',
      sqft: 1800,
      listPrice: 585000,
      status: 'sold',
      buyer: 'James & Emily Rodriguez',
      buyerEmail: 'jrodriguez@email.com',
      buyerPhone: '(555) 111-2222',
      contractPrice: 579000,
      contractDate: '2024-11-15',
      closingDate: '2024-12-20',
      escrowCompany: 'First American Title',
      escrowNumber: 'FA-2024-78542',
      earnestMoney: 15000,
      commissionRate: 5.0,
      commission: 28950,
      netProceeds: 550050,
      agent: 'Sarah Agent',
      notes: 'Smooth transaction, closed on time.',
    },
    {
      id: 'UNIT-002',
      unitNumber: '2',
      type: 'Type A - 3BR/2BA',
      sqft: 1800,
      listPrice: 585000,
      status: 'under-contract',
      buyer: 'Michael & Lisa Chen',
      buyerEmail: 'mchen@email.com',
      buyerPhone: '(555) 345-6789',
      contractPrice: 582000,
      contractDate: '2024-12-18',
      closingDate: '2025-01-25',
      escrowCompany: 'Chicago Title',
      escrowNumber: 'CT-2024-45123',
      earnestMoney: 15000,
      commissionRate: 5.0,
      commission: 29100,
      netProceeds: 552900,
      agent: 'Sarah Agent',
      notes: 'Inspection complete, appraisal scheduled 1/5.',
      contingencies: [
        { name: 'Inspection', status: 'cleared', date: '2024-12-26' },
        { name: 'Appraisal', status: 'pending', date: '2025-01-05' },
        { name: 'Financing', status: 'pending', date: '2025-01-15' },
      ],
    },
    {
      id: 'UNIT-003',
      unitNumber: '3',
      type: 'Type B - 4BR/2.5BA',
      sqft: 2200,
      listPrice: 682000,
      status: 'under-contract',
      buyer: 'Jennifer Martinez',
      buyerEmail: 'jmartinez@email.com',
      buyerPhone: '(555) 234-5678',
      contractPrice: 675000,
      contractDate: '2024-12-22',
      closingDate: '2025-02-01',
      escrowCompany: 'First American Title',
      escrowNumber: 'FA-2024-79201',
      earnestMoney: 20000,
      commissionRate: 5.0,
      commission: 33750,
      netProceeds: 641250,
      agent: 'Sarah Agent',
      notes: 'Buyer waived inspection contingency.',
      contingencies: [
        { name: 'Inspection', status: 'waived', date: '2024-12-22' },
        { name: 'Appraisal', status: 'pending', date: '2025-01-10' },
        { name: 'Financing', status: 'pending', date: '2025-01-20' },
      ],
    },
    {
      id: 'UNIT-004',
      unitNumber: '4',
      type: 'Type B - 4BR/2.5BA',
      sqft: 2200,
      listPrice: 682000,
      status: 'pending',
      buyer: null,
      contractPrice: null,
      notes: 'Offer received, reviewing terms.',
    },
    {
      id: 'UNIT-005',
      unitNumber: '5',
      type: 'Type B - 4BR/2.5BA',
      sqft: 2200,
      listPrice: 689000,
      status: 'available',
      buyer: null,
      contractPrice: null,
      notes: 'Premium lot with mountain view.',
    },
    {
      id: 'UNIT-006',
      unitNumber: '6',
      type: 'Type B - 4BR/2.5BA',
      sqft: 2200,
      listPrice: 682000,
      status: 'available',
      buyer: null,
      contractPrice: null,
      notes: '',
    },
    {
      id: 'UNIT-007',
      unitNumber: '7',
      type: 'Type C - 4BR/3BA',
      sqft: 2600,
      listPrice: 767000,
      status: 'available',
      buyer: null,
      contractPrice: null,
      notes: 'Corner lot, extra large backyard.',
    },
    {
      id: 'UNIT-008',
      unitNumber: '8',
      type: 'Type C - 4BR/3BA',
      sqft: 2600,
      listPrice: 767000,
      status: 'available',
      buyer: null,
      contractPrice: null,
      notes: '',
    },
    {
      id: 'UNIT-009',
      unitNumber: '9',
      type: 'Type C - 4BR/3BA',
      sqft: 2600,
      listPrice: 775000,
      status: 'reserved',
      buyer: 'David Wilson (Reserved)',
      contractPrice: null,
      notes: 'Reserved pending financing approval.',
    },
    {
      id: 'UNIT-010',
      unitNumber: '10',
      type: 'Type C - 4BR/3BA',
      sqft: 2600,
      listPrice: 767000,
      status: 'available',
      buyer: null,
      contractPrice: null,
      notes: '',
    },
    {
      id: 'UNIT-011',
      unitNumber: '11',
      type: 'Type A - 3BR/2BA',
      sqft: 1800,
      listPrice: 589000,
      status: 'available',
      buyer: null,
      contractPrice: null,
      notes: '',
    },
    {
      id: 'UNIT-012',
      unitNumber: '12',
      type: 'Type A - 3BR/2BA',
      sqft: 1800,
      listPrice: 585000,
      status: 'available',
      buyer: null,
      contractPrice: null,
      notes: '',
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'reserved': return 'bg-purple-100 text-purple-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'under-contract': return 'bg-blue-100 text-blue-700';
      case 'sold': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getContingencyIcon = (status) => {
    switch (status) {
      case 'cleared': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'waived': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredUnits = units.filter(unit => {
    if (filterStatus === 'all') return true;
    return unit.status === filterStatus;
  });

  // Summary calculations
  const totalUnits = units.length;
  const soldUnits = units.filter(u => u.status === 'sold');
  const underContract = units.filter(u => u.status === 'under-contract');
  const available = units.filter(u => u.status === 'available' || u.status === 'reserved');
  const totalListPrice = units.reduce((sum, u) => sum + u.listPrice, 0);
  const soldRevenue = soldUnits.reduce((sum, u) => sum + (u.contractPrice || 0), 0);
  const contractedRevenue = underContract.reduce((sum, u) => sum + (u.contractPrice || 0), 0);
  const projectedRevenue = available.reduce((sum, u) => sum + u.listPrice, 0) + soldRevenue + contractedRevenue;
  const absorptionRate = ((soldUnits.length + underContract.length) / totalUnits * 100).toFixed(0);
  const avgDaysOnMarket = 28;

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Sales & Disposition</h1>
          <p className="text-sm text-gray-500">Unit sales tracking and closing management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Units</p>
          <p className="text-2xl font-semibold">{totalUnits}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-gray-500">
          <p className="text-xs text-gray-500">Sold</p>
          <p className="text-2xl font-semibold">{soldUnits.length}</p>
          <p className="text-xs text-green-600">{formatCurrency(soldRevenue)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Under Contract</p>
          <p className="text-2xl font-semibold text-blue-600">{underContract.length}</p>
          <p className="text-xs text-blue-600">{formatCurrency(contractedRevenue)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Available</p>
          <p className="text-2xl font-semibold text-green-600">{available.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Absorption</p>
          <p className="text-2xl font-semibold">{absorptionRate}%</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Projected Revenue</p>
          <p className="text-xl font-semibold">{formatCurrency(projectedRevenue)}</p>
        </div>
      </div>

      {/* Sales Progress */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Sales Progress</span>
          <span className="text-sm text-gray-500">{soldUnits.length + underContract.length} of {totalUnits} units</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-gray-500" 
            style={{ width: `${(soldUnits.length / totalUnits) * 100}%` }}
            title={`Sold: ${soldUnits.length}`}
          ></div>
          <div 
            className="h-full bg-blue-500" 
            style={{ width: `${(underContract.length / totalUnits) * 100}%` }}
            title={`Under Contract: ${underContract.length}`}
          ></div>
          <div 
            className="h-full bg-amber-400" 
            style={{ width: `${(units.filter(u => u.status === 'pending' || u.status === 'reserved').length / totalUnits) * 100}%` }}
            title="Pending/Reserved"
          ></div>
        </div>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-500 rounded"></div>Sold</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded"></div>Under Contract</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 rounded"></div>Pending/Reserved</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 rounded"></div>Available</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search units..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="pending">Pending</option>
            <option value="under-contract">Under Contract</option>
            <option value="sold">Sold</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Types</option>
            <option>Type A - 3BR/2BA</option>
            <option>Type B - 4BR/2.5BA</option>
            <option>Type C - 4BR/3BA</option>
          </select>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Unit</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-right px-4 py-3 font-medium">Sq Ft</th>
              <th className="text-right px-4 py-3 font-medium">List Price</th>
              <th className="text-right px-4 py-3 font-medium">Contract Price</th>
              <th className="text-left px-4 py-3 font-medium">Buyer</th>
              <th className="text-left px-4 py-3 font-medium">Closing Date</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUnits.map((unit) => (
              <tr key={unit.id} className={cn("hover:bg-gray-50", unit.status === 'sold' && "bg-gray-50")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Unit {unit.unitNumber}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{unit.type}</td>
                <td className="px-4 py-3 text-right">{unit.sqft.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">${unit.listPrice.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  {unit.contractPrice ? (
                    <div>
                      <span className="font-medium">${unit.contractPrice.toLocaleString()}</span>
                      {unit.contractPrice !== unit.listPrice && (
                        <span className={cn("text-xs ml-1", unit.contractPrice > unit.listPrice ? "text-green-600" : "text-red-600")}>
                          ({unit.contractPrice > unit.listPrice ? '+' : ''}{(((unit.contractPrice - unit.listPrice) / unit.listPrice) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-xs">{unit.buyer || '-'}</td>
                <td className="px-4 py-3 text-xs">{unit.closingDate || '-'}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(unit.status))}>
                    {unit.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedUnit(unit)}>
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Revenue Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total List Price</span>
              <span className="font-medium">{formatCurrency(totalListPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sold Revenue</span>
              <span className="font-medium text-green-600">{formatCurrency(soldRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Contracted Revenue</span>
              <span className="font-medium text-blue-600">{formatCurrency(contractedRevenue)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-500">Remaining Inventory</span>
              <span className="font-medium">{formatCurrency(projectedRevenue - soldRevenue - contractedRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Pending Closings</h3>
          <div className="space-y-3">
            {underContract.map(unit => (
              <div key={unit.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <div>
                  <p className="font-medium text-sm">Unit {unit.unitNumber}</p>
                  <p className="text-xs text-gray-500">{unit.buyer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{unit.closingDate}</p>
                  <p className="text-xs text-blue-600">${unit.contractPrice?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Sales Metrics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Avg Days on Market</span>
              <span className="font-medium">{avgDaysOnMarket} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Avg Sale Price</span>
              <span className="font-medium">{formatCurrency(soldRevenue / (soldUnits.length || 1))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">List to Sale Ratio</span>
              <span className="font-medium">98.9%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Absorption Rate</span>
              <span className="font-medium">{absorptionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Detail Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">Unit {selectedUnit.unitNumber}</h3>
                <p className="text-sm text-gray-500">{selectedUnit.type}</p>
              </div>
              <button onClick={() => setSelectedUnit(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedUnit.status))}>
                  {selectedUnit.status.replace('-', ' ')}
                </span>
              </div>

              {/* Unit Details */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Square Feet</p>
                  <p className="font-medium">{selectedUnit.sqft.toLocaleString()} sf</p>
                </div>
                <div>
                  <p className="text-gray-500">List Price</p>
                  <p className="font-medium">${selectedUnit.listPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Price/SF</p>
                  <p className="font-medium">${(selectedUnit.listPrice / selectedUnit.sqft).toFixed(0)}</p>
                </div>
              </div>

              {/* Buyer & Transaction Info */}
              {selectedUnit.buyer && selectedUnit.status !== 'available' && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Buyer Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Buyer</p>
                        <p className="font-medium">{selectedUnit.buyer}</p>
                      </div>
                      {selectedUnit.buyerEmail && (
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium">{selectedUnit.buyerEmail}</p>
                        </div>
                      )}
                      {selectedUnit.buyerPhone && (
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="font-medium">{selectedUnit.buyerPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedUnit.contractPrice && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Transaction Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Contract Price</p>
                          <p className="font-medium">${selectedUnit.contractPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Contract Date</p>
                          <p className="font-medium">{selectedUnit.contractDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Closing Date</p>
                          <p className="font-medium">{selectedUnit.closingDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Earnest Money</p>
                          <p className="font-medium">${selectedUnit.earnestMoney?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Escrow Company</p>
                          <p className="font-medium">{selectedUnit.escrowCompany}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Escrow #</p>
                          <p className="font-medium">{selectedUnit.escrowNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contingencies */}
                  {selectedUnit.contingencies && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Contingencies</h4>
                      <div className="space-y-2">
                        {selectedUnit.contingencies.map((cont, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              {getContingencyIcon(cont.status)}
                              <span className="text-sm">{cont.name}</span>
                            </div>
                            <div className="text-right">
                              <span className={cn("text-xs capitalize", cont.status === 'cleared' || cont.status === 'waived' ? "text-green-600" : "text-amber-600")}>
                                {cont.status}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">{cont.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financials */}
                  {selectedUnit.commission && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Financial Summary</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Contract Price</span>
                          <span>${selectedUnit.contractPrice?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Commission ({selectedUnit.commissionRate}%)</span>
                          <span className="text-red-600">-${selectedUnit.commission?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-semibold">
                          <span>Net Proceeds</span>
                          <span className="text-green-600">${selectedUnit.netProceeds?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Notes */}
              {selectedUnit.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedUnit.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setSelectedUnit(null)}>Close</Button>
              {selectedUnit.status === 'under-contract' && (
                <Button className="bg-[#047857] hover:bg-[#065f46]">Record Closing</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
