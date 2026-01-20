import React, { useState } from 'react';
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
import { Upload, FileText, Users, Send, Eye } from 'lucide-react';

const ESignPage = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Purchase Agreement',
      status: 'pending',
      createdDate: '2025-01-15',
      deadline: '2025-01-30',
      signers: 2,
      completedSigners: 0,
    },
    {
      id: 2,
      name: 'Loan Agreement',
      status: 'completed',
      createdDate: '2025-01-10',
      deadline: '2025-01-25',
      signers: 2,
      completedSigners: 2,
    },
  ]);

  const [showSendModal, setShowSendModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    file: null,
    recipients: [{ email: '', name: '', order: 1 }],
    message: '',
    deadline: '',
  });

  const handleAddRecipient = () => {
    setNewDocument({
      ...newDocument,
      recipients: [...newDocument.recipients, { email: '', name: '', order: newDocument.recipients.length + 1 }]
    });
  };

  const handleRemoveRecipient = (index) => {
    setNewDocument({
      ...newDocument,
      recipients: newDocument.recipients.filter((_, i) => i !== index)
    });
  };

  const handleSendDocument = () => {
    // Create new document entry
    const newDoc = {
      id: documents.length + 1,
      name: newDocument.name || newDocument.file?.name || 'Untitled Document',
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      deadline: newDocument.deadline,
      signers: newDocument.recipients.length,
      completedSigners: 0,
    };
    
    setDocuments([newDoc, ...documents]);
    setShowSendModal(false);
    setNewDocument({
      name: '',
      file: null,
      recipients: [{ email: '', name: '', order: 1 }],
      message: '',
      deadline: '',
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>E-Signature Management</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">E-Signature Management</h1>
          <p className="text-gray-600 mt-2">Manage document signing workflows and track signature status</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowSendModal(true)}>
          <Send className="w-4 h-4 mr-2" />
          Send Document for Signature
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>All documents requiring signatures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Search documents..." className="flex-1" />
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Signers</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.name}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(doc.status)}>{doc.status}</Badge>
                          </TableCell>
                          <TableCell>{doc.createdDate}</TableCell>
                          <TableCell>{doc.deadline}</TableCell>
                          <TableCell>{doc.completedSigners}/{doc.signers}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Signatures</CardTitle>
              <CardDescription>Documents awaiting signature</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                {documents.filter((d) => d.status === 'pending').length} pending document(s)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Signatures</CardTitle>
              <CardDescription>Documents with all signatures collected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                {documents.filter((d) => d.status === 'completed').length} completed document(s)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Document Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Document for Signature</DialogTitle>
            <DialogDescription>
              Upload a document and specify recipients for electronic signatures
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Document Upload */}
            <div className="space-y-2">
              <Label htmlFor="document">Document</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setNewDocument({ ...newDocument, file: e.target.files[0] })}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('document').click()}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                {newDocument.file && (
                  <p className="mt-2 text-sm text-gray-600">{newDocument.file.name}</p>
                )}
              </div>
            </div>

            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="docName">Document Name</Label>
              <Input
                id="docName"
                value={newDocument.name}
                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                placeholder="Enter document name"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">Signature Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={newDocument.deadline}
                onChange={(e) => setNewDocument({ ...newDocument, deadline: e.target.value })}
              />
            </div>

            {/* Recipients */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Recipients</Label>
                <Button variant="outline" size="sm" onClick={handleAddRecipient}>
                  <Users className="w-4 h-4 mr-1" />
                  Add Recipient
                </Button>
              </div>
              {newDocument.recipients.map((recipient, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Recipient Name"
                      value={recipient.name}
                      onChange={(e) => {
                        const updated = [...newDocument.recipients];
                        updated[index].name = e.target.value;
                        setNewDocument({ ...newDocument, recipients: updated });
                      }}
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={recipient.email}
                      onChange={(e) => {
                        const updated = [...newDocument.recipients];
                        updated[index].email = e.target.value;
                        setNewDocument({ ...newDocument, recipients: updated });
                      }}
                    />
                  </div>
                  <Badge variant="outline" className="mt-2">#{index + 1}</Badge>
                  {newDocument.recipients.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecipient(index)}
                      className="mt-2"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <textarea
                id="message"
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={newDocument.message}
                onChange={(e) => setNewDocument({ ...newDocument, message: e.target.value })}
                placeholder="Add a message for recipients..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendDocument}
              disabled={!newDocument.file || newDocument.recipients.some(r => !r.email)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send for Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ESignPage;
