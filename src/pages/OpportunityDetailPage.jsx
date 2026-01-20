import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, ChevronDown, FileText, Building2, Users, DollarSign, FolderOpen,
  ClipboardList, MapPin, Calculator, TrendingUp, Target, ArrowRight, Mail, MessageSquare,
  FileSignature, CheckCircle, Send, FileCheck, Plus, Calendar, Clock, Eye, Download,
  Phone, ExternalLink, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Import Deal Analyzer
import PipelineDealAnalyzer from '@/features/budgets/components/PipelineDealAnalyzer';

// Import Pipeline Page Components
import OpportunityOverview from '@/pages/pipeline/OpportunityOverview';
import OpportunityStageTracker from '@/pages/pipeline/OpportunityStageTracker';
import OpportunityContacts from '@/pages/pipeline/OpportunityContacts';
import OpportunityTasks from '@/pages/pipeline/OpportunityTasks';
import OpportunityPropertyDetails from '@/pages/pipeline/OpportunityPropertyDetails';
import OpportunityComparables from '@/pages/pipeline/OpportunityComparables';
import OpportunityFiles from '@/pages/pipeline/OpportunityFiles';

const OpportunityDetailPage = () => {
  const { toast } = useToast();
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedGroups, setExpandedGroups] = useState(['overview', 'stage-tracker', 'documents']);

  // Document management state
  const [mailingRecords, setMailingRecords] = useState([
    { id: '1', type: 'Letter', template: 'Initial Contact Letter', sentDate: '2024-12-15', status: 'delivered', trackingId: 'USPS-123456789' },
    { id: '2', type: 'Postcard', template: 'Follow-up Postcard', sentDate: '2024-12-28', status: 'in-transit', trackingId: 'USPS-987654321' },
    { id: '3', type: 'Letter', template: 'Offer Letter', sentDate: '2025-01-05', status: 'pending', trackingId: null },
  ]);

  const [communications, setCommunications] = useState([
    { id: '1', type: 'phone', direction: 'outbound', date: '2025-01-08 10:30 AM', contact: 'James Wilson', summary: 'Initial call to discuss property. Seller interested in offer.', duration: '12 min' },
    { id: '2', type: 'email', direction: 'inbound', date: '2025-01-09 2:15 PM', contact: 'James Wilson', summary: 'Seller sent property documents including survey and deed.', attachments: 2 },
    { id: '3', type: 'phone', direction: 'outbound', date: '2025-01-10 9:00 AM', contact: 'James Wilson', summary: 'Discussed offer terms. Seller agreed to $2M purchase price.', duration: '18 min' },
  ]);

  const [esignedDocs, setEsignedDocs] = useState([
    { id: '1', name: 'Purchase Agreement - 600 Heritage Way', status: 'completed', sentDate: '2025-01-10', completedDate: '2025-01-11', signers: [{ name: 'James Wilson', status: 'signed' }, { name: 'VanRock Holdings', status: 'signed' }] },
    { id: '2', name: 'Due Diligence Extension', status: 'pending', sentDate: '2025-01-12', completedDate: null, signers: [{ name: 'James Wilson', status: 'pending' }, { name: 'VanRock Holdings', status: 'signed' }] },
  ]);

  const [showMailingDialog, setShowMailingDialog] = useState(false);
  const [showCommDialog, setShowCommDialog] = useState(false);
  const [mailingSaving, setMailingSaving] = useState(false);
  const [commSaving, setCommSaving] = useState(false);

  const [newMailing, setNewMailing] = useState({ type: 'Letter', template: '', notes: '' });
  const [newComm, setNewComm] = useState({ type: 'phone', direction: 'outbound', contact: '', summary: '', duration: '' });

  // Updated stages per requirements
  const stages = [
    { id: 'prospecting', label: 'Prospecting', color: '#6B7280', description: 'Initial contact, sending letters/communications' },
    { id: 'contacted', label: 'Contacted', color: '#3B82F6', description: 'Seller responded, analyzing property' },
    { id: 'qualified', label: 'Qualified', color: '#F59E0B', description: 'Deal analyzed, preparing contract' },
    { id: 'negotiating', label: 'Negotiating', color: '#8B5CF6', description: 'Contract generation and e-sign' },
    { id: 'under-contract', label: 'Under Contract', color: '#10B981', description: 'Signed contract, ready to convert' },
  ];

  // Opportunity types matching project types
  const opportunityTypes = {
    'lot-dev': 'Lot Development',
    'for-sale-dev': 'For Sale Development',
    'btr-dev': 'BTR Development',
    'for-sale-lot': 'For Sale Lot Purchase',
    'btr-lot': 'BTR Lot Purchase',
    'fix-flip': 'Fix and Flip',
    'brrr': 'BRRR',
  };

  const opportunity = {
    id: opportunityId,
    name: '25-008-600 Heritage Way',
    type: 'lot-dev',
    stage: 'under-contract',
    acres: '25',
    askingPrice: 2100000,
    address: '600 Heritage Way',
    city: 'Mauldin',
    state: 'SC',
    zip: '29662',
    county: 'Greenville',
    parcelId: '0456-78-90-1234',
    zoning: 'R-3 Residential',
    potentialLots: 45,
    source: 'Direct Mail',
    team: 'Development Team',
    seller: {
      name: 'James Wilson',
      email: 'jwilson@email.com',
      phone: '(864) 555-0199',
    },
    buyer: {
      name: 'VanRock Holdings LLC',
      email: 'acquisitions@vanrock.com',
    },
    notes: 'Prime location for lot development. Seller motivated. Adjacent to new retail development.',
    ddDeadline: '2025-01-15',
    closeDate: '2025-02-28',
    earnestMoney: 50000,
    purchasePrice: 2000000,
    convertedToProject: null,
  };

  const sidebarGroups = [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'tasks', label: 'Tasks & Checklist', icon: ClipboardList },
        { id: 'property-details', label: 'Property Details', icon: MapPin },
        { id: 'contacts', label: 'Contacts', icon: Users },
        { id: 'comps', label: 'Comps', icon: TrendingUp },
        { id: 'deal-analyzer', label: 'Deal Analyzer', icon: Calculator },
      ]
    },
    {
      id: 'stage-tracker',
      label: 'Stage Tracker',
      items: [
        { id: 'stage-prospecting', label: 'Prospecting', icon: Target },
        { id: 'stage-contacted', label: 'Contacted', icon: MessageSquare },
        { id: 'stage-qualified', label: 'Qualified', icon: CheckCircle },
        { id: 'stage-negotiating', label: 'Negotiating', icon: FileSignature },
        { id: 'stage-under-contract', label: 'Under Contract', icon: FileCheck },
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      items: [
        { id: 'files', label: 'Files', icon: FolderOpen },
        { id: 'mailing', label: 'Mailing', icon: Mail },
        { id: 'communications', label: 'Communications', icon: MessageSquare },
        { id: 'esigned', label: 'E-Signed Documents', icon: FileSignature },
      ]
    },
  ];

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
    );
  };

  const handleAddMailing = async () => {
    if (!newMailing.template) {
      toast({ title: 'Error', description: 'Please select a template', variant: 'destructive' });
      return;
    }
    setMailingSaving(true);
    await new Promise(r => setTimeout(r, 500));
    const record = {
      id: String(Date.now()),
      type: newMailing.type,
      template: newMailing.template,
      sentDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      trackingId: null,
    };
    setMailingRecords(prev => [record, ...prev]);
    setShowMailingDialog(false);
    setNewMailing({ type: 'Letter', template: '', notes: '' });
    setMailingSaving(false);
    toast({ title: 'Mailing Created', description: 'Mail piece has been queued for sending.' });
  };

  const handleAddCommunication = async () => {
    if (!newComm.summary) {
      toast({ title: 'Error', description: 'Please enter a summary', variant: 'destructive' });
      return;
    }
    setCommSaving(true);
    await new Promise(r => setTimeout(r, 500));
    const record = {
      id: String(Date.now()),
      type: newComm.type,
      direction: newComm.direction,
      date: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      contact: newComm.contact || opportunity.seller.name,
      summary: newComm.summary,
      duration: newComm.type === 'phone' ? newComm.duration : undefined,
    };
    setCommunications(prev => [record, ...prev]);
    setShowCommDialog(false);
    setNewComm({ type: 'phone', direction: 'outbound', contact: '', summary: '', duration: '' });
    setCommSaving(false);
    toast({ title: 'Communication Logged', description: 'Communication has been recorded.' });
  };

  const getMailingStatusBadge = (status) => {
    const styles = {
      delivered: 'bg-green-100 text-green-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      returned: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getEsignStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      declined: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const handleConvertToProject = () => {
    // In a real app, this would create the project and redirect
    alert('Converting opportunity to project...');
    navigate('/projects');
  };

  const renderStageContent = (stageId) => {
    const stageInfo = {
      'stage-prospecting': {
        title: 'Prospecting Stage',
        description: 'Property information and outreach tracking. Seller has not yet responded.',
        nextSteps: [
          'Send initial contact letter or postcard',
          'Record all outreach attempts',
          'Update property information as available',
          'Track response to marketing efforts'
        ],
        tools: ['Direct Mail Tracking', 'Call Log', 'Property Research']
      },
      'stage-contacted': {
        title: 'Contacted Stage',
        description: 'Seller has responded. Update information and begin property analysis.',
        nextSteps: [
          'Gather detailed seller information',
          'Request property documents',
          'Conduct initial property analysis',
          'Determine deal type and potential'
        ],
        tools: ['Property Details Form', 'Document Upload', 'Initial Analysis']
      },
      'stage-qualified': {
        title: 'Qualified Stage',
        description: 'Deal analyzed and seller is qualified. Prepare contract terms.',
        nextSteps: [
          'Select comparable properties',
          'Finalize deal type and structure',
          'Prepare contract terms and conditions',
          'Set purchase price and earnest money'
        ],
        tools: ['Comp Selection', 'Deal Analyzer', 'Contract Preparation']
      },
      'stage-negotiating': {
        title: 'Negotiating Stage',
        description: 'Generate and send contract for signatures.',
        nextSteps: [
          'Complete contract form with all terms',
          'Generate contract from template',
          'Send for e-signature to seller and buyer',
          'Track signature status'
        ],
        tools: ['Contract Generator', 'E-Sign Integration', 'Negotiation Notes']
      },
      'stage-under-contract': {
        title: 'Under Contract Stage',
        description: 'Contract signed. Ready to convert to project.',
        nextSteps: [
          'Verify signed contract is uploaded',
          'Review all due diligence items',
          'Prepare for closing',
          'Convert to Project when ready'
        ],
        tools: ['Contract Verification', 'Due Diligence Checklist', 'Convert to Project']
      },
    };

    const stage = stageInfo[stageId];
    if (!stage) return null;

    return (
      <div className="p-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">{stage.title}</h2>
          <p className="text-gray-600 mb-6">{stage.description}</p>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#047857]" />
                Next Steps
              </h3>
              <ul className="space-y-2">
                {stage.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-gray-500">{idx + 1}</span>
                    </div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#047857]" />
                Available Tools
              </h3>
              <div className="space-y-2">
                {stage.tools.map((tool, idx) => (
                  <Button key={idx} variant="outline" className="w-full justify-start text-sm">
                    {tool}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {stageId === 'stage-negotiating' && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3">Contract Generation</h3>
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Generate a contract based on the deal type and send for e-signature.
                </p>
                <div className="flex gap-3">
                  <Button className="bg-[#047857] hover:bg-[#065f46]">
                    <FileSignature className="w-4 h-4 mr-2" />
                    Generate Contract
                  </Button>
                  <Button variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    Send for E-Sign
                  </Button>
                </div>
              </div>
            </div>
          )}

          {stageId === 'stage-under-contract' && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3">Convert to Project</h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  This opportunity is under contract and ready to be converted to a project.
                  All data will be transferred to the new project record.
                </p>
                <Button 
                  onClick={handleConvertToProject}
                  className="bg-[#047857] hover:bg-[#065f46]"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Convert to Project
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Handle stage tracker pages
    if (activeSection.startsWith('stage-')) {
      return renderStageContent(activeSection);
    }

    switch (activeSection) {
      case 'overview':
        return <OpportunityOverview opportunity={opportunity} opportunityTypes={opportunityTypes} />;
      
      case 'deal-analyzer':
        return (
          <div className="h-full">
            <PipelineDealAnalyzer />
          </div>
        );
      
      case 'tasks':
        return <OpportunityTasks opportunity={opportunity} />;
      
      case 'property-details':
        return <OpportunityPropertyDetails opportunity={opportunity} />;
      
      case 'contacts':
        return <OpportunityContacts opportunity={opportunity} />;
      
      case 'comps':
        return <OpportunityComparables opportunity={opportunity} />;
      
      case 'files':
        return <OpportunityFiles />;
      
      case 'mailing':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Mailing History</h2>
                <p className="text-sm text-gray-500">Track letters, postcards, and other mail sent to this property owner</p>
              </div>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowMailingDialog(true)}>
                <Plus className="w-4 h-4 mr-1" /> New Mailing
              </Button>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mailingRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{record.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.template}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.sentDate}</td>
                      <td className="px-4 py-3">
                        <Badge className={getMailingStatusBadge(record.status)}>{record.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{record.trackingId || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {mailingRecords.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No mailing records yet</p>
                </div>
              )}
            </div>

            <Dialog open={showMailingDialog} onOpenChange={setShowMailingDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Mailing</DialogTitle>
                  <DialogDescription>Send a letter or postcard to the property owner</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Mail Type</Label>
                    <Select value={newMailing.type} onValueChange={(v) => setNewMailing({ ...newMailing, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="Postcard">Postcard</SelectItem>
                        <SelectItem value="Package">Package</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Template</Label>
                    <Select value={newMailing.template} onValueChange={(v) => setNewMailing({ ...newMailing, template: v })}>
                      <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Initial Contact Letter">Initial Contact Letter</SelectItem>
                        <SelectItem value="Follow-up Postcard">Follow-up Postcard</SelectItem>
                        <SelectItem value="Offer Letter">Offer Letter</SelectItem>
                        <SelectItem value="Final Notice">Final Notice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Notes (optional)</Label>
                    <Textarea value={newMailing.notes} onChange={(e) => setNewMailing({ ...newMailing, notes: e.target.value })} placeholder="Any special instructions..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowMailingDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddMailing} disabled={mailingSaving} className="bg-[#047857] hover:bg-[#065f46]">
                    {mailingSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Queue Mailing
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );

      case 'communications':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Communications Log</h2>
                <p className="text-sm text-gray-500">Track all calls, emails, and messages with contacts</p>
              </div>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowCommDialog(true)}>
                <Plus className="w-4 h-4 mr-1" /> Log Communication
              </Button>
            </div>

            <div className="space-y-3">
              {communications.map((comm) => (
                <div key={comm.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        comm.type === 'phone' ? "bg-blue-100" : "bg-purple-100"
                      )}>
                        {comm.type === 'phone' ? (
                          <Phone className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Mail className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comm.contact}</span>
                          <Badge variant="outline" className="text-xs">
                            {comm.direction === 'outbound' ? '→ Outbound' : '← Inbound'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comm.summary}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {comm.date}</span>
                          {comm.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {comm.duration}</span>}
                          {comm.attachments && <span>{comm.attachments} attachments</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {communications.length === 0 && (
                <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No communications logged yet</p>
                </div>
              )}
            </div>

            <Dialog open={showCommDialog} onOpenChange={setShowCommDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Communication</DialogTitle>
                  <DialogDescription>Record a call, email, or message with a contact</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <Select value={newComm.type} onValueChange={(v) => setNewComm({ ...newComm, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="text">Text Message</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Direction</Label>
                      <Select value={newComm.direction} onValueChange={(v) => setNewComm({ ...newComm, direction: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outbound">Outbound</SelectItem>
                          <SelectItem value="inbound">Inbound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Contact</Label>
                    <Input value={newComm.contact} onChange={(e) => setNewComm({ ...newComm, contact: e.target.value })} placeholder={opportunity.seller.name} />
                  </div>
                  {newComm.type === 'phone' && (
                    <div className="grid gap-2">
                      <Label>Duration</Label>
                      <Input value={newComm.duration} onChange={(e) => setNewComm({ ...newComm, duration: e.target.value })} placeholder="e.g., 15 min" />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label>Summary</Label>
                    <Textarea value={newComm.summary} onChange={(e) => setNewComm({ ...newComm, summary: e.target.value })} placeholder="What was discussed..." rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCommDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddCommunication} disabled={commSaving} className="bg-[#047857] hover:bg-[#065f46]">
                    {commSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Log Communication
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );

      case 'esigned':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">E-Signed Documents</h2>
                <p className="text-sm text-gray-500">Track contract signatures and document status</p>
              </div>
              <Button className="bg-[#047857] hover:bg-[#065f46]">
                <Send className="w-4 h-4 mr-1" /> Send for Signature
              </Button>
            </div>

            <div className="space-y-4">
              {esignedDocs.map((doc) => (
                <div key={doc.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        doc.status === 'completed' ? "bg-green-100" : "bg-yellow-100"
                      )}>
                        <FileSignature className={cn("w-5 h-5", doc.status === 'completed' ? "text-green-600" : "text-yellow-600")} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{doc.name}</span>
                          <Badge className={getEsignStatusBadge(doc.status)}>{doc.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Sent: {doc.sentDate}</span>
                          {doc.completedDate && <span>Completed: {doc.completedDate}</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          {doc.signers.map((signer, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                                signer.status === 'signed' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                              )}>
                                {signer.status === 'signed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                              </div>
                              <span className={signer.status === 'signed' ? "text-green-700" : "text-yellow-700"}>
                                {signer.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" /> Download
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {esignedDocs.length === 0 && (
                <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
                  <FileSignature className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No e-signed documents yet</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">DocuSign Integration</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Documents can be sent for e-signature directly from the Negotiating stage.
                    Connected signers will receive email notifications to complete signing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="bg-white border rounded-lg p-12 text-center">
              <p className="text-gray-600 capitalize font-medium">{activeSection.replace('-', ' ')}</p>
              <p className="text-gray-400 text-sm mt-2">Content coming soon</p>
            </div>
          </div>
        );
    }
  };

  const currentStage = stages.find(s => s.id === opportunity.stage);

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      {/* Dark Sidebar */}
      <div className="w-52 bg-[#1e2a3a] flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <button onClick={() => navigate('/opportunities')} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Pipeline
          </button>
          <h2 className="text-white font-semibold truncate text-sm">{opportunity.name}</h2>
          <p className="text-gray-500 text-xs mt-1">{opportunityTypes[opportunity.type]}</p>
          <p className="text-gray-500 text-xs">{opportunity.acres} acres • {opportunity.team}</p>
        </div>
        
        <nav className="flex-1 p-2 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.id} className="mb-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-400 hover:text-white"
              >
                {group.label}
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedGroups.includes(group.id) ? "" : "-rotate-90")} />
              </button>
              {expandedGroups.includes(group.id) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors",
                          activeSection === item.id 
                            ? "bg-white/10 text-white" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <IconComponent className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Stage Progress */}
        <div className="p-3 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Current Stage</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentStage?.color }} />
            <span className="text-white text-sm font-medium">{currentStage?.label}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#047857]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{opportunity.name}</h1>
                <span className="text-xs px-2 py-1 rounded font-medium" style={{ backgroundColor: currentStage?.color + '20', color: currentStage?.color }}>
                  {currentStage?.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{opportunity.address}, {opportunity.city}, {opportunity.state} {opportunity.zip}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
            {opportunity.stage === 'under-contract' ? (
              <Button onClick={handleConvertToProject} className="bg-[#047857] hover:bg-[#065f46]">
                <ArrowRight className="w-4 h-4 mr-1" />Convert to Project
              </Button>
            ) : (
              <Button className="bg-[#047857] hover:bg-[#065f46]">Advance Stage</Button>
            )}
          </div>
        </div>

        {/* Stage Progress Bar */}
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center gap-2">
            {stages.map((stage, idx) => {
              const isCurrent = stage.id === opportunity.stage;
              const isPast = stages.findIndex(s => s.id === opportunity.stage) > idx;
              return (
                <React.Fragment key={stage.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                        isCurrent ? "ring-2 ring-offset-2" : "",
                        isPast || isCurrent ? "text-white" : "bg-gray-200 text-gray-500"
                      )}
                      style={{ 
                        backgroundColor: isPast || isCurrent ? stage.color : undefined,
                        ringColor: isCurrent ? stage.color : undefined 
                      }}
                    >
                      {isPast ? '✓' : idx + 1}
                    </div>
                    <span className={cn("text-xs font-medium", isCurrent ? "text-gray-900" : "text-gray-500")}>
                      {stage.label}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className={cn("flex-1 h-1 rounded", isPast ? "bg-[#047857]" : "bg-gray-200")} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default OpportunityDetailPage;
