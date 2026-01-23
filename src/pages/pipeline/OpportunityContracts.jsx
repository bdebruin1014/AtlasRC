import React, { useState } from 'react';
import { FileText, Plus, Download, Send, Eye, Clock, CheckCircle, AlertCircle, FileSignature, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function OpportunityContracts() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const [contracts, setContracts] = useState([
    {
      id: '1',
      name: 'Purchase Agreement - 600 Heritage Way',
      template: 'Land Purchase Agreement',
      status: 'signed',
      createdDate: '2025-01-08',
      sentDate: '2025-01-10',
      signedDate: '2025-01-11',
      purchasePrice: 2000000,
      earnestMoney: 50000,
      ddPeriod: 30,
      closingDate: '2025-02-28',
    },
    {
      id: '2',
      name: 'Due Diligence Extension Amendment',
      template: 'Amendment',
      status: 'pending',
      createdDate: '2025-01-12',
      sentDate: '2025-01-12',
      signedDate: null,
      purchasePrice: null,
      earnestMoney: null,
      ddPeriod: 15,
      closingDate: null,
    },
  ]);

  const [newContract, setNewContract] = useState({
    template: '',
    purchasePrice: '',
    earnestMoney: '',
    ddPeriod: '30',
    closingDate: '',
    specialTerms: '',
  });

  const templates = [
    { id: 'land-purchase', name: 'Land Purchase Agreement', description: 'Standard land acquisition contract' },
    { id: 'lot-purchase', name: 'Lot Purchase Agreement', description: 'For individual lot purchases' },
    { id: 'option', name: 'Option Agreement', description: 'Option to purchase with earnest money' },
    { id: 'amendment', name: 'Amendment', description: 'Modify existing contract terms' },
    { id: 'assignment', name: 'Assignment Agreement', description: 'Assign contract to another party' },
    { id: 'termination', name: 'Termination Notice', description: 'Terminate existing contract' },
  ];

  const handleCreateContract = () => {
    if (!newContract.template) {
      toast({ title: 'Error', description: 'Please select a template', variant: 'destructive' });
      return;
    }

    const template = templates.find(t => t.id === newContract.template);
    const contract = {
      id: String(Date.now()),
      name: `${template?.name} - Draft`,
      template: template?.name || '',
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      sentDate: null,
      signedDate: null,
      purchasePrice: parseFloat(newContract.purchasePrice) || null,
      earnestMoney: parseFloat(newContract.earnestMoney) || null,
      ddPeriod: parseInt(newContract.ddPeriod) || 30,
      closingDate: newContract.closingDate || null,
    };

    setContracts(prev => [contract, ...prev]);
    setShowCreateDialog(false);
    setNewContract({ template: '', purchasePrice: '', earnestMoney: '', ddPeriod: '30', closingDate: '', specialTerms: '' });
    toast({ title: 'Contract Created', description: 'Draft contract has been created.' });
  };

  const handleSendForSignature = (contractId) => {
    setContracts(prev => prev.map(c =>
      c.id === contractId ? { ...c, status: 'pending', sentDate: new Date().toISOString().split('T')[0] } : c
    ));
    toast({ title: 'Sent for Signature', description: 'Contract has been sent for e-signature.' });
  };

  const handleDeleteContract = (contractId) => {
    if (!confirm('Delete this contract draft?')) return;
    setContracts(prev => prev.filter(c => c.id !== contractId));
    toast({ title: 'Deleted', description: 'Contract has been deleted.' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: { className: 'bg-gray-100 text-gray-800', icon: FileText },
      pending: { className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      signed: { className: 'bg-green-100 text-green-800', icon: CheckCircle },
      expired: { className: 'bg-red-100 text-red-800', icon: AlertCircle },
      terminated: { className: 'bg-red-100 text-red-800', icon: AlertCircle },
    };
    return styles[status] || styles.draft;
  };

  const formatCurrency = (num) => num ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num) : '—';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Contracts</h2>
          <p className="text-sm text-gray-500">Manage purchase agreements and contract documents</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-1" /> Create Contract
        </Button>
      </div>

      {/* Contract Templates */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-medium mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {templates.slice(0, 3).map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setNewContract({ ...newContract, template: template.id });
                setShowCreateDialog(true);
              }}
              className="p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <FileText className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="font-medium text-sm">{template.name}</p>
              <p className="text-xs text-gray-500">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        <h3 className="font-medium">Contract History</h3>
        {contracts.map((contract) => {
          const statusInfo = getStatusBadge(contract.status);
          const StatusIcon = statusInfo.icon;
          return (
            <div key={contract.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    contract.status === 'signed' ? "bg-green-100" : contract.status === 'pending' ? "bg-yellow-100" : "bg-gray-100"
                  )}>
                    <FileSignature className={cn(
                      "w-6 h-6",
                      contract.status === 'signed' ? "text-green-600" : contract.status === 'pending' ? "text-yellow-600" : "text-gray-500"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{contract.name}</h4>
                      <Badge className={statusInfo.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {contract.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">Template: {contract.template}</p>

                    <div className="grid grid-cols-4 gap-6 mt-3">
                      {contract.purchasePrice && (
                        <div>
                          <p className="text-xs text-gray-500">Purchase Price</p>
                          <p className="font-medium">{formatCurrency(contract.purchasePrice)}</p>
                        </div>
                      )}
                      {contract.earnestMoney && (
                        <div>
                          <p className="text-xs text-gray-500">Earnest Money</p>
                          <p className="font-medium">{formatCurrency(contract.earnestMoney)}</p>
                        </div>
                      )}
                      {contract.ddPeriod && (
                        <div>
                          <p className="text-xs text-gray-500">DD Period</p>
                          <p className="font-medium">{contract.ddPeriod} days</p>
                        </div>
                      )}
                      {contract.closingDate && (
                        <div>
                          <p className="text-xs text-gray-500">Closing Date</p>
                          <p className="font-medium">{contract.closingDate}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>Created: {contract.createdDate}</span>
                      {contract.sentDate && <span>Sent: {contract.sentDate}</span>}
                      {contract.signedDate && <span>Signed: {contract.signedDate}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                  {contract.status === 'signed' && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" /> Download
                    </Button>
                  )}
                  {contract.status === 'draft' && (
                    <>
                      <Button size="sm" className="bg-[#047857] hover:bg-[#065f46]" onClick={() => handleSendForSignature(contract.id)}>
                        <Send className="w-4 h-4 mr-1" /> Send
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteContract(contract.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {contracts.length === 0 && (
          <div className="bg-white border rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No contracts yet</p>
            <p className="text-gray-400 text-sm mt-2">Create a contract from a template to get started</p>
          </div>
        )}
      </div>

      {/* Create Contract Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create Contract</DialogTitle>
            <DialogDescription>Generate a new contract from a template</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Contract Template</Label>
              <Select value={newContract.template} onValueChange={(v) => setNewContract({ ...newContract, template: v })}>
                <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {['land-purchase', 'lot-purchase', 'option'].includes(newContract.template) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Purchase Price ($)</Label>
                    <Input
                      type="number"
                      value={newContract.purchasePrice}
                      onChange={(e) => setNewContract({ ...newContract, purchasePrice: e.target.value })}
                      placeholder="2000000"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Earnest Money ($)</Label>
                    <Input
                      type="number"
                      value={newContract.earnestMoney}
                      onChange={(e) => setNewContract({ ...newContract, earnestMoney: e.target.value })}
                      placeholder="50000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Due Diligence Period (days)</Label>
                    <Select value={newContract.ddPeriod} onValueChange={(v) => setNewContract({ ...newContract, ddPeriod: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="45">45 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Closing Date</Label>
                    <Input
                      type="date"
                      value={newContract.closingDate}
                      onChange={(e) => setNewContract({ ...newContract, closingDate: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label>Special Terms (optional)</Label>
              <Textarea
                value={newContract.specialTerms}
                onChange={(e) => setNewContract({ ...newContract, specialTerms: e.target.value })}
                placeholder="Any special terms or conditions to include..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateContract} className="bg-[#047857] hover:bg-[#065f46]">
              Create Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
