import React from 'react';
import { 
  X, Edit, Trash2, CheckCircle, Printer, Download,
  Building2, Calendar, DollarSign, FileText, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
  void: { label: 'Void', color: 'bg-gray-100 text-gray-500' },
};

const BillDetailDrawer = ({ isOpen, onClose, bill, onEdit, onPay, onDelete }) => {
  if (!bill) return null;

  const status = statusConfig[bill.status] || statusConfig.pending;
  const isPaid = bill.status === 'paid';
  const isVoid = bill.status === 'void';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Bill Details</SheetTitle>
            <Badge className={cn('text-sm', status.color)}>{status.label}</Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Bill Header */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{bill.vendor_name}</p>
                <p className="text-sm text-gray-500">{bill.bill_number}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Bill Date</p>
                <p className="font-medium">{formatDate(bill.bill_date)}</p>
              </div>
              <div>
                <p className="text-gray-500">Due Date</p>
                <p className={cn("font-medium", bill.status === 'overdue' && "text-red-600")}>
                  {formatDate(bill.due_date)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Terms</p>
                <p className="font-medium">Net {bill.terms || 30}</p>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium text-lg">{formatCurrency(bill.amount)}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {bill.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
              <p className="text-gray-900">{bill.description}</p>
            </div>
          )}

          {/* Line Items */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Line Items</h4>
            <div className="border rounded-lg overflow-hidden">
              {(bill.line_items || []).map((item, index) => (
                <div key={index} className="flex justify-between p-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.description || 'Line item'}</p>
                    <p className="text-sm text-gray-500">{item.account_name || `Account ${item.account_id}`}</p>
                  </div>
                  <p className="font-mono">{formatCurrency(item.amount)}</p>
                </div>
              ))}
              {(!bill.line_items || bill.line_items.length === 0) && (
                <div className="p-3 text-gray-500 text-center">No line items</div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          {isPaid && bill.payments && bill.payments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Payment History</h4>
              <div className="border rounded-lg overflow-hidden">
                {bill.payments.map((payment, index) => (
                  <div key={index} className="flex justify-between p-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(payment.date)}</p>
                      <p className="text-sm text-gray-500">{payment.method}</p>
                    </div>
                    <p className="font-mono text-green-600">{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Balance */}
          {!isPaid && !isVoid && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-yellow-800">Balance Due</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {formatCurrency(bill.balance || bill.amount)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          )}

          {/* Memo */}
          {bill.memo && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Internal Notes</h4>
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{bill.memo}</p>
            </div>
          )}

          {/* Actions */}
          <Separator />
          
          <div className="flex flex-wrap gap-2">
            {!isPaid && !isVoid && (
              <Button 
                onClick={() => onPay?.(bill)} 
                className="bg-[#2F855A] hover:bg-[#276749] flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Record Payment
              </Button>
            )}
            
            <Button variant="outline" onClick={() => onEdit?.(bill)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>

          {!isVoid && (
            <Button 
              variant="ghost" 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete?.(bill)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Void Bill
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BillDetailDrawer;
