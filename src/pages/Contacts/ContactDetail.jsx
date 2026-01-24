// src/pages/Contacts/ContactDetail.jsx
// Enhanced Contact Detail view with flexible schema

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Building2, Globe, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCompanyById } from '@/services/contactsService';

const ContactDetail = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadContact(); }, [contactId]);

  const loadContact = async () => {
    try {
      setLoading(true);
      const data = await getCompanyById(contactId);
      setContact(data);
    } catch (err) {
      console.error('Error loading contact:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" /></div>;
  }

  if (!contact) {
    return <div className="p-6 text-center text-gray-500">Contact not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
          {contact.company_type && <p className="text-sm text-gray-500 capitalize">{contact.company_type?.replace(/_/g, ' ')}</p>}
        </div>
        <Button variant="outline" onClick={() => navigate(`/contacts/${contactId}/edit`)}>
          <Edit className="w-4 h-4 mr-2" /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{contact.email}</span>
              </div>
            )}
            {contact.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-gray-400" />
                <span>{contact.website}</span>
              </div>
            )}
            {(contact.address || contact.city) && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{[contact.address, contact.city, contact.state, contact.zip_code].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {contact.category && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-gray-400" />
                <Badge variant="outline">{contact.category}</Badge>
              </div>
            )}
            {contact.license_number && (
              <div className="text-sm"><span className="text-gray-500">License:</span> {contact.license_number} ({contact.license_state})</div>
            )}
            {contact.insurance_expiry && (
              <div className="text-sm"><span className="text-gray-500">Insurance Expires:</span> {contact.insurance_expiry}</div>
            )}
            {contact.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {contact.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
              </div>
            )}
            {contact.notes && (
              <div className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg">{contact.notes}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactDetail;
