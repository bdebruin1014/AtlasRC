// src/pages/projects/ContactsPage.jsx
// Project Contacts with left sidebar showing Contact Types

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users, Plus, Search, Phone, Mail, Building2, ChevronRight,
  HardHat, Paintbrush, Zap, Droplets, Wind, Ruler, FileText,
  Scale, Landmark, DollarSign, Home, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProjectContacts, CONTACT_CATEGORIES } from '@/services/projectContactsService';
import AddContactModal from './Contacts/AddContactModal';

// Contact type icons mapping
const CONTACT_TYPE_ICONS = {
  architect: Ruler,
  engineer: HardHat,
  contractor: HardHat,
  subcontractor: Paintbrush,
  electrician: Zap,
  plumber: Droplets,
  hvac: Wind,
  surveyor: Ruler,
  attorney: Scale,
  title_company: FileText,
  lender: Landmark,
  investor: DollarSign,
  realtor: Home,
  inspector: FileText,
  other: Users,
};

const ContactsPage = () => {
  const { projectId } = useParams();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  useEffect(() => { loadContacts(); }, [projectId]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await getProjectContacts(projectId, {});
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
    if (activeCategory && c.category !== activeCategory) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return c.first_name?.toLowerCase().includes(term) ||
           c.last_name?.toLowerCase().includes(term) ||
           c.company_name?.toLowerCase().includes(term);
  });

  // Group contacts by category
  const contactsByCategory = {};
  CONTACT_CATEGORIES.forEach(cat => { contactsByCategory[cat.id] = []; });
  contacts.forEach(c => {
    if (contactsByCategory[c.category]) contactsByCategory[c.category].push(c);
  });

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Left Sidebar - Contact Types */}
      <div className="w-64 bg-white border-r flex-shrink-0 flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Contact Types</h2>
          <p className="text-xs text-gray-500 mt-1">{contacts.length} total contacts</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* All Contacts */}
          <button
            onClick={() => setActiveCategory(null)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm border-b hover:bg-gray-50 transition-colors ${
              !activeCategory ? 'bg-emerald-50 text-emerald-700 border-l-2 border-l-emerald-600' : 'text-gray-700'
            }`}
          >
            <span className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span className="font-medium">All Contacts</span>
            </span>
            <Badge variant="outline" className="text-xs">{contacts.length}</Badge>
          </button>

          {/* Contact Type Categories */}
          {CONTACT_CATEGORIES.map(cat => {
            const Icon = CONTACT_TYPE_ICONS[cat.id] || Users;
            const categoryContacts = contactsByCategory[cat.id] || [];
            const isExpanded = expandedCategories.has(cat.id);
            const isActive = activeCategory === cat.id;

            return (
              <div key={cat.id} className="border-b">
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-700 border-l-2 border-l-emerald-600' : 'text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{cat.label}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{categoryContacts.length}</Badge>
                    {categoryContacts.length > 0 && (
                      <ChevronRight
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleCategory(cat.id); }}
                      />
                    )}
                  </div>
                </button>

                {/* Expanded contact list preview */}
                {isExpanded && categoryContacts.length > 0 && (
                  <div className="bg-gray-50 border-t">
                    {categoryContacts.slice(0, 5).map(contact => (
                      <div
                        key={contact.id}
                        className="px-4 py-2 pl-11 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setSearchTerm(`${contact.first_name} ${contact.last_name}`);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setActiveCategory(cat.id);
                            setSearchTerm(`${contact.first_name} ${contact.last_name}`);
                          }
                        }}
                      >
                        {contact.first_name} {contact.last_name}
                        {contact.company_name && (
                          <span className="text-gray-400 ml-1">({contact.company_name})</span>
                        )}
                      </div>
                    ))}
                    {categoryContacts.length > 5 && (
                      <div className="px-4 py-2 pl-11 text-xs text-emerald-600">
                        +{categoryContacts.length - 5} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Contact Button */}
        <div className="p-4 border-t">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {activeCategory
                  ? CONTACT_CATEGORIES.find(c => c.id === activeCategory)?.label || 'Contacts'
                  : 'All Contacts'
                }
              </h1>
              <p className="text-sm text-gray-500">{filteredContacts.length} contacts</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search contacts..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No contacts found</p>
              <Button
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Add First Contact
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map(contact => (
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
  const Icon = CONTACT_TYPE_ICONS[contact.category] || Users;
  const category = CONTACT_CATEGORIES.find(c => c.id === contact.category);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{contact.first_name} {contact.last_name}</p>
              {contact.company_name && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {contact.company_name}
                </p>
              )}
              <Badge variant="outline" className="mt-1 text-xs">
                {category?.label || contact.category}
              </Badge>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="mt-3 pt-3 border-t flex flex-wrap gap-3 text-xs text-gray-500">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-emerald-600">
              <Mail className="w-3 h-3" />{contact.email}
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-emerald-600">
              <Phone className="w-3 h-3" />{contact.phone}
            </a>
          )}
        </div>
        {contact.is_primary && (
          <Badge className="mt-2 bg-emerald-600 text-white text-xs">Primary Contact</Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsPage;
