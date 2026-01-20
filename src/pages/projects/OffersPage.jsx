import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit2, X, FileText, Clock, CheckCircle, XCircle, AlertTriangle, DollarSign, Calendar, User, Building2, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const OffersPage = ({ projectId }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [offerType, setOfferType] = useState('received'); // 'received' or 'submitted'

  const [offers, setOffers] = useState([
    // Received offers (for selling)
    { id: 'OFF-001', type: 'received', date: '2024-12-20', buyer: 'ABC Investments LLC', contact: 'John Smith', amount: 2650000, listPrice: 2500000, variance: 6, earnestMoney: 50000, dueDiligenceDays: 30, closingDays: 45, financing: 'Cash', contingencies: ['Inspection', 'Title'], status: 'pending', expiresAt: '2024-12-28', notes: 'Strong buyer, pre-approved' },
    { id: 'OFF-002', type: 'received', date: '2024-12-18', buyer: 'Smith Family Trust', contact: 'Robert Smith', amount: 2400000, listPrice: 2500000, variance: -4, earnestMoney: 25000, dueDiligenceDays: 45, closingDays: 60, financing: 'Conventional', contingencies: ['Inspection', 'Appraisal', 'Financing'], status: 'countered', expiresAt: '2024-12-25', notes: 'Countered at $2.5M' },
    { id: 'OFF-003', type: 'received', date: '2024-12-15', buyer: 'Quick Close Homes', contact: 'Mike Johnson', amount: 2300000, listPrice: 2500000, variance: -8, earnestMoney: 100000, dueDiligenceDays: 14, closingDays: 21, financing: 'Cash', contingencies: ['Inspection'], status: 'rejected', expiresAt: '2024-12-20', notes: 'Price too low' },
    { id: 'OFF-004', type: 'received', date: '2024-12-10', buyer: 'Denver RE Partners', contact: 'Sarah Williams', amount: 2550000, listPrice: 2500000, variance: 2, earnestMoney: 75000, dueDiligenceDays: 21, closingDays: 30, financing: 'Cash', contingencies: ['Inspection'], status: 'accepted', expiresAt: '2024-12-15', notes: 'Accepted - in escrow' },
    // Submitted offers (for buying)
    { id: 'OFF-005', type: 'submitted', date: '2024-12-22', seller: 'Mountain View Land LLC', property: '123 Highland Ave', amount: 1850000, askingPrice: 2000000, variance: -7.5, earnestMoney: 50000, dueDiligenceDays: 45, closingDays: 60, financing: 'Construction Loan', contingencies: ['Inspection', 'Entitlements', 'Financing'], status: 'pending', expiresAt: '2024-12-30', notes: 'Initial offer submitted' },
    { id: 'OFF-006', type: 'submitted', date: '2024-12-15', seller: 'Parker Holdings', property: '456 Valley Rd', amount: 3200000, askingPrice: 3500000, variance: -8.6, earnestMoney: 100000, dueDiligenceDays: 60, closingDays: 90, financing: 'Bridge Loan', contingencies: ['Inspection', 'Zoning', 'Environmental'], status: 'countered', expiresAt: '2024-12-22', notes: 'Counter received at $3.35M' },
  ]);

  const [formData, setFormData] = useState({
    type: 'received',
    date: new Date().toISOString().split('T')[0],
    buyerSeller: '',
    contact: '',
    property: '',
    amount: '',
    listAskPrice: '',
    earnestMoney: '',
    dueDiligenceDays: '30',
    closingDays: '45',
    financing: 'Cash',
    contingencies: [],
    expiresAt: '',
    notes: '',
  });

  const filteredOffers = offers.filter(o => {
    if (o.type !== offerType) return false;
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'countered': return 'bg-amber-100 text-amber-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'expired': return 'bg-gray-100 text-gray-700';
      case 'withdrawn': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'countered': return <MessageSquare className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const pendingOffers = offers.filter(o => o.type === offerType && o.status === 'pending').length;
  const totalValue = offers.filter(o => o.type === offerType && (o.status === 'pending' || o.status === 'countered')).reduce((s, o) => s + o.amount, 0);
  const acceptedOffers = offers.filter(o => o.type === offerType && o.status === 'accepted').length;

  const handleSave = () => {
    const newOffer = {
      id: `OFF-${String(offers.length + 1).padStart(3, '0')}`,
      type: formData.type,
      date: formData.date,
      buyer: formData.type === 'received' ? formData.buyerSeller : undefined,
      seller: formData.type === 'submitted' ? formData.buyerSeller : undefined,
      property: formData.type === 'submitted' ? formData.property : undefined,
      contact: formData.contact,
      amount: parseFloat(formData.amount) || 0,
      listPrice: formData.type === 'received' ? parseFloat(formData.listAskPrice) || 0 : undefined,
      askingPrice: formData.type === 'submitted' ? parseFloat(formData.listAskPrice) || 0 : undefined,
      variance: 0,
      earnestMoney: parseFloat(formData.earnestMoney) || 0,
      dueDiligenceDays: parseInt(formData.dueDiligenceDays) || 30,
      closingDays: parseInt(formData.closingDays) || 45,
      financing: formData.financing,
      contingencies: formData.contingencies,
      status: 'pending',
      expiresAt: formData.expiresAt,
      notes: formData.notes,
    };
    setOffers(prev => [newOffer, ...prev]);
    setShowModal(false);
    setFormData({ type: 'received', date: new Date().toISOString().split('T')[0], buyerSeller: '', contact: '', property: '', amount: '', listAskPrice: '', earnestMoney: '', dueDiligenceDays: '30', closingDays: '45', financing: 'Cash', contingencies: [], expiresAt: '', notes: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Offers</h1>
          <p className="text-sm text-gray-500">Track purchase and sale offers</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-1" />New Offer
        </Button>
      </div>

      {/* Offer Type Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setOfferType('received')}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", offerType === 'received' ? "bg-[#047857] text-white" : "bg-white border text-gray-600 hover:bg-gray-50")}
        >
          <ArrowDown className="w-4 h-4 inline mr-2" />Offers Received
        </button>
        <button
          onClick={() => setOfferType('submitted')}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", offerType === 'submitted' ? "bg-[#047857] text-white" : "bg-white border text-gray-600 hover:bg-gray-50")}
        >
          <ArrowUp className="w-4 h-4 inline mr-2" />Offers Submitted
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Pending Offers</p>
          <p className="text-2xl font-semibold">{pendingOffers}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Value (Active)</p>
          <p className="text-2xl font-semibold">${(totalValue / 1000000).toFixed(2)}M</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Accepted</p>
          <p className="text-2xl font-semibold text-green-600">{acceptedOffers}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Avg Days to Close</p>
          <p className="text-2xl font-semibold">42</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search offers..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="countered">Countered</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Offer #</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">{offerType === 'received' ? 'Buyer' : 'Seller/Property'}</th>
              <th className="text-right px-4 py-3 font-medium">Offer Amount</th>
              <th className="text-right px-4 py-3 font-medium">Variance</th>
              <th className="text-right px-4 py-3 font-medium">Earnest $</th>
              <th className="text-left px-4 py-3 font-medium">Financing</th>
              <th className="text-left px-4 py-3 font-medium">Timeline</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOffers.map((offer) => (
              <tr key={offer.id} className={cn("hover:bg-gray-50", offer.status === 'pending' && new Date(offer.expiresAt) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && "bg-amber-50")}>
                <td className="px-4 py-3">
                  <span className="font-medium text-[#047857]">{offer.id}</span>
                </td>
                <td className="px-4 py-3">{offer.date}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{offer.buyer || offer.seller}</p>
                    {offer.property && <p className="text-xs text-gray-500">{offer.property}</p>}
                    {offer.contact && <p className="text-xs text-gray-500">{offer.contact}</p>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold">${offer.amount.toLocaleString()}</td>
                <td className={cn("px-4 py-3 text-right font-medium", offer.variance > 0 ? "text-green-600" : offer.variance < 0 ? "text-red-600" : "")}>
                  {offer.variance > 0 ? '+' : ''}{offer.variance}%
                </td>
                <td className="px-4 py-3 text-right">${offer.earnestMoney.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs", offer.financing === 'Cash' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}>
                    {offer.financing}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <div>DD: {offer.dueDiligenceDays}d</div>
                  <div>Close: {offer.closingDays}d</div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded text-xs capitalize flex items-center gap-1 w-fit", getStatusColor(offer.status))}>
                    {getStatusIcon(offer.status)}
                    {offer.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded" title="View" onClick={() => setSelectedOffer(offer)}>
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    {offer.status === 'pending' && (
                      <>
                        <button className="p-1 hover:bg-green-100 rounded" title="Accept">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </button>
                        <button className="p-1 hover:bg-amber-100 rounded" title="Counter">
                          <MessageSquare className="w-4 h-4 text-amber-500" />
                        </button>
                        <button className="p-1 hover:bg-red-100 rounded" title="Reject">
                          <XCircle className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Offer</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, type: 'received' }))}
                  className={cn("flex-1 p-3 rounded-lg border text-center", formData.type === 'received' ? "border-[#047857] bg-green-50" : "")}
                >
                  <ArrowDown className="w-5 h-5 mx-auto mb-1" />
                  <p className="font-medium">Offer Received</p>
                  <p className="text-xs text-gray-500">Someone wants to buy</p>
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, type: 'submitted' }))}
                  className={cn("flex-1 p-3 rounded-lg border text-center", formData.type === 'submitted' ? "border-[#047857] bg-green-50" : "")}
                >
                  <ArrowUp className="w-5 h-5 mx-auto mb-1" />
                  <p className="font-medium">Offer Submitted</p>
                  <p className="text-xs text-gray-500">We want to buy</p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">{formData.type === 'received' ? 'Buyer Name' : 'Seller Name'} *</label>
                  <Input value={formData.buyerSeller} onChange={(e) => setFormData(prev => ({ ...prev, buyerSeller: e.target.value }))} placeholder={formData.type === 'received' ? 'Buyer company or name' : 'Seller company or name'} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Contact Name</label>
                  <Input value={formData.contact} onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))} placeholder="Primary contact" />
                </div>
              </div>

              {formData.type === 'submitted' && (
                <div>
                  <label className="text-sm font-medium block mb-1">Property Address *</label>
                  <Input value={formData.property} onChange={(e) => setFormData(prev => ({ ...prev, property: e.target.value }))} placeholder="Property address" />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Offer Date *</label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Offer Amount *</label>
                  <Input type="number" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{formData.type === 'received' ? 'List Price' : 'Asking Price'}</label>
                  <Input type="number" value={formData.listAskPrice} onChange={(e) => setFormData(prev => ({ ...prev, listAskPrice: e.target.value }))} placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Earnest Money *</label>
                  <Input type="number" value={formData.earnestMoney} onChange={(e) => setFormData(prev => ({ ...prev, earnestMoney: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Due Diligence (Days)</label>
                  <Input type="number" value={formData.dueDiligenceDays} onChange={(e) => setFormData(prev => ({ ...prev, dueDiligenceDays: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Days to Close</label>
                  <Input type="number" value={formData.closingDays} onChange={(e) => setFormData(prev => ({ ...prev, closingDays: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Financing Type *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={formData.financing} onChange={(e) => setFormData(prev => ({ ...prev, financing: e.target.value }))}>
                    <option>Cash</option>
                    <option>Conventional</option>
                    <option>Construction Loan</option>
                    <option>Bridge Loan</option>
                    <option>Hard Money</option>
                    <option>Seller Financing</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Offer Expires</label>
                  <Input type="date" value={formData.expiresAt} onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Contingencies</label>
                <div className="flex flex-wrap gap-2">
                  {['Inspection', 'Appraisal', 'Financing', 'Title', 'Survey', 'Environmental', 'Zoning', 'Entitlements'].map(cont => (
                    <label key={cont} className={cn("px-3 py-1.5 rounded-full border text-sm cursor-pointer", formData.contingencies.includes(cont) ? "bg-[#047857] text-white border-[#047857]" : "hover:bg-gray-50")}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.contingencies.includes(cont)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, contingencies: [...prev.contingencies, cont] }));
                          } else {
                            setFormData(prev => ({ ...prev, contingencies: prev.contingencies.filter(c => c !== cont) }));
                          }
                        }}
                      />
                      {cont}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes about this offer..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>Save Offer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Offer Details - {selectedOffer.id}</h3>
              <button onClick={() => setSelectedOffer(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className={cn("px-3 py-1 rounded text-sm capitalize flex items-center gap-1", getStatusColor(selectedOffer.status))}>
                  {getStatusIcon(selectedOffer.status)}
                  {selectedOffer.status}
                </span>
                <span className="text-sm text-gray-500">Expires: {selectedOffer.expiresAt}</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">{selectedOffer.type === 'received' ? 'Buyer' : 'Seller'}</p>
                <p className="font-semibold text-lg">{selectedOffer.buyer || selectedOffer.seller}</p>
                {selectedOffer.contact && <p className="text-sm text-gray-600">{selectedOffer.contact}</p>}
                {selectedOffer.property && <p className="text-sm text-gray-600">{selectedOffer.property}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Offer Amount</p>
                  <p className="text-2xl font-semibold text-green-700">${selectedOffer.amount.toLocaleString()}</p>
                  <p className={cn("text-sm", selectedOffer.variance > 0 ? "text-green-600" : "text-red-600")}>
                    {selectedOffer.variance > 0 ? '+' : ''}{selectedOffer.variance}% vs {selectedOffer.type === 'received' ? 'list' : 'ask'}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Earnest Money</p>
                  <p className="text-2xl font-semibold text-blue-700">${selectedOffer.earnestMoney.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{((selectedOffer.earnestMoney / selectedOffer.amount) * 100).toFixed(1)}% of offer</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Financing</p>
                  <p className="font-medium">{selectedOffer.financing}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Diligence</p>
                  <p className="font-medium">{selectedOffer.dueDiligenceDays} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Close</p>
                  <p className="font-medium">{selectedOffer.closingDays} days</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Contingencies</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOffer.contingencies.map(c => (
                    <span key={c} className="px-2 py-1 bg-gray-100 rounded text-sm">{c}</span>
                  ))}
                </div>
              </div>

              {selectedOffer.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedOffer.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setSelectedOffer(null)}>Close</Button>
              {selectedOffer.status === 'pending' && (
                <>
                  <Button variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-50">Counter</Button>
                  <Button className="bg-[#047857] hover:bg-[#065f46]">Accept Offer</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersPage;
