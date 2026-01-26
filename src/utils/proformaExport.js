// src/utils/proformaExport.js
// Utility for exporting Pro Forma data to PDF and PowerPoint presentations

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// import pptxgen from 'pptxgenjs'; // TODO: Install pptxgenjs if PowerPoint export is needed

// Format helpers
function formatCurrency(value) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(decimals)}%`;
}

function formatMultiple(value) {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(2)}x`;
}

// Color constants matching the charts
const COLORS = {
  primary: '2F855A',      // Atlas green
  secondary: '276749',
  lp: '3B82F6',           // blue-500
  gp: '10B981',           // emerald-500
  project: '6366F1',      // indigo-500
  text: '1F2937',         // gray-800
  textLight: '6B7280',    // gray-500
  border: 'E5E7EB',       // gray-200
  white: 'FFFFFF',
};

/**
 * Export Pro Forma to PDF
 */
export async function exportToPDF({
  proforma,
  calculations,
  waterfallResults,
  scenarios,
  chartRef,
  options = {},
}) {
  const {
    includeCharts = true,
    includeSummary = true,
    includeWaterfall = true,
    includeScenarios = true,
    includeCosts = true,
  } = options;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Helper to add new page if needed
  const checkNewPage = (height = 20) => {
    if (yPos + height > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Title Page
  pdf.setFillColor(47, 133, 90); // Atlas green
  pdf.rect(0, 0, pageWidth, 60, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(proforma?.name || 'Pro Forma Analysis', pageWidth / 2, 30, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated ${new Date().toLocaleDateString()}`, pageWidth / 2, 45, { align: 'center' });

  yPos = 75;
  pdf.setTextColor(31, 41, 55); // gray-800

  // Executive Summary
  if (includeSummary) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', margin, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const lp = waterfallResults?.final_results?.lp || {};
    const gp = waterfallResults?.final_results?.gp || {};

    // Key metrics table
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Project Cost', formatCurrency(calculations?.totalCost)],
      ['Total Equity', formatCurrency(calculations?.totalEquity)],
      ['Total Revenue', formatCurrency(calculations?.totalRevenue)],
      ['Net Profit', formatCurrency(calculations?.netProfit)],
      ['Gross Margin', formatPercent(calculations?.grossMargin)],
      ['Project IRR', formatPercent(calculations?.projectIRR)],
      ['LP IRR', formatPercent(lp.irr)],
      ['LP Equity Multiple', formatMultiple(lp.equity_multiple)],
      ['GP IRR', formatPercent(gp.irr)],
      ['GP Promote Earned', formatCurrency(gp.promote_earned)],
    ];

    // Draw table
    const colWidths = [60, 50];
    const rowHeight = 7;

    summaryData.forEach((row, rowIdx) => {
      checkNewPage(rowHeight);

      const isHeader = rowIdx === 0;
      if (isHeader) {
        pdf.setFillColor(243, 244, 246); // gray-100
        pdf.rect(margin, yPos - 5, colWidths[0] + colWidths[1], rowHeight, 'F');
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }

      pdf.setTextColor(31, 41, 55);
      pdf.text(row[0], margin + 2, yPos);
      pdf.text(row[1], margin + colWidths[0] + 2, yPos);

      yPos += rowHeight;
    });

    yPos += 10;
  }

  // Waterfall Distribution
  if (includeWaterfall && waterfallResults?.tier_results) {
    checkNewPage(60);

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Waterfall Distribution', margin, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const tierHeaders = ['Tier', 'Amount', 'LP Dist.', 'GP Dist.', 'GP Promote'];
    const colWidths = [50, 35, 35, 35, 35];
    const rowHeight = 7;

    // Headers
    pdf.setFillColor(243, 244, 246);
    pdf.rect(margin, yPos - 5, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    pdf.setFont('helvetica', 'bold');

    let xPos = margin;
    tierHeaders.forEach((header, idx) => {
      pdf.text(header, xPos + 2, yPos);
      xPos += colWidths[idx];
    });
    yPos += rowHeight;

    // Rows
    pdf.setFont('helvetica', 'normal');
    waterfallResults.tier_results.forEach((tier) => {
      checkNewPage(rowHeight);

      xPos = margin;
      const tierData = [
        tier.tier_name || '',
        formatCurrency(tier.distributable_amount),
        formatCurrency(tier.lp_distribution),
        formatCurrency(tier.gp_distribution),
        formatCurrency(tier.gp_promote_in_tier),
      ];

      tierData.forEach((cell, idx) => {
        pdf.text(cell.substring(0, 15), xPos + 2, yPos);
        xPos += colWidths[idx];
      });

      yPos += rowHeight;
    });

    yPos += 10;
  }

  // Scenario Analysis
  if (includeScenarios && scenarios) {
    checkNewPage(50);

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Scenario Analysis', margin, yPos);
    yPos += 10;

    const scenarioHeaders = ['Metric', 'Downside (-20%)', 'Base Case', 'Upside (+20%)'];
    const colWidths = [40, 40, 40, 40];
    const rowHeight = 7;

    // Headers
    pdf.setFillColor(243, 244, 246);
    pdf.rect(margin, yPos - 5, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);

    let xPos = margin;
    scenarioHeaders.forEach((header, idx) => {
      pdf.text(header, xPos + 2, yPos);
      xPos += colWidths[idx];
    });
    yPos += rowHeight;

    // Data rows
    pdf.setFont('helvetica', 'normal');
    const scenarioData = [
      ['LP IRR', formatPercent(scenarios.downside?.final_results?.lp?.irr), formatPercent(scenarios.base?.final_results?.lp?.irr), formatPercent(scenarios.upside?.final_results?.lp?.irr)],
      ['LP Multiple', formatMultiple(scenarios.downside?.final_results?.lp?.equity_multiple), formatMultiple(scenarios.base?.final_results?.lp?.equity_multiple), formatMultiple(scenarios.upside?.final_results?.lp?.equity_multiple)],
      ['GP Promote', formatCurrency(scenarios.downside?.final_results?.gp?.promote_earned), formatCurrency(scenarios.base?.final_results?.gp?.promote_earned), formatCurrency(scenarios.upside?.final_results?.gp?.promote_earned)],
    ];

    scenarioData.forEach((row) => {
      checkNewPage(rowHeight);
      xPos = margin;
      row.forEach((cell, idx) => {
        pdf.text(cell, xPos + 2, yPos);
        xPos += colWidths[idx];
      });
      yPos += rowHeight;
    });

    yPos += 10;
  }

  // Charts (capture from DOM if ref provided)
  if (includeCharts && chartRef?.current) {
    checkNewPage(120);

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Returns Charts', margin, yPos);
    yPos += 10;

    try {
      const element = chartRef.current.getElement?.() || chartRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;

      // May need multiple pages for tall charts
      const maxHeight = pageHeight - yPos - margin;
      if (imgHeight > maxHeight) {
        const scaledHeight = maxHeight;
        const scaledWidth = (canvas.width / canvas.height) * scaledHeight;
        pdf.addImage(imgData, 'PNG', margin, yPos, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
      }
    } catch (err) {
      console.error('Error capturing charts:', err);
      pdf.setFontSize(10);
      pdf.text('Charts could not be captured', margin, yPos);
    }
  }

  // Footer on each page
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(
      `Page ${i} of ${pageCount} | ${proforma?.name || 'Pro Forma'} | Atlas`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save
  const filename = `${proforma?.name || 'ProForma'}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);

  return filename;
}

/**
 * Export Pro Forma to PowerPoint presentation
 */
export async function exportToPresentation({
  proforma,
  calculations,
  waterfallResults,
  scenarios,
  chartRef,
  options = {},
}) {
  // TODO: Install pptxgenjs package to enable PowerPoint export
  // Run: npm install pptxgenjs
  console.warn('PowerPoint export is currently disabled. Install pptxgenjs to enable this feature.');
  throw new Error('PowerPoint export requires the pptxgenjs package. Please run: npm install pptxgenjs');
  
  // The full PowerPoint export code has been temporarily disabled
  // Install pptxgenjs and uncomment the code below to enable this feature
  /*
  const {
    includeCharts = true,
    includeSummary = true,
    includeWaterfall = true,
    includeScenarios = true,
    template = 'professional', // professional, minimal, detailed
  } = options;

  const pptxgen = require('pptxgenjs');
  const pptx = new pptxgen();

  // Presentation settings
  pptx.author = 'Atlas';
  pptx.title = proforma?.name || 'Pro Forma Analysis';
  pptx.subject = 'Investment Analysis';
  pptx.company = 'Atlas Development';

  // Define master slides
  pptx.defineSlideMaster({
    title: 'ATLAS_MASTER',
    background: { color: 'FFFFFF' },
    objects: [
      // Header bar
      { rect: { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: COLORS.primary } } },
      // Footer
      { text: { text: proforma?.name || 'Pro Forma', options: { x: 0.5, y: 5.3, w: 3, h: 0.2, fontSize: 8, color: COLORS.textLight } } },
      { text: { text: new Date().toLocaleDateString(), options: { x: 7.5, y: 5.3, w: 2, h: 0.2, fontSize: 8, color: COLORS.textLight, align: 'right' } } },
    ],
  });

  const lp = waterfallResults?.final_results?.lp || {};
  const gp = waterfallResults?.final_results?.gp || {};

  // Slide 1: Title
  let slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: COLORS.primary } });
  slide.addText(proforma?.name || 'Pro Forma Analysis', {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: COLORS.white,
    align: 'center',
  });
  slide.addText('Investment Analysis', {
    x: 0.5,
    y: 3,
    w: 9,
    h: 0.5,
    fontSize: 24,
    color: COLORS.white,
    align: 'center',
  });
  slide.addText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), {
    x: 0.5,
    y: 4,
    w: 9,
    h: 0.5,
    fontSize: 16,
    color: COLORS.white,
    align: 'center',
  });

  // Slide 2: Executive Summary
  if (includeSummary) {
    slide = pptx.addSlide({ masterName: 'ATLAS_MASTER' });
    slide.addText('Executive Summary', {
      x: 0.5,
      y: 0.7,
      w: 9,
      h: 0.5,
      fontSize: 28,
      bold: true,
      color: COLORS.text,
    });

    // Key metrics cards
    const metrics = [
      { label: 'Total Cost', value: formatCurrency(calculations?.totalCost), color: COLORS.text },
      { label: 'Total Revenue', value: formatCurrency(calculations?.totalRevenue), color: COLORS.text },
      { label: 'Net Profit', value: formatCurrency(calculations?.netProfit), color: COLORS.primary },
      { label: 'Gross Margin', value: formatPercent(calculations?.grossMargin), color: COLORS.primary },
    ];

    metrics.forEach((metric, idx) => {
      const x = 0.5 + (idx * 2.3);
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y: 1.5,
        w: 2.1,
        h: 1,
        fill: { color: 'F3F4F6' },
        line: { color: COLORS.border, pt: 1 },
      });
      slide.addText(metric.label, { x, y: 1.55, w: 2.1, h: 0.3, fontSize: 10, color: COLORS.textLight, align: 'center' });
      slide.addText(metric.value, { x, y: 1.85, w: 2.1, h: 0.4, fontSize: 18, bold: true, color: metric.color, align: 'center' });
    });

    // Returns section
    slide.addText('Returns Summary', {
      x: 0.5,
      y: 2.8,
      w: 9,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: COLORS.text,
    });

    // LP/GP Returns table
    const returnsData = [
      ['', 'LP Returns', 'GP Returns'],
      ['IRR', formatPercent(lp.irr), formatPercent(gp.irr)],
      ['Equity Multiple', formatMultiple(lp.equity_multiple), formatMultiple(gp.equity_multiple)],
      ['Total Distributed', formatCurrency(lp.total_distributed), formatCurrency(gp.total_distributed)],
      ['Profit', formatCurrency(lp.profit), formatCurrency(gp.profit)],
    ];

    slide.addTable(returnsData, {
      x: 0.5,
      y: 3.3,
      w: 6,
      colW: [2, 2, 2],
      border: { pt: 0.5, color: COLORS.border },
      fill: { color: 'FFFFFF' },
      fontFace: 'Arial',
      fontSize: 11,
      color: COLORS.text,
      align: 'center',
      valign: 'middle',
    });
  }

  // Slide 3: Waterfall Distribution
  if (includeWaterfall && waterfallResults?.tier_results) {
    slide = pptx.addSlide({ masterName: 'ATLAS_MASTER' });
    slide.addText('Waterfall Distribution', {
      x: 0.5,
      y: 0.7,
      w: 9,
      h: 0.5,
      fontSize: 28,
      bold: true,
      color: COLORS.text,
    });

    // Tier table
    const tierData = [
      ['Tier', 'Amount', 'LP Distribution', 'GP Distribution', 'GP Promote'],
      ...waterfallResults.tier_results.map((tier) => [
        tier.tier_name || '',
        formatCurrency(tier.distributable_amount),
        formatCurrency(tier.lp_distribution),
        formatCurrency(tier.gp_distribution),
        formatCurrency(tier.gp_promote_in_tier),
      ]),
    ];

    slide.addTable(tierData, {
      x: 0.5,
      y: 1.4,
      w: 9,
      colW: [2.5, 1.5, 1.8, 1.5, 1.7],
      border: { pt: 0.5, color: COLORS.border },
      fill: { color: 'FFFFFF' },
      fontFace: 'Arial',
      fontSize: 10,
      color: COLORS.text,
      align: 'center',
      valign: 'middle',
    });

    // Summary bar
    const totalLP = lp.total_distributed || 0;
    const totalGP = gp.total_distributed || 0;
    const total = totalLP + totalGP;
    const lpPct = total > 0 ? totalLP / total : 0;

    slide.addText('Total Distribution Split', {
      x: 0.5,
      y: 4,
      w: 9,
      h: 0.3,
      fontSize: 14,
      bold: true,
      color: COLORS.text,
    });

    // LP bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: 4.4,
      w: 8 * lpPct,
      h: 0.4,
      fill: { color: COLORS.lp },
    });
    // GP bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5 + 8 * lpPct,
      y: 4.4,
      w: 8 * (1 - lpPct),
      h: 0.4,
      fill: { color: COLORS.gp },
    });

    slide.addText(`LP: ${formatCurrency(totalLP)} (${formatPercent(lpPct)})`, {
      x: 0.5,
      y: 4.9,
      w: 4,
      h: 0.3,
      fontSize: 10,
      color: COLORS.lp,
    });
    slide.addText(`GP: ${formatCurrency(totalGP)} (${formatPercent(1 - lpPct)})`, {
      x: 4.5,
      y: 4.9,
      w: 4,
      h: 0.3,
      fontSize: 10,
      color: COLORS.gp,
      align: 'right',
    });
  }

  // Slide 4: Scenario Analysis
  if (includeScenarios && scenarios) {
    slide = pptx.addSlide({ masterName: 'ATLAS_MASTER' });
    slide.addText('Scenario Analysis', {
      x: 0.5,
      y: 0.7,
      w: 9,
      h: 0.5,
      fontSize: 28,
      bold: true,
      color: COLORS.text,
    });

    const scenarioData = [
      ['Metric', 'Downside (-20%)', 'Base Case', 'Upside (+20%)'],
      ['LP IRR', formatPercent(scenarios.downside?.final_results?.lp?.irr), formatPercent(scenarios.base?.final_results?.lp?.irr), formatPercent(scenarios.upside?.final_results?.lp?.irr)],
      ['LP Multiple', formatMultiple(scenarios.downside?.final_results?.lp?.equity_multiple), formatMultiple(scenarios.base?.final_results?.lp?.equity_multiple), formatMultiple(scenarios.upside?.final_results?.lp?.equity_multiple)],
      ['LP Profit', formatCurrency(scenarios.downside?.final_results?.lp?.profit), formatCurrency(scenarios.base?.final_results?.lp?.profit), formatCurrency(scenarios.upside?.final_results?.lp?.profit)],
      ['GP IRR', formatPercent(scenarios.downside?.final_results?.gp?.irr), formatPercent(scenarios.base?.final_results?.gp?.irr), formatPercent(scenarios.upside?.final_results?.gp?.irr)],
      ['GP Promote', formatCurrency(scenarios.downside?.final_results?.gp?.promote_earned), formatCurrency(scenarios.base?.final_results?.gp?.promote_earned), formatCurrency(scenarios.upside?.final_results?.gp?.promote_earned)],
    ];

    slide.addTable(scenarioData, {
      x: 0.5,
      y: 1.4,
      w: 9,
      colW: [2.5, 2.2, 2.1, 2.2],
      border: { pt: 0.5, color: COLORS.border },
      fill: { color: 'FFFFFF' },
      fontFace: 'Arial',
      fontSize: 11,
      color: COLORS.text,
      align: 'center',
      valign: 'middle',
    });
  }

  // Slide 5: Charts (capture from DOM)
  if (includeCharts && chartRef?.current) {
    slide = pptx.addSlide({ masterName: 'ATLAS_MASTER' });
    slide.addText('Returns Analysis', {
      x: 0.5,
      y: 0.7,
      w: 9,
      h: 0.5,
      fontSize: 28,
      bold: true,
      color: COLORS.text,
    });

    try {
      const element = chartRef.current.getElement?.() || chartRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      // Calculate dimensions to fit slide
      const maxWidth = 9;
      const maxHeight = 4;
      const aspectRatio = canvas.width / canvas.height;

      let imgWidth = maxWidth;
      let imgHeight = imgWidth / aspectRatio;

      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * aspectRatio;
      }

      slide.addImage({
        data: imgData,
        x: (10 - imgWidth) / 2,
        y: 1.3,
        w: imgWidth,
        h: imgHeight,
      });
    } catch (err) {
      console.error('Error capturing charts for PPTX:', err);
      slide.addText('Charts could not be captured', {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 0.5,
        fontSize: 14,
        color: COLORS.textLight,
        align: 'center',
      });
    }
  }

  // Slide 6: Thank You / Contact
  slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: COLORS.primary } });
  slide.addText('Thank You', {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: COLORS.white,
    align: 'center',
  });
  slide.addText('For more information, contact your investment team', {
    x: 0.5,
    y: 3.2,
    w: 9,
    h: 0.5,
    fontSize: 18,
    color: COLORS.white,
    align: 'center',
  });

  // Save
  const filename = `${proforma?.name || 'ProForma'}_${new Date().toISOString().split('T')[0]}.pptx`;
  await pptx.writeFile({ fileName: filename });

  return filename;
  */
}

/**
 * Export raw data to JSON
 */
export function exportToJSON({
  proforma,
  calculations,
  waterfallResults,
  scenarios,
}) {
  const exportData = {
    exportDate: new Date().toISOString(),
    proforma: {
      id: proforma?.id,
      name: proforma?.name,
      template_type: proforma?.template_type,
    },
    calculations: {
      totalCost: calculations?.totalCost,
      totalEquity: calculations?.totalEquity,
      totalRevenue: calculations?.totalRevenue,
      netProfit: calculations?.netProfit,
      grossMargin: calculations?.grossMargin,
      projectIRR: calculations?.projectIRR,
      unleveredIRR: calculations?.unleveredIRR,
    },
    waterfallResults: waterfallResults ? {
      tier_results: waterfallResults.tier_results,
      final_results: waterfallResults.final_results,
    } : null,
    scenarios: scenarios ? {
      downside: scenarios.downside?.final_results,
      base: scenarios.base?.final_results,
      upside: scenarios.upside?.final_results,
    } : null,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${proforma?.name || 'ProForma'}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return a.download;
}

/**
 * Export to CSV
 */
export function exportToCSV({
  proforma,
  calculations,
  waterfallResults,
}) {
  const rows = [];

  // Header
  rows.push(['Pro Forma Export', proforma?.name || 'Unnamed']);
  rows.push(['Export Date', new Date().toLocaleDateString()]);
  rows.push([]);

  // Summary
  rows.push(['Summary Metrics']);
  rows.push(['Total Cost', calculations?.totalCost || 0]);
  rows.push(['Total Equity', calculations?.totalEquity || 0]);
  rows.push(['Total Revenue', calculations?.totalRevenue || 0]);
  rows.push(['Net Profit', calculations?.netProfit || 0]);
  rows.push(['Gross Margin', (calculations?.grossMargin || 0) * 100 + '%']);
  rows.push([]);

  // Waterfall
  if (waterfallResults?.tier_results) {
    rows.push(['Waterfall Distribution']);
    rows.push(['Tier', 'Amount', 'LP Distribution', 'GP Distribution', 'GP Promote']);
    waterfallResults.tier_results.forEach((tier) => {
      rows.push([
        tier.tier_name || '',
        tier.distributable_amount || 0,
        tier.lp_distribution || 0,
        tier.gp_distribution || 0,
        tier.gp_promote_in_tier || 0,
      ]);
    });
    rows.push([]);

    // Final results
    const lp = waterfallResults.final_results?.lp || {};
    const gp = waterfallResults.final_results?.gp || {};

    rows.push(['Returns Summary']);
    rows.push(['Metric', 'LP', 'GP']);
    rows.push(['IRR', (lp.irr || 0) * 100 + '%', (gp.irr || 0) * 100 + '%']);
    rows.push(['Equity Multiple', (lp.equity_multiple || 0) + 'x', (gp.equity_multiple || 0) + 'x']);
    rows.push(['Total Distributed', lp.total_distributed || 0, gp.total_distributed || 0]);
    rows.push(['Profit', lp.profit || 0, gp.profit || 0]);
  }

  // Convert to CSV
  const csv = rows.map((row) => row.map((cell) => {
    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  }).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${proforma?.name || 'ProForma'}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  return a.download;
}

export default {
  exportToPDF,
  exportToPresentation,
  exportToJSON,
  exportToCSV,
};
