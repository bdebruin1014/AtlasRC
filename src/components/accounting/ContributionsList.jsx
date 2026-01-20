import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, TrendingUp } from 'lucide-react';
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
  cash: 'bg-green-100 text-green-800',
  property: 'bg-blue-100 text-blue-800',
  services: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

const ContributionsList = ({ entityId, onSelectContribution, onNewContribution }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContributions();
  }, [entityId]);

  const loadContributions = async () => {
    setLoading(true);
    try {
      const { data, error } = await capitalService.getContributions(entityId);
      if (error) throw error;
      setContributions(data || []);
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContributions = contributions.filter(c =>
    c.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalContributions = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);

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
            <p className="text-sm text-gray-500">Total Contributions</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalContributions)}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search contributions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={onNewContribution} className="bg-[#2F855A] hover:bg-[#276749]">
            <Plus className="w-4 h-4 mr-2" /> Record Contribution
          </Button>
        </div>

        {filteredContributions.length === 0 ? (
          <div className="p-8 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Contributions</h3>
            <p className="text-gray-500 mb-4">Record capital contributions to track member investments</p>
            <Button onClick={onNewContribution} className="bg-[#2F855A] hover:bg-[#276749]">
              Record Contribution
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
              {filteredContributions.map((contribution) => (
                <TableRow 
                  key={contribution.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectContribution?.(contribution)}
                >
                  <TableCell>{formatDate(contribution.date)}</TableCell>
                  <TableCell className="font-medium">{contribution.member_name}</TableCell>
                  <TableCell>
                    <Badge className={typeColors[contribution.type] || typeColors.other}>
                      {contribution.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{contribution.description || '-'}</TableCell>
                  <TableCell className="text-right font-mono text-green-600">
                    +{formatCurrency(contribution.amount)}
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

export default ContributionsList;
