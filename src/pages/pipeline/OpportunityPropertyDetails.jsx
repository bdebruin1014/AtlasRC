import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OpportunityPropertyDetails({ opportunity }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
        <Button variant="outline">Edit Details</Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Location */}
        <div className="col-span-2 bg-white border rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Location Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="font-medium">{opportunity.address}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">City</p>
              <p className="font-medium">{opportunity.city}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">State</p>
              <p className="font-medium">{opportunity.state}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ZIP Code</p>
              <p className="font-medium">{opportunity.zip}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">County</p>
              <p className="font-medium">{opportunity.county}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">APN/Parcel ID</p>
              <p className="font-medium">{opportunity.parcelId}</p>
            </div>
          </div>

          <div className="mt-6 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-3" />
              <span className="text-sm">Interactive Map View</span>
              <p className="text-xs mt-1">Google Maps Integration Coming</p>
            </div>
          </div>
        </div>

        {/* Quick Facts */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Quick Facts</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Total Acres</p>
              <p className="font-medium">{opportunity.acres}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Zoning</p>
              <p className="font-medium">{opportunity.zoning}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Potential Units</p>
              <p className="font-medium">{opportunity.potentialUnits}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Asking Price</p>
              <p className="font-medium text-lg">
                ${opportunity.askingPrice.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Price per Acre</p>
              <p className="font-medium">
                ${(opportunity.askingPrice / opportunity.acres).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="col-span-3 bg-white border rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Additional Property Details</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Utilities</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">Water: At Street</p>
                <p className="text-gray-600">Sewer: At Street</p>
                <p className="text-gray-600">Electric: Available</p>
                <p className="text-gray-600">Gas: Not Available</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Environmental</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">Flood Zone: X (Minimal)</p>
                <p className="text-gray-600">Wetlands: None Identified</p>
                <p className="text-gray-600">Topography: Gently Sloping</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Access</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">Road Frontage: 800 ft</p>
                <p className="text-gray-600">Access Type: Paved Road</p>
                <p className="text-gray-600">Easements: None</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
