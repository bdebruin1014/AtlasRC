import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, ChevronDown, FileText, Building2, Users, DollarSign, FolderOpen,
  ClipboardList, MapPin, Calculator, TrendingUp, Target, ArrowRight, Mail, MessageSquare,
  FileSignature, CheckCircle, Send, FileCheck, Plus, Calendar, Clock, Eye, Download,
  Phone, ExternalLink, Loader2, RefreshCw, Trash2, Star, X, ChevronRight, AlertCircle,
  BarChart3, Home
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
import { useOpportunity, useOpportunityActions, OPPORTUNITY_STAGES } from '@/hooks/useOpportunities';
import { useAutoSave, SaveStatusIndicator } from '@/hooks/useAutoSave';

// Stage task service
import { getStageTasks, toggleTask, getStageProgress } from '@/services/stageTaskService';

// Opportunity section services
import { getTasks as getOppTasks, createTask as createOppTask, updateTask as updateOppTask, deleteTask as deleteOppTask, toggleTask as toggleOppTask, TASK_PRIORITIES as OPP_TASK_PRIORITIES, TASK_CATEGORIES as OPP_TASK_CATEGORIES, TASK_STATUSES as OPP_TASK_STATUSES } from '@/services/opportunityTasksService';
import { getContacts as getOppContacts, createContact as createOppContact, updateContact as updateOppContact, deleteContact as deleteOppContact, CONTACT_ROLES } from '@/services/opportunityContactsService';
import { getComparables as getOppComparables, createComparable as createOppComparable, updateComparable as updateOppComparable, deleteComparable as deleteOppComparable } from '@/services/opportunityComparablesService';

// Import Deal Analyzer
import PipelineDealAnalyzer from '@/features/budgets/components/PipelineDealAnalyzer';

// Record Tasks Panel (workflow-based tasks with template support)
import RecordTasksPanel from '@/components/RecordTasksPanel';

// E-Sign and Document Components
import ESignButton from '@/components/esign/ESignButton';
import DocumentLibrary from '@/components/documents/DocumentLibrary';
import ContractGenerationModal from '@/components/contracts/ContractGenerationModal';
import ConvertToProjectModal from '@/components/ConvertToProjectModal';
import { OPPORTUNITY_TYPES } from '@/lib/constants';

const OpportunityDetailPage = () => {
  const { toast } = useToast();
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedGroups, setExpandedGroups] = useState(['overview', 'stage-tracker', 'management', 'documents']);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [stageTasks, setStageTasks] = useState({});
  const [stageProgress, setStageProgress] = useState({});

  // --- Opportunity Tasks state ---
  const [oppTasks, setOppTasks] = useState([]);
  const [oppTasksLoading, setOppTasksLoading] = useState(false);
  const [oppTaskFilter, setOppTaskFilter] = useState('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', category: 'due-diligence', priority: 'medium', status: 'todo', due_date: '', assigned_to: '', description: '' });

  // --- Opportunity Contacts state ---
  const [oppContacts, setOppContacts] = useState([]);
  const [oppContactsLoading, setOppContactsLoading] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', role: 'Seller', company: '', phone: '', email: '', notes: '', is_primary: false });

  // --- Opportunity Comparables state ---
  const [oppComps, setOppComps] = useState([]);
  const [oppCompsLoading, setOppCompsLoading] = useState(false);
  const [showAddComp, setShowAddComp] = useState(false);
  const [expandedCompId, setExpandedCompId] = useState(null);
  const [newComp, setNewComp] = useState({ address: '', city: '', state: '', sale_date: '', sale_price: '', square_footage: '', price_per_sqft: '', lot_size_acres: '', bedrooms: '', bathrooms: '', year_built: '', distance_miles: '', notes: '', source: 'MLS' });

  // Fetch opportunity from database
  const { opportunity: rawOpportunity, isLoading, error } = useOpportunity(opportunityId);
  const { updateOpportunity } = useOpportunityActions();

  // Auto-save hook
  const {
    formData,
    setField,
    saveStatus,
    lastSaved,
    error: saveError
  } = useAutoSave(
    rawOpportunity,
    async (data) => {
      if (opportunityId && data) {
        await updateOpportunity(opportunityId, data);
      }
    },
    1500
  );

  // Document management state — starts empty, populated from database
  const [mailingRecords, setMailingRecords] = useState([]);

  const [communications, setCommunications] = useState([]);

  const [esignedDocs, setEsignedDocs] = useState([]);

  const [showMailingDialog, setShowMailingDialog] = useState(false);
  const [showCommDialog, setShowCommDialog] = useState(false);
  const [mailingSaving, setMailingSaving] = useState(false);
  const [commSaving, setCommSaving] = useState(false);

  const mailings = mailingRecords;

  const [newMailing, setNewMailing] = useState({ type: 'Letter', template: '', notes: '' });
  const [newComm, setNewComm] = useState({ type: 'phone', direction: 'outbound', contact: '', summary: '', duration: '' });

  // Updated stages per requirements
  const stages = [
    { id: 'Prospecting', label: 'Prospecting', color: '#6B7280' },
    { id: 'Contacted', label: 'Contacted', color: '#3B82F6' },
    { id: 'Qualified', label: 'Qualified', color: '#F59E0B' },
    { id: 'Negotiating', label: 'Negotiating', color: '#8B5CF6' },
    { id: 'Under Contract', label: 'Under Contract', color: '#10B981' },
  ];

  // Load stage tasks when a stage section is viewed
  useEffect(() => {
    if (activeSection.startsWith('stage-') && opportunityId) {
      const stageId = activeSection.replace('stage-', '');
      const stageMap = {
        'prospecting': 'Prospecting',
        'contacted': 'Contacted',
        'qualified': 'Qualified',
        'negotiating': 'Negotiating',
        'under-contract': 'Under Contract'
      };
      const stage = stageMap[stageId];
      if (stage) loadStageTasks(stage);
    }
  }, [activeSection, opportunityId]);

  const loadStageTasks = async (stage) => {
    try {
      const tasks = await getStageTasks(opportunityId, stage);
      const progress = await getStageProgress(opportunityId, stage);
      setStageTasks(prev => ({ ...prev, [stage]: tasks }));
      setStageProgress(prev => ({ ...prev, [stage]: progress }));
    } catch (err) {
      console.error('Failed to load stage tasks:', err);
    }
  };

  const handleToggleTask = async (taskId, currentState, stage) => {
    try {
      await toggleTask(taskId, !currentState);
      loadStageTasks(stage);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // --- Load opportunity tasks, contacts, comps when their sections become active ---
  useEffect(() => {
    if (activeSection === 'tasks' && opportunityId) loadOppTasks();
  }, [activeSection, opportunityId]);

  useEffect(() => {
    if (activeSection === 'contacts' && opportunityId) loadOppContacts();
  }, [activeSection, opportunityId]);

  useEffect(() => {
    if (activeSection === 'comps' && opportunityId) loadOppComps();
  }, [activeSection, opportunityId]);

  const loadOppTasks = async () => {
    setOppTasksLoading(true);
    try {
      const data = await getOppTasks(opportunityId);
      setOppTasks(data);
    } catch (err) {
      console.error('Failed to load opportunity tasks:', err);
    } finally {
      setOppTasksLoading(false);
    }
  };

  const loadOppContacts = async () => {
    setOppContactsLoading(true);
    try {
      const data = await getOppContacts(opportunityId);
      setOppContacts(data);
    } catch (err) {
      console.error('Failed to load opportunity contacts:', err);
    } finally {
      setOppContactsLoading(false);
    }
  };

  const loadOppComps = async () => {
    setOppCompsLoading(true);
    try {
      const data = await getOppComparables(opportunityId);
      setOppComps(data);
    } catch (err) {
      console.error('Failed to load opportunity comparables:', err);
    } finally {
      setOppCompsLoading(false);
    }
  };

  const handleAddOppTask = async () => {
    if (!newTask.title.trim()) {
      toast({ title: 'Error', description: 'Task title is required.', variant: 'destructive' });
      return;
    }
    try {
      const created = await createOppTask(opportunityId, newTask);
      setOppTasks(prev => [...prev, created]);
      setNewTask({ title: '', category: 'due-diligence', priority: 'medium', status: 'todo', due_date: '', assigned_to: '', description: '' });
      setShowAddTask(false);
      toast({ title: 'Task Added', description: 'New task has been created.' });
    } catch (err) {
      console.error('Failed to create task:', err);
      toast({ title: 'Error', description: 'Failed to create task.', variant: 'destructive' });
    }
  };

  const handleToggleOppTask = async (taskId, currentStatus) => {
    try {
      const updated = await toggleOppTask(taskId, currentStatus);
      setOppTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: updated.status } : t));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDeleteOppTask = async (taskId) => {
    try {
      await deleteOppTask(taskId);
      setOppTasks(prev => prev.filter(t => t.id !== taskId));
      toast({ title: 'Task Deleted', description: 'Task has been removed.' });
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleAddOppContact = async () => {
    if (!newContact.name.trim()) {
      toast({ title: 'Error', description: 'Contact name is required.', variant: 'destructive' });
      return;
    }
    try {
      const created = await createOppContact(opportunityId, newContact);
      setOppContacts(prev => [...prev, created]);
      setNewContact({ name: '', role: 'Seller', company: '', phone: '', email: '', notes: '', is_primary: false });
      setShowAddContact(false);
      toast({ title: 'Contact Added', description: 'New contact has been created.' });
    } catch (err) {
      console.error('Failed to create contact:', err);
      toast({ title: 'Error', description: 'Failed to create contact.', variant: 'destructive' });
    }
  };

  const handleDeleteOppContact = async (contactId) => {
    try {
      await deleteOppContact(contactId);
      setOppContacts(prev => prev.filter(c => c.id !== contactId));
      toast({ title: 'Contact Deleted', description: 'Contact has been removed.' });
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  const handleAddOppComp = async () => {
    if (!newComp.address.trim()) {
      toast({ title: 'Error', description: 'Address is required.', variant: 'destructive' });
      return;
    }
    try {
      const compData = {
        ...newComp,
        sale_price: newComp.sale_price ? parseFloat(newComp.sale_price) : null,
        square_footage: newComp.square_footage ? parseFloat(newComp.square_footage) : null,
        lot_size_acres: newComp.lot_size_acres ? parseFloat(newComp.lot_size_acres) : null,
        bedrooms: newComp.bedrooms ? parseInt(newComp.bedrooms) : null,
        bathrooms: newComp.bathrooms ? parseFloat(newComp.bathrooms) : null,
        year_built: newComp.year_built ? parseInt(newComp.year_built) : null,
        distance_miles: newComp.distance_miles ? parseFloat(newComp.distance_miles) : null,
      };
      const created = await createOppComparable(opportunityId, compData);
      setOppComps(prev => [...prev, created]);
      setNewComp({ address: '', city: '', state: '', sale_date: '', sale_price: '', square_footage: '', price_per_sqft: '', lot_size_acres: '', bedrooms: '', bathrooms: '', year_built: '', distance_miles: '', notes: '', source: 'MLS' });
      setShowAddComp(false);
      toast({ title: 'Comparable Added', description: 'New comparable sale has been added.' });
    } catch (err) {
      console.error('Failed to create comparable:', err);
      toast({ title: 'Error', description: 'Failed to create comparable.', variant: 'destructive' });
    }
  };

  const handleDeleteOppComp = async (compId) => {
    try {
      await deleteOppComparable(compId);
      setOppComps(prev => prev.filter(c => c.id !== compId));
      toast({ title: 'Comparable Deleted', description: 'Comparable has been removed.' });
    } catch (err) {
      console.error('Failed to delete comparable:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#047857]" />
        <span className="ml-2">Loading opportunity...</span>
      </div>
    );
  }

  // Error state
  if (error || !rawOpportunity) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Building2 className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Opportunity Not Found</h2>
        <p className="text-gray-500 mb-4">{error || 'The requested opportunity could not be found.'}</p>
        <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
      </div>
    );
  }

  const sidebarGroups = [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'property-details', label: 'Property Details', icon: MapPin },
        { id: 'seller-info', label: 'Seller Info', icon: Users },
        { id: 'deal-terms', label: 'Deal Terms', icon: DollarSign },
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
      id: 'management',
      label: 'Management',
      items: [
        { id: 'tasks', label: 'Tasks', icon: ClipboardList },
        { id: 'contacts', label: 'Contacts', icon: Users },
        { id: 'comps', label: 'Comparables', icon: TrendingUp },
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      items: [
        { id: 'files', label: 'Files', icon: FolderOpen },
        { id: 'notes', label: 'Notes & Activity', icon: MessageSquare },
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
      contact: newComm.contact || formData?.seller_name || 'Unknown',
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
    setShowConvertModal(true);
  };

  const handleConversionSuccess = (newProject) => {
    toast({
      title: 'Success',
      description: 'Opportunity has been converted to a project.',
    });
    navigate(`/project/${newProject.id}`);
  };

  const handleAdvanceStage = () => {
    const currentIndex = stages.findIndex(s => s.id === formData?.stage);
    if (currentIndex < stages.length - 1) {
      setField('stage', stages[currentIndex + 1].id);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return `$${parseFloat(price).toLocaleString()}`;
  };

  const renderContent = () => {
    // Handle stage tracker pages
    if (activeSection.startsWith('stage-')) {
      const stageId = activeSection.replace('stage-', '');
      const stageMap = {
        'prospecting': 'Prospecting',
        'contacted': 'Contacted',
        'qualified': 'Qualified',
        'negotiating': 'Negotiating',
        'under-contract': 'Under Contract'
      };
      const stageName = stageMap[stageId] || stageId;

      // Special handling for Negotiating stage with e-sign
      if (stageId === 'negotiating') {
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Negotiating Stage</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>

            {/* Key Actions Card */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Contract & E-Sign Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowContractModal(true)}
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Contract
                </Button>
                <ESignButton
                  entityType="opportunity"
                  entityId={opportunityId}
                  entityName={formData?.deal_number || formData?.address}
                  prefillData={{
                    property_address: formData?.address,
                    property_city: formData?.city,
                    property_state: formData?.state,
                    property_zip: formData?.zip_code,
                    asking_price: formData?.asking_price,
                    earnest_money: formData?.earnest_money,
                    seller_name: formData?.seller_name,
                    seller_email: formData?.seller_email,
                    seller_phone: formData?.seller_phone,
                    assignment_fee: formData?.assignment_fee,
                    dd_deadline: formData?.dd_deadline,
                    close_date: formData?.close_date,
                  }}
                  defaultSigners={formData?.seller_name && formData?.seller_email ? [{
                    role: 'Seller',
                    name: formData.seller_name,
                    email: formData.seller_email,
                    phone: formData.seller_phone || ''
                  }] : []}
                  buttonText="Send for E-Sign"
                  buttonVariant="default"
                  className="bg-[#047857] hover:bg-[#065f46]"
                />
                <Button onClick={() => setField('stage', 'Negotiating')} variant="outline">
                  Set as Current Stage
                </Button>
              </div>
            </div>

            {/* Negotiation Details */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Negotiation Details</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Initial Offer ($)</Label>
                    <Input
                      type="number"
                      value={formData?.initial_offer || ''}
                      onChange={(e) => setField('initial_offer', e.target.value)}
                      className="mt-1"
                      placeholder="175000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Counter Offer ($)</Label>
                    <Input
                      type="number"
                      value={formData?.counter_offer || ''}
                      onChange={(e) => setField('counter_offer', e.target.value)}
                      className="mt-1"
                      placeholder="185000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Final Agreed Price ($)</Label>
                    <Input
                      type="number"
                      value={formData?.asking_price || ''}
                      onChange={(e) => setField('asking_price', e.target.value)}
                      className="mt-1"
                      placeholder="180000"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Negotiation Notes</Label>
                    <Textarea
                      value={formData?.negotiation_notes || ''}
                      onChange={(e) => setField('negotiation_notes', e.target.value)}
                      className="mt-1"
                      rows={6}
                      placeholder="Notes from negotiations, seller concerns, terms discussed..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Generation Modal */}
            <ContractGenerationModal
              isOpen={showContractModal}
              onClose={() => setShowContractModal(false)}
              entityType="opportunity"
              entityId={opportunityId}
              entityName={formData?.deal_number || formData?.address}
              entityData={formData}
              onSuccess={() => {
                setShowContractModal(false);
              }}
            />
          </div>
        );
      }

      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{stageName} Stage</h2>
            <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
          </div>
          <div className="bg-white border rounded-lg p-6">
            <div className="space-y-4">
              <p className="text-gray-600">Manage your {stageName.toLowerCase()} stage activities and requirements here.</p>
              <div className="flex gap-3">
                <Button onClick={() => setField('stage', stageName)} className="bg-[#047857] hover:bg-[#065f46]">
                  Set as Current Stage
                </Button>
                {stageName === 'Under Contract' && (
                  <Button onClick={handleConvertToProject} variant="outline">
                    <ArrowRight className="w-4 h-4 mr-2" />Convert to Project
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Opportunity Overview</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Estimated Value</p>
                <p className="text-2xl font-semibold">{formatPrice(formData?.estimated_value)}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Asking Price</p>
                <p className="text-2xl font-semibold">{formatPrice(formData?.asking_price)}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Assignment Fee</p>
                <p className="text-2xl font-semibold text-[#047857]">{formatPrice(formData?.assignment_fee)}</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">Current Stage</p>
                <p className="text-2xl font-semibold">{formData?.stage || 'Prospecting'}</p>
              </div>
            </div>

            {/* Basic Info Form */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Deal Number *</Label>
                  <Input
                    value={formData?.deal_number || ''}
                    onChange={(e) => setField('deal_number', e.target.value)}
                    className="mt-1"
                    placeholder="25-001"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Stage</Label>
                  <Select value={formData?.stage || 'Prospecting'} onValueChange={(v) => setField('stage', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(OPPORTUNITY_STAGES || []).map(s => (
                        <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Property Type</Label>
                  <Select value={formData?.property_type || 'vacant-lot'} onValueChange={(v) => setField('property_type', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(OPPORTUNITY_TYPES || []).map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Assigned To</Label>
                  <Input
                    value={formData?.assigned_to || ''}
                    onChange={(e) => setField('assigned_to', e.target.value)}
                    className="mt-1"
                    placeholder="Team member name"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'property-details':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>

            {/* Location & Identification */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Location & Identification</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Address *</Label>
                    <Input
                      value={formData?.address || ''}
                      onChange={(e) => setField('address', e.target.value)}
                      className="mt-1"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">City</Label>
                      <Input
                        value={formData?.city || ''}
                        onChange={(e) => setField('city', e.target.value)}
                        className="mt-1"
                        placeholder="Greenville"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">State</Label>
                      <Input
                        value={formData?.state || ''}
                        onChange={(e) => setField('state', e.target.value)}
                        className="mt-1"
                        placeholder="SC"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">ZIP</Label>
                      <Input
                        value={formData?.zip_code || ''}
                        onChange={(e) => setField('zip_code', e.target.value)}
                        className="mt-1"
                        placeholder="29601"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">County</Label>
                      <Input
                        value={formData?.county || ''}
                        onChange={(e) => setField('county', e.target.value)}
                        className="mt-1"
                        placeholder="Greenville"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Parcel ID / TMS#</Label>
                      <Input
                        value={formData?.parcel_id || ''}
                        onChange={(e) => setField('parcel_id', e.target.value)}
                        className="mt-1"
                        placeholder="0234-56-78-9012"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Acres</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData?.acres || ''}
                        onChange={(e) => setField('acres', e.target.value)}
                        className="mt-1"
                        placeholder="0.25"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Potential Lots/Units</Label>
                      <Input
                        type="number"
                        value={formData?.potential_lots || ''}
                        onChange={(e) => setField('potential_lots', e.target.value)}
                        className="mt-1"
                        placeholder="1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Zoning</Label>
                    <Input
                      value={formData?.zoning || ''}
                      onChange={(e) => setField('zoning', e.target.value)}
                      className="mt-1"
                      placeholder="R-S, R-6, PD, etc."
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Source</Label>
                    <Input
                      value={formData?.source || ''}
                      onChange={(e) => setField('source', e.target.value)}
                      className="mt-1"
                      placeholder="Direct Mail, Referral, etc."
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Legal Description</Label>
                    <Textarea
                      value={formData?.legal_description || ''}
                      onChange={(e) => setField('legal_description', e.target.value)}
                      className="mt-1"
                      rows={2}
                      placeholder="Lot 5, Block A, Heritage Subdivision..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Land & Zoning — shown for lot/development types */}
            {(formData?.property_type || '').match(/lot|development/i) && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Land & Zoning</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Municipality</Label>
                    <Select value={formData?.municipality || ''} onValueChange={(v) => setField('municipality', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="City of Greenville">City of Greenville</SelectItem>
                        <SelectItem value="Greenville County">Greenville County</SelectItem>
                        <SelectItem value="City of Greer">City of Greer</SelectItem>
                        <SelectItem value="City of Simpsonville">City of Simpsonville</SelectItem>
                        <SelectItem value="City of Mauldin">City of Mauldin</SelectItem>
                        <SelectItem value="City of Travelers Rest">City of Travelers Rest</SelectItem>
                        <SelectItem value="Spartanburg County">Spartanburg County</SelectItem>
                        <SelectItem value="Anderson County">Anderson County</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Lot Size (sf)</Label>
                    <Input
                      type="number"
                      value={formData?.lot_size_sf || ''}
                      onChange={(e) => setField('lot_size_sf', e.target.value)}
                      className="mt-1"
                      placeholder="10890"
                    />
                    {formData?.lot_size_sf > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{(formData.lot_size_sf / 43560).toFixed(2)} acres</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Flood Zone</Label>
                    <Select value={formData?.flood_zone || ''} onValueChange={(v) => setField('flood_zone', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="X - Minimal">X - Minimal</SelectItem>
                        <SelectItem value="A - Moderate">A - Moderate</SelectItem>
                        <SelectItem value="AE - High">AE - High</SelectItem>
                        <SelectItem value="VE - Coastal">VE - Coastal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Topography</Label>
                    <Select value={formData?.topography || ''} onValueChange={(v) => setField('topography', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Flat">Flat</SelectItem>
                        <SelectItem value="Gentle Slope">Gentle Slope</SelectItem>
                        <SelectItem value="Moderate Slope">Moderate Slope</SelectItem>
                        <SelectItem value="Steep">Steep</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Tree Coverage</Label>
                    <Select value={formData?.tree_coverage || ''} onValueChange={(v) => setField('tree_coverage', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Light">Light</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Road Access</Label>
                    <Select value={formData?.road_access || ''} onValueChange={(v) => setField('road_access', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Public">Public</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Easement">Easement</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Utilities Available */}
                <div className="mt-4">
                  <Label className="text-xs text-gray-500 mb-2 block">Utilities Available</Label>
                  <div className="flex flex-wrap gap-4">
                    {['Water', 'Sewer', 'Electric', 'Gas'].map((util) => {
                      const current = formData?.utilities_available || [];
                      const isChecked = current.includes(util);
                      return (
                        <label key={util} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const updated = isChecked
                                ? current.filter(u => u !== util)
                                : [...current, util];
                              setField('utilities_available', updated);
                            }}
                            className="rounded border-gray-300 text-emerald-600"
                          />
                          <span className="text-sm">{util}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label className="text-xs text-gray-500">School District</Label>
                    <Input
                      value={formData?.school_district || ''}
                      onChange={(e) => setField('school_district', e.target.value)}
                      className="mt-1"
                      placeholder="Greenville County Schools"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">HOA Amount ($)</Label>
                    <Input
                      type="number"
                      value={formData?.hoa_amount || ''}
                      onChange={(e) => setField('hoa_amount', e.target.value)}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Wetlands %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData?.wetlands_pct || ''}
                      onChange={(e) => setField('wetlands_pct', e.target.value)}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tax & Valuation */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Tax & Valuation</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Tax Assessed Value ($)</Label>
                  <Input
                    type="number"
                    value={formData?.tax_assessed_value || ''}
                    onChange={(e) => setField('tax_assessed_value', e.target.value)}
                    className="mt-1"
                    placeholder="150000"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Annual Property Taxes ($)</Label>
                  <Input
                    type="number"
                    value={formData?.annual_taxes || ''}
                    onChange={(e) => setField('annual_taxes', e.target.value)}
                    className="mt-1"
                    placeholder="2400"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Estimated Value ($)</Label>
                  <Input
                    type="number"
                    value={formData?.estimated_value || ''}
                    onChange={(e) => setField('estimated_value', e.target.value)}
                    className="mt-1"
                    placeholder="250000"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'seller-info':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Seller Information</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>

            {/* Contact & Seller Details */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Seller Details</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Seller Name</Label>
                    <Input
                      value={formData?.seller_name || ''}
                      onChange={(e) => setField('seller_name', e.target.value)}
                      className="mt-1"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Phone</Label>
                    <Input
                      type="tel"
                      value={formData?.seller_phone || ''}
                      onChange={(e) => setField('seller_phone', e.target.value)}
                      className="mt-1"
                      placeholder="(864) 555-0123"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Secondary Phone</Label>
                    <Input
                      type="tel"
                      value={formData?.seller_phone_2 || ''}
                      onChange={(e) => setField('seller_phone_2', e.target.value)}
                      className="mt-1"
                      placeholder="(864) 555-4567"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <Input
                      type="email"
                      value={formData?.seller_email || ''}
                      onChange={(e) => setField('seller_email', e.target.value)}
                      className="mt-1"
                      placeholder="seller@email.com"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Seller Address (if different)</Label>
                    <Input
                      value={formData?.seller_address || ''}
                      onChange={(e) => setField('seller_address', e.target.value)}
                      className="mt-1"
                      placeholder="456 Other St, City, ST 12345"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Seller Type</Label>
                    <Select value={formData?.seller_type || ''} onValueChange={(v) => setField('seller_type', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner Occupant">Owner Occupant</SelectItem>
                        <SelectItem value="Absentee Owner">Absentee Owner</SelectItem>
                        <SelectItem value="Estate/Probate">Estate/Probate</SelectItem>
                        <SelectItem value="Bank/REO">Bank/REO</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="Trust">Trust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Ownership Duration (years)</Label>
                    <Input
                      type="number"
                      value={formData?.ownership_duration_years || ''}
                      onChange={(e) => setField('ownership_duration_years', e.target.value)}
                      className="mt-1"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData?.agent_involved || false}
                        onChange={(e) => setField('agent_involved', e.target.checked)}
                        className="rounded border-gray-300 text-emerald-600"
                      />
                      <span className="text-sm text-gray-700">Agent Involved</span>
                    </label>
                  </div>
                  {formData?.agent_involved && (
                    <>
                      <div>
                        <Label className="text-xs text-gray-500">Agent Name</Label>
                        <Input
                          value={formData?.agent_name || ''}
                          onChange={(e) => setField('agent_name', e.target.value)}
                          className="mt-1"
                          placeholder="Agent name"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Agent Company</Label>
                        <Input
                          value={formData?.agent_company || ''}
                          onChange={(e) => setField('agent_company', e.target.value)}
                          className="mt-1"
                          placeholder="Brokerage name"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Label className="text-xs text-gray-500">Contact Notes</Label>
                    <Textarea
                      value={formData?.contact_notes || ''}
                      onChange={(e) => setField('contact_notes', e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Best time to call, preferred contact method, etc."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Motivation Assessment */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Motivation Assessment</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Motivation Level (1-10)</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <button
                          key={level}
                          onClick={() => setField('motivation_level', level)}
                          className={cn(
                            "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                            formData?.motivation_level === level
                              ? level >= 7 ? "bg-emerald-600 text-white" : level >= 4 ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Motivation Types</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Financial Distress', 'Divorce', 'Probate/Inherited', 'Relocating',
                        'Tired Landlord', 'Tax Liens', 'Code Violations', 'Vacant/Abandoned',
                        'Downsizing', 'Health Issues', 'Behind on Payments'
                      ].map((mtype) => {
                        const current = formData?.motivation_types || [];
                        const isChecked = current.includes(mtype);
                        return (
                          <label key={mtype} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const updated = isChecked
                                  ? current.filter(m => m !== mtype)
                                  : [...current, mtype];
                                setField('motivation_types', updated);
                              }}
                              className="rounded border-gray-300 text-emerald-600"
                            />
                            <span className="text-xs">{mtype}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Mortgage Balance ($)</Label>
                    <Input
                      type="number"
                      value={formData?.mortgage_balance || ''}
                      onChange={(e) => setField('mortgage_balance', e.target.value)}
                      className="mt-1"
                      placeholder="120000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Timeline to Sell</Label>
                    <Select value={formData?.timeline_to_sell || ''} onValueChange={(v) => setField('timeline_to_sell', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediately">Immediately</SelectItem>
                        <SelectItem value="1-2 Weeks">1-2 Weeks</SelectItem>
                        <SelectItem value="1 Month">1 Month</SelectItem>
                        <SelectItem value="2-3 Months">2-3 Months</SelectItem>
                        <SelectItem value="Flexible">Flexible</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Asking Price Firm or Flexible</Label>
                    <Select value={formData?.price_flexibility || ''} onValueChange={(v) => setField('price_flexibility', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Firm">Firm</SelectItem>
                        <SelectItem value="Somewhat Flexible">Somewhat Flexible</SelectItem>
                        <SelectItem value="Very Flexible">Very Flexible</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Competing Offers</Label>
                    <Input
                      type="number"
                      value={formData?.competing_offers || ''}
                      onChange={(e) => setField('competing_offers', e.target.value)}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Seller Motivation Notes</Label>
                    <Textarea
                      value={formData?.seller_motivation || ''}
                      onChange={(e) => setField('seller_motivation', e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Why is the seller selling? Situation details..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'deal-terms':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Deal Terms</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>

            {/* Pricing */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Pricing</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Asking Price ($)</Label>
                  <Input
                    type="number"
                    value={formData?.asking_price || ''}
                    onChange={(e) => setField('asking_price', e.target.value)}
                    className="mt-1"
                    placeholder="200000"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Our Offer / MAO ($)</Label>
                  <Input
                    type="number"
                    value={formData?.initial_offer || ''}
                    onChange={(e) => setField('initial_offer', e.target.value)}
                    className="mt-1"
                    placeholder="175000"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Counter Offer ($)</Label>
                  <Input
                    type="number"
                    value={formData?.counter_offer || ''}
                    onChange={(e) => setField('counter_offer', e.target.value)}
                    className="mt-1"
                    placeholder="185000"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Final Agreed Price ($)</Label>
                  <Input
                    type="number"
                    value={formData?.final_price || ''}
                    onChange={(e) => setField('final_price', e.target.value)}
                    className="mt-1"
                    placeholder="180000"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Assignment Fee ($)</Label>
                  <Input
                    type="number"
                    value={formData?.assignment_fee || ''}
                    onChange={(e) => setField('assignment_fee', e.target.value)}
                    className="mt-1"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">ARV / After Developed Value ($)</Label>
                  <Input
                    type="number"
                    value={formData?.estimated_value || ''}
                    onChange={(e) => setField('estimated_value', e.target.value)}
                    className="mt-1"
                    placeholder="250000"
                  />
                </div>
              </div>

              {/* 70% Rule Check */}
              {(formData?.estimated_value > 0) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium">70% Rule Check</p>
                  {(() => {
                    const arv = parseFloat(formData?.estimated_value) || 0;
                    const repair = parseFloat(formData?.repair_estimate) || 0;
                    const mao = arv * 0.7 - repair;
                    const offer = parseFloat(formData?.initial_offer) || parseFloat(formData?.asking_price) || 0;
                    const isGood = offer <= mao;
                    return (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          ${arv.toLocaleString()} x 0.70 - ${repair.toLocaleString()} = <span className="font-semibold">${mao.toLocaleString()}</span> MAO
                        </span>
                        <Badge className={isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {isGood ? 'Good' : 'Over MAO'}
                        </Badge>
                        {offer > 0 && (
                          <span className="text-xs text-gray-400">
                            (Offer: ${offer.toLocaleString()}, {isGood ? 'under' : 'over'} by ${Math.abs(mao - offer).toLocaleString()})
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Deal Structure */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Deal Structure</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Deal Type</Label>
                  <Select value={formData?.deal_type || 'assignment'} onValueChange={(v) => setField('deal_type', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="double_close">Double Close</SelectItem>
                      <SelectItem value="novation">Novation</SelectItem>
                      <SelectItem value="subject_to">Subject-To</SelectItem>
                      <SelectItem value="seller_finance">Seller Finance</SelectItem>
                      <SelectItem value="cash_purchase">Cash Purchase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Earnest Money ($)</Label>
                  <Input
                    type="number"
                    value={formData?.earnest_money || ''}
                    onChange={(e) => setField('earnest_money', e.target.value)}
                    className="mt-1"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Due Diligence Period (days)</Label>
                  <Input
                    type="number"
                    value={formData?.dd_period_days || ''}
                    onChange={(e) => setField('dd_period_days', e.target.value)}
                    className="mt-1"
                    placeholder="14"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">DD Deadline</Label>
                  <Input
                    type="date"
                    value={formData?.dd_deadline ? formData.dd_deadline.split('T')[0] : ''}
                    onChange={(e) => setField('dd_deadline', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Target Close Date</Label>
                  <Input
                    type="date"
                    value={formData?.closing_date ? formData.closing_date.split('T')[0] : ''}
                    onChange={(e) => setField('closing_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Contract Date</Label>
                  <Input
                    type="date"
                    value={formData?.contract_date ? formData.contract_date.split('T')[0] : ''}
                    onChange={(e) => setField('contract_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Title Company</Label>
                  <Input
                    value={formData?.title_company || ''}
                    onChange={(e) => setField('title_company', e.target.value)}
                    className="mt-1"
                    placeholder="ABC Title Company"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Closing Attorney</Label>
                  <Input
                    value={formData?.closing_attorney || ''}
                    onChange={(e) => setField('closing_attorney', e.target.value)}
                    className="mt-1"
                    placeholder="Attorney name"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 mt-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData?.financing_contingency || false}
                      onChange={(e) => setField('financing_contingency', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600"
                    />
                    <span className="text-sm text-gray-700">Financing Contingency</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Wholesale / Assignment — shown for assignment or double_close */}
            {(formData?.deal_type === 'assignment' || formData?.deal_type === 'double_close') && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Wholesale / Assignment</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">End Buyer</Label>
                    <Input
                      value={formData?.end_buyer_name || ''}
                      onChange={(e) => setField('end_buyer_name', e.target.value)}
                      className="mt-1"
                      placeholder="Buyer name or company"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">End Buyer Offer ($)</Label>
                    <Input
                      type="number"
                      value={formData?.end_buyer_offer || ''}
                      onChange={(e) => setField('end_buyer_offer', e.target.value)}
                      className="mt-1"
                      placeholder="195000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">B-to-C Contract Date</Label>
                    <Input
                      type="date"
                      value={formData?.btoc_contract_date ? formData.btoc_contract_date.split('T')[0] : ''}
                      onChange={(e) => setField('btoc_contract_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                {/* Auto-calculated assignment fee */}
                {(parseFloat(formData?.end_buyer_offer) > 0 && parseFloat(formData?.final_price || formData?.initial_offer || formData?.asking_price) > 0) && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-700 font-medium">Assignment Fee (calculated)</span>
                      <span className="text-lg font-semibold text-emerald-700">
                        ${(
                          (parseFloat(formData?.end_buyer_offer) || 0) -
                          (parseFloat(formData?.final_price) || parseFloat(formData?.initial_offer) || parseFloat(formData?.asking_price) || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      End Buyer Offer (${(parseFloat(formData?.end_buyer_offer) || 0).toLocaleString()})
                      {' '}- Contract Price (${(parseFloat(formData?.final_price) || parseFloat(formData?.initial_offer) || parseFloat(formData?.asking_price) || 0).toLocaleString()})
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Negotiation Notes */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Negotiation Notes</h3>
              <Textarea
                value={formData?.negotiation_notes || ''}
                onChange={(e) => setField('negotiation_notes', e.target.value)}
                rows={4}
                placeholder="Track negotiation details, seller concerns, terms discussed..."
              />
            </div>
          </div>
        );

      case 'deal-analyzer':
        return (
          <div className="h-full">
            <PipelineDealAnalyzer />
          </div>
        );
      
      case 'tasks':
        return (
          <div className="p-6">
            <RecordTasksPanel
              module="opportunities"
              recordId={opportunityId}
              recordName={formData?.address || formData?.property_address || 'Opportunity'}
            />
          </div>
        );

      case 'contacts': {
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
                <p className="text-sm text-gray-500">{oppContacts.length} contact{oppContacts.length !== 1 ? 's' : ''} for this opportunity</p>
              </div>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowAddContact(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add Contact
              </Button>
            </div>

            {/* Add Contact Form */}
            {showAddContact && (
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">New Contact</h3>
                  <button onClick={() => setShowAddContact(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Name *</Label>
                    <Input
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Role</Label>
                    <Select value={newContact.role} onValueChange={(v) => setNewContact(prev => ({ ...prev, role: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONTACT_ROLES.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Company</Label>
                    <Input
                      value={newContact.company}
                      onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                      className="mt-1"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Phone</Label>
                    <Input
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1"
                      placeholder="(864) 555-0100"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <Input
                      value={newContact.email}
                      onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newContact.is_primary}
                        onChange={(e) => setNewContact(prev => ({ ...prev, is_primary: e.target.checked }))}
                        className="rounded border-gray-300 text-emerald-600"
                      />
                      <span className="text-sm text-gray-600">Primary contact</span>
                    </label>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-500">Notes</Label>
                    <Textarea
                      value={newContact.notes}
                      onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-1"
                      rows={2}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddContact(false)}>Cancel</Button>
                  <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleAddOppContact}>Add Contact</Button>
                </div>
              </div>
            )}

            {/* Contact Cards Grid */}
            {oppContactsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#047857]" />
                <span className="ml-2 text-gray-500">Loading contacts...</span>
              </div>
            ) : oppContacts.length === 0 ? (
              <div className="bg-white border rounded-lg p-12 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No contacts yet. Add your first contact above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {oppContacts.map(contact => {
                  const roleMeta = CONTACT_ROLES.find(r => r.id === contact.role);
                  return (
                    <div key={contact.id} className="bg-white border rounded-lg p-5 hover:shadow-sm transition-shadow relative">
                      {contact.is_primary && (
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400 absolute top-3 right-3" />
                      )}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-gray-600">
                            {contact.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm text-gray-900 truncate">{contact.name}</h4>
                          <span className={cn("inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-1", roleMeta?.color || 'bg-gray-100 text-gray-700')}>
                            {roleMeta?.label || contact.role}
                          </span>
                        </div>
                      </div>
                      {contact.company && (
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {contact.company}
                        </p>
                      )}
                      <div className="space-y-1.5">
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="text-xs text-gray-600 flex items-center gap-1.5 hover:text-[#047857]">
                            <Phone className="w-3 h-3" /> {contact.phone}
                          </a>
                        )}
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="text-xs text-gray-600 flex items-center gap-1.5 hover:text-[#047857]">
                            <Mail className="w-3 h-3" /> {contact.email}
                          </a>
                        )}
                      </div>
                      {contact.notes && (
                        <p className="text-xs text-gray-400 mt-3 line-clamp-2 border-t pt-2">{contact.notes}</p>
                      )}
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleDeleteOppContact(contact.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      case 'comps': {
        const compStats = oppComps.length > 0 ? {
          avgPrice: oppComps.reduce((s, c) => s + (c.sale_price || 0), 0) / oppComps.length,
          avgPsf: oppComps.filter(c => c.price_per_sqft).length > 0
            ? oppComps.filter(c => c.price_per_sqft).reduce((s, c) => s + c.price_per_sqft, 0) / oppComps.filter(c => c.price_per_sqft).length
            : 0,
          count: oppComps.length,
        } : { avgPrice: 0, avgPsf: 0, count: 0 };
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Comparable Sales</h2>
                <p className="text-sm text-gray-500">Analyze nearby property sales to determine value</p>
              </div>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowAddComp(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add Comp
              </Button>
            </div>

            {/* Summary Stats */}
            {oppComps.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Avg Sale Price</p>
                  <p className="text-xl font-semibold">${compStats.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Avg $/SF</p>
                  <p className="text-xl font-semibold">${compStats.avgPsf.toFixed(2)}</p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1"># Comps</p>
                  <p className="text-xl font-semibold">{compStats.count}</p>
                </div>
              </div>
            )}

            {/* Add Comp Form */}
            {showAddComp && (
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">New Comparable</h3>
                  <button onClick={() => setShowAddComp(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-500">Address *</Label>
                    <Input
                      value={newComp.address}
                      onChange={(e) => setNewComp(prev => ({ ...prev, address: e.target.value }))}
                      className="mt-1"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Source</Label>
                    <Select value={newComp.source} onValueChange={(v) => setNewComp(prev => ({ ...prev, source: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MLS">MLS</SelectItem>
                        <SelectItem value="County Records">County Records</SelectItem>
                        <SelectItem value="Zillow">Zillow</SelectItem>
                        <SelectItem value="Redfin">Redfin</SelectItem>
                        <SelectItem value="Agent">Agent</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">City</Label>
                    <Input
                      value={newComp.city}
                      onChange={(e) => setNewComp(prev => ({ ...prev, city: e.target.value }))}
                      className="mt-1"
                      placeholder="Greenville"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">State</Label>
                    <Input
                      value={newComp.state}
                      onChange={(e) => setNewComp(prev => ({ ...prev, state: e.target.value }))}
                      className="mt-1"
                      placeholder="SC"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Sale Date</Label>
                    <Input
                      type="date"
                      value={newComp.sale_date}
                      onChange={(e) => setNewComp(prev => ({ ...prev, sale_date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Sale Price ($)</Label>
                    <Input
                      type="number"
                      value={newComp.sale_price}
                      onChange={(e) => setNewComp(prev => ({ ...prev, sale_price: e.target.value }))}
                      className="mt-1"
                      placeholder="185000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Square Footage</Label>
                    <Input
                      type="number"
                      value={newComp.square_footage}
                      onChange={(e) => setNewComp(prev => ({ ...prev, square_footage: e.target.value }))}
                      className="mt-1"
                      placeholder="1450"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Lot Size (acres)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newComp.lot_size_acres}
                      onChange={(e) => setNewComp(prev => ({ ...prev, lot_size_acres: e.target.value }))}
                      className="mt-1"
                      placeholder="0.25"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Bedrooms</Label>
                    <Input
                      type="number"
                      value={newComp.bedrooms}
                      onChange={(e) => setNewComp(prev => ({ ...prev, bedrooms: e.target.value }))}
                      className="mt-1"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Bathrooms</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newComp.bathrooms}
                      onChange={(e) => setNewComp(prev => ({ ...prev, bathrooms: e.target.value }))}
                      className="mt-1"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Year Built</Label>
                    <Input
                      type="number"
                      value={newComp.year_built}
                      onChange={(e) => setNewComp(prev => ({ ...prev, year_built: e.target.value }))}
                      className="mt-1"
                      placeholder="2005"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Distance (miles)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newComp.distance_miles}
                      onChange={(e) => setNewComp(prev => ({ ...prev, distance_miles: e.target.value }))}
                      className="mt-1"
                      placeholder="1.2"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs text-gray-500">Notes</Label>
                    <Textarea
                      value={newComp.notes}
                      onChange={(e) => setNewComp(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-1"
                      rows={2}
                      placeholder="Condition, adjustments, etc."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddComp(false)}>Cancel</Button>
                  <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleAddOppComp}>Add Comparable</Button>
                </div>
              </div>
            )}

            {/* Comps Table */}
            {oppCompsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#047857]" />
                <span className="ml-2 text-gray-500">Loading comparables...</span>
              </div>
            ) : oppComps.length === 0 ? (
              <div className="bg-white border rounded-lg p-12 text-center">
                <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No comparable sales yet. Add your first comp above.</p>
              </div>
            ) : (
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">$/SF</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Beds/Baths</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Distance</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {oppComps.map(comp => (
                      <React.Fragment key={comp.id}>
                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedCompId(expandedCompId === comp.id ? null : comp.id)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <ChevronRight className={cn("w-3.5 h-3.5 text-gray-400 transition-transform", expandedCompId === comp.id && "rotate-90")} />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{comp.address}</p>
                                <p className="text-xs text-gray-400">{comp.city}{comp.state ? `, ${comp.state}` : ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {comp.sale_date ? new Date(comp.sale_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium text-right">
                            {comp.sale_price ? `$${parseFloat(comp.sale_price).toLocaleString()}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">
                            {comp.price_per_sqft ? `$${parseFloat(comp.price_per_sqft).toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center">
                            {comp.bedrooms || '-'}/{comp.bathrooms || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">
                            {comp.distance_miles ? `${comp.distance_miles} mi` : '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteOppComp(comp.id); }}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                        {expandedCompId === comp.id && (
                          <tr>
                            <td colSpan={7} className="px-4 py-3 bg-gray-50">
                              <div className="grid grid-cols-4 gap-4 text-xs">
                                <div>
                                  <span className="text-gray-400">Square Footage:</span>
                                  <span className="ml-1 font-medium">{comp.square_footage ? `${comp.square_footage.toLocaleString()} sf` : '-'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Lot Size:</span>
                                  <span className="ml-1 font-medium">{comp.lot_size_acres ? `${comp.lot_size_acres} ac` : '-'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Year Built:</span>
                                  <span className="ml-1 font-medium">{comp.year_built || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Source:</span>
                                  <span className="ml-1 font-medium">{comp.source || '-'}</span>
                                </div>
                              </div>
                              {comp.notes && (
                                <div className="mt-2 text-xs">
                                  <span className="text-gray-400">Notes:</span>
                                  <p className="text-gray-600 mt-0.5">{comp.notes}</p>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      }
      
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
                  {(mailingRecords || []).map((record) => (
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
              {(communications || []).map((comm) => (
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
                    <Input value={newComm.contact} onChange={(e) => setNewComm({ ...newComm, contact: e.target.value })} placeholder={formData?.seller_name || 'Contact name'} />
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
              {(esignedDocs || []).map((doc) => (
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
                          {(doc.signers || []).map((signer, idx) => (
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
            <div className="bg-white border rounded-lg p-6">
              <div>
                <Label className="text-xs text-gray-500">Notes</Label>
                <Textarea
                  value={formData?.notes || ''}
                  onChange={(e) => setField('notes', e.target.value)}
                  className="mt-1"
                  rows={10}
                  placeholder="Add notes about this opportunity..."
                />
              </div>
            </div>
          </div>
        );

      case 'files':
        return (
          <div className="p-6">
            <DocumentLibrary
              entityType="opportunity"
              entityId={opportunityId}
              entityName={formData?.deal_number || formData?.address}
              showHeader={true}
              showCategories={true}
              showUpload={true}
            />
          </div>
        );

      case 'stage-prospecting':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Prospecting Stage</h2>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={() => {
                  const progress = stageProgress['Prospecting'];
                  if (progress?.requiredCompleted < progress?.requiredTotal) {
                    if (!confirm(`${progress.requiredTotal - progress.requiredCompleted} required tasks are incomplete. Advance anyway?`)) return;
                  }
                  setField('stage', 'Contacted');
                }}
              >
                Move to Contacted
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Prospecting Checklist</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${stageProgress['Prospecting']?.pct || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {stageProgress['Prospecting']?.completed || 0}/{stageProgress['Prospecting']?.total || 0}
                    </span>
                  </div>
                  {(stageTasks['Prospecting'] || []).map((task) => (
                    <label key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.is_complete}
                        onChange={() => handleToggleTask(task.id, task.is_complete, 'Prospecting')}
                        className="rounded border-gray-300 text-emerald-600"
                      />
                      <span className={cn("text-sm", task.is_complete && "line-through text-gray-400")}>
                        {task.task_text}
                      </span>
                      {task.is_required && (
                        <Badge variant="outline" className="text-[10px] ml-auto">Required</Badge>
                      )}
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Lead Source Info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Source</p>
                    <p className="font-medium">{formData?.source || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date Added</p>
                    <p className="font-medium">{formData?.created_at ? new Date(formData.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Days in Pipeline</p>
                    <p className="font-medium">{formData?.created_at ? Math.floor((Date.now() - new Date(formData.created_at)) / (1000 * 60 * 60 * 24)) : 0} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'stage-contacted':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Contacted Stage</h2>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={() => {
                  const progress = stageProgress['Contacted'];
                  if (progress?.requiredCompleted < progress?.requiredTotal) {
                    if (!confirm(`${progress.requiredTotal - progress.requiredCompleted} required tasks are incomplete. Advance anyway?`)) return;
                  }
                  setField('stage', 'Qualified');
                }}
              >
                Move to Qualified
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Contact Checklist</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${stageProgress['Contacted']?.pct || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {stageProgress['Contacted']?.completed || 0}/{stageProgress['Contacted']?.total || 0}
                    </span>
                  </div>
                  {(stageTasks['Contacted'] || []).map((task) => (
                    <label key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.is_complete}
                        onChange={() => handleToggleTask(task.id, task.is_complete, 'Contacted')}
                        className="rounded border-gray-300 text-emerald-600"
                      />
                      <span className={cn("text-sm", task.is_complete && "line-through text-gray-400")}>
                        {task.task_text}
                      </span>
                      {task.is_required && (
                        <Badge variant="outline" className="text-[10px] ml-auto">Required</Badge>
                      )}
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Contact History</h3>
                {communications.length > 0 ? (
                  <div className="space-y-2">
                    {(communications || []).slice(0, 5).map((comm, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{comm.type}</span>
                          <span className="text-gray-500 text-xs">{comm.date}</span>
                        </div>
                        <p className="text-gray-600 text-xs mt-1">{comm.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No contact history yet.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'stage-qualified':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Qualified Stage</h2>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={() => {
                  const progress = stageProgress['Qualified'];
                  if (progress?.requiredCompleted < progress?.requiredTotal) {
                    if (!confirm(`${progress.requiredTotal - progress.requiredCompleted} required tasks are incomplete. Advance anyway?`)) return;
                  }
                  setField('stage', 'Negotiating');
                }}
              >
                Move to Negotiating
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Qualification Checklist</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${stageProgress['Qualified']?.pct || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {stageProgress['Qualified']?.completed || 0}/{stageProgress['Qualified']?.total || 0}
                    </span>
                  </div>
                  {(stageTasks['Qualified'] || []).map((task) => (
                    <label key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.is_complete}
                        onChange={() => handleToggleTask(task.id, task.is_complete, 'Qualified')}
                        className="rounded border-gray-300 text-emerald-600"
                      />
                      <span className={cn("text-sm", task.is_complete && "line-through text-gray-400")}>
                        {task.task_text}
                      </span>
                      {task.is_required && (
                        <Badge variant="outline" className="text-[10px] ml-auto">Required</Badge>
                      )}
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Deal Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Asking Price</span>
                    <span className="font-medium">${(formData?.asking_price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Estimated Value</span>
                    <span className="font-medium">${(formData?.estimated_value || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm text-green-700">Potential Profit</span>
                    <span className="font-medium text-green-700">${((formData?.estimated_value || 0) - (formData?.asking_price || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'stage-negotiating':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Negotiating Stage</h2>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={() => {
                  const progress = stageProgress['Negotiating'];
                  if (progress?.requiredCompleted < progress?.requiredTotal) {
                    if (!confirm(`${progress.requiredTotal - progress.requiredCompleted} required tasks are incomplete. Advance anyway?`)) return;
                  }
                  setField('stage', 'Under Contract');
                }}
              >
                Move to Under Contract
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Negotiation Checklist</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${stageProgress['Negotiating']?.pct || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {stageProgress['Negotiating']?.completed || 0}/{stageProgress['Negotiating']?.total || 0}
                    </span>
                  </div>
                  {(stageTasks['Negotiating'] || []).map((task) => (
                    <label key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.is_complete}
                        onChange={() => handleToggleTask(task.id, task.is_complete, 'Negotiating')}
                        className="rounded border-gray-300 text-emerald-600"
                      />
                      <span className={cn("text-sm", task.is_complete && "line-through text-gray-400")}>
                        {task.task_text}
                      </span>
                      {task.is_required && (
                        <Badge variant="outline" className="text-[10px] ml-auto">Required</Badge>
                      )}
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Negotiation Tracker</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Initial Offer</Label>
                    <Input
                      type="number"
                      value={formData?.initial_offer || ''}
                      onChange={(e) => setField('initial_offer', e.target.value)}
                      className="mt-1"
                      placeholder="Your initial offer"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Counter Offer</Label>
                    <Input
                      type="number"
                      value={formData?.counter_offer || ''}
                      onChange={(e) => setField('counter_offer', e.target.value)}
                      className="mt-1"
                      placeholder="Seller's counter"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Final Agreed Price</Label>
                    <Input
                      type="number"
                      value={formData?.final_price || ''}
                      onChange={(e) => setField('final_price', e.target.value)}
                      className="mt-1"
                      placeholder="Agreed price"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Negotiation Notes</Label>
                    <Textarea
                      value={formData?.negotiation_notes || ''}
                      onChange={(e) => setField('negotiation_notes', e.target.value)}
                      className="mt-1"
                      rows={4}
                      placeholder="Track negotiation details, seller concerns, terms discussed..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'stage-under-contract':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Under Contract</h2>
              <Button
                className="bg-[#047857] hover:bg-[#065f46]"
                onClick={() => {
                  const progress = stageProgress['Under Contract'];
                  if (progress?.requiredCompleted < progress?.requiredTotal) {
                    if (!confirm(`${progress.requiredTotal - progress.requiredCompleted} required tasks are incomplete. Convert anyway?`)) return;
                  }
                  handleConvertToProject();
                }}
              >
                Convert to Project
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Under Contract Checklist</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${stageProgress['Under Contract']?.pct || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {stageProgress['Under Contract']?.completed || 0}/{stageProgress['Under Contract']?.total || 0}
                    </span>
                  </div>
                  {(stageTasks['Under Contract'] || []).map((task) => (
                    <label key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.is_complete}
                        onChange={() => handleToggleTask(task.id, task.is_complete, 'Under Contract')}
                        className="rounded border-gray-300 text-emerald-600"
                      />
                      <span className={cn("text-sm", task.is_complete && "line-through text-gray-400")}>
                        {task.task_text}
                      </span>
                      {task.is_required && (
                        <Badge variant="outline" className="text-[10px] ml-auto">Required</Badge>
                      )}
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Contract Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Contract Date</Label>
                    <Input
                      type="date"
                      value={formData?.contract_date || ''}
                      onChange={(e) => setField('contract_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Earnest Money ($)</Label>
                    <Input
                      type="number"
                      value={formData?.earnest_money || ''}
                      onChange={(e) => setField('earnest_money', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Due Diligence Deadline</Label>
                    <Input
                      type="date"
                      value={formData?.dd_deadline || ''}
                      onChange={(e) => setField('dd_deadline', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Closing Date</Label>
                    <Input
                      type="date"
                      value={formData?.closing_date || ''}
                      onChange={(e) => setField('closing_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notes & Activity</h2>
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Notes</h3>
                <Textarea
                  value={formData?.notes || ''}
                  onChange={(e) => setField('notes', e.target.value)}
                  rows={12}
                  placeholder="Add notes about this opportunity..."
                />
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-medium mb-4">Activity Timeline</h3>
                <div className="space-y-3">
                  {[
                    ...(communications || []).map(c => ({ type: 'comm', ...c })),
                    ...(mailings || []).map(m => ({ type: 'mail', ...m })),
                  ].sort((a, b) => new Date(b.date || b.sentDate) - new Date(a.date || a.sentDate)).slice(0, 10).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${item.type === 'comm' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.type === 'comm' ? item.type : item.template}</p>
                        <p className="text-xs text-gray-500">{item.date || item.sentDate}</p>
                        {item.summary && <p className="text-xs text-gray-600 mt-1">{item.summary}</p>}
                      </div>
                    </div>
                  ))}
                  {(communications || []).length === 0 && (mailings || []).length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No activity recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="bg-white border rounded-lg p-12 text-center">
              <p className="text-gray-600 capitalize font-medium">{activeSection.replace(/-/g, ' ')}</p>
              <p className="text-gray-400 text-sm mt-2">Section loading...</p>
            </div>
          </div>
        );
    }
  };

  const currentStage = stages.find(s => s.id === formData?.stage) || stages[0];

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      {/* Dark Sidebar */}
      <div className="w-52 bg-[#1e2a3a] flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <button onClick={() => navigate('/opportunities')} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Pipeline
          </button>
          <h2 className="text-white font-semibold truncate text-sm">{formData?.deal_number || 'New Deal'}</h2>
          <p className="text-gray-500 text-xs mt-1">{formData?.address || 'No address'}</p>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {(sidebarGroups || []).map((group) => (
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
                  {(group.items || []).map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors",
                          activeSection === item.id
                            ? "bg-[#047857] text-white"
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
                <h1 className="text-xl font-semibold">{formData?.deal_number || 'New Deal'}</h1>
                <span className="text-xs px-2 py-1 rounded font-medium" style={{ backgroundColor: currentStage?.color + '20', color: currentStage?.color }}>
                  {currentStage?.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{formData?.address || 'No address'}, {formData?.city || ''} {formData?.state || ''} {formData?.zip_code || ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {formData?.stage === 'Under Contract' ? (
              <Button onClick={handleConvertToProject} className="bg-[#047857] hover:bg-[#065f46]">
                <ArrowRight className="w-4 h-4 mr-1" />Convert to Project
              </Button>
            ) : (
              <Button onClick={handleAdvanceStage} className="bg-[#047857] hover:bg-[#065f46]">Advance Stage</Button>
            )}
          </div>
        </div>

        {/* Stage Progress Bar */}
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center gap-2">
            {(stages || []).map((stage, idx) => {
              const isCurrent = stage.id === formData?.stage;
              const isPast = stages.findIndex(s => s.id === formData?.stage) > idx;
              return (
                <React.Fragment key={stage.id}>
                  <button
                    onClick={() => setField('stage', stage.id)}
                    className="flex items-center gap-2 hover:opacity-80"
                  >
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
                  </button>
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

      {/* Convert to Project Modal */}
      <ConvertToProjectModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        opportunity={formData}
        dealSheet={null}
        onSuccess={handleConversionSuccess}
      />
    </div>
  );
};

export default OpportunityDetailPage;
