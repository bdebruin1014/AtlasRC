// src/pages/accounting/EntityFilesPage.jsx
// Entity Files page with SharePoint integration

import React, { useState, useMemo } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Upload, FolderPlus, Search, MoreHorizontal, Folder, File,
  FileText, FileImage, FileSpreadsheet, Download, Trash2,
  ExternalLink, Share2, Edit, ChevronRight, Home, RefreshCw,
  Grid, List, Eye, Link2, AlertCircle
} from 'lucide-react';
import {
  listFolder, getFolderPath, deleteItem, getDownloadUrl,
  createShareLink, formatFileSize, getSharePointStatus
} from '@/services/sharepointService';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import UploadFileModal from '@/components/accounting/UploadFileModal';
import NewFolderModal from '@/components/accounting/NewFolderModal';

// Demo files data
const demoFiles = [
  {
    id: 'F-001',
    name: '2024 Financial Statements',
    type: 'folder',
    size: null,
    lastModifiedDateTime: '2025-01-15T10:30:00Z',
    lastModifiedBy: 'John Smith',
  },
  {
    id: 'F-002',
    name: 'Tax Documents',
    type: 'folder',
    size: null,
    lastModifiedDateTime: '2025-01-10T14:20:00Z',
    lastModifiedBy: 'Jane Doe',
  },
  {
    id: 'F-003',
    name: 'Bank Statements',
    type: 'folder',
    size: null,
    lastModifiedDateTime: '2025-01-20T09:15:00Z',
    lastModifiedBy: 'John Smith',
  },
  {
    id: 'F-004',
    name: 'Q4 2024 Balance Sheet.xlsx',
    type: 'file',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 245000,
    lastModifiedDateTime: '2025-01-18T16:45:00Z',
    lastModifiedBy: 'Jane Doe',
  },
  {
    id: 'F-005',
    name: 'Operating Agreement.pdf',
    type: 'file',
    mimeType: 'application/pdf',
    size: 1250000,
    lastModifiedDateTime: '2024-06-15T11:00:00Z',
    lastModifiedBy: 'John Smith',
  },
  {
    id: 'F-006',
    name: 'Insurance Certificate 2025.pdf',
    type: 'file',
    mimeType: 'application/pdf',
    size: 520000,
    lastModifiedDateTime: '2025-01-05T10:00:00Z',
    lastModifiedBy: 'Jane Doe',
  },
];

export default function EntityFilesPage() {
  const { entityId } = useParams();
  const context = useOutletContext();
  const queryClient = useQueryClient();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [filterType, setFilterType] = useState('all');

  // Check SharePoint connection
  const { data: spStatus } = useQuery({
    queryKey: ['sharepoint-status'],
    queryFn: getSharePointStatus,
  });

  // Get entity's SharePoint mapping
  const { data: entityMapping } = useQuery({
    queryKey: ['entity-sharepoint-mapping', entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entity_sharepoint_mappings')
        .select('*')
        .eq('entity_id', entityId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching entity mapping:', error);
      }
      return data;
    },
  });

  const driveId = entityMapping?.drive_id || spStatus?.driveId;
  const rootFolderId = entityMapping?.folder_id || 'root';

  // Fetch folder contents
  const { data: files = [], isLoading, refetch } = useQuery({
    queryKey: ['entity-files', entityId, currentFolderId],
    queryFn: async () => {
      if (!driveId) return demoFiles;

      try {
        const folderId = currentFolderId === 'root' ? rootFolderId : currentFolderId;
        const { data, error } = await listFolder(driveId, folderId);

        if (error) throw error;
        return data || demoFiles;
      } catch (err) {
        console.error('Error fetching files:', err);
        return demoFiles;
      }
    },
    enabled: !!driveId || true, // Always enabled to show demo data
  });

  // Fetch breadcrumb path
  const { data: breadcrumbs = [] } = useQuery({
    queryKey: ['folder-path', currentFolderId],
    queryFn: async () => {
      if (!driveId || currentFolderId === 'root') {
        return [{ id: 'root', name: 'Files' }];
      }

      try {
        const { data } = await getFolderPath(driveId, currentFolderId);
        return [{ id: 'root', name: 'Files' }, ...(data || [])];
      } catch (err) {
        return [{ id: 'root', name: 'Files' }];
      }
    },
  });

  // Filter files
  const filteredFiles = useMemo(() => {
    let filtered = files;

    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(f =>
        filterType === 'folder' ? f.type === 'folder' : f.type === 'file'
      );
    }

    // Sort: folders first, then by name
    return filtered.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [files, searchTerm, filterType]);

  // Stats
  const stats = useMemo(() => {
    const folders = files.filter(f => f.type === 'folder').length;
    const fileCount = files.filter(f => f.type === 'file').length;
    const totalSize = files
      .filter(f => f.type === 'file')
      .reduce((sum, f) => sum + (f.size || 0), 0);

    return { folders, files: fileCount, totalSize };
  }, [files]);

  const deleteMutation = useMutation({
    mutationFn: async (itemId) => {
      if (!driveId) throw new Error('SharePoint not connected');
      const { error } = await deleteItem(driveId, itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entity-files', entityId]);
    },
  });

  const handleNavigate = (folderId) => {
    setCurrentFolderId(folderId);
    setSearchTerm('');
  };

  const handleDownload = async (item) => {
    if (!driveId) return;
    const { url } = await getDownloadUrl(driveId, item.id);
    if (url) window.open(url, '_blank');
  };

  const handleOpenInSharePoint = (item) => {
    if (item.webUrl) window.open(item.webUrl, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFileIcon = (item) => {
    if (item.type === 'folder') return Folder;
    const mime = item.mimeType || '';
    if (mime.startsWith('image/')) return FileImage;
    if (mime.includes('spreadsheet') || mime.includes('excel')) return FileSpreadsheet;
    if (mime.includes('pdf') || mime.includes('word') || mime.includes('document')) return FileText;
    return File;
  };

  const getFileColor = (item) => {
    if (item.type === 'folder') return 'text-amber-500';
    const mime = item.mimeType || '';
    if (mime.startsWith('image/')) return 'text-purple-500';
    if (mime.includes('spreadsheet') || mime.includes('excel')) return 'text-green-600';
    if (mime.includes('pdf')) return 'text-red-500';
    if (mime.includes('word') || mime.includes('document')) return 'text-blue-600';
    return 'text-gray-500';
  };

  const currentPath = breadcrumbs.map(b => b.name).join('/');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Files</h1>
          <p className="text-muted-foreground">Entity documents and files</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFolderModal(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      {/* SharePoint Connection Status */}
      {!spStatus?.connected && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">SharePoint Not Connected</p>
            <p className="text-sm text-amber-700">
              Connect SharePoint in Settings to enable file storage. Showing demo data.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Folders</p>
              <p className="text-2xl font-bold text-amber-600">{stats.folders}</p>
            </div>
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Folder className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Files</p>
              <p className="text-2xl font-bold text-blue-600">{stats.files}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <File className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Size</p>
              <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
            </div>
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Storage</p>
              <p className="text-lg font-bold text-green-600">SharePoint</p>
              <p className="text-xs text-muted-foreground">
                {spStatus?.connected ? 'Connected' : 'Demo Mode'}
              </p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Link2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 mb-4 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id || index}>
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <button
              onClick={() => handleNavigate(crumb.id || 'root')}
              className={cn(
                "px-2 py-1 rounded hover:bg-muted transition-colors",
                index === breadcrumbs.length - 1
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {index === 0 ? <Home className="h-4 w-4" /> : crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files and folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="folder">Folders</SelectItem>
            <SelectItem value="file">Files</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* File List */}
      {viewMode === 'list' ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead>Modified By</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading files...
                  </TableCell>
                </TableRow>
              ) : filteredFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Folder className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No files match your search' : 'This folder is empty'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUploadModal(true)}
                      >
                        Upload Files
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiles.map((item) => {
                  const Icon = getFileIcon(item);
                  const iconColor = getFileColor(item);

                  return (
                    <TableRow
                      key={item.id}
                      className={cn(
                        "cursor-pointer",
                        item.type === 'folder' && "hover:bg-muted/50"
                      )}
                      onClick={() => item.type === 'folder' && handleNavigate(item.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Icon className={cn("h-5 w-5", iconColor)} />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.lastModifiedDateTime)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.lastModifiedBy || '-'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.type === 'file' ? formatFileSize(item.size) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.type === 'file' && (
                              <>
                                <DropdownMenuItem onClick={() => handleDownload(item)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleOpenInSharePoint(item)}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in SharePoint
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteMutation.mutate(item.id)}
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
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((item) => {
            const Icon = getFileIcon(item);
            const iconColor = getFileColor(item);

            return (
              <div
                key={item.id}
                className={cn(
                  "border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                  "flex flex-col items-center text-center"
                )}
                onClick={() => item.type === 'folder' && handleNavigate(item.id)}
              >
                <Icon className={cn("h-12 w-12 mb-2", iconColor)} />
                <p className="font-medium text-sm truncate w-full">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type === 'file' ? formatFileSize(item.size) : 'Folder'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <UploadFileModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        entityId={entityId}
        currentFolderId={currentFolderId}
        driveId={driveId}
      />
      <NewFolderModal
        open={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        entityId={entityId}
        currentFolderId={currentFolderId}
        driveId={driveId}
        currentPath={currentPath}
      />
    </div>
  );
}
