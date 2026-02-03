import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';

const CARD_NETWORKS = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'American Express' },
  { value: 'discover', label: 'Discover' },
  { value: 'other', label: 'Other' },
];

// Demo GL accounts for fallback
const demoGLAccounts = [
  { id: 'gl-2100', account_number: '2100', account_name: 'Credit Card Payable - Visa', account_type: 'liability' },
  { id: 'gl-2110', account_number: '2110', account_name: 'Credit Card Payable - Amex', account_type: 'liability' },
  { id: 'gl-2120', account_number: '2120', account_name: 'Credit Card Payable - Other', account_type: 'liability' },
];

export default function CreditCardFormModal({ open, onClose, card, entityId }) {
  const queryClient = useQueryClient();
  const isEditing = !!card?.id;

  const [formData, setFormData] = useState({
    card_name: '',
    card_network: 'visa',
    issuer_name: '',
    card_number_last4: '',
    cardholder_name: '',
    expiration_month: '',
    expiration_year: '',
    credit_limit: '',
    current_balance: '',
    gl_account_id: '',
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (card) {
      setFormData({
        card_name: card.card_name || card.account_name || '',
        card_network: card.card_network || 'visa',
        issuer_name: card.issuer_name || card.bank_name || '',
        card_number_last4: card.card_number_last4 || card.account_number_last4 || '',
        cardholder_name: card.cardholder_name || '',
        expiration_month: card.expiration_month?.toString() || '',
        expiration_year: card.expiration_year?.toString() || '',
        credit_limit: card.credit_limit?.toString() || '',
        current_balance: card.current_balance?.toString() || '',
        gl_account_id: card.gl_account_id || '',
        is_active: card.is_active !== false,
      });
    } else {
      setFormData({
        card_name: '',
        card_network: 'visa',
        issuer_name: '',
        card_number_last4: '',
        cardholder_name: '',
        expiration_month: '',
        expiration_year: '',
        credit_limit: '',
        current_balance: '',
        gl_account_id: '',
        is_active: true,
      });
    }
  }, [card, open]);

  const { data: glAccounts = demoGLAccounts } = useQuery({
    queryKey: ['chart-of-accounts-liability', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .select('*')
          .eq('entity_id', entityId)
          .eq('account_type', 'liability')
          .order('account_number');

        if (data && !error) return data;
      } catch (err) {
        console.error('Error fetching GL accounts:', err);
      }
      return demoGLAccounts;
    },
    enabled: open && !!entityId
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('bank_accounts')
        .insert([{
          entity_id: entityId,
          account_name: data.card_name,
          account_type: 'credit_card',
          bank_name: data.issuer_name,
          account_number_last4: data.card_number_last4,
          credit_limit: parseFloat(data.credit_limit) || null,
          current_balance: -(parseFloat(data.current_balance) || 0), // Store as negative
          gl_account_id: data.gl_account_id || null,
          is_connected: false,
          metadata: {
            card_network: data.card_network,
            cardholder_name: data.cardholder_name,
            expiration_month: data.expiration_month,
            expiration_year: data.expiration_year,
          }
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts', entityId]);
      queryClient.invalidateQueries(['credit-cards', entityId]);
      handleClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('bank_accounts')
        .update({
          account_name: data.card_name,
          bank_name: data.issuer_name,
          account_number_last4: data.card_number_last4,
          credit_limit: parseFloat(data.credit_limit) || null,
          current_balance: -(parseFloat(data.current_balance) || 0),
          gl_account_id: data.gl_account_id || null,
          metadata: {
            card_network: data.card_network,
            cardholder_name: data.cardholder_name,
            expiration_month: data.expiration_month,
            expiration_year: data.expiration_year,
          }
        })
        .eq('id', card.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts', entityId]);
      queryClient.invalidateQueries(['credit-cards', entityId]);
      handleClose();
    }
  });

  const handleClose = () => {
    setFormData({
      card_name: '',
      card_network: 'visa',
      issuer_name: '',
      card_number_last4: '',
      cardholder_name: '',
      expiration_month: '',
      expiration_year: '',
      credit_limit: '',
      current_balance: '',
      gl_account_id: '',
      is_active: true,
    });
    setErrors({});
    onClose();
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.card_name.trim()) {
      newErrors.card_name = 'Card name is required';
    }
    if (!formData.issuer_name.trim()) {
      newErrors.issuer_name = 'Issuer name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0')
  }));

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => ({
    value: String(currentYear + i),
    label: String(currentYear + i)
  }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Credit Card' : 'Add Credit Card'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the credit card details below.' : 'Add a new credit card account.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card_name">Card Name *</Label>
            <Input
              id="card_name"
              value={formData.card_name}
              onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
              placeholder="e.g., Business Visa"
              className={errors.card_name ? 'border-red-500' : ''}
            />
            {errors.card_name && (
              <p className="text-xs text-red-500">{errors.card_name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Card Network</Label>
              <Select
                value={formData.card_network}
                onValueChange={(value) => setFormData({ ...formData, card_network: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARD_NETWORKS.map(network => (
                    <SelectItem key={network.value} value={network.value}>
                      {network.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card_number_last4">Last 4 Digits</Label>
              <Input
                id="card_number_last4"
                value={formData.card_number_last4}
                onChange={(e) => setFormData({ ...formData, card_number_last4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="1234"
                maxLength={4}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuer_name">Card Issuer *</Label>
            <Input
              id="issuer_name"
              value={formData.issuer_name}
              onChange={(e) => setFormData({ ...formData, issuer_name: e.target.value })}
              placeholder="e.g., Chase, American Express"
              className={errors.issuer_name ? 'border-red-500' : ''}
            />
            {errors.issuer_name && (
              <p className="text-xs text-red-500">{errors.issuer_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardholder_name">Cardholder Name</Label>
            <Input
              id="cardholder_name"
              value={formData.cardholder_name}
              onChange={(e) => setFormData({ ...formData, cardholder_name: e.target.value })}
              placeholder="Name on card"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Expiration</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.expiration_month}
                  onValueChange={(value) => setFormData({ ...formData, expiration_month: value })}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.expiration_year}
                  onValueChange={(value) => setFormData({ ...formData, expiration_year: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_limit">Credit Limit</Label>
              <Input
                id="credit_limit"
                type="number"
                step="0.01"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_balance">Current Balance</Label>
            <Input
              id="current_balance"
              type="number"
              step="0.01"
              value={formData.current_balance}
              onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">Enter amount owed (positive number)</p>
          </div>

          <div className="space-y-2">
            <Label>GL Account</Label>
            <Select
              value={formData.gl_account_id}
              onValueChange={(value) => setFormData({ ...formData, gl_account_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Link to GL account..." />
              </SelectTrigger>
              <SelectContent>
                {glAccounts.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.account_number} - {a.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Card is active
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : (isEditing ? 'Update Card' : 'Add Card')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
