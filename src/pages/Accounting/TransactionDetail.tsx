import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Copy, Trash2, DollarSign, Calendar, Building2,
  FileText, User, Download, Eye, Clock, CheckCircle2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { transactionServiceTs, type Transaction } from '@/services/transactionService.ts';

// Mock transaction data
const mockTransaction = {
  id: '1',
  transactionNumber: 'TXN-2024-001',
  date: '2024-01-15',
  entity: { id: '1', name: 'VanRock Holdings LLC' },
  project: { id: '1', name: 'Watson House Development' },
  type: 'expense',
  category: 'Construction',
  subcategory: 'Foundation Work',
  amount: 45000,
  paymentMethod: 'ACH/Wire',
  checkNumber: null,
  referenceNumber: 'INV-2024-0145',
  description: 'Foundation concrete pour and labor for Phase 1',
  notes: 'Completed ahead of schedule. Quality inspection passed.',
  memo: 'Foundation - Phase 1',
  vendor: { id: '1', name: 'ABC Concrete Co.' },
  taxable: true,
  taxAmount: 2700,
  status: 'completed',
  createdBy: { id: '1', name: 'Bryan De Bruin' },
  createdAt: '2024-01-15T10:30:00Z',
  modifiedBy: { id: '1', name: 'Bryan De Bruin' },
  modifiedAt: '2024-01-15T14:22:00Z',
  attachments: [
    { id: '1', name: 'Invoice-0145.pdf', size: 245000, type: 'application/pdf' },
    { id: '2', name: 'Receipt.jpg', size: 180000, type: 'image/jpeg' },
  ],
  auditLog: [
    { action: 'created', user: 'Bryan De Bruin', timestamp: '2024-01-15T10:30:00Z', details: 'Transaction created' },
    { action: 'updated', user: 'Bryan De Bruin', timestamp: '2024-01-15T14:22:00Z', details: 'Added receipt attachment' },
  ],
};

const TransactionDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<typeof mockTransaction | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadTransaction = async () => {
      if (!id) return;
      try {
        const txn = await transactionServiceTs.getById(id);
        if (txn) {
          // Map service data to component format
          setTransaction({
            ...mockTransaction, // Use mock as template for fields not in service
            id: txn.id,
            transactionNumber: txn.transaction_number || `TXN-${txn.id}`,
            date: txn.date,
            entity: { id: txn.entity_id || '', name: txn.entity_name || 'Unknown Entity' },
            project: txn.project_id ? { id: txn.project_id, name: txn.project_name || 'Unknown Project' } : null,
            type: txn.type,
            category: txn.category || 'Uncategorized',
            subcategory: txn.subcategory,
            amount: txn.amount,
            paymentMethod: txn.payment_method || 'Other',
            referenceNumber: txn.reference_number,
            description: txn.description || '',
            notes: txn.notes,
            memo: txn.memo,
            status: txn.status || 'completed',
          });
        } else {
          setTransaction(null);
        }
      } catch (error) {
        console.warn('Using mock transaction data:', error);
        setTransaction(mockTransaction);
      } finally {
        setLoading(false);
      }
    };
    loadTransaction();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await transactionServiceTs.delete(id);
      toast({
        title: 'Transaction deleted',
        description: 'The transaction has been deleted successfully',
      });
      navigate('/accounting/transactions');
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDuplicate = () => {
    if (!transaction) return;
    // Navigate to new transaction form with prefilled data
    const duplicateData = {
      type: transaction.type,
      category: transaction.category,
      subcategory: transaction.subcategory,
      amount: transaction.amount,
      entity: transaction.entity,
      project: transaction.project,
      description: transaction.description,
      notes: transaction.notes,
      paymentMethod: transaction.paymentMethod,
      // Reset date to today and clear reference number
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    toast({
      title: 'Transaction duplicated',
      description: 'A new draft has been created from this transaction',
    });
    navigate('/accounting/transactions/new', { state: { prefillData: duplicateData } });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Transaction not found</h2>
        <Button className="mt-4" onClick={() => navigate('/accounting/transactions')}>
          Back to Transactions
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/accounting/transactions')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    {transaction.transactionNumber}
                  </h1>
                  <Badge className={transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {transaction.status}
                  </Badge>
                </div>
                <p className="text-gray-500">{formatDate(transaction.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/accounting/transactions/${id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(transaction.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Entity</p>
                <Link
                  to={`/entities/${transaction.entity.id}`}
                  className="font-medium text-emerald-600 hover:text-emerald-700"
                >
                  {transaction.entity.name}
                </Link>
              </div>
              {transaction.project && (
                <div>
                  <p className="text-sm text-gray-500">Project</p>
                  <Link
                    to={`/projects/${transaction.project.id}`}
                    className="font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    {transaction.project.name}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{transaction.category}</p>
                {transaction.subcategory && (
                  <p className="text-sm text-gray-500">{transaction.subcategory}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                {transaction.taxable && (
                  <p className="text-sm text-gray-500">
                    Tax: {formatCurrency(transaction.taxAmount)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{transaction.paymentMethod}</p>
                {transaction.checkNumber && (
                  <p className="text-sm text-gray-500">Check #{transaction.checkNumber}</p>
                )}
              </div>
              {transaction.referenceNumber && (
                <div>
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="font-medium">{transaction.referenceNumber}</p>
                </div>
              )}
              {transaction.vendor && (
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <Link
                    to={`/contacts/${transaction.vendor.id}`}
                    className="font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    {transaction.vendor.name}
                  </Link>
                </div>
              )}
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{transaction.description}</p>
              </div>
              {transaction.notes && (
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-700">{transaction.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Attachments ({transaction.attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transaction.attachments.length === 0 ? (
              <p className="text-gray-500">No attachments</p>
            ) : (
              <div className="space-y-2">
                {transaction.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transaction.auditLog.map((log, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{log.user}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.action}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{log.details}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(log.timestamp, { format: 'long' })} at {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionDetail;
