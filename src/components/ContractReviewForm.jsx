// src/components/ContractReviewForm.jsx
// Form for reviewing and editing AI-parsed contract data

import React, { useState } from 'react';
import { Save, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContractReviewForm = ({ contractData, onSave, onRetryParse }) => {
  const [formData, setFormData] = useState({
    contract_date: contractData?.contract_date || '',
    effective_date: contractData?.effective_date || '',
    closing_date: contractData?.closing_date || '',
    buyer_name: contractData?.buyer_name || '',
    buyer_entity: contractData?.buyer_entity || '',
    seller_name: contractData?.seller_name || '',
    seller_entity: contractData?.seller_entity || '',
    purchase_price: contractData?.purchase_price || '',
    earnest_money: contractData?.earnest_money || '',
    earnest_money_due_date: contractData?.earnest_money_due_date || '',
    financing_type: contractData?.financing_type || '',
    inspection_period_days: contractData?.inspection_period_days || '',
    inspection_deadline: contractData?.inspection_deadline || '',
    due_diligence_deadline: contractData?.due_diligence_deadline || '',
    status: contractData?.status || 'draft',
    notes: contractData?.notes || '',
  });

  const [saved, setSaved] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    onSave?.(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent text-sm';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
              <input type="text" value={formData.buyer_name} onChange={(e) => updateField('buyer_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Entity</label>
              <input type="text" value={formData.buyer_entity} onChange={(e) => updateField('buyer_entity', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seller Name</label>
              <input type="text" value={formData.seller_name} onChange={(e) => updateField('seller_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seller Entity</label>
              <input type="text" value={formData.seller_entity} onChange={(e) => updateField('seller_entity', e.target.value)} className={inputClass} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Financial Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
              <input type="number" value={formData.purchase_price} onChange={(e) => updateField('purchase_price', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Earnest Money</label>
              <input type="number" value={formData.earnest_money} onChange={(e) => updateField('earnest_money', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Earnest Money Due Date</label>
              <input type="date" value={formData.earnest_money_due_date} onChange={(e) => updateField('earnest_money_due_date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Financing Type</label>
              <select value={formData.financing_type} onChange={(e) => updateField('financing_type', e.target.value)} className={inputClass}>
                <option value="">Select...</option>
                <option value="cash">Cash</option>
                <option value="conventional">Conventional</option>
                <option value="construction">Construction Loan</option>
                <option value="hard_money">Hard Money</option>
                <option value="seller_financing">Seller Financing</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Key Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract Date</label>
              <input type="date" value={formData.contract_date} onChange={(e) => updateField('contract_date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
              <input type="date" value={formData.effective_date} onChange={(e) => updateField('effective_date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date</label>
              <input type="date" value={formData.closing_date} onChange={(e) => updateField('closing_date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Period (Days)</label>
              <input type="number" value={formData.inspection_period_days} onChange={(e) => updateField('inspection_period_days', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Deadline</label>
              <input type="date" value={formData.inspection_deadline} onChange={(e) => updateField('inspection_deadline', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Diligence Deadline</label>
              <input type="date" value={formData.due_diligence_deadline} onChange={(e) => updateField('due_diligence_deadline', e.target.value)} className={inputClass} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status & Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract Status</label>
              <select value={formData.status} onChange={(e) => updateField('status', e.target.value)} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="executed">Executed</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} rows={3} className={inputClass} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onRetryParse} className="text-sm">
          <RotateCcw className="w-4 h-4 mr-2" /> Re-parse Document
        </Button>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={handleSave}>
          {saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>
    </div>
  );
};

export default ContractReviewForm;
