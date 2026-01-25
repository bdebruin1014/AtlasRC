// src/pages/projects/ContactsPage.jsx
// Project Contacts with 12 categories

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Plus, Search, Phone, Mail, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProjectContacts, CONTACT_CATEGORIES } from '@/services/projectContactsService';
import AddContactModal from './Contacts/AddContactModal';

const ContactsPage = () => {
  const { projectId } = useParams();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { loadContacts(); }, [projectId, activeCategory]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (activeCategory) filters.category = activeCategory;
      if (searchTerm) filters.search = searchTerm;
      const data = await getProjectContacts(projectId, filters);
      setContacts(data);
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactAdded = (newContact) => {
    setContacts(prev => [...prev, newContact]);
    setShowAddModal(false);
  };

  const filteredContacts = contacts.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return c.first_name?.toLowerCase().includes(term) ||
           c.last_name?.toLowerCase().includes(term) ||
           c.company_name?.toLowerCase().includes(term);
  });

  const groupedContacts = {};
  CONTACT_CATEGORIES.forEach(cat => { groupedContacts[cat.id] = []; });
  filteredContacts.forEach(c => {
    if (groupedContacts[c.category]) groupedContacts[c.category].push(c);
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Contacts</h1>
          <p className="text-sm text-gray-500">{filteredContacts.length} contacts across {CONTACT_CATEGORIES.length} categories</p>
        </div>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
          />
        </div>
        <select
          value={activeCategory || ''}
          onChange={(e) => setActiveCategory(e.target.value || null)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Categories</option>
          {CONTACT_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
        </select>
      </div>

      {/* Category Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" /></div>
      ) : activeCategory ? (
        <div className="space-y-3">
          {groupedContacts[activeCategory]?.map(contact => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
          {groupedContacts[activeCategory]?.length === 0 && (
            <p className="text-center text-gray-500 py-8">No contacts in this category</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {CONTACT_CATEGORIES.map(cat => {
            const catContacts = groupedContacts[cat.id];
            if (catContacts.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{cat.icon}</span>
                  <h3 className="font-medium text-gray-900">{cat.label}</h3>
                  <Badge variant="outline" className="text-xs">{catContacts.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {catContacts.map(contact => <ContactCard key={contact.id} contact={contact} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        projectId={projectId}
        onContactAdded={handleContactAdded}
      />
    </div>
  );
};

const ContactCard = ({ contact }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">{contact.first_name} {contact.last_name}</p>
          {contact.company_name && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {contact.company_name}
            </p>
          )}
        </div>
        {contact.is_primary && <Badge className="bg-[#2F855A] text-white text-xs">Primary</Badge>}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
        {contact.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</span>}
        {contact.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</span>}
      </div>
    </CardContent>
  </Card>
);

export default ContactsPage;
