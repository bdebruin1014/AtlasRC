import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Edit2, Trash2, Phone, Mail,
  MoreVertical, Search, User, Star, StarOff, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const CONTACT_ROLES = [
  { id: 'seller', name: 'Seller', color: 'bg-blue-100 text-blue-800' },
  { id: 'listing_broker', name: 'Listing Broker', color: 'bg-purple-100 text-purple-800' },
  { id: 'attorney', name: 'Attorney', color: 'bg-amber-100 text-amber-800' },
  { id: 'title_company', name: 'Title Company', color: 'bg-green-100 text-green-800' },
  { id: 'surveyor', name: 'Surveyor', color: 'bg-teal-100 text-teal-800' },
  { id: 'environmental', name: 'Environmental', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'lender', name: 'Lender', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'other', name: 'Other', color: 'bg-gray-100 text-gray-800' },
];

const getRoleStyle = (roleId) => {
  const role = CONTACT_ROLES.find(r => r.id === roleId);
  return role?.color || 'bg-gray-100 text-gray-800';
};

const getRoleName = (roleId) => {
  const role = CONTACT_ROLES.find(r => r.id === roleId);
  return role?.name || roleId;
};

export default function OpportunityContacts({ opportunity }) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    phone: '',
    email: '',
    notes: '',
    is_primary: false,
  });

  const opportunityId = opportunity?.id;

  // Load contacts
  useEffect(() => {
    if (opportunityId) {
      loadContacts();
    } else {
      const demoContacts = getDemoContacts();
      setContacts(demoContacts);
      setLoading(false);
    }
  }, [opportunityId, opportunity]);

  const getDemoContacts = () => {
    const baseContacts = [];

    if (opportunity?.seller_name) {
      baseContacts.push({
        id: 'seller-1',
        name: opportunity.seller_name,
        role: 'seller',
        company: '',
        phone: opportunity.seller_phone || '',
        email: opportunity.seller_email || '',
        is_primary: true,
      });
    }

    if (opportunity?.broker) {
      baseContacts.push({
        id: 'broker-1',
        name: opportunity.broker,
        role: 'listing_broker',
        company: opportunity.brokerCompany || '',
        phone: opportunity.brokerPhone || '',
        email: opportunity.brokerEmail || '',
        is_primary: false,
      });
    }

    return [
      ...baseContacts,
      {
        id: 'mock-1',
        name: 'Robert Smith',
        role: 'attorney',
        company: 'Smith & Associates',
        phone: '(864) 555-0200',
        email: 'rsmith@smithlaw.com',
        is_primary: false,
      },
      {
        id: 'mock-2',
        name: 'Sarah Johnson',
        role: 'title_company',
        company: 'First American Title',
        phone: '(864) 555-0300',
        email: 'sjohnson@firstamerican.com',
        is_primary: false,
      },
    ];
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunity_contacts')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setContacts(getDemoContacts());
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', role: '', company: '', phone: '', email: '', notes: '', is_primary: false });
  };

  const handleAdd = () => {
    resetForm();
    setEditingContact(null);
    setShowAddDialog(true);
  };

  const handleEdit = (contact) => {
    setFormData({
      name: contact.name || '',
      role: contact.role || '',
      company: contact.company || '',
      phone: contact.phone || '',
      email: contact.email || '',
      notes: contact.notes || '',
      is_primary: contact.is_primary || false,
    });
    setEditingContact(contact);
    setShowAddDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Name required', description: 'Please enter a contact name.', variant: 'destructive' });
      return;
    }

    if (!formData.role) {
      toast({ title: 'Role required', description: 'Please select a role for this contact.', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      const contactData = {
        opportunity_id: opportunityId,
        name: formData.name,
        role: formData.role,
        company: formData.company,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        is_primary: formData.is_primary,
      };

      if (editingContact) {
        if (opportunityId && supabase) {
          const { error } = await supabase
            .from('opportunity_contacts')
            .update(contactData)
            .eq('id', editingContact.id);
          if (error) throw error;
        }

        setContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...contactData } : c));
        toast({ title: 'Contact Updated', description: `"${formData.name}" has been updated.` });
      } else {
        let newContact;

        if (opportunityId && supabase) {
          const { data, error } = await supabase
            .from('opportunity_contacts')
            .insert(contactData)
            .select()
            .single();
          if (error) throw error;
          newContact = data;
        } else {
          newContact = { id: Date.now(), ...contactData, created_at: new Date().toISOString() };
        }

        setContacts(prev => [...prev, newContact]);
        toast({ title: 'Contact Added', description: `"${formData.name}" has been added.` });
      }

      setShowAddDialog(false);
      resetForm();
      setEditingContact(null);

    } catch (err) {
      console.error('Save error:', err);
      toast({ title: 'Save Failed', description: 'There was an error saving the contact.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contact) => {
    if (!confirm(`Are you sure you want to remove "${contact.name}" from this opportunity?`)) return;

    try {
      if (opportunityId && supabase) {
        const { error } = await supabase.from('opportunity_contacts').delete().eq('id', contact.id);
        if (error) throw error;
      }

      setContacts(prev => prev.filter(c => c.id !== contact.id));
      toast({ title: 'Contact Removed', description: `"${contact.name}" has been removed.` });
    } catch (err) {
      console.error('Delete error:', err);
      toast({ title: 'Delete Failed', description: 'There was an error removing the contact.', variant: 'destructive' });
    }
  };

  const togglePrimary = async (contact) => {
    try {
      const newPrimaryState = !contact.is_primary;

      if (opportunityId && supabase) {
        if (newPrimaryState) {
          await supabase
            .from('opportunity_contacts')
            .update({ is_primary: false })
            .eq('opportunity_id', opportunityId)
            .eq('role', contact.role);
        }
        await supabase.from('opportunity_contacts').update({ is_primary: newPrimaryState }).eq('id', contact.id);
      }

      setContacts(prev => prev.map(c => {
        if (newPrimaryState && c.role === contact.role && c.id !== contact.id) return { ...c, is_primary: false };
        if (c.id === contact.id) return { ...c, is_primary: newPrimaryState };
        return c;
      }));

      toast({
        title: newPrimaryState ? 'Primary Contact Set' : 'Primary Status Removed',
        description: `"${contact.name}" is ${newPrimaryState ? 'now' : 'no longer'} the primary ${getRoleName(contact.role)}.`,
      });
    } catch (err) {
      console.error('Toggle primary error:', err);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading contacts...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
          <p className="text-sm text-gray-500">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} associated with this opportunity
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#047857] hover:bg-[#065f46]">
          <Plus className="w-4 h-4 mr-2" />Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      {/* Contacts Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#047857]">{contact.name}</span>
                      {contact.is_primary && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={cn("text-xs", getRoleStyle(contact.role))}>{getRoleName(contact.role)}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{contact.company || '—'}</td>
                <td className="px-4 py-3">
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3" />{contact.phone}
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-3">
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Mail className="w-3 h-3" />{contact.email}
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(contact)}>
                        <Edit2 className="w-4 h-4 mr-2" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePrimary(contact)}>
                        {contact.is_primary ? (<><StarOff className="w-4 h-4 mr-2" />Remove Primary</>) : (<><Star className="w-4 h-4 mr-2" />Set as Primary</>)}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(contact)}>
                        <Trash2 className="w-4 h-4 mr-2" />Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredContacts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No contacts found</p>
            <p className="text-sm mt-1">Add contacts to track sellers, brokers, attorneys, and other parties.</p>
            <Button onClick={handleAdd} className="mt-4 bg-[#047857] hover:bg-[#065f46]">
              <Plus className="w-4 h-4 mr-2" />Add First Contact
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
            <DialogDescription>
              {editingContact ? 'Update contact information' : 'Add a new contact for this opportunity'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {CONTACT_ROLES.map(role => (<SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Company name" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 555-0100" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" className="mt-1" />
              </div>

              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any additional notes about this contact..." className="mt-1" rows={3} />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="is_primary" checked={formData.is_primary} onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-[#047857] focus:ring-[#047857]" />
                <Label htmlFor="is_primary" className="font-normal">Set as primary contact for this role</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#047857] hover:bg-[#065f46]">
              {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (editingContact ? 'Update Contact' : 'Add Contact')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
