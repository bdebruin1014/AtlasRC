import React, { useState } from 'react';
import { TrendingUp, Plus, MapPin, DollarSign, Home, Calendar, Trash2, Edit2, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function OpportunityComparables() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [comparables, setComparables] = useState([
    {
      id: '1',
      address: '520 Oak Valley Dr',
      city: 'Mauldin',
      state: 'SC',
      type: 'lot-sale',
      acres: 18,
      salePrice: 1620000,
      pricePerAcre: 90000,
      saleDate: '2024-11-15',
      potentialLots: 32,
      pricePerLot: 50625,
      notes: 'Similar zoning, adjacent subdivision',
      distance: 1.2,
    },
    {
      id: '2',
      address: '245 Heritage Pkwy',
      city: 'Simpsonville',
      state: 'SC',
      type: 'lot-sale',
      acres: 22,
      salePrice: 2090000,
      pricePerAcre: 95000,
      saleDate: '2024-10-20',
      potentialLots: 40,
      pricePerLot: 52250,
      notes: 'Excellent road frontage',
      distance: 2.5,
    },
    {
      id: '3',
      address: '789 Woodruff Rd',
      city: 'Greenville',
      state: 'SC',
      type: 'finished-lot',
      acres: 15,
      salePrice: 1950000,
      pricePerAcre: 130000,
      saleDate: '2024-09-05',
      potentialLots: 28,
      pricePerLot: 69643,
      notes: 'Fully developed with utilities',
      distance: 4.8,
    },
  ]);

  const [newComp, setNewComp] = useState({
    address: '',
    city: '',
    state: 'SC',
    type: 'lot-sale',
    acres: '',
    salePrice: '',
    saleDate: '',
    potentialLots: '',
    notes: '',
  });

  const handleAddComparable = () => {
    if (!newComp.address || !newComp.salePrice) {
      toast({ title: 'Error', description: 'Address and sale price are required', variant: 'destructive' });
      return;
    }

    const acres = parseFloat(newComp.acres) || 0;
    const salePrice = parseFloat(newComp.salePrice) || 0;
    const potentialLots = parseInt(newComp.potentialLots) || 0;

    const comp = {
      id: String(Date.now()),
      ...newComp,
      acres,
      salePrice,
      potentialLots,
      pricePerAcre: acres > 0 ? Math.round(salePrice / acres) : 0,
      pricePerLot: potentialLots > 0 ? Math.round(salePrice / potentialLots) : 0,
      distance: Math.round(Math.random() * 50) / 10,
    };

    setComparables(prev => [...prev, comp]);
    setShowAddDialog(false);
    setNewComp({ address: '', city: '', state: 'SC', type: 'lot-sale', acres: '', salePrice: '', saleDate: '', potentialLots: '', notes: '' });
    toast({ title: 'Comparable Added', description: 'Property has been added to comparables.' });
  };

  const handleDeleteComparable = (id) => {
    if (!confirm('Remove this comparable?')) return;
    setComparables(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Removed', description: 'Comparable has been removed.' });
  };

  const filteredComparables = comparables.filter(comp => {
    if (filterType !== 'all' && comp.type !== filterType) return false;
    if (searchQuery && !comp.address.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calculate averages
  const avgPricePerAcre = comparables.length > 0
    ? Math.round(comparables.reduce((sum, c) => sum + c.pricePerAcre, 0) / comparables.length)
    : 0;
  const avgPricePerLot = comparables.length > 0
    ? Math.round(comparables.reduce((sum, c) => sum + (c.pricePerLot || 0), 0) / comparables.filter(c => c.pricePerLot > 0).length)
    : 0;

  const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Comparable Sales</h2>
          <p className="text-sm text-gray-500">Analyze similar property sales to determine value</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Comparable
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Total Comps</p>
          <p className="text-2xl font-bold text-gray-900">{comparables.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Avg $/Acre</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(avgPricePerAcre)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Avg $/Lot</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(avgPricePerLot)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Suggested Value (25 ac)</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgPricePerAcre * 25)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search comparables..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lot-sale">Raw Lot Sale</SelectItem>
            <SelectItem value="finished-lot">Finished Lot</SelectItem>
            <SelectItem value="land-sale">Land Sale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comparables Grid */}
      <div className="grid gap-4">
        {filteredComparables.map((comp) => (
          <div key={comp.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{comp.address}</h3>
                    <Badge variant="outline">{comp.type.replace('-', ' ')}</Badge>
                    <span className="text-xs text-gray-500">{comp.distance} mi away</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {comp.city}, {comp.state}
                  </p>
                  <div className="flex items-center gap-6 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Sale Price</p>
                      <p className="font-semibold text-emerald-600">{formatCurrency(comp.salePrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Acres</p>
                      <p className="font-medium">{comp.acres} ac</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">$/Acre</p>
                      <p className="font-medium">{formatCurrency(comp.pricePerAcre)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Potential Lots</p>
                      <p className="font-medium">{comp.potentialLots}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">$/Lot</p>
                      <p className="font-medium">{formatCurrency(comp.pricePerLot)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sale Date</p>
                      <p className="font-medium">{comp.saleDate}</p>
                    </div>
                  </div>
                  {comp.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">{comp.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteComparable(comp.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredComparables.length === 0 && (
          <div className="bg-white border rounded-lg p-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No comparables found</p>
            <p className="text-gray-400 text-sm mt-2">Add comparable sales to analyze property value</p>
          </div>
        )}
      </div>

      {/* Add Comparable Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Comparable Sale</DialogTitle>
            <DialogDescription>Enter details for a comparable property sale</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Property Address</Label>
              <Input
                value={newComp.address}
                onChange={(e) => setNewComp({ ...newComp, address: e.target.value })}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>City</Label>
                <Input
                  value={newComp.city}
                  onChange={(e) => setNewComp({ ...newComp, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="grid gap-2">
                <Label>State</Label>
                <Input
                  value={newComp.state}
                  onChange={(e) => setNewComp({ ...newComp, state: e.target.value })}
                  placeholder="SC"
                />
              </div>
              <div className="grid gap-2">
                <Label>Sale Type</Label>
                <Select value={newComp.type} onValueChange={(v) => setNewComp({ ...newComp, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lot-sale">Raw Lot Sale</SelectItem>
                    <SelectItem value="finished-lot">Finished Lot</SelectItem>
                    <SelectItem value="land-sale">Land Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Sale Price ($)</Label>
                <Input
                  type="number"
                  value={newComp.salePrice}
                  onChange={(e) => setNewComp({ ...newComp, salePrice: e.target.value })}
                  placeholder="2000000"
                />
              </div>
              <div className="grid gap-2">
                <Label>Acres</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newComp.acres}
                  onChange={(e) => setNewComp({ ...newComp, acres: e.target.value })}
                  placeholder="25"
                />
              </div>
              <div className="grid gap-2">
                <Label>Sale Date</Label>
                <Input
                  type="date"
                  value={newComp.saleDate}
                  onChange={(e) => setNewComp({ ...newComp, saleDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Potential Lots</Label>
              <Input
                type="number"
                value={newComp.potentialLots}
                onChange={(e) => setNewComp({ ...newComp, potentialLots: e.target.value })}
                placeholder="45"
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input
                value={newComp.notes}
                onChange={(e) => setNewComp({ ...newComp, notes: e.target.value })}
                placeholder="Additional notes about this comparable"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddComparable} className="bg-[#047857] hover:bg-[#065f46]">
              Add Comparable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
