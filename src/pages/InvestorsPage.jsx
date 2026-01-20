import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Mail, Phone, Building2, DollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatCurrency, cn } from '@/lib/utils';

const mockInvestors = [
  { 
    id: 1, 
    name: 'Johnson Family Trust', 
    type: 'Trust', 
    commitment: 2500000, 
    funded: 2000000, 
    email: 'johnson@email.com',
    phone: '(555) 123-4567',
    address: '123 Trust Lane, Greenwich, CT 06830',
    investments: [
      { project: 'Watson House', amount: 1500000, date: '2024-01-15' },
      { project: 'Oslo Townhomes', amount: 500000, date: '2024-06-01' },
    ],
    status: 'active',
  },
  { 
    id: 2, 
    name: 'ABC Capital Partners', 
    type: 'Entity', 
    commitment: 5000000, 
    funded: 4500000, 
    email: 'invest@abccapital.com',
    phone: '(555) 987-6543',
    address: '456 Capital Way, New York, NY 10001',
    investments: [
      { project: 'Watson House', amount: 3000000, date: '2024-01-15' },
      { project: 'Cedar Mill Apartments', amount: 1500000, date: '2024-09-01' },
    ],
    status: 'active',
  },
  { 
    id: 3, 
    name: 'Sarah Williams', 
    type: 'Individual', 
    commitment: 500000, 
    funded: 500000, 
    email: 'sarah@email.com',
    phone: '(555) 456-7890',
    address: '789 Investor St, Greenville, SC 29601',
    investments: [
      { project: 'Pine Valley Lots', amount: 500000, date: '2024-03-01' },
    ],
    status: 'active',
  },
];

const InvestorsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState(null);

  const filteredInvestors = mockInvestors.filter(investor =>
    investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    investor.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvestorClick = (investor) => {
    setSelectedInvestor(investor);
  };

  const typeColors = {
    'Trust': 'bg-purple-100 text-purple-800',
    'Entity': 'bg-blue-100 text-blue-800',
    'Individual': 'bg-green-100 text-green-800',
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investor Directory</h1>
          <p className="text-gray-500">{mockInvestors.length} investors • {formatCurrency(mockInvestors.reduce((sum, i) => sum + i.commitment, 0))} total commitments</p>
        </div>
        <Button className="gap-2 bg-[#2F855A] hover:bg-[#276749]">
          <Plus className="w-4 h-4" />Add Investor
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search investors..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Investors List */}
      <Card>
        <div className="divide-y divide-gray-100">
          {filteredInvestors.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Investors Found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredInvestors.map(investor => {
              const fundedPercent = (investor.funded / investor.commitment) * 100;
              return (
                <div 
                  key={investor.id} 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleInvestorClick(investor)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {investor.type === 'Entity' ? (
                        <Building2 className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Users className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{investor.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn("text-xs", typeColors[investor.type])}>
                          {investor.type}
                        </Badge>
                        <span className="text-sm text-gray-500">{investor.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(investor.commitment)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={fundedPercent} className="w-20 h-1.5" />
                      <span className="text-sm text-gray-500">{fundedPercent.toFixed(0)}% funded</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Investor Detail Drawer */}
      <Sheet open={!!selectedInvestor} onOpenChange={() => setSelectedInvestor(null)}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto">
          {selectedInvestor && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {selectedInvestor.type === 'Entity' ? (
                      <Building2 className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Users className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-xl">{selectedInvestor.name}</p>
                    <Badge className={cn("text-xs mt-1", typeColors[selectedInvestor.type])}>
                      {selectedInvestor.type}
                    </Badge>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedInvestor.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedInvestor.phone}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-sm">{selectedInvestor.address}</span>
                  </div>
                </div>

                {/* Investment Summary */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Investment Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border rounded-lg p-3">
                      <p className="text-sm text-gray-500">Total Commitment</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(selectedInvestor.commitment)}
                      </p>
                    </div>
                    <div className="bg-white border rounded-lg p-3">
                      <p className="text-sm text-gray-500">Amount Funded</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(selectedInvestor.funded)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Funded</span>
                      <span className="font-medium">
                        {((selectedInvestor.funded / selectedInvestor.commitment) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={(selectedInvestor.funded / selectedInvestor.commitment) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>

                {/* Investments */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Investments</h4>
                  <div className="space-y-2">
                    {selectedInvestor.investments.map((inv, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{inv.project}</p>
                          <p className="text-sm text-gray-500">{inv.date}</p>
                        </div>
                        <p className="font-mono font-medium">{formatCurrency(inv.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" /> Email
                  </Button>
                  <Button className="flex-1 bg-[#2F855A] hover:bg-[#276749]">
                    <DollarSign className="w-4 h-4 mr-2" /> New Investment
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default InvestorsPage;
