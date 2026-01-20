import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, File, Download, Eye, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { uploadFile, getAllDocuments, downloadFile, deleteFile } from '@/services/documentService';

const DocumentLibraryPage = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [uploadData, setUploadData] = useState({
    file: null,
    category: 'legal',
    description: '',
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getAllDocuments({ entity_type: 'general' });
      setDocuments(docs || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents. Using demo mode.',
        variant: 'destructive',
      });
      // Fallback to demo data
      setDocuments([
        {
          id: 1,
          name: 'Operating Agreement Template',
          category: 'Legal',
          file_type: 'application/pdf',
          created_at: '2025-01-15',
          created_by: { name: 'John Doe' },
          file_size: 251_000,
        },
        {
          id: 2,
          name: 'Purchase Agreement',
          category: 'Contracts',
          file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          created_at: '2025-01-10',
          created_by: { name: 'Jane Smith' },
          file_size: 159_000,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file) return;

    try {
      setUploading(true);
      await uploadFile({
        entityType: 'general',
        entityId: 'library',
        category: uploadData.category,
        file: uploadData.file,
        fileName: uploadData.file.name,
        description: uploadData.description,
      });

      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      setShowUploadModal(false);
      setUploadData({ file: null, category: 'legal', description: '' });
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      await downloadFile(doc.id);
      toast({
        title: 'Success',
        description: 'Download started',
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteFile(docId);
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      await loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileType = (mimeType) => {
    if (!mimeType) return 'FILE';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word')) return 'DOCX';
    if (mimeType.includes('excel')) return 'XLSX';
    return mimeType.split('/').pop().toUpperCase();
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = filterCategory === 'all' || doc.category?.toLowerCase() === filterCategory;
    const matchesSearch = !searchTerm || doc.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Document Library</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Library</h1>
          <p className="text-gray-600 mt-2">Centralized repository for all project and organizational documents</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowUploadModal(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>Browse and manage all documents in the library</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input 
                    placeholder="Search documents..." 
                    className="flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="templates">Templates</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Uploaded By</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              No documents found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">{doc.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{doc.category}</Badge>
                              </TableCell>
                              <TableCell>{getFileType(doc.file_type)}</TableCell>
                              <TableCell>{doc.created_at?.split('T')[0] || doc.uploadDate}</TableCell>
                              <TableCell>{doc.created_by?.name || doc.uploadedBy || '-'}</TableCell>
                              <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleDelete(doc.id)}
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Legal Documents</CardTitle>
              <CardDescription>Legal agreements and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">No legal documents available</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>Contract templates and agreements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">No contracts available</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Reusable document templates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">No templates available</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Document Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to the library
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
              {uploadData.file && (
                <p className="text-sm text-gray-500">
                  Selected: {uploadData.file.name} ({(uploadData.file.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={uploadData.category}
                onValueChange={(value) => setUploadData({ ...uploadData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of the document..."
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!uploadData.file || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentLibraryPage;
