import React, { useState } from 'react';
import {
  CheckCircle, XCircle, Clock, AlertTriangle, Search, Filter,
  Eye, ThumbsUp, ThumbsDown, MessageSquare, DollarSign, Building2,
  Calendar, FileText, User, ChevronDown, Send, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const BillApprovalWorkflowPage = () => {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const [bills, setBills] = useState([
    {
      id: 'BILL-2024-0892',
      vendor: 'Smith Construction',
      vendorId: 1,
      description: 'Construction Draw #5 - Watson House',
      amount: 85000,
      billDate: '2024-12-27',
      dueDate: '2025-01-26',
      entity: 'Watson Creek LLC',
      project: 'Watson House',
      status: 'pending',
      submittedBy: 'Sarah Johnson',
      submittedAt: '2024-12-27T10:30:00',
      approvalLevel: 1,
      requiredLevel: 2,
      approvers: [
        { name: 'John Smith', role: 'Project Manager', status: 'pending', threshold: 50000 },
        { name: 'Michael Chen', role: 'Controller', status: 'pending', threshold: 100000 },
      ],
      lineItems: [
        { description: 'Framing - Phase 2', amount: 45000 },
        { description: 'Electrical Rough-in', amount: 25000 },
        { description: 'HVAC Installation', amount: 15000 },
      ],
    },
    {
      id: 'BILL-2024-0891',
      vendor: 'ABC Supplies',
      vendorId: 2,
      description: 'Plumbing Materials - Oslo Ridge',
      amount: 12500,
      billDate: '2024-12-26',
      dueDate: '2025-01-25',
      entity: 'Oslo Ridge LLC',
      project: 'Oslo Townhomes',
      status: 'pending',
      submittedBy: 'Emily Davis',
      submittedAt: '2024-12-26T14:15:00',
      approvalLevel: 1,
      requiredLevel: 1,
      approvers: [
        { name: 'John Smith', role: 'Project Manager', status: 'pending', threshold: 50000 },
      ],
      lineItems: [
        { description: 'Copper Piping', amount: 8000 },
        { description: 'Fixtures', amount: 4500 },
      ],
    },
    {
      id: 'BILL-2024-0890',
      vendor: 'Ferguson Supply',
      vendorId: 3,
      description: 'HVAC Equipment - Cedar Mill',
      amount: 48500,
      billDate: '2024-12-25',
      dueDate: '2025-01-24',
      entity: 'VanRock Holdings',
      project: 'Cedar Mill Apartments',
      status: 'approved',
      submittedBy: 'Sarah Johnson',
      submittedAt: '2024-12-25T09:00:00',
      approvedAt: '2024-12-26T11:30:00',
      approvedBy: 'John Smith',
      approvalLevel: 1,
      requiredLevel: 1,
      approvers: [
        { name: 'John Smith', role: 'Project Manager', status: 'approved', approvedAt: '2024-12-26T11:30:00' },
      ],
      lineItems: [
        { description: 'HVAC Units', amount: 38500 },
        { description: 'Installation Materials', amount: 10000 },
      ],
    },
    {
      id: 'BILL-2024-0889',
      vendor: 'Legal Partners LLP',
      vendorId: 4,
      description: 'Legal Fees - Contract Review',
      amount: 15000,
      billDate: '2024-12-24',
      dueDate: '2025-01-23',
      entity: 'VanRock Holdings',
      project: null,
      status: 'rejected',
      submittedBy: 'Michael Brown',
      submittedAt: '2024-12-24T16:00:00',
      rejectedAt: '2024-12-25T10:00:00',
      rejectedBy: 'Michael Chen',
      rejectReason: 'Invoice amount does not match contract terms. Please verify with vendor.',
      approvalLevel: 0,
      requiredLevel: 1,
      approvers: [
        { name: 'Michael Chen', role: 'Controller', status: 'rejected', rejectedAt: '2024-12-25T10:00:00' },
      ],
      lineItems: [
        { description: 'Contract Review Services', amount: 15000 },
      ],
    },
    {
      id: 'BILL-2024-0888',
      vendor: 'City Utilities',
      vendorId: 5,
      description: 'Monthly Utilities - All Properties',
      amount: 8750,
      billDate: '2024-12-23',
      dueDate: '2025-01-07',
      entity: 'ManageCo',
      project: null,
      status: 'pending',
      submittedBy: 'Emily Davis',
      submittedAt: '2024-12-23T08:30:00',
      approvalLevel: 1,
      requiredLevel: 1,
      approvers: [
        { name: 'John Smith', role: 'Operations Manager', status: 'pending', threshold: 25000 },
      ],
      lineItems: [
        { description: 'Electricity', amount: 5200 },
        { description: 'Water/Sewer', amount: 2100 },
        { description: 'Gas', amount: 1450 },
      ],
    },
  ]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending Approval' };
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' };
      case 'partial':
        return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Partially Approved' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown' };
    }
  };

  const filteredBills = bills.filter(bill => {
    if (filterStatus !== 'all' && bill.status !== filterStatus) return false;
    if (searchTerm && !bill.vendor.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !bill.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const pendingCount = bills.filter(b => b.status === 'pending').length;
  const pendingAmount = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0);
  const approvedCount = bills.filter(b => b.status === 'approved').length;
  const rejectedCount = bills.filter(b => b.status === 'rejected').length;

  const handleApprove = () => {
    setBills(prev => prev.map(bill =>
      bill.id === selectedBill.id
        ? {
            ...bill,
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy: 'Current User',
            approvalComment: approvalComment,
            approvers: bill.approvers.map(a =>
              a.status === 'pending'
                ? { ...a, status: 'approved', approvedAt: new Date().toISOString() }
                : a
            ),
          }
        : bill
    ));

    toast({
      title: 'Bill Approved',
      description: `${selectedBill.id} has been approved and is ready for payment.`,
    });

    setShowApprovalDialog(false);
    setSelectedBill(null);
    setApprovalComment('');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason Required',
        description: 'Please provide a reason for rejecting this bill.',
      });
      return;
    }

    setBills(prev => prev.map(bill =>
      bill.id === selectedBill.id
        ? {
            ...bill,
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejectedBy: 'Current User',
            rejectReason: rejectReason,
            approvers: bill.approvers.map(a =>
              a.status === 'pending'
                ? { ...a, status: 'rejected', rejectedAt: new Date().toISOString() }
                : a
            ),
          }
        : bill
    ));

    toast({
      title: 'Bill Rejected',
      description: `${selectedBill.id} has been rejected and sent back for review.`,
    });

    setShowRejectDialog(false);
    setSelectedBill(null);
    setRejectReason('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bill Approval Workflow</h1>
          <p className="text-gray-600">Review and approve vendor bills</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending Approval</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-xs text-amber-600 mt-2">${pendingAmount.toLocaleString()} total</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              <p className="text-sm text-gray-600">Approved Today</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">$50K</p>
              <p className="text-sm text-gray-600">Your Approval Limit</p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search bills..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected', 'all'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={filterStatus === status ? 'bg-[#047857] hover:bg-[#065f46]' : ''}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {filteredBills.map((bill) => {
          const config = getStatusConfig(bill.status);
          const StatusIcon = config.icon;

          return (
            <div
              key={bill.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={cn("p-3 rounded-lg", config.bg)}>
                    <StatusIcon className={cn("w-6 h-6", config.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-[#047857]">{bill.id}</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs", config.bg, config.color)}>
                        {config.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{bill.vendor}</h3>
                    <p className="text-sm text-gray-600">{bill.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />{bill.entity}
                      </span>
                      {bill.project && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />{bill.project}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />Due: {bill.dueDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />By: {bill.submittedBy}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${bill.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{bill.lineItems.length} line items</p>
                  </div>

                  {bill.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => { setSelectedBill(bill); setShowApprovalDialog(true); }}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { setSelectedBill(bill); setShowRejectDialog(true); }}
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />Reject
                      </Button>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />Add Comment
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="w-4 h-4 mr-2" />View Attachments
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Approval Chain */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Approval Chain</p>
                <div className="flex items-center gap-2">
                  {bill.approvers.map((approver, idx) => (
                    <React.Fragment key={idx}>
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                        approver.status === 'approved' && "bg-green-100 text-green-700",
                        approver.status === 'rejected' && "bg-red-100 text-red-700",
                        approver.status === 'pending' && "bg-gray-100 text-gray-600"
                      )}>
                        {approver.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {approver.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {approver.status === 'pending' && <Clock className="w-3 h-3" />}
                        <span>{approver.name}</span>
                        <span className="text-xs opacity-75">({approver.role})</span>
                      </div>
                      {idx < bill.approvers.length - 1 && (
                        <ChevronDown className="w-4 h-4 text-gray-300 rotate-[-90deg]" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Rejection Reason */}
              {bill.status === 'rejected' && bill.rejectReason && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {bill.rejectReason}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Approve Bill
            </DialogTitle>
            <DialogDescription>
              Review and approve {selectedBill?.id} for ${selectedBill?.amount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vendor:</span>
                  <span className="font-medium">{selectedBill.vendor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-semibold text-green-600">${selectedBill.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Due Date:</span>
                  <span>{selectedBill.dueDate}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Comment (optional)</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Add any notes or comments..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
              <CheckCircle className="w-4 h-4 mr-1" />Approve Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Reject Bill
            </DialogTitle>
            <DialogDescription>
              Reject {selectedBill?.id} and send back for review
            </DialogDescription>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vendor:</span>
                  <span className="font-medium">{selectedBill.vendor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-semibold">${selectedBill.amount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Reason for rejection *</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Explain why this bill is being rejected..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  The submitter will be notified of the rejection and the reason provided.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectReason(''); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="w-4 h-4 mr-1" />Reject Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillApprovalWorkflowPage;
