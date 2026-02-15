// src/pages/construction/ContractAssemblerPage.jsx
// 5-step wizard for assembling Red Cedar Homes construction contracts

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Home, FileText, MapPin, Eye, Send, ChevronLeft, ChevronRight,
  Check, AlertTriangle, Search, Building2, User, DollarSign, Ruler,
  FileDown, FileSignature, Save, Loader2, X, Camera, Plus, Trash2,
  Info, CheckCircle2, Circle
} from 'lucide-react';
import { contractAssemblerService } from '@/services/contractAssemblerService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) => {
  if (n == null) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
};

const fmtCents = (n) => {
  if (n == null) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
};

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const today = () => new Date().toISOString().split('T')[0];

// ─── Step Definitions ────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Select House', icon: Home },
  { num: 2, label: 'Contract Terms', icon: FileText },
  { num: 3, label: 'Lot Condition', icon: MapPin },
  { num: 4, label: 'Review', icon: Eye },
  { num: 5, label: 'Generate', icon: Send },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ContractAssemblerPage() {
  const { houseId: houseIdParam } = useParams();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1);
  const [selectedHouseId, setSelectedHouseId] = useState(houseIdParam || null);
  const [houseData, setHouseData] = useState(null);
  const [eligibleHouses, setEligibleHouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHouses, setLoadingHouses] = useState(true);
  const [error, setError] = useState(null);

  // Step 2 — Contract terms
  const [contractTerms, setContractTerms] = useState({
    contract_date: today(),
    estimated_start_date: addDays(today(), 30),
    build_duration_days: 180,
    warranty_period_months: 12,
    structural_warranty_years: 0,
    change_order_policy: 'Written approval required before work begins',
    dispute_resolution: 'Mediation then Litigation',
    jurisdiction: 'Greenville County, South Carolina',
    builders_risk: 'Included by Builder',
    permit_responsibility: 'Builder obtains all permits',
    allowances: { lighting: 0, appliance: 0, landscaping: 0, flooring: 0 },
  });
  const [drawSchedule, setDrawSchedule] = useState(
    contractAssemblerService.getDefaultDrawSchedule()
  );

  // Step 3 — Lot condition
  const [lotCondition, setLotCondition] = useState({
    access_road_type: '',
    driveway_cut_required: false,
    temp_access_needed: false,
    temp_access_notes: '',
    distance_from_road: '',
    lot_condition: '',
    topography: '',
    fill_dirt_required: false,
    fill_dirt_yards: '',
    cut_required: false,
    cut_yards: '',
    retaining_wall_required: false,
    retaining_wall_lf: '',
    erosion_control_required: false,
    water: '',
    sewer: '',
    electric: '',
    gas: '',
    water_distance: '',
    sewer_distance: '',
    electric_distance: '',
    wetlands_present: false,
    wetlands_pct: '',
    flood_zone: 'X - None',
    soil_issues: false,
    soil_notes: '',
    environmental_notes: '',
    tree_removal: 'None',
    tree_save_required: false,
    existing_structures: false,
    demo_required: false,
    demo_description: '',
    demo_cost: 0,
    site_cost_adjustment: 0,
    site_cost_adjustment_reason: '',
  });
  const [lotPhotos, setLotPhotos] = useState([]);

  // Step 5 — Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);

  // ─── Derived values ──────────────────────────────────────────────────────

  const contractPrice = useMemo(() => {
    if (!houseData?.house) return 0;
    const h = houseData.house;
    const base = (h.base_build_cost || 0) + (h.lot_prep_cost || 0) + (h.soft_costs || 0) + (h.upgrade_cost || 0) + (h.lot_premium || 0);
    return base + (lotCondition.site_cost_adjustment || 0);
  }, [houseData, lotCondition.site_cost_adjustment]);

  const drawAmounts = useMemo(() => {
    return contractAssemblerService.calculateDrawSchedule(contractPrice, drawSchedule);
  }, [contractPrice, drawSchedule]);

  const drawPctTotal = useMemo(() => {
    return drawSchedule.reduce((sum, d) => sum + (d.pct || 0), 0);
  }, [drawSchedule]);

  const estimatedCompletion = useMemo(() => {
    if (!contractTerms.estimated_start_date || !contractTerms.build_duration_days) return '';
    return addDays(contractTerms.estimated_start_date, contractTerms.build_duration_days);
  }, [contractTerms.estimated_start_date, contractTerms.build_duration_days]);

  const hasBuyer = !!houseData?.house?.buyer_name || !!houseData?.buyer;
  const hasPlan = !!houseData?.house?.plan_name || !!houseData?.plan;

  // ─── Load eligible houses ────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      setLoadingHouses(true);
      try {
        const houses = await contractAssemblerService.getEligibleHouses();
        setEligibleHouses(houses);
      } catch (err) {
        console.error('Failed to load eligible houses:', err);
      }
      setLoadingHouses(false);
    }
    load();
  }, []);

  // ─── Auto-load house data when selected ──────────────────────────────────

  useEffect(() => {
    if (!selectedHouseId) return;
    async function loadHouse() {
      setLoading(true);
      setError(null);
      try {
        const data = await contractAssemblerService.assembleContractData(selectedHouseId);
        setHouseData(data);
        // Try to load default terms
        const terms = await contractAssemblerService.getDefaultTerms();
        setContractTerms(prev => ({ ...prev, ...terms }));
        // Check for existing draft
        const draft = await contractAssemblerService.getDraftContract(selectedHouseId);
        if (draft) {
          if (draft.draw_schedule?.length) setDrawSchedule(draft.draw_schedule);
          if (draft.lot_condition_report) setLotCondition(prev => ({ ...prev, ...draft.lot_condition_report }));
          if (draft.change_order_policy) setContractTerms(prev => ({
            ...prev,
            contract_date: draft.contract_date || prev.contract_date,
            estimated_start_date: draft.estimated_start_date || prev.estimated_start_date,
            build_duration_days: draft.build_duration_days || prev.build_duration_days,
            warranty_period_months: draft.warranty_period_months || prev.warranty_period_months,
            structural_warranty_years: draft.structural_warranty_years ?? prev.structural_warranty_years,
            change_order_policy: draft.change_order_policy || prev.change_order_policy,
            dispute_resolution: draft.dispute_resolution || prev.dispute_resolution,
            jurisdiction: draft.jurisdiction || prev.jurisdiction,
            builders_risk: draft.builders_risk || prev.builders_risk,
            permit_responsibility: draft.permit_responsibility || prev.permit_responsibility,
            allowances: draft.allowances || prev.allowances,
          }));
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadHouse();
  }, [selectedHouseId]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const handleSaveDraft = useCallback(async () => {
    if (!selectedHouseId) return;
    setSavingDraft(true);
    try {
      await contractAssemblerService.saveContractDraft(selectedHouseId, {
        contract_date: contractTerms.contract_date,
        estimated_start_date: contractTerms.estimated_start_date,
        estimated_completion_date: estimatedCompletion,
        build_duration_days: contractTerms.build_duration_days,
        contract_price: contractPrice,
        draw_schedule: drawAmounts,
        warranty_period_months: contractTerms.warranty_period_months,
        structural_warranty_years: contractTerms.structural_warranty_years,
        allowances: contractTerms.allowances,
        change_order_policy: contractTerms.change_order_policy,
        dispute_resolution: contractTerms.dispute_resolution,
        jurisdiction: contractTerms.jurisdiction,
        builders_risk: contractTerms.builders_risk,
        permit_responsibility: contractTerms.permit_responsibility,
        lot_condition_report: lotCondition,
        site_cost_adjustment: lotCondition.site_cost_adjustment,
        site_cost_adjustment_reason: lotCondition.site_cost_adjustment_reason,
      });
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
    setSavingDraft(false);
  }, [selectedHouseId, contractTerms, estimatedCompletion, contractPrice, drawAmounts, lotCondition]);

  const handleGenerate = useCallback(async () => {
    if (!selectedHouseId || !houseData) return;
    setIsGenerating(true);
    try {
      const result = await contractAssemblerService.generateContract(selectedHouseId, {
        contract_date: contractTerms.contract_date,
        estimated_start_date: contractTerms.estimated_start_date,
        estimated_completion_date: estimatedCompletion,
        build_duration_days: contractTerms.build_duration_days,
        contract_price: contractPrice,
        draw_schedule: drawAmounts,
        warranty_period_months: contractTerms.warranty_period_months,
        structural_warranty_years: contractTerms.structural_warranty_years,
        allowances: contractTerms.allowances,
        change_order_policy: contractTerms.change_order_policy,
        dispute_resolution: contractTerms.dispute_resolution,
        jurisdiction: contractTerms.jurisdiction,
        builders_risk: contractTerms.builders_risk,
        permit_responsibility: contractTerms.permit_responsibility,
        lot_condition_report: lotCondition,
        site_cost_adjustment: lotCondition.site_cost_adjustment,
        site_cost_adjustment_reason: lotCondition.site_cost_adjustment_reason,
        budget_snapshot: houseData.budgetItems,
        selections_snapshot: houseData.selections,
      });
      setGeneratedContract(result);
    } catch (err) {
      setError(err.message);
    }
    setIsGenerating(false);
  }, [selectedHouseId, houseData, contractTerms, estimatedCompletion, contractPrice, drawAmounts, lotCondition]);

  // ─── Step validation ─────────────────────────────────────────────────────

  const canAdvance = useMemo(() => {
    switch (step) {
      case 1: return !!selectedHouseId && !!houseData && hasBuyer && hasPlan;
      case 2: return drawPctTotal === 100 && contractTerms.contract_date;
      case 3: return true; // Lot condition is optional
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  }, [step, selectedHouseId, houseData, hasBuyer, hasPlan, drawPctTotal, contractTerms]);

  // ─── Filtered houses ─────────────────────────────────────────────────────

  const filteredHouses = useMemo(() => {
    if (!searchQuery) return eligibleHouses;
    const q = searchQuery.toLowerCase();
    return eligibleHouses.filter(h =>
      h.house_name?.toLowerCase().includes(q) ||
      h.plan_name?.toLowerCase().includes(q) ||
      h.project?.name?.toLowerCase().includes(q)
    );
  }, [eligibleHouses, searchQuery]);

  // ─── Budget grouped by category ──────────────────────────────────────────

  const groupedBudget = useMemo(() => {
    if (!houseData?.budgetItems) return {};
    const groups = {};
    for (const item of houseData.budgetItems) {
      const cat = item.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [houseData]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      {/* ─── Left Step Indicator ───────────────────────────────────────────── */}
      <div className="w-[200px] bg-[#1a1f2e] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => navigate('/construction')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-3"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Houses
          </button>
          <h2 className="text-white font-semibold text-sm">Contract Assembler</h2>
          {houseData?.house && (
            <p className="text-gray-400 text-xs mt-1 truncate">{houseData.house.house_name}</p>
          )}
          {contractPrice > 0 && (
            <p className="text-emerald-400 text-sm font-semibold mt-1 tabular-nums">{fmt(contractPrice)}</p>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCurrent = step === s.num;
            const isComplete = step > s.num;
            const isDisabled = s.num > step + 1;
            return (
              <button
                key={s.num}
                onClick={() => !isDisabled && s.num <= step && setStep(s.num)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-xs transition-colors ${
                  isCurrent
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : isComplete
                    ? 'text-gray-300 hover:bg-gray-700/50'
                    : 'text-gray-500 cursor-default'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isComplete ? 'bg-emerald-600' : isCurrent ? 'bg-emerald-600/30 ring-1 ring-emerald-500' : 'bg-gray-700'
                }`}>
                  {isComplete ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <span className="text-[10px] font-medium">{s.num}</span>
                  )}
                </div>
                {s.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── Main Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-emerald-600" />
            <h1 className="text-sm font-semibold text-gray-900">
              {STEPS[step - 1].label}
            </h1>
            <span className="text-xs text-gray-400">Step {step} of 5</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Progress dots */}
            {STEPS.map(s => (
              <div
                key={s.num}
                className={`w-2 h-2 rounded-full ${
                  s.num === step ? 'bg-emerald-600' : s.num < step ? 'bg-emerald-400' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
            </div>
          )}

          {step === 1 && <Step1SelectHouse
            eligibleHouses={filteredHouses}
            loadingHouses={loadingHouses}
            selectedHouseId={selectedHouseId}
            setSelectedHouseId={setSelectedHouseId}
            houseData={houseData}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            hasBuyer={hasBuyer}
            hasPlan={hasPlan}
            contractPrice={contractPrice}
          />}
          {step === 2 && <Step2ContractTerms
            contractTerms={contractTerms}
            setContractTerms={setContractTerms}
            drawSchedule={drawSchedule}
            setDrawSchedule={setDrawSchedule}
            drawAmounts={drawAmounts}
            drawPctTotal={drawPctTotal}
            contractPrice={contractPrice}
            estimatedCompletion={estimatedCompletion}
          />}
          {step === 3 && <Step3LotCondition
            lotCondition={lotCondition}
            setLotCondition={setLotCondition}
            lotPhotos={lotPhotos}
            setLotPhotos={setLotPhotos}
            houseData={houseData}
            contractPrice={contractPrice}
          />}
          {step === 4 && <Step4Review
            houseData={houseData}
            contractTerms={contractTerms}
            drawAmounts={drawAmounts}
            lotCondition={lotCondition}
            contractPrice={contractPrice}
            estimatedCompletion={estimatedCompletion}
            groupedBudget={groupedBudget}
          />}
          {step === 5 && <Step5Generate
            houseData={houseData}
            isGenerating={isGenerating}
            generatedContract={generatedContract}
            onGenerate={handleGenerate}
            contractPrice={contractPrice}
          />}
        </div>

        {/* Footer */}
        <div className="bg-white border-t px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && step < 5 && (
              <button
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Draft
              </button>
            )}
            {step < 5 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance}
                className={`flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-md transition-colors ${
                  canAdvance
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 5 && (
              <button
                onClick={() => navigate('/construction')}
                className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1: SELECT HOUSE
// ═══════════════════════════════════════════════════════════════════════════════

function Step1SelectHouse({ eligibleHouses, loadingHouses, selectedHouseId, setSelectedHouseId, houseData, loading, searchQuery, setSearchQuery, hasBuyer, hasPlan, contractPrice }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Select House</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by house name, plan, or project..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {loadingHouses ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading eligible houses...</span>
        </div>
      ) : eligibleHouses.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 inline mr-1.5" />
          No houses at the pre-contract milestone. Houses must be in "Pre-Contract" status before a contract can be generated.
        </div>
      ) : (
        <div className="grid gap-2">
          {eligibleHouses.map(house => (
            <button
              key={house.id}
              onClick={() => setSelectedHouseId(house.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-lg border text-left transition-colors ${
                selectedHouseId === house.id
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                selectedHouseId === house.id ? 'bg-emerald-600' : 'bg-gray-100'
              }`}>
                <Home className={`w-4 h-4 ${selectedHouseId === house.id ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{house.house_name}</p>
                <p className="text-xs text-gray-500">{house.plan_name} &middot; {house.plan_sqft} sf &middot; {house.project?.name || 'No Project'}</p>
              </div>
              {house.buyer_name ? (
                <span className="text-xs text-gray-500 flex items-center gap-1"><User className="w-3 h-3" />{house.buyer_name}</span>
              ) : (
                <span className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />No buyer</span>
              )}
              {selectedHouseId === house.id && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Summary cards after selection */}
      {loading && selectedHouseId && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="ml-2 text-sm text-gray-500">Loading house data...</span>
        </div>
      )}

      {houseData && !loading && (
        <>
          {/* Warnings */}
          {!hasBuyer && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <strong>No buyer assigned.</strong> Complete the house record before generating a contract.
                <button onClick={() => navigate(`/construction/${selectedHouseId}`)} className="ml-1 text-amber-600 underline hover:text-amber-700">
                  Go to house record
                </button>
              </div>
            </div>
          )}
          {!hasPlan && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <strong>No floor plan selected.</strong> Assign a plan to this house before generating a contract.
              </div>
            </div>
          )}

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-4">
            <SummaryCard icon={MapPin} title="Property" items={[
              { label: 'Address', value: houseData.house.address },
              { label: 'City/State', value: `${houseData.house.city || ''}, ${houseData.house.state || ''} ${houseData.house.zip_code || ''}` },
              { label: 'County', value: houseData.house.county || '—' },
              { label: 'Subdivision', value: houseData.house.subdivision || '—' },
              { label: 'Lot Size', value: houseData.house.lot_size_acres ? `${houseData.house.lot_size_acres} acres` : '—' },
              { label: 'Municipality', value: houseData.house.municipality || '—' },
            ]} />
            <SummaryCard icon={Ruler} title="Plan" items={[
              { label: 'Plan', value: houseData.house.plan_name || houseData.plan?.plan_name || '—' },
              { label: 'Elevation', value: houseData.house.elevation || '—' },
              { label: 'SqFt', value: houseData.plan?.square_footage || houseData.house.plan_sqft || '—' },
              { label: 'Beds / Baths', value: `${houseData.plan?.bedrooms || houseData.house.bedrooms || '?'} / ${houseData.plan?.bathrooms || houseData.house.bathrooms || '?'}` },
              { label: 'Garage', value: houseData.plan?.garage_type || `${houseData.house.garage_spaces || 0}-Car` },
              { label: 'Stories', value: houseData.plan?.stories || '—' },
            ]} />
            <SummaryCard icon={User} title="Buyer" items={[
              { label: 'Name', value: houseData.buyer?.full_name || houseData.house.buyer_name || '—' },
              { label: 'Phone', value: houseData.buyer?.phone || '—' },
              { label: 'Email', value: houseData.buyer?.email || '—' },
              { label: 'Address', value: houseData.buyer?.address || '—' },
            ]} />
            <SummaryCard icon={DollarSign} title="Budget Summary" highlight items={[
              { label: 'Base Build', value: fmt(houseData.house.base_build_cost) },
              { label: 'Lot Prep', value: fmt(houseData.house.lot_prep_cost) },
              { label: 'Soft Costs', value: fmt(houseData.house.soft_costs) },
              { label: 'Upgrades', value: fmt(houseData.house.upgrade_cost) },
              { label: 'Lot Premium', value: fmt(houseData.house.lot_premium) },
              { label: 'Total Contract', value: fmt(contractPrice), bold: true },
            ]} />
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, title, items, highlight }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${highlight ? 'text-emerald-600' : 'text-gray-500'}`} />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
      </div>
      <dl className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <dt className="text-gray-500">{item.label}</dt>
            <dd className={`text-right tabular-nums ${item.bold ? 'font-semibold text-emerald-700 text-base' : 'text-gray-900'}`}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2: CONTRACT TERMS
// ═══════════════════════════════════════════════════════════════════════════════

function Step2ContractTerms({ contractTerms, setContractTerms, drawSchedule, setDrawSchedule, drawAmounts, drawPctTotal, contractPrice, estimatedCompletion }) {
  const setField = (field, value) => setContractTerms(prev => ({ ...prev, [field]: value }));
  const setAllowance = (key, value) => setContractTerms(prev => ({
    ...prev,
    allowances: { ...prev.allowances, [key]: parseFloat(value) || 0 }
  }));
  const setDrawPct = (idx, pct) => {
    setDrawSchedule(prev => prev.map((d, i) => i === idx ? { ...d, pct: parseFloat(pct) || 0 } : d));
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Contract Basics */}
      <FormSection title="Contract Basics">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Contract Date">
            <input type="date" value={contractTerms.contract_date} onChange={e => setField('contract_date', e.target.value)} className="input-field" />
          </FormField>
          <FormField label="Estimated Start Date">
            <input type="date" value={contractTerms.estimated_start_date} onChange={e => setField('estimated_start_date', e.target.value)} className="input-field" />
          </FormField>
          <FormField label="Build Duration (days)">
            <input type="number" value={contractTerms.build_duration_days} onChange={e => setField('build_duration_days', parseInt(e.target.value) || 0)} className="input-field" />
          </FormField>
          <FormField label="Estimated Completion">
            <input type="date" value={estimatedCompletion} readOnly className="input-field bg-gray-50 text-gray-500" />
          </FormField>
          <FormField label="Contract Price" span2>
            <div className="text-lg font-semibold text-emerald-700 tabular-nums bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
              {fmt(contractPrice)}
            </div>
          </FormField>
        </div>
      </FormSection>

      {/* Payment Schedule */}
      <FormSection title="Payment Schedule — 5 Draws">
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Draw</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Milestone</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase w-24">%</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drawAmounts.map((d, idx) => (
                <tr key={d.draw} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-700">Draw {d.draw}</td>
                  <td className="px-3 py-2 text-gray-600">{d.milestone}</td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={drawSchedule[idx].pct}
                      onChange={e => setDrawPct(idx, e.target.value)}
                      className="w-20 text-right px-2 py-1 border border-gray-300 rounded text-sm tabular-nums focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums text-gray-900">{fmtCents(d.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan="2" className="px-3 py-2 text-gray-700">Total</td>
                <td className={`px-3 py-2 text-right tabular-nums ${drawPctTotal === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {drawPctTotal}%
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-900">{fmtCents(contractPrice)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {drawPctTotal !== 100 && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Draw percentages must total 100%. Currently: {drawPctTotal}%
          </p>
        )}
      </FormSection>

      {/* Warranty */}
      <FormSection title="Warranty">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Builder's Warranty Period">
            <select value={contractTerms.warranty_period_months} onChange={e => setField('warranty_period_months', parseInt(e.target.value))} className="input-field">
              <option value={6}>6 Months</option>
              <option value={12}>1 Year</option>
              <option value={24}>2 Years</option>
            </select>
          </FormField>
          <FormField label="Structural Warranty">
            <select value={contractTerms.structural_warranty_years} onChange={e => setField('structural_warranty_years', parseInt(e.target.value))} className="input-field">
              <option value={0}>None</option>
              <option value={5}>5 Years</option>
              <option value={10}>10 Years</option>
            </select>
          </FormField>
        </div>
      </FormSection>

      {/* Allowances */}
      <FormSection title="Allowances" collapsible>
        <div className="grid grid-cols-2 gap-4">
          {['lighting', 'appliance', 'landscaping', 'flooring'].map(key => (
            <FormField key={key} label={`${key.charAt(0).toUpperCase() + key.slice(1)} Allowance`}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={contractTerms.allowances[key] || ''}
                  onChange={e => setAllowance(key, e.target.value)}
                  placeholder="0"
                  className="input-field pl-7 tabular-nums"
                />
              </div>
            </FormField>
          ))}
        </div>
      </FormSection>

      {/* Terms & Conditions */}
      <FormSection title="Terms & Conditions">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Change Order Policy">
            <select value={contractTerms.change_order_policy} onChange={e => setField('change_order_policy', e.target.value)} className="input-field">
              <option>Written approval required before work begins</option>
              <option>Verbal OK with written follow-up within 48 hours</option>
            </select>
          </FormField>
          <FormField label="Dispute Resolution">
            <select value={contractTerms.dispute_resolution} onChange={e => setField('dispute_resolution', e.target.value)} className="input-field">
              <option>Binding Arbitration</option>
              <option>Mediation then Litigation</option>
              <option>Litigation</option>
            </select>
          </FormField>
          <FormField label="Jurisdiction">
            <input type="text" value={contractTerms.jurisdiction} onChange={e => setField('jurisdiction', e.target.value)} className="input-field" />
          </FormField>
          <FormField label="Builder's Risk Insurance">
            <select value={contractTerms.builders_risk} onChange={e => setField('builders_risk', e.target.value)} className="input-field">
              <option>Included by Builder</option>
              <option>Provided by Owner</option>
            </select>
          </FormField>
          <FormField label="Permits" span2>
            <select value={contractTerms.permit_responsibility} onChange={e => setField('permit_responsibility', e.target.value)} className="input-field">
              <option>Builder obtains all permits</option>
              <option>Owner responsible for permits</option>
            </select>
          </FormField>
        </div>
      </FormSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: LOT CONDITION REPORT
// ═══════════════════════════════════════════════════════════════════════════════

function Step3LotCondition({ lotCondition, setLotCondition, lotPhotos, setLotPhotos, houseData, contractPrice }) {
  const setField = (field, value) => setLotCondition(prev => ({ ...prev, [field]: value }));

  const originalLotPrep = houseData?.house?.lot_prep_cost || 0;
  const adjustedLotPrep = originalLotPrep + (lotCondition.site_cost_adjustment || 0);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>This becomes <strong>Exhibit C</strong> of the contract. It documents existing lot conditions and protects the builder from unforeseen site costs.</div>
      </div>

      {/* Site Access */}
      <FormSection title="Site Access">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Access Road Type">
            <select value={lotCondition.access_road_type} onChange={e => setField('access_road_type', e.target.value)} className="input-field">
              <option value="">Select...</option>
              <option>Paved Public</option>
              <option>Paved Private</option>
              <option>Gravel</option>
              <option>Dirt</option>
              <option>None</option>
            </select>
          </FormField>
          <FormField label="Distance from Paved Road (ft)">
            <input type="number" value={lotCondition.distance_from_road} onChange={e => setField('distance_from_road', e.target.value)} placeholder="0" className="input-field tabular-nums" />
          </FormField>
          <CheckboxField label="Driveway Cut Required" checked={lotCondition.driveway_cut_required} onChange={v => setField('driveway_cut_required', v)} />
          <CheckboxField label="Temporary Construction Access Needed" checked={lotCondition.temp_access_needed} onChange={v => setField('temp_access_needed', v)} />
          {lotCondition.temp_access_needed && (
            <FormField label="Access Notes" span2>
              <textarea value={lotCondition.temp_access_notes} onChange={e => setField('temp_access_notes', e.target.value)} rows={2} className="input-field" placeholder="Describe access requirements..." />
            </FormField>
          )}
        </div>
      </FormSection>

      {/* Topography & Grading */}
      <FormSection title="Topography & Grading">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Lot Condition">
            <select value={lotCondition.lot_condition} onChange={e => setField('lot_condition', e.target.value)} className="input-field">
              <option value="">Select...</option>
              <option>Cleared</option>
              <option>Wooded</option>
              <option>Partially Cleared</option>
              <option>Previously Developed</option>
            </select>
          </FormField>
          <FormField label="Topography">
            <select value={lotCondition.topography} onChange={e => setField('topography', e.target.value)} className="input-field">
              <option value="">Select...</option>
              <option>Flat</option>
              <option>Gentle Slope (&lt;5%)</option>
              <option>Moderate (5-15%)</option>
              <option>Steep (&gt;15%)</option>
            </select>
          </FormField>
          <CheckboxField label="Fill Dirt Required" checked={lotCondition.fill_dirt_required} onChange={v => setField('fill_dirt_required', v)} />
          {lotCondition.fill_dirt_required && (
            <FormField label="Estimated Cubic Yards">
              <input type="number" value={lotCondition.fill_dirt_yards} onChange={e => setField('fill_dirt_yards', e.target.value)} className="input-field tabular-nums" />
            </FormField>
          )}
          <CheckboxField label="Cut Required" checked={lotCondition.cut_required} onChange={v => setField('cut_required', v)} />
          {lotCondition.cut_required && (
            <FormField label="Estimated Cubic Yards">
              <input type="number" value={lotCondition.cut_yards} onChange={e => setField('cut_yards', e.target.value)} className="input-field tabular-nums" />
            </FormField>
          )}
          <CheckboxField label="Retaining Wall Required" checked={lotCondition.retaining_wall_required} onChange={v => setField('retaining_wall_required', v)} />
          {lotCondition.retaining_wall_required && (
            <FormField label="Estimated Linear Feet">
              <input type="number" value={lotCondition.retaining_wall_lf} onChange={e => setField('retaining_wall_lf', e.target.value)} className="input-field tabular-nums" />
            </FormField>
          )}
          <CheckboxField label="Erosion Control Plan Required" checked={lotCondition.erosion_control_required} onChange={v => setField('erosion_control_required', v)} />
        </div>
      </FormSection>

      {/* Utilities */}
      <FormSection title="Utilities">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Water">
            <select value={lotCondition.water} onChange={e => setField('water', e.target.value)} className="input-field">
              <option value="">Select...</option>
              <option>City Water Available at Lot</option>
              <option>City Water at Street — Extension Needed</option>
              <option>Well Required</option>
            </select>
          </FormField>
          <FormField label="Sewer">
            <select value={lotCondition.sewer} onChange={e => setField('sewer', e.target.value)} className="input-field">
              <option value="">Select...</option>
              <option>City Sewer Available at Lot</option>
              <option>City Sewer at Street — Extension Needed</option>
              <option>Septic Required</option>
            </select>
          </FormField>
          <FormField label="Electric">
            <select value={lotCondition.electric} onChange={e => setField('electric', e.target.value)} className="input-field">
              <option value="">Select...</option>
              <option>Available at Lot</option>
              <option>Service Drop Needed</option>
              <option>Transformer Required</option>
            </select>
          </FormField>
          <FormField label="Gas">
            <select value={lotCondition.gas} onChange={e => setField('gas', e.target.value)} className="input-field">
              <option value="">Select...</option>
              <option>Available</option>
              <option>Not Available</option>
              <option>Not Required</option>
            </select>
          </FormField>
          {(lotCondition.water?.includes('Extension') || lotCondition.sewer?.includes('Extension')) && (
            <>
              {lotCondition.water?.includes('Extension') && (
                <FormField label="Water Extension Distance (ft)">
                  <input type="number" value={lotCondition.water_distance} onChange={e => setField('water_distance', e.target.value)} className="input-field tabular-nums" />
                </FormField>
              )}
              {lotCondition.sewer?.includes('Extension') && (
                <FormField label="Sewer Extension Distance (ft)">
                  <input type="number" value={lotCondition.sewer_distance} onChange={e => setField('sewer_distance', e.target.value)} className="input-field tabular-nums" />
                </FormField>
              )}
            </>
          )}
        </div>
      </FormSection>

      {/* Environmental */}
      <FormSection title="Environmental">
        <div className="grid grid-cols-2 gap-4">
          <CheckboxField label="Wetlands Present" checked={lotCondition.wetlands_present} onChange={v => setField('wetlands_present', v)} />
          {lotCondition.wetlands_present && (
            <FormField label="% of Lot Affected">
              <input type="number" value={lotCondition.wetlands_pct} onChange={e => setField('wetlands_pct', e.target.value)} className="input-field tabular-nums" />
            </FormField>
          )}
          <FormField label="Flood Zone">
            <select value={lotCondition.flood_zone} onChange={e => setField('flood_zone', e.target.value)} className="input-field">
              <option>X - None</option>
              <option>A</option>
              <option>AE</option>
              <option>VE</option>
            </select>
          </FormField>
          <FormField label="Tree Removal">
            <select value={lotCondition.tree_removal} onChange={e => setField('tree_removal', e.target.value)} className="input-field">
              <option>None</option>
              <option>Minimal (1-5 trees)</option>
              <option>Moderate (6-15 trees)</option>
              <option>Heavy (15+ trees)</option>
            </select>
          </FormField>
          <CheckboxField label="Known Soil Issues" checked={lotCondition.soil_issues} onChange={v => setField('soil_issues', v)} />
          {lotCondition.soil_issues && (
            <FormField label="Soil Notes">
              <input type="text" value={lotCondition.soil_notes} onChange={e => setField('soil_notes', e.target.value)} className="input-field" placeholder="e.g., heavy clay, rock shelf at 3ft" />
            </FormField>
          )}
          <CheckboxField label="Tree Save Plan Required" checked={lotCondition.tree_save_required} onChange={v => setField('tree_save_required', v)} />
          <FormField label="Environmental Concerns" span2>
            <textarea value={lotCondition.environmental_notes} onChange={e => setField('environmental_notes', e.target.value)} rows={2} className="input-field" placeholder="Any additional environmental notes..." />
          </FormField>
        </div>
      </FormSection>

      {/* Existing Structures */}
      <FormSection title="Existing Structures">
        <div className="grid grid-cols-2 gap-4">
          <CheckboxField label="Existing Structures on Lot" checked={lotCondition.existing_structures} onChange={v => setField('existing_structures', v)} />
          {lotCondition.existing_structures && (
            <>
              <CheckboxField label="Demolition Required" checked={lotCondition.demo_required} onChange={v => setField('demo_required', v)} />
              {lotCondition.demo_required && (
                <>
                  <FormField label="Demo Description">
                    <input type="text" value={lotCondition.demo_description} onChange={e => setField('demo_description', e.target.value)} className="input-field" />
                  </FormField>
                  <FormField label="Estimated Demo Cost">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input type="number" value={lotCondition.demo_cost || ''} onChange={e => setField('demo_cost', parseFloat(e.target.value) || 0)} className="input-field pl-7 tabular-nums" />
                    </div>
                  </FormField>
                </>
              )}
            </>
          )}
        </div>
      </FormSection>

      {/* Site Cost Adjustment */}
      <FormSection title="Site Cost Adjustment">
        <div className="bg-gray-50 rounded-lg border p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Additional Site Cost (+/-)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={lotCondition.site_cost_adjustment || ''}
                  onChange={e => setField('site_cost_adjustment', parseFloat(e.target.value) || 0)}
                  className="input-field pl-7 tabular-nums"
                  placeholder="0"
                />
              </div>
            </FormField>
            <FormField label="Reason for Adjustment">
              <input type="text" value={lotCondition.site_cost_adjustment_reason} onChange={e => setField('site_cost_adjustment_reason', e.target.value)} className="input-field" placeholder="e.g., Extra fill dirt, tree removal" />
            </FormField>
          </div>
          {lotCondition.site_cost_adjustment !== 0 && (
            <div className="flex items-center gap-6 pt-2 border-t text-sm">
              <div><span className="text-gray-500">Original Lot Prep:</span> <span className="font-medium tabular-nums">{fmt(originalLotPrep)}</span></div>
              <span className="text-gray-300">&rarr;</span>
              <div><span className="text-gray-500">Adjusted:</span> <span className="font-medium tabular-nums text-emerald-700">{fmt(adjustedLotPrep)}</span></div>
              <span className="text-gray-300">&rarr;</span>
              <div><span className="text-gray-500">New Contract Total:</span> <span className="font-semibold tabular-nums text-emerald-700">{fmt(contractPrice)}</span></div>
            </div>
          )}
        </div>
      </FormSection>

      {/* Photos */}
      <FormSection title="Site Photos">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-1">Drag & drop photos or click to upload</p>
          <p className="text-xs text-gray-400">Photos will be included in Exhibit C of the contract</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setLotPhotos(prev => [...prev, ...files.map(f => ({ file: f, caption: '' }))]);
            }}
            className="mt-3"
          />
        </div>
        {lotPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            {lotPhotos.map((photo, idx) => (
              <div key={idx} className="border rounded-lg p-2 bg-white">
                <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-gray-300" />
                </div>
                <input
                  type="text"
                  value={photo.caption}
                  onChange={(e) => {
                    setLotPhotos(prev => prev.map((p, i) => i === idx ? { ...p, caption: e.target.value } : p));
                  }}
                  placeholder="Caption..."
                  className="w-full text-xs px-2 py-1 border rounded"
                />
                <button
                  onClick={() => setLotPhotos(prev => prev.filter((_, i) => i !== idx))}
                  className="text-xs text-red-500 mt-1 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </FormSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: REVIEW
// ═══════════════════════════════════════════════════════════════════════════════

function Step4Review({ houseData, contractTerms, drawAmounts, lotCondition, contractPrice, estimatedCompletion, groupedBudget }) {
  const [expandedExhibit, setExpandedExhibit] = useState({ A: true, B: false, C: false, D: false, E: false });
  const toggle = (key) => setExpandedExhibit(prev => ({ ...prev, [key]: !prev[key] }));

  const h = houseData?.house || {};
  const buyer = houseData?.buyer;
  const plan = houseData?.plan;
  const selections = houseData?.selections || {};
  const hasSelections = Object.keys(selections).length > 0;
  const hasBudgetItems = Object.keys(groupedBudget).length > 0;
  const hasLotCondition = !!lotCondition.access_road_type || !!lotCondition.lot_condition || !!lotCondition.water;

  const exhibits = [
    { key: 'A', label: 'Exhibit A — Contract Summary', complete: true },
    { key: 'B', label: 'Exhibit B — Budget Breakdown', complete: hasBudgetItems },
    { key: 'C', label: 'Exhibit C — Lot Condition Report', complete: hasLotCondition },
    { key: 'D', label: 'Exhibit D — Selections Sheet', complete: hasSelections },
    { key: 'E', label: 'Exhibit E — Floor Plan Drawing', complete: false },
  ];

  return (
    <div className="max-w-4xl space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800 flex items-start gap-2">
        <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>Review the complete contract package below. Each exhibit can be expanded to verify data. Proceed to Step 5 to generate the final documents.</div>
      </div>

      {exhibits.map(ex => (
        <div key={ex.key} className="bg-white border rounded-lg overflow-hidden">
          <button
            onClick={() => toggle(ex.key)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {ex.complete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-sm font-medium text-gray-900">{ex.label}</span>
              {!ex.complete && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Incomplete</span>}
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedExhibit[ex.key] ? 'rotate-90' : ''}`} />
          </button>

          {expandedExhibit[ex.key] && (
            <div className="border-t px-4 py-4">
              {ex.key === 'A' && (
                <div className="font-mono text-xs leading-relaxed text-gray-700 space-y-4">
                  <div className="text-center font-bold text-sm">RESIDENTIAL CONSTRUCTION AGREEMENT</div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="font-bold mb-1">BUILDER:</div>
                      <div>Red Cedar Homes LLC</div>
                      <div>Greenville, SC</div>
                    </div>
                    <div>
                      <div className="font-bold mb-1">OWNER:</div>
                      <div>{buyer?.full_name || h.buyer_name || '—'}</div>
                      <div>{buyer?.phone || '—'} | {buyer?.email || '—'}</div>
                      <div>{buyer?.address || '—'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold mb-1">PROPERTY:</div>
                    <div>{h.address}, {h.city}, {h.state} {h.zip_code}</div>
                    <div>County: {h.county || '—'} | Subdivision: {h.subdivision || '—'}</div>
                  </div>
                  <div>
                    <div className="font-bold mb-1">SCOPE OF WORK:</div>
                    <div>Floor Plan: {h.plan_name || plan?.plan_name} — Elevation {h.elevation || '—'}</div>
                    <div>SqFt: {plan?.square_footage || h.plan_sqft} | Beds: {plan?.bedrooms || h.bedrooms} | Baths: {plan?.bathrooms || h.bathrooms} | Garage: {plan?.garage_type || `${h.garage_spaces}-Car`}</div>
                    {h.upgrade_package && <div>Upgrade Package: {h.upgrade_package}</div>}
                  </div>
                  <div>
                    <div className="font-bold mb-1">CONTRACT PRICE: {fmt(contractPrice)}</div>
                    <div className="ml-4 space-y-0.5">
                      <div>Base Construction: {fmt(h.base_build_cost)}</div>
                      <div>Site Work: {fmt(h.lot_prep_cost)}</div>
                      <div>Soft Costs: {fmt(h.soft_costs)}</div>
                      <div>Upgrades: {fmt(h.upgrade_cost)}</div>
                      <div>Lot Premium: {fmt(h.lot_premium)}</div>
                      {lotCondition.site_cost_adjustment ? <div>Site Adjustment: {fmt(lotCondition.site_cost_adjustment)}</div> : null}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold mb-1">PAYMENT SCHEDULE:</div>
                    {drawAmounts.map(d => (
                      <div key={d.draw} className="ml-4">Draw {d.draw} — {d.milestone} ({d.pct}%): {fmtCents(d.amount)}</div>
                    ))}
                  </div>
                  <div>
                    <div className="font-bold mb-1">TIMELINE:</div>
                    <div className="ml-4">Contract Date: {contractTerms.contract_date}</div>
                    <div className="ml-4">Estimated Start: {contractTerms.estimated_start_date}</div>
                    <div className="ml-4">Estimated Completion: {estimatedCompletion}</div>
                    <div className="ml-4">Build Duration: {contractTerms.build_duration_days} calendar days</div>
                  </div>
                  <div>
                    <div className="font-bold mb-1">WARRANTY:</div>
                    <div className="ml-4">Builder's Warranty: {contractTerms.warranty_period_months} months</div>
                    {contractTerms.structural_warranty_years > 0 && <div className="ml-4">Structural: {contractTerms.structural_warranty_years} years</div>}
                  </div>
                </div>
              )}

              {ex.key === 'B' && (
                <div className="space-y-4">
                  {Object.entries(groupedBudget).map(([category, items]) => (
                    <div key={category}>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-1">{category}</h5>
                      <div className="space-y-0.5">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-gray-700 py-0.5">
                            <span>{item.item || item.name || item.description}</span>
                            <span className="tabular-nums font-medium">{fmt(item.amount || item.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between text-sm font-bold text-gray-900">
                    <span>CONTRACT TOTAL</span>
                    <span className="tabular-nums">{fmt(contractPrice)}</span>
                  </div>
                </div>
              )}

              {ex.key === 'C' && (
                <div className="text-sm text-gray-700 space-y-2">
                  {hasLotCondition ? (
                    <>
                      <ReviewRow label="Access Road" value={lotCondition.access_road_type} />
                      <ReviewRow label="Lot Condition" value={lotCondition.lot_condition} />
                      <ReviewRow label="Topography" value={lotCondition.topography} />
                      <ReviewRow label="Water" value={lotCondition.water} />
                      <ReviewRow label="Sewer" value={lotCondition.sewer} />
                      <ReviewRow label="Electric" value={lotCondition.electric} />
                      <ReviewRow label="Flood Zone" value={lotCondition.flood_zone} />
                      <ReviewRow label="Tree Removal" value={lotCondition.tree_removal} />
                      {lotCondition.soil_issues && <ReviewRow label="Soil Issues" value={lotCondition.soil_notes} />}
                      {lotCondition.site_cost_adjustment ? <ReviewRow label="Site Cost Adjustment" value={fmt(lotCondition.site_cost_adjustment)} /> : null}
                    </>
                  ) : (
                    <p className="text-gray-400 italic">No lot condition data entered. This exhibit will be blank in the contract.</p>
                  )}
                </div>
              )}

              {ex.key === 'D' && (
                <div className="text-sm text-gray-700 space-y-3">
                  {hasSelections ? (
                    Object.entries(selections).map(([section, items]) => (
                      <div key={section}>
                        <h5 className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-1">{section}</h5>
                        {Object.entries(items).map(([key, value]) => (
                          <ReviewRow key={key} label={key.replace(/_/g, ' ')} value={value} />
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No selections recorded on the house record.</p>
                  )}
                </div>
              )}

              {ex.key === 'E' && (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Floor plan drawing will be attached to the final document.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ReviewRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-gray-500 capitalize">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 5: GENERATE & SEND
// ═══════════════════════════════════════════════════════════════════════════════

function Step5Generate({ houseData, isGenerating, generatedContract, onGenerate, contractPrice }) {
  const statusSteps = [
    { label: 'Draft', complete: true },
    { label: 'Generated', complete: !!generatedContract },
    { label: 'Sent', complete: generatedContract?.status === 'sent' || generatedContract?.status === 'signed' },
    { label: 'Signed', complete: generatedContract?.status === 'signed' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {generatedContract && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-800">Contract Generated Successfully</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Contract #{generatedContract.contract_number || 'RCH-2026-001'} for {houseData?.house?.house_name} &middot; {fmt(contractPrice)}
            </p>
          </div>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid gap-4">
        <ActionCard
          icon={FileText}
          title="Generate PDF"
          description="Create the complete contract package as a multi-page PDF with all exhibits attached."
          buttonLabel={isGenerating ? 'Generating...' : generatedContract ? 'Regenerate PDF' : 'Generate PDF'}
          buttonColor="emerald"
          onClick={onGenerate}
          disabled={isGenerating}
          loading={isGenerating}
        />
        <ActionCard
          icon={FileDown}
          title="Download Word Doc"
          description="Generate an editable .docx for manual adjustments before sending."
          buttonLabel="Download DOCX"
          buttonColor="outline"
          onClick={() => {}}
          disabled={!generatedContract}
        />
        <ActionCard
          icon={Send}
          title="Send for E-Signature"
          description={`Send via DocuSeal to ${houseData?.buyer?.full_name || houseData?.house?.buyer_name || 'buyer'} for electronic signatures.`}
          buttonLabel="Send for E-Sign"
          buttonColor="blue"
          onClick={() => {}}
          disabled={!generatedContract}
        />
      </div>

      {/* Status Timeline */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">Contract Status</h4>
        <div className="flex items-center justify-between">
          {statusSteps.map((s, idx) => (
            <React.Fragment key={s.label}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s.complete ? 'bg-emerald-600' : 'bg-gray-200'
                }`}>
                  {s.complete ? <Check className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 text-gray-400" />}
                </div>
                <span className={`text-xs ${s.complete ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>{s.label}</span>
              </div>
              {idx < statusSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${s.complete ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, buttonLabel, buttonColor, onClick, disabled, loading }) {
  const btnClass = {
    emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300',
    blue: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400',
  }[buttonColor] || '';

  return (
    <div className="bg-white border rounded-lg p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 flex-shrink-0 ${btnClass}`}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {buttonLabel}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED FORM COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function FormSection({ title, children, collapsible }) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <div>
      <button
        onClick={() => collapsible && setOpen(!open)}
        className={`flex items-center gap-2 mb-3 ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
        {collapsible && <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />}
      </button>
      {open && children}
    </div>
  );
}

function FormField({ label, children, span2 }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
