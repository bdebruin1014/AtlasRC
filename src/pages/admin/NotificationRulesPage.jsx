import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Bell, Search, Plus, Edit2, Trash2, Mail, Smartphone, MessageSquare,
  RefreshCw, Save, AlertTriangle, CheckCircle, Settings, Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock notification rules
const mockRules = [
  {
    id: 'rule_001',
    name: 'New User Registration',
    event: 'user.created',
    description: 'Notify when a new user registers',
    enabled: true,
    channels: ['email', 'in_app'],
    recipients: ['admins'],
    template: 'welcome',
    priority: 'normal',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'rule_002',
    name: 'Invoice Overdue',
    event: 'invoice.overdue',
    description: 'Notify when an invoice becomes overdue',
    enabled: true,
    channels: ['email', 'sms', 'in_app'],
    recipients: ['accountants', 'project_owner'],
    template: 'invoice_reminder',
    priority: 'high',
    createdAt: '2024-01-08T15:30:00Z',
  },
  {
    id: 'rule_003',
    name: 'Project Milestone Completed',
    event: 'milestone.completed',
    description: 'Notify when a project milestone is completed',
    enabled: true,
    channels: ['email', 'in_app'],
    recipients: ['project_team', 'investors'],
    template: 'milestone_update',
    priority: 'normal',
    createdAt: '2024-01-05T09:00:00Z',
  },
  {
    id: 'rule_004',
    name: 'Security Alert',
    event: 'security.alert',
    description: 'Notify on suspicious login or security events',
    enabled: true,
    channels: ['email', 'sms', 'in_app'],
    recipients: ['admins', 'affected_user'],
    template: 'security_alert',
    priority: 'urgent',
    createdAt: '2024-01-12T14:00:00Z',
  },
  {
    id: 'rule_005',
    name: 'Document Shared',
    event: 'document.shared',
    description: 'Notify when a document is shared with user',
    enabled: false,
    channels: ['email'],
    recipients: ['recipient'],
    template: 'document_shared',
    priority: 'low',
    createdAt: '2024-01-14T16:00:00Z',
  },
  {
    id: 'rule_006',
    name: 'Task Assigned',
    event: 'task.assigned',
    description: 'Notify when a task is assigned to a user',
    enabled: true,
    channels: ['email', 'in_app'],
    recipients: ['assignee'],
    template: 'task_assignment',
    priority: 'normal',
    createdAt: '2024-01-13T11:00:00Z',
  },
];

// Available events
const availableEvents = [
  { id: 'user.created', label: 'User Created', category: 'Users' },
  { id: 'user.updated', label: 'User Updated', category: 'Users' },
  { id: 'user.deleted', label: 'User Deleted', category: 'Users' },
  { id: 'project.created', label: 'Project Created', category: 'Projects' },
  { id: 'project.updated', label: 'Project Updated', category: 'Projects' },
  { id: 'milestone.completed', label: 'Milestone Completed', category: 'Projects' },
  { id: 'task.assigned', label: 'Task Assigned', category: 'Tasks' },
  { id: 'task.completed', label: 'Task Completed', category: 'Tasks' },
  { id: 'invoice.created', label: 'Invoice Created', category: 'Billing' },
  { id: 'invoice.paid', label: 'Invoice Paid', category: 'Billing' },
  { id: 'invoice.overdue', label: 'Invoice Overdue', category: 'Billing' },
  { id: 'document.shared', label: 'Document Shared', category: 'Documents' },
  { id: 'document.uploaded', label: 'Document Uploaded', category: 'Documents' },
  { id: 'security.alert', label: 'Security Alert', category: 'Security' },
  { id: 'security.login_failed', label: 'Login Failed', category: 'Security' },
];

// Available recipient types
const recipientTypes = [
  { id: 'admins', label: 'All Admins' },
  { id: 'managers', label: 'All Managers' },
  { id: 'accountants', label: 'All Accountants' },
  { id: 'project_owner', label: 'Project Owner' },
  { id: 'project_team', label: 'Project Team' },
  { id: 'investors', label: 'Project Investors' },
  { id: 'assignee', label: 'Task Assignee' },
  { id: 'affected_user', label: 'Affected User' },
  { id: 'recipient', label: 'Document Recipient' },
];

const NotificationRulesPage = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState(mockRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [saving, setSaving] = useState(false);

  const [ruleData, setRuleData] = useState({
    name: '',
    event: '',
    description: '',
    channels: ['email'],
    recipients: [],
    template: '',
    priority: 'normal',
    enabled: true,
  });

  const filteredRules = rules.filter(rule =>
    !searchQuery ||
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.event.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      case 'in_app':
        return <Bell className="w-4 h-4" />;
      case 'slack':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateRule = () => {
    setSelectedRule(null);
    setRuleData({
      name: '',
      event: '',
      description: '',
      channels: ['email'],
      recipients: [],
      template: '',
      priority: 'normal',
      enabled: true,
    });
    setShowRuleDialog(true);
  };

  const handleEditRule = (rule) => {
    setSelectedRule(rule);
    setRuleData({
      name: rule.name,
      event: rule.event,
      description: rule.description,
      channels: [...rule.channels],
      recipients: [...rule.recipients],
      template: rule.template,
      priority: rule.priority,
      enabled: rule.enabled,
    });
    setShowRuleDialog(true);
  };

  const handleToggleRule = (ruleId) => {
    setRules(prev => prev.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));

    const rule = rules.find(r => r.id === ruleId);
    toast({
      title: rule.enabled ? 'Rule Disabled' : 'Rule Enabled',
      description: `${rule.name} has been ${rule.enabled ? 'disabled' : 'enabled'}`,
    });
  };

  const handleSaveRule = async () => {
    if (!ruleData.name || !ruleData.event) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in required fields',
      });
      return;
    }

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (selectedRule) {
      setRules(prev => prev.map(r =>
        r.id === selectedRule.id ? { ...r, ...ruleData } : r
      ));
      toast({
        title: 'Rule Updated',
        description: `${ruleData.name} has been saved`,
      });
    } else {
      const newRule = {
        id: `rule_${Date.now()}`,
        ...ruleData,
        createdAt: new Date().toISOString(),
      };
      setRules(prev => [...prev, newRule]);
      toast({
        title: 'Rule Created',
        description: `${ruleData.name} has been created`,
      });
    }

    setSaving(false);
    setShowRuleDialog(false);
  };

  const handleDeleteRule = () => {
    if (!selectedRule) return;

    setRules(prev => prev.filter(r => r.id !== selectedRule.id));
    setShowDeleteDialog(false);
    setSelectedRule(null);

    toast({
      title: 'Rule Deleted',
      description: 'Notification rule has been deleted',
    });
  };

  const toggleChannel = (channel) => {
    setRuleData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const toggleRecipient = (recipient) => {
    setRuleData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(recipient)
        ? prev.recipients.filter(r => r !== recipient)
        : [...prev.recipients, recipient],
    }));
  };

  // Stats
  const activeRules = rules.filter(r => r.enabled).length;
  const totalRules = rules.length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Notification Rules | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notification Rules</h1>
          <p className="text-gray-600 mt-2">Configure automated notifications for system events</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateRule}>
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Rules</p>
                <p className="text-2xl font-bold">{totalRules}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeRules}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Disabled</p>
                <p className="text-2xl font-bold text-gray-600">{totalRules - activeRules}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Urgent Rules</p>
                <p className="text-2xl font-bold text-red-600">
                  {rules.filter(r => r.priority === 'urgent').length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search rules..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Rules</CardTitle>
          <CardDescription>
            {filteredRules.length} rule{filteredRules.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Rule</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No rules found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow key={rule.id} className={!rule.enabled ? 'opacity-50' : ''}>
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-gray-500">{rule.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{rule.event}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {rule.channels.map(channel => (
                          <Badge key={channel} variant="outline" className="gap-1">
                            {getChannelIcon(channel)}
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rule.recipients.slice(0, 2).map(recipient => (
                          <Badge key={recipient} variant="outline" className="text-xs">
                            {recipient.replace('_', ' ')}
                          </Badge>
                        ))}
                        {rule.recipients.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{rule.recipients.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadge(rule.priority)}>
                        {rule.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRule(rule);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rule Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedRule ? 'Edit Rule' : 'Create Rule'}</DialogTitle>
            <DialogDescription>
              Configure notification triggers and delivery channels
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., New User Alert"
                  value={ruleData.name}
                  onChange={(e) => setRuleData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event">Trigger Event *</Label>
                <Select
                  value={ruleData.event}
                  onValueChange={(value) => setRuleData(prev => ({ ...prev, event: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEvents.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        <div>
                          <div>{event.label}</div>
                          <div className="text-xs text-gray-500">{event.category}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of this rule"
                value={ruleData.description}
                onChange={(e) => setRuleData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delivery Channels</Label>
                <div className="space-y-2">
                  {[
                    { id: 'email', label: 'Email', icon: Mail },
                    { id: 'sms', label: 'SMS', icon: Smartphone },
                    { id: 'in_app', label: 'In-App', icon: Bell },
                  ].map(channel => (
                    <div key={channel.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={channel.id}
                        checked={ruleData.channels.includes(channel.id)}
                        onCheckedChange={() => toggleChannel(channel.id)}
                      />
                      <Label htmlFor={channel.id} className="flex items-center gap-2 font-normal cursor-pointer">
                        <channel.icon className="w-4 h-4" />
                        {channel.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={ruleData.priority}
                  onValueChange={(value) => setRuleData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recipients</Label>
              <div className="grid grid-cols-3 gap-2">
                {recipientTypes.map(recipient => (
                  <div key={recipient.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={recipient.id}
                      checked={ruleData.recipients.includes(recipient.id)}
                      onCheckedChange={() => toggleRecipient(recipient.id)}
                    />
                    <Label htmlFor={recipient.id} className="text-sm font-normal cursor-pointer">
                      {recipient.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label>Rule Status</Label>
                <p className="text-sm text-gray-500">Enable or disable this rule</p>
              </div>
              <Switch
                checked={ruleData.enabled}
                onCheckedChange={(checked) => setRuleData(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Rule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Rule
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification rule?
            </DialogDescription>
          </DialogHeader>
          {selectedRule && (
            <div className="py-4 space-y-2 text-sm">
              <div><strong>Rule:</strong> {selectedRule.name}</div>
              <div><strong>Event:</strong> {selectedRule.event}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRule}>
              Delete Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationRulesPage;
