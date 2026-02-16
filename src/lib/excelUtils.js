/**
 * Excel Import/Export Utilities for Pricing Library
 *
 * @fileoverview Provides functions to export pricing matrices to Excel
 * and import/validate pricing data from Excel files.
 *
 * Uses ExcelJS for better security (replaces xlsx which had vulnerabilities)
 *
 * @author AtlasDev
 * @version 2.0.0
 */

import ExcelJS from 'exceljs';

/**
 * Column header mapping for standard line item categories
 * Used for grouping and styling in exports
 */
const CATEGORY_COLORS = {
  sitework: 'E2F0D9',      // Light green
  foundation: 'FCE4D6',    // Light orange
  framing: 'DEEBF7',       // Light blue
  exterior: 'D9E1F2',      // Light purple
  mechanical: 'FFF2CC',    // Light yellow
  interior: 'DDD9C4',      // Light tan
  finishes: 'E2EFDA',      // Mint green
  sitecosts: 'D0CECE',     // Light gray
  softcosts: 'F4B084',     // Salmon
};

/**
 * Exports pricing data to Excel spreadsheet with formatting
 *
 * @param {Object} params - Export parameters
 * @param {Array<Object>} params.plans - Floor plans array with id, plan_code, plan_name, square_footage
 * @param {Array<Object>} params.lineItems - Line items array with id, item_code, item_name, category
 * @param {Object} params.pricingData - Map of planId -> { lineItemId -> cost }
 * @param {string} [params.filename] - Optional custom filename (defaults to Pricing_Matrix_YYYY-MM-DD.xlsx)
 * @returns {Promise<Object>} Download result
 */
export const exportPricingToExcel = async ({ plans, lineItems, pricingData, filename }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Atlas RC';
  workbook.created = new Date();

  // Create main pricing worksheet
  const ws = workbook.addWorksheet('Pricing Matrix', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  // Sort plans alphabetically by plan_code
  const sortedPlans = [...plans].sort((a, b) =>
    a.plan_code.localeCompare(b.plan_code)
  );

  // Build headers
  const headers = ['Item Code', 'Item Name', 'Category'];
  sortedPlans.forEach(plan => {
    headers.push(`${plan.plan_code} (${plan.square_footage || 0} SF)`);
  });

  // Add header row with styling
  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9D9D9' }
  };

  // Set column widths
  ws.columns = [
    { width: 15 },  // Item Code
    { width: 30 },  // Item Name
    { width: 12 },  // Category
    ...sortedPlans.map(() => ({ width: 18 }))
  ];

  // Group line items by category
  const groupedItems = groupLineItemsByCategory(lineItems);

  // Add data rows by category
  Object.entries(groupedItems).forEach(([category, items]) => {
    // Category header row
    const categoryRow = ws.addRow([category.toUpperCase(), '', '', ...sortedPlans.map(() => '')]);
    categoryRow.font = { bold: true };
    categoryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF' + (CATEGORY_COLORS[category] || 'EEEEEE') }
    };

    // Line item rows
    items.forEach(item => {
      const rowData = [
        item.item_code,
        item.item_name,
        item.category
      ];

      sortedPlans.forEach(plan => {
        const planPricing = pricingData[plan.id] || {};
        const cost = planPricing[item.id];
        rowData.push(cost !== undefined && cost !== null ? cost : 0);
      });

      const dataRow = ws.addRow(rowData);

      // Format currency columns
      for (let i = 4; i <= 3 + sortedPlans.length; i++) {
        dataRow.getCell(i).numFmt = '$#,##0.00';
      }
    });

    // Empty row after category
    ws.addRow([]);
  });

  // Add total row
  const totalRowData = ['TOTAL', '', ''];
  sortedPlans.forEach(plan => {
    const planPricing = pricingData[plan.id] || {};
    const total = Object.values(planPricing).reduce((sum, cost) =>
      sum + (typeof cost === 'number' ? cost : 0), 0
    );
    totalRowData.push(total);
  });
  const totalRow = ws.addRow(totalRowData);
  totalRow.font = { bold: true };
  for (let i = 4; i <= 3 + sortedPlans.length; i++) {
    totalRow.getCell(i).numFmt = '$#,##0.00';
  }

  // Add $/SF row
  const perSqftRowData = ['$/SF', '', ''];
  sortedPlans.forEach(plan => {
    const planPricing = pricingData[plan.id] || {};
    const total = Object.values(planPricing).reduce((sum, cost) =>
      sum + (typeof cost === 'number' ? cost : 0), 0
    );
    const perSqft = plan.square_footage ? total / plan.square_footage : 0;
    perSqftRowData.push(Math.round(perSqft * 100) / 100);
  });
  const perSqftRow = ws.addRow(perSqftRowData);
  perSqftRow.font = { bold: true };
  for (let i = 4; i <= 3 + sortedPlans.length; i++) {
    perSqftRow.getCell(i).numFmt = '$#,##0.00';
  }

  // Create summary worksheet
  const summaryWs = workbook.addWorksheet('Summary');
  summaryWs.addRow(['Floor Plan Summary']);
  summaryWs.addRow([]);

  const summaryHeaderRow = summaryWs.addRow(['Plan Code', 'Plan Name', 'Square Feet', 'Beds', 'Baths', 'Total Cost', '$/SF']);
  summaryHeaderRow.font = { bold: true };

  sortedPlans.forEach(plan => {
    const planPricing = pricingData[plan.id] || {};
    const total = Object.values(planPricing).reduce((sum, cost) =>
      sum + (typeof cost === 'number' ? cost : 0), 0
    );
    const perSqft = plan.square_footage ? total / plan.square_footage : 0;

    const row = summaryWs.addRow([
      plan.plan_code,
      plan.plan_name,
      plan.square_footage || 0,
      plan.bedrooms || 0,
      plan.bathrooms || 0,
      total,
      Math.round(perSqft * 100) / 100
    ]);
    row.getCell(6).numFmt = '$#,##0.00';
    row.getCell(7).numFmt = '$#,##0.00';
  });

  summaryWs.columns = [
    { width: 12 },
    { width: 20 },
    { width: 12 },
    { width: 8 },
    { width: 8 },
    { width: 14 },
    { width: 10 }
  ];

  // Generate filename and download
  const date = new Date().toISOString().split('T')[0];
  const exportFilename = filename || `Pricing_Matrix_${date}.xlsx`;

  // Create buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFilename;
  link.click();
  window.URL.revokeObjectURL(url);

  return {
    success: true,
    filename: exportFilename,
    planCount: plans.length,
    lineItemCount: lineItems.length
  };
};

/**
 * Parses an Excel file and extracts pricing data
 *
 * @param {File} file - Excel file object from file input
 * @returns {Promise<Object>} Parsed pricing data
 */
export const parsePricingExcel = async (file) => {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  // Get the first sheet
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) {
    throw new Error('Excel file appears to be empty');
  }

  const sheetName = worksheet.name;
  const rows = [];

  worksheet.eachRow((row, rowNumber) => {
    rows.push(row.values.slice(1)); // Remove first empty element
  });

  if (rows.length < 2) {
    throw new Error('Excel file appears to be empty or missing headers');
  }

  // Parse headers (first row)
  const headers = rows[0];

  // Extract plan codes from headers (columns D onwards)
  const planCodes = [];
  const planColumnMap = {};

  for (let i = 3; i < headers.length; i++) {
    const header = headers[i];
    if (header) {
      const match = String(header).match(/^([A-Za-z0-9_-]+)/);
      if (match) {
        const planCode = match[1].toUpperCase();
        planCodes.push(planCode);
        planColumnMap[planCode] = i;
      }
    }
  }

  // Parse data rows
  const dataRows = [];
  let currentCategory = '';

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];

    if (!row || row.length === 0 || !row[0]) continue;

    const firstCell = String(row[0]).trim();

    // Check if this is a category header
    if (firstCell === firstCell.toUpperCase() && !row[1] && firstCell.length > 2) {
      currentCategory = firstCell.toLowerCase();
      continue;
    }

    // Skip subtotal and total rows
    if (firstCell.toLowerCase().includes('subtotal') ||
        firstCell.toLowerCase() === 'total' ||
        firstCell.toLowerCase() === '$/sf') {
      continue;
    }

    // Parse pricing row
    const itemCode = firstCell;
    const itemName = row[1] ? String(row[1]).trim() : '';
    const category = row[2] ? String(row[2]).trim().toLowerCase() : currentCategory;

    // Extract prices for each plan
    const prices = {};
    planCodes.forEach(planCode => {
      const colIndex = planColumnMap[planCode];
      const value = row[colIndex];
      if (value !== undefined && value !== null && value !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          prices[planCode] = numValue;
        }
      }
    });

    if (Object.keys(prices).length > 0 || itemCode) {
      dataRows.push({
        itemCode,
        itemName,
        category,
        prices
      });
    }
  }

  return {
    planCodes,
    rows: dataRows,
    metadata: {
      sheetName,
      totalSheets: workbook.worksheets.length,
      rowCount: dataRows.length,
      planCount: planCodes.length
    }
  };
};

/**
 * Validates parsed import data against existing plans and line items
 */
export const validatePricingImport = (parsedData, existingPlans, existingLineItems) => {
  const errors = [];
  const warnings = [];

  // Create lookup maps
  const planByCode = {};
  existingPlans.forEach(plan => {
    planByCode[plan.plan_code.toUpperCase()] = plan;
  });

  const itemByCode = {};
  existingLineItems.forEach(item => {
    itemByCode[item.item_code.toUpperCase()] = item;
  });

  // Match plans
  const matchedPlans = [];
  const unmatchedPlans = [];

  parsedData.planCodes.forEach(code => {
    const upperCode = code.toUpperCase();
    if (planByCode[upperCode]) {
      matchedPlans.push(planByCode[upperCode]);
    } else {
      unmatchedPlans.push(code);
    }
  });

  if (matchedPlans.length === 0) {
    errors.push('No matching floor plans found in the import file');
  }

  if (unmatchedPlans.length > 0) {
    warnings.push(`${unmatchedPlans.length} plan(s) in file not found in database: ${unmatchedPlans.join(', ')}`);
  }

  // Match line items and calculate changes
  const matchedItems = [];
  const unmatchedItems = [];
  const changes = [];

  parsedData.rows.forEach(row => {
    const upperCode = row.itemCode.toUpperCase();
    const existingItem = itemByCode[upperCode];

    if (existingItem) {
      matchedItems.push({
        ...existingItem,
        importData: row
      });

      Object.entries(row.prices).forEach(([planCode, newValue]) => {
        const plan = planByCode[planCode.toUpperCase()];
        if (plan) {
          changes.push({
            planId: plan.id,
            planCode: plan.plan_code,
            lineItemId: existingItem.id,
            itemCode: existingItem.item_code,
            itemName: existingItem.item_name,
            oldValue: null,
            newValue: newValue
          });
        }
      });
    } else if (row.itemCode && row.itemCode !== '') {
      unmatchedItems.push(row.itemCode);
    }
  });

  if (matchedItems.length === 0) {
    errors.push('No matching line items found in the import file');
  }

  if (unmatchedItems.length > 0) {
    warnings.push(`${unmatchedItems.length} line item(s) in file not found in database: ${unmatchedItems.slice(0, 5).join(', ')}${unmatchedItems.length > 5 ? '...' : ''}`);
  }

  // Validate pricing values
  changes.forEach(change => {
    if (change.newValue < 0) {
      errors.push(`Negative price found: ${change.itemCode} for ${change.planCode}`);
    }
    if (change.newValue > 10000000) {
      warnings.push(`Unusually high price: $${change.newValue.toLocaleString()} for ${change.itemCode} on ${change.planCode}`);
    }
  });

  return {
    valid: errors.length === 0,
    matchedPlans,
    unmatchedPlans,
    matchedItems,
    unmatchedItems,
    changes,
    errors,
    warnings,
    summary: {
      totalPlansInFile: parsedData.planCodes.length,
      matchedPlansCount: matchedPlans.length,
      totalItemsInFile: parsedData.rows.length,
      matchedItemsCount: matchedItems.length,
      changesCount: changes.length
    }
  };
};

/**
 * Groups line items by category for organized display
 * @private
 */
const groupLineItemsByCategory = (lineItems) => {
  const groups = {};
  const categoryOrder = [
    'sitework', 'foundation', 'framing', 'exterior',
    'mechanical', 'interior', 'finishes', 'sitecosts', 'softcosts'
  ];

  categoryOrder.forEach(cat => {
    groups[cat] = [];
  });
  groups['other'] = [];

  lineItems.forEach(item => {
    const cat = (item.category || 'other').toLowerCase();
    if (groups[cat]) {
      groups[cat].push(item);
    } else {
      groups['other'].push(item);
    }
  });

  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
};

/**
 * Creates a template Excel file for importing pricing data
 */
export const downloadPricingTemplate = async ({ plans, lineItems, filename }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Atlas RC';

  const ws = workbook.addWorksheet('Pricing Template');

  const sortedPlans = [...plans].sort((a, b) =>
    a.plan_code.localeCompare(b.plan_code)
  );

  // Headers
  const headers = ['Item Code', 'Item Name', 'Category', ...sortedPlans.map(p => p.plan_code)];
  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true };

  // Data rows
  lineItems.forEach(item => {
    ws.addRow([item.item_code, item.item_name, item.category || '', ...sortedPlans.map(() => '')]);
  });

  // Set column widths
  ws.columns = [
    { width: 15 },
    { width: 30 },
    { width: 12 },
    ...sortedPlans.map(() => ({ width: 15 }))
  ];

  // Instructions sheet
  const instructionsWs = workbook.addWorksheet('Instructions');
  [
    ['Pricing Import Template Instructions'],
    [''],
    ['1. Fill in pricing values for each line item under the appropriate plan column'],
    ['2. Leave cells empty if no price change is needed'],
    ['3. Use numbers only (no currency symbols) - e.g., 5000 not $5,000'],
    ['4. Item Codes must match exactly (case-insensitive)'],
    ['5. Plan codes in headers must match existing plans'],
    ['6. Save as .xlsx format before importing'],
    [''],
    ['Column Reference:'],
    ['A - Item Code (required, must match database)'],
    ['B - Item Name (for reference only)'],
    ['C - Category (for reference only)'],
    ['D+ - Plan pricing columns']
  ].forEach(row => instructionsWs.addRow(row));
  instructionsWs.getColumn(1).width = 80;

  const templateFilename = filename || 'Pricing_Import_Template.xlsx';

  // Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = templateFilename;
  link.click();
  window.URL.revokeObjectURL(url);

  return { success: true, filename: templateFilename };
};

export default {
  exportPricingToExcel,
  parsePricingExcel,
  validatePricingImport,
  downloadPricingTemplate
};
