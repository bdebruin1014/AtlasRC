import React from 'react';
import { MapPin, Phone, Mail, Users, DollarSign, Calendar, Building2 } from 'lucide-react';

export default function OpportunityOverview({ opportunity, opportunityTypes = {} }) {
  const formatPrice = (price) => {
    if (!price) return '-';
    if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`;
    return `$${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="col-span-3 grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">Asking Price</p>
            <p className="text-2xl font-semibold">{formatPrice(opportunity.askingPrice)}</p>
            <p className="text-xs text-gray-500">
              {opportunity.acres ? `$${Math.round(opportunity.askingPrice / parseFloat(opportunity.acres)).toLocaleString()}/acre` : '-'}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">Potential Lots/Units</p>
            <p className="text-2xl font-semibold">{opportunity.potentialLots || opportunity.potentialUnits || '-'}</p>
            <p className="text-xs text-gray-500">
              {opportunity.potentialLots && opportunity.acres 
                ? `${Math.round((parseFloat(opportunity.acres) / opportunity.potentialLots) * 43560).toLocaleString()} SF/lot`
                : '-'}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">DD Deadline</p>
            <p className="text-2xl font-semibold">
              {opportunity.ddDeadline ? new Date(opportunity.ddDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
            </p>
            <p className="text-xs text-amber-600">
              {opportunity.ddDeadline ? `${Math.ceil((new Date(opportunity.ddDeadline) - new Date()) / (1000 * 60 * 60 * 24))} days remaining` : '-'}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">Target Close</p>
            <p className="text-2xl font-semibold">
              {opportunity.closeDate ? new Date(opportunity.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
            </p>
            <p className="text-xs text-gray-500">
              {opportunity.closeDate ? new Date(opportunity.closeDate).getFullYear() : '-'}
            </p>
          </div>
        </div>

        {/* Basic Info & Property Details */}
        <div className="col-span-2 bg-white border rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#047857]" />
            Basic Info & Property Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Opportunity Name</p>
              <p className="font-medium">{opportunity.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Opportunity Type</p>
              <p className="font-medium">{opportunityTypes[opportunity.type] || opportunity.type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="font-medium">{opportunity.address}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">City, State ZIP</p>
              <p className="font-medium">
                {opportunity.city}, {opportunity.state} {opportunity.zip}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">County</p>
              <p className="font-medium">{opportunity.county}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Parcel ID / TMS</p>
              <p className="font-medium">{opportunity.parcelId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Acreage</p>
              <p className="font-medium">{opportunity.acres} acres</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Zoning</p>
              <p className="font-medium">{opportunity.zoning}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Team</p>
              <p className="font-medium">{opportunity.team}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Source</p>
              <p className="font-medium">{opportunity.source}</p>
            </div>
          </div>
          <div className="mt-4 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">Map View</span>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#047857]" />
            Contacts
          </h3>
          <div className="space-y-4">
            {opportunity.seller && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Seller</p>
                <p className="font-medium">{opportunity.seller.name || opportunity.seller}</p>
                {opportunity.seller.phone && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                    <Phone className="w-3 h-3" />
                    {opportunity.seller.phone}
                  </div>
                )}
                {opportunity.seller.email && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                    <Mail className="w-3 h-3" />
                    {opportunity.seller.email}
                  </div>
                )}
              </div>
            )}
            {opportunity.buyer && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Buyer</p>
                <p className="font-medium">{opportunity.buyer.name || opportunity.buyer}</p>
                {opportunity.buyer.email && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                    <Mail className="w-3 h-3" />
                    {opportunity.buyer.email}
                  </div>
                )}
              </div>
            )}
            {opportunity.broker && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Listing Broker</p>
                <p className="font-medium">{opportunity.broker}</p>
                {opportunity.brokerCompany && (
                  <p className="text-sm text-gray-500">{opportunity.brokerCompany}</p>
                )}
                {opportunity.brokerPhone && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-[#047857]">
                    <Phone className="w-3 h-3" />
                    {opportunity.brokerPhone}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Deal Terms (if under contract) */}
        {(opportunity.purchasePrice || opportunity.earnestMoney) && (
          <div className="col-span-3 bg-white border rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#047857]" />
              Deal Terms
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Purchase Price</p>
                <p className="font-medium">{formatPrice(opportunity.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Earnest Money</p>
                <p className="font-medium">{formatPrice(opportunity.earnestMoney)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Due Diligence Deadline</p>
                <p className="font-medium">
                  {opportunity.ddDeadline ? new Date(opportunity.ddDeadline).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Closing Date</p>
                <p className="font-medium">
                  {opportunity.closeDate ? new Date(opportunity.closeDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="col-span-3 bg-white border rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
          <p className="text-sm text-gray-600">{opportunity.notes || 'No notes added yet.'}</p>
        </div>
      </div>
    </div>
  );
}
