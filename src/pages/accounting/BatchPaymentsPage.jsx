// src/pages/accounting/BatchPaymentsPage.jsx
// Batch payment processing for AP

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard, CheckCircle2, Clock, DollarSign, FileText, Plus,
  Printer, Send, AlertTriangle, Building2, Calendar, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  getBills,
  getPaymentBatches,
  createPaymentBatch,
  processPaymentBatch,
  getEarlyPaymentOpportunities,
  BILL_STATUS,
} from '@/services/accountingEnhancedService';

const BatchPaymentsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [batches, setBatches] = useState([]);
  const [earlyPaymentOps, setEarlyPaymentOps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBills, setSelectedBills] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [checkStartNumber, setCheckStartNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('bills');
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [entityId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [billsData, batchesData, earlyOps] = await Promise.all([
        getBills(entityId, { status: BILL_STATUS.APPROVED }),
        getPaymentBatches(entityId),
        getEarlyPaymentOpportunities(entityId),
      ]);
      setBills(billsData || []);
      setBatches(batchesData || []);
      setEarlyPaymentOps(earlyOps || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBill = (billId) => {
    setSelectedBills(prev => 
      prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBills.length === bills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(bills.map(b => b.id));
    }
  };

  const handleCreateBatch = async () => {
    try {
      await createPaymentBatch(entityId, selectedBills, paymentDate, null);
      setShowCreateModal(false);
      setSelectedBills([]);
      loadData();
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const handleProcessBatch = async () => {
    try {
      await processPaymentBatch(selectedBatch.id, checkStartNumber ? parseInt(checkStartNumber) : null);
      setShowProcessModal(false);
      setSelectedBatch(null);
      loadData();
    } catch (error) {
      console.error('Error processing batch:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const selectedTotal = bills
    .filter(b => selectedBills.includes(b.id))
    .reduce((sum, b) => sum + b.balance_due, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-green-600" />
            Batch Payments
          </h1>
          <p className="text-gray-500 mt-1">Process multiple bill payments at once</p>
        </div>
        {selectedBills.length > 0 && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Batch ({selectedBills.length} bills)
          </Button>
        )}
      </div>

      {/* Early Payment Opportunities */}
      {earlyPaymentOps.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800">
                  {earlyPaymentOps.length} Early Payment Discount{earlyPaymentOps.length > 1 ? 's' : ''} Available
                </p>
                <p className="text-sm text-green-700">
                  Save {formatCurrency(earlyPaymentOps.reduce((sum, op) => sum + op.savings, 0))} by paying early
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-green-400 text-green-700">
                View Discounts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          className={cn(
            "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'bills' 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
          onClick={() => setActiveTab('bills')}
        >
          Approved Bills ({bills.length})
        </button>
        <button
          className={cn(
            "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'batches' 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
          onClick={() => setActiveTab('batches')}
        >
          Payment Batches ({batches.length})
        </button>
      </div>

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <Checkbox 
                      checked={selectedBills.length === bills.length && bills.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Vendor</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Bill #</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Due Date</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bills.map((bill) => {
                  const hasDiscount = bill.discount_amount > 0 && 
                    new Date(bill.discount_date) > new Date();
                  
                  return (
                    <tr 
                      key={bill.id} 
                      className={cn(
                        "hover:bg-gray-50",
                        selectedBills.includes(bill.id) && "bg-blue-50"
                      )}
                    >
                      <td className="px-4 py-3">
                        <Checkbox 
                          checked={selectedBills.includes(bill.id)}
                          onCheckedChange={() => handleSelectBill(bill.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="font-medium">
                            {bill.vendor?.company_name || bill.vendor?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{bill.bill_number}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          new Date(bill.due_date) < new Date() && "text-red-600 font-medium"
                        )}>
                          {formatDate(bill.due_date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(bill.balance_due)}
                      </td>
                      <td className="px-4 py-3">
                        {hasDiscount && (
                          <Badge className="bg-green-100 text-green-800">
                            Save {formatCurrency(bill.discount_amount)}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {bills.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No approved bills ready for payment</p>
                    </td>
                  </tr>
                )}
              </tbody>
              {selectedBills.length > 0 && (
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right font-medium">
                      Selected Total ({selectedBills.length} bills):
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-lg">
                      {formatCurrency(selectedTotal)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </CardContent>
        </Card>
      )}

      {/* Batches Tab */}
      {activeTab === 'batches' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Batch Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Bills</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Processed</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(batch.batch_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3">{batch.bill_count} bills</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(batch.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        batch.status === 'processed' && "bg-green-100 text-green-800",
                        batch.status === 'pending' && "bg-yellow-100 text-yellow-800",
                      )}>
                        {batch.status === 'processed' ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" /> Processed</>
                        ) : (
                          <><Clock className="w-3 h-3 mr-1" /> Pending</>
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {batch.processed_at ? formatDate(batch.processed_at) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {batch.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedBatch(batch);
                            setShowProcessModal(true);
                          }}
                        >
                          <Printer className="w-4 h-4 mr-1" />
                          Process
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {batches.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No payment batches yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Create Batch Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Payment Batch</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Bills Selected:</span>
                <span className="font-medium">{selectedBills.length}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Total Amount:</span>
                <span className="font-bold">{formatCurrency(selectedTotal)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBatch}>
              Create Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Batch Modal */}
      <Dialog open={showProcessModal} onOpenChange={setShowProcessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment Batch</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Starting Check Number (Optional)</label>
              <input
                type="number"
                value={checkStartNumber}
                onChange={(e) => setCheckStartNumber(e.target.value)}
                placeholder="e.g., 1001"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave blank if not printing checks
              </p>
            </div>
            
            {selectedBatch && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Bills to Process:</span>
                  <span className="font-medium">{selectedBatch.bill_count}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Total Amount:</span>
                  <span className="font-bold">{formatCurrency(selectedBatch.total_amount)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessBatch}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Process Payments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchPaymentsPage;
