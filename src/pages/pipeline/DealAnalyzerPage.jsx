// pages/pipeline/DealAnalyzerPage.jsx
// Sources & Uses Pro Forma Calculator

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const PLANS = {
  cherry:    { label: 'Cherry 1,350sf',    sqft: 1350, baseCost: 222750 },
  magnolia:  { label: 'Magnolia 1,800sf',  sqft: 1800, baseCost: 315000 },
  atlas:     { label: 'Atlas 2,500sf',     sqft: 2500, baseCost: 462500 },
  dogwood:   { label: 'Dogwood 1,800sf',   sqft: 1800, baseCost: 306000 },
  palmetto:  { label: 'Palmetto 2,100sf',  sqft: 2100, baseCost: 378000 },
  juniper:   { label: 'Juniper 2,200sf',   sqft: 2200, baseCost: 400400 },
};

const UPGRADE_PACKAGES = {
  standard:  { label: 'Standard',  cost: 0 },
  classic:   { label: 'Classic',   cost: 12000 },
  elegance:  { label: 'Elegance',  cost: 24000 },
};

const MUNICIPALITIES = [
  'City of Greenville', 'Greenville County', 'City of Greer',
  'City of Simpsonville', 'City of Mauldin', 'City of Travelers Rest',
  'Spartanburg County', 'Anderson County', 'Other',
];

const fmt = (v) => v == null || isNaN(v) ? '$0' : `$${Math.round(v).toLocaleString()}`;
const fmtPct = (v) => `${(v || 0).toFixed(1)}%`;

// --- Reusable input components ---
const Field = ({ label, children }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
    {children}
  </div>
);

const NumInput = ({ value, onChange, prefix, suffix, placeholder, step }) => (
  <div className="relative">
    {prefix && <span className="absolute left-3 top-2 text-gray-500 text-sm">{prefix}</span>}
    <input
      type="number"
      step={step || 'any'}
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
    const interestReserve = totalConstruction * (n(loanRate) / 100) * (n(loanTerm) / 12) * 0.5;
    const totalUses = landCost + closingBuyer + totalConstruction + interestReserve;

    // Sources
    const loanAmt = totalUses * (n(ltcPct) / 100);
    const cashEquity = totalUses - loanAmt;

    // Sale
    const projSale = n(salePrice);
    const commission = projSale * (n(commissionPct) / 100);
    const sellerClosing = projSale * (n(sellerClosingPct) / 100);
    const netProceeds = projSale - commission - sellerClosing;

    // Profit
    const grossProfit = netProceeds - totalUses;
    const marginPct = projSale > 0 ? (grossProfit / projSale) * 100 : 0;
    const roiTotal = totalUses > 0 ? (grossProfit / totalUses) * 100 : 0;
    const roiCash = cashEquity > 0 ? (grossProfit / cashEquity) * 100 : 0;
    const costPerSf = (PLANS[plan]?.sqft > 0) ? totalUses / PLANS[plan].sqft : 0;

    return {
      landCost, closingBuyer, baseBuild, lotPrepCost, softCostAmt, upgradeAmt,
      hardCosts, contingency, totalConstruction, interestReserve, totalUses,
      loanAmt, cashEquity, earnest: n(earnestMoney),
      projSale, commission, sellerClosing, netProceeds,
      grossProfit, marginPct, roiTotal, roiCash, costPerSf,
    };
  }, [askingPrice, ourOffer, buyerClosing, plan, baseBuildOverride, lotPrep, softCosts, upgradePkg, contingencyPct, salePrice, commissionPct, sellerClosingPct, loanRate, loanTerm, ltcPct, earnestMoney]);

  const profitColor = analysis.grossProfit >= 0 ? 'green' : 'red';

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 mb-6">
          <h1 className="text-xl font-bold text-white">Sources & Uses Pro Forma</h1>
          <p className="text-sm text-gray-400 mt-1">Scattered lot build-to-sell calculator</p>
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
                <Sel value={plan} onChange={(v) => { setPlan(v); setBaseBuildOverride(''); }} options={Object.entries(PLANS).map(([k, p]) => ({ value: k, label: p.label }))} />
              </Field>
              <Field label={`Base Build Cost (${PLANS[plan]?.label})`}>
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
            {/* Profit banner */}
            <div className={`rounded-lg p-5 border ${analysis.grossProfit >= 0 ? 'bg-emerald-900/30 border-emerald-700' : 'bg-red-900/30 border-red-700'}`}>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400">Gross Profit</p>
                  <p className={`text-2xl font-bold ${analysis.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(analysis.grossProfit)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Margin</p>
                  <p className="text-2xl font-bold text-white">{fmtPct(analysis.marginPct)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">ROI (Total)</p>
                  <p className="text-2xl font-bold text-white">{fmtPct(analysis.roiTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">ROI (Cash)</p>
                  <p className="text-2xl font-bold text-white">{fmtPct(analysis.roiCash)}</p>
                </div>
              </div>
            </div>

            {/* Sources & Uses */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Sources & Uses</h3>
              <div className="grid grid-cols-2 gap-8">
                {/* Uses */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Uses</p>
                  <Row label="Land Acquisition" value={fmt(analysis.landCost)} />
                  <Row label="Buyer Closing Costs" value={fmt(analysis.closingBuyer)} />
                  <Row label="Base Build" value={fmt(analysis.baseBuild)} />
                  <Row label="Lot Prep" value={fmt(analysis.lotPrepCost)} />
                  <Row label="Soft Costs" value={fmt(analysis.softCostAmt)} />
                  <Row label="Upgrade Package" value={fmt(analysis.upgradeAmt)} />
                  <Row label={`Contingency (${contingencyPct}%)`} value={fmt(analysis.contingency)} />
                  <Row label="Interest Reserve" value={fmt(analysis.interestReserve)} />
                  <Row label="Total Project Cost" value={fmt(analysis.totalUses)} bold border />
                </div>
                {/* Sources */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sources</p>
                  <Row label={`Construction Loan (${ltcPct}%)`} value={fmt(analysis.loanAmt)} />
                  <Row label="Cash Equity Required" value={fmt(analysis.cashEquity)} />
                  <Row label="Total Sources" value={fmt(analysis.totalUses)} bold border />
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">Earnest Money (part of equity)</p>
                    <p className="text-sm text-gray-300">{fmt(analysis.earnest)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sale Proceeds */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Sale Proceeds</h3>
              <Row label="Projected Sale Price" value={fmt(analysis.projSale)} />
              <Row label={`Commission (${commissionPct}%)`} value={`(${fmt(analysis.commission)})`} />
              <Row label={`Seller Closing (${sellerClosingPct}%)`} value={`(${fmt(analysis.sellerClosing)})`} />
              <Row label="Net Sale Proceeds" value={fmt(analysis.netProceeds)} bold border />
              <Row label="Less: Total Project Cost" value={`(${fmt(analysis.totalUses)})`} />
              <Row label="Gross Profit" value={fmt(analysis.grossProfit)} bold border accent={profitColor} />
            </div>

            {/* Key Metrics */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Key Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded p-3 text-center">
                  <p className="text-xs text-gray-400">Cost / SF</p>
                  <p className="text-lg font-bold text-white">{fmt(analysis.costPerSf)}</p>
                  <p className="text-xs text-gray-500">{PLANS[plan]?.sqft.toLocaleString()} sf plan</p>
                </div>
                <div className="bg-gray-900 rounded p-3 text-center">
                  <p className="text-xs text-gray-400">Land % of Sale</p>
                  <p className={`text-lg font-bold ${analysis.projSale > 0 && (analysis.landCost / analysis.projSale) <= 0.25 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {analysis.projSale > 0 ? fmtPct((analysis.landCost / analysis.projSale) * 100) : '—'}
                  </p>
                  <p className="text-xs text-gray-500">Target: &le; 25%</p>
                </div>
                <div className="bg-gray-900 rounded p-3 text-center">
                  <p className="text-xs text-gray-400">Build Cost / SF</p>
                  <p className="text-lg font-bold text-white">
                    {PLANS[plan]?.sqft > 0 ? fmt(analysis.totalConstruction / PLANS[plan].sqft) : '—'}
                  </p>
                  <p className="text-xs text-gray-500">Hard + contingency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
