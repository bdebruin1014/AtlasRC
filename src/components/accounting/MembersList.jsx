import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, MoreHorizontal, Eye, Edit, Trash2, 
  User, Building2, Mail, Phone 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { cn, formatCurrency, formatPercent } from '@/lib/utils';

const MembersList = ({ entityId, onSelectMember, onNewMember }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadData();
  }, [entityId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, summaryRes] = await Promise.all([
        capitalService.getMembers(entityId),
        capitalService.getCapitalSummary(entityId),
      ]);
      
      if (!membersRes.error) setMembers(membersRes.data || []);
      if (!summaryRes.error) setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      </div>
    );
  }

  const totalOwnership = members.reduce((sum, m) => sum + (m.ownership_pct || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold">{members.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Capital</p>
          <p className="text-2xl font-bold">{formatCurrency(summary?.totalCapital || 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Ownership</p>
          <p className={cn(
            "text-2xl font-bold",
            Math.abs(totalOwnership - 100) < 0.01 ? "text-green-600" : "text-red-600"
          )}>
            {totalOwnership.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Members / Partners</h3>
          <Button onClick={onNewMember} className="bg-[#2F855A] hover:bg-[#276749]">
            <Plus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        </div>

        {members.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Members</h3>
            <p className="text-gray-500 mb-4">Add members to track ownership and capital accounts</p>
            <Button onClick={onNewMember} className="bg-[#2F855A] hover:bg-[#276749]">
              Add Member
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead className="text-right">Capital Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow 
                  key={member.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectMember(member)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        member.member_type === 'entity' 
                          ? "bg-blue-100 text-blue-600" 
                          : "bg-emerald-100 text-emerald-600"
                      )}>
                        {member.member_type === 'entity' 
                          ? <Building2 className="w-5 h-5" />
                          : <User className="w-5 h-5" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        {member.email && (
                          <p className="text-sm text-gray-500">{member.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {member.member_type || 'individual'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{member.ownership_pct}%</span>
                      </div>
                      <Progress value={member.ownership_pct} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(member.capital_account || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      'text-xs',
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {member.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectMember(member); }}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectMember(member); }}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Remove
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

export default MembersList;
