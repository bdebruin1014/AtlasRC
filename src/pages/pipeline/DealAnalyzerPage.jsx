// pages/pipeline/DealAnalyzerPage.jsx
// Sources & Uses Pro Forma Calculator

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const PLANS = {
  cherry:   { name: 'Cherry',    sqft: 1350, baseCost: 180000 },
  magnolia: { name: 'Magnolia',  sqft: 1800, baseCost: 215000 },
  atlas:    { name: 'Atlas',     sqft: 2500, baseCost: 285000 },
  dogwood:  { name: 'Dogwood',   sqft: 1800, baseCost: 198000 },
  palmetto: { name: 'Palmetto',  sqft: 2100, baseCost: 220000 },
  juniper:  { name: 'Juniper',   sqft: 2200, baseCost: 225000 },
};

const UPGRADE_PACKAGES = {
  standard: { label: 'Standard',  cost: 0 },
  classic:  { label: 'Classic',   cost: 12000 },
  elegance: { label: 'Elegance',  cost: 24000 },
};

const MUNICIPALITIES = [
  'City of Greenville', 'Greenville County', 'City of Greer',
  'City of Simpsonville', 'City of Mauldin', 'City of Travelers Rest',
  'Spartanburg County', 'Anderson County', 'Other',
];

const fmt = (v) => v == null || isNaN(v) ? '$0' : `$${Math.round(v).toLocaleString()}`;
const fmtPct = (v) => `${(v || 0).toFixed(1)}%`;

// --- Reusable components ---
const Field = ({ label, children }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
    {children}
  </div>
);

const NumInput = ({ value, onChange, prefix, suffix, placeholder }) => (
  <div className="relative">
    {prefix && <span className="absolute left-3 top-2 text-gray-500 text-sm">{prefix}</span>}
    <input
      type="number"
      step="any"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''}`}
    />
    {suffix && <span className="absolute right-3 top-2 text-gray-500 text-sm">{suffix}</span>}
  </div>
);

const Sel = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Row = ({ label, value, bold, accent, border }) => (
  <div className={`flex justify-between py-1.5 ${border ? 'border-t border-gray-600 mt-1 pt-2' : ''}`}>
    <span className={`text-sm ${bold ? 'font-semibold text-white' : 'text-gray-400'}`}>{label}</span>
    <span className={`text-sm font-mono ${accent === 'green' ? 'text-emerald-400 font-semibold' : accent === 'red' ? 'text-red-400 font-semibold' : bold ? 'font-semibold text-white' : 'text-gray-200'}`}>
      {value}
    </span>
  </div>
);

// --- Main Component ---
export default function DealAnalyzerPage() {
  const [searchParams] = useSearchParams();
  const opportunityId = searchParams.get('opportunityId') || null;
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Property
  const [address, setAddress] = useState(searchParams.get('address') || '');
  const [municipality, setMunicipality] = useState(searchParams.get('municipality') || 'Greenville County');
  const [lotSize, setLotSize] = useState(searchParams.get('lot_size') || '');

  // Acquisition
  const [askingPrice, setAskingPrice] = useState(searchParams.get('asking_price') || '');
  const [ourOffer, setOurOffer] = useState(searchParams.get('our_offer') || '');
  const [earnestMoney, setEarnestMoney] = useState('5000');
  const [buyerClosing, setBuyerClosing] = useState('3500');

  // Construction
  const [plan, setPlan] = useState('cherry');
  const [baseBuildOverride, setBaseBuildOverride] = useState('');
  const [lotPrep, setLotPrep] = useState('16000');
  const [softCosts, setSoftCosts] = useState('21000');
  const [upgradePkg, setUpgradePkg] = useState('standard');
  const [contingencyPct, setContingencyPct] = useState('5');

  // Sale
  const [salePrice, setSalePrice] = useState(searchParams.get('sale_price') || '');
  const [commissionPct, setCommissionPct] = useState('3.0');
  const [sellerClosingPct, setSellerClosingPct] = useState('2.0');

  // Financing
  const [loanRate, setLoanRate] = useState('8.5');
  const [loanTerm, setLoanTerm] = useState('10');
  const [ltcPct, setLtcPct] = useState('85');

  // --- Auto-calculated analysis ---
  const analysis = useMemo(() => {
    const n = (v) => parseFloat(v) || 0;

    // Uses
    const landCost = n(ourOffer) || n(askingPrice);
    const closingBuyer = n(buyerClosing);
    const baseBuild = n(baseBuildOverride) || PLANS[plan]?.baseCost || 0;
    const lotPrepCost = n(lotPrep);
    const softCostAmt = n(softCosts);
    const upgradeAmt = UPGRADE_PACKAGES[upgradePkg]?.cost || 0;
    const hardCosts = baseBuild + lotPrepCost + softCostAmt + upgradeAmt;
    const contingency = hardCosts * (n(contingencyPct) / 100);
    const totalConstruction = hardCosts + contingency;

    // Total uses before carry (needed to calc loan, then carry)
    const usesBeforeCarry = landCost + closingBuyer + totalConstruction;
    const loanAmt = usesBeforeCarry * (n(ltcPct) / 100);
    const carryCosts = loanAmt * (n(loanRate) / 100) * (n(loanTerm) / 12);
    const totalUses = usesBeforeCarry + carryCosts;

    // Sources
    const cashEquity = totalUses - loanAmt;

    // Sale
    const projSale = n(salePrice);
    const commission = projSale * (n(commissionPct) / 100);
    const sellerClosing = projSale * (n(sellerClosingPct) / 100);
    const netProceeds = projSale - commission - sellerClosing;

    // Returns
    const netProfit = netProceeds - totalUses;
    const marginPct = projSale > 0 ? (netProfit / projSale) * 100 : 0;
    const roiTotal = totalUses > 0 ? (netProfit / totalUses) * 100 : 0;
    const roiCash = cashEquity > 0 ? (netProfit / cashEquity) * 100 : 0;

    return {
      landCost, closingBuyer, baseBuild, lotPrepCost, softCostAmt, upgradeAmt,
      hardCosts, contingency, totalConstruction, carryCosts, totalUses,
      loanAmt, cashEquity,
      projSale, commission, sellerClosing, netProceeds,
      netProfit, marginPct, roiTotal, roiCash,
    };
  }, [askingPrice, ourOffer, buyerClosing, plan, baseBuildOverride, lotPrep, softCosts, upgradePkg, contingencyPct, salePrice, commissionPct, sellerClosingPct, loanRate, loanTerm, ltcPct]);

  // Verdict
  const verdict = analysis.marginPct > 15 ? 'GO' : analysis.marginPct >= 10 ? 'MARGINAL' : 'PASS';

  // --- Save to opportunity ---
  const handleSave = async () => {
    if (!opportunityId) return;
    setSaving(true);
    try {
      const snapshot = {
        saved_at: new Date().toISOString(),
        inputs: {
          address, municipality, lotSize, askingPrice, ourOffer, earnestMoney,
          buyerClosing, plan, baseBuildOverride, lotPrep, softCosts, upgradePkg,
          contingencyPct, salePrice, commissionPct, sellerClosingPct,
          loanRate, loanTerm, ltcPct,
        },
        outputs: { ...analysis, verdict },
      };
      await supabase
        .from('opportunities')
        .update({ deal_analysis: snapshot, updated_at: new Date().toISOString() })
        .eq('id', opportunityId);
    } finally {
      setSaving(false);
    }
  };

  // --- Copy to clipboard ---
  const handleCopy = () => {
    const a = analysis;
    const text = [
      `SOURCES & USES PRO FORMA`,
      `${address || 'No address'} | ${municipality}`,
      `Plan: ${PLANS[plan]?.name} ${PLANS[plan]?.sqft}sf | ${UPGRADE_PACKAGES[upgradePkg]?.label} upgrades`,
      ``,
      `SOURCES OF FUNDS`,
      `  Your Cash (Equity)     ${fmt(a.cashEquity)}`,
      `  Construction Loan      ${fmt(a.loanAmt)}`,
      `  = Total Sources        ${fmt(a.totalUses)}`,
      ``,
      `USES OF FUNDS`,
      `  Land Acquisition       ${fmt(a.landCost)}`,
      `  Acquisition Closing    ${fmt(a.closingBuyer)}`,
      `  Base Build Cost        ${fmt(a.baseBuild)}`,
      `  Lot Prep               ${fmt(a.lotPrepCost)}`,
      `  Soft Costs             ${fmt(a.softCostAmt)}`,
      `  Upgrade Delta          ${fmt(a.upgradeAmt)}`,
      `  Contingency (${contingencyPct}%)      ${fmt(a.contingency)}`,
      `  Carry Costs            ${fmt(a.carryCosts)}`,
      `  = Total Uses           ${fmt(a.totalUses)}`,
      ``,
      `RETURNS`,
      `  Projected Sale Price   ${fmt(a.projSale)}`,
      `  Less: Commission       (${fmt(a.commission)})`,
      `  Less: Closing Costs    (${fmt(a.sellerClosing)})`,
      `  = Net Proceeds         ${fmt(a.netProceeds)}`,
      ``,
      `  Net Profit             ${fmt(a.netProfit)}`,
      `  Gross Margin           ${fmtPct(a.marginPct)}`,
      `  ROI (Total Cost)       ${fmtPct(a.roiTotal)}`,
      `  ROI (Cash Invested)    ${fmtPct(a.roiCash)}`,
      `  Cash Required          ${fmt(a.cashEquity)}`,
      ``,
      `  Verdict: ${verdict}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Sources & Uses Pro Forma</h1>
            <p className="text-sm text-gray-400 mt-1">Scattered lot build-to-sell calculator</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-700 text-gray-200 text-sm rounded hover:bg-gray-600 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            {opportunityId && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-emerald-700 text-white text-sm rounded hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Analysis'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* LEFT COLUMN — INPUTS (2/5 = 40%) */}
          <div className="col-span-2 space-y-4">
            {/* Property */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Property</h3>
              <Field label="Address">
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Greenville, SC" className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />
              </Field>
              <Field label="Municipality">
                <Sel value={municipality} onChange={setMunicipality} options={MUNICIPALITIES.map(m => ({ value: m, label: m }))} />
              </Field>
              <Field label="Lot Size (sf)">
                <NumInput value={lotSize} onChange={setLotSize} suffix="sf" placeholder="10890" />
              </Field>
            </div>

            {/* Acquisition */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Acquisition</h3>
              <Field label="Asking Price"><NumInput value={askingPrice} onChange={setAskingPrice} prefix="$" placeholder="200000" /></Field>
              <Field label="Our Offer"><NumInput value={ourOffer} onChange={setOurOffer} prefix="$" placeholder="180000" /></Field>
              <Field label="Earnest Money"><NumInput value={earnestMoney} onChange={setEarnestMoney} prefix="$" /></Field>
              <Field label="Closing Costs — Buyer"><NumInput value={buyerClosing} onChange={setBuyerClosing} prefix="$" /></Field>
            </div>

            {/* Construction */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Construction</h3>
              <Field label="Plan">
                <Sel value={plan} onChange={(v) => { setPlan(v); setBaseBuildOverride(''); }} options={Object.entries(PLANS).map(([k, p]) => ({ value: k, label: `${p.name} ${p.sqft.toLocaleString()}sf` }))} />
              </Field>
              <Field label={`Base Build Cost (${PLANS[plan]?.name})`}>
                <NumInput value={baseBuildOverride || PLANS[plan]?.baseCost} onChange={setBaseBuildOverride} prefix="$" />
              </Field>
              <Field label="Lot Prep"><NumInput value={lotPrep} onChange={setLotPrep} prefix="$" /></Field>
              <Field label="Soft Costs"><NumInput value={softCosts} onChange={setSoftCosts} prefix="$" /></Field>
              <Field label="Upgrade Package">
                <Sel value={upgradePkg} onChange={setUpgradePkg} options={Object.entries(UPGRADE_PACKAGES).map(([k, p]) => ({ value: k, label: `${p.label} (${fmt(p.cost)})` }))} />
              </Field>
              <Field label="Contingency %"><NumInput value={contingencyPct} onChange={setContingencyPct} suffix="%" /></Field>
            </div>

            {/* Sale */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Sale</h3>
              <Field label="Projected Sale Price"><NumInput value={salePrice} onChange={setSalePrice} prefix="$" placeholder="380000" /></Field>
              <Field label="Commission %"><NumInput value={commissionPct} onChange={setCommissionPct} suffix="%" /></Field>
              <Field label="Seller Closing Costs %"><NumInput value={sellerClosingPct} onChange={setSellerClosingPct} suffix="%" /></Field>
            </div>

            {/* Financing */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Financing</h3>
              <Field label="Construction Loan Rate %"><NumInput value={loanRate} onChange={setLoanRate} suffix="%" /></Field>
              <Field label="Loan Term (months)"><NumInput value={loanTerm} onChange={setLoanTerm} suffix="mo" /></Field>
              <Field label="LTC % (Loan-to-Cost)"><NumInput value={ltcPct} onChange={setLtcPct} suffix="%" /></Field>
            </div>
          </div>

          {/* RIGHT COLUMN — ANALYSIS (3/5 = 60%) */}
          <div className="col-span-3 space-y-4">
            {/* Verdict */}
            <div className={`rounded-lg p-6 border text-center ${
              verdict === 'GO' ? 'bg-emerald-900/40 border-emerald-600' :
              verdict === 'MARGINAL' ? 'bg-yellow-900/40 border-yellow-600' :
              'bg-red-900/40 border-red-600'
            }`}>
              <div className={`text-4xl font-bold ${
                verdict === 'GO' ? 'text-emerald-400' :
                verdict === 'MARGINAL' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {verdict === 'GO' ? 'GO' : verdict === 'MARGINAL' ? 'MARGINAL' : 'PASS'}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {verdict === 'GO' ? 'Margin > 15% — proceed with offer' :
                 verdict === 'MARGINAL' ? 'Margin 10-15% — negotiate harder or reduce costs' :
                 'Margin < 10% — does not meet criteria'}
              </p>
            </div>

            {/* Sources & Uses */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Sources & Uses</h3>
              <div className="grid grid-cols-2 gap-8">
                {/* Sources */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sources of Funds</p>
                  <Row label="Your Cash (Equity)" value={fmt(analysis.cashEquity)} />
                  <Row label={`Construction Loan (${ltcPct}%)`} value={fmt(analysis.loanAmt)} />
                  <Row label="= Total Sources" value={fmt(analysis.totalUses)} bold border />
                </div>
                {/* Uses */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Uses of Funds</p>
                  <Row label="Land Acquisition" value={fmt(analysis.landCost)} />
                  <Row label="Acquisition Closing Costs" value={fmt(analysis.closingBuyer)} />
                  <Row label="Base Build Cost" value={fmt(analysis.baseBuild)} />
                  <Row label="Lot Prep" value={fmt(analysis.lotPrepCost)} />
                  <Row label="Soft Costs" value={fmt(analysis.softCostAmt)} />
                  <Row label="Upgrade Delta" value={fmt(analysis.upgradeAmt)} />
                  <Row label={`Contingency (${contingencyPct}%)`} value={fmt(analysis.contingency)} />
                  <Row label="Carry Costs (loan interest)" value={fmt(analysis.carryCosts)} />
                  <Row label="= Total Uses" value={fmt(analysis.totalUses)} bold border />
                </div>
              </div>
            </div>

            {/* Returns */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Returns</h3>
              <Row label="Projected Sale Price" value={fmt(analysis.projSale)} />
              <Row label={`Less: Commission (${commissionPct}%)`} value={`(${fmt(analysis.commission)})`} />
              <Row label={`Less: Closing Costs (${sellerClosingPct}%)`} value={`(${fmt(analysis.sellerClosing)})`} />
              <Row label="= Net Proceeds" value={fmt(analysis.netProceeds)} bold border />

              <div className="mt-4 pt-3 border-t border-gray-700 space-y-1">
                <Row label="Net Profit" value={fmt(analysis.netProfit)} bold accent={analysis.netProfit >= 0 ? 'green' : 'red'} />
                <Row label="Gross Margin" value={fmtPct(analysis.marginPct)} />
                <Row label="ROI (on total cost)" value={fmtPct(analysis.roiTotal)} />
                <Row label="ROI (on cash invested)" value={fmtPct(analysis.roiCash)} />
                <Row label="Cash Required" value={fmt(analysis.cashEquity)} bold />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
