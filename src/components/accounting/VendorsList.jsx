import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Plus, MoreHorizontal, Eye, Edit, 
  Trash2, Phone, Mail, MapPin, DollarSign 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { vendorService } from '@/services/vendorService';
import { cn, formatCurrency } from '@/lib/utils';

const VendorsList = ({ entityId, onSelectVendor, onNewVendor }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  useEffect(() => {
    loadVendors();
  }, [entityId]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const { data, error } = await vendorService.getAll(entityId);
      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Vendors</p>
          <p className="text-2xl font-bold">{vendors.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {vendors.filter(v => v.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Outstanding</p>
          <p className="text-2xl font-bold">
            {formatCurrency(vendors.reduce((sum, v) => sum + (v.balance || 0), 0))}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={onNewVendor} className="bg-[#2F855A] hover:bg-[#276749]">
            <Plus className="w-4 h-4 mr-2" /> Add Vendor
          </Button>
        </div>

        {/* Table */}
        {filteredVendors.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Vendors Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Add your first vendor to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={onNewVendor} className="bg-[#2F855A] hover:bg-[#276749]">
                Add Vendor
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow 
                  key={vendor.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectVendor(vendor)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{vendor.name}</p>
                        {vendor.vendor_type && (
                          <p className="text-xs text-gray-500">{vendor.vendor_type}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.contact_name || '-'}</TableCell>
                  <TableCell>{vendor.phone || '-'}</TableCell>
                  <TableCell>{vendor.email || '-'}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      'text-xs',
                      vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    )}>
                      {vendor.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {vendor.balance > 0 ? (
                      <span className="text-red-600">{formatCurrency(vendor.balance)}</span>
                    ) : (
                      <span className="text-gray-400">$0.00</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectVendor(vendor); }}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectVendor(vendor); }}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default VendorsList;
