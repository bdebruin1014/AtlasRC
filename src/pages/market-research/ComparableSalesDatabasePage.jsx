import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Map,
  Filter,
  Download,
  BarChart3,
  ArrowUpDown,
  Eye,
  Edit2,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ComparableSalesDatabasePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('12months');
  const [showAddModal, setShowAddModal] = useState(false);

  const [compData, setCompData] = useState({
    address: '',
    city: '',
    state: '',
    propertyType: 'land',
    acres: '',
    sqFt: '',
    salePrice: '',
    saleDate: '',
    capRate: '',
    notes: ''
  });

  const comparables = [
    {
      id: 1,
      address: '1500 Oak Ridge Road',
      city: 'Austin',
      state: 'TX',
      market: 'Austin Metro',
      propertyType: 'land',
      acres: 25.5,
      salePrice: 1275000,
      pricePerAcre: 50000,
      saleDate: '2024-02-15',
      buyer: 'Development Corp LLC',
      seller: 'Smith Family Trust',
      zoning: 'R-1',
      notes: 'Raw land, utilities at street'
    },
    {
      id: 2,
      address: '2200 Commerce Blvd',
      city: 'Austin',
      state: 'TX',
      market: 'Austin Metro',
      propertyType: 'commercial',
      sqFt: 45000,
      salePrice: 8100000,
      pricePerSqFt: 180,
      capRate: 6.5,
      saleDate: '2024-01-20',
      buyer: 'Retail Partners Inc',
      seller: 'Commercial Holdings LP',
      zoning: 'C-2',
      notes: 'Strip center, 95% occupied'
    },
    {
      id: 3,
      address: '890 Riverside Dr',
      city: 'Round Rock',
      state: 'TX',
      market: 'Austin Metro',
      propertyType: 'multifamily',
      units: 120,
      sqFt: 98000,
      salePrice: 18500000,
      pricePerUnit: 154167,
      pricePerSqFt: 189,
      capRate: 5.8,
      saleDate: '2024-03-01',
      buyer: 'Apartment REIT',
      seller: 'Local Developer LLC',
      notes: 'Class A, built 2020'
    },
    {
      id: 4,
      address: '450 Industrial Way',
      city: 'Georgetown',
      state: 'TX',
      market: 'Austin Metro',
      propertyType: 'industrial',
      sqFt: 75000,
      salePrice: 9750000,
      pricePerSqFt: 130,
      capRate: 7.2,
      saleDate: '2024-02-28',
      buyer: 'Logistics Corp',
      seller: 'Industrial Partners',
      notes: 'Distribution facility, clear height 32ft'
    },
    {
      id: 5,
      address: 'Lot 12, Highway 29',
      city: 'Liberty Hill',
      state: 'TX',
      market: 'Austin Metro',
      propertyType: 'land',
      acres: 100,
      salePrice: 4500000,
      pricePerAcre: 45000,
      saleDate: '2024-01-05',
      buyer: 'Homebuilder Inc',
      seller: 'Ranch Holdings',
      zoning: 'Agricultural',
      notes: 'ETJ, future residential'
    },
    {
      id: 6,
      address: '3400 Main Street',
      city: 'San Marcos',
      state: 'TX',
      market: 'San Antonio Metro',
      propertyType: 'retail',
      sqFt: 12000,
      salePrice: 2400000,
      pricePerSqFt: 200,
      capRate: 6.8,
      saleDate: '2024-02-10',
      buyer: 'QSR Holdings',
      seller: 'Private Owner',
      notes: 'Single-tenant NNN'
    },
    {
      id: 7,
      address: '7800 Sunset Valley',
      city: 'Dripping Springs',
      state: 'TX',
      market: 'Austin Metro',
      propertyType: 'land',
      acres: 45,
      salePrice: 3150000,
      pricePerAcre: 70000,
      saleDate: '2024-03-10',
      buyer: 'Custom Homes LLC',
      seller: 'Estate of Johnson',
      zoning: 'R-2',
      notes: 'Hill country views, platted for 25 lots'
    }
  ];

  const markets = ['Austin Metro', 'San Antonio Metro', 'Dallas Metro', 'Houston Metro'];
  const propertyTypes = ['land', 'commercial', 'multifamily', 'industrial', 'retail', 'office'];

  const filteredComps = useMemo(() => {
    return comparables.filter(comp => {
      const matchesSearch = !searchQuery ||
        comp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = propertyTypeFilter === 'all' || comp.propertyType === propertyTypeFilter;
      const matchesMarket = marketFilter === 'all' || comp.market === marketFilter;
      return matchesSearch && matchesType && matchesMarket;
    });
  }, [searchQuery, propertyTypeFilter, marketFilter]);

  const stats = useMemo(() => {
    const landComps = comparables.filter(c => c.propertyType === 'land');
    const commercialComps = comparables.filter(c => c.propertyType !== 'land');
    return {
      totalComps: comparables.length,
      totalVolume: comparables.reduce((acc, c) => acc + c.salePrice, 0),
      avgPricePerAcre: landComps.length > 0
        ? Math.round(landComps.reduce((acc, c) => acc + c.pricePerAcre, 0) / landComps.length)
        : 0,
      avgCapRate: commercialComps.filter(c => c.capRate).length > 0
        ? (commercialComps.filter(c => c.capRate).reduce((acc, c) => acc + c.capRate, 0) / commercialComps.filter(c => c.capRate).length).toFixed(1)
        : 0
    };
  }, []);

  const getPropertyTypeBadge = (type) => {
    const colors = {
      land: 'bg-green-100 text-green-700',
      commercial: 'bg-blue-100 text-blue-700',
      multifamily: 'bg-purple-100 text-purple-700',
      industrial: 'bg-orange-100 text-orange-700',
      retail: 'bg-pink-100 text-pink-700',
      office: 'bg-cyan-100 text-cyan-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Comparable Sales Database</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comparable Sales Database</h1>
          <p className="text-gray-600 mt-2">Track and analyze recent sales in your target markets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Comp
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Comps</p>
                <p className="text-2xl font-bold">{stats.totalComps}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Volume</p>
                <p className="text-2xl font-bold">${(stats.totalVolume / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg $/Acre (Land)</p>
                <p className="text-2xl font-bold">${stats.avgPricePerAcre.toLocaleString()}</p>
              </div>
              <Map className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Cap Rate</p>
                <p className="text-2xl font-bold">{stats.avgCapRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by address or city..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {markets.map(market => (
                  <SelectItem key={market} value={market}>{market}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
                <SelectItem value="24months">Last 24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comparables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparable Sales ({filteredComps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>$/Unit</TableHead>
                <TableHead>Cap Rate</TableHead>
                <TableHead>Sale Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComps.map((comp) => (
                <TableRow key={comp.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{comp.address}</p>
                        <p className="text-sm text-gray-500">{comp.city}, {comp.state}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPropertyTypeBadge(comp.propertyType)}>
                      {comp.propertyType}
                    </Badge>
                  </TableCell>
                  <TableCell>{comp.market}</TableCell>
                  <TableCell>
                    {comp.acres
                      ? `${comp.acres} acres`
                      : comp.units
                        ? `${comp.units} units`
                        : `${comp.sqFt?.toLocaleString()} SF`
                    }
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${comp.salePrice.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {comp.pricePerAcre
                      ? `$${comp.pricePerAcre.toLocaleString()}/ac`
                      : comp.pricePerUnit
                        ? `$${comp.pricePerUnit.toLocaleString()}/unit`
                        : `$${comp.pricePerSqFt}/SF`
                    }
                  </TableCell>
                  <TableCell>
                    {comp.capRate ? `${comp.capRate}%` : '-'}
                  </TableCell>
                  <TableCell>{comp.saleDate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Map className="w-4 h-4 mr-2" />
                          View on Map
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Comp Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Comparable Sale</DialogTitle>
            <DialogDescription>Enter details for a new comparable sale</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Property Address</Label>
              <Input
                placeholder="123 Main Street"
                value={compData.address}
                onChange={(e) => setCompData({...compData, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>City</Label>
                <Input
                  value={compData.city}
                  onChange={(e) => setCompData({...compData, city: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>State</Label>
                <Input
                  value={compData.state}
                  onChange={(e) => setCompData({...compData, state: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Property Type</Label>
                <Select
                  value={compData.propertyType}
                  onValueChange={(value) => setCompData({...compData, propertyType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Acres (if land)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={compData.acres}
                  onChange={(e) => setCompData({...compData, acres: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Square Feet</Label>
                <Input
                  type="number"
                  value={compData.sqFt}
                  onChange={(e) => setCompData({...compData, sqFt: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Cap Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={compData.capRate}
                  onChange={(e) => setCompData({...compData, capRate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Sale Price</Label>
                <Input
                  type="number"
                  value={compData.salePrice}
                  onChange={(e) => setCompData({...compData, salePrice: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Sale Date</Label>
                <Input
                  type="date"
                  value={compData.saleDate}
                  onChange={(e) => setCompData({...compData, saleDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input
                placeholder="Additional details about the sale..."
                value={compData.notes}
                onChange={(e) => setCompData({...compData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Add Comparable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComparableSalesDatabasePage;
