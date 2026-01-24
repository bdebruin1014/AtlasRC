// src/pages/projects/PropertyInfoPage.jsx
// Property Info page with address autocomplete, lot dimensions, and area calculations

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Ruler, Calculator, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { calculateLotArea, formatArea } from '@/services/addressService';

const PropertyInfoPage = () => {
  const { projectId } = useParams();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    address: '123 Highland Park Drive',
    city: 'Greenville',
    state: 'SC',
    zip: '29601',
    county: 'Greenville',
    parcelId: '0234-56-78-9012',
    legalDescription: 'Lot 14, Block A, Highland Park Subdivision',
    zoning: 'R-1 Residential',
    floodZone: 'Zone X',
    utilities: 'Water, Sewer, Electric, Gas, Cable',
    topography: 'Gently sloping',
    soilType: 'Sandy loam',
  });

  const [lotDimensions, setLotDimensions] = useState({
    shape: 'rectangle',
    frontage: '85',
    depth: '180',
    leftSide: '',
    rightSide: '',
  });

  const calculatedArea = calculateLotArea(lotDimensions);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const updateDimension = (field, value) => {
    setLotDimensions(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleAddressSelect = (addressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zip: addressData.zip,
      county: addressData.county || prev.county,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent text-sm';

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Information</h1>
          <p className="text-sm text-gray-500">Address, lot dimensions, and property details</p>
        </div>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={handleSave}>
          {saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2F855A]" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <AddressAutocomplete
                  value={formData.address}
                  onChange={(val) => updateField('address', val)}
                  onSelect={handleAddressSelect}
                  placeholder="Start typing an address..."
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" value={formData.state} onChange={(e) => updateField('state', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input type="text" value={formData.zip} onChange={(e) => updateField('zip', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                  <input type="text" value={formData.county} onChange={(e) => updateField('county', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parcel ID</label>
                  <input type="text" value={formData.parcelId} onChange={(e) => updateField('parcelId', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Legal Description</label>
                  <input type="text" value={formData.legalDescription} onChange={(e) => updateField('legalDescription', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lot Dimensions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#2F855A]" />
              Lot Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lot Shape</label>
                <select value={lotDimensions.shape} onChange={(e) => updateDimension('shape', e.target.value)} className={inputClass}>
                  <option value="rectangle">Rectangle</option>
                  <option value="trapezoid">Trapezoid</option>
                  <option value="irregular">Irregular</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frontage (ft)</label>
                  <input type="number" value={lotDimensions.frontage} onChange={(e) => updateDimension('frontage', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Depth (ft)</label>
                  <input type="number" value={lotDimensions.depth} onChange={(e) => updateDimension('depth', e.target.value)} className={inputClass} />
                </div>
                {(lotDimensions.shape === 'trapezoid' || lotDimensions.shape === 'irregular') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Left Side (ft)</label>
                      <input type="number" value={lotDimensions.leftSide} onChange={(e) => updateDimension('leftSide', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Right Side (ft)</label>
                      <input type="number" value={lotDimensions.rightSide} onChange={(e) => updateDimension('rightSide', e.target.value)} className={inputClass} />
                    </div>
                  </>
                )}
              </div>

              {calculatedArea && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-[#2F855A]" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Calculated Area</p>
                    <p className="text-lg font-semibold text-[#2F855A]">{formatArea(calculatedArea.sqft)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#2F855A]" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zoning</label>
                <input type="text" value={formData.zoning} onChange={(e) => updateField('zoning', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flood Zone</label>
                <input type="text" value={formData.floodZone} onChange={(e) => updateField('floodZone', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Utilities Available</label>
                <input type="text" value={formData.utilities} onChange={(e) => updateField('utilities', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topography</label>
                <input type="text" value={formData.topography} onChange={(e) => updateField('topography', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                <input type="text" value={formData.soilType} onChange={(e) => updateField('soilType', e.target.value)} className={inputClass} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyInfoPage;
