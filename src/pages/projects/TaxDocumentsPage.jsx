import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Download, Calendar, CheckCircle, Circle, Clock, AlertTriangle, FileText, Upload, Send, Users, DollarSign, Building2, Mail, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TaxDocumentsPage = ({ projectId }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('k1s'); // 'k1s', 'documents', 'timeline'
  const [selectedYear, setSelectedYear] = useState('2024');

  const investors = [
    { id: 'INV-001', name: 'Johnson Family Trust', type: 'LP', ownership: 16.0, email: 'johnson@familytrust.com', taxId: '**-***7890' },
    { id: 'INV-002', name: 'Smith Capital Partners', type: 'LP', ownership: 14.0, email: 'invest@smithcapital.com', taxId: '**-***4567' },
    { id: 'INV-003', name: 'Williams Investment Group', type: 'LP', ownership: 12.0, email: 'williams@wig.com', taxId: '**-***2345' },
    { id: 'INV-004', name: 'Anderson Holdings LLC', type: 'LP', ownership: 10.0, email: 'anderson@holdingsllc.com', taxId: '**-***8901' },
    { id: 'INV-005', name: 'Davis Family Office', type: 'LP', ownership: 8.0, email: 'davis@familyoffice.com', taxId: '**-***5678' },
    { id: 'INV-006', name: 'Miller Investments', type: 'LP', ownership: 6.0, email: 'miller@investments.com', taxId: '**-***3456' },
    { id: 'INV-007', name: 'Wilson Trust', type: 'LP', ownership: 6.0, email: 'wilson@trust.com', taxId: '**-***1234' },
    { id: 'INV-008', name: 'VanRock Holdings LLC', type: 'GP/Sponsor', ownership: 28.0, email: 'bryan@vanrock.com', taxId: '**-***9012' },
  ];

  const [k1Records, setK1Records] = useState([
    // 2024 K-1s (in progress)
    { id: 'K1-2024-001', investorId: 'INV-001', year: '2024', status: 'draft', generatedDate: null, sentDate: null, capitalAccount: 340000, distributionsYTD: 0, ordinaryIncome: -12500, section199A: 0 },
    { id: 'K1-2024-002', investorId: 'INV-002', year: '2024', status: 'draft', generatedDate: null, sentDate: null, capitalAccount: 297500, distributionsYTD: 0, ordinaryIncome: -10938, section199A: 0 },
    { id: 'K1-2024-003', investorId: 'INV-003', year: '2024', status: 'draft', generatedDate: null, sentDate: null, capitalAccount: 255000, distributionsYTD: 0, ordinaryIncome: -9375, section199A: 0 },
    { id: 'K1-2024-004', investorId: 'INV-004', year: '2024', status: 'draft', generatedDate: null, sentDate: null, capitalAccount: 212500, distributionsYTD: 0, ordinaryIncome: -7813, section199A: 0 },
    { id: 'K1-2024-005', investorId: 'INV-005', year: '2024', status: 'draft', generatedDate: null, sentDate: null, capitalAccount: 170000, distributionsYTD: 0, ordinaryIncome: -6250, section199A: 0 },
    { id: 'K1-2024-006', investorId: 'INV-006', year: '2024', status: 'draft', generatedDate: null, sentDate: null, capitalAccount: 127500, distributionsYTD: 0, ordinaryIncome: -4688, section199A: 0 },
    { id: 'K1-2024-007', investorId: 'INV-007', year: '2024', status: 'draft', generatedDate: null, sentDate: null, capitalAccount: 127500, distributionsYTD: 0, ordinaryIncome: -4688, section199A: 0 },
    { id: 'K1-2024-008', investorId: 'INV-008', year: '2024', status: 'draft', generatedDate: null, sentDate: null, capitalAccount: 595000, distributionsYTD: 0, ordinaryIncome: -21875, section199A: 0 },
  ]);

  const taxDocuments = [
    { id: 'DOC-001', name: 'Partnership Tax Return (Form 1065)', year: '2023', type: '1065', status: 'filed', filedDate: '2024-03-14', dueDate: '2024-03-15' },
    { id: 'DOC-002', name: 'Extension Request (Form 7004)', year: '2024', type: '7004', status: 'filed', filedDate: '2024-03-10', dueDate: '2024-03-15' },
    { id: 'DOC-003', name: 'State Tax Return - SC', year: '2023', type: 'State', status: 'filed', filedDate: '2024-04-12', dueDate: '2024-04-15' },
    { id: 'DOC-004', name: 'W-9 - Johnson Family Trust', year: '2024', type: 'W-9', status: 'received', filedDate: '2024-01-15', dueDate: null },
    { id: 'DOC-005', name: 'W-9 - Smith Capital Partners', year: '2024', type: 'W-9', status: 'received', filedDate: '2024-01-18', dueDate: null },
    { id: 'DOC-006', name: 'Property Tax Statement', year: '2024', type: 'Property Tax', status: 'paid', filedDate: '2024-01-10', dueDate: '2024-01-15' },
  ];

  const taxTimeline = [
    { date: '2025-01-15', event: 'Q4 2024 Estimated Tax Payment Due', status: 'upcoming' },
    { date: '2025-03-15', event: 'Partnership Return Due (or Extension)', status: 'upcoming' },
    { date: '2025-03-15', event: 'K-1s Due to Partners', status: 'upcoming' },
    { date: '2025-04-15', event: 'State Tax Return Due', status: 'upcoming' },
    { date: '2025-04-15', event: 'Q1 2025 Estimated Tax Payment Due', status: 'upcoming' },
    { date: '2025-06-15', event: 'Q2 2025 Estimated Tax Payment Due', status: 'upcoming' },
    { date: '2025-09-15', event: 'Extended Partnership Return Due', status: 'upcoming' },
    { date: '2025-09-15', event: 'Q3 2025 Estimated Tax Payment Due', status: 'upcoming' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700';
      case 'generated': return 'bg-blue-100 text-blue-700';
      case 'draft': return 'bg-gray-100 text-gray-600';
      case 'filed': return 'bg-green-100 text-green-700';
      case 'received': return 'bg-green-100 text-green-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getInvestorById = (id) => investors.find(i => i.id === id);

  const filteredK1s = k1Records.filter(k => k.year === selectedYear);
  const draftCount = filteredK1s.filter(k => k.status === 'draft').length;
  const generatedCount = filteredK1s.filter(k => k.status === 'generated').length;
  const sentCount = filteredK1s.filter(k => k.status === 'sent').length;

  const totalCapitalAccounts = filteredK1s.reduce((sum, k) => sum + k.capitalAccount, 0);
  const totalDistributions = filteredK1s.reduce((sum, k) => sum + k.distributionsYTD, 0);
  const totalOrdinaryIncome = filteredK1s.reduce((sum, k) => sum + k.ordinaryIncome, 0);

  const formatCurrency = (value) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `${isNegative ? '-' : ''}$${(absValue / 1000000).toFixed(2)}M`;
    if (absValue >= 1000) return `${isNegative ? '-' : ''}$${(absValue / 1000).toFixed(0)}K`;
    return `${isNegative ? '-' : ''}$${absValue.toLocaleString()}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Tax Documents</h1>
          <p className="text-sm text-gray-500">K-1s, tax filings, and compliance</p>
        </div>
        <div className="flex gap-2">
          <select className="border rounded-md px-3 py-2 text-sm" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="2024">Tax Year 2024</option>
            <option value="2023">Tax Year 2023</option>
          </select>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-1" />Upload Document
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">K-1s ({selectedYear})</p>
          <p className="text-2xl font-semibold">{filteredK1s.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-gray-400">
          <p className="text-xs text-gray-500">Draft</p>
          <p className="text-2xl font-semibold">{draftCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Generated</p>
          <p className="text-2xl font-semibold text-blue-600">{generatedCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Sent</p>
          <p className="text-2xl font-semibold text-green-600">{sentCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Capital</p>
          <p className="text-xl font-semibold">{formatCurrency(totalCapitalAccounts)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Net Income/(Loss)</p>
          <p className={cn("text-xl font-semibold", totalOrdinaryIncome < 0 ? "text-red-600" : "text-green-600")}>
            {formatCurrency(totalOrdinaryIncome)}
          </p>
        </div>
      </div>

      {/* K-1 Deadline Alert */}
      {selectedYear === '2024' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-500" />
          <div>
            <p className="font-medium text-blue-800">2024 K-1 Deadline: March 15, 2025</p>
            <p className="text-sm text-blue-700">77 days remaining to generate and distribute K-1s to all partners.</p>
          </div>
          <Button size="sm" className="ml-auto bg-blue-600 hover:bg-blue-700">Generate All K-1s</Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('k1s')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'k1s' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Schedule K-1s ({filteredK1s.length})
        </button>
        <button onClick={() => setActiveTab('documents')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'documents' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Tax Documents ({taxDocuments.length})
        </button>
        <button onClick={() => setActiveTab('timeline')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'timeline' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Tax Calendar
        </button>
      </div>

      {/* K-1s Tab */}
      {activeTab === 'k1s' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Partner</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-right px-4 py-3 font-medium">Ownership</th>
                <th className="text-right px-4 py-3 font-medium">Capital Account</th>
                <th className="text-right px-4 py-3 font-medium">Distributions</th>
                <th className="text-right px-4 py-3 font-medium">Ordinary Income</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredK1s.map((k1) => {
                const investor = getInvestorById(k1.investorId);
                return (
                  <tr key={k1.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{investor?.name}</p>
                      <p className="text-xs text-gray-500">{investor?.taxId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded text-xs", investor?.type === 'GP/Sponsor' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                        {investor?.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{investor?.ownership.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right font-medium">${k1.capitalAccount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">${k1.distributionsYTD.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(k1.ordinaryIncome < 0 ? "text-red-600" : "text-green-600")}>
                        {formatCurrency(k1.ordinaryIncome)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(k1.status))}>
                        {k1.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded" title="View K-1">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Download">
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Email K-1">
                          <Mail className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t font-semibold">
              <tr>
                <td className="px-4 py-3" colSpan="2">TOTALS</td>
                <td className="px-4 py-3 text-right">100%</td>
                <td className="px-4 py-3 text-right">${totalCapitalAccounts.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">${totalDistributions.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={cn(totalOrdinaryIncome < 0 ? "text-red-600" : "text-green-600")}>
                    {formatCurrency(totalOrdinaryIncome)}
                  </span>
                </td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Document</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Year</th>
                <th className="text-left px-4 py-3 font-medium">Due Date</th>
                <th className="text-left px-4 py-3 font-medium">Filed/Received</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {taxDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{doc.type}</td>
                  <td className="px-4 py-3">{doc.year}</td>
                  <td className="px-4 py-3 text-xs">{doc.dueDate || '-'}</td>
                  <td className="px-4 py-3 text-xs">{doc.filedDate}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(doc.status))}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><Download className="w-4 h-4 text-gray-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4">2025 Tax Calendar</h3>
          <div className="space-y-4">
            {taxTimeline.map((item, idx) => {
              const isPast = new Date(item.date) < new Date();
              const isUpcoming = !isPast && new Date(item.date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              return (
                <div key={idx} className={cn("flex items-center gap-4 p-4 rounded-lg", isUpcoming ? "bg-amber-50 border border-amber-200" : "bg-gray-50")}>
                  <div className="w-20 text-center">
                    <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-2xl font-bold">{new Date(item.date).getDate()}</p>
                    <p className="text-xs text-gray-500">{new Date(item.date).getFullYear()}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.event}</p>
                  </div>
                  <span className={cn("px-3 py-1 rounded text-xs", getStatusColor(item.status))}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Upload Tax Document</h3>
              <button onClick={() => setShowUploadModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS up to 10MB</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Document Type</label>
                <select className="w-full border rounded-md px-3 py-2">
                  <option>W-9</option>
                  <option>K-1</option>
                  <option>1065</option>
                  <option>State Return</option>
                  <option>Property Tax</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Tax Year</label>
                <select className="w-full border rounded-md px-3 py-2">
                  <option>2024</option>
                  <option>2023</option>
                  <option>2022</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Upload</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxDocumentsPage;
