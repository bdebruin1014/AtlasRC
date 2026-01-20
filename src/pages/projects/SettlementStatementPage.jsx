/**
 * Atlas - Settlement Statement Page
 * Record and manage settlement/closing statements for sales transactions:
 * - HUD-1/ALTA Settlement Statements
 * - Closing cost breakdowns
 * - Net proceeds calculations
 * - Fund tracking
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, DollarSign, Calendar, FileText, CheckCircle2, Clock, 
  AlertCircle, Download, Upload, Plus, Trash2, Edit2, Building2, Users,
  Calculator, CreditCard, Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SettlementStatementPage = () => {
  const { projectId, settlementId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(!settlementId);

  // Settlement form state
  const [settlement, setSettlement] = useState({
    settlementNumber: settlementId || '',
    contractId: '',
    takedownNumber: null,
    status: 'pending',
    seller: { name: 'VanRock Holdings LLC', entity: 'VanRock Holdings LLC' },
    buyer: { name: '', entity: '' },
    propertyDescription: '',
    unitsConveyed: 0,
    lotNumbers: '',
    closingDate: '',
    closingTime: '',
    titleCompany: '',
    escrowOfficer: '',
    escrowNumber: '',
    grossSalePrice: 0,
    sellerCharges: [
      { id: 1, category: 'Commission', description: 'Real Estate Commission', amount: 0, percentage: 3 },
      { id: 2, category: 'Title', description: 'Title Insurance - Owner Policy', amount: 0, percentage: 0 },
      { id: 3, category: 'Title', description: 'Settlement Fee', amount: 0, percentage: 0 },
      { id: 4, category: 'Recording', description: 'Recording Fees', amount: 0, percentage: 0 },
      { id: 5, category: 'Taxes', description: 'Transfer Tax / Deed Stamps', amount: 0, percentage: 0 },
      { id: 6, category: 'HOA', description: 'HOA Transfer Fee', amount: 0, percentage: 0 },
      { id: 7, category: 'Payoff', description: 'Existing Loan Payoff', amount: 0, percentage: 0 },
      { id: 8, category: 'Other', description: 'Wire Fee', amount: 0, percentage: 0 }
    ],
    sellerCredits: [
      { id: 1, description: 'Contract Sales Price', amount: 0 },
      { id: 2, description: 'Earnest Money Deposit', amount: 0 }
    ],
    fundsReceived: false,
    fundReceivedDate: '',
    fundReceivedAmount: 0,
    wireConfirmation: '',
    notes: '',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString()
  });

  const chargeCategories = ['Commission', 'Title', 'Recording', 'Taxes', 'HOA', 'Payoff', 'Repairs', 'Credits', 'Other'];

  const totals = useMemo(() => {
    const totalDebits = settlement.sellerCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    const totalCredits = settlement.sellerCredits.reduce((sum, credit) => sum + (credit.amount || 0), 0);
    return { totalDebits, totalCredits, netToSeller: totalCredits - totalDebits };
  }, [settlement.sellerCharges, settlement.sellerCredits]);

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  };

  const handleInputChange = (field, value) => {
    setSettlement(prev => ({ ...prev, [field]: value, lastModified: new Date().toISOString() }));
  };

  const handleNestedChange = (parent, field, value) => {
    setSettlement(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value }, lastModified: new Date().toISOString() }));
  };

  const updateCharge = (id, field, value) => {
    setSettlement(prev => ({
      ...prev,
      sellerCharges: prev.sellerCharges.map(charge => charge.id === id ? { ...charge, [field]: value } : charge)
    }));
  };

  const addCharge = () => {
    setSettlement(prev => ({
      ...prev,
      sellerCharges: [...prev.sellerCharges, { id: Date.now(), category: 'Other', description: '', amount: 0, percentage: 0 }]
    }));
  };

  const removeCharge = (id) => {
    setSettlement(prev => ({ ...prev, sellerCharges: prev.sellerCharges.filter(charge => charge.id !== id) }));
  };

  const updateCredit = (id, field, value) => {
    setSettlement(prev => ({
      ...prev,
      sellerCredits: prev.sellerCredits.map(credit => credit.id === id ? { ...credit, [field]: value } : credit)
    }));
  };

  const addCredit = () => {
    setSettlement(prev => ({
      ...prev,
      sellerCredits: [...prev.sellerCredits, { id: Date.now(), description: '', amount: 0 }]
    }));
  };

  const removeCredit = (id) => {
    setSettlement(prev => ({ ...prev, sellerCredits: prev.sellerCredits.filter(credit => credit.id !== id) }));
  };

  const handleSave = () => {
    console.log('Saving settlement:', settlement);
    setIsEditing(false);
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
    { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' }
  ];

  const statusConfig = statusOptions.find(s => s.value === settlement.status);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1" />Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">
                  {settlementId ? `Settlement ${settlement.settlementNumber}` : 'New Settlement Statement'}
                </h1>
                <span className={cn("px-2 py-1 rounded text-xs font-medium", statusConfig?.color)}>
                  {statusConfig?.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {settlement.buyer.entity || 'No buyer assigned'} • {settlement.closingDate || 'Date TBD'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-1" />Edit
                </Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]">
                  <Download className="w-4 h-4 mr-1" />Export HUD
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" />Save Settlement
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Card */}
        <div className="bg-white border rounded-lg p-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Gross Sale Price</p>
              <p className="text-2xl font-bold">{formatCurrency(settlement.grossSalePrice)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 mb-1">Total Charges</p>
              <p className="text-2xl font-bold text-red-600">-{formatCurrency(totals.totalDebits)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Total Credits</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.totalCredits)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 mb-1">Net to Seller</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.netToSeller)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Closing Information */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />Closing Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Settlement #</label>
                  <Input value={settlement.settlementNumber} onChange={(e) => handleInputChange('settlementNumber', e.target.value)} placeholder="SET-001" disabled={!isEditing} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full h-10 px-3 border rounded-md text-sm" value={settlement.status} onChange={(e) => handleInputChange('status', e.target.value)} disabled={!isEditing}>
                    {statusOptions.map(status => (<option key={status.value} value={status.value}>{status.label}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date</label>
                  <Input type="date" value={settlement.closingDate} onChange={(e) => handleInputChange('closingDate', e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                  <Input type="time" value={settlement.closingTime} onChange={(e) => handleInputChange('closingTime', e.target.value)} disabled={!isEditing} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title Company</label>
                <Input value={settlement.titleCompany} onChange={(e) => handleInputChange('titleCompany', e.target.value)} disabled={!isEditing} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escrow Officer</label>
                  <Input value={settlement.escrowOfficer} onChange={(e) => handleInputChange('escrowOfficer', e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escrow Number</label>
                  <Input value={settlement.escrowNumber} onChange={(e) => handleInputChange('escrowNumber', e.target.value)} disabled={!isEditing} />
                </div>
              </div>
            </div>
          </div>

          {/* Property/Units */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-500" />Property Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units/Lots Conveyed</label>
                  <Input type="number" value={settlement.unitsConveyed} onChange={(e) => handleInputChange('unitsConveyed', parseInt(e.target.value) || 0)} disabled={!isEditing} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gross Sale Price</label>
                  <Input type="number" value={settlement.grossSalePrice} onChange={(e) => { handleInputChange('grossSalePrice', parseFloat(e.target.value) || 0); updateCredit(1, 'amount', parseFloat(e.target.value) || 0); }} disabled={!isEditing} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lot Numbers</label>
                <Input value={settlement.lotNumbers} onChange={(e) => handleInputChange('lotNumbers', e.target.value)} placeholder="e.g., Lots 1-8, Block A" disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Description</label>
                <textarea className="w-full h-20 px-3 py-2 border rounded-md text-sm resize-none" value={settlement.propertyDescription} onChange={(e) => handleInputChange('propertyDescription', e.target.value)} disabled={!isEditing} />
              </div>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-gray-500" />Seller</h3>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label><Input value={settlement.seller.entity} onChange={(e) => handleNestedChange('seller', 'entity', e.target.value)} disabled={!isEditing} /></div>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-gray-500" />Buyer</h3>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Entity/Name</label><Input value={settlement.buyer.entity} onChange={(e) => handleNestedChange('buyer', 'entity', e.target.value)} disabled={!isEditing} /></div>
          </div>
        </div>

        {/* Seller Credits */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5 text-green-500" />Seller Credits</h3>
            {isEditing && (<Button size="sm" variant="outline" onClick={addCredit}><Plus className="w-4 h-4 mr-1" />Add Credit</Button>)}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr><th className="text-left px-4 py-2 font-medium">Description</th><th className="text-right px-4 py-2 font-medium">Amount</th>{isEditing && <th className="w-12 px-4 py-2"></th>}</tr>
            </thead>
            <tbody className="divide-y">
              {settlement.sellerCredits.map(credit => (
                <tr key={credit.id}>
                  <td className="px-4 py-2"><Input value={credit.description} onChange={(e) => updateCredit(credit.id, 'description', e.target.value)} disabled={!isEditing} className="h-8" /></td>
                  <td className="px-4 py-2"><Input type="number" value={credit.amount} onChange={(e) => updateCredit(credit.id, 'amount', parseFloat(e.target.value) || 0)} disabled={!isEditing} className="h-8 text-right" /></td>
                  {isEditing && (<td className="px-4 py-2"><Button variant="ghost" size="sm" onClick={() => removeCredit(credit.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></td>)}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-green-50 font-semibold">
              <tr><td className="px-4 py-2 text-green-700">Total Credits</td><td className="px-4 py-2 text-right text-green-700">{formatCurrency(totals.totalCredits)}</td>{isEditing && <td></td>}</tr>
            </tfoot>
          </table>
        </div>

        {/* Seller Charges */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Receipt className="w-5 h-5 text-red-500" />Seller Charges (Debits)</h3>
            {isEditing && (<Button size="sm" variant="outline" onClick={addCharge}><Plus className="w-4 h-4 mr-1" />Add Charge</Button>)}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr><th className="text-left px-4 py-2 font-medium w-32">Category</th><th className="text-left px-4 py-2 font-medium">Description</th><th className="text-right px-4 py-2 font-medium w-24">Rate %</th><th className="text-right px-4 py-2 font-medium w-32">Amount</th>{isEditing && <th className="w-12 px-4 py-2"></th>}</tr>
            </thead>
            <tbody className="divide-y">
              {settlement.sellerCharges.map(charge => (
                <tr key={charge.id}>
                  <td className="px-4 py-2"><select className="h-8 px-2 border rounded text-sm w-full" value={charge.category} onChange={(e) => updateCharge(charge.id, 'category', e.target.value)} disabled={!isEditing}>{chargeCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></td>
                  <td className="px-4 py-2"><Input value={charge.description} onChange={(e) => updateCharge(charge.id, 'description', e.target.value)} disabled={!isEditing} className="h-8" /></td>
                  <td className="px-4 py-2"><Input type="number" step="0.1" value={charge.percentage} onChange={(e) => { const pct = parseFloat(e.target.value) || 0; updateCharge(charge.id, 'percentage', pct); if (pct > 0) updateCharge(charge.id, 'amount', settlement.grossSalePrice * pct / 100); }} disabled={!isEditing} className="h-8 text-right" /></td>
                  <td className="px-4 py-2"><Input type="number" value={charge.amount} onChange={(e) => updateCharge(charge.id, 'amount', parseFloat(e.target.value) || 0)} disabled={!isEditing} className="h-8 text-right" /></td>
                  {isEditing && (<td className="px-4 py-2"><Button variant="ghost" size="sm" onClick={() => removeCharge(charge.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></td>)}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-red-50 font-semibold">
              <tr><td colSpan={3} className="px-4 py-2 text-red-700">Total Charges</td><td className="px-4 py-2 text-right text-red-700">-{formatCurrency(totals.totalDebits)}</td>{isEditing && <td></td>}</tr>
            </tfoot>
          </table>
        </div>

        {/* Net Proceeds Summary */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Calculator className="w-5 h-5 text-gray-500" />Settlement Summary</h3>
          <div className="max-w-md space-y-3">
            <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Total Credits to Seller</span><span className="font-medium">{formatCurrency(totals.totalCredits)}</span></div>
            <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Total Charges (Debits)</span><span className="font-medium text-red-600">-{formatCurrency(totals.totalDebits)}</span></div>
            <div className="flex justify-between py-3 text-lg font-semibold"><span>Net Due to Seller</span><span className="text-green-600">{formatCurrency(totals.netToSeller)}</span></div>
          </div>
        </div>

        {/* Fund Tracking */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-gray-500" />Fund Tracking</h3>
          <div className="grid grid-cols-4 gap-6">
            <div><label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={settlement.fundsReceived} onChange={(e) => handleInputChange('fundsReceived', e.target.checked)} disabled={!isEditing} className="rounded" /><span className="text-sm font-medium">Funds Received</span></label></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label><Input type="date" value={settlement.fundReceivedDate} onChange={(e) => handleInputChange('fundReceivedDate', e.target.value)} disabled={!isEditing || !settlement.fundsReceived} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label><Input type="number" value={settlement.fundReceivedAmount} onChange={(e) => handleInputChange('fundReceivedAmount', parseFloat(e.target.value) || 0)} disabled={!isEditing || !settlement.fundsReceived} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Wire Confirmation</label><Input value={settlement.wireConfirmation} onChange={(e) => handleInputChange('wireConfirmation', e.target.value)} disabled={!isEditing || !settlement.fundsReceived} /></div>
          </div>
          {settlement.fundsReceived && settlement.fundReceivedAmount !== totals.netToSeller && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700"><AlertCircle className="w-4 h-4 inline mr-1" />Amount received ({formatCurrency(settlement.fundReceivedAmount)}) does not match net due to seller ({formatCurrency(totals.netToSeller)})</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Notes</h3>
          <textarea className="w-full h-24 px-3 py-2 border rounded-md text-sm resize-none" value={settlement.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Enter any additional notes..." disabled={!isEditing} />
        </div>
      </div>
    </div>
  );
};

export default SettlementStatementPage;
