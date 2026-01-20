// src/pages/construction/ConstructionDashboardPage.jsx
// Main dashboard for Construction Management module

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, HardHat, FileText, AlertTriangle, Clock, CheckCircle2,
  TrendingUp, DollarSign, Users, ClipboardList, Wrench, Calendar,
  ChevronRight, Plus, Search, Filter, BarChart3, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getJobs,
  getContractorDashboardMetrics,
  JOB_STATUS,
  JOB_STATUS_LABELS,
} from '@/services/constructionService';

const ConstructionDashboardPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [selectedEntity]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsData, metricsData] = await Promise.all([
        getJobs({ contractor_entity_id: selectedEntity }),
        selectedEntity ? getContractorDashboardMetrics(selectedEntity) : null,
      ]);
      setJobs(jobsData || []);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeJobs = jobs.filter(j => j.status === JOB_STATUS.ACTIVE);
  const pendingJobs = jobs.filter(j => j.status === JOB_STATUS.PENDING);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HardHat className="w-7 h-7 text-orange-600" />
            Construction Management
          </h1>
          <p className="text-gray-500 mt-1">Manage jobs, subcontractors, and field operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/construction/subcontractors')}>
            <Users className="w-4 h-4 mr-2" />
            Subcontractors
          </Button>
          <Button onClick={() => navigate('/construction/jobs/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">{activeJobs.length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Jobs</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingJobs.length}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending POs</p>
                <p className="text-2xl font-bold text-blue-600">{metrics?.pending_pos || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open RFIs</p>
                <p className="text-2xl font-bold text-purple-600">{metrics?.open_rfis || 0}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expiring COIs</p>
                <p className="text-2xl font-bold text-red-600">{metrics?.expiring_insurance || 0}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Daily Log', icon: Calendar, path: '/construction/daily-logs', color: 'bg-blue-50 text-blue-600' },
          { label: 'New PO', icon: FileText, path: '/construction/purchase-orders/new', color: 'bg-green-50 text-green-600' },
          { label: 'Schedule Inspection', icon: ClipboardList, path: '/construction/inspections', color: 'bg-purple-50 text-purple-600' },
          { label: 'Create RFI', icon: AlertTriangle, path: '/construction/rfis/new', color: 'bg-orange-50 text-orange-600' },
          { label: 'Punch List', icon: CheckCircle2, path: '/construction/punch-lists', color: 'bg-pink-50 text-pink-600' },
          { label: 'Reports', icon: BarChart3, path: '/construction/reports', color: 'bg-gray-50 text-gray-600' },
        ].map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border hover:shadow-md transition-all",
              action.color
            )}
          >
            <action.icon className="w-6 h-6" />
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Active Jobs List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg">Active Jobs</CardTitle>
          <Link to="/construction/jobs" className="text-sm text-blue-600 hover:underline flex items-center">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {activeJobs.slice(0, 5).map((job) => (
              <Link
                key={job.id}
                to={`/construction/jobs/${job.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <HardHat className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">{job.name}</p>
                    <p className="text-sm text-gray-500">{job.job_number} • {job.project?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(job.contract_amount)}</p>
                    <p className="text-sm text-gray-500">Contract Value</p>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {JOB_STATUS_LABELS[job.status]}
                  </Badge>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
            {activeJobs.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <HardHat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No active jobs</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/construction/jobs/new')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Job
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Inspections */}
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              Upcoming Inspections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Placeholder for inspections */}
              <div className="text-center text-gray-500 py-4">
                <p>No upcoming inspections scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent RFIs */}
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Open RFIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Placeholder for RFIs */}
              <div className="text-center text-gray-500 py-4">
                <p>No open RFIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Insurance Certificates */}
      {metrics?.expiring_insurance > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center gap-2 text-red-800">
              <Shield className="w-5 h-5" />
              Insurance Certificates Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              {metrics.expiring_insurance} certificate(s) will expire in the next 30 days.
            </p>
            <Button 
              variant="outline" 
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
              onClick={() => navigate('/construction/subcontractors?filter=expiring')}
            >
              View Expiring Certificates
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConstructionDashboardPage;
