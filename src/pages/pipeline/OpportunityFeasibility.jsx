import React, { useState } from 'react';
import { ClipboardList, CheckCircle, Circle, AlertTriangle, Plus, Trash2, Calendar, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function OpportunityFeasibility() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [feasibilityItems, setFeasibilityItems] = useState([
    {
      id: '1',
      category: 'Environmental',
      item: 'Phase I Environmental Assessment',
      status: 'complete',
      dueDate: '2025-01-20',
      completedDate: '2025-01-18',
      cost: 2500,
      vendor: 'EcoTest Labs',
      notes: 'No issues found. Clean site.',
      documents: ['Phase_I_Report.pdf'],
    },
    {
      id: '2',
      category: 'Survey',
      item: 'Boundary Survey',
      status: 'complete',
      dueDate: '2025-01-15',
      completedDate: '2025-01-14',
      cost: 3500,
      vendor: 'Smith Surveying',
      notes: 'Survey complete with plat recorded.',
      documents: ['Survey_Plat.pdf'],
    },
    {
      id: '3',
      category: 'Survey',
      item: 'Topographic Survey',
      status: 'in-progress',
      dueDate: '2025-01-25',
      completedDate: null,
      cost: 4500,
      vendor: 'Smith Surveying',
      notes: 'In progress, expected completion 1/24.',
      documents: [],
    },
    {
      id: '4',
      category: 'Utilities',
      item: 'Water/Sewer Availability Letter',
      status: 'complete',
      dueDate: '2025-01-18',
      completedDate: '2025-01-16',
      cost: 250,
      vendor: 'Greenville Water',
      notes: 'Tap fees estimated at $185,000 total.',
      documents: ['Utility_Letter.pdf'],
    },
    {
      id: '5',
      category: 'Zoning',
      item: 'Zoning Verification',
      status: 'complete',
      dueDate: '2025-01-12',
      completedDate: '2025-01-10',
      cost: 0,
      vendor: 'County Planning',
      notes: 'R-3 zoning confirmed. 45 lots possible.',
      documents: [],
    },
    {
      id: '6',
      category: 'Geotechnical',
      item: 'Soil Borings & Report',
      status: 'pending',
      dueDate: '2025-02-01',
      completedDate: null,
      cost: 8500,
      vendor: 'GeoTech Partners',
      notes: 'Scheduled for 1/28.',
      documents: [],
    },
    {
      id: '7',
      category: 'Traffic',
      item: 'Traffic Impact Study',
      status: 'pending',
      dueDate: '2025-02-10',
      completedDate: null,
      cost: 6000,
      vendor: 'TBD',
      notes: 'May not be required per county.',
      documents: [],
    },
  ]);

  const [newItem, setNewItem] = useState({
    category: 'Environmental',
    item: '',
    dueDate: '',
    cost: '',
    vendor: '',
    notes: '',
  });

  const categories = [
    'Environmental',
    'Survey',
    'Utilities',
    'Zoning',
    'Geotechnical',
    'Traffic',
    'Legal',
    'Title',
    'Engineering',
    'Other',
  ];

  const handleAddItem = () => {
    if (!newItem.item) {
      toast({ title: 'Error', description: 'Item name is required', variant: 'destructive' });
      return;
    }

    const item = {
      id: String(Date.now()),
      ...newItem,
      status: 'pending',
      completedDate: null,
      cost: parseFloat(newItem.cost) || 0,
      documents: [],
    };

    setFeasibilityItems(prev => [...prev, item]);
    setShowAddDialog(false);
    setNewItem({ category: 'Environmental', item: '', dueDate: '', cost: '', vendor: '', notes: '' });
    toast({ title: 'Item Added', description: 'Feasibility item has been added.' });
  };

  const handleToggleStatus = (itemId) => {
    setFeasibilityItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newStatus = item.status === 'complete' ? 'pending' : item.status === 'pending' ? 'in-progress' : 'complete';
      return {
        ...item,
        status: newStatus,
        completedDate: newStatus === 'complete' ? new Date().toISOString().split('T')[0] : null,
      };
    }));
  };

  const handleDeleteItem = (itemId) => {
    if (!confirm('Delete this feasibility item?')) return;
    setFeasibilityItems(prev => prev.filter(i => i.id !== itemId));
    toast({ title: 'Deleted', description: 'Item has been removed.' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stats
  const totalItems = feasibilityItems.length;
  const completedItems = feasibilityItems.filter(i => i.status === 'complete').length;
  const totalCost = feasibilityItems.reduce((sum, i) => sum + (i.cost || 0), 0);
  const completedCost = feasibilityItems.filter(i => i.status === 'complete').reduce((sum, i) => sum + (i.cost || 0), 0);

  // Group by category
  const groupedItems = feasibilityItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Feasibility Study</h2>
          <p className="text-sm text-gray-500">Track due diligence items and feasibility requirements</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Progress</p>
          <p className="text-2xl font-bold text-gray-900">{completedItems}/{totalItems}</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${(completedItems / totalItems) * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Completion</p>
          <p className="text-2xl font-bold text-emerald-600">{Math.round((completedItems / totalItems) * 100)}%</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Spent</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(completedCost)}</p>
        </div>
      </div>

      {/* Checklist by Category */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="bg-white border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">{category}</h3>
              <span className="text-sm text-gray-500">
                {items.filter(i => i.status === 'complete').length}/{items.length} complete
              </span>
            </div>
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <button onClick={() => handleToggleStatus(item.id)} className="mt-0.5">
                      {getStatusIcon(item.status)}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium",
                          item.status === 'complete' && "line-through text-gray-500"
                        )}>
                          {item.item}
                        </span>
                        <Badge className={getStatusBadge(item.status)}>{item.status}</Badge>
                      </div>
                      <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
                        {item.vendor && <span>Vendor: {item.vendor}</span>}
                        {item.cost > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> {formatCurrency(item.cost)}
                          </span>
                        )}
                        {item.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Due: {item.dueDate}
                          </span>
                        )}
                        {item.completedDate && (
                          <span className="text-green-600">Completed: {item.completedDate}</span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-500 mt-1 italic">{item.notes}</p>
                      )}
                      {item.documents.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          {item.documents.map((doc, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" /> {doc}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {feasibilityItems.length === 0 && (
          <div className="bg-white border rounded-lg p-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No feasibility items yet</p>
            <p className="text-gray-400 text-sm mt-2">Add due diligence items to track</p>
          </div>
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Feasibility Item</DialogTitle>
            <DialogDescription>Add a due diligence item to track</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newItem.dueDate}
                  onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Item Name</Label>
              <Input
                value={newItem.item}
                onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                placeholder="e.g., Phase I Environmental Assessment"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Estimated Cost ($)</Label>
                <Input
                  type="number"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                  placeholder="2500"
                />
              </div>
              <div className="grid gap-2">
                <Label>Vendor</Label>
                <Input
                  value={newItem.vendor}
                  onChange={(e) => setNewItem({ ...newItem, vendor: e.target.value })}
                  placeholder="Vendor name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddItem} className="bg-[#047857] hover:bg-[#065f46]">
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
