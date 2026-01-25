import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Settings, Globe, ArrowLeftRight, AlertTriangle, Clock, Plus, Edit2, History, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const MultiCurrencyPage = () => {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0000, isBase: true, balance: 4250000, lastUpdated: '2024-12-28 09:00' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.3542, isBase: false, balance: 185000, lastUpdated: '2024-12-28 09:00', change: -0.0023 },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', rate: 17.1250, isBase: false, balance: 450000, lastUpdated: '2024-12-28 09:00', change: 0.0185 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.9245, isBase: false, balance: 125000, lastUpdated: '2024-12-28 09:00', change: -0.0012 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.7892, isBase: false, balance: 45000, lastUpdated: '2024-12-28 09:00', change: 0.0008 },
  ];

  const recentTransactions = [
    { id: 'fx-1', date: '2024-12-27', type: 'conversion', from: 'USD', to: 'CAD', fromAmount: 50000, toAmount: 67710, rate: 1.3542, purpose: 'Canadian vendor payment' },
    { id: 'fx-2', date: '2024-12-26', type: 'receipt', currency: 'CAD', amount: 125000, usdEquivalent: 92285, rate: 1.3545, description: 'Canadian property sale proceeds' },
    { id: 'fx-3', date: '2024-12-24', type: 'conversion', from: 'USD', to: 'MXN', fromAmount: 25000, toAmount: 428125, rate: 17.1250, purpose: 'Mexico project funding' },
    { id: 'fx-4', date: '2024-12-22', type: 'payment', currency: 'EUR', amount: 45000, usdEquivalent: 48675, rate: 0.9245, description: 'International consulting fee' },
    { id: 'fx-5', date: '2024-12-20', type: 'receipt', currency: 'GBP', amount: 28000, usdEquivalent: 35480, rate: 0.7892, description: 'UK investor capital contribution' },
  ];

  const unrealizedGainLoss = [
    { currency: 'CAD', balance: 185000, bookRate: 1.3500, currentRate: 1.3542, bookValue: 137037, currentValue: 136599, gainLoss: -438 },
    { currency: 'MXN', balance: 450000, bookRate: 17.0000, currentRate: 17.1250, bookValue: 26471, currentValue: 26277, gainLoss: -194 },
    { currency: 'EUR', balance: 125000, bookRate: 0.9200, currentRate: 0.9245, bookValue: 135870, currentValue: 135209, gainLoss: -661 },
    { currency: 'GBP', balance: 45000, bookRate: 0.7850, currentRate: 0.7892, bookValue: 57325, currentValue: 57020, gainLoss: -305 },
  ];

  const totalUnrealizedLoss = unrealizedGainLoss.reduce((sum, item) => sum + item.gainLoss, 0);
  const totalForeignBalance = currencies.filter(c => !c.isBase).reduce((sum, c) => sum + (c.balance / c.rate), 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Multi-Currency Management</h1>
            <p className="text-sm text-gray-500">Manage foreign currency transactions and exchange rates</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Update Rates</Button>
            <Button variant="outline" size="sm"><History className="w-4 h-4 mr-1" />Rate History</Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowAddCurrency(true)}>
              <Plus className="w-4 h-4 mr-1" />Add Currency
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Base Currency Balance</span>
            </div>
            <p className="text-xl font-bold text-blue-700">${(currencies.find(c => c.isBase).balance / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-blue-600">USD</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-500">Foreign Currencies</span>
            </div>
            <p className="text-xl font-bold text-purple-700">{currencies.filter(c => !c.isBase).length}</p>
            <p className="text-xs text-purple-600">Active currencies</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowLeftRight className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-500">Foreign Holdings (USD)</span>
            </div>
            <p className="text-xl font-bold text-green-700">${(totalForeignBalance / 1000).toFixed(0)}K</p>
            <p className="text-xs text-green-600">Equivalent value</p>
          </div>
          <div className={cn("rounded-lg p-3", totalUnrealizedLoss >= 0 ? "bg-green-50" : "bg-red-50")}>
            <div className="flex items-center gap-2 mb-1">
              {totalUnrealizedLoss >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className="text-xs text-gray-500">Unrealized Gain/Loss</span>
            </div>
            <p className={cn("text-xl font-bold", totalUnrealizedLoss >= 0 ? "text-green-700" : "text-red-700")}>
              {totalUnrealizedLoss >= 0 ? '+' : ''}{totalUnrealizedLoss.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">MTD</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Last Rate Update</span>
            </div>
            <p className="text-sm font-medium">Dec 28, 2024</p>
            <p className="text-xs text-gray-500">9:00 AM EST</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Currency List */}
        <div className="w-80 border-r bg-white overflow-y-auto">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-medium text-sm">Active Currencies</h3>
          </div>
          {currencies.map((currency) => (
            <div
              key={currency.code}
              onClick={() => setSelectedCurrency(currency)}
              className={cn(
                "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                selectedCurrency?.code === currency.code && "bg-green-50 border-l-4 border-l-[#047857]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{currency.symbol}</span>
                  <div>
                    <p className="font-medium text-sm">{currency.code}</p>
                    <p className="text-xs text-gray-500">{currency.name}</p>
                  </div>
                </div>
                {currency.isBase && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Base</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Balance:</span>
                <span className="font-semibold">{currency.symbol}{currency.balance.toLocaleString()}</span>
              </div>
              {!currency.isBase && (
                <>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-500">Rate:</span>
                    <div className="flex items-center gap-1">
                      <span>{currency.rate.toFixed(4)}</span>
                      {currency.change !== undefined && (
                        <span className={cn("text-xs", currency.change >= 0 ? "text-green-600" : "text-red-600")}>
                          ({currency.change >= 0 ? '+' : ''}{currency.change.toFixed(4)})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-500">USD Value:</span>
                    <span className="font-medium">${(currency.balance / currency.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Right Panel */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Recent Transactions */}
          <div className="bg-white border rounded-lg mb-4">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Recent Foreign Currency Transactions</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Type</th>
                  <th className="text-left px-4 py-2 font-medium">Details</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-right px-4 py-2 font-medium">Rate</th>
                  <th className="text-right px-4 py-2 font-medium">USD Equivalent</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{txn.date}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        txn.type === 'conversion' ? "bg-purple-100 text-purple-700" :
                          txn.type === 'receipt' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {txn.type === 'conversion' ? (
                        <span>{txn.from} → {txn.to}: {txn.purpose}</span>
                      ) : (
                        <span>{txn.currency}: {txn.description}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {txn.type === 'conversion' ? (
                        <span>${txn.fromAmount.toLocaleString()} → {currencies.find(c => c.code === txn.to)?.symbol}{txn.toAmount.toLocaleString()}</span>
                      ) : (
                        <span className={txn.type === 'receipt' ? 'text-green-600' : 'text-gray-900'}>
                          {currencies.find(c => c.code === txn.currency)?.symbol}{txn.amount.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{txn.rate.toFixed(4)}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ${(txn.usdEquivalent || txn.fromAmount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unrealized Gain/Loss */}
          <div className="bg-white border rounded-lg">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Unrealized Foreign Currency Gain/Loss</h3>
              <Button variant="outline" size="sm">Post to GL</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Currency</th>
                  <th className="text-right px-4 py-2 font-medium">Balance</th>
                  <th className="text-right px-4 py-2 font-medium">Book Rate</th>
                  <th className="text-right px-4 py-2 font-medium">Current Rate</th>
                  <th className="text-right px-4 py-2 font-medium">Book Value (USD)</th>
                  <th className="text-right px-4 py-2 font-medium">Current Value (USD)</th>
                  <th className="text-right px-4 py-2 font-medium">Gain/(Loss)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {unrealizedGainLoss.map((item) => (
                  <tr key={item.currency} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{item.currency}</td>
                    <td className="px-4 py-3 text-right">{currencies.find(c => c.code === item.currency)?.symbol}{item.balance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{item.bookRate.toFixed(4)}</td>
                    <td className="px-4 py-3 text-right">{item.currentRate.toFixed(4)}</td>
                    <td className="px-4 py-3 text-right">${item.bookValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">${item.currentValue.toLocaleString()}</td>
                    <td className={cn("px-4 py-3 text-right font-semibold", item.gainLoss >= 0 ? "text-green-600" : "text-red-600")}>
                      {item.gainLoss >= 0 ? '+' : ''}{item.gainLoss.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-right font-semibold">Total Unrealized Gain/(Loss):</td>
                  <td className={cn("px-4 py-3 text-right font-bold", totalUnrealizedLoss >= 0 ? "text-green-600" : "text-red-600")}>
                    {totalUnrealizedLoss >= 0 ? '+' : ''}{totalUnrealizedLoss.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiCurrencyPage;
