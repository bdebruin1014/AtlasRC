// src/pages/accounting/EntityCommunicationsPage.jsx
// Entity Communications page for email and communication history

import React, { useState, useMemo } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Mail, MessageSquare, Phone, Video, Users, FileText,
  Search, MoreHorizontal, ArrowDownLeft, ArrowUpRight,
  Calendar, Clock, User, Paperclip, Star, Trash2, Eye,
  RefreshCw, ExternalLink, Reply, Forward, AlertCircle
} from 'lucide-react';
import { getOutlookConnection, getEmails, formatEmailDate } from '@/services/outlookService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import ComposeEmailModal from '@/components/accounting/ComposeEmailModal';
import LogCommunicationModal from '@/components/accounting/LogCommunicationModal';

// Demo communications data
const demoCommunications = [
  {
    id: 'C-001',
    type: 'email',
    direction: 'outbound',
    subject: 'Q4 Financial Statement Request',
    contact_name: 'John Smith',
    contact_email: 'john.smith@bank.com',
    communication_date: '2025-01-20T14:30:00Z',
    outcome: 'completed',
    notes: 'Requested Q4 financial statements for annual review.',
  },
  {
    id: 'C-002',
    type: 'phone_call',
    direction: 'inbound',
    subject: 'Insurance Renewal Discussion',
    contact_name: 'Sarah Johnson',
    contact_email: 'sarah@insurance.com',
    contact_phone: '(555) 123-4567',
    communication_date: '2025-01-18T10:15:00Z',
    duration_minutes: 25,
    outcome: 'scheduled_followup',
    notes: 'Discussed renewal options. Need to review coverage amounts.',
  },
  {
    id: 'C-003',
    type: 'meeting',
    direction: 'outbound',
    subject: 'Annual Audit Planning',
    contact_name: 'Michael Chen',
    contact_email: 'mchen@auditfirm.com',
    communication_date: '2025-01-15T09:00:00Z',
    duration_minutes: 60,
    outcome: 'completed',
    notes: 'Met to discuss audit timeline and document requirements.',
  },
  {
    id: 'C-004',
    type: 'email',
    direction: 'inbound',
    subject: 'Property Tax Assessment Notice',
    contact_name: 'County Assessor',
    contact_email: 'assessor@county.gov',
    communication_date: '2025-01-12T08:00:00Z',
    outcome: 'action_required',
    notes: 'Received assessment notice. Review deadline in 30 days.',
  },
  {
    id: 'C-005',
    type: 'note',
    direction: 'internal',
    subject: 'Reconciliation Complete',
    contact_name: null,
    communication_date: '2025-01-10T16:45:00Z',
    outcome: 'completed',
    notes: 'Completed December bank reconciliation. All accounts balanced.',
  },
];

const COMMUNICATION_ICONS = {
  email: Mail,
  phone_call: Phone,
  video_call: Video,
  meeting: Users,
  note: FileText,
};

const COMMUNICATION_COLORS = {
  email: 'text-amber-600 bg-amber-100',
  phone_call: 'text-green-600 bg-green-100',
  video_call: 'text-blue-600 bg-blue-100',
  meeting: 'text-purple-600 bg-purple-100',
  note: 'text-gray-600 bg-gray-100',
};

const OUTCOME_BADGES = {
  completed: { label: 'Completed', class: 'bg-green-100 text-green-800' },
  left_message: { label: 'Left Message', class: 'bg-blue-100 text-blue-800' },
  no_answer: { label: 'No Answer', class: 'bg-gray-100 text-gray-800' },
  scheduled_followup: { label: 'Follow-up', class: 'bg-amber-100 text-amber-800' },
  action_required: { label: 'Action Required', class: 'bg-red-100 text-red-800' },
};

export default function EntityCommunicationsPage() {
  const { entityId } = useParams();
  const context = useOutletContext();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedCommunication, setSelectedCommunication] = useState(null);

  // Check Outlook connection
  const { data: outlookConnection } = useQuery({
    queryKey: ['outlook-connection', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await getOutlookConnection(user.id);
      return data;
    },
  });

  // Fetch communications
  const { data: communications = [], isLoading, refetch } = useQuery({
    queryKey: ['entity-communications', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('entity_communications')
          .select('*')
          .eq('entity_id', entityId)
          .order('communication_date', { ascending: false });

        if (error) throw error;
        return data || demoCommunications;
      } catch (err) {
        console.error('Error fetching communications:', err);
        return demoCommunications;
      }
    },
  });

  // Fetch linked emails from Outlook
  const { data: outlookEmails = [] } = useQuery({
    queryKey: ['entity-outlook-emails', entityId, user?.id],
    queryFn: async () => {
      if (!user?.id || !outlookConnection?.is_connected) return [];
      // In production, would search emails by entity contacts
      const { data } = await getEmails(user.id, { top: 20 });
      return data || [];
    },
    enabled: !!outlookConnection?.is_connected,
  });

  // Filter communications
  const filteredCommunications = useMemo(() => {
    let filtered = communications;

    if (activeTab !== 'all') {
      if (activeTab === 'emails') {
        filtered = filtered.filter(c => c.type === 'email');
      } else if (activeTab === 'calls') {
        filtered = filtered.filter(c => c.type === 'phone_call' || c.type === 'video_call');
      } else if (activeTab === 'meetings') {
        filtered = filtered.filter(c => c.type === 'meeting');
      } else if (activeTab === 'notes') {
        filtered = filtered.filter(c => c.type === 'note');
      }
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [communications, activeTab, filterType, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const total = communications.length;
    const emails = communications.filter(c => c.type === 'email').length;
    const calls = communications.filter(c => c.type === 'phone_call' || c.type === 'video_call').length;
    const meetings = communications.filter(c => c.type === 'meeting').length;
    const actionRequired = communications.filter(c => c.outcome === 'action_required').length;

    return { total, emails, calls, meetings, actionRequired };
  }, [communications]);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('entity_communications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entity-communications', entityId]);
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Communications</h1>
          <p className="text-muted-foreground">Email and communication history</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowLogModal(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Log Communication
          </Button>
          <Button onClick={() => setShowEmailModal(true)}>
            <Mail className="h-4 w-4 mr-2" />
            New Email
          </Button>
        </div>
      </div>

      {/* Outlook Connection Status */}
      {!outlookConnection?.is_connected && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <Mail className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium text-blue-800">Connect Outlook</p>
            <p className="text-sm text-blue-700">
              Connect your Outlook account in Settings to send emails directly from Atlas.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Connect
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Emails</p>
              <p className="text-2xl font-bold text-amber-600">{stats.emails}</p>
            </div>
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Calls</p>
              <p className="text-2xl font-bold text-green-600">{stats.calls}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Meetings</p>
              <p className="text-2xl font-bold text-purple-600">{stats.meetings}</p>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Action Required</p>
              <p className="text-2xl font-bold text-red-600">{stats.actionRequired}</p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone_call">Phone Call</SelectItem>
            <SelectItem value="video_call">Video Call</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Communications Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading communications...
                </TableCell>
              </TableRow>
            ) : filteredCommunications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No communications found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLogModal(true)}
                    >
                      Log Communication
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCommunications.map((comm) => {
                const Icon = COMMUNICATION_ICONS[comm.type] || MessageSquare;
                const colorClass = COMMUNICATION_COLORS[comm.type] || 'text-gray-600 bg-gray-100';
                const outcomeBadge = OUTCOME_BADGES[comm.outcome];

                return (
                  <TableRow key={comm.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        colorClass.split(' ')[1]
                      )}>
                        <Icon className={cn("h-4 w-4", colorClass.split(' ')[0])} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comm.subject || 'No subject'}</span>
                          {comm.direction === 'inbound' && (
                            <ArrowDownLeft className="h-3 w-3 text-blue-500" />
                          )}
                          {comm.direction === 'outbound' && (
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                        {comm.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-md">
                            {comm.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {comm.contact_name ? (
                        <div>
                          <p className="font-medium text-sm">{comm.contact_name}</p>
                          {comm.contact_email && (
                            <p className="text-xs text-muted-foreground">{comm.contact_email}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(comm.communication_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDuration(comm.duration_minutes) || '-'}
                    </TableCell>
                    <TableCell>
                      {outcomeBadge && (
                        <Badge className={cn('text-xs', outcomeBadge.class)}>
                          {outcomeBadge.label}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {comm.type === 'email' && (
                            <>
                              <DropdownMenuItem>
                                <Reply className="h-4 w-4 mr-2" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Forward className="h-4 w-4 mr-2" />
                                Forward
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate(comm.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <ComposeEmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        entityId={entityId}
      />
      <LogCommunicationModal
        open={showLogModal}
        onClose={() => setShowLogModal(false)}
        entityId={entityId}
      />
    </div>
  );
}
