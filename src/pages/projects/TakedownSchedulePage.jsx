/**
 * AtlasDev - Takedown Schedule Page
 * Tracks scheduled lot purchases (from other developers) or lot sales (to builders)
 * Supports:
 * - Bulk lot purchases with periodic takedowns
 * - Lot sales to builders with scheduled closings
 * - Schedule modifications and variance tracking
 */

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, Calendar, DollarSign, TrendingUp, CheckCircle2, Clock,
  AlertCircle, ChevronDown, Edit2, Eye, Download, BarChart3,
  ArrowRight, Building2, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TakedownSchedulePage = () => {
  const { projectId } = useParams();
  const [activeView, setActiveView] = useState('schedule'); // schedule, calendar, analysis
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock project context
  const project = {
    id: projectId,
    name: 'Riverside Commons',
    type: 'lot-purchase-build', // or 'lot-development' for selling
    direction: 'purchase', // 'purchase' or 'sale'
    totalLots: 48,
    contractDate: '2024-06-15',
    seller: 'ABC Development LLC', // or buyer if selling
    pricePerLot: 85000,
    escalationRate: 0.02,
    frequency: 'quarterly'
  };

  // Mock takedown schedule
  const takedownSchedule = [
    { 
      id: 1, 
      takedownNumber: 1, 
      scheduledDate: '2024-09-15', 
      scheduledLots: 8, 
      scheduledPrice: 85000, 
      scheduledTotal: 680000,
      status: 'completed',
      actualDate: '2024-09-15',
      actualLots: 8,
      actualPrice: 85000,
      actualTotal: 680000,
      variance: 0,
      notes: 'First takedown completed on schedule'
    },
    { 
      id: 2, 
      takedownNumber: 2, 
      scheduledDate: '2024-12-15', 
      scheduledLots: 8, 
      scheduledPrice: 86700, 
      scheduledTotal: 693600,
      status: 'completed',
      actualDate: '2024-12-20',
      actualLots: 8,
      actualPrice: 86700,
      actualTotal: 693600,
      variance: 0,
      notes: 'Closed 5 days late due to title issue'
    },
    { 
      id: 3, 
      takedownNumber: 3, 
      scheduledDate: '2025-03-15', 
      scheduledLots: 8, 
      scheduledPrice: 88434, 
      scheduledTotal: 707472,
      status: 'upcoming',
      actualDate: null,
      actualLots: null,
      actualPrice: null,
      actualTotal: null,
      variance: null,
      notes: ''
    },
    { 
      id: 4, 
      takedownNumber: 4, 
      scheduledDate: '2025-06-15', 
      scheduledLots: 8, 
      scheduledPrice: 90203, 
      scheduledTotal: 721624,
      status: 'scheduled',
      actualDate: null,
      actualLots: null,
      actualPrice: null,
      actualTotal: null,
      variance: null,
      notes: ''
    },
    { 
      id: 5, 
      takedownNumber: 5, 
      scheduledDate: '2025-09-15', 
      scheduledLots: 8, 
      scheduledPrice: 92007, 
      scheduledTotal: 736056,
      status: 'scheduled',
      actualDate: null,
      actualLots: null,
      actualPrice: null,
      actualTotal: null,
      variance: null,
      notes: ''
    },
    { 
      id: 6, 
      takedownNumber: 6, 
      scheduledDate: '2025-12-15', 
      scheduledLots: 8, 
      scheduledPrice: 93847, 
      scheduledTotal: 750776,
      status: 'scheduled',
      actualDate: null,
      actualLots: null,
      actualPrice: null,
      actualTotal: null,
      variance: null,
      notes: ''
    }
  ];

  // Calculate summary stats
  const summary = useMemo(() => {
    const completed = takedownSchedule.filter(t => t.status === 'completed');
    const upcoming = takedownSchedule.filter(t => t.status === 'upcoming' || t.status === 'scheduled');
    
    return {
      totalTakedowns: takedownSchedule.length,
      completedTakedowns: completed.length,
      remainingTakedowns: upcoming.length,
      lotsAcquired: completed.reduce((sum, t) => sum + (t.actualLots || 0), 0),
      lotsRemaining: project.totalLots - completed.reduce((sum, t) => sum + (t.actualLots || 0), 0),
      amountPaid: completed.reduce((sum, t) => sum + (t.actualTotal || 0), 0),
      amountRemaining: upcoming.reduce((sum, t) => sum + t.scheduledTotal, 0),
      totalContract: takedownSchedule.reduce((sum, t) => sum + t.scheduledTotal, 0),
      nextTakedown: takedownSchedule.find(t => t.status === 'upcoming'),
      averageVariance: completed.length > 0 
        ? completed.reduce((sum, t) => sum + (t.variance || 0), 0) / completed.length 
        : 0
    };
  }, [takedownSchedule, project]);

  const formatCurrency = (val) => {
    if (!val) return '-';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusConfig = (status) => ({
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    upcoming: { label: 'Upcoming', color: 'bg-amber-100 text-amber-700', icon: Clock },
    scheduled: { label: 'Scheduled', color: 'bg-gray-100 text-gray-600', icon: Calendar },
    modified: { label: 'Modified', color: 'bg-blue-100 text-blue-700', icon: Edit2 },
    delayed: { label: 'Delayed', color: 'bg-red-100 text-red-700', icon: AlertCircle }
  }[status] || { label: status, color: 'bg-gray-100 text-gray-600', icon: Clock });

  const getDaysUntil = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Takedown Schedule</h1>
            <p className="text-sm text-gray-500">
              {project.name} • Lot {project.direction === 'purchase' ? 'Purchase' : 'Sale'} Agreement with {project.seller}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />Export
            </Button>
            <Button variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-1" />Modify Schedule
            </Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />Record Takedown
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Total {project.direction === 'purchase' ? 'Lots' : 'Lots'}</p>
            <p className="text-lg font-bold">{project.totalLots}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-700 mb-1">{project.direction === 'purchase' ? 'Acquired' : 'Sold'}</p>
            <p className="text-lg font-bold text-green-700">{summary.lotsAcquired}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs text-amber-700 mb-1">Remaining</p>
            <p className="text-lg font-bold text-amber-700">{summary.lotsRemaining}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-700 mb-1">{project.direction === 'purchase' ? 'Paid' : 'Received'}</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(summary.amountPaid)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-purple-700 mb-1">Remaining</p>
            <p className="text-lg font-bold text-purple-700">{formatCurrency(summary.amountRemaining)}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <p className="text-xs text-emerald-700 mb-1">Contract Total</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(summary.totalContract)}</p>
          </div>
        </div>
      </div>

      {/* Next Takedown Alert */}
      {summary.nextTakedown && (
        <div className="mx-6 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Next Takedown: #{summary.nextTakedown.takedownNumber}</h3>
                <p className="text-sm text-gray-600">
                  {formatDate(summary.nextTakedown.scheduledDate)} • {summary.nextTakedown.scheduledLots} lots • {formatCurrency(summary.nextTakedown.scheduledTotal)}
                </p>
              </div>
              <div className="ml-8 px-4 py-2 bg-amber-100 rounded-lg">
                <p className="text-2xl font-bold text-amber-700">{getDaysUntil(summary.nextTakedown.scheduledDate)}</p>
                <p className="text-xs text-amber-600">days away</p>
              </div>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700">
              Prepare for Closing
            </Button>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="px-6 mt-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button 
            className={cn("px-4 py-2 rounded text-sm font-medium transition-colors", 
              activeView === 'schedule' ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
            onClick={() => setActiveView('schedule')}
          >
            Schedule
          </button>
          <button 
            className={cn("px-4 py-2 rounded text-sm font-medium transition-colors", 
              activeView === 'calendar' ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
            onClick={() => setActiveView('calendar')}
          >
            Calendar
          </button>
          <button 
            className={cn("px-4 py-2 rounded text-sm font-medium transition-colors", 
              activeView === 'analysis' ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
            onClick={() => setActiveView('analysis')}
          >
            Analysis
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeView === 'schedule' && (
          <div className="space-y-4">
            {/* Timeline View */}
            <div className="bg-white rounded-lg border">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Takedown Timeline</h3>
              </div>
              <div className="p-4">
                {takedownSchedule.map((takedown, index) => {
                  const status = getStatusConfig(takedown.status);
                  const StatusIcon = status.icon;
                  const isLast = index === takedownSchedule.length - 1;
                  
                  return (
                    <div key={takedown.id} className="flex gap-4">
                      {/* Timeline Indicator */}
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          takedown.status === 'completed' ? "bg-green-100" :
                          takedown.status === 'upcoming' ? "bg-amber-100" : "bg-gray-100"
                        )}>
                          <StatusIcon className={cn(
                            "w-5 h-5",
                            takedown.status === 'completed' ? "text-green-600" :
                            takedown.status === 'upcoming' ? "text-amber-600" : "text-gray-400"
                          )} />
                        </div>
                        {!isLast && (
                          <div className={cn(
                            "w-0.5 h-full min-h-[60px]",
                            takedown.status === 'completed' ? "bg-green-200" : "bg-gray-200"
                          )} />
                        )}
                      </div>
                      
                      {/* Takedown Card */}
                      <div className={cn(
                        "flex-1 mb-4 p-4 rounded-lg border",
                        takedown.status === 'completed' ? "bg-green-50 border-green-200" :
                        takedown.status === 'upcoming' ? "bg-amber-50 border-amber-200" : "bg-white"
                      )}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">Takedown #{takedown.takedownNumber}</h4>
                              <span className={cn("px-2 py-0.5 rounded text-xs font-medium", status.color)}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Scheduled: {formatDate(takedown.scheduledDate)}
                              {takedown.actualDate && takedown.actualDate !== takedown.scheduledDate && (
                                <span className="ml-2 text-amber-600">
                                  (Actual: {formatDate(takedown.actualDate)})
                                </span>
                              )}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />View
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Lots</p>
                            <p className="font-semibold">
                              {takedown.status === 'completed' ? (
                                <>
                                  {takedown.actualLots}
                                  {takedown.actualLots !== takedown.scheduledLots && (
                                    <span className="text-xs text-gray-400 ml-1">
                                      (scheduled: {takedown.scheduledLots})
                                    </span>
                                  )}
                                </>
                              ) : (
                                takedown.scheduledLots
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Price/Lot</p>
                            <p className="font-semibold">
                              {formatCurrency(takedown.status === 'completed' ? takedown.actualPrice : takedown.scheduledPrice)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total</p>
                            <p className="font-semibold text-emerald-700">
                              {formatCurrency(takedown.status === 'completed' ? takedown.actualTotal : takedown.scheduledTotal)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Variance</p>
                            <p className={cn("font-semibold",
                              takedown.variance === 0 ? "text-green-600" :
                              takedown.variance > 0 ? "text-red-600" : "text-blue-600"
                            )}>
                              {takedown.variance !== null ? formatCurrency(takedown.variance) : '-'}
                            </p>
                          </div>
                        </div>
                        
                        {takedown.notes && (
                          <p className="mt-3 text-sm text-gray-600 italic border-t pt-3">
                            {takedown.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeView === 'analysis' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Cumulative Progress */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Cumulative Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Lots {project.direction === 'purchase' ? 'Acquired' : 'Sold'}</span>
                    <span className="text-sm font-medium">{summary.lotsAcquired} / {project.totalLots}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-emerald-500 h-3 rounded-full"
                      style={{ width: `${(summary.lotsAcquired / project.totalLots) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Amount {project.direction === 'purchase' ? 'Paid' : 'Received'}</span>
                    <span className="text-sm font-medium">{formatCurrency(summary.amountPaid)} / {formatCurrency(summary.totalContract)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${(summary.amountPaid / summary.totalContract) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Takedowns Completed</span>
                    <span className="text-sm font-medium">{summary.completedTakedowns} / {summary.totalTakedowns}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-purple-500 h-3 rounded-full"
                      style={{ width: `${(summary.completedTakedowns / summary.totalTakedowns) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Terms */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contract Terms</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Contract Date</span>
                  <span className="text-sm font-medium">{formatDate(project.contractDate)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">{project.direction === 'purchase' ? 'Seller' : 'Buyer'}</span>
                  <span className="text-sm font-medium">{project.seller}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Base Price/Lot</span>
                  <span className="text-sm font-medium">{formatCurrency(project.pricePerLot)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Escalation Rate</span>
                  <span className="text-sm font-medium">{(project.escalationRate * 100).toFixed(1)}% per period</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Frequency</span>
                  <span className="text-sm font-medium capitalize">{project.frequency}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Total Lots</span>
                  <span className="text-sm font-medium">{project.totalLots}</span>
                </div>
              </div>
            </div>

            {/* Variance Analysis */}
            <div className="bg-white rounded-lg border p-6 col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">Variance Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Takedown</th>
                      <th className="text-right px-4 py-2 font-medium">Scheduled</th>
                      <th className="text-right px-4 py-2 font-medium">Actual</th>
                      <th className="text-right px-4 py-2 font-medium">Variance ($)</th>
                      <th className="text-right px-4 py-2 font-medium">Variance (%)</th>
                      <th className="text-left px-4 py-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {takedownSchedule.filter(t => t.status === 'completed').map(t => (
                      <tr key={t.id}>
                        <td className="px-4 py-2 font-medium">#{t.takedownNumber}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(t.scheduledTotal)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(t.actualTotal)}</td>
                        <td className={cn("px-4 py-2 text-right font-medium",
                          t.variance === 0 ? "text-green-600" :
                          t.variance > 0 ? "text-red-600" : "text-blue-600"
                        )}>
                          {formatCurrency(t.variance)}
                        </td>
                        <td className={cn("px-4 py-2 text-right",
                          t.variance === 0 ? "text-green-600" :
                          t.variance > 0 ? "text-red-600" : "text-blue-600"
                        )}>
                          {((t.variance / t.scheduledTotal) * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[200px]">{t.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>
                      <td className="px-4 py-2">Total</td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(takedownSchedule.filter(t => t.status === 'completed').reduce((s, t) => s + t.scheduledTotal, 0))}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(takedownSchedule.filter(t => t.status === 'completed').reduce((s, t) => s + (t.actualTotal || 0), 0))}
                      </td>
                      <td className="px-4 py-2 text-right text-green-600">
                        {formatCurrency(takedownSchedule.filter(t => t.status === 'completed').reduce((s, t) => s + (t.variance || 0), 0))}
                      </td>
                      <td className="px-4 py-2 text-right">-</td>
                      <td className="px-4 py-2">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Calendar View</h3>
            <p className="text-sm text-gray-500">
              Calendar visualization of takedown schedule - Mock view coming
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakedownSchedulePage;
