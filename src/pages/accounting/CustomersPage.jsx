import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, Upload, Download, Users, DollarSign, Clock,
  MoreHorizontal, Eye, Edit2, Mail, Phone, Building2, User,
  AlertTriangle, CheckCircle, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import CustomerFormModal from '@/components/accounting/CustomerFormModal';
import ImportCustomersModal from '@/components/accounting/ImportCustomersModal';

// Demo customers for fallback
const demoCustomers = [
  {
    id: 'cust-1',
    customer_type: 'company',
    company_name: 'ABC Investments LLC',
    display_name: 'ABC Investments LLC',
    first_name: 'John',
    last_name: 'Smith',
    email: 'accounts@abcinvest.com',
    phone: '(555) 123-4567',
    billing_city: 'Denver',
    billing_state: 'CO',
    total_invoiced: 150000,
    balance_due: 0,
    status: 'active',
    created_at: '2024-01-15',
  },
  {
    id: 'cust-2',
    customer_type: 'trust',
    company_name: 'Smith Family Trust',
    display_name: 'Smith Family Trust',
    first_name: 'Robert',
    last_name: 'Smith',
    email: 'trust@smithfamily.com',
    phone: '(555) 234-5678',
    billing_city: 'Boulder',
    billing_state: 'CO',
    total_invoiced: 25000,
    balance_due: 25000,
    status: 'active',
    created_at: '2024-03-20',
  },
  {
    id: 'cust-3',
    customer_type: 'company',
    company_name: 'Denver RE Partners',
    display_name: 'Denver RE Partners',
    first_name: 'Mike',
    last_name: 'Johnson',
    email: 'ap@denverrepart.com',
    phone: '(555) 345-6789',
    billing_city: 'Denver',
    billing_state: 'CO',
    total_invoiced: 185000,
    balance_due: 85000,
    status: 'active',
    created_at: '2024-02-10',
  },
  {
    id: 'cust-4',
    customer_type: 'individual',
    company_name: null,
    display_name: 'Sarah Williams',
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah.w@email.com',
    phone: '(555) 456-7890',
    billing_city: 'Fort Collins',
    billing_state: 'CO',
    total_invoiced: 45000,
    balance_due: 0,
    status: 'active',
    created_at: '2024-04-05',
  },
  {
    id: 'cust-5',
    customer_type: 'company',
    company_name: 'Mountain View Builders',
    display_name: 'Mountain View Builders',
    first_name: 'Tom',
    last_name: 'Brown',
    email: 'billing@mvbuilders.com',
    phone: '(555) 567-8901',
    billing_city: 'Colorado Springs',
    billing_state: 'CO',
    total_invoiced: 95000,
    balance_due: 95000,
    status: 'overdue',
    created_at: '2024-05-12',
  },
  {
    id: 'cust-6',
    customer_type: 'llc',
    company_name: 'Quick Close Homes LLC',
    display_name: 'Quick Close Homes LLC',
    first_name: 'David',
    last_name: 'Martinez',
    email: 'orders@quickclose.com',
    phone: '(555) 678-9012',
    billing_city: 'Aurora',
    billing_state: 'CO',
    total_invoiced: 320000,
    balance_due: 160000,
    status: 'active',
    created_at: '2024-06-01',
  },
];

const CUSTOMER_TYPE_CONFIG = {
  individual: { label: 'Individual', icon: User, color: 'bg-blue-100 text-blue-700' },
  company: { label: 'Company', icon: Building2, color: 'bg-purple-100 text-purple-700' },
  trust: { label: 'Trust', icon: Building2, color: 'bg-green-100 text-green-700' },
  llc: { label: 'LLC', icon: Building2, color: 'bg-amber-100 text-amber-700' },
  partnership: { label: 'Partnership', icon: Users, color: 'bg-cyan-100 text-cyan-700' },
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

const fetchCustomers = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('entity_id', entityId)
      .order('display_name');

    if (data && !error) return data;
  } catch (err) {
    console.error('Error fetching customers:', err);
  }
  return demoCustomers;
};

export default function CustomersPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const entity = context?.entity;

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const basePath = `/accounting/entities/${entityId}`;

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', entityId],
    queryFn: () => fetchCustomers(entityId),
    enabled: !!entityId,
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm ||
      customer.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || customer.customer_type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalReceivables: customers.reduce((sum, c) => sum + (c.balance_due || 0), 0),
    overdue: customers.filter(c => c.status === 'overdue').length,
  };

  const handleExport = () => {
    const headers = ['Display Name', 'Type', 'Email', 'Phone', 'City', 'State', 'Total Invoiced', 'Balance Due'];
    const rows = filteredCustomers.map(c => [
      c.display_name,
      c.customer_type,
      c.email,
      c.phone,
      c.billing_city,
      c.billing_state,
      c.total_invoiced,
      c.balance_due,
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${entityId}.csv`;
    a.click();
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleCloseModal = () => {
    setShowCustomerModal(false);
    setEditingCustomer(null);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer accounts for {entity?.name || entity?.short_name || 'this entity'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowCustomerModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
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
                <p className="text-sm text-muted-foreground">Total Receivables</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalReceivables)}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.overdue > 0 ? 'border-red-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Accounts</p>
                <p className={cn("text-2xl font-bold", stats.overdue > 0 ? "text-red-600" : "")}>{stats.overdue}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="company">Company</option>
              <option value="trust">Trust</option>
              <option value="llc">LLC</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Contact</th>
                  <th className="text-left px-4 py-3 font-medium">Location</th>
                  <th className="text-right px-4 py-3 font-medium">Total Invoiced</th>
                  <th className="text-right px-4 py-3 font-medium">Balance Due</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No customers found</p>
                      <p className="text-sm">Add a new customer to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const typeConfig = CUSTOMER_TYPE_CONFIG[customer.customer_type] || CUSTOMER_TYPE_CONFIG.individual;
                    const TypeIcon = typeConfig.icon;

                    return (
                      <tr
                        key={customer.id}
                        className={cn(
                          "hover:bg-muted/50",
                          customer.status === 'overdue' && "bg-red-50"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", typeConfig.color.split(' ')[0])}>
                              <TypeIcon className={cn("h-4 w-4", typeConfig.color.split(' ')[1])} />
                            </div>
                            <div>
                              <p className="font-medium">{customer.display_name}</p>
                              {customer.company_name && customer.customer_type === 'individual' && (
                                <p className="text-xs text-muted-foreground">{customer.company_name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={typeConfig.color}>
                            {typeConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {customer.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <span className="truncate max-w-[180px]">{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {customer.billing_city && customer.billing_state
                            ? `${customer.billing_city}, ${customer.billing_state}`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(customer.total_invoiced)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "font-medium",
                            customer.balance_due > 0 ? "text-amber-600" : "text-green-600"
                          )}>
                            {formatCurrency(customer.balance_due)}
                          </span>
                          {customer.status === 'overdue' && (
                            <p className="text-xs text-red-600">Overdue</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`${basePath}/customers/${customer.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => navigate(`${basePath}/invoices/new?customer=${customer.id}`)}>
                                <FileText className="w-4 h-4 mr-2" />
                                Create Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Statement
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Customer Form Modal */}
      <CustomerFormModal
        open={showCustomerModal}
        onClose={handleCloseModal}
        entityId={entityId}
        customer={editingCustomer}
      />

      {/* Import Customers Modal */}
      <ImportCustomersModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        entityId={entityId}
      />
    </div>
  );
}
