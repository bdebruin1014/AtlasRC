import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FileText, PieChart, TrendingUp, Clock, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ReportsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();

  const REPORTS = [
    {
      id: 'trial-balance',
      title: 'Trial Balance',
      description: 'View balances for all accounts at a specific point in time.',
      icon: List,
      path: 'trial-balance'
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss',
      description: 'Analyze revenue, costs, and expenses over a period.',
      icon: TrendingUp,
      path: 'profit-loss'
    },
    {
      id: 'balance-sheet',
      title: 'Balance Sheet',
      description: 'Snapshot of assets, liabilities, and equity.',
      icon: PieChart,
      path: 'balance-sheet'
    },
    {
      id: 'ap-aging',
      title: 'AP Aging',
      description: 'Track unpaid bills and how long they have been outstanding.',
      icon: Clock,
      path: 'ap-aging'
    },
    {
      id: 'general-ledger',
      title: 'General Ledger',
      description: 'Detailed record of all transactions by account.',
      icon: FileText,
      path: 'general-ledger'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <Helmet>
        <title>Financial Reports | AtlasDev</title>
      </Helmet>

      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Generate standard financial statements and detailed reports.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REPORTS.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer flex flex-col" onClick={() => navigate(report.path)}>
              <CardHeader className="flex-row gap-4 items-center space-y-0 pb-2">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                  <report.icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 flex-1">
                <CardDescription className="text-sm text-gray-500 line-clamp-2">
                  {report.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-6">
                 <Button variant="outline" size="sm" className="w-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200">Run Report</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;