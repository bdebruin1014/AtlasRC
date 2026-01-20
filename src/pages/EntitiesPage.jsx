import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, ChevronRight, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

const mockEntities = [
  { id: 1, name: 'VanRock Holdings LLC', type: 'Holding Company', status: 'active', projects: 5, assets: 10, cash: 2300000, equity: 15200000 },
  { id: 2, name: 'Watson House LLC', type: 'Project SPE', status: 'active', projects: 1, assets: 0, cash: 125000, equity: 5500000 },
  { id: 3, name: 'Oslo Development LLC', type: 'Asset Entity', status: 'active', projects: 0, assets: 1, cash: 85000, equity: 3200000 },
  { id: 4, name: 'Carolina Affordable Housing', type: 'Nonprofit', status: 'active', projects: 2, assets: 2, cash: 320000, equity: 4500000 },
];

const typeColors = {
  'Holding Company': 'bg-blue-100 text-blue-800',
  'Project SPE': 'bg-yellow-100 text-yellow-800',
  'Asset Entity': 'bg-green-100 text-green-800',
  'Nonprofit': 'bg-purple-100 text-purple-800',
};

const EntitiesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredEntities = mockEntities.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEquity = mockEntities.reduce((sum, e) => sum + e.equity, 0);
  const totalCash = mockEntities.reduce((sum, e) => sum + e.cash, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entities</h1>
          <p className="text-gray-500">{mockEntities.length} entities • {formatCurrency(totalEquity, { compact: true })} total equity</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Entity
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Entities</p>
              <p className="text-2xl font-bold text-gray-900">{mockEntities.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Cash</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCash, { compact: true })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Equity</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEquity, { compact: true })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Entities List */}
      <Card>
        <div className="divide-y divide-gray-100">
          {filteredEntities.map(entity => (
            <div 
              key={entity.id}
              onClick={() => navigate(`/accounting/entity/${entity.id}`)}
              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{entity.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge className={cn('text-xs', typeColors[entity.type])}>
                      {entity.type}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {entity.projects} projects • {entity.assets} assets
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Cash</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(entity.cash, { compact: true })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Equity</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(entity.equity, { compact: true })}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EntitiesPage;
