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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield, Search, Plus, Trash2, Edit2, Globe, Ban,
  CheckCircle, AlertTriangle, RefreshCw, Clock, MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock IP rules
const mockWhitelist = [
  { id: 'ip_1', address: '192.168.1.0/24', description: 'Office Network', createdBy: 'John Smith', createdAt: '2024-01-10T10:00:00Z', lastUsed: '2024-01-15T14:30:00Z', hitCount: 1250 },
  { id: 'ip_2', address: '10.0.0.100', description: 'VPN Server', createdBy: 'Sarah Johnson', createdAt: '2024-01-08T15:30:00Z', lastUsed: '2024-01-15T12:00:00Z', hitCount: 890 },
  { id: 'ip_3', address: '172.16.0.0/16', description: 'Development Environment', createdBy: 'Mike Davis', createdAt: '2024-01-05T09:00:00Z', lastUsed: '2024-01-14T16:45:00Z', hitCount: 2100 },
];

const mockBlacklist = [
  { id: 'block_1', address: '45.33.32.0/24', description: 'Known malicious range', createdBy: 'System', createdAt: '2024-01-12T10:00:00Z', reason: 'Multiple failed login attempts', blockCount: 156 },
  { id: 'block_2', address: '198.51.100.77', description: 'Suspicious activity', createdBy: 'John Smith', createdAt: '2024-01-14T08:30:00Z', reason: 'Brute force attack detected', blockCount: 42 },
  { id: 'block_3', address: '203.0.113.0/24', description: 'Spam network', createdBy: 'System', createdAt: '2024-01-13T14:00:00Z', reason: 'Automated bot traffic', blockCount: 89 },
];

const IPWhitelistPage = () => {
  const { toast } = useToast();
  const [whitelist, setWhitelist] = useState(mockWhitelist);
  const [blacklist, setBlacklist] = useState(mockBlacklist);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [activeTab, setActiveTab] = useState('whitelist');

  // Global settings
  const [settings, setSettings] = useState({
    enforceWhitelist: false,
    autoBlockEnabled: true,
    autoBlockThreshold: 5,
    autoBlockDuration: 24,
  });

  // New rule form
  const [newRule, setNewRule] = useState({
    address: '',
    description: '',
    reason: '',
  });

  const validateIP = (ip) => {
    // Simple validation for IP or CIDR
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    return ipRegex.test(ip);
  };

  const filteredWhitelist = whitelist.filter(rule =>
    !searchQuery ||
    rule.address.includes(searchQuery) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBlacklist = blacklist.filter(rule =>
    !searchQuery ||
    rule.address.includes(searchQuery) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddRule = () => {
    if (!newRule.address) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please enter an IP address or CIDR range',
      });
      return;
    }

    if (!validateIP(newRule.address)) {
      toast({
        variant: 'destructive',
        title: 'Invalid IP Format',
        description: 'Please enter a valid IP address (e.g., 192.168.1.1) or CIDR range (e.g., 192.168.1.0/24)',
      });
      return;
    }

    const rule = {
      id: `${activeTab === 'whitelist' ? 'ip' : 'block'}_${Date.now()}`,
      address: newRule.address,
      description: newRule.description || 'No description',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      ...(activeTab === 'whitelist'
        ? { lastUsed: null, hitCount: 0 }
        : { reason: newRule.reason || 'Manual block', blockCount: 0 }
      ),
    };

    if (activeTab === 'whitelist') {
      setWhitelist(prev => [rule, ...prev]);
    } else {
      setBlacklist(prev => [rule, ...prev]);
    }

    setShowAddDialog(false);
    setNewRule({ address: '', description: '', reason: '' });

    toast({
      title: activeTab === 'whitelist' ? 'IP Whitelisted' : 'IP Blocked',
      description: `${newRule.address} has been added to the ${activeTab}`,
    });
  };

  const handleDeleteRule = () => {
    if (!selectedRule) return;

    if (activeTab === 'whitelist') {
      setWhitelist(prev => prev.filter(r => r.id !== selectedRule.id));
    } else {
      setBlacklist(prev => prev.filter(r => r.id !== selectedRule.id));
    }

    setShowDeleteDialog(false);
    setSelectedRule(null);

    toast({
      title: 'Rule Removed',
      description: `${selectedRule.address} has been removed from the ${activeTab}`,
    });
  };

  const handleMoveToBlacklist = (rule) => {
    setWhitelist(prev => prev.filter(r => r.id !== rule.id));
    setBlacklist(prev => [{
      ...rule,
      id: `block_${Date.now()}`,
      reason: 'Moved from whitelist',
      blockCount: 0,
    }, ...prev]);

    toast({
      title: 'Moved to Blacklist',
      description: `${rule.address} has been moved to the blacklist`,
    });
  };

  const handleMoveToWhitelist = (rule) => {
    setBlacklist(prev => prev.filter(r => r.id !== rule.id));
    setWhitelist(prev => [{
      ...rule,
      id: `ip_${Date.now()}`,
      lastUsed: null,
      hitCount: 0,
    }, ...prev]);

    toast({
      title: 'Moved to Whitelist',
      description: `${rule.address} has been moved to the whitelist`,
    });
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>IP Whitelist/Blacklist | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">IP Whitelist/Blacklist</h1>
          <p className="text-gray-600 mt-2">Manage allowed and blocked IP addresses and CIDR ranges</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLoading(true)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Access Control Settings
          </CardTitle>
          <CardDescription>Configure IP-based access control policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Enforce Whitelist</Label>
                <p className="text-sm text-gray-500">Only allow access from whitelisted IPs</p>
              </div>
              <Switch
                checked={settings.enforceWhitelist}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enforceWhitelist: checked }))}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Auto-Block Suspicious IPs</Label>
                <p className="text-sm text-gray-500">Automatically block IPs with failed login attempts</p>
              </div>
              <Switch
                checked={settings.autoBlockEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBlockEnabled: checked }))}
              />
            </div>
          </div>

          {settings.autoBlockEnabled && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Failed Attempts Threshold</Label>
                <Select
                  value={String(settings.autoBlockThreshold)}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, autoBlockThreshold: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                    <SelectItem value="10">10 attempts</SelectItem>
                    <SelectItem value="20">20 attempts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Auto-Block Duration</Label>
                <Select
                  value={String(settings.autoBlockDuration)}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, autoBlockDuration: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="168">7 days</SelectItem>
                    <SelectItem value="0">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning if whitelist enforced */}
      {settings.enforceWhitelist && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Whitelist Enforcement Active</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Only IPs on the whitelist can access the system. Make sure your current IP is whitelisted
            before enabling this feature.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Whitelisted IPs</p>
                <p className="text-2xl font-bold text-green-600">{whitelist.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Blocked IPs</p>
                <p className="text-2xl font-bold text-red-600">{blacklist.length}</p>
              </div>
              <Ban className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Allowed</p>
                <p className="text-2xl font-bold">{whitelist.reduce((sum, r) => sum + r.hitCount, 0).toLocaleString()}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Blocked</p>
                <p className="text-2xl font-bold">{blacklist.reduce((sum, r) => sum + r.blockCount, 0).toLocaleString()}</p>
              </div>
              <Shield className="w-8 h-8 text-gray-400" />
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
              placeholder="Search by IP address or description..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="whitelist">
            <CheckCircle className="w-4 h-4 mr-2" />
            Whitelist ({whitelist.length})
          </TabsTrigger>
          <TabsTrigger value="blacklist">
            <Ban className="w-4 h-4 mr-2" />
            Blacklist ({blacklist.length})
          </TabsTrigger>
        </TabsList>

        {/* Whitelist Tab */}
        <TabsContent value="whitelist">
          <Card>
            <CardHeader>
              <CardTitle>Allowed IP Addresses</CardTitle>
              <CardDescription>IPs that are always allowed to access the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address / CIDR</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Hit Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWhitelist.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No whitelisted IPs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWhitelist.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-mono">{rule.address}</TableCell>
                        <TableCell>{rule.description}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{rule.createdBy}</div>
                            <div className="text-gray-500">{formatDateTime(rule.createdAt)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {rule.lastUsed ? formatDateTime(rule.lastUsed) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.hitCount.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveToBlacklist(rule)}
                              title="Move to Blacklist"
                            >
                              <Ban className="w-4 h-4" />
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
        </TabsContent>

        {/* Blacklist Tab */}
        <TabsContent value="blacklist">
          <Card>
            <CardHeader>
              <CardTitle>Blocked IP Addresses</CardTitle>
              <CardDescription>IPs that are denied access to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address / CIDR</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Blocked By</TableHead>
                    <TableHead>Block Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlacklist.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No blocked IPs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBlacklist.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-mono">{rule.address}</TableCell>
                        <TableCell>{rule.description}</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">{rule.reason}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{rule.createdBy}</div>
                            <div className="text-gray-500">{formatDateTime(rule.createdAt)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-red-600">
                            {rule.blockCount.toLocaleString()} blocked
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveToWhitelist(rule)}
                              title="Move to Whitelist"
                            >
                              <CheckCircle className="w-4 h-4" />
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
        </TabsContent>
      </Tabs>

      {/* Add Rule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'whitelist' ? 'Add to Whitelist' : 'Add to Blacklist'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'whitelist'
                ? 'Allow access from this IP address or range'
                : 'Block access from this IP address or range'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="address">IP Address or CIDR Range *</Label>
              <Input
                id="address"
                placeholder="e.g., 192.168.1.1 or 192.168.1.0/24"
                value={newRule.address}
                onChange={(e) => setNewRule(prev => ({ ...prev, address: e.target.value }))}
              />
              <p className="text-xs text-gray-500">
                Enter a single IP (192.168.1.1) or CIDR range (192.168.1.0/24)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Office Network"
                value={newRule.description}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            {activeTab === 'blacklist' && (
              <div className="grid gap-2">
                <Label htmlFor="reason">Block Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Multiple failed login attempts"
                  value={newRule.reason}
                  onChange={(e) => setNewRule(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRule}
              className={activeTab === 'whitelist' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {activeTab === 'whitelist' ? 'Add to Whitelist' : 'Add to Blacklist'}
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
              Remove Rule
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this IP rule?
            </DialogDescription>
          </DialogHeader>
          {selectedRule && (
            <div className="py-4 space-y-2 text-sm">
              <div><strong>IP Address:</strong> {selectedRule.address}</div>
              <div><strong>Description:</strong> {selectedRule.description}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRule}>
              Remove Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IPWhitelistPage;
