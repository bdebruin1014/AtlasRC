import React, { useState } from 'react';
import { Plus, Search, Eye, Download, Trash2, X, Folder, FolderOpen, FileText, File, Image, FileSpreadsheet, Upload, MoreVertical, Grid, List, Clock, User, Link2, Share2, Edit2, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DocumentsPage = ({ projectId }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(['contracts', 'construction']);

  const folders = [
    {
      id: 'contracts',
      name: 'Contracts & Legal',
      icon: 'folder',
      files: [
        { id: 1, name: 'Purchase Agreement.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-01-10', tags: ['legal', 'acquisition'] },
        { id: 2, name: 'Operating Agreement.pdf', type: 'pdf', size: '892 KB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-01-15', tags: ['legal', 'investor'] },
        { id: 3, name: 'Construction Contract.pdf', type: 'pdf', size: '3.1 MB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-02-20', tags: ['legal', 'construction'] },
        { id: 4, name: 'Title Commitment.pdf', type: 'pdf', size: '1.8 MB', uploadedBy: 'First American', uploadedDate: '2024-01-08', tags: ['legal', 'title'] },
      ],
    },
    {
      id: 'construction',
      name: 'Construction',
      icon: 'folder',
      subfolders: [
        {
          id: 'plans',
          name: 'Plans & Drawings',
          files: [
            { id: 5, name: 'Architectural Plans - Full Set.pdf', type: 'pdf', size: '45.2 MB', uploadedBy: 'Johnson Architects', uploadedDate: '2024-02-15', tags: ['plans', 'architecture'] },
            { id: 6, name: 'Structural Plans.pdf', type: 'pdf', size: '28.5 MB', uploadedBy: 'Structural Eng', uploadedDate: '2024-02-18', tags: ['plans', 'structural'] },
            { id: 7, name: 'MEP Plans.pdf', type: 'pdf', size: '32.1 MB', uploadedBy: 'MEP Engineering', uploadedDate: '2024-02-20', tags: ['plans', 'mep'] },
            { id: 8, name: 'Site Plan.pdf', type: 'pdf', size: '8.4 MB', uploadedBy: 'Civil Engineer', uploadedDate: '2024-02-10', tags: ['plans', 'civil'] },
          ],
        },
        {
          id: 'permits',
          name: 'Permits',
          files: [
            { id: 9, name: 'Building Permit.pdf', type: 'pdf', size: '456 KB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-03-01', tags: ['permits'] },
            { id: 10, name: 'Grading Permit.pdf', type: 'pdf', size: '234 KB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-02-28', tags: ['permits'] },
          ],
        },
        {
          id: 'progress-photos',
          name: 'Progress Photos',
          files: [
            { id: 11, name: 'Dec 2024 Progress.zip', type: 'zip', size: '124 MB', uploadedBy: 'Site Super', uploadedDate: '2024-12-20', tags: ['photos'] },
            { id: 12, name: 'Nov 2024 Progress.zip', type: 'zip', size: '98 MB', uploadedBy: 'Site Super', uploadedDate: '2024-11-20', tags: ['photos'] },
          ],
        },
      ],
      files: [
        { id: 13, name: 'Specifications.pdf', type: 'pdf', size: '12.3 MB', uploadedBy: 'Johnson Architects', uploadedDate: '2024-02-15', tags: ['specs'] },
        { id: 14, name: 'Schedule of Values.xlsx', type: 'xlsx', size: '245 KB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-03-01', tags: ['budget'] },
      ],
    },
    {
      id: 'financials',
      name: 'Financials',
      icon: 'folder',
      files: [
        { id: 15, name: 'Project Proforma v3.2.xlsx', type: 'xlsx', size: '1.2 MB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-12-20', tags: ['proforma', 'budget'] },
        { id: 16, name: 'Construction Budget.xlsx', type: 'xlsx', size: '890 KB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-03-01', tags: ['budget'] },
        { id: 17, name: 'Draw Request #12.pdf', type: 'pdf', size: '2.1 MB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-12-15', tags: ['draws'] },
        { id: 18, name: 'Bank Commitment Letter.pdf', type: 'pdf', size: '456 KB', uploadedBy: 'First National', uploadedDate: '2024-01-20', tags: ['financing'] },
      ],
    },
    {
      id: 'investor',
      name: 'Investor Documents',
      icon: 'folder',
      files: [
        { id: 19, name: 'Q4 2024 Investor Report.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-12-28', tags: ['reports', 'investor'] },
        { id: 20, name: 'Q3 2024 Investor Report.pdf', type: 'pdf', size: '2.1 MB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-10-15', tags: ['reports', 'investor'] },
        { id: 21, name: 'PPM - Private Placement Memo.pdf', type: 'pdf', size: '4.5 MB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-01-05', tags: ['legal', 'investor'] },
        { id: 22, name: 'Subscription Agreements.pdf', type: 'pdf', size: '1.8 MB', uploadedBy: 'Bryan VanRock', uploadedDate: '2024-01-15', tags: ['legal', 'investor'] },
      ],
    },
    {
      id: 'sales',
      name: 'Sales & Marketing',
      icon: 'folder',
      files: [
        { id: 23, name: 'Marketing Brochure.pdf', type: 'pdf', size: '8.5 MB', uploadedBy: 'Marketing', uploadedDate: '2024-10-01', tags: ['marketing'] },
        { id: 24, name: 'Floor Plans - Buyer Package.pdf', type: 'pdf', size: '5.2 MB', uploadedBy: 'Marketing', uploadedDate: '2024-10-01', tags: ['marketing', 'plans'] },
        { id: 25, name: 'Unit 1 - Closing Documents.pdf', type: 'pdf', size: '3.4 MB', uploadedBy: 'Title Company', uploadedDate: '2024-12-20', tags: ['closing', 'legal'] },
      ],
    },
  ];

  const recentFiles = [
    { id: 19, name: 'Q4 2024 Investor Report.pdf', folder: 'Investor Documents', uploadedDate: '2024-12-28' },
    { id: 25, name: 'Unit 1 - Closing Documents.pdf', folder: 'Sales & Marketing', uploadedDate: '2024-12-20' },
    { id: 15, name: 'Project Proforma v3.2.xlsx', folder: 'Financials', uploadedDate: '2024-12-20' },
    { id: 11, name: 'Dec 2024 Progress.zip', folder: 'Construction > Progress Photos', uploadedDate: '2024-12-20' },
    { id: 17, name: 'Draw Request #12.pdf', folder: 'Financials', uploadedDate: '2024-12-15' },
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'xlsx': case 'xls': return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case 'docx': case 'doc': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'jpg': case 'png': case 'jpeg': return <Image className="w-5 h-5 text-purple-500" />;
      case 'zip': return <File className="w-5 h-5 text-amber-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) ? prev.filter(f => f !== folderId) : [...prev, folderId]
    );
  };

  const getAllFiles = () => {
    let allFiles = [];
    folders.forEach(folder => {
      if (folder.files) allFiles = [...allFiles, ...folder.files.map(f => ({ ...f, folder: folder.name }))];
      if (folder.subfolders) {
        folder.subfolders.forEach(sub => {
          if (sub.files) allFiles = [...allFiles, ...sub.files.map(f => ({ ...f, folder: `${folder.name} > ${sub.name}` }))];
        });
      }
    });
    return allFiles;
  };

  const totalFiles = getAllFiles().length;
  const totalSize = '385 MB';

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Documents</h1>
          <p className="text-sm text-gray-500">{totalFiles} files • {totalSize} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-1" />Upload
          </Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm">
            <Plus className="w-4 h-4 mr-1" />New Folder
          </Button>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search documents..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Types</option>
            <option>PDF</option>
            <option>Excel</option>
            <option>Images</option>
            <option>Archives</option>
          </select>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode('list')} className={cn("p-2 rounded", viewMode === 'list' && "bg-white shadow")}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded", viewMode === 'grid' && "bg-white shadow")}>
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Folder Tree */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Folders</h3>
          <div className="space-y-1">
            {folders.map(folder => (
              <div key={folder.id}>
                <button 
                  onClick={() => toggleFolder(folder.id)}
                  className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-left", selectedFolder === folder.id && "bg-gray-100")}
                >
                  {expandedFolders.includes(folder.id) ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <Folder className="w-4 h-4 text-amber-500" />}
                  <span className="text-sm flex-1">{folder.name}</span>
                  <span className="text-xs text-gray-400">{folder.files?.length || 0}</span>
                </button>
                {expandedFolders.includes(folder.id) && folder.subfolders && (
                  <div className="ml-4 mt-1 space-y-1">
                    {folder.subfolders.map(sub => (
                      <button 
                        key={sub.id}
                        onClick={() => setSelectedFolder(sub.id)}
                        className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-left", selectedFolder === sub.id && "bg-gray-100")}
                      >
                        <Folder className="w-4 h-4 text-amber-400" />
                        <span className="text-sm flex-1">{sub.name}</span>
                        <span className="text-xs text-gray-400">{sub.files?.length || 0}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Files Area */}
        <div className="col-span-3 space-y-4">
          {/* Recent Files */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Recent Files</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentFiles.map(file => (
                <div key={file.id} className="flex-shrink-0 w-48 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    {getFileIcon(file.name.split('.').pop())}
                    <span className="text-xs text-gray-500 truncate">{file.folder}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{file.uploadedDate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* All Files */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">All Files</h3>
            </div>
            {viewMode === 'list' ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Folder</th>
                    <th className="text-left px-4 py-3 font-medium">Size</th>
                    <th className="text-left px-4 py-3 font-medium">Uploaded</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {getAllFiles().slice(0, 15).map(file => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <span className="font-medium">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{file.folder}</td>
                      <td className="px-4 py-3 text-gray-500">{file.size}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{file.uploadedDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedDoc(file)}><Eye className="w-4 h-4 text-gray-500" /></button>
                          <button className="p-1 hover:bg-gray-100 rounded"><Download className="w-4 h-4 text-gray-500" /></button>
                          <button className="p-1 hover:bg-gray-100 rounded"><Share2 className="w-4 h-4 text-gray-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4 grid grid-cols-4 gap-4">
                {getAllFiles().slice(0, 16).map(file => (
                  <div key={file.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDoc(file)}>
                    <div className="flex items-center justify-center h-16 bg-gray-50 rounded mb-2">
                      {getFileIcon(file.type)}
                    </div>
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{file.size}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Upload Documents</h3>
              <button onClick={() => setShowUploadModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium mb-2">Drag & drop files here</p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <Button variant="outline">Select Files</Button>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium block mb-1">Upload to folder</label>
                <select className="w-full border rounded-md px-3 py-2">
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium block mb-1">Tags</label>
                <Input placeholder="Add tags (comma separated)" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Upload</Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Document Details</h3>
              <button onClick={() => setSelectedDoc(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getFileIcon(selectedDoc.type)}
                </div>
                <div>
                  <p className="font-semibold">{selectedDoc.name}</p>
                  <p className="text-sm text-gray-500">{selectedDoc.folder}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Size</p>
                  <p className="font-medium">{selectedDoc.size}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium uppercase">{selectedDoc.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Uploaded By</p>
                  <p className="font-medium">{selectedDoc.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-gray-500">Upload Date</p>
                  <p className="font-medium">{selectedDoc.uploadedDate}</p>
                </div>
              </div>
              {selectedDoc.tags && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex gap-1 flex-wrap">
                    {selectedDoc.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm" className="text-red-600">
                <Trash2 className="w-4 h-4 mr-1" />Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline"><Share2 className="w-4 h-4 mr-1" />Share</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]"><Download className="w-4 h-4 mr-1" />Download</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
