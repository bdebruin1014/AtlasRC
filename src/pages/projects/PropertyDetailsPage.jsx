import React, { useState } from 'react';
import { Edit2, Save, X, MapPin, Building2, FileText, Calendar, DollarSign, Ruler, Home, Users, Globe, Phone, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PropertyDetailsPage = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);

  const [propertyData, setPropertyData] = useState({
    // Basic Info
    projectName: 'Oakridge Estates',
    projectType: 'Spec Build - Single Family',
    status: 'Under Construction',
    
    // Address
    streetAddress: '1250 Oakridge Drive',
    city: 'Greenville',
    state: 'SC',
    zipCode: '29607',
    county: 'Greenville County',
    
    // Legal
    parcelNumber: '0512-00-12-345',
    legalDescription: 'Lot 12, Block A, Oakridge Subdivision, as recorded in Plat Book 123, Page 45, Greenville County Records',
    zoning: 'R-2 (Medium Density Residential)',
    
    // Property Specs
    totalAcreage: 4.2,
    totalUnits: 12,
    totalSqFt: 26400,
    avgUnitSize: 2200,
    stories: 2,
    bedrooms: '3-4',
    bathrooms: '2.5-3.5',
    garages: '2-car attached',
    
    // Dates
    acquisitionDate: '2024-01-15',
    constructionStart: '2024-03-15',
    estimatedCompletion: '2025-06-30',
    
    // Financials
    purchasePrice: 1200000,
    currentAssessedValue: 1450000,
    projectedCompletedValue: 5800000,
    
    // Utilities
    waterProvider: 'Greenville Water',
    sewerProvider: 'ReWa',
    electricProvider: 'Duke Energy',
    gasProvider: 'Piedmont Natural Gas',
    internetProvider: 'Spectrum',
    
    // HOA
    hoaName: 'Oakridge Estates HOA',
    hoaDues: 150,
    hoaFrequency: 'Monthly',
    
    // Contacts
    titleCompany: 'Greenville Title Services',
    titleContact: 'Lisa Anderson',
    titlePhone: '(864) 555-1234',
    surveyCompany: 'ABC Surveying',
    surveyContact: 'Tom Williams',
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save logic would go here
  };

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Property Details</h1>
          <p className="text-sm text-gray-500">{propertyData.streetAddress}, {propertyData.city}, {propertyData.state}</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}><X className="w-4 h-4 mr-1" />Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={handleSave}><Save className="w-4 h-4 mr-1" />Save</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="w-4 h-4" />Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Project Name</label>
                {isEditing ? (
                  <Input value={propertyData.projectName} onChange={(e) => setPropertyData(prev => ({ ...prev, projectName: e.target.value }))} />
                ) : (
                  <p className="font-medium">{propertyData.projectName}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">Project Type</label>
                {isEditing ? (
                  <Input value={propertyData.projectType} onChange={(e) => setPropertyData(prev => ({ ...prev, projectType: e.target.value }))} />
                ) : (
                  <p className="font-medium">{propertyData.projectType}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p className="font-medium">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{propertyData.status}</span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Total Units</label>
                <p className="font-medium">{propertyData.totalUnits}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" />Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-500">Street Address</label>
                {isEditing ? (
                  <Input value={propertyData.streetAddress} onChange={(e) => setPropertyData(prev => ({ ...prev, streetAddress: e.target.value }))} />
                ) : (
                  <p className="font-medium">{propertyData.streetAddress}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">City</label>
                {isEditing ? (
                  <Input value={propertyData.city} onChange={(e) => setPropertyData(prev => ({ ...prev, city: e.target.value }))} />
                ) : (
                  <p className="font-medium">{propertyData.city}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">State</label>
                  <p className="font-medium">{propertyData.state}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">ZIP</label>
                  <p className="font-medium">{propertyData.zipCode}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">County</label>
                <p className="font-medium">{propertyData.county}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <a href="#" className="text-sm text-[#047857] flex items-center gap-1 hover:underline">
                <Globe className="w-4 h-4" />View on Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><FileText className="w-4 h-4" />Legal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Parcel Number</label>
                <p className="font-medium font-mono">{propertyData.parcelNumber}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Zoning</label>
                <p className="font-medium">{propertyData.zoning}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-500">Legal Description</label>
                <p className="font-medium text-sm">{propertyData.legalDescription}</p>
              </div>
            </div>
          </div>

          {/* Property Specs */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Ruler className="w-4 h-4" />Property Specifications</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-500">Total Acreage</label>
                <p className="font-medium">{propertyData.totalAcreage} acres</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Total Sq Ft</label>
                <p className="font-medium">{propertyData.totalSqFt.toLocaleString()} SF</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Avg Unit Size</label>
                <p className="font-medium">{propertyData.avgUnitSize.toLocaleString()} SF</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Stories</label>
                <p className="font-medium">{propertyData.stories}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Bedrooms</label>
                <p className="font-medium">{propertyData.bedrooms}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Bathrooms</label>
                <p className="font-medium">{propertyData.bathrooms}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Garage</label>
                <p className="font-medium">{propertyData.garages}</p>
              </div>
            </div>
          </div>

          {/* Utilities */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Home className="w-4 h-4" />Utilities</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Water</label>
                <p className="font-medium">{propertyData.waterProvider}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Sewer</label>
                <p className="font-medium">{propertyData.sewerProvider}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Electric</label>
                <p className="font-medium">{propertyData.electricProvider}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Gas</label>
                <p className="font-medium">{propertyData.gasProvider}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Internet</label>
                <p className="font-medium">{propertyData.internetProvider}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Key Dates */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" />Key Dates</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Acquisition Date</label>
                <p className="font-medium">{propertyData.acquisitionDate}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Construction Start</label>
                <p className="font-medium">{propertyData.constructionStart}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Est. Completion</label>
                <p className="font-medium">{propertyData.estimatedCompletion}</p>
              </div>
            </div>
          </div>

          {/* Valuation */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4" />Valuation</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Purchase Price</label>
                <p className="font-semibold text-lg">{formatCurrency(propertyData.purchasePrice)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Current Assessed Value</label>
                <p className="font-semibold text-lg">{formatCurrency(propertyData.currentAssessedValue)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Projected Completed Value</label>
                <p className="font-semibold text-lg text-green-600">{formatCurrency(propertyData.projectedCompletedValue)}</p>
              </div>
            </div>
          </div>

          {/* HOA */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4" />HOA Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">HOA Name</label>
                <p className="font-medium">{propertyData.hoaName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Dues</label>
                <p className="font-medium">${propertyData.hoaDues}/{propertyData.hoaFrequency}</p>
              </div>
            </div>
          </div>

          {/* Key Contacts */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Phone className="w-4 h-4" />Key Contacts</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">{propertyData.titleCompany}</p>
                <p className="text-sm text-gray-500">{propertyData.titleContact}</p>
                <p className="text-sm text-[#047857]">{propertyData.titlePhone}</p>
              </div>
              <div>
                <p className="font-medium">{propertyData.surveyCompany}</p>
                <p className="text-sm text-gray-500">{propertyData.surveyContact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
