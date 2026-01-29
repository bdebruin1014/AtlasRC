import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  DollarSign,
  Star,
  StarOff,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock lender data
const initialLenders = [
  {
    id: 1,
    name: 'First National Bank',
    type: 'Bank',
    primaryContact: 'John Williams',
    email: 'jwilliams@fnb.com',
    phone: '(555) 123-4567',
    loanTypes: ['Construction', 'Bridge', 'Permanent'],
    preferredDealSize: '$1M - $25M',
    minLTV: 65,
    maxLTV: 80,
    typicalRate: '7.5% - 9.0%',
    status: 'Active',
    rating: 5,
    totalLoansOriginated: 8,
    totalVolume: 45000000,
    lastContact: '2024-01-15',
    notes: 'Excellent relationship. Quick turnaround times.',
    specialties: ['Multifamily', 'Retail', 'Land Development']
  },
  {
    id: 2,
    name: 'Regional Capital Partners',
    type: 'Private Lender',
    primaryContact: 'Sarah Chen',
    email: 'schen@regionalcap.com',
    phone: '(555) 234-5678',
    loanTypes: ['Bridge', 'Mezzanine'],
    preferredDealSize: '$500K - $10M',
    minLTV: 70,
    maxLTV: 85,
    typicalRate: '10.0% - 14.0%',
    status: 'Active',
    rating: 4,
    totalLoansOriginated: 5,
    totalVolume: 12000000,
    lastContact: '2024-01-10',
    notes: 'Flexible terms, higher rates. Good for quick closes.',
    specialties: ['Fix & Flip', 'Value-Add', 'Distressed']
  },
  {
    id: 3,
    name: 'Community Credit Union',
    type: 'Credit Union',
    primaryContact: 'Mike Thompson',
    email: 'mthompson@communitycu.org',
    phone: '(555) 345-6789',
    loanTypes: ['Construction', 'Permanent'],
    preferredDealSize: '$250K - $5M',
    minLTV: 60,
    maxLTV: 75,
    typicalRate: '6.5% - 8.0%',
    status: 'Active',
    rating: 4,
    totalLoansOriginated: 3,
    totalVolume: 4500000,
    lastContact: '2024-01-05',
    notes: 'Best rates but slower process. Good for long-term holds.',
    specialties: ['Single Family', 'Small Multifamily']
  },
  {
    id: 4,
    name: 'SunBelt Capital',
    type: 'CMBS Lender',
    primaryContact: 'David Park',
    email: 'dpark@sunbeltcap.com',
    phone: '(555) 456-7890',
    loanTypes: ['Permanent', 'Refinance'],
    preferredDealSize: '$5M - $100M',
    minLTV: 65,
    maxLTV: 75,
    typicalRate: '6.0% - 7.5%',
    status: 'Active',
    rating: 3,
    totalLoansOriginated: 2,
    totalVolume: 28000000,
    lastContact: '2023-12-20',
    notes: 'Good for stabilized assets. Lengthy due diligence.',
    specialties: ['Stabilized Multifamily', 'Office', 'Industrial']
  },
  {
    id: 5,
    name: 'Hard Money Express',
    type: 'Hard Money',
    primaryContact: 'Lisa Martinez',
    email: 'lisa@hardmoneyexp.com',
    phone: '(555) 567-8901',
    loanTypes: ['Bridge', 'Fix & Flip'],
    preferredDealSize: '$100K - $2M',
    minLTV: 65,
    maxLTV: 70,
    typicalRate: '12.0% - 15.0%',
    status: 'Active',
    rating: 4,
    totalLoansOriginated: 12,
    totalVolume: 8500000,
    lastContact: '2024-01-18',
    notes: 'Fast funding, expensive. Use for short-term only.',
    specialties: ['Fix & Flip', 'Land', 'Distressed Properties']
  }
];

// Mock interaction history
const initialInteractions = [
  { id: 1, lenderId: 1, date: '2024-01-15', type: 'Call', summary: 'Discussed new land development deal', outcome: 'Positive - will send term sheet' },
  { id: 2, lenderId: 2, date: '2024-01-10', type: 'Email', summary: 'Submitted loan package for Oak Street project', outcome: 'Under review' },
  { id: 3, lenderId: 5, date: '2024-01-18', type: 'Meeting', summary: 'Quarterly relationship review', outcome: 'Strong relationship, discussed referral program' },
  { id: 4, lenderId: 1, date: '2024-01-08', type: 'Email', summary: 'Received term sheet for Riverside development', outcome: 'Terms acceptable - proceeding' },
  { id: 5, lenderId: 3, date: '2024-01-05', type: 'Call', summary: 'Initial inquiry about construction loan program', outcome: 'Scheduled follow-up meeting' },
];

export default function LenderRelationshipManagerPage() {
  const [lenders, setLenders] = useState(initialLenders);
  const [interactions, setInteractions] = useState(initialInteractions);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loanTypeFilter, setLoanTypeFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [selectedLender, setSelectedLender] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const [newLender, setNewLender] = useState({
    name: '',
    type: '',
    primaryContact: '',
    email: '',
    phone: '',
    loanTypes: [],
    preferredDealSize: '',
    minLTV: '',
    maxLTV: '',
    typicalRate: '',
    notes: '',
    specialties: []
  });

  const [newInteraction, setNewInteraction] = useState({
    type: '',
    summary: '',
    outcome: ''
  });

  // Filter lenders
  const filteredLenders = useMemo(() => {
    return lenders.filter(lender => {
      const matchesSearch = lender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lender.primaryContact.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || lender.type === typeFilter;
      const matchesLoanType = loanTypeFilter === 'all' || lender.loanTypes.includes(loanTypeFilter);
      return matchesSearch && matchesType && matchesLoanType;
    });
  }, [lenders, searchTerm, typeFilter, loanTypeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalVolume = lenders.reduce((sum, l) => sum + l.totalVolume, 0);
    const totalLoans = lenders.reduce((sum, l) => sum + l.totalLoansOriginated, 0);
    const avgRating = lenders.reduce((sum, l) => sum + l.rating, 0) / lenders.length;
    return {
      totalLenders: lenders.length,
      activeLenders: lenders.filter(l => l.status === 'Active').length,
      totalVolume,
      totalLoans,
      avgRating: avgRating.toFixed(1)
    };
  }, [lenders]);

  const handleAddLender = () => {
    const lender = {
      ...newLender,
      id: Math.max(...lenders.map(l => l.id)) + 1,
      status: 'Active',
      rating: 3,
      totalLoansOriginated: 0,
      totalVolume: 0,
      lastContact: new Date().toISOString().split('T')[0],
      minLTV: parseInt(newLender.minLTV) || 0,
      maxLTV: parseInt(newLender.maxLTV) || 0,
      loanTypes: newLender.loanTypes.length ? newLender.loanTypes : ['Bridge'],
      specialties: newLender.specialties.length ? newLender.specialties : []
    };
    setLenders([...lenders, lender]);
    setIsAddDialogOpen(false);
    setNewLender({
      name: '',
      type: '',
      primaryContact: '',
      email: '',
      phone: '',
      loanTypes: [],
      preferredDealSize: '',
      minLTV: '',
      maxLTV: '',
      typicalRate: '',
      notes: '',
      specialties: []
    });
    toast({
      title: "Lender Added",
      description: `${lender.name} has been added to your lender network.`
    });
  };

  const handleAddInteraction = () => {
    if (!selectedLender) return;
    const interaction = {
      id: Math.max(...interactions.map(i => i.id)) + 1,
      lenderId: selectedLender.id,
      date: new Date().toISOString().split('T')[0],
      ...newInteraction
    };
    setInteractions([interaction, ...interactions]);

    // Update last contact
    setLenders(lenders.map(l =>
      l.id === selectedLender.id
        ? { ...l, lastContact: interaction.date }
        : l
    ));

    setIsInteractionDialogOpen(false);
    setNewInteraction({ type: '', summary: '', outcome: '' });
    toast({
      title: "Interaction Logged",
      description: `Interaction with ${selectedLender.name} has been recorded.`
    });
  };

  const handleRatingChange = (lenderId, newRating) => {
    setLenders(lenders.map(l =>
      l.id === lenderId ? { ...l, rating: newRating } : l
    ));
    toast({
      title: "Rating Updated",
      description: `Lender rating has been updated to ${newRating} stars.`
    });
  };

  const getLenderInteractions = (lenderId) => {
    return interactions.filter(i => i.lenderId === lenderId);
  };

  const renderStars = (rating, lenderId) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => handleRatingChange(lenderId, star)}
            className="hover:scale-110 transition-transform"
          >
            {star <= rating ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const getTypeColor = (type) => {
    const colors = {
      'Bank': 'bg-blue-100 text-blue-800',
      'Private Lender': 'bg-purple-100 text-purple-800',
      'Credit Union': 'bg-green-100 text-green-800',
      'CMBS Lender': 'bg-orange-100 text-orange-800',
      'Hard Money': 'bg-red-100 text-red-800',
      'SBA Lender': 'bg-cyan-100 text-cyan-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lender Relationship Manager</h1>
          <p className="text-muted-foreground">Manage your lending relationships and track interactions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lender
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Lender</DialogTitle>
              <DialogDescription>Add a new lender to your network</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lender Name</Label>
                  <Input
                    value={newLender.name}
                    onChange={(e) => setNewLender({ ...newLender, name: e.target.value })}
                    placeholder="First National Bank"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newLender.type}
                    onValueChange={(value) => setNewLender({ ...newLender, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank">Bank</SelectItem>
                      <SelectItem value="Private Lender">Private Lender</SelectItem>
                      <SelectItem value="Credit Union">Credit Union</SelectItem>
                      <SelectItem value="CMBS Lender">CMBS Lender</SelectItem>
                      <SelectItem value="Hard Money">Hard Money</SelectItem>
                      <SelectItem value="SBA Lender">SBA Lender</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Primary Contact</Label>
                  <Input
                    value={newLender.primaryContact}
                    onChange={(e) => setNewLender({ ...newLender, primaryContact: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newLender.email}
                    onChange={(e) => setNewLender({ ...newLender, email: e.target.value })}
                    placeholder="john@bank.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newLender.phone}
                    onChange={(e) => setNewLender({ ...newLender, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferred Deal Size</Label>
                  <Input
                    value={newLender.preferredDealSize}
                    onChange={(e) => setNewLender({ ...newLender, preferredDealSize: e.target.value })}
                    placeholder="$1M - $25M"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Typical Rate Range</Label>
                  <Input
                    value={newLender.typicalRate}
                    onChange={(e) => setNewLender({ ...newLender, typicalRate: e.target.value })}
                    placeholder="7.5% - 9.0%"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min LTV (%)</Label>
                  <Input
                    type="number"
                    value={newLender.minLTV}
                    onChange={(e) => setNewLender({ ...newLender, minLTV: e.target.value })}
                    placeholder="65"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max LTV (%)</Label>
                  <Input
                    type="number"
                    value={newLender.maxLTV}
                    onChange={(e) => setNewLender({ ...newLender, maxLTV: e.target.value })}
                    placeholder="80"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={newLender.notes}
                  onChange={(e) => setNewLender({ ...newLender, notes: e.target.value })}
                  placeholder="Relationship notes, preferences, special programs..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddLender} disabled={!newLender.name || !newLender.type}>
                Add Lender
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lenders</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLenders}</div>
            <p className="text-xs text-muted-foreground">{stats.activeLenders} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalVolume / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Loan originations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLoans}</div>
            <p className="text-xs text-muted-foreground">Originated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}</div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interactions.length}</div>
            <p className="text-xs text-muted-foreground">Logged this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lenders or contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lender Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Bank">Bank</SelectItem>
                <SelectItem value="Private Lender">Private Lender</SelectItem>
                <SelectItem value="Credit Union">Credit Union</SelectItem>
                <SelectItem value="CMBS Lender">CMBS Lender</SelectItem>
                <SelectItem value="Hard Money">Hard Money</SelectItem>
              </SelectContent>
            </Select>
            <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Loan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Loan Types</SelectItem>
                <SelectItem value="Construction">Construction</SelectItem>
                <SelectItem value="Bridge">Bridge</SelectItem>
                <SelectItem value="Permanent">Permanent</SelectItem>
                <SelectItem value="Mezzanine">Mezzanine</SelectItem>
                <SelectItem value="Fix & Flip">Fix & Flip</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lender Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLenders.map(lender => (
          <Card key={lender.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{lender.name}</CardTitle>
                  <Badge className={`mt-1 ${getTypeColor(lender.type)}`}>{lender.type}</Badge>
                </div>
                {renderStars(lender.rating, lender.id)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{lender.primaryContact}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${lender.email}`} className="text-blue-600 hover:underline">
                    {lender.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lender.phone}</span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deal Size:</span>
                  <span className="font-medium">{lender.preferredDealSize}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">LTV Range:</span>
                  <span className="font-medium">{lender.minLTV}% - {lender.maxLTV}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rates:</span>
                  <span className="font-medium">{lender.typicalRate}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {lender.loanTypes.map(type => (
                  <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                ))}
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Track Record:</span>
                  <span className="font-medium">
                    {lender.totalLoansOriginated} loans / ${(lender.totalVolume / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last contact: {lender.lastContact}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedLender(lender);
                    setIsInteractionDialogOpen(true);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Log Interaction
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLender(lender)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lender Detail Dialog */}
      {selectedLender && !isInteractionDialogOpen && (
        <Dialog open={!!selectedLender} onOpenChange={() => setSelectedLender(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedLender.name}
                <Badge className={getTypeColor(selectedLender.type)}>{selectedLender.type}</Badge>
              </DialogTitle>
              <DialogDescription>Lender details and interaction history</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">Interaction History</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Primary Contact:</strong> {selectedLender.primaryContact}</div>
                      <div><strong>Email:</strong> {selectedLender.email}</div>
                      <div><strong>Phone:</strong> {selectedLender.phone}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Lending Parameters</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Deal Size:</strong> {selectedLender.preferredDealSize}</div>
                      <div><strong>LTV Range:</strong> {selectedLender.minLTV}% - {selectedLender.maxLTV}%</div>
                      <div><strong>Typical Rates:</strong> {selectedLender.typicalRate}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Loan Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLender.loanTypes.map(type => (
                      <Badge key={type}>{type}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Property Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLender.specialties.map(spec => (
                      <Badge key={spec} variant="outline">{spec}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold">{selectedLender.totalLoansOriginated}</div>
                      <div className="text-sm text-muted-foreground">Loans Originated</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold">${(selectedLender.totalVolume / 1000000).toFixed(1)}M</div>
                      <div className="text-sm text-muted-foreground">Total Volume</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold">{selectedLender.rating}/5</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getLenderInteractions(selectedLender.id).map(interaction => (
                      <TableRow key={interaction.id}>
                        <TableCell>{interaction.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{interaction.type}</Badge>
                        </TableCell>
                        <TableCell>{interaction.summary}</TableCell>
                        <TableCell>{interaction.outcome}</TableCell>
                      </TableRow>
                    ))}
                    {getLenderInteractions(selectedLender.id).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No interactions recorded
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="notes">
                <div className="p-4 bg-muted rounded-lg">
                  <p>{selectedLender.notes || 'No notes recorded'}</p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Log Interaction Dialog */}
      <Dialog open={isInteractionDialogOpen} onOpenChange={setIsInteractionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
            <DialogDescription>
              Record an interaction with {selectedLender?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Interaction Type</Label>
              <Select
                value={newInteraction.type}
                onValueChange={(value) => setNewInteraction({ ...newInteraction, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">Phone Call</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Site Visit">Site Visit</SelectItem>
                  <SelectItem value="Term Sheet">Term Sheet Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                value={newInteraction.summary}
                onChange={(e) => setNewInteraction({ ...newInteraction, summary: e.target.value })}
                placeholder="What was discussed..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Input
                value={newInteraction.outcome}
                onChange={(e) => setNewInteraction({ ...newInteraction, outcome: e.target.value })}
                placeholder="Next steps, result..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInteractionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddInteraction} disabled={!newInteraction.type || !newInteraction.summary}>
              Log Interaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
