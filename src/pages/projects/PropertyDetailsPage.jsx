// src/pages/projects/PropertyDetailsPage.jsx
// Property management page with multi-property support

import React, { useState } from 'react';
import { Edit2, Save, X, MapPin, Building2, FileText, Calendar, DollarSign, Ruler, Home, Users, Globe, Phone, Plus, Trash2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const PROPERTY_TYPES = [
  { id: 'single-family', label: 'Single Family' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'multifamily', label: 'Multifamily' },
  { id: 'other', label: 'Other' },
];

// Default empty property template
const createEmptyProperty = () => ({
  id: `prop-${Date.now()}`,
  // Basic Info
  propertyName: '',
  propertyType: 'single-family',
  status: 'Active',

  // Address
  streetAddress: '',
  city: '',
  state: 'SC',
  zipCode: '',
  county: '',

  // Legal
  parcelNumber: '',
  legalDescription: '',
  zoning: '',

  // Property Specs
  totalAcreage: 0,
  totalUnits: 1,
  totalSqFt: 0,
  avgUnitSize: 0,
  stories: 1,
  bedrooms: '',
  bathrooms: '',
  garages: '',

  // Dates
  acquisitionDate: '',
  constructionStart: '',
  estimatedCompletion: '',

  // Financials (purchase price is on the contract, not property)
  currentAssessedValue: 0,
  projectedCompletedValue: 0,

  // Utilities
  waterProvider: '',
  sewerProvider: '',
  electricProvider: '',
  gasProvider: '',
  internetProvider: '',

  // HOA
  hoaName: '',
  hoaDues: 0,
  hoaFrequency: 'Monthly',

  // Contacts
  titleCompany: '',
  titleContact: '',
  titlePhone: '',
  surveyCompany: '',
  surveyContact: '',
});

const PropertyDetailsPage = ({ projectId: _projectId }) => {
  // Helper to get property type label
  const getPropertyTypeLabel = (typeId) => {
    const type = PROPERTY_TYPES.find(t => t.id === typeId);
    return type?.label || typeId;
  };

  const [properties, setProperties] = useState([
    {
      id: 'prop-1',
      propertyName: 'Lot 1 - Main Property',
      propertyType: 'single-family',
      status: 'Under Construction',
      streetAddress: '1250 Oakridge Drive',
      city: 'Greenville',
      state: 'SC',
      zipCode: '29607',
      county: 'Greenville County',
      parcelNumber: '0512-00-12-345',
      legalDescription: 'Lot 12, Block A, Oakridge Subdivision, as recorded in Plat Book 123, Page 45',
      zoning: 'R-2 (Medium Density Residential)',
      totalAcreage: 0.5,
      totalUnits: 1,
      totalSqFt: 2200,
      avgUnitSize: 2200,
      stories: 2,
      bedrooms: '4',
      bathrooms: '2.5',
      garages: '2-car attached',
      acquisitionDate: '2024-01-15',
      constructionStart: '2024-03-15',
      estimatedCompletion: '2025-06-30',
      currentAssessedValue: 175000,
      projectedCompletedValue: 450000,
      waterProvider: 'Greenville Water',
      sewerProvider: 'ReWa',
      electricProvider: 'Duke Energy',
      gasProvider: 'Piedmont Natural Gas',
      internetProvider: 'Spectrum',
      hoaName: 'Oakridge Estates HOA',
      hoaDues: 150,
      hoaFrequency: 'Monthly',
      titleCompany: 'Greenville Title Services',
      titleContact: 'Lisa Anderson',
      titlePhone: '(864) 555-1234',
      surveyCompany: 'ABC Surveying',
      surveyContact: 'Tom Williams',
    },
    {
      id: 'prop-2',
      propertyName: 'Lot 2 - Corner Lot',
      propertyType: 'single-family',
      status: 'Planning',
      streetAddress: '1252 Oakridge Drive',
      city: 'Greenville',
      state: 'SC',
      zipCode: '29607',
      county: 'Greenville County',
      parcelNumber: '0512-00-12-346',
      legalDescription: 'Lot 13, Block A, Oakridge Subdivision',
      zoning: 'R-2',
      totalAcreage: 0.6,
      totalUnits: 1,
      totalSqFt: 2400,
      avgUnitSize: 2400,
      stories: 2,
      bedrooms: '4',
      bathrooms: '3',
      garages: '2-car attached',
      acquisitionDate: '2024-01-15',
      constructionStart: '',
      estimatedCompletion: '',
      currentAssessedValue: 165000,
      projectedCompletedValue: 485000,
      waterProvider: 'Greenville Water',
      sewerProvider: 'ReWa',
      electricProvider: 'Duke Energy',
      gasProvider: 'Piedmont Natural Gas',
      internetProvider: 'Spectrum',
      hoaName: 'Oakridge Estates HOA',
      hoaDues: 150,
      hoaFrequency: 'Monthly',
      titleCompany: 'Greenville Title Services',
      titleContact: 'Lisa Anderson',
      titlePhone: '(864) 555-1234',
      surveyCompany: 'ABC Surveying',
      surveyContact: 'Tom Williams',
    },
  ]);

  const [expandedPropertyId, setExpandedPropertyId] = useState(properties[0]?.id);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPropertyData, setNewPropertyData] = useState(createEmptyProperty());
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const formatCurrency = (value) => {
    if (!value) return '$0';
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const handleAddProperty = () => {
    setProperties(prev => [...prev, { ...newPropertyData, id: `prop-${Date.now()}` }]);
    setNewPropertyData(createEmptyProperty());
    setShowAddModal(false);
  };

  const handleEditProperty = (property) => {
    setEditingPropertyId(property.id);
    setEditingData({ ...property });
  };

  const handleSaveEdit = () => {
    if (!editingData) return;
    setProperties(prev => prev.map(p => p.id === editingPropertyId ? editingData : p));
    setEditingPropertyId(null);
    setEditingData(null);
  };

  const handleCancelEdit = () => {
    setEditingPropertyId(null);
    setEditingData(null);
  };

  const handleDeleteProperty = (propertyId) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    setDeleteConfirm(null);
    if (expandedPropertyId === propertyId) {
      setExpandedPropertyId(properties.find(p => p.id !== propertyId)?.id || null);
    }
  };

  const toggleExpand = (propertyId) => {
    setExpandedPropertyId(expandedPropertyId === propertyId ? null : propertyId);
  };

  const updateEditField = (field, value) => {
    setEditingData(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-transparent text-sm';

  // Summary calculations
  const totalAcreage = properties.reduce((sum, p) => sum + (p.totalAcreage || 0), 0);
  const totalUnits = properties.reduce((sum, p) => sum + (p.totalUnits || 0), 0);
  const totalValue = properties.reduce((sum, p) => sum + (p.projectedCompletedValue || 0), 0);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Property Details</h1>
          <p className="text-sm text-gray-500">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} • {totalAcreage.toFixed(2)} acres • {totalUnits} units
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#047857] hover:bg-[#065f46]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Properties</p>
          <p className="text-2xl font-bold">{properties.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Acreage</p>
          <p className="text-2xl font-bold">{totalAcreage.toFixed(2)} ac</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Units</p>
          <p className="text-2xl font-bold">{totalUnits}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Projected Value</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        {properties.map((property) => {
          const isExpanded = expandedPropertyId === property.id;
          const isEditing = editingPropertyId === property.id;
          const displayData = isEditing ? editingData : property;

          return (
            <Card key={property.id} className={cn("overflow-hidden", isExpanded && "ring-2 ring-[#047857]")}>
              {/* Property Header - Always visible */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                onClick={() => !isEditing && toggleExpand(property.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    property.status === 'Under Construction' ? 'bg-blue-100' :
                    property.status === 'Planning' ? 'bg-yellow-100' :
                    property.status === 'Completed' ? 'bg-green-100' : 'bg-gray-100'
                  )}>
                    <Building2 className={cn(
                      "w-5 h-5",
                      property.status === 'Under Construction' ? 'text-blue-600' :
                      property.status === 'Planning' ? 'text-yellow-600' :
                      property.status === 'Completed' ? 'text-green-600' : 'text-gray-600'
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{property.propertyName || property.streetAddress || 'Unnamed Property'}</h3>
                    <p className="text-sm text-gray-500">
                      {property.streetAddress && `${property.streetAddress}, ${property.city}, ${property.state}`}
                      {!property.streetAddress && 'No address'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(property.projectedCompletedValue)}</p>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      property.status === 'Under Construction' ? 'bg-blue-100 text-blue-700' :
                      property.status === 'Planning' ? 'bg-yellow-100 text-yellow-700' :
                      property.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    )}>
                      {property.status}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t">
                  {/* Action Buttons */}
                  <div className="p-4 bg-gray-50 border-b flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit} className="bg-[#047857] hover:bg-[#065f46]">
                          <Save className="w-4 h-4 mr-1" /> Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(property.id)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditProperty(property)}>
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Left Column */}
                      <div className="col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Basic Information
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-gray-500">Property Name</label>
                              {isEditing ? (
                                <Input value={displayData.propertyName} onChange={(e) => updateEditField('propertyName', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.propertyName || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Property Type</label>
                              {isEditing ? (
                                <Select value={displayData.propertyType} onValueChange={(v) => updateEditField('propertyType', v)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PROPERTY_TYPES.map(t => (
                                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <p className="font-medium">{getPropertyTypeLabel(displayData.propertyType)}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Status</label>
                              {isEditing ? (
                                <select
                                  value={displayData.status}
                                  onChange={(e) => updateEditField('status', e.target.value)}
                                  className={inputClass}
                                >
                                  <option value="Planning">Planning</option>
                                  <option value="Under Construction">Under Construction</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Sold">Sold</option>
                                </select>
                              ) : (
                                <span className={cn(
                                  "px-2 py-1 rounded text-sm",
                                  displayData.status === 'Under Construction' ? 'bg-blue-100 text-blue-700' :
                                  displayData.status === 'Planning' ? 'bg-yellow-100 text-yellow-700' :
                                  displayData.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                )}>
                                  {displayData.status}
                                </span>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Total Units</label>
                              {isEditing ? (
                                <Input type="number" value={displayData.totalUnits} onChange={(e) => updateEditField('totalUnits', parseInt(e.target.value) || 0)} />
                              ) : (
                                <p className="font-medium">{displayData.totalUnits}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Address
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="text-sm text-gray-500">Street Address</label>
                              {isEditing ? (
                                <Input value={displayData.streetAddress} onChange={(e) => updateEditField('streetAddress', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.streetAddress || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">City</label>
                              {isEditing ? (
                                <Input value={displayData.city} onChange={(e) => updateEditField('city', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.city || '—'}</p>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm text-gray-500">State</label>
                                {isEditing ? (
                                  <Input value={displayData.state} onChange={(e) => updateEditField('state', e.target.value)} />
                                ) : (
                                  <p className="font-medium">{displayData.state || '—'}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-sm text-gray-500">ZIP</label>
                                {isEditing ? (
                                  <Input value={displayData.zipCode} onChange={(e) => updateEditField('zipCode', e.target.value)} />
                                ) : (
                                  <p className="font-medium">{displayData.zipCode || '—'}</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">County</label>
                              {isEditing ? (
                                <Input value={displayData.county} onChange={(e) => updateEditField('county', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.county || '—'}</p>
                              )}
                            </div>
                          </div>
                          {!isEditing && displayData.streetAddress && (
                            <div className="mt-4 pt-4 border-t">
                              <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(`${displayData.streetAddress}, ${displayData.city}, ${displayData.state} ${displayData.zipCode}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#047857] flex items-center gap-1 hover:underline"
                              >
                                <Globe className="w-4 h-4" /> View on Google Maps
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Legal */}
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Legal Information
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-gray-500">Parcel Number</label>
                              {isEditing ? (
                                <Input value={displayData.parcelNumber} onChange={(e) => updateEditField('parcelNumber', e.target.value)} />
                              ) : (
                                <p className="font-medium font-mono">{displayData.parcelNumber || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Zoning</label>
                              {isEditing ? (
                                <Input value={displayData.zoning} onChange={(e) => updateEditField('zoning', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.zoning || '—'}</p>
                              )}
                            </div>
                            <div className="col-span-2">
                              <label className="text-sm text-gray-500">Legal Description</label>
                              {isEditing ? (
                                <textarea
                                  value={displayData.legalDescription}
                                  onChange={(e) => updateEditField('legalDescription', e.target.value)}
                                  rows={2}
                                  className={inputClass}
                                />
                              ) : (
                                <p className="font-medium text-sm">{displayData.legalDescription || '—'}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Property Specs */}
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Ruler className="w-4 h-4" /> Property Specifications
                          </h4>
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <label className="text-sm text-gray-500">Total Acreage</label>
                              {isEditing ? (
                                <Input type="number" step="0.01" value={displayData.totalAcreage} onChange={(e) => updateEditField('totalAcreage', parseFloat(e.target.value) || 0)} />
                              ) : (
                                <p className="font-medium">{displayData.totalAcreage} acres</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Total Sq Ft</label>
                              {isEditing ? (
                                <Input type="number" value={displayData.totalSqFt} onChange={(e) => updateEditField('totalSqFt', parseInt(e.target.value) || 0)} />
                              ) : (
                                <p className="font-medium">{displayData.totalSqFt?.toLocaleString()} SF</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Stories</label>
                              {isEditing ? (
                                <Input type="number" value={displayData.stories} onChange={(e) => updateEditField('stories', parseInt(e.target.value) || 1)} />
                              ) : (
                                <p className="font-medium">{displayData.stories}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Garage</label>
                              {isEditing ? (
                                <Input value={displayData.garages} onChange={(e) => updateEditField('garages', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.garages || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Bedrooms</label>
                              {isEditing ? (
                                <Input value={displayData.bedrooms} onChange={(e) => updateEditField('bedrooms', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.bedrooms || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Bathrooms</label>
                              {isEditing ? (
                                <Input value={displayData.bathrooms} onChange={(e) => updateEditField('bathrooms', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.bathrooms || '—'}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Utilities */}
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Home className="w-4 h-4" /> Utilities
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-gray-500">Water</label>
                              {isEditing ? (
                                <Input value={displayData.waterProvider} onChange={(e) => updateEditField('waterProvider', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.waterProvider || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Sewer</label>
                              {isEditing ? (
                                <Input value={displayData.sewerProvider} onChange={(e) => updateEditField('sewerProvider', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.sewerProvider || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Electric</label>
                              {isEditing ? (
                                <Input value={displayData.electricProvider} onChange={(e) => updateEditField('electricProvider', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.electricProvider || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Gas</label>
                              {isEditing ? (
                                <Input value={displayData.gasProvider} onChange={(e) => updateEditField('gasProvider', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.gasProvider || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Internet</label>
                              {isEditing ? (
                                <Input value={displayData.internetProvider} onChange={(e) => updateEditField('internetProvider', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.internetProvider || '—'}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Key Dates */}
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Key Dates
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-gray-500">Acquisition Date</label>
                              {isEditing ? (
                                <Input type="date" value={displayData.acquisitionDate} onChange={(e) => updateEditField('acquisitionDate', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.acquisitionDate || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Construction Start</label>
                              {isEditing ? (
                                <Input type="date" value={displayData.constructionStart} onChange={(e) => updateEditField('constructionStart', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.constructionStart || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Est. Completion</label>
                              {isEditing ? (
                                <Input type="date" value={displayData.estimatedCompletion} onChange={(e) => updateEditField('estimatedCompletion', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.estimatedCompletion || '—'}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Valuation */}
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Valuation
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-gray-500">Current Assessed Value</label>
                              {isEditing ? (
                                <Input type="number" value={displayData.currentAssessedValue} onChange={(e) => updateEditField('currentAssessedValue', parseFloat(e.target.value) || 0)} />
                              ) : (
                                <p className="font-semibold text-lg">{formatCurrency(displayData.currentAssessedValue)}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Projected Completed Value</label>
                              {isEditing ? (
                                <Input type="number" value={displayData.projectedCompletedValue} onChange={(e) => updateEditField('projectedCompletedValue', parseFloat(e.target.value) || 0)} />
                              ) : (
                                <p className="font-semibold text-lg text-green-600">{formatCurrency(displayData.projectedCompletedValue)}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* HOA */}
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4" /> HOA Information
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-gray-500">HOA Name</label>
                              {isEditing ? (
                                <Input value={displayData.hoaName} onChange={(e) => updateEditField('hoaName', e.target.value)} />
                              ) : (
                                <p className="font-medium">{displayData.hoaName || '—'}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Dues</label>
                              {isEditing ? (
                                <div className="flex gap-2">
                                  <Input type="number" value={displayData.hoaDues} onChange={(e) => updateEditField('hoaDues', parseFloat(e.target.value) || 0)} />
                                  <select
                                    value={displayData.hoaFrequency}
                                    onChange={(e) => updateEditField('hoaFrequency', e.target.value)}
                                    className={inputClass}
                                    style={{ width: '120px' }}
                                  >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Annual">Annual</option>
                                  </select>
                                </div>
                              ) : (
                                <p className="font-medium">
                                  {displayData.hoaDues ? `$${displayData.hoaDues}/${displayData.hoaFrequency}` : '—'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Key Contacts */}
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Phone className="w-4 h-4" /> Key Contacts
                          </h4>
                          <div className="space-y-4">
                            <div>
                              {isEditing ? (
                                <>
                                  <Input value={displayData.titleCompany} onChange={(e) => updateEditField('titleCompany', e.target.value)} placeholder="Title Company" className="mb-2" />
                                  <Input value={displayData.titleContact} onChange={(e) => updateEditField('titleContact', e.target.value)} placeholder="Contact Name" className="mb-2" />
                                  <Input value={displayData.titlePhone} onChange={(e) => updateEditField('titlePhone', e.target.value)} placeholder="Phone" />
                                </>
                              ) : (
                                <>
                                  <p className="font-medium">{displayData.titleCompany || 'No title company'}</p>
                                  <p className="text-sm text-gray-500">{displayData.titleContact}</p>
                                  {displayData.titlePhone && (
                                    <p className="text-sm text-[#047857]">{displayData.titlePhone}</p>
                                  )}
                                </>
                              )}
                            </div>
                            <div>
                              {isEditing ? (
                                <>
                                  <Input value={displayData.surveyCompany} onChange={(e) => updateEditField('surveyCompany', e.target.value)} placeholder="Survey Company" className="mb-2" />
                                  <Input value={displayData.surveyContact} onChange={(e) => updateEditField('surveyContact', e.target.value)} placeholder="Contact Name" />
                                </>
                              ) : (
                                <>
                                  <p className="font-medium">{displayData.surveyCompany || 'No survey company'}</p>
                                  <p className="text-sm text-gray-500">{displayData.surveyContact}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {properties.length === 0 && (
          <div className="text-center py-12 bg-white border rounded-lg">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first property to this project.</p>
            <Button onClick={() => setShowAddModal(true)} className="bg-[#047857] hover:bg-[#065f46]">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Add a new property to this project. You can edit additional details after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Property Name</Label>
                <Input
                  value={newPropertyData.propertyName}
                  onChange={(e) => setNewPropertyData(prev => ({ ...prev, propertyName: e.target.value }))}
                  placeholder="e.g., Lot 1 - Main House"
                />
              </div>
              <div>
                <Label>Property Type</Label>
                <Select
                  value={newPropertyData.propertyType}
                  onValueChange={(v) => setNewPropertyData(prev => ({ ...prev, propertyType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Street Address</Label>
              <Input
                value={newPropertyData.streetAddress}
                onChange={(e) => setNewPropertyData(prev => ({ ...prev, streetAddress: e.target.value }))}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={newPropertyData.city}
                  onChange={(e) => setNewPropertyData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={newPropertyData.state}
                  onChange={(e) => setNewPropertyData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div>
                <Label>ZIP Code</Label>
                <Input
                  value={newPropertyData.zipCode}
                  onChange={(e) => setNewPropertyData(prev => ({ ...prev, zipCode: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Parcel Number</Label>
                <Input
                  value={newPropertyData.parcelNumber}
                  onChange={(e) => setNewPropertyData(prev => ({ ...prev, parcelNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label>Total Acreage</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newPropertyData.totalAcreage}
                  onChange={(e) => setNewPropertyData(prev => ({ ...prev, totalAcreage: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Total Units</Label>
                <Input
                  type="number"
                  value={newPropertyData.totalUnits}
                  onChange={(e) => setNewPropertyData(prev => ({ ...prev, totalUnits: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProperty} className="bg-[#047857] hover:bg-[#065f46]">
              Add Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteProperty(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertyDetailsPage;
