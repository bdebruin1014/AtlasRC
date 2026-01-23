import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Calendar,
  Download,
  Filter,
  User,
  FileText,
  DollarSign,
  Building2,
  FolderKanban,
  Users,
  Settings,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
  ChevronDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { activityService, type ActivityLogEntry as ServiceActivityLogEntry } from '@/services/activityService';

// Local interface that maps from service data
interface LocalActivityLogEntry {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  action: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'export' | 'import';
  resourceType: 'opportunity' | 'project' | 'transaction' | 'entity' | 'contact' | 'document' | 'user' | 'settings';
  resourceId: string;
  resourceName: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  login: LogIn,
  logout: LogOut,
  export: Download,
  import: FileText
};

const ACTION_COLORS: Record<string, string> = {
  create: 'text-green-600 bg-green-50',
  update: 'text-blue-600 bg-blue-50',
  delete: 'text-red-600 bg-red-50',
  view: 'text-gray-600 bg-gray-50',
  login: 'text-purple-600 bg-purple-50',
  logout: 'text-purple-600 bg-purple-50',
  export: 'text-orange-600 bg-orange-50',
  import: 'text-orange-600 bg-orange-50'
};

const RESOURCE_ICONS: Record<string, React.ElementType> = {
  opportunity: FolderKanban,
  project: Building2,
  transaction: DollarSign,
  entity: Building2,
  contact: Users,
  document: FileText,
  user: User,
  settings: Settings
};

const mockActivityLogs: ActivityLogEntry[] = [
  {
    id: '1',
    timestamp: '2024-03-15T14:30:00Z',
    user: { id: '1', name: 'John Anderson', email: 'john@atlas.com' },
    action: 'create',
    resourceType: 'opportunity',
    resourceId: 'opp-123',
    resourceName: '456 Oak Street Property',
    details: 'Created new opportunity with asking price of $2,500,000',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 122 on macOS'
  },
  {
    id: '2',
    timestamp: '2024-03-15T14:15:00Z',
    user: { id: '2', name: 'Sarah Mitchell', email: 'sarah@atlas.com' },
    action: 'update',
    resourceType: 'project',
    resourceId: 'proj-456',
    resourceName: 'Sunrise Apartments',
    details: 'Updated project status from "Due Diligence" to "Under Contract"',
    ipAddress: '192.168.1.101',
    userAgent: 'Firefox 123 on Windows'
  },
  {
    id: '3',
    timestamp: '2024-03-15T13:45:00Z',
    user: { id: '1', name: 'John Anderson', email: 'john@atlas.com' },
    action: 'create',
    resourceType: 'transaction',
    resourceId: 'txn-789',
    resourceName: 'TXN-2024-0315',
    details: 'Created transaction for $50,000 - Earnest money deposit',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 122 on macOS'
  },
  {
    id: '4',
    timestamp: '2024-03-15T13:30:00Z',
    user: { id: '3', name: 'Mike Chen', email: 'mike@atlas.com' },
    action: 'view',
    resourceType: 'entity',
    resourceId: 'ent-101',
    resourceName: 'ABC Holdings LLC',
    details: 'Viewed entity details and financial reports',
    ipAddress: '192.168.1.102',
    userAgent: 'Safari 17 on macOS'
  },
  {
    id: '5',
    timestamp: '2024-03-15T12:00:00Z',
    user: { id: '2', name: 'Sarah Mitchell', email: 'sarah@atlas.com' },
    action: 'export',
    resourceType: 'transaction',
    resourceId: 'report-001',
    resourceName: 'Q1 2024 Transactions',
    details: 'Exported 156 transactions to Excel format',
    ipAddress: '192.168.1.101',
    userAgent: 'Firefox 123 on Windows'
  },
  {
    id: '6',
    timestamp: '2024-03-15T11:30:00Z',
    user: { id: '4', name: 'Emily Roberts', email: 'emily@atlas.com' },
    action: 'login',
    resourceType: 'user',
    resourceId: 'user-4',
    resourceName: 'Emily Roberts',
    details: 'Successfully logged in',
    ipAddress: '192.168.1.103',
    userAgent: 'Chrome 122 on Windows'
  },
  {
    id: '7',
    timestamp: '2024-03-15T11:00:00Z',
    user: { id: '1', name: 'John Anderson', email: 'john@atlas.com' },
    action: 'update',
    resourceType: 'contact',
    resourceId: 'con-201',
    resourceName: 'Robert Smith',
    details: 'Updated contact phone number and email address',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 122 on macOS'
  },
  {
    id: '8',
    timestamp: '2024-03-15T10:30:00Z',
    user: { id: '2', name: 'Sarah Mitchell', email: 'sarah@atlas.com' },
    action: 'delete',
    resourceType: 'document',
    resourceId: 'doc-301',
    resourceName: 'Draft_Proposal_v1.pdf',
    details: 'Deleted outdated document from Sunrise Apartments project',
    ipAddress: '192.168.1.101',
    userAgent: 'Firefox 123 on Windows'
  },
  {
    id: '9',
    timestamp: '2024-03-15T10:00:00Z',
    user: { id: '1', name: 'John Anderson', email: 'john@atlas.com' },
    action: 'update',
    resourceType: 'settings',
    resourceId: 'settings',
    resourceName: 'Company Settings',
    details: 'Updated notification preferences',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 122 on macOS'
  },
  {
    id: '10',
    timestamp: '2024-03-15T09:30:00Z',
    user: { id: '3', name: 'Mike Chen', email: 'mike@atlas.com' },
    action: 'create',
    resourceType: 'contact',
    resourceId: 'con-202',
    resourceName: 'Jennifer Lee',
    details: 'Added new contact - Investor',
    ipAddress: '192.168.1.102',
    userAgent: 'Safari 17 on macOS'
  },
  {
    id: '11',
    timestamp: '2024-03-14T17:00:00Z',
    user: { id: '1', name: 'John Anderson', email: 'john@atlas.com' },
    action: 'logout',
    resourceType: 'user',
    resourceId: 'user-1',
    resourceName: 'John Anderson',
    details: 'Logged out',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 122 on macOS'
  },
  {
    id: '12',
    timestamp: '2024-03-14T16:30:00Z',
    user: { id: '2', name: 'Sarah Mitchell', email: 'sarah@atlas.com' },
    action: 'import',
    resourceType: 'contact',
    resourceId: 'import-001',
    resourceName: 'Contact Import',
    details: 'Imported 25 contacts from CSV file',
    ipAddress: '192.168.1.101',
    userAgent: 'Firefox 123 on Windows'
  }
];

export default function ActivityLog() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<LocalActivityLogEntry[]>([]);
  const [uniqueUsers, setUniqueUsers] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadActivityLogs();
    loadUniqueUsers();
  }, []);

  const loadActivityLogs = async () => {
    setIsLoading(true);
    try {
      const data = await activityService.getAll({
        action: actionFilter !== 'all' ? actionFilter : undefined,
        resource_type: resourceFilter !== 'all' ? resourceFilter : undefined,
        user_id: userFilter !== 'all' ? userFilter : undefined,
        start_date: dateRange.start || undefined,
        end_date: dateRange.end || undefined,
        search: searchQuery || undefined,
      });

      // Map service data to local format
      const mappedLogs: LocalActivityLogEntry[] = data.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        user: {
          id: log.user?.id || log.user_id,
          name: log.user?.full_name || 'Unknown User',
          email: log.user?.email || '',
          avatar: log.user?.avatar_url,
        },
        action: log.action,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        resourceName: log.resource_name,
        details: log.details || '',
        ipAddress: log.ip_address || '',
        userAgent: log.user_agent || '',
      }));

      setLogs(mappedLogs);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      // Fallback to mock data for demo
      setLogs(mockActivityLogs);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUniqueUsers = async () => {
    try {
      const users = await activityService.getUniqueUsers();
      setUniqueUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Use uniqueUsers from state, or fall back to extracting from current logs
  const displayUsers = uniqueUsers.length > 0
    ? uniqueUsers.map(u => ({ id: u.id, name: u.full_name, email: u.email }))
    : Array.from(new Set(logs.map(l => l.user.id)))
        .map(id => logs.find(l => l.user.id === id)!.user);

  const filteredLogs = logs.filter(log => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!log.resourceName.toLowerCase().includes(query) &&
          !log.details.toLowerCase().includes(query) &&
          !log.user.name.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (resourceFilter !== 'all' && log.resourceType !== resourceFilter) return false;
    if (userFilter !== 'all' && log.user.id !== userFilter) return false;
    if (dateRange.start && log.timestamp < dateRange.start) return false;
    if (dateRange.end && log.timestamp > dateRange.end + 'T23:59:59Z') return false;
    return true;
  });

  const stats = {
    total: logs.length,
    creates: logs.filter(l => l.action === 'create').length,
    updates: logs.filter(l => l.action === 'update').length,
    deletes: logs.filter(l => l.action === 'delete').length
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      toast({
        title: 'Export Started',
        description: `Generating ${format.toUpperCase()} file...`,
      });

      const content = await activityService.export({
        action: actionFilter !== 'all' ? actionFilter : undefined,
        resource_type: resourceFilter !== 'all' ? resourceFilter : undefined,
        user_id: userFilter !== 'all' ? userFilter : undefined,
        start_date: dateRange.start || undefined,
        end_date: dateRange.end || undefined,
        search: searchQuery || undefined,
      }, format);

      const blob = new Blob([content], {
        type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-log-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: `Activity logs exported to ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export activity logs',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">Track all actions across your organization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadActivityLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Total Activities
            </CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Plus className="h-4 w-4 text-green-600" />
              Creates
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.creates}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Edit className="h-4 w-4 text-blue-600" />
              Updates
            </CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.updates}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Trash2 className="h-4 w-4 text-red-600" />
              Deletes
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.deletes}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                </SelectContent>
              </Select>

              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="opportunity">Opportunities</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="transaction">Transactions</SelectItem>
                  <SelectItem value="entity">Entities</SelectItem>
                  <SelectItem value="contact">Contacts</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-[160px]">
                  <User className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {displayUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-[140px]"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-[140px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredLogs.map((log) => {
              const ActionIcon = ACTION_ICONS[log.action] || Activity;
              const ResourceIcon = RESOURCE_ICONS[log.resourceType] || FileText;
              const actionColor = ACTION_COLORS[log.action] || 'text-gray-600 bg-gray-50';

              return (
                <div key={log.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={log.user.avatar} />
                      <AvatarFallback>{getInitials(log.user.name)}</AvatarFallback>
                    </Avatar>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{log.user.name}</span>
                        <Badge variant="outline" className={`${actionColor} border-0`}>
                          <ActionIcon className="h-3 w-3 mr-1" />
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="bg-muted">
                          <ResourceIcon className="h-3 w-3 mr-1" />
                          {log.resourceType.charAt(0).toUpperCase() + log.resourceType.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">
                        <span className="font-medium">{log.resourceName}</span>
                        {log.details && (
                          <span className="text-muted-foreground"> - {log.details}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{formatTimestamp(log.timestamp)}</span>
                        <span>IP: {log.ipAddress}</span>
                        <span>{log.userAgent}</span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredLogs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activities found matching your filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Load More */}
      {filteredLogs.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => {/* Load more implementation */}}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
