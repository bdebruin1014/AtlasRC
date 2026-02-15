import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle, Circle, Clock, ArrowRight,
  DollarSign, TrendingUp, Calendar, Home,
  FileText, ClipboardList, ShieldCheck, Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LoadingState from '@/components/LoadingState';
import {
  getHouseById, advanceMilestone, getDailyLogs,
  MILESTONES, getMilestoneLabel, getMilestoneIndex,
} from '@/services/constructionService';

const MILESTONE_COLORS = {
  pre_contract: 'bg-gray-400',
  permitting: 'bg-blue-500',
  mobilized: 'bg-yellow-500',
  foundation: 'bg-orange-500',
  framing: 'bg-orange-500',
  sheetrock: 'bg-purple-500',
  co: 'bg-green-500',
  warranty: 'bg-teal-500',
  complete: 'bg-emerald-700',
};

const formatCurrency = (val) => {
  if (val == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const HouseDetailPage = () => {
  const { houseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAdvanceConfirm, setShowAdvanceConfirm] = useState(false);

  const { data: houseResult, isLoading } = useQuery({
    queryKey: ['construction-house', houseId],
    queryFn: () => getHouseById(houseId),
  });

  const { data: logsResult } = useQuery({
    queryKey: ['construction-daily-logs', houseId],
    queryFn: () => getDailyLogs(houseId, 3),
  });

  const advanceMutation = useMutation({
    mutationFn: ({ id, milestone, notes }) => advanceMilestone(id, milestone, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['construction-house', houseId] });
      queryClient.invalidateQueries({ queryKey: ['construction-houses'] });
      queryClient.invalidateQueries({ queryKey: ['construction-milestone-summary'] });
      setShowAdvanceConfirm(false);
    },
  });

  const house = houseResult?.data;
  const recentLogs = logsResult?.data || [];

  if (isLoading) {
    return <LoadingState message="Loading house details..." />;
  }

  if (!house) {
    return (
      <div className="p-6 text-center">
        <Home className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-1">House not found</h3>
        <Button variant="outline" onClick={() => navigate('/construction')}>
          Back to Houses
        </Button>
      </div>
    );
  }

  const currentIdx = getMilestoneIndex(house.current_milestone);
  const nextMilestone = currentIdx < MILESTONES.length - 1 ? MILESTONES[currentIdx + 1] : null;
  const margin = (house.contract_price || 0) - (house.actual_cost || 0);

  // Days in current milestone
  const currentDateField = MILESTONES[currentIdx]?.dateField;
  const milestoneStartDate = house[currentDateField];
  const daysInMilestone = milestoneStartDate
    ? Math.floor((new Date() - new Date(milestoneStartDate)) / (1000 * 60 * 60 * 24))
    : null;

  const handleAdvance = () => {
    if (!nextMilestone) return;
    advanceMutation.mutate({
      id: house.id,
      milestone: nextMilestone.key,
      notes: `Advanced to ${nextMilestone.label}`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{house.house_name}</h1>
          <p className="text-sm text-gray-500">
            {house.address}, {house.city}, {house.state} {house.zip_code}
          </p>
          <div className="flex items-center gap-3 mt-2">
            {house.project?.name && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                {house.project.name}
              </span>
            )}
            {house.plan_name && (
              <span className="text-sm text-gray-600">
                {house.plan_name} &middot; {house.plan_sqft?.toLocaleString()} sqft &middot; {house.bedrooms}bd/{house.bathrooms}ba
              </span>
            )}
          </div>
        </div>
        {nextMilestone && (
          <Button
            className="bg-[#047857] hover:bg-[#065f46]"
            onClick={() => setShowAdvanceConfirm(true)}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Advance to {nextMilestone.label}
          </Button>
        )}
      </div>

      {/* Advance Confirmation */}
      {showAdvanceConfirm && nextMilestone && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-800">
              Advance to {nextMilestone.label}?
            </p>
            <p className="text-sm text-amber-600">
              This will move {house.house_name} from {getMilestoneLabel(house.current_milestone)} to {nextMilestone.label} and set today's date.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAdvanceConfirm(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#047857] hover:bg-[#065f46]"
              onClick={handleAdvance}
              disabled={advanceMutation.isPending}
            >
              {advanceMutation.isPending ? 'Advancing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      )}

      {/* Milestone Progress Bar */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          {MILESTONES.map((m, idx) => {
            const isComplete = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isFuture = idx > currentIdx;
            const dateField = m.dateField;
            const dateValue = house[dateField];

            return (
              <React.Fragment key={m.key}>
                {/* Milestone node */}
                <div className="flex flex-col items-center relative" style={{ minWidth: 72 }}>
                  {/* Circle */}
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                    isComplete && 'bg-emerald-500 border-emerald-500',
                    isCurrent && `border-emerald-500 ${MILESTONE_COLORS[m.key]}`,
                    isFuture && 'border-gray-300 bg-white',
                  )}>
                    {isComplete && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                    {isCurrent && (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    )}
                    {isFuture && (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  {/* Label */}
                  <p className={cn(
                    'text-xs mt-2 text-center font-medium',
                    isCurrent ? 'text-emerald-700' : isComplete ? 'text-gray-700' : 'text-gray-400',
                  )}>
                    {m.label}
                  </p>
                  {/* Date */}
                  {dateValue && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(dateValue)}
                    </p>
                  )}
                </div>
                {/* Connector line */}
                {idx < MILESTONES.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-1 mt-[-24px]',
                    idx < currentIdx ? 'bg-emerald-500' : 'bg-gray-200',
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatCurrency(house.contract_price)}</p>
              <p className="text-xs text-gray-500">Contract Price</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatCurrency(house.estimated_cost)}</p>
              <p className="text-xs text-gray-500">Estimated Cost</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatCurrency(house.actual_cost)}</p>
              <p className="text-xs text-gray-500">Actual Cost</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              margin >= 0 ? 'bg-green-100' : 'bg-red-100',
            )}>
              <DollarSign className={cn('w-5 h-5', margin >= 0 ? 'text-green-600' : 'text-red-600')} />
            </div>
            <div>
              <p className={cn('text-lg font-bold', margin >= 0 ? 'text-green-600' : 'text-red-600')}>
                {formatCurrency(margin)}
              </p>
              <p className="text-xs text-gray-500">Margin</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-lg font-bold">
                {daysInMilestone != null ? `${daysInMilestone}d` : '—'}
              </p>
              <p className="text-xs text-gray-500">In Current Milestone</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Activity + Quick Links */}
      <div className="grid grid-cols-3 gap-6">
        {/* Milestone History */}
        <div className="col-span-2 bg-white border rounded-lg">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm">Recent Activity</h3>
            <Link
              to={`/construction/${houseId}/milestones`}
              className="text-xs text-emerald-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y">
            {/* Milestone log entries */}
            {(house.milestone_log || []).slice(0, 5).map((entry) => (
              <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Flag className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Advanced to <span className="font-medium">{getMilestoneLabel(entry.milestone)}</span>
                    {entry.previous_milestone && (
                      <span className="text-gray-400"> from {getMilestoneLabel(entry.previous_milestone)}</span>
                    )}
                  </p>
                  {entry.notes && <p className="text-xs text-gray-500">{entry.notes}</p>}
                </div>
                <span className="text-xs text-gray-400">{formatDate(entry.milestone_date)}</span>
              </div>
            ))}
            {/* Daily log entries */}
            {recentLogs.map((log) => (
              <div key={log.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm truncate">{log.work_performed || 'Daily log entry'}</p>
                  <p className="text-xs text-gray-500">
                    {log.weather && `${log.weather} · `}{log.crew_count && `${log.crew_count} crew`}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{formatDate(log.log_date)}</span>
              </div>
            ))}
            {(house.milestone_log || []).length === 0 && recentLogs.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No activity yet
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white border rounded-lg">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Quick Links</h3>
          </div>
          <div className="divide-y">
            {[
              { label: 'Purchase Orders', icon: FileText, path: `${houseId}/purchase-orders` },
              { label: 'Daily Logs', icon: ClipboardList, path: `${houseId}/daily-logs` },
              { label: 'Inspections', icon: CheckCircle, path: `${houseId}/inspections` },
              { label: 'Warranty', icon: ShieldCheck, path: `${houseId}/warranty` },
              { label: 'Milestone Tracker', icon: Flag, path: `${houseId}/milestones` },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(`/construction/${link.path}`)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{link.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Buyer Info */}
      {house.buyer_name && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Buyer Information</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{house.buyer_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Contract Date</p>
              <p className="font-medium">{house.contract_date || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Lot Premium</p>
              <p className="font-medium">{formatCurrency(house.lot_premium)}</p>
            </div>
            <div>
              <p className="text-gray-500">Upgrades</p>
              <p className="font-medium">{formatCurrency(house.upgrade_total)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseDetailPage;
