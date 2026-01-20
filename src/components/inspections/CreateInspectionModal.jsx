// src/components/inspections/CreateInspectionModal.jsx
// Modal for scheduling new inspections

import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Building2, User, ClipboardCheck, Loader2, 
  Home, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  createInspection, 
  INSPECTION_TYPES, 
  getInspectionTemplates 
} from '@/services/inspectionService';

const CreateInspectionModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultPropertyId = null,
  defaultUnitId = null,
  properties = [], // List of properties to select from
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  
  const [formData, setFormData] = useState({
    propertyId: defaultPropertyId || '',
    unitId: defaultUnitId || '',
    inspectionType: 'routine',
    scheduledDate: '',
    scheduledTime: '10:00',
    inspectorName: '',
    tenantName: '',
    templateId: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setFormData(prev => ({
        ...prev,
        propertyId: defaultPropertyId || '',
        unitId: defaultUnitId || '',
      }));
    }
  }, [isOpen, defaultPropertyId, defaultUnitId]);

  const loadTemplates = async () => {
    const { data } = await getInspectionTemplates();
    if (data) setTemplates(data);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.propertyId) {
      setError('Please select a property');
      return;
    }
    if (!formData.scheduledDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError(null);

    const scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}:00`;

    const { data, error: createError } = await createInspection({
      propertyId: formData.propertyId,
      unitId: formData.unitId || null,
      inspectionType: formData.inspectionType,
      scheduledDate: scheduledDateTime,
      inspectorName: formData.inspectorName || null,
      tenantName: formData.tenantName || null,
      templateId: formData.templateId || null,
      notes: formData.notes,
    });

    if (createError) {
      setError(createError.message || 'Failed to create inspection');
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess?.(data);
    onClose();
    
    // Reset form
    setFormData({
      propertyId: '',
      unitId: '',
      inspectionType: 'routine',
      scheduledDate: '',
      scheduledTime: '10:00',
      inspectorName: '',
      tenantName: '',
      templateId: '',
      notes: '',
    });
  };

  if (!isOpen) return null;

  const selectedProperty = properties.find(p => p.id === formData.propertyId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Schedule Inspection</h2>
              <p className="text-sm text-gray-500">Create a new property inspection</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => handleChange('propertyId', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a property...</option>
              {properties.map(prop => (
                <option key={prop.id} value={prop.id}>
                  {prop.name || prop.address}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Selection (optional) */}
          {selectedProperty?.units?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit (optional)
              </label>
              <select
                value={formData.unitId}
                onChange={(e) => handleChange('unitId', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Whole property</option>
                {selectedProperty.units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unit_number} - {unit.tenant_name || 'Vacant'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Inspection Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspection Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.inspectionType}
              onChange={(e) => handleChange('inspectionType', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {INSPECTION_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleChange('scheduledTime', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Inspector Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspector Name
            </label>
            <input
              type="text"
              value={formData.inspectorName}
              onChange={(e) => handleChange('inspectorName', e.target.value)}
              placeholder="Who will conduct the inspection?"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tenant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenant Name
            </label>
            <input
              type="text"
              value={formData.tenantName}
              onChange={(e) => handleChange('tenantName', e.target.value)}
              placeholder="Current tenant (if applicable)"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Template Selection */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inspection Template
              </label>
              <select
                value={formData.templateId}
                onChange={(e) => handleChange('templateId', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Default Template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Any special instructions or notes..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Schedule Inspection
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateInspectionModal;
