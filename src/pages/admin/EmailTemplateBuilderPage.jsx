import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mail, Search, Plus, Edit2, Copy, Eye, Save, Send, Code,
  FileText, RefreshCw, Trash2, Variable
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock email templates
const mockTemplates = [
  {
    id: 'tpl_001',
    name: 'Welcome Email',
    slug: 'welcome',
    subject: 'Welcome to {{company_name}}!',
    category: 'onboarding',
    lastModified: '2024-01-10T10:00:00Z',
    modifiedBy: 'John Smith',
    status: 'active',
    body: `<h1>Welcome, {{user_name}}!</h1>
<p>Thank you for joining {{company_name}}. We're excited to have you on board.</p>
<p>Your account has been created with the email: <strong>{{user_email}}</strong></p>
<p>To get started, please click the button below:</p>
<a href="{{login_url}}" class="button">Log In to Your Account</a>
<p>If you have any questions, feel free to reach out to our support team.</p>
<p>Best regards,<br>The {{company_name}} Team</p>`,
  },
  {
    id: 'tpl_002',
    name: 'Password Reset',
    slug: 'password_reset',
    subject: 'Reset Your Password - {{company_name}}',
    category: 'security',
    lastModified: '2024-01-08T15:30:00Z',
    modifiedBy: 'Sarah Johnson',
    status: 'active',
    body: `<h1>Password Reset Request</h1>
<p>Hi {{user_name}},</p>
<p>We received a request to reset your password. Click the button below to create a new password:</p>
<a href="{{reset_url}}" class="button">Reset Password</a>
<p>This link will expire in {{expiry_hours}} hours.</p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
  },
  {
    id: 'tpl_003',
    name: 'Invoice',
    slug: 'invoice',
    subject: 'Invoice #{{invoice_number}} from {{company_name}}',
    category: 'billing',
    lastModified: '2024-01-05T09:00:00Z',
    modifiedBy: 'Emily Chen',
    status: 'active',
    body: `<h1>Invoice #{{invoice_number}}</h1>
<p>Dear {{customer_name}},</p>
<p>Please find attached your invoice for {{invoice_amount}}.</p>
<p><strong>Due Date:</strong> {{due_date}}</p>
<p>To view and pay your invoice online, click the button below:</p>
<a href="{{invoice_url}}" class="button">View Invoice</a>
<p>Thank you for your business!</p>`,
  },
  {
    id: 'tpl_004',
    name: 'Project Update',
    slug: 'project_update',
    subject: 'Update on {{project_name}}',
    category: 'notification',
    lastModified: '2024-01-12T14:00:00Z',
    modifiedBy: 'Mike Davis',
    status: 'active',
    body: `<h1>Project Update: {{project_name}}</h1>
<p>Hi {{user_name}},</p>
<p>There's been an update to your project:</p>
<div class="update-box">
  <p><strong>{{update_title}}</strong></p>
  <p>{{update_description}}</p>
</div>
<a href="{{project_url}}" class="button">View Project</a>`,
  },
  {
    id: 'tpl_005',
    name: 'Weekly Report',
    slug: 'weekly_report',
    subject: 'Your Weekly Summary - {{date_range}}',
    category: 'report',
    lastModified: '2024-01-14T16:00:00Z',
    modifiedBy: 'John Smith',
    status: 'draft',
    body: `<h1>Weekly Summary</h1>
<p>Hi {{user_name}},</p>
<p>Here's your activity summary for {{date_range}}:</p>
<ul>
  <li>Projects updated: {{projects_count}}</li>
  <li>Tasks completed: {{tasks_count}}</li>
  <li>Documents uploaded: {{documents_count}}</li>
</ul>
<a href="{{dashboard_url}}" class="button">View Full Report</a>`,
  },
];

// Available variables
const availableVariables = [
  { name: 'user_name', description: 'Recipient\'s full name' },
  { name: 'user_email', description: 'Recipient\'s email address' },
  { name: 'company_name', description: 'Company name' },
  { name: 'login_url', description: 'Login page URL' },
  { name: 'reset_url', description: 'Password reset URL' },
  { name: 'project_name', description: 'Project name' },
  { name: 'project_url', description: 'Project page URL' },
  { name: 'invoice_number', description: 'Invoice number' },
  { name: 'invoice_amount', description: 'Invoice total amount' },
  { name: 'customer_name', description: 'Customer\'s name' },
  { name: 'due_date', description: 'Payment due date' },
  { name: 'current_date', description: 'Current date' },
];

const EmailTemplateBuilderPage = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editData, setEditData] = useState({
    name: '',
    slug: '',
    subject: '',
    category: 'notification',
    body: '',
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(templates.map(t => t.category))];

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setEditData({
      name: '',
      slug: '',
      subject: '',
      category: 'notification',
      body: '',
    });
    setShowEditorDialog(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setEditData({
      name: template.name,
      slug: template.slug,
      subject: template.subject,
      category: template.category,
      body: template.body,
    });
    setShowEditorDialog(true);
  };

  const handleDuplicateTemplate = (template) => {
    setSelectedTemplate(null);
    setEditData({
      name: `${template.name} (Copy)`,
      slug: `${template.slug}_copy`,
      subject: template.subject,
      category: template.category,
      body: template.body,
    });
    setShowEditorDialog(true);
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowPreviewDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!editData.name || !editData.slug || !editData.subject) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
      });
      return;
    }

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (selectedTemplate) {
      setTemplates(prev => prev.map(t =>
        t.id === selectedTemplate.id
          ? { ...t, ...editData, lastModified: new Date().toISOString(), modifiedBy: 'Current User' }
          : t
      ));
      toast({
        title: 'Template Updated',
        description: `${editData.name} has been saved`,
      });
    } else {
      const newTemplate = {
        id: `tpl_${Date.now()}`,
        ...editData,
        lastModified: new Date().toISOString(),
        modifiedBy: 'Current User',
        status: 'draft',
      };
      setTemplates(prev => [...prev, newTemplate]);
      toast({
        title: 'Template Created',
        description: `${editData.name} has been created`,
      });
    }

    setSaving(false);
    setShowEditorDialog(false);
  };

  const handleDeleteTemplate = (template) => {
    setTemplates(prev => prev.filter(t => t.id !== template.id));
    toast({
      title: 'Template Deleted',
      description: `${template.name} has been deleted`,
    });
  };

  const handleSendTest = async (template) => {
    toast({
      title: 'Test Email Sent',
      description: `A test email has been sent to your address`,
    });
  };

  const insertVariable = (variable) => {
    const varString = `{{${variable}}}`;
    setEditData(prev => ({
      ...prev,
      body: prev.body + varString,
    }));
  };

  const renderPreview = (body) => {
    // Replace variables with sample data
    const sampleData = {
      user_name: 'John Doe',
      user_email: 'john@example.com',
      company_name: 'Atlas RC',
      login_url: 'https://app.atlasrc.com/login',
      reset_url: 'https://app.atlasrc.com/reset/abc123',
      project_name: 'Sample Project',
      project_url: 'https://app.atlasrc.com/projects/1',
      invoice_number: 'INV-2024-001',
      invoice_amount: '$5,000.00',
      customer_name: 'Jane Smith',
      due_date: 'January 30, 2024',
      current_date: new Date().toLocaleDateString(),
      expiry_hours: '24',
      date_range: 'Jan 8-14, 2024',
      projects_count: '5',
      tasks_count: '12',
      documents_count: '8',
      dashboard_url: 'https://app.atlasrc.com/dashboard',
      update_title: 'Milestone Completed',
      update_description: 'The foundation work has been completed.',
    };

    let rendered = body;
    Object.entries(sampleData).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return rendered;
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Email Templates | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Template Builder</h1>
          <p className="text-gray-600 mt-2">Create and manage email templates with dynamic variables</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {templates.filter(t => t.status === 'active').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {templates.filter(t => t.status === 'draft').length}
                </p>
              </div>
              <Edit2 className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Variable className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <code className="text-xs text-gray-400">{template.slug}</code>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {template.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={template.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {template.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDateTime(template.lastModified)}</div>
                        <div className="text-xs text-gray-500">by {template.modifiedBy}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateTemplate(template)}
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendTest(template)}
                          title="Send Test"
                        >
                          <Send className="w-4 h-4" />
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

      {/* Editor Dialog */}
      <Dialog open={showEditorDialog} onOpenChange={setShowEditorDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              Design your email template with HTML and dynamic variables
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Welcome Email"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="e.g., welcome"
                    value={editData.slug}
                    onChange={(e) => setEditData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="subject">Subject Line *</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Welcome to {{company_name}}!"
                    value={editData.subject}
                    onChange={(e) => setEditData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editData.category}
                    onValueChange={(value) => setEditData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Email Body (HTML)</Label>
                <Textarea
                  id="body"
                  placeholder="<h1>Hello, {{user_name}}!</h1>"
                  value={editData.body}
                  onChange={(e) => setEditData(prev => ({ ...prev, body: e.target.value }))}
                  className="font-mono text-sm h-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Available Variables</Label>
                <ScrollArea className="h-[400px] border rounded-lg p-2">
                  <div className="space-y-1">
                    {availableVariables.map((variable) => (
                      <Button
                        key={variable.name}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => insertVariable(variable.name)}
                      >
                        <div>
                          <code className="text-blue-600">{`{{${variable.name}}}`}</code>
                          <div className="text-xs text-gray-500">{variable.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditorDialog(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => {
              setShowEditorDialog(false);
              setSelectedTemplate({ ...selectedTemplate, ...editData });
              setShowPreviewDialog(true);
            }}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview with sample data
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-500">Subject:</div>
                <div className="font-medium">{renderPreview(selectedTemplate.subject)}</div>
              </div>
              <ScrollArea className="h-[400px] border rounded-lg">
                <div
                  className="p-6 email-preview"
                  dangerouslySetInnerHTML={{ __html: renderPreview(selectedTemplate.body) }}
                />
              </ScrollArea>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => selectedTemplate && handleSendTest(selectedTemplate)}>
              <Send className="w-4 h-4 mr-2" />
              Send Test Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplateBuilderPage;
