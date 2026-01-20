/**
 * Excel Import/Export Utilities for Pricing Library
 * 
 * @fileoverview Provides functions to export pricing matrices to Excel
 * and import/validate pricing data from Excel files.
 * 
 * Requires: npm install xlsx
 * 
 * @author AtlasDev
 * @version 1.0.0
 */

import * as XLSX from 'xlsx';

/**
 * Column header mapping for standard line item categories
 * Used for grouping and styling in exports
 */
const CATEGORY_COLORS = {
  sitework: 'FFE2F0D9',      // Light green
  foundation: 'FFFCE4D6',    // Light orange
  framing: 'FFDEEBF7',       // Light blue
  exterior: 'FFD9E1F2',      // Light purple
  mechanical: 'FFFFF2CC',    // Light yellow
  interior: 'FFDDD9C4',      // Light tan
  finishes: 'FFE2EFDA',      // Mint green
  sitecosts: 'FFD0CECE',     // Light gray
  softcosts: 'FFF4B084',     // Salmon
};

/**
 * Exports pricing data to Excel spreadsheet with formatting
 * 
 * @param {Object} params - Export parameters
 * @param {Array<Object>} params.plans - Floor plans array with id, plan_code, plan_name, square_footage
 * @param {Array<Object>} params.lineItems - Line items array with id, item_code, item_name, category
 * @param {Object} params.pricingData - Map of planId -> { lineItemId -> cost }
 * @param {string} [params.filename] - Optional custom filename (defaults to Pricing_Matrix_YYYY-MM-DD.xlsx)
 * @returns {void} Downloads the Excel file
 * 
 * @example
 * exportPricingToExcel({
 *   plans: [{ id: '1', plan_code: 'ATLAS', plan_name: 'Atlas', square_footage: 1554 }],
 *   lineItems: [{ id: '1', item_code: 'LBR_FRAME', item_name: 'Lumber - Framing', category: 'framing' }],
 *   pricingData: { '1': { '1': 6740.29 } }
 * });
 */
export const exportPricingToExcel = ({ plans, lineItems, pricingData, filename }) => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Build the data matrix
  const headers = ['Item Code', 'Item Name', 'Category'];
  
  // Sort plans alphabetically by plan_code
  const sortedPlans = [...plans].sort((a, b) => 
    a.plan_code.localeCompare(b.plan_code)
  );
  
  // Add plan columns (plan_code as header with sqft in parentheses)
  sortedPlans.forEach(plan => {
    headers.push(`${plan.plan_code} (${plan.square_footage || 0} SF)`);
  });
  
  // Group line items by category for better organization
  const groupedItems = groupLineItemsByCategory(lineItems);
  
  // Build rows
  const rows = [headers];
  
  // Track row indices for category subtotals
  let currentRow = 1;
  const categorySubtotals = {};
  
  Object.entries(groupedItems).forEach(([category, items]) => {
    // Category header row
    const categoryRow = [category.toUpperCase(), '', ''];
    sortedPlans.forEach(() => categoryRow.push(''));
    rows.push(categoryRow);
    currentRow++;
    
    const categoryStartRow = currentRow + 1;
    
    items.forEach(item => {
      const row = [
        item.item_code,
        item.item_name,
        item.category
      ];
      
      // Add pricing for each plan
      sortedPlans.forEach(plan => {
        const planPricing = pricingData[plan.id] || {};
        const cost = planPricing[item.id];
        row.push(cost !== undefined && cost !== null ? cost : 0);
      });
      
      rows.push(row);
      currentRow++;
    });
    
    categorySubtotals[category] = {
      startRow: categoryStartRow,
      endRow: currentRow
    };
    
    // Empty row after category
    const emptyRow = ['', '', ''];
    sortedPlans.forEach(() => emptyRow.push(''));
    rows.push(emptyRow);
    currentRow++;
  });
  
  // Add grand total row
  const totalRow = ['TOTAL', '', ''];
  sortedPlans.forEach((plan, planIndex) => {
    // Sum all pricing for this plan
    const planPricing = pricingData[plan.id] || {};
    const total = Object.values(planPricing).reduce((sum, cost) => 
      sum + (typeof cost === 'number' ? cost : 0), 0
    );
    totalRow.push(total);
  });
  rows.push(totalRow);
  
  // Add per-sqft row
  const perSqftRow = ['$/SF', '', ''];
  sortedPlans.forEach((plan, planIndex) => {
    const planPricing = pricingData[plan.id] || {};
    const total = Object.values(planPricing).reduce((sum, cost) => 
      sum + (typeof cost === 'number' ? cost : 0), 0
    );
    const perSqft = plan.square_footage ? total / plan.square_footage : 0;
    perSqftRow.push(Math.round(perSqft * 100) / 100);
  });
  rows.push(perSqftRow);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);
  
  // Set column widths
  const colWidths = [
    { wch: 15 },  // Item Code
    { wch: 30 },  // Item Name
    { wch: 12 },  // Category
  ];
  sortedPlans.forEach(() => colWidths.push({ wch: 18 }));
  ws['!cols'] = colWidths;
  
  // Freeze first row (headers)
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  
  // Apply number formatting for currency columns (D onwards)
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = 1; R <= range.e.r; R++) {
    for (let C = 3; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
        ws[cellRef].z = '$#,##0.00';
      }
    }
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Pricing Matrix');
  
  // Add summary sheet with plan details
  const summaryData = [
    ['Floor Plan Summary', '', '', '', '', ''],
    [''],
    ['Plan Code', 'Plan Name', 'Square Feet', 'Beds', 'Baths', 'Total Cost', '$/SF']
  ];
  
  sortedPlans.forEach(plan => {
    const planPricing = pricingData[plan.id] || {};
    const total = Object.values(planPricing).reduce((sum, cost) => 
      sum + (typeof cost === 'number' ? cost : 0), 0
    );
    const perSqft = plan.square_footage ? total / plan.square_footage : 0;
    
    summaryData.push([
      plan.plan_code,
      plan.plan_name,
      plan.square_footage || 0,
      plan.bedrooms || 0,
      plan.bathrooms || 0,
      total,
      Math.round(perSqft * 100) / 100
    ]);
  });
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs['!cols'] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 12 },
    { wch: 8 },
    { wch: 8 },
    { wch: 14 },
    { wch: 10 }
  ];
  
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Generate filename
  const date = new Date().toISOString().split('T')[0];
  const exportFilename = filename || `Pricing_Matrix_${date}.xlsx`;
  
  // Download file
  XLSX.writeFile(wb, exportFilename);
  
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
 * @returns {Array<string>} returns.planCodes - Array of plan codes from headers
 * @returns {Array<Object>} returns.rows - Array of { itemCode, itemName, category, prices: { planCode: cost } }
 * @returns {Object} returns.metadata - File metadata (sheet names, row count, etc.)
 * 
 * @example
 * const fileInput = document.querySelector('input[type="file"]');
 * const result = await parsePricingExcel(fileInput.files[0]);
 * console.log(result.planCodes); // ['ATLAS', 'CHERRY', ...]
 */
export const parsePricingExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet (Pricing Matrix)
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON (array of arrays)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          reject(new Error('Excel file appears to be empty or missing headers'));
          return;
        }
        
        // Parse headers (first row)
        const headers = jsonData[0];
        
        // Extract plan codes from headers (columns D onwards)
        // Headers format: "PLAN_CODE (SQFT SF)" or just "PLAN_CODE"
        const planCodes = [];
        const planColumnMap = {}; // planCode -> column index
        
        for (let i = 3; i < headers.length; i++) {
          const header = headers[i];
          if (header) {
            // Extract plan code (before parentheses if present)
            const match = String(header).match(/^([A-Za-z0-9_-]+)/);
            if (match) {
              const planCode = match[1].toUpperCase();
              planCodes.push(planCode);
              planColumnMap[planCode] = i;
            }
          }
        }
        
        // Parse data rows
        const rows = [];
        let currentCategory = '';
        
        for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
          const row = jsonData[rowIndex];
          
          // Skip empty rows
          if (!row || row.length === 0 || !row[0]) continue;
          
          const firstCell = String(row[0]).trim();
          
          // Check if this is a category header (all caps, no item name)
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
          
          // Only add row if it has at least one price
          if (Object.keys(prices).length > 0 || itemCode) {
            rows.push({
              itemCode,
              itemName,
              category,
              prices
            });
          }
        }
        
        resolve({
          planCodes,
          rows,
          metadata: {
            sheetName,
            totalSheets: workbook.SheetNames.length,
            rowCount: rows.length,
            planCount: planCodes.length
          }
        });
        
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validates parsed import data against existing plans and line items
 * 
 * @param {Object} parsedData - Output from parsePricingExcel()
 * @param {Array<Object>} existingPlans - Array of existing floor plans from database
 * @param {Array<Object>} existingLineItems - Array of existing line items from database
 * @returns {Object} Validation result
 * @returns {boolean} returns.valid - Whether the import is valid
 * @returns {Array<Object>} returns.matchedPlans - Plans found in both import and database
 * @returns {Array<string>} returns.unmatchedPlans - Plan codes in import but not in database
 * @returns {Array<Object>} returns.matchedItems - Line items matched by code
 * @returns {Array<string>} returns.unmatchedItems - Item codes in import but not in database
 * @returns {Array<Object>} returns.changes - Array of { planId, lineItemId, oldValue, newValue }
 * @returns {Array<Object>} returns.errors - Array of validation error messages
 * 
 * @example
 * const validation = validatePricingImport(parsedData, plans, lineItems);
 * if (validation.valid) {
 *   // Proceed with import
 * }
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
      
      // Calculate changes for each matched plan
      Object.entries(row.prices).forEach(([planCode, newValue]) => {
        const plan = planByCode[planCode.toUpperCase()];
        if (plan) {
          changes.push({
            planId: plan.id,
            planCode: plan.plan_code,
            lineItemId: existingItem.id,
            itemCode: existingItem.item_code,
            itemName: existingItem.item_name,
            oldValue: null, // Will be filled in by caller with current DB value
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
    'sitework',
    'foundation', 
    'framing',
    'exterior',
    'mechanical',
    'interior',
    'finishes',
    'sitecosts',
    'softcosts'
  ];
  
  // Initialize groups in order
  categoryOrder.forEach(cat => {
    groups[cat] = [];
  });
  groups['other'] = [];
  
  // Group items
  lineItems.forEach(item => {
    const cat = (item.category || 'other').toLowerCase();
    if (groups[cat]) {
      groups[cat].push(item);
    } else {
      groups['other'].push(item);
    }
  });
  
  // Remove empty categories
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });
  
  return groups;
};

/**
 * Creates a template Excel file for importing pricing data
 * Useful for users who need to know the expected format
 * 
 * @param {Array<Object>} plans - Floor plans to include as columns
 * @param {Array<Object>} lineItems - Line items to include as rows
 * @param {string} [filename] - Optional custom filename
 */
export const downloadPricingTemplate = ({ plans, lineItems, filename }) => {
  const wb = XLSX.utils.book_new();
  
  // Build template headers
  const headers = ['Item Code', 'Item Name', 'Category'];
  const sortedPlans = [...plans].sort((a, b) => 
    a.plan_code.localeCompare(b.plan_code)
  );
  
  sortedPlans.forEach(plan => {
    headers.push(`${plan.plan_code}`);
  });
  
  // Build template rows with line items (no pricing values)
  const rows = [headers];
  
  lineItems.forEach(item => {
    const row = [item.item_code, item.item_name, item.category || ''];
    sortedPlans.forEach(() => row.push('')); // Empty cells for pricing
    rows.push(row);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(rows);
  
  // Set column widths
  const colWidths = [
    { wch: 15 },
    { wch: 30 },
    { wch: 12 },
  ];
  sortedPlans.forEach(() => colWidths.push({ wch: 15 }));
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Pricing Template');
  
  // Add instructions sheet
  const instructions = [
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
  ];
  
  const instructionsWs = XLSX.utils.aoa_to_sheet(instructions);
  instructionsWs['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');
  
  const templateFilename = filename || 'Pricing_Import_Template.xlsx';
  XLSX.writeFile(wb, templateFilename);
  
  return { success: true, filename: templateFilename };
};

export default {
  exportPricingToExcel,
  parsePricingExcel,
  validatePricingImport,
  downloadPricingTemplate
};
