import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  MapPin,
  Building2,
  DollarSign,
  Trash2,
  Edit2,
  Link2,
  Unlink,
  FileText,
  MoreHorizontal,
  ChevronRight,
  Layers,
  Map,
  Calculator,
  ArrowUpDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MultiPropertyOpportunityPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const [propertyData, setPropertyData] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    parcelId: '',
    acres: '',
    askingPrice: '',
    propertyType: 'land',
    zoning: '',
    notes: ''
  });

  const opportunities = [
    {
      id: 1,
      name: 'Westside Land Assembly',
      status: 'due_diligence',
      totalAcres: 45.5,
      totalPrice: 2850000,
      propertyCount: 4,
      properties: [
        { id: 1, address: '1234 Oak Street', parcelId: 'P-001-234', acres: 12.5, price: 750000, type: 'land', status: 'under_contract' },
        { id: 2, address: '1240 Oak Street', parcelId: 'P-001-235', acres: 10.0, price: 600000, type: 'land', status: 'under_contract' },
        { id: 3, address: '1250 Oak Street', parcelId: 'P-001-236', acres: 15.0, price: 900000, type: 'land', status: 'negotiating' },
        { id: 4, address: '1260 Oak Street', parcelId: 'P-001-237', acres: 8.0, price: 600000, type: 'land', status: 'negotiating' }
      ],
      stage: 'Due Diligence',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Downtown Portfolio Acquisition',
      status: 'negotiation',
      totalAcres: 2.8,
      totalPrice: 4500000,
      propertyCount: 3,
      properties: [
        { id: 5, address: '500 Main Street', parcelId: 'D-100-001', acres: 1.2, price: 2000000, type: 'commercial', status: 'loi_signed' },
        { id: 6, address: '502 Main Street', parcelId: 'D-100-002', acres: 0.8, price: 1500000, type: 'commercial', status: 'loi_signed' },
        { id: 7, address: '504 Main Street', parcelId: 'D-100-003', acres: 0.8, price: 1000000, type: 'mixed_use', status: 'loi_signed' }
      ],
      stage: 'LOI Signed',
      createdAt: '2024-02-01'
    },
    {
      id: 3,
      name: 'Riverfront Development Parcels',
      status: 'sourcing',
      totalAcres: 120.0,
      totalPrice: 6000000,
      propertyCount: 6,
      properties: [
        { id: 8, address: 'Lot A - River Road', parcelId: 'R-500-001', acres: 25.0, price: 1250000, type: 'land', status: 'identified' },
        { id: 9, address: 'Lot B - River Road', parcelId: 'R-500-002', acres: 20.0, price: 1000000, type: 'land', status: 'identified' },
        { id: 10, address: 'Lot C - River Road', parcelId: 'R-500-003', acres: 30.0, price: 1500000, type: 'land', status: 'contacted' },
        { id: 11, address: 'Lot D - River Road', parcelId: 'R-500-004', acres: 15.0, price: 750000, type: 'land', status: 'contacted' },
        { id: 12, address: 'Lot E - River Road', parcelId: 'R-500-005', acres: 18.0, price: 900000, type: 'land', status: 'identified' },
        { id: 13, address: 'Lot F - River Road', parcelId: 'R-500-006', acres: 12.0, price: 600000, type: 'land', status: 'identified' }
      ],
      stage: 'Sourcing',
      createdAt: '2024-02-15'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'under_contract': return 'bg-green-100 text-green-700';
      case 'loi_signed': return 'bg-blue-100 text-blue-700';
      case 'negotiating': return 'bg-yellow-100 text-yellow-700';
      case 'contacted': return 'bg-purple-100 text-purple-700';
      case 'identified': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Due Diligence': return 'bg-blue-100 text-blue-700';
      case 'LOI Signed': return 'bg-green-100 text-green-700';
      case 'Sourcing': return 'bg-yellow-100 text-yellow-700';
      case 'Closed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'land': return <Map className="w-4 h-4" />;
      case 'commercial': return <Building2 className="w-4 h-4" />;
      case 'residential': return <Building2 className="w-4 h-4" />;
      case 'mixed_use': return <Layers className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const filteredOpportunities = opportunities.filter(opp =>
    !searchQuery ||
    opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.properties.some(p => p.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalStats = useMemo(() => ({
    opportunities: opportunities.length,
    properties: opportunities.reduce((acc, opp) => acc + opp.propertyCount, 0),
    acres: opportunities.reduce((acc, opp) => acc + opp.totalAcres, 0),
    value: opportunities.reduce((acc, opp) => acc + opp.totalPrice, 0)
  }), []);

  const handleAddProperty = (opportunityId) => {
    setSelectedOpportunity(opportunities.find(o => o.id === opportunityId));
    setPropertyData({
      address: '',
      city: '',
      state: '',
      zip: '',
      parcelId: '',
      acres: '',
      askingPrice: '',
      propertyType: 'land',
      zoning: '',
      notes: ''
    });
    setShowAddPropertyModal(true);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Multi-Property Opportunities</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Multi-Property Opportunities</h1>
          <p className="text-gray-600 mt-2">Manage acquisitions with multiple parcels or properties</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Opportunity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Opportunities</p>
                <p className="text-2xl font-bold">{totalStats.opportunities}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <p className="text-2xl font-bold">{totalStats.properties}</p>
              </div>
              <Building2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Acreage</p>
                <p className="text-2xl font-bold">{totalStats.acres.toFixed(1)}</p>
              </div>
              <Map className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold">${(totalStats.value / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search opportunities or properties..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => (
          <Card key={opportunity.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {opportunity.name}
                      <Badge className={getStageBadge(opportunity.stage)}>{opportunity.stage}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {opportunity.propertyCount} properties • {opportunity.totalAcres} acres • ${opportunity.totalPrice.toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleAddProperty(opportunity.id)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Property
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Opportunity
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calculator className="w-4 h-4 mr-2" />
                        View Pro Forma
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Parcel ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Acres</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>$/Acre</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunity.properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{property.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {property.parcelId}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getPropertyTypeIcon(property.type)}
                          <span className="capitalize">{property.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{property.acres.toFixed(1)}</TableCell>
                      <TableCell>${property.price.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-500">
                        ${Math.round(property.price / property.acres).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(property.status)}>
                          {property.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              Documents
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Unlink className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={3} className="font-semibold">Total</TableCell>
                    <TableCell className="font-semibold">{opportunity.totalAcres.toFixed(1)}</TableCell>
                    <TableCell className="font-semibold">${opportunity.totalPrice.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-gray-500">
                      ${Math.round(opportunity.totalPrice / opportunity.totalAcres).toLocaleString()}
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Property Modal */}
      <Dialog open={showAddPropertyModal} onOpenChange={setShowAddPropertyModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Property to Opportunity</DialogTitle>
            <DialogDescription>
              Link a new property to &quot;{selectedOpportunity?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Property Address</Label>
              <Input
                placeholder="123 Main Street"
                value={propertyData.address}
                onChange={(e) => setPropertyData({...propertyData, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>City</Label>
                <Input
                  placeholder="City"
                  value={propertyData.city}
                  onChange={(e) => setPropertyData({...propertyData, city: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>State</Label>
                <Input
                  placeholder="State"
                  value={propertyData.state}
                  onChange={(e) => setPropertyData({...propertyData, state: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>ZIP</Label>
                <Input
                  placeholder="ZIP"
                  value={propertyData.zip}
                  onChange={(e) => setPropertyData({...propertyData, zip: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Parcel ID</Label>
                <Input
                  placeholder="P-XXX-XXX"
                  value={propertyData.parcelId}
                  onChange={(e) => setPropertyData({...propertyData, parcelId: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Property Type</Label>
                <Select
                  value={propertyData.propertyType}
                  onValueChange={(value) => setPropertyData({...propertyData, propertyType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="mixed_use">Mixed Use</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Acres</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={propertyData.acres}
                  onChange={(e) => setPropertyData({...propertyData, acres: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Asking Price</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={propertyData.askingPrice}
                  onChange={(e) => setPropertyData({...propertyData, askingPrice: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Zoning</Label>
              <Input
                placeholder="e.g., R-1, C-2, Agricultural"
                value={propertyData.zoning}
                onChange={(e) => setPropertyData({...propertyData, zoning: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional property details..."
                value={propertyData.notes}
                onChange={(e) => setPropertyData({...propertyData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPropertyModal(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Link2 className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiPropertyOpportunityPage;
