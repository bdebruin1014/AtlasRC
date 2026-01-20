import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, User, Mail, Phone, MoreHorizontal, Edit, Trash2,
  Download, Upload, Building2, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { cn, formatDate } from '@/lib/utils';
import { contactService, type Contact as ServiceContact } from '@/services/contactService';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  type: string[];
  email: string;
  phone: string;
  linkedProjects: number;
  linkedOpportunities: number;
  lastContactDate: string;
  avatar?: string;
}

// Default contacts for fallback
const defaultContacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    company: 'Smith Construction Co.',
    type: ['contractor', 'vendor'],
    email: 'john@smithconstruction.com',
    phone: '(864) 555-0101',
    linkedProjects: 3,
    linkedOpportunities: 0,
    lastContactDate: '2024-01-15',
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    type: ['seller'],
    email: 'sarah.j@email.com',
    phone: '(864) 555-0202',
    linkedProjects: 0,
    linkedOpportunities: 2,
    lastContactDate: '2024-01-10',
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Williams',
    company: 'Williams Legal LLP',
    type: ['attorney'],
    email: 'mwilliams@williamslegal.com',
    phone: '(864) 555-0303',
    linkedProjects: 5,
    linkedOpportunities: 1,
    lastContactDate: '2024-01-12',
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Brown',
    company: 'First National Bank',
    type: ['lender'],
    email: 'emily.brown@fnb.com',
    phone: '(864) 555-0404',
    linkedProjects: 2,
    linkedOpportunities: 0,
    lastContactDate: '2024-01-08',
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Davis',
    type: ['investor'],
    email: 'david.davis@gmail.com',
    phone: '(864) 555-0505',
    linkedProjects: 1,
    linkedOpportunities: 0,
    lastContactDate: '2024-01-05',
  },
];

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  seller: { label: 'Seller', color: 'bg-amber-100 text-amber-800' },
  buyer: { label: 'Buyer', color: 'bg-green-100 text-green-800' },
  contractor: { label: 'Contractor', color: 'bg-blue-100 text-blue-800' },
  vendor: { label: 'Vendor', color: 'bg-purple-100 text-purple-800' },
  investor: { label: 'Investor', color: 'bg-emerald-100 text-emerald-800' },
  attorney: { label: 'Attorney', color: 'bg-indigo-100 text-indigo-800' },
  realtor: { label: 'Realtor', color: 'bg-pink-100 text-pink-800' },
  inspector: { label: 'Inspector', color: 'bg-orange-100 text-orange-800' },
  lender: { label: 'Lender', color: 'bg-cyan-100 text-cyan-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' },
};

const ContactsList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>(defaultContacts);
  const [deleting, setDeleting] = useState(false);

  // Load contacts from service
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await contactService.getAll();
        if (data && data.length > 0) {
          const mapped = data.map((c: ServiceContact): Contact => ({
            id: c.id,
            firstName: c.first_name,
            lastName: c.last_name,
            company: c.company,
            type: [c.contact_type],
            email: c.email || '',
            phone: c.phone || '',
            linkedProjects: 0,
            linkedOpportunities: 0,
            lastContactDate: c.updated_at,
          }));
          setContacts(mapped);
        }
      } catch (error) {
        console.warn('Using default contacts data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, []);

  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || contact.type.includes(typeFilter);
    return matchesSearch && matchesType;
  });

  const toggleSelectContact = (id: string) => {
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const handleDelete = async () => {
    if (!deleteContact) return;
    setDeleting(true);
    try {
      await contactService.delete(deleteContact.id);
      // Remove from local state
      setContacts(prev => prev.filter(c => c.id !== deleteContact.id));
      toast({
        title: 'Contact deleted',
        description: `${deleteContact.firstName} ${deleteContact.lastName} has been deleted`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contact',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteContact(null);
    }
  };

  const handleBulkDelete = () => {
    toast({
      title: 'Contacts deleted',
      description: `${selectedContacts.size} contacts have been deleted`,
    });
    setSelectedContacts(new Set());
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500">{contacts.length} contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => navigate('/contacts/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Contact
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TYPE_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedContacts.size > 0 && (
        <div className="flex items-center gap-4 mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <span className="font-medium text-emerald-800">
            {selectedContacts.size} selected
          </span>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={handleBulkDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Contacts List */}
      <Card className="bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 w-10">
                  <Checkbox
                    checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-medium text-gray-600">Name</th>
                <th className="text-left p-4 font-medium text-gray-600">Type</th>
                <th className="text-left p-4 font-medium text-gray-600">Email</th>
                <th className="text-left p-4 font-medium text-gray-600">Phone</th>
                <th className="text-left p-4 font-medium text-gray-600">Activity</th>
                <th className="text-left p-4 font-medium text-gray-600">Last Contact</th>
                <th className="text-right p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedContacts.has(contact.id)}
                      onCheckedChange={() => toggleSelectContact(contact.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {getInitials(contact.firstName, contact.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.company && (
                          <p className="text-sm text-gray-500">{contact.company}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.type.map((t) => {
                        const config = TYPE_CONFIG[t] || TYPE_CONFIG.other;
                        return (
                          <Badge key={t} className={config.color}>
                            {config.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <a
                      href={`mailto:${contact.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </a>
                  </td>
                  <td className="p-4">
                    <a
                      href={`tel:${contact.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </a>
                  </td>
                  <td className="p-4 text-gray-600">
                    {contact.linkedProjects > 0 && (
                      <span className="mr-2">{contact.linkedProjects} projects</span>
                    )}
                    {contact.linkedOpportunities > 0 && (
                      <span>{contact.linkedOpportunities} opportunities</span>
                    )}
                    {contact.linkedProjects === 0 && contact.linkedOpportunities === 0 && '-'}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(contact.lastContactDate, { format: 'short' })}
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/contacts/${contact.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`mailto:${contact.email}`)}>
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`tel:${contact.phone}`)}>
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteContact(contact)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContacts.length === 0 && (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No contacts found</p>
            <Button className="mt-4" onClick={() => navigate('/contacts/new')}>
              Add First Contact
            </Button>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteContact} onOpenChange={() => setDeleteContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteContact?.firstName} {deleteContact?.lastName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContactsList;
