import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Home,
  Building2,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit2,
  Tag,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Upload,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UnitInventoryManagerPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const units = [
    // Phase 1 - Lots
    { id: 1, unitNumber: 'L-001', type: 'lot', phase: 'Phase 1', tier: 'Standard', sqFt: 6200, price: 89400, status: 'sold', buyer: 'Smith Family Trust', soldDate: '2024-01-20', closingDate: '2024-02-15' },
    { id: 2, unitNumber: 'L-002', type: 'lot', phase: 'Phase 1', tier: 'Standard', sqFt: 5800, price: 84600, status: 'sold', buyer: 'Johnson LLC', soldDate: '2024-01-25', closingDate: '2024-02-28' },
    { id: 3, unitNumber: 'L-003', type: 'lot', phase: 'Phase 1', tier: 'Premium', sqFt: 8500, price: 129000, status: 'reserved', buyer: 'Pending Contract', reservedDate: '2024-03-01' },
    { id: 4, unitNumber: 'L-004', type: 'lot', phase: 'Phase 1', tier: 'Premium', sqFt: 9200, price: 138800, status: 'available' },
    { id: 5, unitNumber: 'L-005', type: 'lot', phase: 'Phase 1', tier: 'Estate', sqFt: 12000, price: 192000, status: 'sold', buyer: 'Chen Investments', soldDate: '2024-02-10', closingDate: '2024-03-15' },
    { id: 6, unitNumber: 'L-006', type: 'lot', phase: 'Phase 1', tier: 'Standard', sqFt: 5500, price: 81000, status: 'available' },
    { id: 7, unitNumber: 'L-007', type: 'lot', phase: 'Phase 1', tier: 'Standard', sqFt: 6000, price: 87000, status: 'sold', buyer: 'Davis Family', soldDate: '2024-02-20', closingDate: '2024-03-30' },
    { id: 8, unitNumber: 'L-008', type: 'lot', phase: 'Phase 1', tier: 'Premium', sqFt: 7800, price: 119200, status: 'available' },
    // Phase 2 - Lots
    { id: 9, unitNumber: 'L-101', type: 'lot', phase: 'Phase 2', tier: 'Standard', sqFt: 5200, price: 77400, status: 'available' },
    { id: 10, unitNumber: 'L-102', type: 'lot', phase: 'Phase 2', tier: 'Standard', sqFt: 5600, price: 82200, status: 'sold', buyer: 'Martinez Group', soldDate: '2024-03-05', closingDate: '2024-04-10' },
    { id: 11, unitNumber: 'L-103', type: 'lot', phase: 'Phase 2', tier: 'Premium', sqFt: 8000, price: 122000, status: 'reserved', buyer: 'Pending Contract', reservedDate: '2024-03-10' },
    { id: 12, unitNumber: 'L-104', type: 'lot', phase: 'Phase 2', tier: 'Estate', sqFt: 11500, price: 184000, status: 'available' },
    // Build-to-sell homes
    { id: 13, unitNumber: 'H-001', type: 'home', phase: 'Phase 1', tier: 'Model A', sqFt: 2400, price: 425000, status: 'sold', buyer: 'Wilson Family', soldDate: '2024-01-15', closingDate: '2024-06-30' },
    { id: 14, unitNumber: 'H-002', type: 'home', phase: 'Phase 1', tier: 'Model B', sqFt: 3200, price: 525000, status: 'under_construction' },
    { id: 15, unitNumber: 'H-003', type: 'home', phase: 'Phase 1', tier: 'Model A', sqFt: 2400, price: 435000, status: 'available' },
    // Rental units
    { id: 16, unitNumber: 'R-101', type: 'rental', phase: 'Phase 1', tier: '1BR', sqFt: 750, monthlyRent: 1450, status: 'leased', tenant: 'J. Thompson', leaseStart: '2024-02-01', leaseEnd: '2025-01-31' },
    { id: 17, unitNumber: 'R-102', type: 'rental', phase: 'Phase 1', tier: '2BR', sqFt: 1100, monthlyRent: 1850, status: 'available' },
    { id: 18, unitNumber: 'R-103', type: 'rental', phase: 'Phase 1', tier: '2BR', sqFt: 1100, monthlyRent: 1850, status: 'leased', tenant: 'S. Garcia', leaseStart: '2024-03-01', leaseEnd: '2025-02-28' }
  ];

  const phases = ['Phase 1', 'Phase 2', 'Phase 3'];
  const tiers = ['Standard', 'Premium', 'Estate', 'Model A', 'Model B', '1BR', '2BR'];
  const types = ['lot', 'home', 'rental'];

  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      const matchesSearch = !searchQuery ||
        unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (unit.buyer && unit.buyer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (unit.tenant && unit.tenant.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPhase = phaseFilter === 'all' || unit.phase === phaseFilter;
      const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
      const matchesTier = tierFilter === 'all' || unit.tier === tierFilter;
      const matchesType = typeFilter === 'all' || unit.type === typeFilter;
      return matchesSearch && matchesPhase && matchesStatus && matchesTier && matchesType;
    });
  }, [searchQuery, phaseFilter, statusFilter, tierFilter, typeFilter]);

  const stats = useMemo(() => {
    const forSale = units.filter(u => u.type !== 'rental');
    const rentals = units.filter(u => u.type === 'rental');
    return {
      totalUnits: units.length,
      available: units.filter(u => u.status === 'available').length,
      sold: units.filter(u => u.status === 'sold').length,
      reserved: units.filter(u => u.status === 'reserved').length,
      leased: units.filter(u => u.status === 'leased').length,
      totalValue: forSale.reduce((acc, u) => acc + (u.price || 0), 0),
      soldValue: forSale.filter(u => u.status === 'sold').reduce((acc, u) => acc + u.price, 0),
      monthlyRent: rentals.filter(u => u.status === 'leased').reduce((acc, u) => acc + u.monthlyRent, 0)
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'sold': return 'bg-blue-100 text-blue-700';
      case 'reserved': return 'bg-yellow-100 text-yellow-700';
      case 'leased': return 'bg-purple-100 text-purple-700';
      case 'under_construction': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'sold': return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'reserved': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'leased': return <Home className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lot': return <MapPin className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      case 'rental': return <Building2 className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const handleViewUnit = (unit) => {
    setSelectedUnit(unit);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Unit Inventory Manager</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Unit Inventory Manager</h1>
          <p className="text-gray-600 mt-2">Track lots, homes, and rental units across all phases</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Units</p>
            <p className="text-2xl font-bold">{stats.totalUnits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Sold</p>
            <p className="text-2xl font-bold text-blue-600">{stats.sold}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Reserved</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Value</p>
            <p className="text-2xl font-bold">${(stats.totalValue / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Sold Value</p>
            <p className="text-2xl font-bold text-emerald-600">${(stats.soldValue / 1000000).toFixed(2)}M</p>
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
                placeholder="Search units, buyers, tenants..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lot">Lots</SelectItem>
                <SelectItem value="home">Homes</SelectItem>
                <SelectItem value="rental">Rentals</SelectItem>
              </SelectContent>
            </Select>
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                {phases.map(phase => (
                  <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="leased">Leased</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {tiers.map(tier => (
                  <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unit List */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory ({filteredUnits.length} units)</CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Price/Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Buyer/Tenant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(unit.type)}
                        <span className="font-medium">{unit.unitNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{unit.type}</TableCell>
                    <TableCell>{unit.phase}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{unit.tier}</Badge>
                    </TableCell>
                    <TableCell>{unit.sqFt.toLocaleString()} sq ft</TableCell>
                    <TableCell>
                      {unit.type === 'rental'
                        ? `$${unit.monthlyRent?.toLocaleString()}/mo`
                        : `$${unit.price?.toLocaleString()}`
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(unit.status)}>
                        {getStatusIcon(unit.status)}
                        <span className="ml-1 capitalize">{unit.status.replace('_', ' ')}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {unit.buyer || unit.tenant || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewUnit(unit)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Tag className="w-4 h-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredUnits.map((unit) => (
                <Card key={unit.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewUnit(unit)}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(unit.type)}
                        <span className="font-bold">{unit.unitNumber}</span>
                      </div>
                      <Badge className={getStatusBadge(unit.status)}>
                        {unit.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phase</span>
                        <span>{unit.phase}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tier</span>
                        <span>{unit.tier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Size</span>
                        <span>{unit.sqFt.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-500">
                          {unit.type === 'rental' ? 'Rent' : 'Price'}
                        </span>
                        <span>
                          {unit.type === 'rental'
                            ? `$${unit.monthlyRent?.toLocaleString()}/mo`
                            : `$${unit.price?.toLocaleString()}`
                          }
                        </span>
                      </div>
                    </div>
                    {(unit.buyer || unit.tenant) && (
                      <div className="mt-3 pt-3 border-t text-sm">
                        <span className="text-gray-500">{unit.type === 'rental' ? 'Tenant' : 'Buyer'}:</span>
                        <span className="ml-2">{unit.buyer || unit.tenant}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unit Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUnit && getTypeIcon(selectedUnit.type)}
              Unit {selectedUnit?.unitNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedUnit && (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusBadge(selectedUnit.status)} style={{fontSize: '14px', padding: '6px 12px'}}>
                  {selectedUnit.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">{selectedUnit.tier}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Type</Label>
                  <p className="font-medium capitalize">{selectedUnit.type}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Phase</Label>
                  <p className="font-medium">{selectedUnit.phase}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Size</Label>
                  <p className="font-medium">{selectedUnit.sqFt.toLocaleString()} sq ft</p>
                </div>
                <div>
                  <Label className="text-gray-500">{selectedUnit.type === 'rental' ? 'Monthly Rent' : 'Price'}</Label>
                  <p className="font-medium text-lg">
                    {selectedUnit.type === 'rental'
                      ? `$${selectedUnit.monthlyRent?.toLocaleString()}/mo`
                      : `$${selectedUnit.price?.toLocaleString()}`
                    }
                  </p>
                </div>
              </div>
              {(selectedUnit.buyer || selectedUnit.tenant) && (
                <div className="pt-4 border-t">
                  <Label className="text-gray-500">{selectedUnit.type === 'rental' ? 'Tenant' : 'Buyer'}</Label>
                  <p className="font-medium">{selectedUnit.buyer || selectedUnit.tenant}</p>
                </div>
              )}
              {selectedUnit.soldDate && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Sold Date</Label>
                    <p className="font-medium">{selectedUnit.soldDate}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Closing Date</Label>
                    <p className="font-medium">{selectedUnit.closingDate}</p>
                  </div>
                </div>
              )}
              {selectedUnit.leaseStart && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Lease Start</Label>
                    <p className="font-medium">{selectedUnit.leaseStart}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Lease End</Label>
                    <p className="font-medium">{selectedUnit.leaseEnd}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>Close</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitInventoryManagerPage;
