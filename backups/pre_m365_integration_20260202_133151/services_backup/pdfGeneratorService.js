// src/services/pdfGeneratorService.js
// Generate PDFs from contract templates using jsPDF

import { jsPDF } from 'jspdf';

/**
 * Generate a PDF from contract content
 * @param {string} content - The contract text content
 * @param {string} documentName - Name for the document
 * @param {Array} signers - Array of signers to add signature lines for
 * @returns {Blob} - PDF blob
 */
export function generateContractPDF(content, documentName, signers = []) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const maxWidth = pageWidth - (margin * 2);
  let y = margin;

  // Set font
  doc.setFont('helvetica');

  // Helper to add text with word wrap and page breaks
  const addText = (text, fontSize = 11, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');

    const lines = doc.splitTextToSize(text, maxWidth);

    for (const line of lines) {
      if (y > pageHeight - margin - 20) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += fontSize * 0.4;
    }
    y += 2; // Small gap after paragraph
  };

  // Helper to add a line
  const addLine = () => {
    if (y > pageHeight - margin - 30) {
      doc.addPage();
      y = margin;
    }
    doc.setDrawColor(100);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  // Parse and render content
  const paragraphs = content.split('\n');

  for (const para of paragraphs) {
    const trimmed = para.trim();

    if (!trimmed) {
      y += 4; // Empty line
      continue;
    }

    // Check for headers (all caps or short lines that look like headers)
    if (trimmed === trimmed.toUpperCase() && trimmed.length < 60 && !trimmed.includes(':')) {
      y += 3;
      addText(trimmed, 13, true);
      y += 2;
    }
    // Check for section headers with colons
    else if (trimmed.endsWith(':') && trimmed.length < 40) {
      y += 2;
      addText(trimmed, 11, true);
    }
    // Signature lines (underscores)
    else if (trimmed.includes('_____')) {
      y += 3;
      addText(trimmed.replace(/_+/g, ''), 11);
      addLine();
      y += 2;
    }
    // Regular text
    else {
      addText(trimmed, 11);
    }
  }

  // Add signature section at the end
  if (signers.length > 0) {
    y += 15;

    if (y > pageHeight - margin - 80) {
      doc.addPage();
      y = margin;
    }

    addText('SIGNATURES', 13, true);
    y += 5;

    for (const signer of signers) {
      if (y > pageHeight - margin - 40) {
        doc.addPage();
        y = margin;
      }

      // Role
      addText(`${signer.role || 'Signer'}:`, 11, true);
      y += 2;

      // Signature line
      doc.setDrawColor(0);
      doc.line(margin, y + 8, margin + 80, y + 8);
      y += 12;

      addText(signer.name || 'Name: _________________', 10);
      y += 3;
      addText(`Date: _________________`, 10);
      y += 10;
    }
  }

  // Add footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      documentName,
      margin,
      pageHeight - 10
    );
  }

  return doc.output('blob');
}

/**
 * Generate PDF and return as base64
 */
export function generateContractPDFBase64(content, documentName, signers = []) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  // Same content generation as above...
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const maxWidth = pageWidth - (margin * 2);
  let y = margin;

  doc.setFont('helvetica');

  const addText = (text, fontSize = 11, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (y > pageHeight - margin - 20) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += fontSize * 0.4;
    }
    y += 2;
  };

  const addLine = () => {
    if (y > pageHeight - margin - 30) {
      doc.addPage();
      y = margin;
    }
    doc.setDrawColor(100);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  const paragraphs = content.split('\n');

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      y += 4;
      continue;
    }
    if (trimmed === trimmed.toUpperCase() && trimmed.length < 60 && !trimmed.includes(':')) {
      y += 3;
      addText(trimmed, 13, true);
      y += 2;
    } else if (trimmed.endsWith(':') && trimmed.length < 40) {
      y += 2;
      addText(trimmed, 11, true);
    } else if (trimmed.includes('_____')) {
      y += 3;
      addText(trimmed.replace(/_+/g, ''), 11);
      addLine();
      y += 2;
    } else {
      addText(trimmed, 11);
    }
  }

  if (signers.length > 0) {
    y += 15;
    if (y > pageHeight - margin - 80) {
      doc.addPage();
      y = margin;
    }
    addText('SIGNATURES', 13, true);
    y += 5;
    for (const signer of signers) {
      if (y > pageHeight - margin - 40) {
        doc.addPage();
        y = margin;
      }
      addText(`${signer.role || 'Signer'}:`, 11, true);
      y += 2;
      doc.setDrawColor(0);
      doc.line(margin, y + 8, margin + 80, y + 8);
      y += 12;
      addText(signer.name || 'Name: _________________', 10);
      y += 3;
      addText(`Date: _________________`, 10);
      y += 10;
    }
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(documentName, margin, pageHeight - 10);
  }

  return doc.output('datauristring').split(',')[1];
}

/**
 * Download PDF directly
 */
export function downloadContractPDF(content, documentName, signers = []) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  // Generate same content
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const maxWidth = pageWidth - (margin * 2);
  let y = margin;

  doc.setFont('helvetica');

  const addText = (text, fontSize = 11, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (y > pageHeight - margin - 20) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += fontSize * 0.4;
    }
    y += 2;
  };

  const addLine = () => {
    if (y > pageHeight - margin - 30) {
      doc.addPage();
      y = margin;
    }
    doc.setDrawColor(100);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  const paragraphs = content.split('\n');

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) { y += 4; continue; }
    if (trimmed === trimmed.toUpperCase() && trimmed.length < 60 && !trimmed.includes(':')) {
      y += 3; addText(trimmed, 13, true); y += 2;
    } else if (trimmed.endsWith(':') && trimmed.length < 40) {
      y += 2; addText(trimmed, 11, true);
    } else if (trimmed.includes('_____')) {
      y += 3; addText(trimmed.replace(/_+/g, ''), 11); addLine(); y += 2;
    } else {
      addText(trimmed, 11);
    }
  }

  if (signers.length > 0) {
    y += 15;
    if (y > pageHeight - margin - 80) { doc.addPage(); y = margin; }
    addText('SIGNATURES', 13, true);
    y += 5;
    for (const signer of signers) {
      if (y > pageHeight - margin - 40) { doc.addPage(); y = margin; }
      addText(`${signer.role || 'Signer'}:`, 11, true);
      y += 2;
      doc.setDrawColor(0);
      doc.line(margin, y + 8, margin + 80, y + 8);
      y += 12;
      addText(signer.name || 'Name: _________________', 10);
      y += 3;
      addText(`Date: _________________`, 10);
      y += 10;
    }
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  doc.save(`${documentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export default {
  generateContractPDF,
  generateContractPDFBase64,
  downloadContractPDF
};
