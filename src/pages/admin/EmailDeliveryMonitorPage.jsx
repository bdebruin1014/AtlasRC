import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Mail, Search, RefreshCw, CheckCircle, XCircle, Clock, Send,
  AlertTriangle, Eye, RotateCcw, TrendingUp, MousePointer, ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock email delivery data
const mockEmails = [
  {
    id: 'email_001',
    to: 'john@example.com',
    subject: 'Welcome to Atlas RC',
    template: 'welcome',
    status: 'delivered',
    sentAt: '2024-01-15T14:30:00Z',
    deliveredAt: '2024-01-15T14:30:05Z',
    openedAt: '2024-01-15T15:45:00Z',
    clickedAt: '2024-01-15T15:46:30Z',
    opens: 2,
    clicks: 1,
  },
  {
    id: 'email_002',
    to: 'sarah@example.com',
    subject: 'Invoice #INV-2024-001',
    template: 'invoice',
    status: 'delivered',
    sentAt: '2024-01-15T14:00:00Z',
    deliveredAt: '2024-01-15T14:00:03Z',
    openedAt: '2024-01-15T14:15:00Z',
    clickedAt: null,
    opens: 1,
    clicks: 0,
  },
  {
    id: 'email_003',
    to: 'mike@example.com',
    subject: 'Password Reset Request',
    template: 'password_reset',
    status: 'delivered',
    sentAt: '2024-01-15T13:45:00Z',
    deliveredAt: '2024-01-15T13:45:02Z',
    openedAt: '2024-01-15T13:46:00Z',
    clickedAt: '2024-01-15T13:46:15Z',
    opens: 1,
    clicks: 1,
  },
  {
    id: 'email_004',
    to: 'invalid@nonexistent.domain',
    subject: 'Project Update',
    template: 'notification',
    status: 'bounced',
    sentAt: '2024-01-15T12:30:00Z',
    deliveredAt: null,
    openedAt: null,
    clickedAt: null,
    opens: 0,
    clicks: 0,
    error: 'Domain not found',
  },
  {
    id: 'email_005',
    to: 'emily@example.com',
    subject: 'Weekly Report',
    template: 'report',
    status: 'pending',
    sentAt: '2024-01-15T14:55:00Z',
    deliveredAt: null,
    openedAt: null,
    clickedAt: null,
    opens: 0,
    clicks: 0,
  },
  {
    id: 'email_006',
    to: 'robert@example.com',
    subject: 'Document Shared with You',
    template: 'share',
    status: 'failed',
    sentAt: '2024-01-15T11:00:00Z',
    deliveredAt: null,
    openedAt: null,
    clickedAt: null,
    opens: 0,
    clicks: 0,
    error: 'SMTP connection timeout',
    retries: 3,
  },
  {
    id: 'email_007',
    to: 'alex@example.com',
    subject: 'Meeting Reminder',
    template: 'reminder',
    status: 'delivered',
    sentAt: '2024-01-15T10:00:00Z',
    deliveredAt: '2024-01-15T10:00:04Z',
    openedAt: null,
    clickedAt: null,
    opens: 0,
    clicks: 0,
  },
];

const EmailDeliveryMonitorPage = () => {
  const { toast } = useToast();
  const [emails, setEmails] = useState(mockEmails);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = !searchQuery ||
      email.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    const matchesTemplate = templateFilter === 'all' || email.template === templateFilter;

    return matchesSearch && matchesStatus && matchesTemplate;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'bounced':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'bounced':
        return 'bg-orange-100 text-orange-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    toast({
      title: 'Refreshed',
      description: 'Email delivery data has been updated',
    });
  };

  const handleViewDetails = (email) => {
    setSelectedEmail(email);
    setShowDetailsDialog(true);
  };

  const handleRetry = (emailId) => {
    setEmails(prev => prev.map(e =>
      e.id === emailId ? { ...e, status: 'pending', retries: (e.retries || 0) + 1 } : e
    ));
    toast({
      title: 'Retry Scheduled',
      description: 'Email will be retried shortly',
    });
  };

  // Calculate stats
  const totalSent = emails.length;
  const delivered = emails.filter(e => e.status === 'delivered').length;
  const bounced = emails.filter(e => e.status === 'bounced').length;
  const failed = emails.filter(e => e.status === 'failed').length;
  const pending = emails.filter(e => e.status === 'pending').length;
  const totalOpens = emails.reduce((sum, e) => sum + e.opens, 0);
  const totalClicks = emails.reduce((sum, e) => sum + e.clicks, 0);
  const deliveryRate = totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(1) : 0;
  const openRate = delivered > 0 ? ((emails.filter(e => e.opens > 0).length / delivered) * 100).toFixed(1) : 0;

  const templates = [...new Set(emails.map(e => e.template))];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Email Delivery Monitor | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Delivery Monitor</h1>
          <p className="text-gray-600 mt-2">Track email delivery, opens, and engagement</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sent</p>
                <p className="text-2xl font-bold">{totalSent}</p>
              </div>
              <Send className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{delivered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bounced</p>
                <p className="text-2xl font-bold text-orange-600">{bounced}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Rate</p>
                <p className="text-2xl font-bold text-blue-600">{openRate}%</p>
              </div>
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivery Rate</p>
                <p className="text-2xl font-bold text-purple-600">{deliveryRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Rate Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Overview</CardTitle>
          <CardDescription>Email delivery performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Delivered</span>
                <span>{delivered} ({deliveryRate}%)</span>
              </div>
              <Progress value={parseFloat(deliveryRate)} className="bg-green-500" />
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-bold text-green-600">{delivered}</div>
                <div className="text-gray-500">Delivered</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="font-bold text-yellow-600">{pending}</div>
                <div className="text-gray-500">Pending</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="font-bold text-orange-600">{bounced}</div>
                <div className="text-gray-500">Bounced</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="font-bold text-red-600">{failed}</div>
                <div className="text-gray-500">Failed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by recipient or subject..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template} value={template}>
                    {template.charAt(0).toUpperCase() + template.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Email Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Delivery Log</CardTitle>
          <CardDescription>
            {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No emails found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell>
                      <Badge className={getStatusBadge(email.status)}>
                        {getStatusIcon(email.status)}
                        <span className="ml-1">{email.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{email.to}</TableCell>
                    <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {email.template.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDateTime(email.sentAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1" title="Opens">
                          <Eye className="w-3 h-3 text-gray-400" />
                          <span>{email.opens}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Clicks">
                          <MousePointer className="w-3 h-3 text-gray-400" />
                          <span>{email.clicks}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(email)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {(email.status === 'failed' || email.status === 'bounced') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(email.id)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Email Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Details
            </DialogTitle>
            <DialogDescription>{selectedEmail?.subject}</DialogDescription>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">To</span>
                  <div className="font-medium font-mono">{selectedEmail.to}</div>
                </div>
                <div>
                  <span className="text-gray-500">Template</span>
                  <div className="font-medium">{selectedEmail.template}</div>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <div>
                    <Badge className={getStatusBadge(selectedEmail.status)}>
                      {selectedEmail.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Sent At</span>
                  <div className="font-medium">{formatDateTime(selectedEmail.sentAt)}</div>
                </div>
              </div>

              {selectedEmail.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-800">Error</div>
                  <div className="text-sm text-red-600">{selectedEmail.error}</div>
                  {selectedEmail.retries && (
                    <div className="text-xs text-red-500 mt-1">Retried {selectedEmail.retries} times</div>
                  )}
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Delivery Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Send className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Sent</div>
                      <div className="text-sm text-gray-500">{formatDateTime(selectedEmail.sentAt)}</div>
                    </div>
                  </div>

                  {selectedEmail.deliveredAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Delivered</div>
                        <div className="text-sm text-gray-500">{formatDateTime(selectedEmail.deliveredAt)}</div>
                      </div>
                    </div>
                  )}

                  {selectedEmail.openedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Eye className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">Opened ({selectedEmail.opens}x)</div>
                        <div className="text-sm text-gray-500">First: {formatDateTime(selectedEmail.openedAt)}</div>
                      </div>
                    </div>
                  )}

                  {selectedEmail.clickedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <MousePointer className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">Clicked ({selectedEmail.clicks}x)</div>
                        <div className="text-sm text-gray-500">First: {formatDateTime(selectedEmail.clickedAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            {selectedEmail && (selectedEmail.status === 'failed' || selectedEmail.status === 'bounced') && (
              <Button onClick={() => {
                handleRetry(selectedEmail.id);
                setShowDetailsDialog(false);
              }}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailDeliveryMonitorPage;
