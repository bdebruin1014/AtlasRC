import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, CreditCard, MoreHorizontal, Edit, Trash2, CheckCircle,
  AlertCircle, DollarSign, TrendingUp, Calendar, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import CreditCardFormModal from '@/components/accounting/CreditCardFormModal';

// Demo credit cards for fallback
const demoCreditCards = [
  { id: 'cc-1', account_name: 'Business Visa', bank_name: 'Chase', account_number_last4: '4521', current_balance: -8450, credit_limit: 25000, is_active: true, metadata: { card_network: 'visa', cardholder_name: 'John Smith' } },
  { id: 'cc-2', account_name: 'Corporate Amex', bank_name: 'American Express', account_number_last4: '3456', current_balance: -15000, credit_limit: 50000, is_active: true, metadata: { card_network: 'amex', cardholder_name: 'Sarah Johnson' } },
  { id: 'cc-3', account_name: 'Travel Rewards', bank_name: 'Capital One', account_number_last4: '7890', current_balance: -2300, credit_limit: 15000, is_active: true, metadata: { card_network: 'mastercard', cardholder_name: 'John Smith' } },
];

const NETWORK_COLORS = {
  visa: 'bg-blue-100 text-blue-700',
  mastercard: 'bg-orange-100 text-orange-700',
  amex: 'bg-indigo-100 text-indigo-700',
  discover: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(val) || 0);

const fetchCreditCards = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('entity_id', entityId)
      .eq('account_type', 'credit_card')
      .order('account_name');

    if (data && !error) return data;
  } catch (err) {
    console.error('Error fetching credit cards:', err);
  }
  return demoCreditCards;
};

export default function CreditCardsPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const entity = context?.entity;
  const queryClient = useQueryClient();

  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const { data: creditCards = [], isLoading } = useQuery({
    queryKey: ['credit-cards', entityId],
    queryFn: () => fetchCreditCards(entityId),
    enabled: !!entityId
  });

  const deleteMutation = useMutation({
    mutationFn: async (cardId) => {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', cardId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['credit-cards', entityId]);
      queryClient.invalidateQueries(['bank-accounts', entityId]);
    }
  });

  const totalBalance = creditCards.reduce((sum, c) => sum + Math.abs(c.current_balance || 0), 0);
  const totalLimit = creditCards.reduce((sum, c) => sum + (c.credit_limit || 0), 0);
  const totalAvailable = totalLimit - totalBalance;
  const utilizationRate = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

  const handleEdit = (card) => {
    setEditingCard(card);
    setShowCardModal(true);
  };

  const handleCloseModal = () => {
    setShowCardModal(false);
    setEditingCard(null);
  };

  const basePath = `/accounting/entities/${entityId}`;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Credit Cards</h1>
          <p className="text-muted-foreground">
            Manage credit card accounts for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <Button onClick={() => setShowCardModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Credit Card
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Limit</p>
                <p className="text-2xl font-bold">{formatCurrency(totalLimit)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Credit</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAvailable)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilization Rate</p>
                <p className={cn(
                  "text-2xl font-bold",
                  utilizationRate > 70 ? 'text-red-600' : utilizationRate > 30 ? 'text-amber-600' : 'text-green-600'
                )}>
                  {utilizationRate.toFixed(0)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : creditCards.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">No credit cards</h3>
          <p className="text-muted-foreground mb-4">
            Add your first credit card to track expenses and manage payments.
          </p>
          <Button onClick={() => setShowCardModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Credit Card
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creditCards.map((card) => {
            const balance = Math.abs(card.current_balance || 0);
            const limit = card.credit_limit || 0;
            const available = limit - balance;
            const utilization = limit > 0 ? (balance / limit) * 100 : 0;
            const network = card.metadata?.card_network || 'other';

            return (
              <Card key={card.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{card.account_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {card.bank_name} {card.account_number_last4 && `•••• ${card.account_number_last4}`}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`${basePath}/bank-accounts/${card.id}/transactions`)}>
                          View Transactions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`${basePath}/bank-accounts/${card.id}/reconcile`)}>
                          Reconcile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(card)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Card
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteMutation.mutate(card.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Card
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Card details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Balance</span>
                      <span className="font-semibold text-red-600">{formatCurrency(balance)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Credit Limit</span>
                      <span className="font-medium">{formatCurrency(limit)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available</span>
                      <span className="font-medium text-green-600">{formatCurrency(available)}</span>
                    </div>

                    {/* Utilization bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className={cn(
                          "font-medium",
                          utilization > 70 ? 'text-red-600' : utilization > 30 ? 'text-amber-600' : 'text-green-600'
                        )}>
                          {utilization.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            utilization > 70 ? 'bg-red-500' : utilization > 30 ? 'bg-amber-500' : 'bg-green-500'
                          )}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <Badge className={NETWORK_COLORS[network]}>
                      {network.toUpperCase()}
                    </Badge>
                    {card.metadata?.cardholder_name && (
                      <span className="flex items-center text-xs text-muted-foreground">
                        <User className="w-3 h-3 mr-1" />
                        {card.metadata.cardholder_name}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <CreditCardFormModal
        open={showCardModal}
        onClose={handleCloseModal}
        card={editingCard}
        entityId={entityId}
      />
    </div>
  );
}
