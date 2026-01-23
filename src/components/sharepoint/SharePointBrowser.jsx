// src/components/sharepoint/SharePointBrowser.jsx
// SharePoint File Browser Component

import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder, File, FileText, Image, Video, Music, FileArchive, FileSpreadsheet,
  ChevronRight, Upload, FolderPlus, Search, RefreshCw, Download, Trash2,
  Link2, MoreHorizontal, ArrowLeft, ExternalLink, X, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  listFolder,
  getFolderPath,
  uploadFileToSharePoint,
  createFolder,
  deleteItem,
  getDownloadUrl,
  createShareLink,
  formatFileSize,
  getFileIcon,
} from '@/services/sharepointService';

const FILE_ICONS = {
  folder: Folder,
  file: File,
  image: Image,
  video: Video,
  audio: Music,
  pdf: FileText,
  word: FileText,
  excel: FileSpreadsheet,
  powerpoint: FileText,
  archive: FileArchive,
};

const SharePointBrowser = ({
  userId,
  driveId,
  initialFolderId = 'root',
  onSelect,
  selectionMode = 'none', // 'none', 'single', 'multiple'
  allowedTypes = null, // null for all, or ['file', 'folder'] or specific mime types
  showUpload = true,
  showCreateFolder = true,
  className,
}) => {
  const [currentFolderId, setCurrentFolderId] = useState(initialFolderId);
  const [items, setItems] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'Root' }]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploading, setUploading] = useState(false);

  // Load folder contents
  const loadFolder = useCallback(async (folderId) => {
    setLoading(true);
    try {
      const [itemsResult, pathResult] = await Promise.all([
        listFolder(userId, driveId, folderId),
        getFolderPath(userId, driveId, folderId),
      ]);

      if (!itemsResult.error) {
        // Filter items if allowedTypes is specified
        let filteredItems = itemsResult.data;
        if (allowedTypes && allowedTypes.length > 0) {
          filteredItems = filteredItems.filter(item => {
            if (allowedTypes.includes('folder') && item.type === 'folder') return true;
            if (allowedTypes.includes('file') && item.type === 'file') return true;
            if (item.mimeType && allowedTypes.includes(item.mimeType)) return true;
            return false;
          });
        }
        setItems(filteredItems);
      }

      if (!pathResult.error) {
        setBreadcrumbs(pathResult.data);
      }
    } catch (error) {
      console.error('Error loading folder:', error);
    }
    setLoading(false);
  }, [userId, driveId, allowedTypes]);

  useEffect(() => {
    if (userId && driveId) {
      loadFolder(currentFolderId);
    }
  }, [userId, driveId, currentFolderId, loadFolder]);

  // Navigate to folder
  const navigateToFolder = (folderId) => {
    setCurrentFolderId(folderId);
    setSelectedItems([]);
  };

  // Handle item click
  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      navigateToFolder(item.id);
    } else if (selectionMode !== 'none') {
      toggleSelection(item);
    }
  };

  // Handle item double-click
  const handleItemDoubleClick = (item) => {
    if (item.type === 'folder') {
      navigateToFolder(item.id);
    } else if (onSelect && selectionMode === 'single') {
      onSelect([item]);
    }
  };

  // Toggle selection
  const toggleSelection = (item) => {
    if (selectionMode === 'single') {
      setSelectedItems([item]);
    } else if (selectionMode === 'multiple') {
      setSelectedItems(prev => {
        const isSelected = prev.some(i => i.id === item.id);
        if (isSelected) {
          return prev.filter(i => i.id !== item.id);
        }
        return [...prev, item];
      });
    }
  };

  // Handle file upload
  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        await uploadFileToSharePoint(userId, driveId, currentFolderId, file, file.name);
      }
      loadFolder(currentFolderId);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    }
    setUploading(false);
    event.target.value = '';
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(userId, driveId, currentFolderId, newFolderName.trim());
      setShowNewFolderModal(false);
      setNewFolderName('');
      loadFolder(currentFolderId);
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Error creating folder');
    }
  };

  // Delete item
  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      await deleteItem(userId, driveId, item.id);
      loadFolder(currentFolderId);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  // Download file
  const handleDownload = async (item) => {
    try {
      const { url, error } = await getDownloadUrl(userId, driveId, item.id);
      if (error) throw error;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error getting download URL:', error);
      alert('Error downloading file');
    }
  };

  // Create share link
  const handleShare = async (item) => {
    try {
      const { data, error } = await createShareLink(userId, driveId, item.id, 'view');
      if (error) throw error;
      await navigator.clipboard.writeText(data.url);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error creating share link:', error);
      alert('Error creating share link');
    }
  };

  // Confirm selection
  const confirmSelection = () => {
    if (onSelect && selectedItems.length > 0) {
      onSelect(selectedItems);
    }
  };

  // Filter items by search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get icon for file type
  const getIcon = (item) => {
    const iconType = getFileIcon(item.mimeType, item.type === 'folder');
    return FILE_ICONS[iconType] || File;
  };

  return (
    <div className={cn("bg-white border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="p-3 border-b bg-gray-50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToFolder('root')}
            disabled={currentFolderId === 'root'}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => loadFolder(currentFolderId)} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>

        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            className="pl-9 h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {showCreateFolder && (
            <Button variant="outline" size="sm" onClick={() => setShowNewFolderModal(true)}>
              <FolderPlus className="w-4 h-4 mr-1" />
              New Folder
            </Button>
          )}
          {showUpload && (
            <label>
              <Button variant="outline" size="sm" asChild disabled={uploading}>
                <span>
                  {uploading ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1" />
                  )}
                  Upload
                </span>
              </Button>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-3 py-2 border-b bg-gray-50 flex items-center gap-1 text-sm overflow-x-auto">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id || index}>
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            <button
              onClick={() => crumb.id && navigateToFolder(crumb.id)}
              className={cn(
                "px-2 py-1 rounded hover:bg-gray-200 truncate",
                index === breadcrumbs.length - 1 ? "font-medium" : "text-gray-600"
              )}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* File List */}
      <div className="min-h-[300px] max-h-[500px] overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Folder className="w-12 h-12 text-gray-300 mb-2" />
            <p>No files found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b sticky top-0">
              <tr>
                {selectionMode !== 'none' && <th className="w-10 px-3 py-2"></th>}
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase w-32">Modified</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase w-24">Size</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map((item) => {
                const Icon = getIcon(item);
                const isSelected = selectedItems.some(i => i.id === item.id);

                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "hover:bg-gray-50 cursor-pointer",
                      isSelected && "bg-blue-50"
                    )}
                    onClick={() => handleItemClick(item)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                  >
                    {selectionMode !== 'none' && (
                      <td className="px-3 py-2">
                        {item.type === 'file' && (
                          <div
                            className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center",
                              isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Icon className={cn(
                          "w-5 h-5 flex-shrink-0",
                          item.type === 'folder' ? "text-yellow-500" : "text-gray-400"
                        )} />
                        <span className="truncate">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {item.lastModifiedDateTime
                        ? new Date(item.lastModifiedDateTime).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {item.type === 'file' ? formatFileSize(item.size) : '-'}
                    </td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {item.webUrl && (
                            <DropdownMenuItem onClick={() => window.open(item.webUrl, '_blank')}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open in SharePoint
                            </DropdownMenuItem>
                          )}
                          {item.type === 'file' && (
                            <>
                              <DropdownMenuItem onClick={() => handleDownload(item)}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(item)}>
                                <Link2 className="w-4 h-4 mr-2" />
                                Copy Share Link
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(item)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Selection Footer */}
      {selectionMode !== 'none' && selectedItems.length > 0 && (
        <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedItems.length} item(s) selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedItems([])}>
              Clear
            </Button>
            <Button size="sm" onClick={confirmSelection}>
              Confirm Selection
            </Button>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">New Folder</h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowNewFolderModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharePointBrowser;
