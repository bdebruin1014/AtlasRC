import React, { useState } from 'react';
import { FileText, DollarSign, Calendar, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Edit2, Send, Download, Eye, ChevronDown, ChevronRight, User, Building2, MessageSquare, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const OfferManagementPage = () => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewOffer, setShowNewOffer] = useState(false);

  const opportunityInfo = {
    name: 'Sunset Ridge Phase 3',
    askingPrice: 2850000,
    property: '45.2 acres, New Braunfels, TX',
    seller: 'Sunset Land Holdings LLC',
    sellerAgent: 'Marcus Thompson, RE/MAX',
  };

  const offers = [
    {
      id: 'offer-1',
      version: 3,
      status: 'active',
      offerPrice: 2750000,
      earnestMoney: 50000,
      dueDiligenceDays: 45,
      closingDays: 90,
      contingencies: ['Financing', 'Due Diligence', 'Survey'],
      submittedDate: '2024-12-20',
      expirationDate: '2024-12-28',
      submittedBy: 'John Smith',
      sellerResponse: 'counter',
      counterPrice: 2800000,
      counterTerms: 'Reduce DD period to 30 days',
      notes: 'Seller motivated but wants higher price',
      timeline: [
        { date: '2024-12-20 09:00', action: 'Offer submitted', user: 'John Smith' },
        { date: '2024-12-21 14:30', action: 'Seller received offer', user: 'System' },
        { date: '2024-12-22 11:00', action: 'Counter offer received', user: 'Marcus Thompson' },
        { date: '2024-12-23 16:00', action: 'Internal review completed', user: 'Sarah Johnson' },
      ],
    },
    {
      id: 'offer-2',
      version: 2,
      status: 'countered',
      offerPrice: 2700000,
      earnestMoney: 45000,
      dueDiligenceDays: 60,
      closingDays: 120,
      contingencies: ['Financing', 'Due Diligence', 'Environmental', 'Survey'],
      submittedDate: '2024-12-15',
      expirationDate: '2024-12-20',
      submittedBy: 'John Smith',
      sellerResponse: 'counter',
      counterPrice: 2825000,
      counterTerms: 'Remove environmental contingency, reduce DD to 45 days',
      notes: 'Previous counter - led to version 3',
      timeline: [
        { date: '2024-12-15 10:00', action: 'Offer submitted', user: 'John Smith' },
        { date: '2024-12-16 09:00', action: 'Seller received offer', user: 'System' },
        { date: '2024-12-18 15:00', action: 'Counter offer received', user: 'Marcus Thompson' },
      ],
    },
    {
      id: 'offer-3',
      version: 1,
      status: 'rejected',
      offerPrice: 2500000,
      earnestMoney: 40000,
      dueDiligenceDays: 90,
      closingDays: 150,
      contingencies: ['Financing', 'Due Diligence', 'Environmental', 'Survey', 'Zoning'],
      submittedDate: '2024-12-05',
      expirationDate: '2024-12-10',
      submittedBy: 'John Smith',
      sellerResponse: 'rejected',
      notes: 'Initial offer rejected - price too low',
      timeline: [
        { date: '2024-12-05 11:00', action: 'Offer submitted', user: 'John Smith' },
        { date: '2024-12-06 10:00', action: 'Seller received offer', user: 'System' },
        { date: '2024-12-08 14:00', action: 'Offer rejected', user: 'Marcus Thompson' },
      ],
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" />Active</span>;
      case 'accepted':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" />Accepted</span>;
      case 'countered':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium flex items-center gap-1"><RefreshCw className="w-3 h-3" />Countered</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3" />Rejected</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Expired</span>;
      default:
        return null;
    }
  };

  const filteredOffers = offers.filter(o => filterStatus === 'all' || o.status === filterStatus);
  const activeOffer = offers.find(o => o.status === 'active');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Offer Management</h1>
            <p className="text-sm text-gray-500">{opportunityInfo.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export History</Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowNewOffer(true)}>
              <Plus className="w-4 h-4 mr-1" />New Offer
            </Button>
          </div>
        </div>

        {/* Property & Seller Info */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Asking Price</p>
            <p className="text-xl font-bold text-blue-700">${(opportunityInfo.askingPrice / 1000000).toFixed(2)}M</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Current Offer</p>
            <p className="text-xl font-bold text-green-700">${activeOffer ? (activeOffer.offerPrice / 1000000).toFixed(2) : '-'}M</p>
            {activeOffer && (
              <p className="text-xs text-gray-500">{((1 - activeOffer.offerPrice / opportunityInfo.askingPrice) * 100).toFixed(1)}% below ask</p>
            )}
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Counter Offer</p>
            <p className="text-xl font-bold text-amber-700">${activeOffer?.counterPrice ? (activeOffer.counterPrice / 1000000).toFixed(2) : '-'}M</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Seller</p>
            <p className="text-sm font-medium">{opportunityInfo.seller}</p>
            <p className="text-xs text-gray-500">{opportunityInfo.sellerAgent}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-4">
        <span className="text-sm text-gray-600">Filter:</span>
        <div className="flex gap-1">
          {['all', 'active', 'countered', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-3 py-1 rounded text-sm capitalize",
                filterStatus === status ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Offers List */}
        <div className="w-96 border-r bg-white overflow-y-auto">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-medium text-sm">Offer History ({filteredOffers.length})</h3>
          </div>
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              onClick={() => setSelectedOffer(offer)}
              className={cn(
                "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                selectedOffer?.id === offer.id && "bg-green-50 border-l-4 border-l-[#047857]"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Version {offer.version}</span>
                    {getStatusBadge(offer.status)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Submitted: {offer.submittedDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${(offer.offerPrice / 1000000).toFixed(2)}M</p>
                  {offer.counterPrice && (
                    <p className="text-xs text-amber-600">Counter: ${(offer.counterPrice / 1000000).toFixed(2)}M</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{offer.dueDiligenceDays}d DD</span>
                <span>{offer.closingDays}d Close</span>
                <span>${(offer.earnestMoney / 1000).toFixed(0)}K EM</span>
              </div>
            </div>
          ))}
        </div>

        {/* Offer Detail */}
        {selectedOffer ? (
          <div className="flex-1 overflow-y-auto">
            {/* Offer Header */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Offer Version {selectedOffer.version}</h2>
                    {getStatusBadge(selectedOffer.status)}
                  </div>
                  <p className="text-sm text-gray-500">Submitted by {selectedOffer.submittedBy} on {selectedOffer.submittedDate}</p>
                </div>
                <div className="flex gap-2">
                  {selectedOffer.status === 'active' && (
                    <>
                      <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1" />Revise</Button>
                      <Button variant="outline" size="sm" className="text-red-600">Withdraw</Button>
                      <Button className="bg-green-600 hover:bg-green-700" size="sm">Accept Counter</Button>
                    </>
                  )}
                </div>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Our Offer</p>
                  <p className="text-2xl font-bold text-blue-700">${(selectedOffer.offerPrice / 1000000).toFixed(2)}M</p>
                </div>
                {selectedOffer.counterPrice && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Seller Counter</p>
                    <p className="text-2xl font-bold text-amber-700">${(selectedOffer.counterPrice / 1000000).toFixed(2)}M</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Gap</p>
                  <p className="text-2xl font-bold text-gray-700">
                    ${selectedOffer.counterPrice ? ((selectedOffer.counterPrice - selectedOffer.offerPrice) / 1000).toFixed(0) : '-'}K
                  </p>
                </div>
              </div>
            </div>

            {/* Offer Details */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Our Terms */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-blue-700">Our Offer Terms</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Purchase Price</span>
                      <span className="font-medium">${selectedOffer.offerPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Earnest Money</span>
                      <span className="font-medium">${selectedOffer.earnestMoney.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Due Diligence Period</span>
                      <span className="font-medium">{selectedOffer.dueDiligenceDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Closing Period</span>
                      <span className="font-medium">{selectedOffer.closingDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expiration</span>
                      <span className="font-medium">{selectedOffer.expirationDate}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-gray-500 mb-1">Contingencies:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedOffer.contingencies.map((c, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Counter Terms */}
                {selectedOffer.counterPrice && (
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-amber-700">Seller Counter Terms</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Counter Price</span>
                        <span className="font-medium">${selectedOffer.counterPrice.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-gray-500 mb-1">Counter Terms:</p>
                        <p className="text-amber-700 font-medium">{selectedOffer.counterTerms}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedOffer.notes && (
                <div className="bg-white border rounded-lg p-4 mb-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />Notes
                  </h3>
                  <p className="text-sm text-gray-600">{selectedOffer.notes}</p>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  {selectedOffer.timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        {idx < selectedOffer.timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{event.action}</p>
                          <p className="text-xs text-gray-500">{event.date}</p>
                        </div>
                        <p className="text-xs text-gray-500">By {event.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select an offer to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferManagementPage;
