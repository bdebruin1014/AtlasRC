// src/pages/construction/JobDetailPage.jsx
// Comprehensive job detail page with tabs for all features

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HardHat, ArrowLeft, Edit, Building2, Calendar, DollarSign,
  User, MapPin, FileText, ClipboardList, Wrench, AlertTriangle,
  CheckCircle2, Shield, TrendingUp, Clock, Package, Users,
  ChevronRight, Plus, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  getJobById,
  getJobDashboardMetrics,
  getCostCodes,
  getPurchaseOrders,
  getConstructionInspections,
  getRFIs,
  getSubmittals,
  getPunchLists,
  getPermits,
  getDailyLogs,
  getWarrantyItems,
  getPayApplications,
  JOB_STATUS,
  JOB_STATUS_LABELS,
  PO_STATUS_LABELS,
  RFI_STATUS,
  SUBMITTAL_STATUS,
} from '@/services/constructionService';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Tab-specific data
  const [costCodes, setCostCodes] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [rfis, setRfis] = useState([]);
  const [submittals, setSubmittals] = useState([]);
  const [punchLists, setPunchLists] = useState([]);
  const [permits, setPermits] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [payApps, setPayApps] = useState([]);

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      const [jobData, metricsData] = await Promise.all([
        getJobById(jobId),
        getJobDashboardMetrics(jobId),
      ]);
      setJob(jobData);
      setMetrics(metricsData);

      // Load all tab data in parallel
      const [
        costCodesData,
        posData,
        inspectionsData,
        rfisData,
        submittalsData,
        punchListsData,
        permitsData,
        dailyLogsData,
        warrantiesData,
        payAppsData,
      ] = await Promise.all([
        getCostCodes(jobId),
        getPurchaseOrders({ job_id: jobId }),
        getConstructionInspections(jobId),
        getRFIs(jobId),
        getSubmittals(jobId),
        getPunchLists(jobId),
        getPermits(jobId),
        getDailyLogs(jobId),
        getWarrantyItems(jobId),
        getPayApplications(jobId),
      ]);

      setCostCodes(costCodesData || []);
      setPurchaseOrders(posData || []);
      setInspections(inspectionsData || []);
      setRfis(rfisData || []);
      setSubmittals(submittalsData || []);
      setPunchLists(punchListsData || []);
      setPermits(permitsData || []);
      setDailyLogs(dailyLogsData || []);
      setWarranties(warrantiesData || []);
      setPayApps(payAppsData || []);
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case JOB_STATUS.ACTIVE: return 'bg-green-100 text-green-800';
      case JOB_STATUS.PENDING: return 'bg-yellow-100 text-yellow-800';
      case JOB_STATUS.ON_HOLD: return 'bg-orange-100 text-orange-800';
      case JOB_STATUS.COMPLETED: return 'bg-blue-100 text-blue-800';
      case JOB_STATUS.CLOSED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Job not found</p>
        <Button variant="outline" onClick={() => navigate('/construction/jobs')} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    );
  }

  const budgetProgress = metrics?.budget ? 
    ((metrics.budget.total_actual / metrics.budget.total_budget) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/construction/jobs')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <HardHat className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{job.name}</h1>
                <p className="text-gray-500">{job.job_number}</p>
              </div>
              <Badge className={getStatusColor(job.status)}>
                {JOB_STATUS_LABELS[job.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{job.project?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>{formatCurrency(job.contract_amount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(job.start_date)} - {formatDate(job.completion_date)}</span>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/construction/jobs/${jobId}/edit`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Job
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Budget Used</p>
            <p className="text-xl font-bold">{budgetProgress}%</p>
            <Progress value={parseFloat(budgetProgress)} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Open POs</p>
            <p className="text-xl font-bold">{purchaseOrders.filter(p => p.status !== 'received').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Open RFIs</p>
            <p className="text-xl font-bold text-orange-600">{metrics?.open_rfis || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Pending Inspections</p>
            <p className="text-xl font-bold text-purple-600">{metrics?.pending_inspections || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Punch Items</p>
            <p className="text-xl font-bold">{metrics?.punch_items?.open || 0} open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Expiring Warranties</p>
            <p className="text-xl font-bold text-red-600">{metrics?.expiring_warranties || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
          <TabsTrigger value="field">Field Ops</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Owner Entity</p>
                    <p className="font-medium">{job.owner_entity?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contractor Entity</p>
                    <p className="font-medium">{job.contractor_entity?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Project Manager</p>
                    <p className="font-medium">{job.project_manager?.full_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Superintendent</p>
                    <p className="font-medium">{job.superintendent?.full_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contract Date</p>
                    <p className="font-medium">{formatDate(job.contract_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Retainage</p>
                    <p className="font-medium">{job.retainage_percent || 10}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="text-xl font-bold">{formatCurrency(metrics?.budget?.total_budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Committed</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(metrics?.budget?.total_committed)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Actual</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(metrics?.budget?.total_actual)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remaining</p>
                    <p className="text-xl font-bold">{formatCurrency(metrics?.budget?.total_remaining)}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget Progress</span>
                    <span>{budgetProgress}%</span>
                  </div>
                  <Progress value={parseFloat(budgetProgress)} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{formatDate(log.log_date)}</p>
                      <p className="text-sm text-gray-600">{log.weather_conditions} • {log.work_summary?.substring(0, 100)}...</p>
                    </div>
                  </div>
                ))}
                {dailyLogs.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No daily logs yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Cost Codes</h2>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Cost Code
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Code</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Description</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Budget</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Committed</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actual</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {costCodes.map((cc) => (
                    <tr key={cc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{cc.code}</td>
                      <td className="px-4 py-3">{cc.description}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(cc.budget_amount)}</td>
                      <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(cc.committed_amount)}</td>
                      <td className="px-4 py-3 text-right text-green-600">{formatCurrency(cc.actual_amount)}</td>
                      <td className={cn(
                        "px-4 py-3 text-right font-medium",
                        (cc.budget_amount - cc.committed_amount) >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(cc.budget_amount - cc.committed_amount)}
                      </td>
                    </tr>
                  ))}
                  {costCodes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No cost codes defined
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="pos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Purchase Orders</h2>
            <Button size="sm" onClick={() => navigate(`/construction/jobs/${jobId}/pos/new`)}>
              <Plus className="w-4 h-4 mr-2" />
              New PO
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">PO #</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Vendor</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Description</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3 font-medium">{po.po_number}</td>
                      <td className="px-4 py-3">{po.vendor?.company || `${po.vendor?.first_name} ${po.vendor?.last_name}`}</td>
                      <td className="px-4 py-3 text-gray-600">{po.description}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(po.total_amount)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{PO_STATUS_LABELS[po.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(po.created_at)}</td>
                    </tr>
                  ))}
                  {purchaseOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No purchase orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Field Operations Tab */}
        <TabsContent value="field" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Daily Logs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base">Daily Logs</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  New Log
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dailyLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium">{formatDate(log.log_date)}</p>
                      <p className="text-gray-600 truncate">{log.work_summary}</p>
                    </div>
                  ))}
                  {dailyLogs.length === 0 && <p className="text-sm text-gray-500">No logs yet</p>}
                </div>
              </CardContent>
            </Card>

            {/* Inspections */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base">Inspections</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Schedule
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inspections.slice(0, 3).map((insp) => (
                    <div key={insp.id} className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium">{insp.inspection_type}</p>
                      <p className="text-gray-600">{formatDate(insp.scheduled_date)}</p>
                    </div>
                  ))}
                  {inspections.length === 0 && <p className="text-sm text-gray-500">No inspections</p>}
                </div>
              </CardContent>
            </Card>

            {/* Permits */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base">Permits</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Permit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {permits.slice(0, 3).map((permit) => (
                    <div key={permit.id} className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium">{permit.permit_type}</p>
                      <p className="text-gray-600">{permit.permit_number || 'Pending'}</p>
                    </div>
                  ))}
                  {permits.length === 0 && <p className="text-sm text-gray-500">No permits</p>}
                </div>
              </CardContent>
            </Card>

            {/* Punch Lists */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base">Punch Lists</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  New List
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {punchLists.slice(0, 3).map((pl) => (
                    <div key={pl.id} className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium">{pl.name}</p>
                      <p className="text-gray-600">{pl.items?.length || 0} items</p>
                    </div>
                  ))}
                  {punchLists.length === 0 && <p className="text-sm text-gray-500">No punch lists</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* RFIs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base">RFIs</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  New RFI
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rfis.slice(0, 5).map((rfi) => (
                    <div key={rfi.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between">
                        <p className="font-medium">{rfi.rfi_number}</p>
                        <Badge variant="outline" className="text-xs">{rfi.status}</Badge>
                      </div>
                      <p className="text-gray-600 truncate">{rfi.subject}</p>
                    </div>
                  ))}
                  {rfis.length === 0 && <p className="text-sm text-gray-500">No RFIs</p>}
                </div>
              </CardContent>
            </Card>

            {/* Submittals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base">Submittals</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  New Submittal
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {submittals.slice(0, 5).map((sub) => (
                    <div key={sub.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between">
                        <p className="font-medium">{sub.submittal_number}</p>
                        <Badge variant="outline" className="text-xs">{sub.status}</Badge>
                      </div>
                      <p className="text-gray-600 truncate">{sub.description}</p>
                    </div>
                  ))}
                  {submittals.length === 0 && <p className="text-sm text-gray-500">No submittals</p>}
                </div>
              </CardContent>
            </Card>

            {/* Warranty */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base">Warranty Items</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {warranties.slice(0, 5).map((w) => (
                    <div key={w.id} className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium">{w.item_name}</p>
                      <p className="text-gray-600">Expires: {formatDate(w.expiration_date)}</p>
                    </div>
                  ))}
                  {warranties.length === 0 && <p className="text-sm text-gray-500">No warranty items</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Pay Applications</h2>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Pay App
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">App #</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Period</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">This Period</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Total Billed</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payApps.map((pa) => (
                    <tr key={pa.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3 font-medium">#{pa.application_number}</td>
                      <td className="px-4 py-3">{formatDate(pa.period_start)} - {formatDate(pa.period_end)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(pa.amount_this_period)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(pa.total_completed)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{pa.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(pa.submitted_at)}</td>
                    </tr>
                  ))}
                  {payApps.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No pay applications yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobDetailPage;
