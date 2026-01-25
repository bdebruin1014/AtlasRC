import React, { useState } from 'react';
import { Rss, Plus, Bell, BellOff, Mail, Clock, Trash2, Settings, Calendar, CheckCircle, AlertCircle, FileText, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SubscribedReportsPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const [subscriptions] = useState([
    {
      id: 1,
      reportName: 'Weekly Project Status',
      reportType: 'Projects',
      frequency: 'Weekly',
      deliveryDay: 'Monday',
      deliveryTime: '8:00 AM',
      format: 'PDF',
      status: 'active',
      lastDelivered: '2024-01-20',
      nextDelivery: '2024-01-27',
    },
    {
      id: 2,
      reportName: 'Monthly Financial Summary',
      reportType: 'Financial',
      frequency: 'Monthly',
      deliveryDay: '1st',
      deliveryTime: '9:00 AM',
      format: 'Excel',
      status: 'active',
      lastDelivered: '2024-01-01',
      nextDelivery: '2024-02-01',
    },
    {
      id: 3,
      reportName: 'Pipeline Changes Alert',
      reportType: 'Pipeline',
      frequency: 'Daily',
      deliveryDay: 'Daily',
      deliveryTime: '7:00 AM',
      format: 'PDF',
      status: 'active',
      lastDelivered: '2024-01-21',
      nextDelivery: '2024-01-22',
    },
    {
      id: 4,
      reportName: 'Quarterly Investor Report',
      reportType: 'Financial',
      frequency: 'Quarterly',
      deliveryDay: 'Q1, Q2, Q3, Q4',
      deliveryTime: '10:00 AM',
      format: 'PDF + Excel',
      status: 'paused',
      lastDelivered: '2024-01-01',
      nextDelivery: 'Paused',
    },
    {
      id: 5,
      reportName: 'Budget Variance Report',
      reportType: 'Budget',
      frequency: 'Weekly',
      deliveryDay: 'Friday',
      deliveryTime: '5:00 PM',
      format: 'Excel',
      status: 'active',
      lastDelivered: '2024-01-19',
      nextDelivery: '2024-01-26',
    },
  ]);

  const availableReports = [
    { id: 1, name: 'Project Status Report', category: 'Projects', icon: FileText },
    { id: 2, name: 'Financial Summary', category: 'Financial', icon: BarChart3 },
    { id: 3, name: 'Pipeline Analysis', category: 'Pipeline', icon: TrendingUp },
    { id: 4, name: 'Budget vs Actual', category: 'Budget', icon: PieChart },
    { id: 5, name: 'Entity P&L', category: 'Financial', icon: BarChart3 },
    { id: 6, name: 'Cash Flow Forecast', category: 'Financial', icon: TrendingUp },
    { id: 7, name: 'Vendor Payments Due', category: 'Operations', icon: FileText },
    { id: 8, name: 'Permit Status', category: 'Projects', icon: FileText },
  ];

  const getReportTypeColor = (type) => {
    const colors = {
      'Projects': 'bg-blue-100 text-blue-700',
      'Financial': 'bg-green-100 text-green-700',
      'Pipeline': 'bg-purple-100 text-purple-700',
      'Budget': 'bg-orange-100 text-orange-700',
      'Operations': 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getFrequencyColor = (frequency) => {
    const colors = {
      'Daily': 'bg-red-100 text-red-700',
      'Weekly': 'bg-blue-100 text-blue-700',
      'Monthly': 'bg-purple-100 text-purple-700',
      'Quarterly': 'bg-amber-100 text-amber-700',
    };
    return colors[frequency] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Rss className="w-5 h-5 text-[#2F855A]" />
          <h1 className="text-xl font-semibold text-gray-900">Subscribed Reports</h1>
        </div>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Subscription
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active Subscriptions</p>
            <p className="text-2xl font-semibold">{subscriptions.filter(s => s.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Paused</p>
            <p className="text-2xl font-semibold text-amber-600">{subscriptions.filter(s => s.status === 'paused').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">This Week</p>
            <p className="text-2xl font-semibold">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Report Types</p>
            <p className="text-2xl font-semibold">{new Set(subscriptions.map(s => s.reportType)).size}</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Your Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left p-4">Report</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Frequency</th>
                <th className="text-left p-4">Delivery</th>
                <th className="text-left p-4">Format</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Next Delivery</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{sub.reportName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={getReportTypeColor(sub.reportType)}>{sub.reportType}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={getFrequencyColor(sub.frequency)}>{sub.frequency}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600">
                      <div>{sub.deliveryDay}</div>
                      <div className="text-xs text-gray-400">{sub.deliveryTime}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">{sub.format}</span>
                  </td>
                  <td className="p-4">
                    {sub.status === 'active' ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700">
                        <AlertCircle className="w-3 h-3 mr-1" /> Paused
                      </Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {sub.nextDelivery}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      {sub.status === 'active' ? (
                        <Button variant="ghost" size="sm" title="Pause">
                          <BellOff className="w-4 h-4 text-amber-500" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" title="Resume">
                          <Bell className="w-4 h-4 text-green-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="Settings">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Delivery History */}
      <Card className="mt-6">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[
              { report: 'Weekly Project Status', date: '2024-01-20 8:00 AM', status: 'delivered' },
              { report: 'Budget Variance Report', date: '2024-01-19 5:00 PM', status: 'delivered' },
              { report: 'Pipeline Changes Alert', date: '2024-01-19 7:00 AM', status: 'delivered' },
              { report: 'Pipeline Changes Alert', date: '2024-01-18 7:00 AM', status: 'delivered' },
              { report: 'Weekly Project Status', date: '2024-01-13 8:00 AM', status: 'delivered' },
            ].map((delivery, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{delivery.report}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{delivery.date}</span>
                  <Badge className="bg-green-100 text-green-700 text-xs">Delivered</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <CardTitle>Add Report Subscription</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Select Report */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Report</label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {availableReports.map(report => (
                    <button
                      key={report.id}
                      className="flex items-center gap-3 p-3 border rounded-lg text-left hover:border-[#2F855A] hover:bg-green-50 transition-colors"
                    >
                      <report.icon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{report.name}</p>
                        <p className="text-xs text-gray-400">{report.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Day</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                  </select>
                </div>
              </div>

              {/* Time and Format */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="7:00">7:00 AM</option>
                    <option value="8:00">8:00 AM</option>
                    <option value="9:00">9:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="both">PDF + Excel</option>
                  </select>
                </div>
              </div>

              {/* Additional Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Recipients (optional)
                </label>
                <input
                  type="text"
                  placeholder="email1@company.com, email2@company.com"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F855A]"
                />
                <p className="text-xs text-gray-400 mt-1">Reports will always be sent to your email</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button className="bg-[#2F855A] hover:bg-[#276749]">Subscribe</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SubscribedReportsPage;
