// src/pages/projects/ContactsPage.jsx
// Project Contacts with 12 categories and left sidebar navigation

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

  // Group contacts by category
  const groupedContacts = {};
  CONTACT_CATEGORIES.forEach(cat => { groupedContacts[cat.id] = []; });
  filteredContacts.forEach(c => {
    if (groupedContacts[c.category]) groupedContacts[c.category].push(c);
  });

  // Get count for a category
  const getCategoryCount = (catId) => groupedContacts[catId]?.length || 0;

  // Get contacts to display based on active category
  const displayContacts = activeCategory
    ? groupedContacts[activeCategory] || []
    : filteredContacts;

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Contact Types */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Contact Types</h2>
          <p className="text-xs text-gray-500 mt-1">{CONTACT_CATEGORIES.length} categories</p>
        </div>

        <div className="p-2">
          {/* All Contacts option */}
          <button
            onClick={() => setActiveCategory(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              activeCategory === null
                ? 'bg-[#2F855A] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>All Contacts</span>
            </div>
            <Badge variant={activeCategory === null ? "secondary" : "outline"} className="text-xs">
              {filteredContacts.length}
            </Badge>
          </button>

          <div className="my-2 border-t border-gray-200" />

          {/* Category list */}
          {CONTACT_CATEGORIES.map(cat => {
            const count = getCategoryCount(cat.id);
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#2F855A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
                {count > 0 && (
                  <Badge variant={isActive ? "secondary" : "outline"} className="text-xs">
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeCategory
                  ? CONTACT_CATEGORIES.find(c => c.id === activeCategory)?.label || 'Contacts'
                  : 'All Project Contacts'}
              </h1>
              <p className="text-sm text-gray-500">
                {displayContacts.length} contact{displayContacts.length !== 1 ? 's' : ''}
                {activeCategory && ` in ${CONTACT_CATEGORIES.find(c => c.id === activeCategory)?.label}`}
              </p>
            </div>
            <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Contact
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
              />
            </div>
          </div>

          {/* Contact Cards */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
            </div>
          ) : displayContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {activeCategory
                  ? `No contacts in ${CONTACT_CATEGORIES.find(c => c.id === activeCategory)?.label}`
                  : 'No contacts found'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Add First Contact
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayContacts.map(contact => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        projectId={projectId}
        onContactAdded={handleContactAdded}
      />
    </div>
  );
};

const ContactCard = ({ contact }) => {
  const category = CONTACT_CATEGORIES.find(c => c.id === contact.category);

  return (
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
          <div className="flex items-center gap-2">
            {category && (
              <Badge variant="outline" className="text-xs">
                {category.icon} {category.label}
              </Badge>
            )}
            {contact.is_primary && (
              <Badge className="bg-[#2F855A] text-white text-xs">Primary</Badge>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-[#2F855A]">
              <Mail className="w-3 h-3" />{contact.email}
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-[#2F855A]">
              <Phone className="w-3 h-3" />{contact.phone}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactsPage;
