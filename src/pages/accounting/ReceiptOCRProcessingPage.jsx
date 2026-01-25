import React, { useState, useMemo } from 'react';
import {
  Camera, Upload, FileText, CheckCircle, AlertCircle, Clock,
  Scan, Zap, Eye, Edit, Trash2, Download, RefreshCw, Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * RECEIPT OCR PROCESSING - AUTOMATED EXPENSE DOCUMENTATION
 *
 * 1. SUPPORTED FORMATS
 *    - Images: JPG, PNG, HEIC (from mobile)
 *    - Documents: PDF (single and multi-page)
 *    - Maximum file size: 10MB per receipt
 *
 * 2. EXTRACTED DATA
 *    - Vendor name and address
 *    - Transaction date
 *    - Total amount and currency
 *    - Tax amounts (if itemized)
 *    - Payment method (last 4 digits)
 *    - Line items (when available)
 *
 * 3. CONFIDENCE SCORING
 *    - High confidence (90%+): Auto-approved for matching
 *    - Medium confidence (70-89%): Review recommended
 *    - Low confidence (<70%): Manual entry required
 *
 * 4. FRAUD DETECTION
 *    - Duplicate receipt detection
 *    - Date manipulation detection
 *    - Amount tampering indicators
 *    - Vendor mismatch alerts
 *
 * 5. INTEGRATION
 *    - Auto-match to credit card transactions
 *    - Link to expense reports
 *    - Archive in document management
 */

const mockReceipts = [
  {
    id: 1,
    fileName: 'receipt_20240202_001.jpg',
    uploadDate: '2024-02-02 14:30:00',
    uploadedBy: 'Sarah Johnson',
    status: 'processed',
    confidence: 95,
    extractedData: {
      vendor: 'Office Depot',
      date: '2024-02-01',
      amount: 124.57,
      tax: 10.38,
      paymentMethod: 'Visa ****4521',
      category: 'Office Supplies'
    },
    matched: true,
    transactionId: 'TXN-2024-0892'
  },
  {
    id: 2,
    fileName: 'IMG_4521.heic',
    uploadDate: '2024-02-02 13:15:00',
    uploadedBy: 'Mike Chen',
    status: 'review_needed',
    confidence: 72,
    extractedData: {
      vendor: 'Marriott Hotels',
      date: '2024-01-30',
      amount: 289.00,
      tax: null,
      paymentMethod: 'Amex ****8832',
      category: 'Travel'
    },
    matched: false,
    transactionId: null,
    reviewReason: 'Tax amount not detected - manual verification needed'
  },
  {
    id: 3,
    fileName: 'uber_receipt.pdf',
    uploadDate: '2024-02-02 11:45:00',
    uploadedBy: 'Lisa Wang',
    status: 'processed',
    confidence: 98,
    extractedData: {
      vendor: 'Uber Technologies',
      date: '2024-02-02',
      amount: 34.50,
      tax: 2.87,
      paymentMethod: 'Visa ****7743',
      category: 'Transportation'
    },
    matched: true,
    transactionId: 'TXN-2024-0901'
  },
  {
    id: 4,
    fileName: 'lunch_meeting.jpg',
    uploadDate: '2024-02-02 10:20:00',
    uploadedBy: 'Tom Davis',
    status: 'duplicate_warning',
    confidence: 91,
    extractedData: {
      vendor: 'The Capital Grille',
      date: '2024-01-29',
      amount: 187.45,
      tax: 15.62,
      paymentMethod: 'Visa ****4521',
      category: 'Meals & Entertainment'
    },
    matched: false,
    transactionId: null,
    reviewReason: 'Potential duplicate - similar receipt uploaded on 2024-01-30'
  },
  {
    id: 5,
    fileName: 'parking_garage.png',
    uploadDate: '2024-02-02 09:00:00',
    uploadedBy: 'John Smith',
    status: 'processing',
    confidence: null,
    extractedData: null,
    matched: false,
    transactionId: null
  },
  {
    id: 6,
    fileName: 'blurry_receipt.jpg',
    uploadDate: '2024-02-01 16:30:00',
    uploadedBy: 'Amy Roberts',
    status: 'failed',
    confidence: 35,
    extractedData: {
      vendor: null,
      date: null,
      amount: null,
      tax: null,
      paymentMethod: null,
      category: null
    },
    matched: false,
    transactionId: null,
    reviewReason: 'Image quality too low - please retake photo'
  }
];

const mockUnmatchedTransactions = [
  { id: 1, date: '2024-02-01', vendor: 'Amazon.com', amount: 67.89, cardLast4: '4521', daysPending: 2 },
  { id: 2, date: '2024-01-31', vendor: 'Delta Airlines', amount: 456.00, cardLast4: '8832', daysPending: 3 },
  { id: 3, date: '2024-01-30', vendor: 'Hilton Hotels', amount: 312.50, cardLast4: '7743', daysPending: 4 }
];

const statusConfig = {
  processed: { label: 'Processed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  review_needed: { label: 'Review Needed', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  duplicate_warning: { label: 'Duplicate Warning', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: AlertCircle }
};

const getConfidenceColor = (confidence) => {
  if (confidence >= 90) return 'text-green-600';
  if (confidence >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

export default function ReceiptOCRProcessingPage() {
  const [activeTab, setActiveTab] = useState('receipts');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredReceipts = useMemo(() => {
    if (filter === 'all') return mockReceipts;
    return mockReceipts.filter(r => r.status === filter);
  }, [filter]);

  const stats = useMemo(() => ({
    totalUploaded: mockReceipts.length,
    processed: mockReceipts.filter(r => r.status === 'processed').length,
    needsReview: mockReceipts.filter(r => ['review_needed', 'duplicate_warning'].includes(r.status)).length,
    failed: mockReceipts.filter(r => r.status === 'failed').length,
    unmatchedTransactions: mockUnmatchedTransactions.length,
    averageConfidence: Math.round(mockReceipts.filter(r => r.confidence).reduce((sum, r) => sum + r.confidence, 0) / mockReceipts.filter(r => r.confidence).length)
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipt OCR Processing</h1>
          <p className="text-gray-600">Automated receipt scanning and expense matching</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Scan className="w-4 h-4 mr-2" />Batch Process</Button>
          <Button className="bg-blue-600 hover:bg-blue-700"><Upload className="w-4 h-4 mr-2" />Upload Receipts</Button>
        </div>
      </div>

      {/* Unmatched Transactions Alert */}
      {stats.unmatchedTransactions > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">{stats.unmatchedTransactions} Transaction(s) Missing Receipts</p>
            <p className="text-sm text-yellow-700">Upload receipts to match these credit card transactions</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto border-yellow-600 text-yellow-600" onClick={() => setActiveTab('unmatched')}>View Transactions</Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Upload className="w-4 h-4" />
            <span className="text-sm">Uploaded</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUploaded}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Processed</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Needs Review</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.needsReview}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Unmatched</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.unmatchedTransactions}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Avg Confidence</span>
          </div>
          <p className={cn("text-2xl font-bold", getConfidenceColor(stats.averageConfidence))}>{stats.averageConfidence}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['receipts', 'unmatched', 'duplicates'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px",
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === 'receipts' && 'All Receipts'}
            {tab === 'unmatched' && `Unmatched (${stats.unmatchedTransactions})`}
            {tab === 'duplicates' && 'Duplicate Detection'}
          </button>
        ))}
      </div>

      {/* Filter */}
      {activeTab === 'receipts' && (
        <div className="flex gap-2">
          {['all', 'processed', 'review_needed', 'duplicate_warning', 'processing', 'failed'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : statusConfig[f]?.label || f}
            </Button>
          ))}
        </div>
      )}

      {/* Receipts Tab */}
      {activeTab === 'receipts' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">File</th>
                <th className="p-4">Uploaded</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">Status</th>
                <th className="p-4">Match</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt) => {
                const StatusIcon = statusConfig[receipt.status]?.icon || FileText;
                return (
                  <tr key={receipt.id} className={cn("border-b hover:bg-gray-50", ['review_needed', 'duplicate_warning', 'failed'].includes(receipt.status) && "bg-yellow-50")}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{receipt.fileName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <p>{receipt.uploadDate.split(' ')[0]}</p>
                      <p className="text-xs text-gray-400">{receipt.uploadedBy}</p>
                    </td>
                    <td className="p-4 text-sm font-medium">{receipt.extractedData?.vendor || '-'}</td>
                    <td className="p-4 text-sm font-medium">
                      {receipt.extractedData?.amount ? `$${receipt.extractedData.amount.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{receipt.extractedData?.date || '-'}</td>
                    <td className="p-4">
                      {receipt.confidence !== null ? (
                        <span className={cn("font-medium", getConfidenceColor(receipt.confidence))}>
                          {receipt.confidence}%
                        </span>
                      ) : (
                        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                      )}
                    </td>
                    <td className="p-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit", statusConfig[receipt.status].color)}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[receipt.status].label}
                      </span>
                    </td>
                    <td className="p-4">
                      {receipt.matched ? (
                        <span className="text-xs text-green-600">{receipt.transactionId}</span>
                      ) : (
                        <span className="text-xs text-gray-400">Unmatched</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                        {receipt.status === 'failed' && (
                          <Button size="sm" variant="ghost" className="text-blue-600"><RefreshCw className="w-4 h-4" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Unmatched Transactions Tab */}
      {activeTab === 'unmatched' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Receipt Policy Reminder</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Receipts required within 48 hours of transaction</li>
              <li>• Transactions over $25 require itemized receipt</li>
              <li>• Missing receipts after 7 days are flagged to manager</li>
              <li>• Repeated missing receipts may result in card suspension</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4">Transaction Date</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Card</th>
                  <th className="p-4">Days Pending</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUnmatchedTransactions.map((txn) => (
                  <tr key={txn.id} className={cn("border-b hover:bg-gray-50", txn.daysPending > 3 && "bg-red-50")}>
                    <td className="p-4 text-sm">{txn.date}</td>
                    <td className="p-4 text-sm font-medium">{txn.vendor}</td>
                    <td className="p-4 text-sm font-medium">${txn.amount.toFixed(2)}</td>
                    <td className="p-4 text-sm text-gray-500">****{txn.cardLast4}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs",
                        txn.daysPending > 3 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                      )}>
                        {txn.daysPending} days
                      </span>
                    </td>
                    <td className="p-4">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Upload className="w-3 h-3 mr-1" />Upload Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Duplicates Tab */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-2">Duplicate Detection Algorithm</h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Same vendor + same amount within 7 days = potential duplicate</li>
              <li>• Image hash matching for identical receipts</li>
              <li>• OCR text similarity scoring</li>
              <li>• All flagged duplicates require manual review before approval</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-4 mb-4">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Potential Duplicate Detected</h3>
                <p className="text-sm text-gray-600">The following receipts appear to be duplicates</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Original (2024-01-30)</p>
                <p className="font-medium">The Capital Grille</p>
                <p className="text-lg font-bold text-gray-900">$187.45</p>
                <p className="text-sm text-gray-600">Uploaded by: Tom Davis</p>
              </div>
              <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                <p className="text-xs text-orange-600 mb-2">Flagged Duplicate (2024-02-02)</p>
                <p className="font-medium">The Capital Grille</p>
                <p className="text-lg font-bold text-gray-900">$187.45</p>
                <p className="text-sm text-gray-600">Uploaded by: Tom Davis</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="text-green-600">Not a Duplicate</Button>
              <Button variant="outline" className="text-red-600">Confirm Duplicate</Button>
              <Button variant="outline">View Both Receipts</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
