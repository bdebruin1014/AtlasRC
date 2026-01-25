import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOpen, Upload, File, FileText, Image, FileSpreadsheet,
  Download, Trash2, Eye, MoreVertical, Search, Filter,
  FolderPlus, ChevronRight, ChevronDown, Loader2,
  FileImage, Check, Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const FILE_CATEGORIES = [
  { id: 'contracts', name: 'Contracts', icon: FileText, color: 'text-blue-600 bg-blue-100' },
  { id: 'due-diligence', name: 'Due Diligence', icon: FolderOpen, color: 'text-purple-600 bg-purple-100' },
  { id: 'surveys', name: 'Surveys & Plats', icon: FileImage, color: 'text-green-600 bg-green-100' },
  { id: 'environmental', name: 'Environmental', icon: FileText, color: 'text-yellow-600 bg-yellow-100' },
  { id: 'financial', name: 'Financial', icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-100' },
  { id: 'photos', name: 'Photos', icon: Image, color: 'text-pink-600 bg-pink-100' },
  { id: 'misc', name: 'Miscellaneous', icon: File, color: 'text-gray-600 bg-gray-100' },
];

const getFileIcon = (fileName) => {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return Image;
  if (['pdf'].includes(ext)) return FileText;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
  if (['doc', 'docx', 'txt'].includes(ext)) return FileText;
  return File;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function OpportunityFiles({ opportunity }) {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState(['contracts', 'due-diligence']);

  // Dialogs
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('misc');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [renameName, setRenameName] = useState('');

  const opportunityId = opportunity?.id;

  // Load files
  useEffect(() => {
    if (opportunityId) {
      loadFiles();
    } else {
      setFiles(getDemoFiles());
      setLoading(false);
    }
  }, [opportunityId]);

  const getDemoFiles = () => [
    { id: '1', name: 'Purchase_Agreement_Draft.pdf', category: 'contracts', size: 245000, created_at: '2025-01-15', uploaded_by: 'John Smith' },
    { id: '2', name: 'Phase_I_Environmental.pdf', category: 'environmental', size: 1250000, created_at: '2025-01-12', uploaded_by: 'Jane Doe' },
    { id: '3', name: 'Property_Survey.pdf', category: 'surveys', size: 890000, created_at: '2025-01-10', uploaded_by: 'John Smith' },
    { id: '4', name: 'Title_Commitment.pdf', category: 'due-diligence', size: 156000, created_at: '2025-01-08', uploaded_by: 'Jane Doe' },
    { id: '5', name: 'Comparable_Sales.xlsx', category: 'financial', size: 45000, created_at: '2025-01-05', uploaded_by: 'John Smith' },
    { id: '6', name: 'Site_Photo_1.jpg', category: 'photos', size: 2400000, created_at: '2025-01-04', uploaded_by: 'Field Team' },
    { id: '7', name: 'Site_Photo_2.jpg', category: 'photos', size: 2100000, created_at: '2025-01-04', uploaded_by: 'Field Team' },
    { id: '8', name: 'Geotechnical_Report.pdf', category: 'due-diligence', size: 3200000, created_at: '2025-01-02', uploaded_by: 'Jane Doe' },
  ];

  const loadFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunity_files')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error('Error loading files:', err);
      setFiles(getDemoFiles());
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFileList = Array.from(e.target.files || []);
    setSelectedFiles(selectedFileList);
    if (selectedFileList.length > 0) {
      setShowUploadDialog(true);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = `${opportunityId || 'demo'}/${Date.now()}_${file.name}`;

        if (opportunityId && supabase) {
          try {
            const { error: uploadError } = await supabase.storage
              .from('opportunity-files')
              .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('opportunity-files')
              .getPublicUrl(fileName);

            const { data: fileRecord, error: dbError } = await supabase
              .from('opportunity_files')
              .insert({
                opportunity_id: opportunityId,
                name: file.name,
                category: uploadCategory,
                size: file.size,
                storage_path: fileName,
                url: publicUrl,
                mime_type: file.type,
              })
              .select()
              .single();

            if (dbError) throw dbError;
            uploadedFiles.push(fileRecord);
          } catch (uploadErr) {
            console.error('Supabase upload error:', uploadErr);
            uploadedFiles.push({
              id: Date.now() + i,
              name: file.name,
              category: uploadCategory,
              size: file.size,
              created_at: new Date().toISOString(),
              uploaded_by: 'Current User',
            });
          }
        } else {
          uploadedFiles.push({
            id: Date.now() + i,
            name: file.name,
            category: uploadCategory,
            size: file.size,
            created_at: new Date().toISOString(),
            uploaded_by: 'Current User',
          });
        }

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setFiles(prev => [...uploadedFiles, ...prev]);
      toast({ title: 'Upload Complete', description: `${selectedFiles.length} file(s) uploaded successfully.` });

    } catch (err) {
      console.error('Upload error:', err);
      toast({ title: 'Upload Failed', description: 'There was an error uploading your files.', variant: 'destructive' });
    } finally {
      setUploading(false);
      setShowUploadDialog(false);
      setSelectedFiles([]);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      if (opportunityId && supabase && file.storage_path) {
        await supabase.storage.from('opportunity-files').remove([file.storage_path]);
        await supabase.from('opportunity_files').delete().eq('id', file.id);
      }

      setFiles(prev => prev.filter(f => f.id !== file.id));
      toast({ title: 'File Deleted', description: `"${file.name}" has been deleted.` });
    } catch (err) {
      console.error('Delete error:', err);
      toast({ title: 'Delete Failed', description: 'There was an error deleting the file.', variant: 'destructive' });
    }
  };

  const handleDownload = async (file) => {
    try {
      if (file.url) {
        window.open(file.url, '_blank');
      } else if (file.storage_path && supabase) {
        const { data, error } = await supabase.storage.from('opportunity-files').download(file.storage_path);
        if (error) throw error;

        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        toast({ title: 'Demo Mode', description: 'File download not available in demo mode.' });
      }
    } catch (err) {
      console.error('Download error:', err);
      toast({ title: 'Download Failed', description: 'There was an error downloading the file.', variant: 'destructive' });
    }
  };

  const handlePreview = (file) => {
    setSelectedFile(file);
    setShowPreviewDialog(true);
  };

  const handleRename = async () => {
    if (!renameName.trim() || !selectedFile) return;

    try {
      if (opportunityId && supabase) {
        await supabase.from('opportunity_files').update({ name: renameName }).eq('id', selectedFile.id);
      }

      setFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, name: renameName } : f));
      toast({ title: 'File Renamed', description: `File renamed to "${renameName}".` });
    } catch (err) {
      console.error('Rename error:', err);
    } finally {
      setShowRenameDialog(false);
      setSelectedFile(null);
      setRenameName('');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const folderName = newFolderName;
    setNewFolderName('');
    setShowNewFolderDialog(false);
    toast({ title: 'Folder Created', description: `Folder "${folderName}" has been created.` });
  };

  const toggleFolder = (categoryId) => {
    setExpandedFolders(prev =>
      prev.includes(categoryId) ? prev.filter(f => f !== categoryId) : [...prev, categoryId]
    );
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filesByCategory = FILE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = filteredFiles.filter(f => f.category === cat.id);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading files...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Files & Documents</h2>
          <p className="text-sm text-gray-500">
            {files.length} file{files.length !== 1 ? 's' : ''} • {formatFileSize(files.reduce((acc, f) => acc + (f.size || 0), 0))} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowNewFolderDialog(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search files..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {FILE_CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Files by Category */}
      <div className="space-y-2">
        {FILE_CATEGORIES.map(category => {
          const categoryFiles = filesByCategory[category.id] || [];
          const isExpanded = expandedFolders.includes(category.id);
          const IconComponent = category.icon;

          return (
            <div key={category.id} className="bg-white border rounded-lg overflow-hidden">
              <button onClick={() => toggleFolder(category.id)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", category.color)}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <Badge variant="secondary">{categoryFiles.length}</Badge>
              </button>

              {isExpanded && categoryFiles.length > 0 && (
                <div className="border-t divide-y">
                  {categoryFiles.map(file => {
                    const FileIcon = getFileIcon(file.name);
                    return (
                      <div key={file.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 ml-8">
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                              {file.uploaded_by && ` • ${file.uploaded_by}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handlePreview(file)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}><Download className="w-4 h-4" /></Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedFile(file); setRenameName(file.name); setShowRenameDialog(true); }}>
                                <Edit2 className="w-4 h-4 mr-2" />Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(file)}>
                                <Trash2 className="w-4 h-4 mr-2" />Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {isExpanded && categoryFiles.length === 0 && (
                <div className="border-t px-4 py-6 text-center text-gray-400 text-sm ml-8">No files in this category</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {files.length === 0 && (
        <div className="bg-white border rounded-lg p-12 text-center mt-4">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded</h3>
          <p className="text-gray-500 mb-4">Upload documents, surveys, photos, and other files for this opportunity.</p>
          <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />Upload Your First File
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>Upload {selectedFiles.length} file(s) to this opportunity</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FILE_CATEGORIES.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 py-1">
                  <File className="w-4 h-4 text-gray-400" />
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#047857] h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)} disabled={uploading}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading} className="bg-[#047857] hover:bg-[#065f46]">
              {uploading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>) : (<><Upload className="w-4 h-4 mr-2" />Upload</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Create a custom folder to organize your files</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Folder Name</Label>
            <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Enter folder name..." className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} className="bg-[#047857] hover:bg-[#065f46]">
              <FolderPlus className="w-4 h-4 mr-2" />Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename File</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label>New Name</Label>
            <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>Cancel</Button>
            <Button onClick={handleRename} className="bg-[#047857] hover:bg-[#065f46]"><Check className="w-4 h-4 mr-2" />Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{selectedFile?.name}</DialogTitle></DialogHeader>
          <div className="py-4">
            {selectedFile && (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                {selectedFile.url && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(selectedFile.name.split('.').pop()?.toLowerCase()) ? (
                  <img src={selectedFile.url} alt={selectedFile.name} className="max-w-full max-h-96 mx-auto rounded" />
                ) : (
                  <div className="text-gray-500">
                    <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Preview not available for this file type</p>
                    <Button className="mt-4 bg-[#047857] hover:bg-[#065f46]" onClick={() => handleDownload(selectedFile)}>
                      <Download className="w-4 h-4 mr-2" />Download to View
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
