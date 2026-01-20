import React from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, TrendingUp, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const InvestorDashboardPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Investor Relations</h1>
        <p className="text-gray-500">Manage investors, capital calls, and distributions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Investors</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Committed</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(8500000, { compact: true })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Distributions YTD</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(1250000, { compact: true })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending K-1s</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/investors/directory" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <span className="font-medium">Investor Directory</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
            <Link to="/investors/capital-calls" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <span className="font-medium">Capital Calls</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
            <Link to="/investors/distributions" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <span className="font-medium">Distributions</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvestorDashboardPage;
