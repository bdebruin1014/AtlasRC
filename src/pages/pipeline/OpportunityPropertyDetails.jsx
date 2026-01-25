import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Edit2, ExternalLink, Navigation, Maximize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

export default function OpportunityPropertyDetails({ opportunity, onUpdate }) {
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [editData, setEditData] = useState({});

  // Format address for map
  const fullAddress = useMemo(() => {
    const parts = [
      opportunity?.address,
      opportunity?.city,
      opportunity?.state,
      opportunity?.zip || opportunity?.zip_code,
    ].filter(Boolean);
    return parts.join(', ');
  }, [opportunity]);

  // Generate map URL
  const mapUrl = useMemo(() => {
    if (!fullAddress) return null;
    const encodedAddress = encodeURIComponent(fullAddress);
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}&zoom=15&maptype=satellite`;
  }, [fullAddress]);

  // External links
  const googleMapsLink = useMemo(() => {
    if (!fullAddress) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  }, [fullAddress]);

  const streetViewLink = useMemo(() => {
    if (!fullAddress) return null;
    return `https://www.google.com/maps/@?api=1&map_action=pano&query=${encodeURIComponent(fullAddress)}`;
  }, [fullAddress]);

  const handleEdit = () => {
    setEditData({
      address: opportunity?.address || '',
      city: opportunity?.city || '',
      state: opportunity?.state || '',
      zip_code: opportunity?.zip || opportunity?.zip_code || '',
      county: opportunity?.county || '',
      parcel_id: opportunity?.parcelId || opportunity?.parcel_id || '',
      acres: opportunity?.acres || '',
      zoning: opportunity?.zoning || '',
      potential_lots: opportunity?.potentialUnits || opportunity?.potential_lots || '',
    });
    setShowEditDialog(true);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editData);
    }
    setShowEditDialog(false);
    toast({ title: 'Details Updated', description: 'Property details have been saved.' });
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const askingPrice = opportunity?.askingPrice || opportunity?.asking_price || 0;
  const acres = opportunity?.acres || 1;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
        <Button variant="outline" onClick={handleEdit}>
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Details
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Location with Map */}
        <div className="col-span-2 bg-white border rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Location Information</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="font-medium">{opportunity?.address || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">City</p>
              <p className="font-medium">{opportunity?.city || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">State</p>
              <p className="font-medium">{opportunity?.state || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ZIP Code</p>
              <p className="font-medium">{opportunity?.zip || opportunity?.zip_code || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">County</p>
              <p className="font-medium">{opportunity?.county || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">APN/Parcel ID</p>
              <p className="font-medium">{opportunity?.parcelId || opportunity?.parcel_id || '—'}</p>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
            {mapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading map...</span>
              </div>
            )}
            {fullAddress ? (
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setMapLoading(false)}
                className={mapLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-3" />
                  <span className="text-sm">No address available for map</span>
                </div>
              </div>
            )}

            {/* Map Actions */}
            {fullAddress && (
              <div className="absolute bottom-2 right-2 flex gap-2">
                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/90 hover:bg-white text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1 shadow-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in Maps
                </a>
                <a
                  href={streetViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/90 hover:bg-white text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1 shadow-sm"
                >
                  <Navigation className="w-3 h-3" />
                  Street View
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Quick Facts */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Quick Facts</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Total Acres</p>
              <p className="font-medium">{opportunity?.acres || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Zoning</p>
              <p className="font-medium">{opportunity?.zoning || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Potential Units</p>
              <p className="font-medium">{opportunity?.potentialUnits || opportunity?.potential_lots || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Asking Price</p>
              <p className="font-medium text-lg">{formatCurrency(askingPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Price per Acre</p>
              <p className="font-medium">
                {askingPrice && acres ? formatCurrency(askingPrice / acres) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Price per Unit</p>
              <p className="font-medium">
                {askingPrice && (opportunity?.potentialUnits || opportunity?.potential_lots)
                  ? formatCurrency(askingPrice / (opportunity?.potentialUnits || opportunity?.potential_lots))
                  : '—'}
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
                <p className="text-gray-600">Water: {opportunity?.water_utility || 'Unknown'}</p>
                <p className="text-gray-600">Sewer: {opportunity?.sewer_utility || 'Unknown'}</p>
                <p className="text-gray-600">Electric: {opportunity?.electric_utility || 'Available'}</p>
                <p className="text-gray-600">Gas: {opportunity?.gas_utility || 'Unknown'}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Environmental</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">Flood Zone: {opportunity?.flood_zone || 'Unknown'}</p>
                <p className="text-gray-600">Wetlands: {opportunity?.wetlands || 'Unknown'}</p>
                <p className="text-gray-600">Topography: {opportunity?.topography || 'Unknown'}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Access</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">Road Frontage: {opportunity?.road_frontage || 'Unknown'}</p>
                <p className="text-gray-600">Access Type: {opportunity?.access_type || 'Unknown'}</p>
                <p className="text-gray-600">Easements: {opportunity?.easements || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Property Details</DialogTitle>
            <DialogDescription>Update the property location and details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Address</Label>
              <Input
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={editData.city}
                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                value={editData.state}
                onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>ZIP Code</Label>
              <Input
                value={editData.zip_code}
                onChange={(e) => setEditData({ ...editData, zip_code: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>County</Label>
              <Input
                value={editData.county}
                onChange={(e) => setEditData({ ...editData, county: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Parcel ID</Label>
              <Input
                value={editData.parcel_id}
                onChange={(e) => setEditData({ ...editData, parcel_id: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Acres</Label>
              <Input
                type="number"
                step="0.01"
                value={editData.acres}
                onChange={(e) => setEditData({ ...editData, acres: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Zoning</Label>
              <Input
                value={editData.zoning}
                onChange={(e) => setEditData({ ...editData, zoning: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Potential Lots/Units</Label>
              <Input
                type="number"
                value={editData.potential_lots}
                onChange={(e) => setEditData({ ...editData, potential_lots: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#047857] hover:bg-[#065f46]">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
