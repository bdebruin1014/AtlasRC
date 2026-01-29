import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Megaphone, Plus, Edit2, Trash2, Eye, Calendar as CalendarIcon,
  RefreshCw, Save, AlertTriangle, Info, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Mock announcements
const mockAnnouncements = [
  {
    id: 'ann_001',
    title: 'Scheduled Maintenance',
    message: 'System will be undergoing maintenance on Saturday, Jan 20th from 2:00 AM - 4:00 AM EST. Some features may be temporarily unavailable.',
    type: 'warning',
    priority: 'high',
    startDate: '2024-01-18T00:00:00Z',
    endDate: '2024-01-21T00:00:00Z',
    targetAudience: ['all'],
    dismissible: true,
    active: true,
    createdBy: 'John Smith',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'ann_002',
    title: 'New Feature: Invoice Templates',
    message: 'We\'ve added customizable invoice templates! Check out the new templates in Settings > Invoices.',
    type: 'info',
    priority: 'normal',
    startDate: '2024-01-10T00:00:00Z',
    endDate: '2024-01-25T00:00:00Z',
    targetAudience: ['accountants', 'admins'],
    dismissible: true,
    active: true,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'ann_003',
    title: 'System Update Complete',
    message: 'The system has been updated to version 2.4.1 with performance improvements and bug fixes.',
    type: 'success',
    priority: 'low',
    startDate: '2024-01-14T00:00:00Z',
    endDate: '2024-01-17T00:00:00Z',
    targetAudience: ['all'],
    dismissible: true,
    active: false,
    createdBy: 'Mike Davis',
    createdAt: '2024-01-14T06:00:00Z',
  },
  {
    id: 'ann_004',
    title: 'Security Notice',
    message: 'Please update your password if you haven\'t done so in the last 90 days. Go to Settings > Security.',
    type: 'error',
    priority: 'high',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T00:00:00Z',
    targetAudience: ['all'],
    dismissible: false,
    active: true,
    createdBy: 'Emily Chen',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const audienceOptions = [
  { id: 'all', label: 'All Users' },
  { id: 'admins', label: 'Admins Only' },
  { id: 'managers', label: 'Managers' },
  { id: 'accountants', label: 'Accountants' },
  { id: 'team_members', label: 'Team Members' },
  { id: 'external', label: 'External Users' },
];

const AnnouncementBannerPage = () => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
    startDate: new Date(),
    endDate: null,
    targetAudience: ['all'],
    dismissible: true,
    active: true,
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBannerStyle = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isActive = (announcement) => {
    const now = new Date();
    const start = new Date(announcement.startDate);
    const end = announcement.endDate ? new Date(announcement.endDate) : null;

    if (!announcement.active) return false;
    if (now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  const handleCreate = () => {
    setSelectedAnnouncement(null);
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'normal',
      startDate: new Date(),
      endDate: null,
      targetAudience: ['all'],
      dismissible: true,
      active: true,
    });
    setShowEditorDialog(true);
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      priority: announcement.priority,
      startDate: new Date(announcement.startDate),
      endDate: announcement.endDate ? new Date(announcement.endDate) : null,
      targetAudience: [...announcement.targetAudience],
      dismissible: announcement.dismissible,
      active: announcement.active,
    });
    setShowEditorDialog(true);
  };

  const handlePreview = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowPreviewDialog(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.message) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
      });
      return;
    }

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (selectedAnnouncement) {
      setAnnouncements(prev => prev.map(a =>
        a.id === selectedAnnouncement.id
          ? {
            ...a,
            ...formData,
            startDate: formData.startDate.toISOString(),
            endDate: formData.endDate?.toISOString() || null,
          }
          : a
      ));
      toast({
        title: 'Announcement Updated',
        description: 'Your changes have been saved',
      });
    } else {
      const newAnnouncement = {
        id: `ann_${Date.now()}`,
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate?.toISOString() || null,
        createdBy: 'Current User',
        createdAt: new Date().toISOString(),
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      toast({
        title: 'Announcement Created',
        description: 'Your announcement has been published',
      });
    }

    setSaving(false);
    setShowEditorDialog(false);
  };

  const handleToggleActive = (id) => {
    setAnnouncements(prev => prev.map(a =>
      a.id === id ? { ...a, active: !a.active } : a
    ));
  };

  const handleDelete = () => {
    if (!selectedAnnouncement) return;

    setAnnouncements(prev => prev.filter(a => a.id !== selectedAnnouncement.id));
    setShowDeleteDialog(false);
    setSelectedAnnouncement(null);

    toast({
      title: 'Announcement Deleted',
      description: 'The announcement has been removed',
    });
  };

  const toggleAudience = (audience) => {
    setFormData(prev => {
      if (audience === 'all') {
        return { ...prev, targetAudience: ['all'] };
      }

      let newAudience = prev.targetAudience.filter(a => a !== 'all');
      if (newAudience.includes(audience)) {
        newAudience = newAudience.filter(a => a !== audience);
      } else {
        newAudience = [...newAudience, audience];
      }

      return { ...prev, targetAudience: newAudience.length > 0 ? newAudience : ['all'] };
    });
  };

  // Stats
  const activeCount = announcements.filter(a => isActive(a)).length;
  const scheduledCount = announcements.filter(a => a.active && new Date(a.startDate) > new Date()).length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Announcement Banners | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Announcement Banners</h1>
          <p className="text-gray-600 mt-2">Create system-wide announcements and maintenance notices</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
              <Megaphone className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Currently Active</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{scheduledCount}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {announcements.filter(a => a.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Announcements Preview */}
      {activeCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Announcements Preview</CardTitle>
            <CardDescription>How announcements appear to users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.filter(a => isActive(a)).map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 border rounded-lg ${getBannerStyle(announcement.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getTypeIcon(announcement.type)}
                  <div className="flex-1">
                    <div className="font-medium">{announcement.title}</div>
                    <div className="text-sm mt-1">{announcement.message}</div>
                  </div>
                  {announcement.dismissible && (
                    <button className="text-gray-500 hover:text-gray-700">&times;</button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Announcements Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>Manage your announcement banners</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Active</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Announcement</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No announcements found
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>
                      <Switch
                        checked={announcement.active}
                        onCheckedChange={() => handleToggleActive(announcement.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeBadge(announcement.type)}>
                        {getTypeIcon(announcement.type)}
                        <span className="ml-1">{announcement.type}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="font-medium">{announcement.title}</div>
                        <div className="text-sm text-gray-500 truncate">{announcement.message}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(announcement.startDate)}</div>
                        {announcement.endDate && (
                          <div className="text-gray-500">to {formatDate(announcement.endDate)}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {announcement.targetAudience.map(audience => (
                          <Badge key={audience} variant="outline" className="text-xs">
                            {audience === 'all' ? 'All Users' : audience}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isActive(announcement) ? (
                        <Badge className="bg-green-100 text-green-800">Live</Badge>
                      ) : announcement.active && new Date(announcement.startDate) > new Date() ? (
                        <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(announcement)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(announcement)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAnnouncement(announcement);
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

      {/* Editor Dialog */}
      <Dialog open={showEditorDialog} onOpenChange={setShowEditorDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </DialogTitle>
            <DialogDescription>
              Create a banner that will be displayed to users
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Scheduled Maintenance"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Enter the announcement message..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error / Alert</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formData.startDate ? format(formData.startDate, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formData.endDate ? format(formData.endDate, 'MMM d, yyyy') : 'No end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <div className="grid grid-cols-3 gap-2">
                {audienceOptions.map(option => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={formData.targetAudience.includes(option.id)}
                      onCheckedChange={() => toggleAudience(option.id)}
                    />
                    <Label htmlFor={option.id} className="text-sm font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label>Allow Dismissal</Label>
                <p className="text-sm text-gray-500">Users can close this announcement</p>
              </div>
              <Switch
                checked={formData.dismissible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dismissible: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Announcement Preview</DialogTitle>
            <DialogDescription>How this announcement appears to users</DialogDescription>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className={`p-4 border rounded-lg ${getBannerStyle(selectedAnnouncement.type)}`}>
              <div className="flex items-start gap-3">
                {getTypeIcon(selectedAnnouncement.type)}
                <div className="flex-1">
                  <div className="font-medium">{selectedAnnouncement.title}</div>
                  <div className="text-sm mt-1">{selectedAnnouncement.message}</div>
                </div>
                {selectedAnnouncement.dismissible && (
                  <button className="text-gray-500 hover:text-gray-700">&times;</button>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
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
              Delete Announcement
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement?
            </DialogDescription>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="py-4 space-y-2 text-sm">
              <div><strong>Title:</strong> {selectedAnnouncement.title}</div>
              <div><strong>Type:</strong> {selectedAnnouncement.type}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementBannerPage;
