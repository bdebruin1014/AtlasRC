// src/pages/projects/BasicInfoPage.jsx
// Consolidated project settings page with all basic info, property, financial summary

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Building2, MapPin, Calendar, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DependentField from '@/components/ui/DependentField';
import { useDependentField } from '@/hooks/useDependentField';

const PROJECT_TYPES = [
  { id: 'spec-home', label: 'Spec Home' },
  { id: 'custom-home', label: 'Custom Home' },
  { id: 'lot-development', label: 'Lot Development' },
  { id: 'btr-community', label: 'BTR Community' },
  { id: 'bts-community', label: 'BTS Community' },
  { id: 'multifamily', label: 'Multifamily' },
  { id: 'fix-flip', label: 'Fix & Flip' },
];

const PROJECT_STATUSES = [
  { id: 'planning', label: 'Planning' },
  { id: 'active', label: 'Active' },
  { id: 'on-hold', label: 'On Hold' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const BasicInfoPage = () => {
  const { projectId } = useParams();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    projectName: 'Watson House',
    projectNumber: '25-001',
    projectType: 'spec-home',
    status: 'active',
    entity: 'Watson House LLC',
    description: 'Spec home build in Highland Park subdivision',
    startDate: '2025-01-15',
    targetCompletion: '2025-08-30',
    closingDate: '',
    address: '123 Highland Park Drive',
    city: 'Greenville',
    state: 'SC',
    zip: '29601',
    county: 'Greenville',
    parcelId: '0234-56-78-9012',
    acres: '0.35',
    zoning: 'R-1 Residential',
    lotFrontage: '85',
    lotDepth: '180',
    units: 1,
    sqft: '2,450',
    budget: 485000,
    actualCost: 225000,
    contingency: 25000,
  });

  const dependencies = {
    projectType: ['budget', 'contingency'],
    address: ['city', 'state', 'zip', 'county'],
    acres: ['lotFrontage', 'lotDepth'],
  };

  const { isHighlighted, clearHighlight } = useDependentField(dependencies, formData);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>
          <p className="text-sm text-gray-500">Manage basic information, property details, and financial summary</p>
        </div>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={handleSave}>
          {saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2F855A]" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input type="text" value={formData.projectName} onChange={(e) => updateField('projectName', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Number</label>
                <input type="text" value={formData.projectNumber} readOnly className={`${inputClass} bg-gray-50`} />
              </div>
              <DependentField label="Project Type" isHighlighted={isHighlighted('projectType')} onVerify={() => clearHighlight('projectType')}>
                <select value={formData.projectType} onChange={(e) => updateField('projectType', e.target.value)} className={inputClass}>
                  {PROJECT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </DependentField>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => updateField('status', e.target.value)} className={inputClass}>
                  {PROJECT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity *</label>
                <input type="text" value={formData.entity} onChange={(e) => updateField('entity', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                <input type="number" value={formData.units} onChange={(e) => updateField('units', parseInt(e.target.value) || 1)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                <input type="text" value={formData.sqft} onChange={(e) => updateField('sqft', e.target.value)} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)} rows={2} className={inputClass} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2F855A]" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={formData.startDate} onChange={(e) => updateField('startDate', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Completion</label>
                <input type="date" value={formData.targetCompletion} onChange={(e) => updateField('targetCompletion', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date</label>
                <input type="date" value={formData.closingDate} onChange={(e) => updateField('closingDate', e.target.value)} className={inputClass} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address & Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2F855A]" />
              Address & Lot Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={formData.address} onChange={(e) => updateField('address', e.target.value)} className={inputClass} />
              </div>
              <DependentField label="City" isHighlighted={isHighlighted('city')} onVerify={() => clearHighlight('city')}>
                <input type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)} className={inputClass} />
              </DependentField>
              <div className="grid grid-cols-2 gap-2">
                <DependentField label="State" isHighlighted={isHighlighted('state')} onVerify={() => clearHighlight('state')}>
                  <input type="text" value={formData.state} onChange={(e) => updateField('state', e.target.value)} className={inputClass} />
                </DependentField>
                <DependentField label="ZIP" isHighlighted={isHighlighted('zip')} onVerify={() => clearHighlight('zip')}>
                  <input type="text" value={formData.zip} onChange={(e) => updateField('zip', e.target.value)} className={inputClass} />
                </DependentField>
              </div>
              <DependentField label="County" isHighlighted={isHighlighted('county')} onVerify={() => clearHighlight('county')}>
                <input type="text" value={formData.county} onChange={(e) => updateField('county', e.target.value)} className={inputClass} />
              </DependentField>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parcel ID</label>
                <input type="text" value={formData.parcelId} onChange={(e) => updateField('parcelId', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acres</label>
                <input type="text" value={formData.acres} onChange={(e) => updateField('acres', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zoning</label>
                <input type="text" value={formData.zoning} onChange={(e) => updateField('zoning', e.target.value)} className={inputClass} />
              </div>
              <DependentField label="Lot Frontage (ft)" isHighlighted={isHighlighted('lotFrontage')} onVerify={() => clearHighlight('lotFrontage')}>
                <input type="text" value={formData.lotFrontage} onChange={(e) => updateField('lotFrontage', e.target.value)} className={inputClass} />
              </DependentField>
              <DependentField label="Lot Depth (ft)" isHighlighted={isHighlighted('lotDepth')} onVerify={() => clearHighlight('lotDepth')}>
                <input type="text" value={formData.lotDepth} onChange={(e) => updateField('lotDepth', e.target.value)} className={inputClass} />
              </DependentField>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#2F855A]" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <DependentField label="Total Budget" isHighlighted={isHighlighted('budget')} onVerify={() => clearHighlight('budget')}>
                <input type="number" value={formData.budget} onChange={(e) => updateField('budget', parseFloat(e.target.value) || 0)} className={inputClass} />
              </DependentField>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost to Date</label>
                <input type="number" value={formData.actualCost} readOnly className={`${inputClass} bg-gray-50`} />
              </div>
              <DependentField label="Contingency" isHighlighted={isHighlighted('contingency')} onVerify={() => clearHighlight('contingency')}>
                <input type="number" value={formData.contingency} onChange={(e) => updateField('contingency', parseFloat(e.target.value) || 0)} className={inputClass} />
              </DependentField>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Budget Remaining</p>
                <p className="text-lg font-semibold text-gray-900">${(formData.budget - formData.actualCost).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">% Spent</p>
                <p className="text-lg font-semibold text-gray-900">{formData.budget ? Math.round((formData.actualCost / formData.budget) * 100) : 0}%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Budget + Contingency</p>
                <p className="text-lg font-semibold text-gray-900">${(formData.budget + formData.contingency).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BasicInfoPage;
