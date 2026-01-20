// pages/pipeline/DealAnalyzerPage.jsx
// Standalone Deal Analyzer for quick property evaluation

import React, { useState, useCallback } from 'react';

// Market configurations for Red Cedar Homes
const MARKETS = {
  nickeltown_city_core: {
    name: 'Nickeltown/City Core',
    avgSalePrice: 360000,
    maxLandBasis: 90000,
    products: ['cherry', 'magnolia'],
    pricePerSfRange: [180, 240],
    weights: { demographics: 0.20, income: 0.25, comps: 0.25, lot: 0.15, infra: 0.15 }
  },
  travelers_rest: {
    name: 'Travelers Rest',
    avgSalePrice: 400000,
    maxLandBasis: 100000,
    products: ['cherry', 'magnolia'],
    pricePerSfRange: [190, 260],
    weights: { demographics: 0.25, income: 0.20, comps: 0.25, lot: 0.15, infra: 0.15 }
  },
  taylors: {
    name: 'Taylors',
    avgSalePrice: 440000,
    maxLandBasis: 110000,
    products: ['magnolia', 'atlas'],
    pricePerSfRange: [200, 280],
    weights: { demographics: 0.25, income: 0.20, comps: 0.20, lot: 0.20, infra: 0.15 }
  },
  greer: {
    name: 'Greer',
    avgSalePrice: 475000,
    maxLandBasis: 118750,
    products: ['magnolia', 'atlas', 'anchorage'],
    pricePerSfRange: [210, 300],
    weights: { demographics: 0.20, income: 0.20, comps: 0.20, lot: 0.25, infra: 0.15 }
  }
};

const PRODUCTS = {
  cherry: { name: 'Cherry', sqFt: 1350, costPerSf: 165, minLot: 5000, priceRange: [320000, 380000] },
  magnolia: { name: 'Magnolia', sqFt: 1800, costPerSf: 175, minLot: 6500, priceRange: [380000, 480000] },
  atlas: { name: 'Atlas', sqFt: 2500, costPerSf: 185, minLot: 8000, priceRange: [480000, 550000] },
  anchorage: { name: 'Anchorage', sqFt: 3200, costPerSf: 195, minLot: 10000, priceRange: [550000, 650000] }
};

const COST_ASSUMPTIONS = {
  waterTap: 3500,
  sewerTap: 4500,
  electricService: 2500,
  gasService: 1500,
  sitePrepPerSf: 0.50,
  impactFees: 4500,
  permitPct: 0.015,
  softCostsPct: 0.08,
  contingencyPct: 0.10,
  salesCommission: 0.06,
  closingCosts: 0.02,
  landLoanRate: 0.08,
  constructionLoanRate: 0.085
};

// Helper functions
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(1)}%`;
};

const getRecommendedProduct = (lotSize, market) => {
  if (lotSize >= 10000 && market === 'greer') return 'anchorage';
  if (lotSize >= 8000 && ['taylors', 'greer'].includes(market)) return 'atlas';
  if (lotSize >= 6500) return 'magnolia';
  return 'cherry';
};

// Section component with collapse
const Section = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-700 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-800 flex items-center justify-between text-left font-semibold text-white hover:bg-gray-700"
      >
        {title}
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && <div className="p-4 bg-gray-900">{children}</div>}
    </div>
  );
};

// Input components
const InputField = ({ label, value, onChange, type = "text", placeholder, suffix, prefix, help }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-gray-300 mb-1">
      {label}
      {help && <span className="ml-1 text-gray-500 text-xs">({help})</span>}
    </label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-2 text-gray-400">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-12' : ''}`}
      />
      {suffix && <span className="absolute right-3 top-2 text-gray-400 text-sm">{suffix}</span>}
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <label className="flex items-center mb-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 text-indigo-600 border-gray-600 rounded focus:ring-indigo-500 bg-gray-800"
    />
    <span className="ml-2 text-sm text-gray-300">{label}</span>
  </label>
);

const ScoreBar = ({ score, label }) => {
  const getColor = (s) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 70) return 'bg-green-400';
    if (s >= 60) return 'bg-yellow-400';
    if (s >= 50) return 'bg-orange-400';
    return 'bg-red-500';
  };
  
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="font-medium text-white">{score}/100</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className={`h-2 rounded-full ${getColor(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

const ResultCard = ({ title, value, subtitle, trend }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
    <span className="text-sm text-gray-400">{title}</span>
    <div className="text-2xl font-bold text-white mt-1">{value}</div>
    {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    {trend !== undefined && (
      <div className={`text-sm mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs target
      </div>
    )}
  </div>
);

const Alert = ({ type, title, children }) => {
  const styles = {
    success: 'bg-green-900/30 border-green-700 text-green-300',
    warning: 'bg-yellow-900/30 border-yellow-700 text-yellow-300',
    error: 'bg-red-900/30 border-red-700 text-red-300',
    info: 'bg-blue-900/30 border-blue-700 text-blue-300'
  };
  
  const icons = { success: '✓', warning: '⚠️', error: '✗', info: 'ℹ' };
  
  return (
    <div className={`border rounded-lg p-4 mb-4 ${styles[type]}`}>
      <div className="flex items-start">
        <span className="mr-3 mt-0.5">{icons[type]}</span>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function DealAnalyzerPage() {
  // Property inputs
  const [address, setAddress] = useState('');
  const [market, setMarket] = useState('travelers_rest');
  const [askingPrice, setAskingPrice] = useState('');
  const [lotSizeSf, setLotSizeSf] = useState('');
  
  // Zoning & Environmental
  const [zoning, setZoning] = useState('R-1');
  const [floodZone, setFloodZone] = useState('X');
  const [wetlandsPercent, setWetlandsPercent] = useState('0');
  const [avgSlope, setAvgSlope] = useState('5');
  
  // Utilities
  const [hasWater, setHasWater] = useState(true);
  const [hasSewer, setHasSewer] = useState(true);
  const [hasElectric, setHasElectric] = useState(true);
  const [hasGas, setHasGas] = useState(false);
  const [utilityDistance, setUtilityDistance] = useState('100');
  
  // Comps
  const [avgCompPrice, setAvgCompPrice] = useState('');
  const [avgDaysOnMarket, setAvgDaysOnMarket] = useState('30');
  
  // Analysis state
  const [analysis, setAnalysis] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const runAnalysis = useCallback(() => {
    const lotSize = parseInt(lotSizeSf) || 0;
    const price = parseInt(askingPrice) || 0;
    const marketConfig = MARKETS[market];
    
    // Check instant disqualifiers
    const disqualifiers = [];
    if (['A', 'AE', 'AO', 'AH'].includes(floodZone)) disqualifiers.push('Flood Zone A/AE');
    if (!hasWater && parseInt(utilityDistance) > 500) disqualifiers.push('No water within 500ft');
    if (['C-1', 'C-2', 'I-1', 'I-2'].includes(zoning)) disqualifiers.push('Prohibited zoning');
    if (parseInt(wetlandsPercent) > 25) disqualifiers.push('Wetlands > 25%');
    if (parseInt(avgSlope) > 25) disqualifiers.push('Slope > 25%');
    if (lotSize > 0 && price / lotSize > 15) disqualifiers.push('Price/SF > $15');
    
    const passedBuyBox = disqualifiers.length === 0;
    
    // Calculate scores
    const demographicsScore = 75;
    const incomeScore = 80;
    const compScore = avgCompPrice ? Math.min(100, Math.max(0, 100 - Math.abs((parseInt(avgCompPrice) - marketConfig.avgSalePrice) / marketConfig.avgSalePrice * 100))) : 70;
    const lotScore = lotSize >= 6500 ? 85 : lotSize >= 5000 ? 70 : 50;
    const infraScore = (hasWater ? 25 : 0) + (hasSewer ? 25 : 0) + (hasElectric ? 20 : 0) + (hasGas ? 10 : 0) + (parseInt(utilityDistance) < 200 ? 20 : 10);
    
    const weights = marketConfig.weights;
    const finalScore = Math.round(
      demographicsScore * weights.demographics +
      incomeScore * weights.income +
      compScore * weights.comps +
      lotScore * weights.lot +
      infraScore * weights.infra
    );
    
    // Determine product
    const recommendedProduct = getRecommendedProduct(lotSize, market);
    const product = PRODUCTS[recommendedProduct];
    
    // Calculate scattered lot scenario
    const utilityConnections = (hasWater ? COST_ASSUMPTIONS.waterTap : 0) +
      (hasSewer ? COST_ASSUMPTIONS.sewerTap : 0) +
      (hasElectric ? COST_ASSUMPTIONS.electricService : 0) +
      (hasGas ? COST_ASSUMPTIONS.gasService : 0);
    
    const sitePrep = lotSize * COST_ASSUMPTIONS.sitePrepPerSf;
    const closingCosts = price * 0.02;
    const holdingCosts = price * COST_ASSUMPTIONS.landLoanRate * (3/12);
    
    const landBasis = price + closingCosts + sitePrep + utilityConnections + COST_ASSUMPTIONS.impactFees + holdingCosts;
    
    const constructionCost = product.sqFt * product.costPerSf;
    const softCosts = constructionCost * COST_ASSUMPTIONS.softCostsPct;
    const constructionFinancing = constructionCost * COST_ASSUMPTIONS.constructionLoanRate * 0.5;
    
    const totalProjectCost = landBasis + constructionCost + softCosts + constructionFinancing;
    
    const projectedSalePrice = avgCompPrice ? parseInt(avgCompPrice) : (product.priceRange[0] + product.priceRange[1]) / 2;
    const salesCosts = projectedSalePrice * (COST_ASSUMPTIONS.salesCommission + COST_ASSUMPTIONS.closingCosts);
    const netProceeds = projectedSalePrice - salesCosts;
    const grossProfit = netProceeds - totalProjectCost;
    const grossMargin = grossProfit / projectedSalePrice;
    const roi = grossProfit / totalProjectCost;
    const landBasisPercent = landBasis / projectedSalePrice;
    
    const passes25Rule = landBasisPercent <= 0.25;
    const maxLandBasis = marketConfig.maxLandBasis;
    
    const scatteredViable = lotSize >= 5000 && lotSize <= 20000 && passedBuyBox && passes25Rule;
    const subdivisionViable = lotSize >= 217800 && passedBuyBox;
    const btrViable = lotSize >= 217800 && ['R-2', 'R-3', 'PD'].includes(zoning) && passedBuyBox;
    const lotDevViable = lotSize >= 217800 && passedBuyBox;
    
    let recommendation = 'PASS';
    let confidence = 'HIGH';
    
    if (!passedBuyBox) {
      recommendation = 'PASS';
      confidence = 'HIGH';
    } else if (scatteredViable && grossMargin >= 0.18 && roi >= 0.20 && passes25Rule) {
      if (finalScore >= 80 && grossMargin >= 0.22) {
        recommendation = 'STRONG_BUY';
        confidence = 'HIGH';
      } else if (finalScore >= 70) {
        recommendation = 'BUY';
        confidence = finalScore >= 75 ? 'HIGH' : 'MEDIUM';
      } else if (finalScore >= 60) {
        recommendation = 'HOLD';
        confidence = 'MEDIUM';
      } else {
        recommendation = 'PASS';
        confidence = 'MEDIUM';
      }
    } else if (finalScore >= 60 && (grossMargin >= 0.15 || !passes25Rule)) {
      recommendation = 'HOLD';
      confidence = 'LOW';
    }
    
    const targetLandBasis = projectedSalePrice * 0.22;
    const maxOffer = targetLandBasis - closingCosts - sitePrep - utilityConnections - COST_ASSUMPTIONS.impactFees - holdingCosts;
    
    setAnalysis({
      passedBuyBox,
      disqualifiers,
      scores: { demographics: demographicsScore, income: incomeScore, comps: compScore, lot: lotScore, infrastructure: infraScore },
      finalScore,
      recommendedProduct,
      scattered: {
        viable: scatteredViable,
        landBasis,
        constructionCost,
        totalProjectCost,
        projectedSalePrice,
        netProceeds,
        grossProfit,
        grossMargin,
        roi,
        landBasisPercent,
        passes25Rule
      },
      subdivision: { viable: subdivisionViable },
      btr: { viable: btrViable },
      lotDev: { viable: lotDevViable },
      recommendation,
      confidence,
      maxOffer: Math.max(0, maxOffer),
      maxLandBasis
    });
    
    setShowResults(true);
  }, [address, market, askingPrice, lotSizeSf, zoning, floodZone, wetlandsPercent, avgSlope, hasWater, hasSewer, hasElectric, hasGas, utilityDistance, avgCompPrice, avgDaysOnMarket]);

  const getRecommendationColor = (rec) => {
    switch(rec) {
      case 'STRONG_BUY': return 'bg-green-600';
      case 'BUY': return 'bg-green-500';
      case 'HOLD': return 'bg-yellow-500';
      case 'PASS': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreInterpretation = (score) => {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'VERY GOOD';
    if (score >= 70) return 'GOOD';
    if (score >= 60) return 'ACCEPTABLE';
    if (score >= 50) return 'MARGINAL';
    return 'POOR';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                📊 Red Cedar Deal Analyzer
              </h1>
              <p className="text-gray-400 mt-1">Evaluate scattered lot and development opportunities</p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <div>25% Rule Active</div>
              <div>Greenville Metro Markets</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <Section title="📍 Property Information">
              <InputField
                label="Property Address"
                value={address}
                onChange={setAddress}
                placeholder="123 Main St, Greenville, SC"
              />
              <SelectField
                label="Target Market"
                value={market}
                onChange={setMarket}
                options={Object.entries(MARKETS).map(([key, val]) => ({ value: key, label: val.name }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Asking Price"
                  value={askingPrice}
                  onChange={setAskingPrice}
                  type="number"
                  prefix="$"
                />
                <InputField
                  label="Lot Size"
                  value={lotSizeSf}
                  onChange={setLotSizeSf}
                  type="number"
                  suffix="SF"
                />
              </div>
            </Section>
            
            <Section title="🏛️ Zoning & Environmental" defaultOpen={false}>
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Zoning"
                  value={zoning}
                  onChange={setZoning}
                  options={[
                    { value: 'R-1', label: 'R-1 (Single Family)' },
                    { value: 'R-2', label: 'R-2 (Single Family)' },
                    { value: 'R-3', label: 'R-3 (Multi-Family)' },
                    { value: 'PD', label: 'PD (Planned Dev)' },
                    { value: 'MX', label: 'MX (Mixed Use)' },
                    { value: 'C-1', label: 'C-1 (Commercial)' },
                    { value: 'I-1', label: 'I-1 (Industrial)' }
                  ]}
                />
                <SelectField
                  label="FEMA Flood Zone"
                  value={floodZone}
                  onChange={setFloodZone}
                  options={[
                    { value: 'X', label: 'Zone X (Minimal)' },
                    { value: 'X500', label: 'Zone X (500-yr)' },
                    { value: 'AE', label: 'Zone AE (High Risk)' },
                    { value: 'A', label: 'Zone A (High Risk)' }
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Wetlands Coverage"
                  value={wetlandsPercent}
                  onChange={setWetlandsPercent}
                  type="number"
                  suffix="%"
                />
                <InputField
                  label="Average Slope"
                  value={avgSlope}
                  onChange={setAvgSlope}
                  type="number"
                  suffix="%"
                />
              </div>
            </Section>
            
            <Section title="⚡ Utilities" defaultOpen={false}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <CheckboxField label="Municipal Water" checked={hasWater} onChange={setHasWater} />
                  <CheckboxField label="Municipal Sewer" checked={hasSewer} onChange={setHasSewer} />
                </div>
                <div>
                  <CheckboxField label="Electric Available" checked={hasElectric} onChange={setHasElectric} />
                  <CheckboxField label="Natural Gas" checked={hasGas} onChange={setHasGas} />
                </div>
              </div>
              <InputField
                label="Distance to Utilities"
                value={utilityDistance}
                onChange={setUtilityDistance}
                type="number"
                suffix="ft"
              />
            </Section>
            
            <Section title="📊 Market Comps" defaultOpen={false}>
              <InputField
                label="Average Comp Sale Price"
                value={avgCompPrice}
                onChange={setAvgCompPrice}
                type="number"
                prefix="$"
                help="Leave blank to use market default"
              />
              <InputField
                label="Avg Days on Market"
                value={avgDaysOnMarket}
                onChange={setAvgDaysOnMarket}
                type="number"
                suffix="days"
              />
            </Section>
            
            <button
              onClick={runAnalysis}
              disabled={!lotSizeSf || !askingPrice}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Run Analysis
            </button>
          </div>
          
          {/* Results Section */}
          <div>
            {!showResults ? (
              <div className="bg-gray-800 rounded-lg shadow-sm p-8 text-center border border-gray-700">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-400">Enter property details and click &quot;Run Analysis&quot;</h3>
                <p className="text-sm text-gray-500 mt-2">Analysis will evaluate against buy box criteria and calculate returns</p>
              </div>
            ) : analysis && (
              <>
                {/* Recommendation Banner */}
                <div className={`${getRecommendationColor(analysis.recommendation)} text-white rounded-lg p-6 mb-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-80">Recommendation</div>
                      <div className="text-3xl font-bold">{analysis.recommendation.replace('_', ' ')}</div>
                      <div className="text-sm opacity-80 mt-1">Confidence: {analysis.confidence}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-80">Score</div>
                      <div className="text-4xl font-bold">{analysis.finalScore}</div>
                      <div className="text-sm opacity-80">{getScoreInterpretation(analysis.finalScore)}</div>
                    </div>
                  </div>
                </div>
                
                {/* Disqualifiers */}
                {analysis.disqualifiers.length > 0 && (
                  <Alert type="error" title="Instant Disqualifiers Triggered">
                    <ul className="list-disc list-inside">
                      {analysis.disqualifiers.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </Alert>
                )}
                
                {/* 25% Rule */}
                {analysis.scattered.viable && (
                  <Alert 
                    type={analysis.scattered.passes25Rule ? 'success' : 'warning'} 
                    title="25% Rule Check"
                  >
                    Land Basis: {formatCurrency(analysis.scattered.landBasis)} ({formatPercent(analysis.scattered.landBasisPercent)} of sale price)
                    <br />
                    Max Allowed: {formatCurrency(analysis.maxLandBasis)} (25% of avg sale price)
                  </Alert>
                )}
                
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <ResultCard
                    title="Max Offer Price"
                    value={formatCurrency(analysis.maxOffer)}
                    subtitle="To meet 25% rule with margin"
                  />
                  <ResultCard
                    title="Recommended Product"
                    value={PRODUCTS[analysis.recommendedProduct]?.name || '-'}
                    subtitle={`${PRODUCTS[analysis.recommendedProduct]?.sqFt} SF`}
                  />
                </div>
                
                {/* Scores */}
                <Section title="📈 Scoring Breakdown">
                  <ScoreBar score={analysis.scores.demographics} label="Demographics" />
                  <ScoreBar score={analysis.scores.income} label="Income Fit" />
                  <ScoreBar score={analysis.scores.comps} label="Comp Alignment" />
                  <ScoreBar score={analysis.scores.lot} label="Lot Characteristics" />
                  <ScoreBar score={analysis.scores.infrastructure} label="Infrastructure" />
                </Section>
                
                {/* Scattered Lot Analysis */}
                {analysis.scattered.viable && (
                  <Section title="🏠 Scattered Lot Analysis">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <ResultCard
                        title="Gross Profit"
                        value={formatCurrency(analysis.scattered.grossProfit)}
                        trend={parseFloat(((analysis.scattered.grossMargin - 0.18) / 0.18 * 100).toFixed(0))}
                      />
                      <ResultCard
                        title="ROI"
                        value={formatPercent(analysis.scattered.roi)}
                        trend={parseFloat(((analysis.scattered.roi - 0.20) / 0.20 * 100).toFixed(0))}
                      />
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-sm border border-gray-700">
                      <div className="grid grid-cols-2 gap-2 text-gray-300">
                        <div>Land Basis:</div><div className="text-right font-medium text-white">{formatCurrency(analysis.scattered.landBasis)}</div>
                        <div>Construction:</div><div className="text-right font-medium text-white">{formatCurrency(analysis.scattered.constructionCost)}</div>
                        <div>Total Project Cost:</div><div className="text-right font-medium text-white">{formatCurrency(analysis.scattered.totalProjectCost)}</div>
                        <div className="border-t border-gray-700 pt-2">Projected Sale:</div><div className="text-right font-medium border-t border-gray-700 pt-2 text-white">{formatCurrency(analysis.scattered.projectedSalePrice)}</div>
                        <div>Net Proceeds:</div><div className="text-right font-medium text-white">{formatCurrency(analysis.scattered.netProceeds)}</div>
                        <div className="font-semibold">Gross Profit:</div><div className="text-right font-bold text-green-400">{formatCurrency(analysis.scattered.grossProfit)}</div>
                      </div>
                    </div>
                  </Section>
                )}
                
                {/* Other Scenarios */}
                <Section title="🏗️ Other Development Scenarios" defaultOpen={false}>
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${analysis.subdivision.viable ? 'bg-green-900/30 border border-green-700' : 'bg-gray-800 border border-gray-700'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">Subdivision For-Sale</span>
                        <span className={analysis.subdivision.viable ? 'text-green-400' : 'text-gray-500'}>
                          {analysis.subdivision.viable ? 'Viable' : 'Not Viable (< 5 acres)'}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${analysis.btr.viable ? 'bg-green-900/30 border border-green-700' : 'bg-gray-800 border border-gray-700'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">Build-to-Rent</span>
                        <span className={analysis.btr.viable ? 'text-green-400' : 'text-gray-500'}>
                          {analysis.btr.viable ? 'Viable' : 'Not Viable'}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${analysis.lotDev.viable ? 'bg-green-900/30 border border-green-700' : 'bg-gray-800 border border-gray-700'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">Lot Development</span>
                        <span className={analysis.lotDev.viable ? 'text-green-400' : 'text-gray-500'}>
                          {analysis.lotDev.viable ? 'Viable' : 'Not Viable (< 5 acres)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Section>
                
                {/* Next Steps */}
                <Section title="✅ Next Steps">
                  <ul className="space-y-2">
                    {analysis.recommendation === 'PASS' ? (
                      <>
                        <li className="flex items-center text-red-400">
                          <span className="mr-2">✗</span>
                          Property does not meet investment criteria
                        </li>
                        <li className="flex items-center text-gray-400">
                          <span className="mr-2">ℹ</span>
                          Archive and move to next opportunity
                        </li>
                      </>
                    ) : analysis.recommendation === 'HOLD' ? (
                      <>
                        <li className="flex items-center text-yellow-400">
                          <span className="mr-2">⚠️</span>
                          Requires price negotiation or additional due diligence
                        </li>
                        <li className="flex items-center text-gray-400">
                          <span className="mr-2">ℹ</span>
                          Counter offer at {formatCurrency(analysis.maxOffer)} or below
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center text-green-400">
                          <span className="mr-2">✓</span>
                          Schedule site visit
                        </li>
                        <li className="flex items-center text-gray-400">
                          <span className="mr-2">ℹ</span>
                          Order title search and survey
                        </li>
                        <li className="flex items-center text-gray-400">
                          <span className="mr-2">ℹ</span>
                          Verify utility connections with municipality
                        </li>
                        <li className="flex items-center text-gray-400">
                          <span className="mr-2">ℹ</span>
                          Submit offer at {formatCurrency(Math.min(parseInt(askingPrice) || 0, analysis.maxOffer))}
                        </li>
                      </>
                    )}
                  </ul>
                </Section>
              </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Red Cedar Homes Deal Analyzer v1.0 | 25% Rule: Land + Prep ≤ 25% of Sale Price</p>
          <p className="mt-1">Target Markets: Nickeltown, Travelers Rest, Taylors, Greer</p>
        </div>
      </div>
    </div>
  );
}
