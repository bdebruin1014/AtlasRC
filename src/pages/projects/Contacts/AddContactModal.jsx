// src/pages/projects/Contacts/AddContactModal.jsx
// Modal for adding a new contact to a project

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT_CATEGORIES, createProjectContact } from '@/services/projectContactsService';
import { ProfileFieldRenderer } from './ContactProfiles';

const AddContactModal = ({ isOpen, onClose, projectId, onContactAdded }) => {
  const [formData, setFormData] = useState({
    category: '',
    first_name: '',
    last_name: '',
    company_name: '',
    job_title: '',
    email: '',
    phone: '',
    cell_phone: '',
    address_line1: '',
    city: '',
    state: '',
    zip_code: '',
    is_primary: false,
    notes: '',
    profile_data: {},
  });
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateProfileData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      profile_data: { ...prev.profile_data, [field]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.category) return;
    setSaving(true);
    try {
      const contact = await createProjectContact({
        ...formData,
        project_id: projectId,
      });
      onContactAdded?.(contact);
      onClose();
      setFormData({
        category: '', first_name: '', last_name: '', company_name: '',
        job_title: '', email: '', phone: '', cell_phone: '',
        address_line1: '', city: '', state: '', zip_code: '',
        is_primary: false, notes: '', profile_data: {},
      });
    } catch (err) {
      console.error('Error creating contact:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent text-sm';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-[#1e2a3a] text-white">
          <h2 className="text-lg font-semibold">Add Project Contact</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select value={formData.category} onChange={(e) => updateField('category', e.target.value)} className={inputClass}>
              <option value="">Select category...</option>
              {CONTACT_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>)}
            </select>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input type="text" value={formData.first_name} onChange={(e) => updateField('first_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={formData.last_name} onChange={(e) => updateField('last_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={formData.company_name} onChange={(e) => updateField('company_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input type="text" value={formData.job_title} onChange={(e) => updateField('job_title', e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cell Phone</label>
              <input type="tel" value={formData.cell_phone} onChange={(e) => updateField('cell_phone', e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={formData.address_line1} onChange={(e) => updateField('address_line1', e.target.value)} className={inputClass} />
            </div>
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
              <input type="text" value={formData.zip_code} onChange={(e) => updateField('zip_code', e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Category-specific fields */}
          {formData.category && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {CONTACT_CATEGORIES.find(c => c.id === formData.category)?.label} Details
              </h3>
              <ProfileFieldRenderer
                category={formData.category}
                profileData={formData.profile_data}
                onChange={updateProfileData}
              />
            </div>
          )}

          {/* Options */}
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.is_primary} onChange={(e) => updateField('is_primary', e.target.checked)} className="rounded" />
              Primary contact for this category
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} rows={2} className={inputClass} />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={handleSubmit} disabled={!formData.first_name || !formData.category || saving}>
            {saving ? 'Saving...' : 'Add Contact'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;
