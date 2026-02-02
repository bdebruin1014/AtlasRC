// src/services/salesService.js
// Revenue and sales tracking service

import { isDemoMode } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

export const PROPERTY_TYPES = [
  { value: 'lot', label: 'Lot' },
  { value: 'home', label: 'Home' },
  { value: 'unit', label: 'Unit/Condo' },
  { value: 'commercial', label: 'Commercial' },
];

export const SALE_STATUSES = [
  { value: 'available', label: 'Available', color: 'bg-green-50 text-green-700 border-green-300' },
  { value: 'pending', label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { value: 'under_contract', label: 'Under Contract', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-300' },
];

export const FINANCING_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'conventional', label: 'Conventional' },
  { value: 'fha', label: 'FHA' },
  { value: 'va', label: 'VA' },
  { value: 'hard_money', label: 'Hard Money' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getStatusConfig(status) {
  return SALE_STATUSES.find(s => s.value === status) || SALE_STATUSES[0];
}

export function getPropertyTypeLabel(type) {
  return PROPERTY_TYPES.find(t => t.value === type)?.label || type;
}

export function calculateSalesTotals(sales) {
  const totalUnits = sales.length;
  const available = sales.filter(s => s.status === 'available').length;
  const pending = sales.filter(s => ['pending', 'under_contract'].includes(s.status)).length;
  const closed = sales.filter(s => s.status === 'closed').length;
  const cancelled = sales.filter(s => s.status === 'cancelled').length;

  const totalListPrice = sales.reduce((s, sale) => s + (sale.list_price || 0), 0);
  const totalSalePrice = sales.filter(s => s.sale_price).reduce((s, sale) => s + (sale.sale_price || 0), 0);
  const totalNetProceeds = sales.filter(s => s.status === 'closed').reduce((s, sale) => s + (sale.net_proceeds || 0), 0);
  const totalGrossProceeds = sales.filter(s => s.status === 'closed').reduce((s, sale) => s + (sale.gross_proceeds || 0), 0);

  const avgListPrice = totalUnits > 0 ? totalListPrice / totalUnits : 0;
  const avgSalePrice = closed > 0 ? totalSalePrice / (closed + pending) : 0;
  const absorption = closed > 0 ? closed / totalUnits : 0;

  const totalCommissions = sales.reduce((s, sale) => s + (sale.broker_commission || 0), 0);
  const totalClosingCosts = sales.reduce((s, sale) => s + (sale.closing_costs || 0), 0);
  const totalConcessions = sales.reduce((s, sale) => s + (sale.concessions || 0), 0);

  return {
    totalUnits, available, pending, closed, cancelled,
    totalListPrice, totalSalePrice, totalNetProceeds, totalGrossProceeds,
    avgListPrice, avgSalePrice, absorption,
    totalCommissions, totalClosingCosts, totalConcessions,
  };
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_SALES = [
  {
    id: 'sale-1', project_id: 'demo-project-1',
    unit_identifier: 'Lot 1', property_type: 'home',
    buyer_name: 'Johnson Family Trust',
    list_price: 425000, sale_price: 420000, price_psf: 210, square_footage: 2000,
    listing_date: '2025-06-01', contract_date: '2025-07-15', closing_date: '2025-08-30',
    actual_closing_date: '2025-08-28', status: 'closed',
    broker_commission: 12600, closing_costs: 8400, concessions: 5000,
    gross_proceeds: 420000, net_proceeds: 394000,
    buyer_financing_type: 'conventional', earnest_money: 10000, option_period_days: 10,
    notes: 'Smooth transaction. Buyer waived option period.',
  },
  {
    id: 'sale-2', project_id: 'demo-project-1',
    unit_identifier: 'Lot 2', property_type: 'home',
    buyer_name: 'Sarah Martinez',
    list_price: 445000, sale_price: 440000, price_psf: 215, square_footage: 2047,
    listing_date: '2025-06-01', contract_date: '2025-08-01', closing_date: '2025-09-15',
    actual_closing_date: '2025-09-12', status: 'closed',
    broker_commission: 13200, closing_costs: 8800, concessions: 0,
    gross_proceeds: 440000, net_proceeds: 418000,
    buyer_financing_type: 'conventional', earnest_money: 12000, option_period_days: 10,
  },
  {
    id: 'sale-3', project_id: 'demo-project-1',
    unit_identifier: 'Lot 3', property_type: 'home',
    buyer_name: 'Robert & Lisa Kim',
    list_price: 465000, sale_price: 462000, price_psf: 220, square_footage: 2100,
    listing_date: '2025-06-15', contract_date: '2025-08-20', closing_date: '2025-10-05',
    actual_closing_date: '2025-10-03', status: 'closed',
    broker_commission: 13860, closing_costs: 9240, concessions: 2500,
    gross_proceeds: 462000, net_proceeds: 436400,
    buyer_financing_type: 'fha', earnest_money: 8000, option_period_days: 14,
  },
  {
    id: 'sale-4', project_id: 'demo-project-1',
    unit_identifier: 'Lot 4', property_type: 'home',
    buyer_name: 'David Chen',
    list_price: 435000, sale_price: 435000, price_psf: 218, square_footage: 1995,
    listing_date: '2025-07-01', contract_date: '2025-09-10', closing_date: '2025-10-25',
    actual_closing_date: null, status: 'under_contract',
    broker_commission: 13050, closing_costs: 8700, concessions: 0,
    gross_proceeds: 435000, net_proceeds: 413250,
    buyer_financing_type: 'conventional', earnest_money: 15000, option_period_days: 10,
    notes: 'Full price offer. Closing scheduled for Oct 25.',
  },
  {
    id: 'sale-5', project_id: 'demo-project-1',
    unit_identifier: 'Lot 5', property_type: 'home',
    buyer_name: 'Thompson Estate LLC',
    list_price: 485000, sale_price: 478000, price_psf: 225, square_footage: 2124,
    listing_date: '2025-07-01', contract_date: '2025-10-01', closing_date: '2025-11-15',
    actual_closing_date: null, status: 'under_contract',
    broker_commission: 14340, closing_costs: 9560, concessions: 3000,
    gross_proceeds: 478000, net_proceeds: 451100,
    buyer_financing_type: 'cash', earnest_money: 25000, option_period_days: 7,
    notes: 'Cash buyer. Quick close expected.',
  },
  {
    id: 'sale-6', project_id: 'demo-project-1',
    unit_identifier: 'Lot 6', property_type: 'home',
    buyer_name: null,
    list_price: 450000, sale_price: null, price_psf: 212, square_footage: 2123,
    listing_date: '2025-08-01', contract_date: null, closing_date: null,
    actual_closing_date: null, status: 'pending',
    broker_commission: null, closing_costs: null, concessions: null,
    gross_proceeds: null, net_proceeds: null,
    buyer_financing_type: null, earnest_money: null, option_period_days: null,
    notes: 'Showing activity. Two offers expected this week.',
  },
  {
    id: 'sale-7', project_id: 'demo-project-1',
    unit_identifier: 'Lot 7', property_type: 'home',
    buyer_name: null,
    list_price: 455000, sale_price: null, price_psf: 215, square_footage: 2116,
    listing_date: '2025-08-15', contract_date: null, closing_date: null,
    actual_closing_date: null, status: 'available',
    broker_commission: null, closing_costs: null, concessions: null,
    gross_proceeds: null, net_proceeds: null,
    buyer_financing_type: null, earnest_money: null, option_period_days: null,
  },
  {
    id: 'sale-8', project_id: 'demo-project-1',
    unit_identifier: 'Lot 8', property_type: 'home',
    buyer_name: null,
    list_price: 470000, sale_price: null, price_psf: 220, square_footage: 2136,
    listing_date: '2025-09-01', contract_date: null, closing_date: null,
    actual_closing_date: null, status: 'available',
    broker_commission: null, closing_costs: null, concessions: null,
    gross_proceeds: null, net_proceeds: null,
    buyer_financing_type: null, earnest_money: null, option_period_days: null,
  },
  {
    id: 'sale-9', project_id: 'demo-project-1',
    unit_identifier: 'Lot 9', property_type: 'home',
    buyer_name: null,
    list_price: 460000, sale_price: null, price_psf: 218, square_footage: 2110,
    listing_date: null, contract_date: null, closing_date: null,
    actual_closing_date: null, status: 'available',
    broker_commission: null, closing_costs: null, concessions: null,
    gross_proceeds: null, net_proceeds: null,
    buyer_financing_type: null, earnest_money: null, option_period_days: null,
    notes: 'Under construction. Expected completion Dec 2025.',
  },
  {
    id: 'sale-10', project_id: 'demo-project-1',
    unit_identifier: 'Lot 10', property_type: 'home',
    buyer_name: 'Initial Buyer LLC',
    list_price: 440000, sale_price: 435000, price_psf: 210, square_footage: 2071,
    listing_date: '2025-06-01', contract_date: '2025-06-20', closing_date: '2025-08-01',
    actual_closing_date: null, status: 'cancelled',
    broker_commission: 13050, closing_costs: 8700, concessions: 0,
    gross_proceeds: null, net_proceeds: null,
    buyer_financing_type: 'hard_money', earnest_money: 5000, option_period_days: 14,
    notes: 'Buyer terminated during option period. Earnest money refunded. Back on market.',
  },
];

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function getProjectSales(projectId) {
  if (isDemoMode) {
    return DEMO_SALES.filter(s => s.project_id === projectId);
  }
}

export async function getSale(saleId) {
  if (isDemoMode) {
    return DEMO_SALES.find(s => s.id === saleId) || null;
  }
}

export async function createSale(projectId, data) {
  if (isDemoMode) {
    const sale = {
      id: `sale-${Date.now()}`,
      project_id: projectId,
      ...data,
      list_price: parseFloat(data.list_price) || 0,
      sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
      status: data.status || 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_SALES.push(sale);
    return sale;
  }
}

export async function updateSale(saleId, updates) {
  if (isDemoMode) {
    const idx = DEMO_SALES.findIndex(s => s.id === saleId);
    if (idx === -1) throw new Error('Sale not found');
    const sale = { ...DEMO_SALES[idx], ...updates, updated_at: new Date().toISOString() };
    // Calculate net proceeds
    if (sale.sale_price || sale.list_price) {
      sale.gross_proceeds = sale.sale_price || sale.list_price;
      sale.net_proceeds = sale.gross_proceeds
        - (parseFloat(sale.broker_commission) || 0)
        - (parseFloat(sale.closing_costs) || 0)
        - (parseFloat(sale.concessions) || 0);
    }
    DEMO_SALES[idx] = sale;
    return sale;
  }
}

export async function deleteSale(saleId) {
  if (isDemoMode) {
    const idx = DEMO_SALES.findIndex(s => s.id === saleId);
    if (idx !== -1) DEMO_SALES.splice(idx, 1);
    return true;
  }
}

export async function updateSaleStatus(saleId, newStatus) {
  if (isDemoMode) {
    const idx = DEMO_SALES.findIndex(s => s.id === saleId);
    if (idx === -1) throw new Error('Sale not found');
    DEMO_SALES[idx].status = newStatus;
    DEMO_SALES[idx].updated_at = new Date().toISOString();
    return DEMO_SALES[idx];
  }
}
