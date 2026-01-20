import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { journalEntryService } from '@/services/journalEntryService';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  posted: 'bg-green-100 text-green-800',
  voided: 'bg-red-100 text-red-800',
};

const JournalEntriesList = ({ entityId, onSelectEntry, onNewEntry }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEntries();
  }, [entityId]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await journalEntryService.getAll(entityId);
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.entry_number?.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Search & Filters */}
      <div className="p-4 border-b flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
      </div>

      {/* Table */}
      {filteredEntries.length === 0 ? (
        <div className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Journal Entries</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first journal entry.</p>
          <Button onClick={onNewEntry} className="bg-[#2F855A] hover:bg-[#276749]">
            Create Entry
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entry #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow 
                key={entry.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSelectEntry(entry)}
              >
                <TableCell className="font-medium">{entry.entry_number}</TableCell>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>
                  <Badge className={cn('text-xs', statusColors[entry.status])}>
                    {entry.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(entry.total_debit)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(entry.total_credit)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectEntry(entry); }}>
                        <Eye className="w-4 h-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectEntry(entry); }}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
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
  );
};

export default JournalEntriesList;
