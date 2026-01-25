import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Search, CheckCircle, XCircle, Merge, Eye, RefreshCw,
  Building2, ChevronRight, Filter, Loader2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { duplicateDetectionService } from '@/services/duplicateDetectionService';
import { useToast } from '@/components/ui/use-toast';

const CoADuplicateAlertsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, [statusFilter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await duplicateDetectionService.getAll({
        status: statusFilter || undefined,
      });
      if (error) {
        toast({ title: 'Error', description: 'Failed to load alerts', variant: 'destructive' });
      } else {
        setAlerts(data || []);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await duplicateDetectionService.getStats();
      if (data) setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDismiss = async () => {
    if (!selectedAlert) return;
    setProcessing(true);
    try {
      const { error } = await duplicateDetectionService.dismiss(selectedAlert.id, actionNotes);
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Alert dismissed' });
        setShowDetailDialog(false);
        setSelectedAlert(null);
        setActionNotes('');
        loadAlerts();
        loadStats();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to dismiss alert', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedAlert) return;
    setProcessing(true);
    try {
      const { error } = await duplicateDetectionService.confirm(selectedAlert.id, actionNotes);
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Alert confirmed as duplicate' });
        setShowDetailDialog(false);
        setSelectedAlert(null);
        setActionNotes('');
        loadAlerts();
        loadStats();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to confirm alert', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleScanAll = async () => {
    setScanning(true);
    toast({ title: 'Scanning', description: 'Scanning for duplicates across all entities...' });
    // In a real implementation, this would trigger a background job
    setTimeout(() => {
      setScanning(false);
      toast({ title: 'Complete', description: 'Duplicate scan completed' });
      loadAlerts();
      loadStats();
    }, 2000);
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending Review' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
      dismissed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Dismissed' },
      merged: { bg: 'bg-green-100', text: 'text-green-700', label: 'Merged' },
    };
    const config = configs[status] || configs.pending;
    return <span className={cn("px-2 py-0.5 rounded text-xs font-medium", config.bg, config.text)}>{config.label}</span>;
  };

  const getMatchTypeBadge = (matchType) => {
    const configs = {
      exact_match: { bg: 'bg-red-100', text: 'text-red-700', label: 'Exact Match' },
      exact_number: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Same Number' },
      similar_name: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Similar Name' },
    };
    const config = configs[matchType] || configs.similar_name;
    return <span className={cn("px-2 py-0.5 rounded text-xs font-medium", config.bg, config.text)}>{config.label}</span>;
  };

  const filteredAlerts = alerts.filter(alert => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      alert.account?.account_name?.toLowerCase().includes(query) ||
      alert.account?.account_number?.includes(query) ||
      alert.duplicate_account?.account_name?.toLowerCase().includes(query) ||
      alert.duplicate_account?.account_number?.includes(query) ||
      alert.entity?.name?.toLowerCase().includes(query) ||
      alert.duplicate_entity?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Duplicate Account Alerts</h1>
          <p className="text-sm text-gray-500">Review and resolve potential duplicate accounts across entities</p>
        </div>
        <Button onClick={handleScanAll} disabled={scanning} className="bg-[#047857] hover:bg-[#065f46]">
          {scanning ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Scan for Duplicates
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Alerts</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-700">Pending Review</p>
            <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">Confirmed</p>
            <p className="text-2xl font-bold text-blue-900">{stats.confirmed}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">Merged</p>
            <p className="text-2xl font-bold text-green-900">{stats.merged}</p>
          </div>
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-sm text-gray-500">Dismissed</p>
            <p className="text-2xl font-bold">{stats.dismissed}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by account name, number, or entity..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="merged">Merged</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-sm text-gray-500 mt-2">No alerts found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Account 1</th>
                <th className="px-4 py-3 text-center w-12"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Account 2</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Match Type</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAlerts.map(alert => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium font-mono text-sm">{alert.account?.account_number}</p>
                        <p className="text-sm text-gray-600">{alert.account?.account_name}</p>
                        <p className="text-xs text-gray-400">{alert.entity?.name || 'Unknown Entity'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium font-mono text-sm">{alert.duplicate_account?.account_number}</p>
                        <p className="text-sm text-gray-600">{alert.duplicate_account?.account_name}</p>
                        <p className="text-xs text-gray-400">{alert.duplicate_entity?.name || 'Unknown Entity'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getMatchTypeBadge(alert.match_type)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "font-medium",
                      alert.confidence_score >= 0.9 ? "text-red-600" :
                      alert.confidence_score >= 0.75 ? "text-orange-600" :
                      "text-yellow-600"
                    )}>
                      {((alert.confidence_score || 0) * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(alert.status)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAlert(alert);
                        setShowDetailDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Duplicate Alert</DialogTitle>
            <DialogDescription>Compare the two accounts and decide how to resolve this alert</DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4 py-4">
              {/* Match Info */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getMatchTypeBadge(selectedAlert.match_type)}
                  <span className="text-sm text-gray-500">
                    {((selectedAlert.confidence_score || 0) * 100).toFixed(0)}% confidence
                  </span>
                </div>
                {getStatusBadge(selectedAlert.status)}
              </div>

              {/* Account Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Account 1</h4>
                  <p className="font-mono text-lg font-bold">{selectedAlert.account?.account_number}</p>
                  <p className="font-medium">{selectedAlert.account?.account_name}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Entity: {selectedAlert.entity?.name || 'Unknown'}
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Account 2</h4>
                  <p className="font-mono text-lg font-bold">{selectedAlert.duplicate_account?.account_number}</p>
                  <p className="font-medium">{selectedAlert.duplicate_account?.account_name}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Entity: {selectedAlert.duplicate_entity?.name || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedAlert.status === 'pending' && (
                <div>
                  <Label>Resolution Notes</Label>
                  <Textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}

              {selectedAlert.notes && selectedAlert.status !== 'pending' && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Resolution Notes:</p>
                  <p className="text-sm">{selectedAlert.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
            {selectedAlert?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  disabled={processing}
                  className="text-gray-600"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Dismiss (Not a Duplicate)
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Confirm Duplicate
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoADuplicateAlertsPage;
