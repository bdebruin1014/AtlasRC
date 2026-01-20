import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Mail, Phone, Building2, User, MapPin, Download, Filter, Star, StarOff, MoreVertical, Users, Briefcase, HardHat, Landmark, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ContactsPage = ({ projectId }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const [contacts, setContacts] = useState([
    // Team
    { id: 1, name: 'Bryan VanRock', company: 'VanRock Holdings LLC', role: 'Developer / Sponsor', category: 'team', email: 'bryan@vanrock.com', phone: '(555) 123-4567', address: '123 Main St, Greenville, SC', starred: true, notes: 'Project lead and primary decision maker.' },
    { id: 2, name: 'Sarah Mitchell', company: 'VanRock Holdings LLC', role: 'Project Manager', category: 'team', email: 'sarah@vanrock.com', phone: '(555) 123-4568', starred: true, notes: '' },
    
    // Contractors
    { id: 3, name: 'Mike Johnson', company: 'Johnson Construction', role: 'General Contractor', category: 'contractor', email: 'mike@johnsonconstruction.com', phone: '(555) 234-5678', address: '456 Builder Ln, Greenville, SC', starred: true, notes: 'Primary GC for all VanRock projects.' },
    { id: 4, name: 'Tom Wilson', company: 'Sparks Electric', role: 'Electrical Contractor', category: 'contractor', email: 'tom@sparkselectric.com', phone: '(555) 333-4444', starred: false, notes: '' },
    { id: 5, name: 'Dave Brown', company: 'Cool Air HVAC', role: 'HVAC Contractor', category: 'contractor', email: 'dave@coolairhvac.com', phone: '(555) 444-5555', starred: false, notes: '' },
    { id: 6, name: 'Carlos Garcia', company: 'ABC Plumbing', role: 'Plumbing Contractor', category: 'contractor', email: 'carlos@abcplumbing.com', phone: '(555) 555-6666', starred: false, notes: '' },
    { id: 7, name: 'Steve Miller', company: 'Top Roofing', role: 'Roofing Contractor', category: 'contractor', email: 'steve@toproofing.com', phone: '(555) 666-7777', starred: false, notes: '' },
    
    // Consultants
    { id: 8, name: 'Robert Chen', company: 'Johnson Architects', role: 'Architect', category: 'consultant', email: 'rchen@johnsonarch.com', phone: '(555) 777-8888', starred: true, notes: 'Lead architect on project.' },
    { id: 9, name: 'Lisa Park', company: 'Structural Solutions', role: 'Structural Engineer', category: 'consultant', email: 'lpark@structuralsolutions.com', phone: '(555) 888-9999', starred: false, notes: '' },
    { id: 10, name: 'James Wright', company: 'Civil Engineering Inc', role: 'Civil Engineer', category: 'consultant', email: 'jwright@civileng.com', phone: '(555) 999-0000', starred: false, notes: '' },
    { id: 11, name: 'Amanda Torres', company: 'MEP Consultants', role: 'MEP Engineer', category: 'consultant', email: 'atorres@mepconsult.com', phone: '(555) 111-2223', starred: false, notes: '' },
    
    // Lenders
    { id: 12, name: 'Sarah Mitchell', company: 'First National Bank', role: 'Loan Officer', category: 'lender', email: 'smitchell@fnb.com', phone: '(555) 123-4567', starred: true, notes: 'Primary contact for construction loan.' },
    { id: 13, name: 'David Lee', company: 'First National Bank', role: 'Credit Analyst', category: 'lender', email: 'dlee@fnb.com', phone: '(555) 123-4569', starred: false, notes: '' },
    
    // Legal/Title
    { id: 14, name: 'Jennifer Adams', company: 'Adams Law Group', role: 'Real Estate Attorney', category: 'legal', email: 'jadams@adamslaw.com', phone: '(555) 222-3334', starred: true, notes: 'Handles all project legal matters.' },
    { id: 15, name: 'Mark Thompson', company: 'First American Title', role: 'Title Officer', category: 'legal', email: 'mthompson@firstam.com', phone: '(555) 333-4445', starred: false, notes: '' },
    
    // Sales/Realtors
    { id: 16, name: 'Sarah Agent', company: 'Premier Realty', role: 'Listing Agent', category: 'sales', email: 'sagent@premierrealty.com', phone: '(555) 444-5556', starred: true, notes: 'Exclusive listing agent for project.' },
    { id: 17, name: 'John Realtor', company: 'Premier Realty', role: 'Sales Agent', category: 'sales', email: 'jrealtor@premierrealty.com', phone: '(555) 444-5557', starred: false, notes: '' },
    
    // Investors
    { id: 18, name: 'Johnson Family Trust', company: 'Johnson Family Office', role: 'LP Investor', category: 'investor', email: 'investments@johnsonfamily.com', phone: '(555) 888-9999', starred: true, notes: '16% ownership stake.' },
    { id: 19, name: 'Smith Capital Partners', company: 'Smith Capital', role: 'LP Investor', category: 'investor', email: 'invest@smithcapital.com', phone: '(555) 999-1111', starred: false, notes: '8% ownership stake.' },
    { id: 20, name: 'Davis Investment Group', company: 'Davis Investments', role: 'LP Investor', category: 'investor', email: 'info@davisinvest.com', phone: '(555) 111-2222', starred: false, notes: '4% ownership stake.' },
    
    // Government
    { id: 21, name: 'Planning Department', company: 'City of Greenville', role: 'Planning & Zoning', category: 'government', email: 'planning@greenvillesc.gov', phone: '(555) 000-1111', starred: false, notes: '' },
    { id: 22, name: 'Building Department', company: 'City of Greenville', role: 'Building Inspections', category: 'government', email: 'building@greenvillesc.gov', phone: '(555) 000-2222', starred: false, notes: '' },
  ]);

  const [newContact, setNewContact] = useState({
    name: '',
    company: '',
    role: '',
    category: 'contractor',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const categories = [
    { id: 'all', name: 'All Contacts', icon: Users },
    { id: 'team', name: 'Team', icon: Briefcase },
    { id: 'contractor', name: 'Contractors', icon: HardHat },
    { id: 'consultant', name: 'Consultants', icon: User },
    { id: 'lender', name: 'Lenders', icon: Landmark },
    { id: 'legal', name: 'Legal/Title', icon: Building2 },
    { id: 'sales', name: 'Sales/Realtors', icon: Home },
    { id: 'investor', name: 'Investors', icon: Users },
    { id: 'government', name: 'Government', icon: Building2 },
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'team': return 'bg-purple-100 text-purple-700';
      case 'contractor': return 'bg-orange-100 text-orange-700';
      case 'consultant': return 'bg-blue-100 text-blue-700';
      case 'lender': return 'bg-green-100 text-green-700';
      case 'legal': return 'bg-gray-100 text-gray-700';
      case 'sales': return 'bg-pink-100 text-pink-700';
      case 'investor': return 'bg-amber-100 text-amber-700';
      case 'government': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesCategory = filterCategory === 'all' || contact.category === filterCategory;
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const starredContacts = contacts.filter(c => c.starred);

  const toggleStar = (contactId) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, starred: !c.starred } : c));
  };

  const handleSaveContact = () => {
    const contact = {
      id: contacts.length + 1,
      ...newContact,
      starred: false,
    };
    setContacts(prev => [...prev, contact]);
    setShowContactModal(false);
    setNewContact({ name: '', company: '', role: '', category: 'contractor', email: '', phone: '', address: '', notes: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Project Contacts</h1>
          <p className="text-sm text-gray-500">{contacts.length} contacts • {starredContacts.length} starred</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowContactModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Contact
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search contacts..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode('list')} className={cn("px-3 py-1.5 rounded text-sm", viewMode === 'list' && "bg-white shadow")}>
              List
            </button>
            <button onClick={() => setViewMode('grid')} className={cn("px-3 py-1.5 rounded text-sm", viewMode === 'grid' && "bg-white shadow")}>
              Grid
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Category Sidebar */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Categories</h3>
          <div className="space-y-1">
            {categories.map(cat => {
              const Icon = cat.icon;
              const count = cat.id === 'all' ? contacts.length : contacts.filter(c => c.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm", filterCategory === cat.id ? "bg-[#047857] text-white" : "hover:bg-gray-100")}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{cat.name}</span>
                  <span className={cn("text-xs", filterCategory === cat.id ? "text-green-100" : "text-gray-400")}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Starred Contacts */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Starred</h4>
            <div className="space-y-2">
              {starredContacts.slice(0, 5).map(contact => (
                <div key={contact.id} className="flex items-center gap-2 text-sm">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="truncate">{contact.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contacts List/Grid */}
        <div className="col-span-4">
          {viewMode === 'list' ? (
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="w-8 px-4 py-3"></th>
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Company</th>
                    <th className="text-left px-4 py-3 font-medium">Role</th>
                    <th className="text-left px-4 py-3 font-medium">Category</th>
                    <th className="text-left px-4 py-3 font-medium">Contact</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button onClick={() => toggleStar(contact.id)}>
                          {contact.starred ? (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-300 hover:text-amber-500" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="font-medium">{contact.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{contact.company}</td>
                      <td className="px-4 py-3 text-gray-600">{contact.role}</td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-1 rounded text-xs capitalize", getCategoryColor(contact.category))}>
                          {contact.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <a href={`mailto:${contact.email}`} className="p-1 hover:bg-gray-100 rounded" title={contact.email}>
                            <Mail className="w-4 h-4 text-gray-500" />
                          </a>
                          <a href={`tel:${contact.phone}`} className="p-1 hover:bg-gray-100 rounded" title={contact.phone}>
                            <Phone className="w-4 h-4 text-gray-500" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedContact(contact)}>
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.role}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleStar(contact.id)}>
                      {contact.starred ? (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{contact.company}</p>
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getCategoryColor(contact.category))}>
                    {contact.category}
                  </span>
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <a href={`mailto:${contact.email}`} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200">
                      <Mail className="w-4 h-4" />Email
                    </a>
                    <a href={`tel:${contact.phone}`} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200">
                      <Phone className="w-4 h-4" />Call
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Add Contact</h3>
              <button onClick={() => setShowContactModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Name *</label>
                <Input value={newContact.name} onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Company</label>
                  <Input value={newContact.company} onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))} placeholder="Company name" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Role</label>
                  <Input value={newContact.role} onChange={(e) => setNewContact(prev => ({ ...prev, role: e.target.value }))} placeholder="Job title / role" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Category *</label>
                <select className="w-full border rounded-md px-3 py-2" value={newContact.category} onChange={(e) => setNewContact(prev => ({ ...prev, category: e.target.value }))}>
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Email</label>
                  <Input type="email" value={newContact.email} onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Phone</label>
                  <Input value={newContact.phone} onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))} placeholder="(555) 123-4567" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Address</label>
                <Input value={newContact.address} onChange={(e) => setNewContact(prev => ({ ...prev, address: e.target.value }))} placeholder="Street address, city, state" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={newContact.notes} onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowContactModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSaveContact}>Add Contact</Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Contact Details</h3>
              <button onClick={() => setSelectedContact(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold">{selectedContact.name}</h4>
                    {selectedContact.starred && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-gray-600">{selectedContact.role}</p>
                  <span className={cn("px-2 py-1 rounded text-xs capitalize mt-1 inline-block", getCategoryColor(selectedContact.category))}>
                    {selectedContact.category}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{selectedContact.company}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${selectedContact.email}`} className="text-[#047857] hover:underline">{selectedContact.email}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${selectedContact.phone}`} className="text-[#047857] hover:underline">{selectedContact.phone}</a>
                </div>
                {selectedContact.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{selectedContact.address}</span>
                  </div>
                )}
              </div>

              {selectedContact.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedContact.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setSelectedContact(null)}>Close</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
