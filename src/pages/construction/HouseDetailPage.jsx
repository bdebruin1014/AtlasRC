import React, { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle, Circle, ArrowRight, ArrowUpRight,
  DollarSign, Calendar, Home, Palette,
  ClipboardList, Flag, Layers, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LoadingState from '@/components/LoadingState';
import {
  getHouseById, updateHouse, advanceMilestone, getDailyLogs,
  MILESTONES, getMilestoneLabel, getMilestoneIndex,
} from '@/services/constructionService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (val) => {
  if (val == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateShort = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

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

const ELEVATION_OPTIONS = ['A', 'B', 'C', 'Craftsman', 'Farmhouse', 'Modern', 'Traditional'];
const UPGRADE_PACKAGES = ['Standard', 'Classic', 'Elegance'];

// Default color selection keys by upgrade package
const COLOR_SELECTION_GROUPS = {
  exterior: [
    { key: 'exterior_siding', label: 'Siding Color' },
    { key: 'exterior_trim', label: 'Trim Color' },
    { key: 'exterior_shutters', label: 'Shutters' },
    { key: 'exterior_front_door', label: 'Front Door' },
    { key: 'exterior_stone_brick', label: 'Stone/Brick Selection' },
    { key: 'exterior_roof_shingle', label: 'Roof Shingle' },
  ],
  interior: [
    { key: 'interior_walls', label: 'Wall Color' },
    { key: 'interior_trim', label: 'Trim Color' },
    { key: 'interior_cabinet_style', label: 'Cabinet Style' },
    { key: 'interior_cabinet_color', label: 'Cabinet Color' },
    { key: 'interior_countertop', label: 'Countertop' },
    { key: 'interior_backsplash', label: 'Backsplash' },
  ],
  flooring: [
    { key: 'flooring_main', label: 'Main Living (LVP/Hardwood/Tile)' },
    { key: 'flooring_bedrooms', label: 'Bedrooms' },
    { key: 'flooring_wet_areas', label: 'Wet Areas (Tile)' },
  ],
  fixtures: [
    { key: 'fixtures_plumbing', label: 'Plumbing Fixtures' },
    { key: 'fixtures_lighting', label: 'Lighting Package' },
    { key: 'fixtures_hardware', label: 'Hardware' },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

const HouseDetailPage = () => {
  const { houseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAdvanceConfirm, setShowAdvanceConfirm] = useState(false);
  const [editingSelections, setEditingSelections] = useState(false);
  const [colorDraft, setColorDraft] = useState(null);

  const { data: houseResult, isLoading } = useQuery({
    queryKey: ['construction-house', houseId],
    queryFn: () => getHouseById(houseId),
  });

  const { data: logsResult } = useQuery({
    queryKey: ['construction-daily-logs', houseId],
    queryFn: () => getDailyLogs(houseId, 5),
  });

  const invalidateHouse = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['construction-house', houseId] });
    queryClient.invalidateQueries({ queryKey: ['construction-houses'] });
  }, [queryClient, houseId]);

  const advanceMutation = useMutation({
    mutationFn: ({ id, milestone, notes }) => advanceMilestone(id, milestone, notes),
    onSuccess: () => {
      invalidateHouse();
      queryClient.invalidateQueries({ queryKey: ['construction-milestone-summary'] });
      setShowAdvanceConfirm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => updateHouse(id, updates),
    onSuccess: () => invalidateHouse(),
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

  // Days in current milestone
  const currentDateField = MILESTONES[currentIdx]?.dateField;
  const milestoneStartDate = house[currentDateField];
  const daysInMilestone = milestoneStartDate
    ? Math.floor((new Date() - new Date(milestoneStartDate)) / (1000 * 60 * 60 * 24))
    : null;

  // Budget values
  const baseBuild = house.base_build_cost || 0;
  const lotPrep = house.lot_prep_cost || 0;
  const softCosts = house.soft_costs || 0;
  const upgradeCost = house.upgrade_cost || 0;
  const lotPremium = house.lot_premium || 0;
  const totalBudget = house.total_budget || (baseBuild + lotPrep + softCosts + upgradeCost + lotPremium);
  const actualCost = house.actual_cost || 0;
  const remaining = totalBudget - actualCost;
  const pctSpent = totalBudget > 0 ? Math.min((actualCost / totalBudget) * 100, 100) : 0;

  const colorSelections = house.color_selections || {};

  const handleAdvance = () => {
    if (!nextMilestone) return;
    advanceMutation.mutate({
      id: house.id,
      milestone: nextMilestone.key,
      notes: `Advanced to ${nextMilestone.label}`,
    });
  };

  const handleConfigChange = (field, value) => {
    const confirmed = window.confirm('This will update your budget template. Continue?');
    if (!confirmed) return;
    updateMutation.mutate({ id: house.id, updates: { [field]: value } });
  };

  const handleSaveColors = () => {
    if (!colorDraft) return;
    updateMutation.mutate(
      { id: house.id, updates: { color_selections: colorDraft } },
      { onSuccess: () => { setEditingSelections(false); setColorDraft(null); } }
    );
  };

  const startEditingColors = () => {
    setColorDraft({ ...colorSelections });
    setEditingSelections(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* ── TOP BAR ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{house.house_name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {house.address}{house.city ? `, ${house.city}` : ''}{house.state ? `, ${house.state}` : ''} {house.zip_code || ''}
          </p>
          {house.project?.name && (
            <Link
              to={`/project/${house.project_id}`}
              className="inline-flex items-center gap-1 mt-1.5 text-sm text-emerald-600 hover:underline"
            >
              {house.project.name}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            'px-2.5 py-1 rounded text-xs font-medium',
            house.status === 'active' ? 'bg-green-100 text-green-700' :
            house.status === 'on_hold' ? 'bg-yellow-100 text-yellow-700' :
            house.status === 'complete' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          )}>
            {house.status?.replace('_', ' ') || 'active'}
          </span>
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

      {/* ── MILESTONE PROGRESS BAR ─────────────────────────────────── */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          {MILESTONES.map((m, idx) => {
            const isComplete = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isFuture = idx > currentIdx;
            const dateValue = house[m.dateField];

            return (
              <React.Fragment key={m.key}>
                <div className="flex flex-col items-center relative" style={{ minWidth: 72 }}>
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                    isComplete && 'bg-emerald-500 border-emerald-500',
                    isCurrent && `border-emerald-500 ${MILESTONE_COLORS[m.key]}`,
                    isFuture && 'border-gray-300 bg-white',
                  )}>
                    {isComplete && <CheckCircle className="w-5 h-5 text-white" />}
                    {isCurrent && <div className="w-3 h-3 bg-white rounded-full animate-pulse" />}
                    {isFuture && <Circle className="w-4 h-4 text-gray-300" />}
                  </div>
                  <p className={cn(
                    'text-xs mt-2 text-center font-medium',
                    isCurrent ? 'text-emerald-700' : isComplete ? 'text-gray-700' : 'text-gray-400',
                  )}>
                    {m.label}
                  </p>
                  {dateValue && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(dateValue)}</p>
                  )}
                </div>
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

      {/* ── CONTENT AREA: 2-column layout ──────────────────────────── */}
      <div className="grid grid-cols-5 gap-6">

        {/* LEFT COLUMN (3/5 = 60%) */}
        <div className="col-span-3 space-y-6">

          {/* Plan & Configuration Card */}
          <div className="bg-white border rounded-lg">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-500" />
                Plan & Configuration
              </h3>
            </div>
            <div className="p-5 space-y-5">
              {!house.plan_name ? (
                <div className="text-center py-8">
                  <Home className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 mb-3">No floor plan selected yet</p>
                  <Button
                    className="bg-[#047857] hover:bg-[#065f46]"
                    onClick={() => navigate('/construction/admin/floor-plans')}
                  >
                    Select Floor Plan
                  </Button>
                </div>
              ) : (
                <>
                  {/* Floor Plan display */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Floor Plan</label>
                    <div className="mt-1 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">{house.plan_name}</p>
                        <p className="text-sm text-gray-500">
                          {house.plan_sqft?.toLocaleString()} sqft
                          {house.bedrooms ? ` · ${house.bedrooms} bed` : ''}
                          {house.bathrooms ? ` / ${house.bathrooms} bath` : ''}
                          {house.garage_spaces ? ` · ${house.garage_spaces}-car garage` : ''}
                          {house.stories ? ` · ${house.stories} story` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Elevation */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Elevation</label>
                    <div className="mt-1 relative">
                      <select
                        value={house.elevation || ''}
                        onChange={(e) => handleConfigChange('elevation', e.target.value || null)}
                        className="w-full max-w-xs border rounded-md px-3 py-2 text-sm bg-white appearance-none cursor-pointer pr-8"
                      >
                        <option value="">Select elevation...</option>
                        {ELEVATION_OPTIONS.map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" style={{ right: 'calc(100% - 19rem)' }} />
                    </div>
                  </div>

                  {/* Upgrade Package */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Upgrade Package</label>
                    <div className="mt-1">
                      <select
                        value={house.upgrade_package || ''}
                        onChange={(e) => handleConfigChange('upgrade_package', e.target.value || null)}
                        className="w-full max-w-xs border rounded-md px-3 py-2 text-sm bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Select package...</option>
                        {UPGRADE_PACKAGES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Color Selections Card */}
          <div className="bg-white border rounded-lg">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-500" />
                Color Selections
              </h3>
              {!editingSelections ? (
                <Button variant="outline" size="sm" onClick={startEditingColors}>
                  Edit Selections
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingSelections(false); setColorDraft(null); }}>
                    Cancel
                  </Button>
                  <Button size="sm" className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSaveColors} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
            <div className="p-5 space-y-5">
              {Object.entries(COLOR_SELECTION_GROUPS).map(([groupKey, fields]) => (
                <div key={groupKey}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 capitalize">{groupKey}</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {fields.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-gray-600">{label}</span>
                        {editingSelections ? (
                          <input
                            type="text"
                            value={colorDraft?.[key] || ''}
                            onChange={(e) => setColorDraft(prev => ({ ...prev, [key]: e.target.value }))}
                            className="border rounded px-2 py-1 text-sm w-44 text-right"
                            placeholder="—"
                          />
                        ) : (
                          <span className="text-sm font-medium text-right">
                            {colorSelections[key] || <span className="text-gray-300">—</span>}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lot Details Card */}
          <div className="bg-white border rounded-lg">
            <div className="px-5 py-3 border-b">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-500" />
                Lot Details
              </h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Lot Number</p>
                  <p className="font-medium mt-0.5">{house.house_number || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Subdivision</p>
                  <p className="font-medium mt-0.5">{house.subdivision || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Municipality</p>
                  <p className="font-medium mt-0.5">{house.municipality || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Lot Size (acres)</p>
                  <p className="font-medium mt-0.5">{house.lot_size_acres || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Lot Premium</p>
                  <p className="font-medium mt-0.5">{formatCurrency(house.lot_premium)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Lot Cost</p>
                  <p className="font-medium mt-0.5">{formatCurrency(house.lot_cost)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (2/5 = 40%) */}
        <div className="col-span-2 space-y-6">

          {/* Budget Summary Card */}
          <div className="bg-white border rounded-lg">
            <div className="px-5 py-3 border-b">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                Budget Summary
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Build Cost</span>
                  <span className="font-medium">{formatCurrency(baseBuild)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lot Prep</span>
                  <span className="font-medium">{formatCurrency(lotPrep)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Soft Costs</span>
                  <span className="font-medium">{formatCurrency(softCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Upgrade Delta</span>
                  <span className="font-medium">{formatCurrency(upgradeCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lot Premium</span>
                  <span className="font-medium">{formatCurrency(lotPremium)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total Budget</span>
                  <span className="font-bold text-lg">{formatCurrency(totalBudget)}</span>
                </div>
              </div>

              {/* Budget bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Actual Spent: {formatCurrency(actualCost)}</span>
                  <span>Remaining: {formatCurrency(remaining)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={cn(
                      'h-2.5 rounded-full transition-all',
                      pctSpent > 90 ? 'bg-red-500' : pctSpent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${pctSpent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{pctSpent.toFixed(0)}% spent</p>
              </div>
            </div>
          </div>

          {/* Key Dates Card */}
          <div className="bg-white border rounded-lg">
            <div className="px-5 py-3 border-b">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Key Dates
              </h3>
            </div>
            <div className="p-5 space-y-2 text-sm">
              {[
                { label: 'Contract Date', value: house.contract_date },
                { label: 'Permit Submitted', value: house.permit_submitted_date },
                { label: 'Permit Approved', value: house.permit_approved_date },
                { label: 'Foundation', value: house.foundation_pour_date || house.foundation_date },
                { label: 'Framing Start', value: house.framing_start_date || house.framing_date },
                { label: 'Sheetrock', value: house.sheetrock_start_date || house.sheetrock_date },
                { label: 'CO', value: house.co_date },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1">
                  <span className="text-gray-600">{label}</span>
                  <span className={cn('font-medium', value ? '' : 'text-gray-300')}>{formatDate(value)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 space-y-1">
                {daysInMilestone != null && (
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Days in {getMilestoneLabel(house.current_milestone)}</span>
                    <span className="font-semibold">{daysInMilestone}d</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white border rounded-lg">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">Recent Activity</h3>
              <Link
                to={`/construction/${houseId}/daily-logs`}
                className="text-xs text-emerald-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y">
              {/* Milestone log entries */}
              {(house.milestone_log || []).slice(0, 5).map((entry) => (
                <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Flag className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      Advanced to <span className="font-medium">{getMilestoneLabel(entry.milestone)}</span>
                      {entry.previous_milestone && (
                        <span className="text-gray-400"> from {getMilestoneLabel(entry.previous_milestone)}</span>
                      )}
                    </p>
                    {entry.notes && <p className="text-xs text-gray-500 truncate">{entry.notes}</p>}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDateShort(entry.milestone_date)}</span>
                </div>
              ))}
              {/* Daily log entries */}
              {recentLogs.map((log) => (
                <div key={log.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{log.work_performed || 'Daily log entry'}</p>
                    <p className="text-xs text-gray-500">
                      {log.weather && `${log.weather} · `}{log.crew_count && `${log.crew_count} crew`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDateShort(log.log_date)}</span>
                </div>
              ))}
              {(house.milestone_log || []).length === 0 && recentLogs.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No activity yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseDetailPage;
