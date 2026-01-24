import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const STAGES = ['Prospecting', 'Contacted', 'Qualified', 'Negotiating', 'Under Contract'];
const OPPORTUNITY_TYPES = [
  { value: 'development-lot-sale', label: 'Development Lot Sale' },
  { value: 'development-for-sale', label: 'Development For Sale' },
  { value: 'development-btr', label: 'Development BTR' },
  { value: 'scattered-lot', label: 'Scattered Lot' },
  { value: 'brrr', label: 'BRRR' },
];

const OpportunityModal = ({ open, onClose, opportunity, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    deal_number: '',
    address: '',
    city: 'Greenville',
    state: 'SC',
    zip_code: '',
    stage: 'Prospecting',
    opportunity_type: 'development-lot-sale',
    estimated_value: '',
    asking_price: '',
    assignment_fee: '',
    seller_name: '',
    seller_phone: '',
    seller_email: '',
    notes: '',
  });

  useEffect(() => {
    if (opportunity) {
      setFormData({
        deal_number: opportunity.deal_number || '',
        address: opportunity.address || '',
        city: opportunity.city || 'Greenville',
        state: opportunity.state || 'SC',
        zip_code: opportunity.zip_code || '',
        stage: opportunity.stage || 'Prospecting',
        opportunity_type: opportunity.opportunity_type || 'development-lot-sale',
        estimated_value: opportunity.estimated_value || '',
        asking_price: opportunity.asking_price || '',
        assignment_fee: opportunity.assignment_fee || '',
        seller_name: opportunity.seller_name || '',
        seller_phone: opportunity.seller_phone || '',
        seller_email: opportunity.seller_email || '',
        notes: opportunity.notes || '',
      });
    } else {
      const year = new Date().getFullYear().toString().slice(-2);
      setFormData(prev => ({
        ...prev,
        deal_number: year + '-001',
      }));
    }
  }, [opportunity, 
    
    open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
      asking_price: formData.asking_price ? parseFloat(formData.asking_price) : null,
      assignment_fee: formData.assignment_fee ? parseFloat(formData.assignment_fee) : null,
    };
    await onSave(dataToSave);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? 'Edit Opportunity' : 'New Opportunity'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Deal Number *</Label>
              <Input
                value={formData.deal_number}
                onChange={(e) => handleChange('deal_number', e.target.value)}
                placeholder="25-001"
                required
              />
            </div>
            <div>
              <Label>Stage</Label>
              <Select value={formData.stage} onValueChange={(v) => handleChange('stage', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Address *</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main St"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>City</Label>
              <Input value={formData.city} onChange={(e) => handleChange('city', e.target.value)} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={formData.state} onChange={(e) => handleChange('state', e.target.value)} />
            </div>
            <div>
              <Label>ZIP</Label>
              <Input value={formData.zip_code} onChange={(e) => handleChange('zip_code', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Opportunity Type</Label>
              <Select value={formData.opportunity_type} onValueChange={(v) => handleChange('opportunity_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OPPORTUNITY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estimated Value</Label>
              <Input
                type="number"
                value={formData.estimated_value}
                onChange={(e) => handleChange('estimated_value', e.target.value)}
                placeholder="150000"
              />
            </div>
          </div>

          {/* Remove Asking Price and Assignment Fee fields */}

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Seller Information</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.seller_name}
                  onChange={(e) => handleChange('seller_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.seller_phone}
                  onChange={(e) => handleChange('seller_phone', e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.seller_email}
                  onChange={(e) => handleChange('seller_email', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Opportunity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityModal;
