import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, TrendingDown } from 'lucide-react';
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
import { capitalService } from '@/services/capitalService';
import { formatCurrency, formatDate } from '@/lib/utils';

const typeColors = {
  guaranteed_payment: 'bg-blue-100 text-blue-800',
  profit_distribution: 'bg-green-100 text-green-800',
  return_of_capital: 'bg-yellow-100 text-yellow-800',
  draw: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

const typeLabels = {
  guaranteed_payment: 'Guaranteed Payment',
  profit_distribution: 'Profit Distribution',
  return_of_capital: 'Return of Capital',
  draw: 'Owner Draw',
  other: 'Other',
};

const DistributionsList = ({ entityId, onSelectDistribution, onNewDistribution }) => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDistributions();
  }, [entityId]);

  const loadDistributions = async () => {
    setLoading(true);
    try {
      const { data, error } = await capitalService.getDistributions(entityId);
      if (error) throw error;
      setDistributions(data || []);
    } catch (error) {
      console.error('Error loading distributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDistributions = distributions.filter(d =>
    d.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDistributions = distributions.reduce((sum, d) => sum + (d.amount || 0), 0);

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
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Distributions</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDistributions)}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search distributions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={onNewDistribution} className="bg-[#2F855A] hover:bg-[#276749]">
            <Plus className="w-4 h-4 mr-2" /> Record Distribution
          </Button>
        </div>

        {filteredDistributions.length === 0 ? (
          <div className="p-8 text-center">
            <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Distributions</h3>
            <p className="text-gray-500 mb-4">Record distributions to track member payouts</p>
            <Button onClick={onNewDistribution} className="bg-[#2F855A] hover:bg-[#276749]">
              Record Distribution
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDistributions.map((distribution) => (
                <TableRow 
                  key={distribution.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectDistribution?.(distribution)}
                >
                  <TableCell>{formatDate(distribution.date)}</TableCell>
                  <TableCell className="font-medium">{distribution.member_name}</TableCell>
                  <TableCell>
                    <Badge className={typeColors[distribution.type] || typeColors.other}>
                      {typeLabels[distribution.type] || distribution.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{distribution.description || '-'}</TableCell>
                  <TableCell className="text-right font-mono text-red-600">
                    -{formatCurrency(distribution.amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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

export default DistributionsList;
