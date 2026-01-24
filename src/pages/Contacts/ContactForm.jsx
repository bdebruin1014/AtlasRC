// src/pages/Contacts/ContactForm.jsx
// Enhanced Contact Form with flexible schema and category support

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COMPANY_CATEGORIES, getCompanyById, createCompany, updateCompany } from '@/services/contactsService';

const CONTACT_TYPE_OPTIONS = Object.values(COMPANY_CATEGORIES).flatMap(cat =>
  cat.types.map(t => ({ ...t, category: cat.label }))
);

const ContactForm = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!contactId;
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company_type: '',
    category: '',
    phone: '',
    email: '',
    secondary_phone: '',
    secondary_email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    license_number: '',
    license_state: '',
    insurance_expiry: '',
    tags: [],
    notes: '',
    profile_data: {},
  });

  useEffect(() => {
    if (isEditing) loadContact();
  }, [contactId]);

  const loadContact = async () => {
    try {
      const data = await getCompanyById(contactId);
      if (data) setFormData({ ...formData, ...data });
    } catch (err) {
      console.error('Error loading contact:', err);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setSaving(true);
    try {
      if (isEditing) {
        await updateCompany(contactId, formData);
      } else {
        await createCompany(formData);
      }
      navigate('/contacts');
    } catch (err) {
      console.error('Error saving contact:', err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2F855A] focus:border-transparent';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Contact' : 'New Contact'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company/Contact Name *</label>
                <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={formData.company_type} onChange={(e) => updateField('company_type', e.target.value)} className={inputClass}>
                  <option value="">Select type...</option>
                  {CONTACT_TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.category} - {t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" value={formData.category || ''} onChange={(e) => updateField('category', e.target.value)} className={inputClass} placeholder="e.g., Contractor, Lender" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contact Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
                <input type="tel" value={formData.secondary_phone || ''} onChange={(e) => updateField('secondary_phone', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Email</label>
                <input type="email" value={formData.secondary_email || ''} onChange={(e) => updateField('secondary_email', e.target.value)} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" value={formData.website || ''} onChange={(e) => updateField('website', e.target.value)} className={inputClass} placeholder="https://" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input type="text" value={formData.address} onChange={(e) => updateField('address', e.target.value)} className={inputClass} />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Professional Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input type="text" value={formData.license_number || ''} onChange={(e) => updateField('license_number', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License State</label>
                <input type="text" value={formData.license_state || ''} onChange={(e) => updateField('license_state', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry</label>
                <input type="date" value={formData.insurance_expiry || ''} onChange={(e) => updateField('insurance_expiry', e.target.value)} className={inputClass} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} rows={3} className={inputClass} placeholder="Additional notes..." />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/contacts')}>Cancel</Button>
          <Button type="submit" className="bg-[#2F855A] hover:bg-[#276749]" disabled={saving || !formData.name}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : isEditing ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
