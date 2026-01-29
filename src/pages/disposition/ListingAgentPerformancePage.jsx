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
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Search,
  User,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Clock,
  Star,
  MoreHorizontal,
  Eye,
  Edit2,
  BarChart3,
  Target,
  Award
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ListingAgentPerformancePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [agentData, setAgentData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    market: '',
    commissionRate: ''
  });

  const agents = [
    {
      id: 1,
      name: 'Jennifer Martinez',
      company: 'Keller Williams Realty',
      phone: '(512) 555-0101',
      email: 'jmartinez@kw.com',
      market: 'Austin Metro',
      commissionRate: 3.0,
      rating: 4.8,
      status: 'active',
      metrics: {
        totalListings: 12,
        activeListings: 3,
        soldListings: 9,
        totalVolume: 4250000,
        avgDaysOnMarket: 28,
        avgListToSaleRatio: 98.5,
        avgSalePrice: 472222
      },
      recentSales: [
        { address: 'Lot 15, Phase 1', listPrice: 95000, salePrice: 94500, daysOnMarket: 21, closeDate: '2024-02-15' },
        { address: 'Lot 22, Phase 1', listPrice: 110000, salePrice: 108000, daysOnMarket: 35, closeDate: '2024-02-28' },
        { address: 'Lot 8, Phase 2', listPrice: 85000, salePrice: 85000, daysOnMarket: 14, closeDate: '2024-03-05' }
      ]
    },
    {
      id: 2,
      name: 'Robert Thompson',
      company: 'RE/MAX Capital City',
      phone: '(512) 555-0202',
      email: 'rthompson@remax.com',
      market: 'Austin Metro',
      commissionRate: 2.5,
      rating: 4.5,
      status: 'active',
      metrics: {
        totalListings: 8,
        activeListings: 2,
        soldListings: 6,
        totalVolume: 2850000,
        avgDaysOnMarket: 42,
        avgListToSaleRatio: 96.2,
        avgSalePrice: 475000
      },
      recentSales: [
        { address: 'Unit 101, Building A', listPrice: 425000, salePrice: 410000, daysOnMarket: 45, closeDate: '2024-01-20' },
        { address: 'Unit 205, Building B', listPrice: 450000, salePrice: 440000, daysOnMarket: 38, closeDate: '2024-02-10' }
      ]
    },
    {
      id: 3,
      name: 'Sarah Chen',
      company: 'Compass Real Estate',
      phone: '(512) 555-0303',
      email: 'schen@compass.com',
      market: 'Austin Metro',
      commissionRate: 2.75,
      rating: 4.9,
      status: 'active',
      metrics: {
        totalListings: 15,
        activeListings: 4,
        soldListings: 11,
        totalVolume: 5500000,
        avgDaysOnMarket: 22,
        avgListToSaleRatio: 99.1,
        avgSalePrice: 500000
      },
      recentSales: [
        { address: 'Lot 45, Phase 2', listPrice: 125000, salePrice: 125000, daysOnMarket: 18, closeDate: '2024-03-01' },
        { address: 'Home 12, Phase 1', listPrice: 525000, salePrice: 520000, daysOnMarket: 25, closeDate: '2024-02-20' }
      ]
    },
    {
      id: 4,
      name: 'Michael Davis',
      company: 'Coldwell Banker',
      phone: '(210) 555-0404',
      email: 'mdavis@coldwellbanker.com',
      market: 'San Antonio Metro',
      commissionRate: 3.0,
      rating: 4.3,
      status: 'active',
      metrics: {
        totalListings: 6,
        activeListings: 2,
        soldListings: 4,
        totalVolume: 1800000,
        avgDaysOnMarket: 55,
        avgListToSaleRatio: 94.5,
        avgSalePrice: 450000
      },
      recentSales: [
        { address: 'Lot 3, Riverfront', listPrice: 150000, salePrice: 142000, daysOnMarket: 60, closeDate: '2024-02-28' }
      ]
    },
    {
      id: 5,
      name: 'Amanda Foster',
      company: 'Independent Broker',
      phone: '(512) 555-0505',
      email: 'afoster@gmail.com',
      market: 'Austin Metro',
      commissionRate: 2.5,
      rating: 4.6,
      status: 'inactive',
      metrics: {
        totalListings: 5,
        activeListings: 0,
        soldListings: 5,
        totalVolume: 1250000,
        avgDaysOnMarket: 35,
        avgListToSaleRatio: 97.8,
        avgSalePrice: 250000
      },
      recentSales: []
    }
  ];

  const markets = ['Austin Metro', 'San Antonio Metro', 'Dallas Metro', 'Houston Metro'];

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = !searchQuery ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMarket = marketFilter === 'all' || agent.market === marketFilter;
      return matchesSearch && matchesMarket;
    });
  }, [searchQuery, marketFilter]);

  const portfolioStats = useMemo(() => {
    const activeAgents = agents.filter(a => a.status === 'active');
    const allMetrics = activeAgents.map(a => a.metrics);
    return {
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      totalVolume: allMetrics.reduce((acc, m) => acc + m.totalVolume, 0),
      totalSold: allMetrics.reduce((acc, m) => acc + m.soldListings, 0),
      avgDOM: Math.round(allMetrics.reduce((acc, m) => acc + m.avgDaysOnMarket, 0) / allMetrics.length),
      avgListToSale: (allMetrics.reduce((acc, m) => acc + m.avgListToSaleRatio, 0) / allMetrics.length).toFixed(1)
    };
  }, []);

  const getPerformanceColor = (ratio) => {
    if (ratio >= 98) return 'text-green-600';
    if (ratio >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDOMColor = (days) => {
    if (days <= 30) return 'text-green-600';
    if (days <= 45) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleViewAgent = (agent) => {
    setSelectedAgent(agent);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Listing Agent Performance</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Listing Agent Performance</h1>
          <p className="text-gray-600 mt-2">Track hired agents by days on market, list-to-sale ratio, and volume</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Agents</p>
            <p className="text-2xl font-bold">{portfolioStats.totalAgents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{portfolioStats.activeAgents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Volume</p>
            <p className="text-2xl font-bold">${(portfolioStats.totalVolume / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Units Sold</p>
            <p className="text-2xl font-bold">{portfolioStats.totalSold}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Avg Days on Market</p>
            <p className={`text-2xl font-bold ${getDOMColor(portfolioStats.avgDOM)}`}>{portfolioStats.avgDOM}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Avg List-to-Sale</p>
            <p className={`text-2xl font-bold ${getPerformanceColor(parseFloat(portfolioStats.avgListToSale))}`}>
              {portfolioStats.avgListToSale}%
            </p>
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
                placeholder="Search agents..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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

      {/* Agent Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {agent.name}
                      {agent.status === 'active' && (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{agent.company}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{agent.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {agent.market}
                  </span>
                  <span>{agent.commissionRate}% commission</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-lg font-bold">{agent.metrics.soldListings}</p>
                    <p className="text-xs text-gray-500">Sold</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${getDOMColor(agent.metrics.avgDaysOnMarket)}`}>
                      {agent.metrics.avgDaysOnMarket}
                    </p>
                    <p className="text-xs text-gray-500">Avg DOM</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${getPerformanceColor(agent.metrics.avgListToSaleRatio)}`}>
                      {agent.metrics.avgListToSaleRatio}%
                    </p>
                    <p className="text-xs text-gray-500">List/Sale</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Volume</span>
                  <span className="font-semibold">${(agent.metrics.totalVolume / 1000000).toFixed(2)}M</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{agent.phone}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewAgent(agent)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Performance Report
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Agent Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Listing Agent</DialogTitle>
            <DialogDescription>Add a new agent to track performance</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Agent Name</Label>
              <Input
                placeholder="Full name"
                value={agentData.name}
                onChange={(e) => setAgentData({...agentData, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Brokerage / Company</Label>
              <Input
                placeholder="Company name"
                value={agentData.company}
                onChange={(e) => setAgentData({...agentData, company: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input
                  placeholder="(512) 555-0123"
                  value={agentData.phone}
                  onChange={(e) => setAgentData({...agentData, phone: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="agent@email.com"
                  value={agentData.email}
                  onChange={(e) => setAgentData({...agentData, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Market</Label>
                <Select
                  value={agentData.market}
                  onValueChange={(value) => setAgentData({...agentData, market: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map(market => (
                      <SelectItem key={market} value={market}>{market}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Commission Rate (%)</Label>
                <Input
                  type="number"
                  step="0.25"
                  placeholder="3.0"
                  value={agentData.commissionRate}
                  onChange={(e) => setAgentData({...agentData, commissionRate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Add Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              {selectedAgent?.name}
            </DialogTitle>
            <DialogDescription>{selectedAgent?.company} • {selectedAgent?.market}</DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="py-4 space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{selectedAgent.metrics.soldListings}</p>
                  <p className="text-xs text-gray-500">Units Sold</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-2xl font-bold ${getDOMColor(selectedAgent.metrics.avgDaysOnMarket)}`}>
                    {selectedAgent.metrics.avgDaysOnMarket}
                  </p>
                  <p className="text-xs text-gray-500">Avg Days on Market</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-2xl font-bold ${getPerformanceColor(selectedAgent.metrics.avgListToSaleRatio)}`}>
                    {selectedAgent.metrics.avgListToSaleRatio}%
                  </p>
                  <p className="text-xs text-gray-500">List-to-Sale Ratio</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">${(selectedAgent.metrics.totalVolume / 1000000).toFixed(2)}M</p>
                  <p className="text-xs text-gray-500">Total Volume</p>
                </div>
              </div>

              {/* Recent Sales */}
              <div>
                <h4 className="font-semibold mb-3">Recent Sales</h4>
                {selectedAgent.recentSales.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>List Price</TableHead>
                        <TableHead>Sale Price</TableHead>
                        <TableHead>Variance</TableHead>
                        <TableHead>DOM</TableHead>
                        <TableHead>Close Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedAgent.recentSales.map((sale, index) => {
                        const variance = ((sale.salePrice - sale.listPrice) / sale.listPrice * 100).toFixed(1);
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{sale.address}</TableCell>
                            <TableCell>${sale.listPrice.toLocaleString()}</TableCell>
                            <TableCell>${sale.salePrice.toLocaleString()}</TableCell>
                            <TableCell className={parseFloat(variance) >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {parseFloat(variance) >= 0 ? '+' : ''}{variance}%
                            </TableCell>
                            <TableCell className={getDOMColor(sale.daysOnMarket)}>{sale.daysOnMarket}</TableCell>
                            <TableCell>{sale.closeDate}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent sales</p>
                )}
              </div>

              {/* Contact Info */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedAgent.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedAgent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span>{selectedAgent.commissionRate}% commission</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingAgentPerformancePage;
