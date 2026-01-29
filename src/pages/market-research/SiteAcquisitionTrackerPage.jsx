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
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  User,
  Building2,
  Map,
  Filter,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SiteAcquisitionTrackerPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  const [siteData, setSiteData] = useState({
    address: '',
    city: '',
    state: '',
    market: '',
    acres: '',
    askingPrice: '',
    zoning: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    notes: ''
  });

  const sites = [
    {
      id: 1,
      address: '5500 Highway 290',
      city: 'Austin',
      state: 'TX',
      market: 'Austin Metro',
      acres: 45.0,
      askingPrice: 2250000,
      pricePerAcre: 50000,
      zoning: 'Agricultural (ETJ)',
      status: 'contacted',
      owner: {
        name: 'Johnson Ranch Holdings',
        contact: 'Robert Johnson',
        phone: '(512) 555-0123',
        email: 'rjohnson@johnsonranch.com'
      },
      lastContact: '2024-03-01',
      nextFollowUp: '2024-03-15',
      notes: 'Owner interested but wants to wait until Q2 to discuss',
      interestLevel: 'medium'
    },
    {
      id: 2,
      address: 'FM 1431 & CR 270',
      city: 'Liberty Hill',
      state: 'TX',
      market: 'Austin Metro',
      acres: 120.0,
      askingPrice: 6000000,
      pricePerAcre: 50000,
      zoning: 'Agricultural',
      status: 'negotiating',
      owner: {
        name: 'Smith Family Trust',
        contact: 'Margaret Smith',
        phone: '(512) 555-0456',
        email: 'msmith@smithtrust.com'
      },
      lastContact: '2024-03-05',
      nextFollowUp: '2024-03-12',
      notes: 'Sent LOI, awaiting response',
      interestLevel: 'high'
    },
    {
      id: 3,
      address: '2100 Industrial Blvd',
      city: 'Georgetown',
      state: 'TX',
      market: 'Austin Metro',
      acres: 25.0,
      askingPrice: 1875000,
      pricePerAcre: 75000,
      zoning: 'I-1 Industrial',
      status: 'identified',
      owner: {
        name: 'Industrial Partners LLC',
        contact: 'James Williams',
        phone: '(512) 555-0789',
        email: 'jwilliams@indpartners.com'
      },
      lastContact: null,
      nextFollowUp: '2024-03-10',
      notes: 'Identified from tax records, need to make initial contact',
      interestLevel: 'unknown'
    },
    {
      id: 4,
      address: 'Old San Antonio Road',
      city: 'Buda',
      state: 'TX',
      market: 'Austin Metro',
      acres: 80.0,
      askingPrice: 4800000,
      pricePerAcre: 60000,
      zoning: 'R-1 (pending)',
      status: 'under_contract',
      owner: {
        name: 'Davis Investments',
        contact: 'Thomas Davis',
        phone: '(512) 555-0321',
        email: 'tdavis@davisinv.com'
      },
      lastContact: '2024-03-08',
      nextFollowUp: null,
      notes: 'Contract signed, DD period ends 4/15',
      interestLevel: 'high'
    },
    {
      id: 5,
      address: '1800 Ranch Road 12',
      city: 'Dripping Springs',
      state: 'TX',
      market: 'Austin Metro',
      acres: 35.0,
      askingPrice: 2800000,
      pricePerAcre: 80000,
      zoning: 'SF-2',
      status: 'not_interested',
      owner: {
        name: 'Hill Country Estates',
        contact: 'Susan Miller',
        phone: '(512) 555-0654',
        email: 'smiller@hillcountry.com'
      },
      lastContact: '2024-02-20',
      nextFollowUp: null,
      notes: 'Owner not interested in selling at this time',
      interestLevel: 'none'
    },
    {
      id: 6,
      address: 'CR 152 at Highway 29',
      city: 'Bertram',
      state: 'TX',
      market: 'Austin Metro',
      acres: 200.0,
      askingPrice: 7000000,
      pricePerAcre: 35000,
      zoning: 'Agricultural',
      status: 'contacted',
      owner: {
        name: 'Wilson Ranch',
        contact: 'David Wilson',
        phone: '(512) 555-0987',
        email: 'dwilson@wilsonranch.com'
      },
      lastContact: '2024-03-02',
      nextFollowUp: '2024-03-16',
      notes: 'Initial call made, owner receptive to discussions',
      interestLevel: 'medium'
    }
  ];

  const markets = ['Austin Metro', 'San Antonio Metro', 'Dallas Metro', 'Houston Metro'];
  const statuses = [
    { value: 'identified', label: 'Identified', color: 'bg-gray-100 text-gray-700' },
    { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700' },
    { value: 'negotiating', label: 'Negotiating', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'under_contract', label: 'Under Contract', color: 'bg-green-100 text-green-700' },
    { value: 'not_interested', label: 'Not Interested', color: 'bg-red-100 text-red-700' }
  ];

  const filteredSites = useMemo(() => {
    return sites.filter(site => {
      const matchesSearch = !searchQuery ||
        site.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.owner.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
      const matchesMarket = marketFilter === 'all' || site.market === marketFilter;
      return matchesSearch && matchesStatus && matchesMarket;
    });
  }, [searchQuery, statusFilter, marketFilter]);

  const stats = useMemo(() => {
    const activeSites = sites.filter(s => !['not_interested'].includes(s.status));
    return {
      totalSites: sites.length,
      activeSites: activeSites.length,
      totalAcres: activeSites.reduce((acc, s) => acc + s.acres, 0),
      totalValue: activeSites.reduce((acc, s) => acc + s.askingPrice, 0),
      underContract: sites.filter(s => s.status === 'under_contract').length,
      needsFollowUp: sites.filter(s => s.nextFollowUp && new Date(s.nextFollowUp) <= new Date()).length
    };
  }, []);

  const getStatusBadge = (status) => {
    const statusInfo = statuses.find(s => s.value === status);
    return statusInfo?.color || 'bg-gray-100 text-gray-700';
  };

  const getInterestBadge = (level) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-orange-100 text-orange-700';
      case 'none': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleLogContact = (site) => {
    setSelectedSite(site);
    setShowContactModal(true);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Site Acquisition Tracker</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Site Acquisition Tracker</h1>
          <p className="text-gray-600 mt-2">Track potential sites, owner contacts, and outreach status</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Site
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Sites</p>
            <p className="text-2xl font-bold">{stats.totalSites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-blue-600">{stats.activeSites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Acres</p>
            <p className="text-2xl font-bold">{stats.totalAcres}</p>
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
            <p className="text-sm text-gray-500">Under Contract</p>
            <p className="text-2xl font-bold text-green-600">{stats.underContract}</p>
          </CardContent>
        </Card>
        <Card className={stats.needsFollowUp > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Needs Follow-Up</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.needsFollowUp}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by address, city, or owner..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Sites Table */}
      <Card>
        <CardHeader>
          <CardTitle>Site Tracking ({filteredSites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Acres</TableHead>
                <TableHead>Asking Price</TableHead>
                <TableHead>$/Acre</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Next Follow-Up</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.map((site) => {
                const needsFollowUp = site.nextFollowUp && new Date(site.nextFollowUp) <= new Date();
                return (
                  <TableRow key={site.id} className={needsFollowUp ? 'bg-yellow-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{site.address}</p>
                          <p className="text-sm text-gray-500">{site.city}, {site.state}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{site.owner.name}</p>
                        <p className="text-sm text-gray-500">{site.owner.contact}</p>
                      </div>
                    </TableCell>
                    <TableCell>{site.acres}</TableCell>
                    <TableCell className="font-semibold">
                      ${site.askingPrice.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ${site.pricePerAcre.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(site.status)}>
                        {statuses.find(s => s.value === site.status)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getInterestBadge(site.interestLevel)}>
                        {site.interestLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {site.nextFollowUp ? (
                        <div className={`flex items-center gap-1 ${needsFollowUp ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                          <Clock className="w-4 h-4" />
                          {site.nextFollowUp}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleLogContact(site)}>
                          <MessageSquare className="w-4 h-4" />
                        </Button>
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
                              <Phone className="w-4 h-4 mr-2" />
                              Call Owner
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Email Owner
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Move to Pipeline
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Site Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Potential Site</DialogTitle>
            <DialogDescription>Track a new site for potential acquisition</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label>Site Address</Label>
              <Input
                placeholder="123 Highway 290"
                value={siteData.address}
                onChange={(e) => setSiteData({...siteData, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>City</Label>
                <Input
                  value={siteData.city}
                  onChange={(e) => setSiteData({...siteData, city: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>State</Label>
                <Input
                  value={siteData.state}
                  onChange={(e) => setSiteData({...siteData, state: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Market</Label>
                <Select
                  value={siteData.market}
                  onValueChange={(value) => setSiteData({...siteData, market: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map(market => (
                      <SelectItem key={market} value={market}>{market}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Acres</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={siteData.acres}
                  onChange={(e) => setSiteData({...siteData, acres: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Asking Price</Label>
                <Input
                  type="number"
                  value={siteData.askingPrice}
                  onChange={(e) => setSiteData({...siteData, askingPrice: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Zoning</Label>
                <Input
                  placeholder="e.g., R-1, Agricultural"
                  value={siteData.zoning}
                  onChange={(e) => setSiteData({...siteData, zoning: e.target.value})}
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Owner Information</Label>
            </div>
            <div className="grid gap-2">
              <Label>Owner Name</Label>
              <Input
                placeholder="Property owner or entity name"
                value={siteData.ownerName}
                onChange={(e) => setSiteData({...siteData, ownerName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input
                  placeholder="(512) 555-0123"
                  value={siteData.ownerPhone}
                  onChange={(e) => setSiteData({...siteData, ownerPhone: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="owner@email.com"
                  value={siteData.ownerEmail}
                  onChange={(e) => setSiteData({...siteData, ownerEmail: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional details about the site..."
                value={siteData.notes}
                onChange={(e) => setSiteData({...siteData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Add Site</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Log Contact</DialogTitle>
            <DialogDescription>
              Record contact with {selectedSite?.owner.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Contact Type</Label>
              <Select defaultValue="phone">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">In-Person Meeting</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea placeholder="Summary of the conversation..." />
            </div>
            <div className="grid gap-2">
              <Label>Interest Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select interest level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High - Ready to negotiate</SelectItem>
                  <SelectItem value="medium">Medium - Interested but not urgent</SelectItem>
                  <SelectItem value="low">Low - Might consider in future</SelectItem>
                  <SelectItem value="none">None - Not interested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Next Follow-Up Date</Label>
              <Input type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Log Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteAcquisitionTrackerPage;
