// AtlasDev - Pipeline Deal Analyzer
import React, { useState, useMemo } from 'react';
import { CurrencyInput, NumberInput, TextInput, PercentInput, MetricCard, TabNavigation, ActionButtons } from './ui/BudgetComponents';
import { formatCurrency, formatPercent, generateId } from '../utils/budgetCalculations';

export const PipelineDealAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('inputs');
  const [projectInfo, setProjectInfo] = useState({ projectName: '', address: '', parcelNumber: '', homeType: 'SFH', units: 1 });
  const [planSelection, setPlanSelection] = useState({ planName: 'Cherry', sqFt: 2214, bedsBaths: '4/3', upgradePackage: 'Classic' });
  const [acquisition, setAcquisition] = useState({ landPrice: 38750, closingCostRate: 0.015, acquisitionFeeRate: 0.03, ddFee: 500, phcFees: 2500 });
  const [site, setSite] = useState({ grading: 5000, utilities: 3000, driveway: 2500, treeRemoval: 1500, other: 1375 });
  const [vertical, setVertical] = useState({ sticksAndBricks: 152346, softCosts: 3650, upgrades: 5000, builderProfitRate: 0.20 });
  const [financing, setFinancing] = useState({ ltcRate: 0.90, interestRate: 0.1025, termMonths: 7, originationRate: 0.01 });
  const [sales, setSales] = useState({ salePrice: 405000, commissionRate: 0.05, closingCostRate: 0.005, incentives: 5000 });

  const metrics = useMemo(() => {
    const closingCosts = acquisition.landPrice * acquisition.closingCostRate;
    const acquisitionFee = acquisition.landPrice * acquisition.acquisitionFeeRate;
    const totalAcquisition = acquisition.landPrice + closingCosts + acquisitionFee + acquisition.ddFee + acquisition.phcFees;
    const totalSite = site.grading + site.utilities + site.driveway + site.treeRemoval + site.other;
    const builderProfit = vertical.sticksAndBricks * vertical.builderProfitRate;
    const totalVertical = vertical.sticksAndBricks + vertical.softCosts + vertical.upgrades + builderProfit;
    const totalHardCosts = totalAcquisition + totalSite + totalVertical;
    const loanAmount = totalHardCosts * financing.ltcRate;
    const origination = loanAmount * financing.originationRate;
    const interestReserve = loanAmount * (financing.interestRate / 12) * financing.termMonths;
    const totalFinancing = origination + interestReserve;
    const totalProjectCost = totalHardCosts + totalFinancing;
    const requiredEquity = totalHardCosts * (1 - financing.ltcRate);
    const commission = sales.salePrice * sales.commissionRate;
    const sellerClosing = sales.salePrice * sales.closingCostRate;
    const netProceeds = sales.salePrice - commission - sellerClosing - sales.incentives;
    const grossProfit = netProceeds - totalProjectCost;
    const grossMargin = sales.salePrice > 0 ? grossProfit / sales.salePrice : 0;
    const roi = requiredEquity > 0 ? grossProfit / requiredEquity : 0;
    const cashMultiple = requiredEquity > 0 ? (requiredEquity + grossProfit) / requiredEquity : 0;
    const costPerSF = planSelection.sqFt > 0 ? totalProjectCost / planSelection.sqFt : 0;
    const salePricePerSF = planSelection.sqFt > 0 ? sales.salePrice / planSelection.sqFt : 0;

    return { totalAcquisition, totalSite, builderProfit, totalVertical, totalHardCosts, loanAmount, origination, interestReserve, totalFinancing, totalProjectCost, requiredEquity, commission, sellerClosing, netProceeds, grossProfit, grossMargin, roi, cashMultiple, costPerSF, salePricePerSF };
  }, [acquisition, site, vertical, financing, sales, planSelection]);

  const tabs = [{ id: 'inputs', label: 'Deal Inputs' }, { id: 'analysis', label: 'Analysis' }];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">PIPELINE DEAL ANALYZER</h1>
            <p className="text-slate-300 text-sm">Single Deal Acquisition & Proforma Analysis</p>
          </div>
          <ActionButtons onSave={() => console.log('Save budget')} onPrint={() => window.print()} />
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 px-6">
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="p-6">
        {activeTab === 'inputs' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b">Project Information</h3>
                <div className="space-y-3">
                  <TextInput label="Project Name" value={projectInfo.projectName} onChange={(v) => setProjectInfo(p => ({ ...p, projectName: v }))} placeholder="Enter name..." />
                  <TextInput label="Address" value={projectInfo.address} onChange={(v) => setProjectInfo(p => ({ ...p, address: v }))} />
                  <TextInput label="Parcel #" value={projectInfo.parcelNumber} onChange={(v) => setProjectInfo(p => ({ ...p, parcelNumber: v }))} />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b">Plan Selection</h3>
                <div className="space-y-3">
                  <TextInput label="Plan Name" value={planSelection.planName} onChange={(v) => setPlanSelection(p => ({ ...p, planName: v }))} />
                  <NumberInput label="Heated SF" value={planSelection.sqFt} onChange={(v) => setPlanSelection(p => ({ ...p, sqFt: v }))} />
                  <TextInput label="Bed/Bath" value={planSelection.bedsBaths} onChange={(v) => setPlanSelection(p => ({ ...p, bedsBaths: v }))} />
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 space-y-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="font-semibold text-slate-800">Acquisition Costs</h3>
                  <span className="font-mono text-sm font-semibold text-emerald-600">{formatCurrency(metrics.totalAcquisition)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CurrencyInput label="Lot/Land Price" value={acquisition.landPrice} onChange={(v) => setAcquisition(p => ({ ...p, landPrice: v }))} />
                  <PercentInput label="Closing Costs" value={acquisition.closingCostRate} onChange={(v) => setAcquisition(p => ({ ...p, closingCostRate: v }))} />
                  <PercentInput label="Acquisition Fee" value={acquisition.acquisitionFeeRate} onChange={(v) => setAcquisition(p => ({ ...p, acquisitionFeeRate: v }))} />
                  <CurrencyInput label="Due Diligence" value={acquisition.ddFee} onChange={(v) => setAcquisition(p => ({ ...p, ddFee: v }))} />
                  <CurrencyInput label="PHC Fees" value={acquisition.phcFees} onChange={(v) => setAcquisition(p => ({ ...p, phcFees: v }))} />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="font-semibold text-slate-800">Site Work</h3>
                  <span className="font-mono text-sm font-semibold text-emerald-600">{formatCurrency(metrics.totalSite)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CurrencyInput label="Grading/Lot Prep" value={site.grading} onChange={(v) => setSite(p => ({ ...p, grading: v }))} />
                  <CurrencyInput label="Utility Connections" value={site.utilities} onChange={(v) => setSite(p => ({ ...p, utilities: v }))} />
                  <CurrencyInput label="Driveway" value={site.driveway} onChange={(v) => setSite(p => ({ ...p, driveway: v }))} />
                  <CurrencyInput label="Tree Removal" value={site.treeRemoval} onChange={(v) => setSite(p => ({ ...p, treeRemoval: v }))} />
                  <CurrencyInput label="Other" value={site.other} onChange={(v) => setSite(p => ({ ...p, other: v }))} />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="font-semibold text-slate-800">Vertical Construction</h3>
                  <span className="font-mono text-sm font-semibold text-emerald-600">{formatCurrency(metrics.totalVertical)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CurrencyInput label="Sticks & Bricks" value={vertical.sticksAndBricks} onChange={(v) => setVertical(p => ({ ...p, sticksAndBricks: v }))} />
                  <CurrencyInput label="Soft Costs" value={vertical.softCosts} onChange={(v) => setVertical(p => ({ ...p, softCosts: v }))} />
                  <CurrencyInput label="Upgrades" value={vertical.upgrades} onChange={(v) => setVertical(p => ({ ...p, upgrades: v }))} />
                  <PercentInput label="Builder Profit" value={vertical.builderProfitRate} onChange={(v) => setVertical(p => ({ ...p, builderProfitRate: v }))} />
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="font-semibold text-slate-800">Financing</h3>
                  <span className="font-mono text-sm font-semibold text-emerald-600">{formatCurrency(metrics.totalFinancing)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <PercentInput label="LTC Ratio" value={financing.ltcRate} onChange={(v) => setFinancing(p => ({ ...p, ltcRate: v }))} />
                  <PercentInput label="Interest Rate" value={financing.interestRate} onChange={(v) => setFinancing(p => ({ ...p, interestRate: v }))} />
                  <NumberInput label="Term (Months)" value={financing.termMonths} onChange={(v) => setFinancing(p => ({ ...p, termMonths: v }))} />
                  <PercentInput label="Origination" value={financing.originationRate} onChange={(v) => setFinancing(p => ({ ...p, originationRate: v }))} />
                </div>
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Loan Amount:</span><span className="font-mono">{formatCurrency(metrics.loanAmount)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Interest Reserve:</span><span className="font-mono">{formatCurrency(metrics.interestReserve)}</span></div>
                  <div className="flex justify-between text-sm font-semibold"><span className="text-slate-700">Required Equity:</span><span className="font-mono text-amber-600">{formatCurrency(metrics.requiredEquity)}</span></div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b">Sales Projections</h3>
                <div className="space-y-3">
                  <CurrencyInput label="Projected Sale Price" value={sales.salePrice} onChange={(v) => setSales(p => ({ ...p, salePrice: v }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <PercentInput label="Commission" value={sales.commissionRate} onChange={(v) => setSales(p => ({ ...p, commissionRate: v }))} />
                    <PercentInput label="Closing Costs" value={sales.closingCostRate} onChange={(v) => setSales(p => ({ ...p, closingCostRate: v }))} />
                  </div>
                  <CurrencyInput label="Buyer Incentives" value={sales.incentives} onChange={(v) => setSales(p => ({ ...p, incentives: v }))} />
                </div>
              </div>

              <div className={`rounded-lg border p-4 ${metrics.grossProfit > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className={`font-semibold mb-3 ${metrics.grossProfit > 0 ? 'text-emerald-800' : 'text-red-800'}`}>Deal Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Total Project Cost:</span><span className="font-mono font-semibold">{formatCurrency(metrics.totalProjectCost)}</span></div>
                  <div className="flex justify-between text-sm"><span>Net Proceeds:</span><span className="font-mono font-semibold">{formatCurrency(metrics.netProceeds)}</span></div>
                  <div className={`flex justify-between text-lg font-bold pt-2 border-t ${metrics.grossProfit > 0 ? 'border-emerald-300 text-emerald-700' : 'border-red-300 text-red-700'}`}>
                    <span>Gross Profit:</span><span className="font-mono">{formatCurrency(metrics.grossProfit)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Key Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <MetricCard label="Total Project Cost" value={metrics.totalProjectCost} />
                  <MetricCard label="Net Proceeds" value={metrics.netProceeds} />
                  <MetricCard label="Gross Profit" value={metrics.grossProfit} trend={metrics.grossProfit > 0 ? 'up' : 'down'} />
                  <MetricCard label="Gross Margin" value={metrics.grossMargin} format="percent" />
                  <MetricCard label="Return on Equity" value={metrics.roi} format="percent" trend={metrics.roi > 0.25 ? 'up' : 'neutral'} />
                  <MetricCard label="Cash Multiple" value={metrics.cashMultiple} format="multiple" />
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Cost Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Acquisition', value: metrics.totalAcquisition, color: 'bg-blue-500' },
                    { label: 'Site Work', value: metrics.totalSite, color: 'bg-orange-500' },
                    { label: 'Vertical Construction', value: metrics.totalVertical, color: 'bg-emerald-500' },
                    { label: 'Financing', value: metrics.totalFinancing, color: 'bg-purple-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <div className="w-32 text-sm text-slate-600">{item.label}</div>
                      <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
                        <div className={`h-full ${item.color} rounded`} style={{ width: `${(item.value / metrics.totalProjectCost) * 100}%` }} />
                      </div>
                      <div className="w-24 text-right font-mono text-sm">{formatCurrency(item.value)}</div>
                      <div className="w-12 text-right font-mono text-xs text-slate-500">{formatPercent(item.value / metrics.totalProjectCost)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">Per Square Foot Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Cost Per SF</div>
                    <div className="text-xl font-mono font-bold text-slate-800">{formatCurrency(metrics.costPerSF, { showCents: true })}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Sale Price Per SF</div>
                    <div className="text-xl font-mono font-bold text-slate-800">{formatCurrency(metrics.salePricePerSF, { showCents: true })}</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <div className="text-xs text-emerald-600">Profit Per SF</div>
                    <div className="text-xl font-mono font-bold text-emerald-700">{formatCurrency(metrics.grossProfit / planSelection.sqFt, { showCents: true })}</div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="text-xs text-amber-600">Equity Per SF</div>
                    <div className="text-xl font-mono font-bold text-amber-700">{formatCurrency(metrics.requiredEquity / planSelection.sqFt, { showCents: true })}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineDealAnalyzer;
