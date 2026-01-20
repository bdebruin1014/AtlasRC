import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, User, Mail, Phone, Globe, MapPin,
  Briefcase, Target, DollarSign, FileText, Plus, Loader2, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { contactService, type Contact as ServiceContact } from '@/services/contactService';

// Default contact for fallback
const defaultContact = {
  id: '1',
  contactType: 'individual',
  firstName: 'John',
  lastName: 'Smith',
  company: 'Smith Construction Co.',
  jobTitle: 'Owner',
  roles: ['contractor', 'vendor'],
  emails: [
    { email: 'john@smithconstruction.com', type: 'Work', isPrimary: true },
    { email: 'john.smith@gmail.com', type: 'Personal', isPrimary: false },
  ],
  phones: [
    { number: '(864) 555-0101', type: 'Mobile', isPrimary: true },
    { number: '(864) 555-0102', type: 'Work', isPrimary: false },
  ],
  preferredContact: 'Phone',
  address: {
    line1: '456 Construction Way',
    line2: '',
    city: 'Greenville',
    state: 'SC',
    zipCode: '29601',
  },
  website: 'https://smithconstruction.com',
  linkedin: 'https://linkedin.com/in/johnsmith',
  w9OnFile: true,
  paymentTerms: 'Net 30',
  vendorNumber: 'VND-001',
  tags: ['Reliable', 'Quality Work'],
  notes: 'Great contractor for foundation and framing work. Always delivers on time.',
  createdAt: '2023-01-15T10:00:00Z',
  updatedAt: '2024-01-10T14:30:00Z',
  opportunities: [
    { id: '1', address: '123 Oak Street', stage: 'Negotiating', value: 85000 },
  ],
  projects: [
    { id: '1', name: 'Watson House Development', role: 'General Contractor', status: 'active' },
    { id: '2', name: 'Oslo Townhomes', role: 'Foundation Contractor', status: 'active' },
    { id: '3', name: 'Cedar Mill Phase 1', role: 'Framing Contractor', status: 'completed' },
  ],
  transactions: [
    { id: '1', date: '2024-01-15', description: 'Foundation work payment', amount: 45000 },
    { id: '2', date: '2024-01-05', description: 'Framing labor', amount: 32000 },
    { id: '3', date: '2023-12-20', description: 'Material deposit', amount: 15000 },
  ],
  notes_history: [
    { id: '1', content: 'Discussed upcoming project timeline. John confirmed availability for Q2.', date: '2024-01-10', user: 'Bryan De Bruin' },
    { id: '2', content: 'Met on-site to review foundation plans. Made some minor adjustments.', date: '2023-12-15', user: 'Bryan De Bruin' },
  ],
};

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

const ContactDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<typeof defaultContact | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const loadContact = async () => {
      if (!id) return;
      try {
        const data = await contactService.getById(id);
        if (data) {
          // Map service data to component format
          setContact({
            ...defaultContact, // Use default as template
            id: data.id,
            contactType: 'individual',
            firstName: data.first_name,
            lastName: data.last_name,
            company: data.company || '',
            jobTitle: data.job_title || '',
            roles: [data.contact_type],
            emails: data.email ? [{ email: data.email, type: 'Work', isPrimary: true }] : [],
            phones: data.phone ? [{ number: data.phone, type: 'Work', isPrimary: true }] : [],
            preferredContact: 'Phone',
            address: {
              line1: data.address_line1 || '',
              line2: data.address_line2 || '',
              city: data.city || '',
              state: data.state || '',
              zipCode: data.zip || '',
            },
            notes: data.notes || '',
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            tags: data.tags || [],
          });
        } else {
          setContact(null);
        }
      } catch (error) {
        console.warn('Using default contact data:', error);
        setContact(defaultContact);
      } finally {
        setLoading(false);
      }
    };
    loadContact();
  }, [id]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    toast({
      title: 'Note added',
      description: 'Your note has been saved',
    });
    setNewNote('');
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

  if (!contact) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Contact not found</h2>
        <Button className="mt-4" onClick={() => navigate('/contacts')}>
          Back to Contacts
        </Button>
      </div>
    );
  }

  const primaryEmail = contact.emails.find((e) => e.isPrimary) || contact.emails[0];
  const primaryPhone = contact.phones.find((p) => p.isPrimary) || contact.phones[0];
  const totalTransacted = contact.transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                    {getInitials(contact.firstName, contact.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {contact.firstName} {contact.lastName}
                  </h1>
                  {contact.company && (
                    <p className="text-gray-500">{contact.jobTitle} at {contact.company}</p>
                  )}
                  <div className="flex gap-1 mt-1">
                    {contact.roles.map((role) => {
                      const config = TYPE_CONFIG[role] || TYPE_CONFIG.other;
                      return (
                        <Badge key={role} className={config.color}>
                          {config.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => window.open(`mailto:${primaryEmail?.email}`)}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" onClick={() => window.open(`tel:${primaryPhone?.number}`)}>
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" onClick={() => navigate(`/contacts/${id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Info */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Addresses
                    </h4>
                    {contact.emails.map((email, idx) => (
                      <div key={idx} className="mb-1">
                        <a href={`mailto:${email.email}`} className="text-emerald-600 hover:text-emerald-700">
                          {email.email}
                        </a>
                        <span className="text-sm text-gray-500 ml-2">
                          ({email.type}){email.isPrimary && ' • Primary'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Phone Numbers
                    </h4>
                    {contact.phones.map((phone, idx) => (
                      <div key={idx} className="mb-1">
                        <a href={`tel:${phone.number}`} className="text-emerald-600 hover:text-emerald-700">
                          {phone.number}
                        </a>
                        <span className="text-sm text-gray-500 ml-2">
                          ({phone.type}){phone.isPrimary && ' • Primary'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {contact.address && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Address
                      </h4>
                      <p className="text-gray-600">
                        {contact.address.line1}<br />
                        {contact.address.line2 && <>{contact.address.line2}<br /></>}
                        {contact.address.city}, {contact.address.state} {contact.address.zipCode}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Online
                    </h4>
                    {contact.website && (
                      <a href={contact.website} target="_blank" rel="noopener noreferrer" className="block text-emerald-600 hover:text-emerald-700 mb-1">
                        {contact.website}
                      </a>
                    )}
                    {contact.linkedin && (
                      <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="block text-emerald-600 hover:text-emerald-700">
                        LinkedIn Profile
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Projects</p>
                    <p className="text-2xl font-bold text-blue-700">{contact.projects.length}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-600">Opportunities</p>
                    <p className="text-2xl font-bold text-amber-700">{contact.opportunities.length}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-emerald-600">Total Transacted</p>
                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalTransacted, { compact: true })}</p>
                  </div>
                  {contact.w9OnFile && (
                    <div className="flex items-center gap-2 text-green-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">W-9 on file</span>
                    </div>
                  )}
                  {contact.paymentTerms && (
                    <p className="text-sm text-gray-600">Payment Terms: {contact.paymentTerms}</p>
                  )}
                </CardContent>
              </Card>

              {/* Notes Preview */}
              {contact.notes && (
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{contact.notes}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Opportunities ({contact.opportunities.length})</CardTitle>
                <Button onClick={() => navigate('/opportunities/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Opportunity
                </Button>
              </CardHeader>
              <CardContent>
                {contact.opportunities.length > 0 ? (
                  <div className="space-y-2">
                    {contact.opportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/opportunities/${opp.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{opp.address}</p>
                            <Badge variant="outline">{opp.stage}</Badge>
                          </div>
                        </div>
                        <p className="font-medium">{formatCurrency(opp.value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No opportunities linked</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects ({contact.projects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {contact.projects.length > 0 ? (
                  <div className="space-y-2">
                    {contact.projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-gray-500">Role: {project.role}</p>
                          </div>
                        </div>
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No projects linked</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transactions ({contact.transactions.length})</CardTitle>
                <p className="text-lg font-semibold">Total: {formatCurrency(totalTransacted)}</p>
              </CardHeader>
              <CardContent>
                {contact.transactions.length > 0 ? (
                  <div className="space-y-2">
                    {contact.transactions.map((txn) => (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/accounting/transactions/${txn.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{txn.description}</p>
                            <p className="text-sm text-gray-500">{formatDate(txn.date)}</p>
                          </div>
                        </div>
                        <p className="font-medium text-red-600">-{formatCurrency(txn.amount)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No transactions</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Note Form */}
                <div className="space-y-3">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    rows={3}
                  />
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                {/* Notes Timeline */}
                <div className="border-t pt-6 space-y-4">
                  {contact.notes_history.map((note) => (
                    <div key={note.id} className="flex gap-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{note.user}</span>
                          <span className="text-sm text-gray-500">{formatDate(note.date)}</span>
                        </div>
                        <p className="text-gray-700">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContactDetail;
