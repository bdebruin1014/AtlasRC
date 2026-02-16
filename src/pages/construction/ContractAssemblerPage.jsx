import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Home, FileText, MapPin, Eye, Send, Check, ChevronRight, ChevronLeft,
  Search, AlertTriangle, Building2, Users, DollarSign, Ruler, FileDown,
  Upload, Trash2, Plus, ChevronDown, ChevronUp, Loader2, CheckCircle2,
  Clock, Circle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  assembleContractData,
  getEligibleHouses,
  saveContractDraft,
  getDraftContract,
  generateContract,
  calculateDrawSchedule,
  getDefaultTerms,
  updateContractStatus,
} from '@/services/contractAssemblerService';

// =====================================================
// HELPERS
// =====================================================
const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);
const fmtFull = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v || 0);
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r.toISOString().split('T')[0]; };
const today = () => new Date().toISOString().split('T')[0];

const STEPS = [
  { num: 1, label: 'Select House', icon: Home },
  { num: 2, label: 'Contract Terms', icon: FileText },
  { num: 3, label: 'Lot Condition', icon: MapPin },
  { num: 4, label: 'Review', icon: Eye },
  { num: 5, label: 'Generate', icon: Send },
];

const SectionHeader = ({ children }) => (
  <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wide mb-3 mt-6 first:mt-0">{children}</h3>
);

const FieldRow = ({ label, children, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <Label className="text-sm text-gray-700">{label}</Label>
    {children}
  </div>
);

// =====================================================
// MAIN COMPONENT
// =====================================================
const ContractAssemblerPage = () => {
  const { houseId: houseIdParam } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ---- state ----
  const [step, setStep] = useState(1);
  const [selectedHouseId, setSelectedHouseId] = useState(houseIdParam || null);
  const [houseData, setHouseData] = useState(null);
  const [eligibleHouses, setEligibleHouses] = useState([]);
  const [houseSearch, setHouseSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [contractTerms, setContractTerms] = useState({
    contract_date: today(),
    estimated_start: addDays(new Date(), 30),
    build_duration: 180,
    warranty_period: '1 year',
    structural_warranty: 'None',
    change_order_policy: 'Written approval required',
    dispute_resolution: 'Mediation then arbitration',
    jurisdiction: 'Greenville County, SC',
    builders_risk_insurance: 'Builder provides',
    permit_responsibility: 'Builder',
    allowance_lighting: 0,
    allowance_appliance: 0,
    allowance_landscaping: 0,
    allowance_flooring: 0,
    terms_and_conditions: '',
  });

  const [lotCondition, setLotCondition] = useState({
    access_road_type: 'paved',
    driveway_cut: false,
    temp_access: false,
    temp_access_notes: '',
    distance_from_road: 0,
    lot_condition: 'cleared',
    topography: 'level',
    fill_dirt: false,
    fill_dirt_yards: 0,
    cut: false,
    cut_yards: 0,
    retaining_wall: false,
    retaining_wall_lf: 0,
    erosion_control: false,
    water: 'available_at_lot',
    water_distance: 0,
    sewer: 'available_at_lot',
    sewer_distance: 0,
    electric: 'available_at_lot',
    electric_distance: 0,
    gas: 'available_at_lot',
    gas_distance: 0,
    wetlands: false,
    flood_zone: 'None',
    soil_issues: false,
    soil_issues_notes: '',
    tree_removal: false,
    tree_removal_count: 0,
    existing_structures: false,
    existing_structures_desc: '',
    demo_cost: 0,
    site_cost_adjustment: 0,
    site_cost_reason: '',
    photos: [],
  });

  const [drawSchedule, setDrawSchedule] = useState([
    { draw: 1, milestone: 'Pre-Construction / Deposit', pct: 10 },
    { draw: 2, milestone: 'Foundation Complete', pct: 20 },
    { draw: 3, milestone: 'Framing / Dried In', pct: 25 },
    { draw: 4, milestone: 'Drywall / Interior Trim', pct: 25 },
    { draw: 5, milestone: 'Final / Certificate of Occupancy', pct: 20 },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState(null);
  const [showAllowances, setShowAllowances] = useState(false);

  // ---- derived ----
  const totalContractPrice = useMemo(() => {
    if (!houseData) return 0;
    return (houseData.totalContractPrice || 0) + (lotCondition.site_cost_adjustment || 0);
  }, [houseData, lotCondition.site_cost_adjustment]);

  const drawTotal = useMemo(() => drawSchedule.reduce((s, d) => s + d.pct, 0), [drawSchedule]);

  const drawAmounts = useMemo(
    () => drawSchedule.map(d => ({ ...d, amount: Math.round((totalContractPrice * d.pct) / 100 * 100) / 100 })),
    [drawSchedule, totalContractPrice]
  );

  const estimatedCompletion = useMemo(() => {
    if (!contractTerms.estimated_start || !contractTerms.build_duration) return '';
    return addDays(new Date(contractTerms.estimated_start), Number(contractTerms.build_duration));
  }, [contractTerms.estimated_start, contractTerms.build_duration]);

  const hasBuyer = !!houseData?.buyer;
  const hasPlan = !!houseData?.plan;
  const canProceed = selectedHouseId && houseData && hasBuyer && hasPlan;

  // ---- budget categories ----
  const budgetByCategory = useMemo(() => {
    if (!houseData?.budgetItems) return {};
    return houseData.budgetItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [houseData]);

  // ---- load eligible houses ----
  useEffect(() => {
    (async () => {
      try {
        const houses = await getEligibleHouses();
        setEligibleHouses(houses || []);
      } catch (e) { console.error('Failed to load houses:', e); }
    })();
  }, []);

  // ---- auto-load if URL param ----
  useEffect(() => {
    if (houseIdParam && !houseData) handleSelectHouse(houseIdParam);
  }, [houseIdParam]);

  // ---- load default terms on mount ----
  useEffect(() => {
    (async () => {
      try {
        const defaults = await getDefaultTerms();
        setContractTerms(prev => ({
          ...prev,
          terms_and_conditions: defaults.terms_and_conditions || prev.terms_and_conditions,
        }));
      } catch (e) { /* ignore */ }
    })();
  }, []);

  // ---- handlers ----
  const handleSelectHouse = useCallback(async (id) => {
    setSelectedHouseId(id);
    setLoading(true);
    try {
      const data = await assembleContractData(id);
      setHouseData(data);
      // try to load existing draft
      const draft = await getDraftContract(id);
      if (draft) {
        if (draft.terms_and_conditions) setContractTerms(prev => ({ ...prev, terms_and_conditions: draft.terms_and_conditions }));
        if (draft.lot_condition_report && Object.keys(draft.lot_condition_report).length) setLotCondition(prev => ({ ...prev, ...draft.lot_condition_report }));
        if (draft.draw_schedule?.length) {
          setDrawSchedule(draft.draw_schedule.map(d => ({ draw: d.draw, milestone: d.milestone, pct: d.pct })));
        }
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load house data.', variant: 'destructive' });
    }
    setLoading(false);
  }, [toast]);

  const handleSaveDraft = useCallback(async () => {
    if (!selectedHouseId || !houseData) return;
    try {
      await saveContractDraft(selectedHouseId, {
        buyer_contact_id: houseData.buyer?.id,
        plan_id: houseData.plan?.id,
        upgrade_package_id: houseData.upgradePackage?.id,
        project_id: houseData.house?.project_id,
        base_price: houseData.basePrice,
        upgrade_total: houseData.upgradeTotal,
        lot_premium: houseData.lotPremium,
        total_contract_price: totalContractPrice,
        draw_schedule: drawAmounts,
        lot_condition_report: lotCondition,
        terms_and_conditions: contractTerms.terms_and_conditions,
        warranty_terms: contractTerms.warranty_period,
        special_provisions: contractTerms.jurisdiction,
        internal_notes: contractTerms.notes,
      });
      toast({ title: 'Draft Saved', description: 'Contract draft has been saved.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save draft.', variant: 'destructive' });
    }
  }, [selectedHouseId, houseData, totalContractPrice, drawAmounts, lotCondition, contractTerms, toast]);

  const handleGenerate = useCallback(async () => {
    if (!selectedHouseId || !houseData) return;
    setIsGenerating(true);
    try {
      const result = await generateContract(selectedHouseId, {
        draw_schedule: drawAmounts,
        lot_condition_report: lotCondition,
        terms_and_conditions: contractTerms.terms_and_conditions,
        warranty_terms: contractTerms.warranty_period,
        special_provisions: contractTerms.jurisdiction,
      });
      setGeneratedContract(result);
      toast({ title: 'Contract Generated', description: `Contract ${result.contract_number || ''} has been generated.` });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to generate contract.', variant: 'destructive' });
    }
    setIsGenerating(false);
  }, [selectedHouseId, houseData, drawAmounts, lotCondition, contractTerms, toast]);

  const updateDraw = (idx, field, value) => {
    setDrawSchedule(prev => prev.map((d, i) => i === idx ? { ...d, [field]: field === 'pct' ? Number(value) || 0 : value } : d));
  };

  const updateTerms = (field, value) => setContractTerms(prev => ({ ...prev, [field]: value }));
  const updateLot = (field, value) => setLotCondition(prev => ({ ...prev, [field]: value }));

  const filteredHouses = useMemo(() => {
    if (!houseSearch) return eligibleHouses;
    const q = houseSearch.toLowerCase();
    return eligibleHouses.filter(h =>
      (h.lot_label || h.lot_number || '').toLowerCase().includes(q) ||
      (h.subdivision || '').toLowerCase().includes(q) ||
      (h.plan_id || '').toLowerCase().includes(q)
    );
  }, [eligibleHouses, houseSearch]);

  // ---- step validation ----
  const canNext = useMemo(() => {
    if (step === 1) return canProceed;
    if (step === 2) return drawTotal === 100;
    if (step === 3) return true;
    if (step === 4) return true;
    return false;
  }, [step, canProceed, drawTotal]);

  // ==========================================================
  // STEP 1 — SELECT HOUSE
  // ==========================================================
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <SectionHeader>Select a House</SectionHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by lot, plan, or subdivision..."
            value={houseSearch}
            onChange={e => setHouseSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {filteredHouses.length > 0 && !houseData && (
          <div className="mt-2 border rounded-lg divide-y max-h-56 overflow-y-auto">
            {filteredHouses.map(h => (
              <button
                key={h.id}
                onClick={() => handleSelectHouse(h.id)}
                className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex justify-between items-center text-sm"
              >
                <span className="font-medium text-gray-900">{h.lot_label || `Lot ${h.lot_number}`}</span>
                <span className="text-gray-500 text-xs">{h.subdivision || ''}</span>
              </button>
            ))}
          </div>
        )}
        {filteredHouses.length === 0 && !houseData && (
          <p className="text-sm text-gray-500 mt-3">No eligible houses found. Houses must be at the "Pre-Contract" milestone with no active contract.</p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" /> Loading house data...
        </div>
      )}

      {houseData && !loading && (
        <>
          {!hasBuyer && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              No buyer assigned. Complete the house record before generating a contract.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property Card */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-sm text-gray-900">Property</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Lot</span><span className="font-medium">{houseData.house?.lot_label || `Lot ${houseData.house?.lot_number}`}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Subdivision</span><span className="font-medium">{houseData.house?.subdivision || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-medium">{houseData.house?.street_address || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Lot Size</span><span className="font-medium">{houseData.house?.lot_size_sqft ? `${houseData.house.lot_size_sqft.toLocaleString()} sf` : '—'}</span></div>
              </div>
            </div>

            {/* Plan Card */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-sm text-gray-900">Floor Plan</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="font-medium">{houseData.plan?.name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Size</span><span className="font-medium">{houseData.plan?.sqft ? `${houseData.plan.sqft.toLocaleString()} sf` : '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Beds / Baths</span><span className="font-medium">{houseData.plan?.bedrooms || '—'} / {houseData.plan?.bathrooms || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Base Price</span><span className="font-medium tabular-nums">{fmt(houseData.plan?.base_price)}</span></div>
              </div>
            </div>

            {/* Buyer Card */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-sm text-gray-900">Buyer</span>
              </div>
              {hasBuyer ? (
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{houseData.buyer.display_name || `${houseData.buyer.first_name} ${houseData.buyer.last_name}`}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{houseData.buyer.email || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{houseData.buyer.phone || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-medium truncate max-w-[180px]">{houseData.buyer.mailing_address || '—'}</span></div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No buyer assigned</p>
              )}
            </div>

            {/* Budget Card */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-sm text-gray-900">Budget Summary</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Base Build</span><span className="font-medium tabular-nums">{fmt(houseData.budgetTotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Upgrades</span><span className="font-medium tabular-nums">{fmt(houseData.upgradeTotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Lot Premium</span><span className="font-medium tabular-nums">{fmt(houseData.lotPremium)}</span></div>
                <div className="border-t pt-1.5 mt-1.5 flex justify-between">
                  <span className="font-semibold text-emerald-700">TOTAL</span>
                  <span className="font-bold text-emerald-700 tabular-nums">{fmt(houseData.totalContractPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {houseData && (
            <button onClick={() => { setHouseData(null); setSelectedHouseId(null); setHouseSearch(''); }} className="text-sm text-gray-500 hover:text-gray-700 underline">
              Select a different house
            </button>
          )}
        </>
      )}
    </div>
  );

  // ==========================================================
  // STEP 2 — CONTRACT TERMS
  // ==========================================================
  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Contract Basics */}
      <SectionHeader>Contract Basics</SectionHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldRow label="Contract Date">
          <Input type="date" value={contractTerms.contract_date} onChange={e => updateTerms('contract_date', e.target.value)} />
        </FieldRow>
        <FieldRow label="Estimated Start Date">
          <Input type="date" value={contractTerms.estimated_start} onChange={e => updateTerms('estimated_start', e.target.value)} />
        </FieldRow>
        <FieldRow label="Build Duration (days)">
          <Input type="number" value={contractTerms.build_duration} onChange={e => updateTerms('build_duration', Number(e.target.value))} />
        </FieldRow>
        <FieldRow label="Estimated Completion">
          <Input value={estimatedCompletion} readOnly className="bg-gray-50" />
        </FieldRow>
        <FieldRow label="Contract Price" className="md:col-span-2">
          <Input value={fmtFull(totalContractPrice)} readOnly className="bg-gray-50 font-semibold tabular-nums text-emerald-700" />
        </FieldRow>
      </div>

      {/* Draw Schedule */}
      <SectionHeader>Payment Schedule — 5 Draws</SectionHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3 font-medium text-gray-500 w-16">Draw</th>
              <th className="py-2 pr-3 font-medium text-gray-500">Milestone</th>
              <th className="py-2 pr-3 font-medium text-gray-500 w-24 text-right">%</th>
              <th className="py-2 font-medium text-gray-500 w-32 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {drawSchedule.map((d, i) => (
              <tr key={d.draw}>
                <td className="py-2 pr-3 font-medium text-gray-700">{d.draw}</td>
                <td className="py-2 pr-3">
                  <Input value={d.milestone} onChange={e => updateDraw(i, 'milestone', e.target.value)} className="h-8 text-sm" />
                </td>
                <td className="py-2 pr-3">
                  <Input type="number" value={d.pct} onChange={e => updateDraw(i, 'pct', e.target.value)} className="h-8 text-sm text-right w-20 ml-auto" min={0} max={100} />
                </td>
                <td className="py-2 text-right font-medium tabular-nums text-gray-700">{fmtFull(drawAmounts[i]?.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 font-semibold">
              <td className="py-2 pr-3" />
              <td className="py-2 pr-3 text-gray-700">Total</td>
              <td className={`py-2 pr-3 text-right tabular-nums ${drawTotal !== 100 ? 'text-red-600' : 'text-gray-700'}`}>
                {drawTotal}%
                {drawTotal !== 100 && <span className="block text-xs font-normal text-red-500">Must equal 100%</span>}
              </td>
              <td className="py-2 text-right tabular-nums text-emerald-700">{fmtFull(totalContractPrice)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Warranty */}
      <SectionHeader>Warranty</SectionHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldRow label="Builder's Warranty Period">
          <Select value={contractTerms.warranty_period} onValueChange={v => updateTerms('warranty_period', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="6 months">6 months</SelectItem>
              <SelectItem value="1 year">1 year</SelectItem>
              <SelectItem value="2 years">2 years</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Structural Warranty">
          <Select value={contractTerms.structural_warranty} onValueChange={v => updateTerms('structural_warranty', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="5 years">5 years</SelectItem>
              <SelectItem value="10 years">10 years</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
      </div>

      {/* Allowances (collapsible) */}
      <button onClick={() => setShowAllowances(!showAllowances)} className="flex items-center gap-2 text-sm font-semibold uppercase text-gray-500 tracking-wide mt-6 hover:text-gray-700">
        {showAllowances ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        Allowances (Optional)
      </button>
      {showAllowances && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          {['lighting', 'appliance', 'landscaping', 'flooring'].map(a => (
            <FieldRow key={a} label={a.charAt(0).toUpperCase() + a.slice(1)}>
              <Input type="number" value={contractTerms[`allowance_${a}`]} onChange={e => updateTerms(`allowance_${a}`, Number(e.target.value) || 0)} min={0} className="tabular-nums" placeholder="$0" />
            </FieldRow>
          ))}
        </div>
      )}

      {/* Terms & Conditions */}
      <SectionHeader>Terms &amp; Conditions</SectionHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldRow label="Change Order Policy">
          <Select value={contractTerms.change_order_policy} onValueChange={v => updateTerms('change_order_policy', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Written approval required">Written approval required</SelectItem>
              <SelectItem value="Verbal with follow-up">Verbal with follow-up</SelectItem>
              <SelectItem value="No changes after framing">No changes after framing</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Dispute Resolution">
          <Select value={contractTerms.dispute_resolution} onValueChange={v => updateTerms('dispute_resolution', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Mediation then arbitration">Mediation then arbitration</SelectItem>
              <SelectItem value="Binding arbitration">Binding arbitration</SelectItem>
              <SelectItem value="Litigation">Litigation</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Jurisdiction">
          <Input value={contractTerms.jurisdiction} onChange={e => updateTerms('jurisdiction', e.target.value)} />
        </FieldRow>
        <FieldRow label="Builder's Risk Insurance">
          <Select value={contractTerms.builders_risk_insurance} onValueChange={v => updateTerms('builders_risk_insurance', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Builder provides">Builder provides</SelectItem>
              <SelectItem value="Buyer provides">Buyer provides</SelectItem>
              <SelectItem value="Shared responsibility">Shared responsibility</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Permit Responsibility">
          <Select value={contractTerms.permit_responsibility} onValueChange={v => updateTerms('permit_responsibility', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Builder">Builder</SelectItem>
              <SelectItem value="Buyer">Buyer</SelectItem>
              <SelectItem value="Shared">Shared</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
      </div>
    </div>
  );

  // ==========================================================
  // STEP 3 — LOT CONDITION
  // ==========================================================
  const renderStep3 = () => {
    const originalLotPrep = houseData?.budgetItems?.filter(i => i.category === 'Site Work').reduce((s, i) => s + (i.amount || 0), 0) || 0;
    const adjustedLotPrep = originalLotPrep + (lotCondition.site_cost_adjustment || 0);
    const newTotal = totalContractPrice;

    return (
      <div className="space-y-6">
        {/* Site Access */}
        <SectionHeader>Site Access</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldRow label="Access Road Type">
            <Select value={lotCondition.access_road_type} onValueChange={v => updateLot('access_road_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paved">Paved</SelectItem>
                <SelectItem value="gravel">Gravel</SelectItem>
                <SelectItem value="dirt">Dirt</SelectItem>
                <SelectItem value="none">No Road Access</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Distance from Road (ft)">
            <Input type="number" value={lotCondition.distance_from_road} onChange={e => updateLot('distance_from_road', Number(e.target.value) || 0)} min={0} />
          </FieldRow>
          <div className="flex items-center gap-3">
            <Checkbox checked={lotCondition.driveway_cut} onCheckedChange={v => updateLot('driveway_cut', v)} id="driveway_cut" />
            <Label htmlFor="driveway_cut">Driveway Cut Required</Label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Checkbox checked={lotCondition.temp_access} onCheckedChange={v => updateLot('temp_access', v)} id="temp_access" />
              <Label htmlFor="temp_access">Temporary Access Needed</Label>
            </div>
            {lotCondition.temp_access && (
              <Input placeholder="Temp access notes..." value={lotCondition.temp_access_notes} onChange={e => updateLot('temp_access_notes', e.target.value)} className="ml-7" />
            )}
          </div>
        </div>

        {/* Topography & Grading */}
        <SectionHeader>Topography &amp; Grading</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldRow label="Lot Condition">
            <Select value={lotCondition.lot_condition} onValueChange={v => updateLot('lot_condition', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cleared">Cleared</SelectItem>
                <SelectItem value="wooded">Wooded</SelectItem>
                <SelectItem value="partially_cleared">Partially Cleared</SelectItem>
                <SelectItem value="rough_graded">Rough Graded</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Topography">
            <Select value={lotCondition.topography} onValueChange={v => updateLot('topography', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="level">Level</SelectItem>
                <SelectItem value="gentle_slope">Gentle Slope</SelectItem>
                <SelectItem value="moderate_slope">Moderate Slope</SelectItem>
                <SelectItem value="steep">Steep</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Checkbox checked={lotCondition.fill_dirt} onCheckedChange={v => updateLot('fill_dirt', v)} id="fill_dirt" />
              <Label htmlFor="fill_dirt">Fill Dirt Required</Label>
            </div>
            {lotCondition.fill_dirt && (
              <FieldRow label="Cubic Yards"><Input type="number" value={lotCondition.fill_dirt_yards} onChange={e => updateLot('fill_dirt_yards', Number(e.target.value) || 0)} min={0} /></FieldRow>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Checkbox checked={lotCondition.cut} onCheckedChange={v => updateLot('cut', v)} id="cut" />
              <Label htmlFor="cut">Cut Required</Label>
            </div>
            {lotCondition.cut && (
              <FieldRow label="Cubic Yards"><Input type="number" value={lotCondition.cut_yards} onChange={e => updateLot('cut_yards', Number(e.target.value) || 0)} min={0} /></FieldRow>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Checkbox checked={lotCondition.retaining_wall} onCheckedChange={v => updateLot('retaining_wall', v)} id="retaining_wall" />
              <Label htmlFor="retaining_wall">Retaining Wall</Label>
            </div>
            {lotCondition.retaining_wall && (
              <FieldRow label="Linear Feet"><Input type="number" value={lotCondition.retaining_wall_lf} onChange={e => updateLot('retaining_wall_lf', Number(e.target.value) || 0)} min={0} /></FieldRow>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Checkbox checked={lotCondition.erosion_control} onCheckedChange={v => updateLot('erosion_control', v)} id="erosion_control" />
            <Label htmlFor="erosion_control">Erosion Control Required</Label>
          </div>
        </div>

        {/* Utilities */}
        <SectionHeader>Utilities</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['water', 'sewer', 'electric', 'gas'].map(u => (
            <div key={u} className="space-y-2">
              <FieldRow label={u.charAt(0).toUpperCase() + u.slice(1)}>
                <Select value={lotCondition[u]} onValueChange={v => updateLot(u, v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available_at_lot">Available at Lot</SelectItem>
                    <SelectItem value="available_nearby">Available Nearby</SelectItem>
                    <SelectItem value="requires_extension">Requires Extension</SelectItem>
                    <SelectItem value="not_available">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
              {lotCondition[u] !== 'available_at_lot' && lotCondition[u] !== 'not_available' && (
                <FieldRow label="Distance (ft)">
                  <Input type="number" value={lotCondition[`${u}_distance`]} onChange={e => updateLot(`${u}_distance`, Number(e.target.value) || 0)} min={0} />
                </FieldRow>
              )}
            </div>
          ))}
        </div>

        {/* Environmental */}
        <SectionHeader>Environmental</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Checkbox checked={lotCondition.wetlands} onCheckedChange={v => updateLot('wetlands', v)} id="wetlands" />
            <Label htmlFor="wetlands">Wetlands Present</Label>
          </div>
          <FieldRow label="Flood Zone">
            <Select value={lotCondition.flood_zone} onValueChange={v => updateLot('flood_zone', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None (Zone X)</SelectItem>
                <SelectItem value="Zone A">Zone A</SelectItem>
                <SelectItem value="Zone AE">Zone AE</SelectItem>
                <SelectItem value="Zone VE">Zone VE</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Checkbox checked={lotCondition.soil_issues} onCheckedChange={v => updateLot('soil_issues', v)} id="soil_issues" />
              <Label htmlFor="soil_issues">Known Soil Issues</Label>
            </div>
            {lotCondition.soil_issues && (
              <Input placeholder="Describe soil issues..." value={lotCondition.soil_issues_notes} onChange={e => updateLot('soil_issues_notes', e.target.value)} />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Checkbox checked={lotCondition.tree_removal} onCheckedChange={v => updateLot('tree_removal', v)} id="tree_removal" />
              <Label htmlFor="tree_removal">Tree Removal Required</Label>
            </div>
            {lotCondition.tree_removal && (
              <FieldRow label="Number of Trees"><Input type="number" value={lotCondition.tree_removal_count} onChange={e => updateLot('tree_removal_count', Number(e.target.value) || 0)} min={0} /></FieldRow>
            )}
          </div>
        </div>

        {/* Existing Structures */}
        <SectionHeader>Existing Structures</SectionHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Switch checked={lotCondition.existing_structures} onCheckedChange={v => updateLot('existing_structures', v)} id="existing_structures" />
            <Label htmlFor="existing_structures">Existing structures on lot</Label>
          </div>
          {lotCondition.existing_structures && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-1">
              <FieldRow label="Description">
                <Textarea value={lotCondition.existing_structures_desc} onChange={e => updateLot('existing_structures_desc', e.target.value)} rows={2} />
              </FieldRow>
              <FieldRow label="Estimated Demo Cost">
                <Input type="number" value={lotCondition.demo_cost} onChange={e => updateLot('demo_cost', Number(e.target.value) || 0)} min={0} className="tabular-nums" />
              </FieldRow>
            </div>
          )}
        </div>

        {/* Site Cost Adjustment */}
        <SectionHeader>Site Cost Adjustment</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldRow label="Adjustment Amount ($)">
            <Input type="number" value={lotCondition.site_cost_adjustment} onChange={e => updateLot('site_cost_adjustment', Number(e.target.value) || 0)} className="tabular-nums" />
          </FieldRow>
          <FieldRow label="Reason">
            <Input value={lotCondition.site_cost_reason} onChange={e => updateLot('site_cost_reason', e.target.value)} placeholder="Reason for adjustment..." />
          </FieldRow>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">Original Lot Prep</span><span className="tabular-nums">{fmt(originalLotPrep)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Adjusted</span><span className="tabular-nums">{fmt(adjustedLotPrep)}</span></div>
          <div className="flex justify-between font-semibold border-t pt-1"><span className="text-emerald-700">New Contract Total</span><span className="text-emerald-700 tabular-nums">{fmt(newTotal)}</span></div>
        </div>

        {/* Photos */}
        <SectionHeader>Site Photos</SectionHeader>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-2">Drop photos here or click to browse</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => {
              const files = Array.from(e.target.files || []);
              const newPhotos = files.map(f => ({ file: f, caption: '', preview: URL.createObjectURL(f) }));
              updateLot('photos', [...(lotCondition.photos || []), ...newPhotos]);
            }}
            className="text-sm"
          />
        </div>
        {lotCondition.photos?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {lotCondition.photos.map((p, i) => (
              <div key={i} className="relative border rounded-lg overflow-hidden">
                <img src={p.preview} alt="" className="w-full h-24 object-cover" />
                <Input
                  placeholder="Caption..."
                  value={p.caption}
                  onChange={e => {
                    const updated = [...lotCondition.photos];
                    updated[i] = { ...updated[i], caption: e.target.value };
                    updateLot('photos', updated);
                  }}
                  className="text-xs h-7 border-0 border-t rounded-none"
                />
                <button
                  onClick={() => updateLot('photos', lotCondition.photos.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 text-white hover:bg-black/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ==========================================================
  // STEP 4 — REVIEW
  // ==========================================================
  const ExhibitSection = ({ title, status, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div className="border rounded-lg bg-white">
        <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left">
          <div className="flex items-center gap-2">
            {status === 'complete' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
            <span className="font-semibold text-sm text-gray-900">{title}</span>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {open && <div className="px-4 pb-4 border-t">{children}</div>}
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-4">
      <SectionHeader>Contract Preview</SectionHeader>

      {/* Exhibit A — Contract Summary */}
      <ExhibitSection title="Exhibit A — Contract Summary" status="complete" defaultOpen>
        <div className="space-y-4 pt-3 text-sm">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div><span className="text-gray-500">Builder:</span> <span className="font-medium">Red Cedar Homes</span></div>
            <div><span className="text-gray-500">Buyer:</span> <span className="font-medium">{houseData?.buyer?.display_name || '—'}</span></div>
            <div><span className="text-gray-500">Property:</span> <span className="font-medium">{houseData?.house?.lot_label || '—'}</span></div>
            <div><span className="text-gray-500">Plan:</span> <span className="font-medium">{houseData?.plan?.name || '—'} ({houseData?.plan?.sqft?.toLocaleString() || '—'} sf)</span></div>
            <div><span className="text-gray-500">Contract Date:</span> <span className="font-medium">{contractTerms.contract_date}</span></div>
            <div><span className="text-gray-500">Est. Start:</span> <span className="font-medium">{contractTerms.estimated_start}</span></div>
            <div><span className="text-gray-500">Duration:</span> <span className="font-medium">{contractTerms.build_duration} days</span></div>
            <div><span className="text-gray-500">Est. Completion:</span> <span className="font-medium">{estimatedCompletion}</span></div>
          </div>
          <div className="border-t pt-3">
            <p className="font-semibold text-gray-700 mb-2">Payment Schedule</p>
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 border-b"><th className="text-left py-1">Draw</th><th className="text-left py-1">Milestone</th><th className="text-right py-1">%</th><th className="text-right py-1">Amount</th></tr></thead>
              <tbody>
                {drawAmounts.map(d => (
                  <tr key={d.draw} className="border-b last:border-0">
                    <td className="py-1">{d.draw}</td>
                    <td className="py-1">{d.milestone}</td>
                    <td className="py-1 text-right tabular-nums">{d.pct}%</td>
                    <td className="py-1 text-right tabular-nums font-mono">{fmtFull(d.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="font-semibold border-t-2"><td /><td>Total</td><td className="text-right">{drawTotal}%</td><td className="text-right tabular-nums font-mono text-emerald-700">{fmtFull(totalContractPrice)}</td></tr></tfoot>
            </table>
          </div>
          <div className="border-t pt-3 grid grid-cols-2 gap-x-8 gap-y-1">
            <div><span className="text-gray-500">Warranty:</span> <span className="font-medium">{contractTerms.warranty_period}</span></div>
            <div><span className="text-gray-500">Structural:</span> <span className="font-medium">{contractTerms.structural_warranty}</span></div>
            <div><span className="text-gray-500">Jurisdiction:</span> <span className="font-medium">{contractTerms.jurisdiction}</span></div>
            <div><span className="text-gray-500">Dispute Resolution:</span> <span className="font-medium">{contractTerms.dispute_resolution}</span></div>
          </div>
        </div>
      </ExhibitSection>

      {/* Exhibit B — Budget */}
      <ExhibitSection title="Exhibit B — Budget Breakdown" status={houseData?.budgetItems?.length ? 'complete' : 'incomplete'}>
        <div className="pt-3 text-sm">
          {Object.entries(budgetByCategory).map(([cat, items]) => (
            <div key={cat} className="mb-3">
              <p className="font-semibold text-gray-700 mb-1">{cat}</p>
              {items.map(item => (
                <div key={item.id} className="flex justify-between py-0.5 pl-4">
                  <span className="text-gray-600">{item.description}</span>
                  <span className="tabular-nums font-mono">{fmt(item.amount)}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total Budget</span>
            <span className="tabular-nums font-mono text-emerald-700">{fmt(houseData?.budgetTotal)}</span>
          </div>
        </div>
      </ExhibitSection>

      {/* Exhibit C — Lot Condition */}
      <ExhibitSection title="Exhibit C — Lot Condition Report" status="complete">
        <div className="pt-3 text-sm grid grid-cols-2 gap-x-8 gap-y-1">
          <div><span className="text-gray-500">Access Road:</span> <span className="font-medium capitalize">{lotCondition.access_road_type?.replace('_', ' ')}</span></div>
          <div><span className="text-gray-500">Topography:</span> <span className="font-medium capitalize">{lotCondition.topography?.replace('_', ' ')}</span></div>
          <div><span className="text-gray-500">Lot Condition:</span> <span className="font-medium capitalize">{lotCondition.lot_condition?.replace('_', ' ')}</span></div>
          <div><span className="text-gray-500">Flood Zone:</span> <span className="font-medium">{lotCondition.flood_zone}</span></div>
          {lotCondition.fill_dirt && <div><span className="text-gray-500">Fill Dirt:</span> <span className="font-medium">{lotCondition.fill_dirt_yards} cy</span></div>}
          {lotCondition.retaining_wall && <div><span className="text-gray-500">Retaining Wall:</span> <span className="font-medium">{lotCondition.retaining_wall_lf} lf</span></div>}
          {lotCondition.tree_removal && <div><span className="text-gray-500">Tree Removal:</span> <span className="font-medium">{lotCondition.tree_removal_count} trees</span></div>}
          {lotCondition.site_cost_adjustment !== 0 && (
            <div className="col-span-2"><span className="text-gray-500">Site Cost Adjustment:</span> <span className="font-medium text-emerald-700">{fmt(lotCondition.site_cost_adjustment)}</span> — {lotCondition.site_cost_reason || 'No reason specified'}</div>
          )}
        </div>
      </ExhibitSection>

      {/* Exhibit D — Selections */}
      <ExhibitSection title="Exhibit D — Selections Sheet" status={houseData?.upgradePackage ? 'complete' : 'incomplete'}>
        <div className="pt-3 text-sm">
          {houseData?.upgradePackage?.items?.length ? (
            <>
              <p className="font-semibold text-gray-700 mb-2">{houseData.upgradePackage.name}</p>
              {houseData.upgradePackage.items.map((item, i) => (
                <div key={i} className="flex justify-between py-0.5 pl-4">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="tabular-nums font-mono">{fmt(item.price)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold mt-2">
                <span>Upgrade Total</span>
                <span className="tabular-nums font-mono text-emerald-700">{fmt(houseData.upgradeTotal)}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-400 italic">No upgrade package assigned</p>
          )}
        </div>
      </ExhibitSection>

      {/* Exhibit E — Floor Plan */}
      <ExhibitSection title="Exhibit E — Floor Plan" status={houseData?.plan ? 'complete' : 'incomplete'}>
        <div className="pt-3 text-sm text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">{houseData?.plan?.name || 'No plan'} — {houseData?.plan?.sqft?.toLocaleString() || '—'} sf</p>
          <p className="text-gray-400 text-xs mt-1">Floor plan PDF will be attached to the generated contract</p>
        </div>
      </ExhibitSection>
    </div>
  );

  // ==========================================================
  // STEP 5 — GENERATE & SEND
  // ==========================================================
  const renderStep5 = () => {
    const statusSteps = [
      { key: 'draft', label: 'Draft' },
      { key: 'generated', label: 'Generated' },
      { key: 'sent', label: 'Sent' },
      { key: 'signed', label: 'Signed' },
    ];
    const currentStatus = generatedContract?.status || 'draft';
    const statusIdx = statusSteps.findIndex(s => s.key === currentStatus);

    return (
      <div className="space-y-6">
        <SectionHeader>Generate &amp; Send</SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Generate PDF */}
          <div className="bg-white border rounded-lg p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Generate PDF</h4>
            <p className="text-xs text-gray-500">Create the complete contract package as a PDF</p>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</> : 'Generate PDF'}
            </Button>
            {generatedContract && (
              <p className="text-xs text-emerald-600 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Generated: {generatedContract.contract_number}
              </p>
            )}
          </div>

          {/* Download DOCX */}
          <div className="bg-white border rounded-lg p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <FileDown className="w-6 h-6 text-gray-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Download Word Doc</h4>
            <p className="text-xs text-gray-500">Generate an editable .docx for manual adjustments</p>
            <Button variant="outline" className="w-full" disabled={!generatedContract}>
              Download DOCX
            </Button>
          </div>

          {/* Send for Signature */}
          <div className="bg-white border rounded-lg p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Send for Signature</h4>
            <p className="text-xs text-gray-500">Send via DocuSeal for electronic signatures</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={!generatedContract}>
              Send for E-Sign
            </Button>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">Contract Status</p>
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {statusSteps.map((s, i) => {
              const isComplete = i <= statusIdx;
              const isCurrent = i === statusIdx;
              return (
                <React.Fragment key={s.key}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isComplete ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 text-gray-400'
                    } ${isCurrent ? 'ring-2 ring-emerald-200' : ''}`}>
                      {isComplete ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                    </div>
                    <span className={`text-xs ${isComplete ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>{s.label}</span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${i < statusIdx ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  const renderStepContent = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      {/* ---- LEFT STEP INDICATOR ---- */}
      <div className="w-[200px] flex-shrink-0 bg-[#1a1f2e] text-white flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-bold tracking-wide">Contract Assembler</h2>
          <p className="text-[10px] text-gray-400 mt-0.5">Red Cedar Homes</p>
        </div>
        <nav className="flex-1 py-3">
          {STEPS.map(s => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isComplete = step > s.num;
            return (
              <button
                key={s.num}
                onClick={() => { if (s.num <= step || (s.num === step + 1 && canNext)) setStep(s.num); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs transition-colors ${
                  isActive ? 'bg-emerald-600/20 text-emerald-400 border-r-2 border-emerald-400' : isComplete ? 'text-gray-300 hover:text-white' : 'text-gray-500'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isComplete ? 'bg-emerald-600 text-white' : isActive ? 'border border-emerald-400 text-emerald-400' : 'border border-gray-600 text-gray-600'
                }`}>
                  {isComplete ? <Check className="w-3 h-3" /> : <span className="text-[10px]">{s.num}</span>}
                </div>
                <span className="font-medium">{s.label}</span>
              </button>
            );
          })}
        </nav>
        {houseData && (
          <div className="p-4 border-t border-white/10 text-xs space-y-1">
            <p className="text-gray-400">Selected:</p>
            <p className="font-medium text-white truncate">{houseData.house?.lot_label || `Lot ${houseData.house?.lot_number}`}</p>
            <p className="text-emerald-400 font-semibold tabular-nums">{fmt(totalContractPrice)}</p>
          </div>
        )}
      </div>

      {/* ---- MAIN CONTENT ---- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h1 className="text-lg font-bold text-gray-900 mb-1">{STEPS[step - 1].label}</h1>
              <p className="text-sm text-gray-500 mb-6">
                {step === 1 && 'Choose a house to build a contract package for.'}
                {step === 2 && 'Set contract dates, payment schedule, warranty, and terms.'}
                {step === 3 && 'Document lot conditions and any site cost adjustments.'}
                {step === 4 && 'Review the full contract package before generating.'}
                {step === 5 && 'Generate the contract PDF and send for signatures.'}
              </p>
              {renderStepContent()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-white px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-gray-600">
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step > 1 && step < 5 && (
              <Button variant="outline" onClick={handleSaveDraft} className="text-gray-600">
                Save Draft
              </Button>
            )}
            {step < 5 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Next Step <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/construction/contract-assembler')} className="text-gray-600">
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractAssemblerPage;
