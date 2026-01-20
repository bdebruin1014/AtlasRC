import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Download, FileText, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle, Send, Users, Award, TrendingDown, TrendingUp, Scale, Building2, Phone, Mail, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const BidsPage = ({ projectId }) => {
  const [showBidPackageModal, setShowBidPackageModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [activeTab, setActiveTab] = useState('packages'); // 'packages', 'bids', 'awarded'

  const [bidPackages, setBidPackages] = useState([
    {
      id: 'BP-001',
      name: 'Electrical Installation',
      trade: 'Electrical',
      budgetAmount: 210000,
      status: 'awarded',
      issueDate: '2024-02-15',
      dueDate: '2024-03-01',
      awardedTo: 'Sparks Electric',
      awardedAmount: 204000,
      bidsReceived: 4,
      description: 'Complete electrical installation for 12-unit residential development including service, distribution, and finish electrical.',
      scope: ['Main service entrance (400A)', 'Distribution panels per unit', 'Rough electrical per plans', 'Finish electrical - devices & fixtures', 'Low voltage - data/cable/phone'],
    },
    {
      id: 'BP-002',
      name: 'Plumbing Installation',
      trade: 'Plumbing',
      budgetAmount: 200000,
      status: 'awarded',
      issueDate: '2024-02-15',
      dueDate: '2024-03-01',
      awardedTo: 'ABC Plumbing',
      awardedAmount: 192000,
      bidsReceived: 3,
      description: 'Complete plumbing installation for all units including rough and finish plumbing.',
      scope: ['Water service and distribution', 'Sanitary sewer connections', 'Rough plumbing per plans', 'Fixture installation', 'Water heater installation'],
    },
    {
      id: 'BP-003',
      name: 'HVAC Installation',
      trade: 'HVAC',
      budgetAmount: 225000,
      status: 'awarded',
      issueDate: '2024-02-20',
      dueDate: '2024-03-05',
      awardedTo: 'Cool Air HVAC',
      awardedAmount: 216000,
      bidsReceived: 3,
      description: 'Complete HVAC installation including equipment, ductwork, and controls.',
      scope: ['HVAC equipment supply & install', 'Ductwork fabrication & install', 'Controls and thermostats', 'Startup and commissioning', 'Warranty - 2 year labor'],
    },
    {
      id: 'BP-004',
      name: 'Roofing',
      trade: 'Roofing',
      budgetAmount: 165000,
      status: 'awarded',
      issueDate: '2024-06-01',
      dueDate: '2024-06-15',
      awardedTo: 'Top Roofing',
      awardedAmount: 156000,
      bidsReceived: 5,
      description: 'Architectural shingle roofing for all 12 units.',
      scope: ['Underlayment', 'Architectural shingles - 30 year', 'Flashing and trim', 'Gutters and downspouts', 'Cleanup'],
    },
    {
      id: 'BP-005',
      name: 'Landscaping',
      trade: 'Landscaping',
      budgetAmount: 140000,
      status: 'open',
      issueDate: '2024-12-15',
      dueDate: '2025-01-15',
      awardedTo: null,
      awardedAmount: null,
      bidsReceived: 2,
      description: 'Complete landscaping for subdivision including common areas and individual lots.',
      scope: ['Grading and soil prep', 'Sod installation', 'Trees and shrubs', 'Mulch and edging', 'Irrigation system', 'Hardscape - walkways'],
    },
    {
      id: 'BP-006',
      name: 'Interior Painting',
      trade: 'Painting',
      budgetAmount: 100000,
      status: 'pending',
      issueDate: '2024-12-20',
      dueDate: '2025-01-10',
      awardedTo: null,
      awardedAmount: null,
      bidsReceived: 0,
      description: 'Interior painting for all 12 units including primer and two coats.',
      scope: ['Wall prep and repair', 'Primer - all surfaces', 'Two coats finish paint', 'Trim and doors', 'Touch-up after floor install'],
    },
  ]);

  const [bids, setBids] = useState([
    // Electrical Bids
    { id: 'BID-001', packageId: 'BP-001', bidder: 'Sparks Electric', amount: 204000, submitted: '2024-02-28', status: 'awarded', notes: 'Best value, strong references', rating: 5 },
    { id: 'BID-002', packageId: 'BP-001', bidder: 'PowerUp Electric', amount: 218000, submitted: '2024-02-27', status: 'rejected', notes: 'Higher price', rating: 4 },
    { id: 'BID-003', packageId: 'BP-001', bidder: 'Volt Masters', amount: 195000, submitted: '2024-02-28', status: 'rejected', notes: 'Low bid but limited capacity', rating: 3 },
    { id: 'BID-004', packageId: 'BP-001', bidder: 'Circuit Pro', amount: 212000, submitted: '2024-02-26', status: 'rejected', notes: 'Good bid, went with Sparks', rating: 4 },
    
    // Plumbing Bids
    { id: 'BID-005', packageId: 'BP-002', bidder: 'ABC Plumbing', amount: 192000, submitted: '2024-02-28', status: 'awarded', notes: 'Competitive price, good track record', rating: 4 },
    { id: 'BID-006', packageId: 'BP-002', bidder: 'FlowRight Plumbing', amount: 205000, submitted: '2024-02-27', status: 'rejected', notes: 'Higher than budget', rating: 4 },
    { id: 'BID-007', packageId: 'BP-002', bidder: 'Pipe Masters', amount: 198000, submitted: '2024-02-28', status: 'rejected', notes: 'Close second', rating: 4 },
    
    // HVAC Bids
    { id: 'BID-008', packageId: 'BP-003', bidder: 'Cool Air HVAC', amount: 216000, submitted: '2024-03-04', status: 'awarded', notes: 'Best value, includes 2yr warranty', rating: 5 },
    { id: 'BID-009', packageId: 'BP-003', bidder: 'Climate Control Inc', amount: 228000, submitted: '2024-03-03', status: 'rejected', notes: 'Over budget', rating: 4 },
    { id: 'BID-010', packageId: 'BP-003', bidder: 'AirFlow Systems', amount: 222000, submitted: '2024-03-04', status: 'rejected', notes: 'Good bid', rating: 4 },
    
    // Roofing Bids
    { id: 'BID-011', packageId: 'BP-004', bidder: 'Top Roofing', amount: 156000, submitted: '2024-06-14', status: 'awarded', notes: 'Best price and timeline', rating: 4 },
    { id: 'BID-012', packageId: 'BP-004', bidder: 'Apex Roofing', amount: 162000, submitted: '2024-06-12', status: 'rejected', notes: '', rating: 4 },
    { id: 'BID-013', packageId: 'BP-004', bidder: 'Summit Roofing', amount: 158000, submitted: '2024-06-13', status: 'rejected', notes: '', rating: 4 },
    { id: 'BID-014', packageId: 'BP-004', bidder: 'Premium Roof Co', amount: 172000, submitted: '2024-06-10', status: 'rejected', notes: 'Over budget', rating: 3 },
    { id: 'BID-015', packageId: 'BP-004', bidder: 'Quality Roofing', amount: 165000, submitted: '2024-06-14', status: 'rejected', notes: '', rating: 4 },
    
    // Landscaping Bids (open)
    { id: 'BID-016', packageId: 'BP-005', bidder: 'Green Landscaping', amount: 132000, submitted: '2024-12-20', status: 'pending', notes: 'Low bidder', rating: 4 },
    { id: 'BID-017', packageId: 'BP-005', bidder: 'Nature Works', amount: 145000, submitted: '2024-12-22', status: 'pending', notes: 'Includes irrigation upgrade', rating: 5 },
  ]);

  const [newBidPackage, setNewBidPackage] = useState({
    name: '',
    trade: '',
    budgetAmount: '',
    dueDate: '',
    description: '',
    scope: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'awarded': return 'bg-green-100 text-green-700';
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'closed': return 'bg-gray-100 text-gray-600';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const trades = ['Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Framing', 'Foundation', 'Painting', 'Flooring', 'Cabinets', 'Landscaping', 'Sitework', 'Drywall'];

  const totalBudget = bidPackages.reduce((sum, p) => sum + p.budgetAmount, 0);
  const totalAwarded = bidPackages.filter(p => p.awardedAmount).reduce((sum, p) => sum + p.awardedAmount, 0);
  const savings = bidPackages.filter(p => p.awardedAmount).reduce((sum, p) => sum + (p.budgetAmount - p.awardedAmount), 0);
  const openPackages = bidPackages.filter(p => p.status === 'open' || p.status === 'pending').length;
  const awardedPackages = bidPackages.filter(p => p.status === 'awarded').length;

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getBidsForPackage = (packageId) => {
    return bids.filter(b => b.packageId === packageId);
  };

  const handleSaveBidPackage = () => {
    const pkg = {
      id: `BP-${String(bidPackages.length + 1).padStart(3, '0')}`,
      ...newBidPackage,
      budgetAmount: parseFloat(newBidPackage.budgetAmount) || 0,
      status: 'pending',
      issueDate: new Date().toISOString().split('T')[0],
      awardedTo: null,
      awardedAmount: null,
      bidsReceived: 0,
      scope: newBidPackage.scope.split('\n').filter(s => s.trim()),
    };
    setBidPackages(prev => [...prev, pkg]);
    setShowBidPackageModal(false);
    setNewBidPackage({ name: '', trade: '', budgetAmount: '', dueDate: '', description: '', scope: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Bids & Procurement</h1>
          <p className="text-sm text-gray-500">Manage bid packages and vendor selection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowBidPackageModal(true)}>
            <Plus className="w-4 h-4 mr-1" />New Bid Package
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Bid Packages</p>
          <p className="text-2xl font-semibold">{bidPackages.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Awarded</p>
          <p className="text-2xl font-semibold text-green-600">{awardedPackages}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Open/Pending</p>
          <p className="text-2xl font-semibold text-blue-600">{openPackages}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Budget</p>
          <p className="text-xl font-semibold">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Awarded</p>
          <p className="text-xl font-semibold">{formatCurrency(totalAwarded)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-[#047857]">
          <p className="text-xs text-gray-500">Savings</p>
          <p className="text-xl font-semibold text-[#047857]">{formatCurrency(savings)}</p>
          <p className="text-xs text-green-600">
            <TrendingDown className="w-3 h-3 inline" /> {((savings / totalBudget) * 100).toFixed(1)}% under
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('packages')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'packages' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Bid Packages ({bidPackages.length})
        </button>
        <button onClick={() => setActiveTab('bids')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'bids' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          All Bids ({bids.length})
        </button>
        <button onClick={() => setActiveTab('awarded')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'awarded' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Awarded ({awardedPackages})
        </button>
      </div>

      {/* Bid Packages Tab */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          {bidPackages.map((pkg) => {
            const pkgBids = getBidsForPackage(pkg.id);
            const lowestBid = pkgBids.length > 0 ? Math.min(...pkgBids.map(b => b.amount)) : null;
            const highestBid = pkgBids.length > 0 ? Math.max(...pkgBids.map(b => b.amount)) : null;
            
            return (
              <div key={pkg.id} className="bg-white border rounded-lg overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-500">{pkg.id}</span>
                        <h4 className="font-semibold">{pkg.name}</h4>
                        <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getStatusColor(pkg.status))}>
                          {pkg.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{pkg.trade} • Due: {pkg.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="font-semibold">${pkg.budgetAmount.toLocaleString()}</p>
                    </div>
                    {pkg.awardedAmount && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Awarded</p>
                        <p className="font-semibold text-green-600">${pkg.awardedAmount.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Bids</p>
                      <p className="font-semibold">{pkg.bidsReceived}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPackage(pkg)}>
                      <Eye className="w-4 h-4 mr-1" />View
                    </Button>
                  </div>
                </div>
                
                {/* Bid comparison bar */}
                {pkgBids.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Low: ${lowestBid?.toLocaleString()}</span>
                        <span>Budget: ${pkg.budgetAmount.toLocaleString()}</span>
                        <span>High: ${highestBid?.toLocaleString()}</span>
                      </div>
                      <div className="relative h-6 bg-gray-200 rounded">
                        {/* Budget line */}
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-gray-600 z-10"
                          style={{ left: '50%' }}
                        ></div>
                        {/* Bids */}
                        {pkgBids.map((bid, idx) => {
                          const range = highestBid - lowestBid || 1;
                          const position = ((bid.amount - lowestBid) / range) * 80 + 10; // 10-90% range
                          return (
                            <div
                              key={bid.id}
                              className={cn(
                                "absolute top-1 w-4 h-4 rounded-full border-2 border-white shadow cursor-pointer",
                                bid.status === 'awarded' ? "bg-green-500" : bid.status === 'pending' ? "bg-blue-500" : "bg-gray-400"
                              )}
                              style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                              title={`${bid.bidder}: $${bid.amount.toLocaleString()}`}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* All Bids Tab */}
      {activeTab === 'bids' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">All Bids</h2>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowBidModal(true)}>
              <Plus className="w-4 h-4 mr-1" />Add Bid
            </Button>
          </div>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Bid ID</th>
                <th className="text-left px-4 py-3 font-medium">Package</th>
                <th className="text-left px-4 py-3 font-medium">Bidder</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Submitted</th>
                <th className="text-left px-4 py-3 font-medium">Rating</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bids.map((bid) => {
                const pkg = bidPackages.find(p => p.id === bid.packageId);
                return (
                  <tr key={bid.id} className={cn("hover:bg-gray-50", bid.status === 'awarded' && "bg-green-50")}>
                    <td className="px-4 py-3 font-mono text-sm">{bid.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{pkg?.name}</p>
                      <p className="text-xs text-gray-500">{bid.packageId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {bid.status === 'awarded' && <Award className="w-4 h-4 text-green-500" />}
                        <span>{bid.bidder}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      ${bid.amount.toLocaleString()}
                      {pkg && (
                        <span className={cn("text-xs ml-2", bid.amount <= pkg.budgetAmount ? "text-green-600" : "text-red-600")}>
                          {bid.amount <= pkg.budgetAmount ? (
                            <TrendingDown className="w-3 h-3 inline" />
                          ) : (
                            <TrendingUp className="w-3 h-3 inline" />
                          )}
                          {Math.abs(((bid.amount - pkg.budgetAmount) / pkg.budgetAmount) * 100).toFixed(0)}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">{bid.submitted}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-3 h-3", i < bid.rating ? "text-amber-500 fill-amber-500" : "text-gray-300")} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(bid.status))}>
                        {bid.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Awarded Tab */}
      {activeTab === 'awarded' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Package</th>
                <th className="text-left px-4 py-3 font-medium">Trade</th>
                <th className="text-left px-4 py-3 font-medium">Awarded To</th>
                <th className="text-right px-4 py-3 font-medium">Budget</th>
                <th className="text-right px-4 py-3 font-medium">Awarded</th>
                <th className="text-right px-4 py-3 font-medium">Savings</th>
                <th className="text-left px-4 py-3 font-medium">Award Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bidPackages.filter(p => p.status === 'awarded').map((pkg) => {
                const saving = pkg.budgetAmount - pkg.awardedAmount;
                return (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{pkg.name}</p>
                      <p className="text-xs text-gray-500">{pkg.id}</p>
                    </td>
                    <td className="px-4 py-3">{pkg.trade}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{pkg.awardedTo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">${pkg.budgetAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">${pkg.awardedAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("font-medium", saving >= 0 ? "text-green-600" : "text-red-600")}>
                        {saving >= 0 ? '+' : ''}{formatCurrency(saving)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{pkg.issueDate}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t font-semibold">
              <tr>
                <td className="px-4 py-3" colSpan="3">TOTALS</td>
                <td className="px-4 py-3 text-right">${bidPackages.filter(p => p.status === 'awarded').reduce((s, p) => s + p.budgetAmount, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">${totalAwarded.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-600">${savings.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* New Bid Package Modal */}
      {showBidPackageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">New Bid Package</h3>
              <button onClick={() => setShowBidPackageModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Package Name *</label>
                <Input value={newBidPackage.name} onChange={(e) => setNewBidPackage(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Electrical Installation" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Trade *</label>
                  <select className="w-full border rounded-md px-3 py-2" value={newBidPackage.trade} onChange={(e) => setNewBidPackage(prev => ({ ...prev, trade: e.target.value }))}>
                    <option value="">Select trade...</option>
                    {trades.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Budget Amount *</label>
                  <Input type="number" value={newBidPackage.budgetAmount} onChange={(e) => setNewBidPackage(prev => ({ ...prev, budgetAmount: e.target.value }))} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Bid Due Date *</label>
                <Input type="date" value={newBidPackage.dueDate} onChange={(e) => setNewBidPackage(prev => ({ ...prev, dueDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={2} value={newBidPackage.description} onChange={(e) => setNewBidPackage(prev => ({ ...prev, description: e.target.value }))} placeholder="Brief description of work..." />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Scope of Work</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={4} value={newBidPackage.scope} onChange={(e) => setNewBidPackage(prev => ({ ...prev, scope: e.target.value }))} placeholder="Enter each scope item on a new line..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowBidPackageModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSaveBidPackage}>Create Package</Button>
            </div>
          </div>
        </div>
      )}

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold">{selectedPackage.name}</h3>
                <p className="text-sm text-gray-500">{selectedPackage.id} • {selectedPackage.trade}</p>
              </div>
              <button onClick={() => setSelectedPackage(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(selectedPackage.status))}>
                  {selectedPackage.status}
                </span>
                {selectedPackage.awardedTo && (
                  <span className="px-3 py-1 rounded text-sm bg-green-100 text-green-700 flex items-center gap-1">
                    <Award className="w-4 h-4" />Awarded to {selectedPackage.awardedTo}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Budget</p>
                  <p className="font-semibold">${selectedPackage.budgetAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Awarded Amount</p>
                  <p className="font-semibold text-green-600">{selectedPackage.awardedAmount ? `$${selectedPackage.awardedAmount.toLocaleString()}` : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Issue Date</p>
                  <p className="font-medium">{selectedPackage.issueDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium">{selectedPackage.dueDate}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-sm">{selectedPackage.description}</p>
              </div>

              {selectedPackage.scope.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Scope of Work</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {selectedPackage.scope.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bids for this package */}
              <div>
                <h4 className="font-medium mb-3">Bids Received ({getBidsForPackage(selectedPackage.id).length})</h4>
                <div className="space-y-2">
                  {getBidsForPackage(selectedPackage.id).map((bid) => (
                    <div key={bid.id} className={cn("flex items-center justify-between p-3 rounded-lg", bid.status === 'awarded' ? "bg-green-50 border border-green-200" : "bg-gray-50")}>
                      <div className="flex items-center gap-3">
                        {bid.status === 'awarded' && <Award className="w-5 h-5 text-green-500" />}
                        <div>
                          <p className="font-medium">{bid.bidder}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-3 h-3", i < bid.rating ? "text-amber-500 fill-amber-500" : "text-gray-300")} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${bid.amount.toLocaleString()}</p>
                        <p className={cn("text-xs", bid.amount <= selectedPackage.budgetAmount ? "text-green-600" : "text-red-600")}>
                          {bid.amount <= selectedPackage.budgetAmount ? '-' : '+'}${Math.abs(bid.amount - selectedPackage.budgetAmount).toLocaleString()} vs budget
                        </p>
                      </div>
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(bid.status))}>
                        {bid.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <Button variant="outline" size="sm"><Send className="w-4 h-4 mr-1" />Invite Bidders</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedPackage(null)}>Close</Button>
                {selectedPackage.status !== 'awarded' && (
                  <Button className="bg-[#047857] hover:bg-[#065f46]"><Award className="w-4 h-4 mr-1" />Award Contract</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidsPage;
