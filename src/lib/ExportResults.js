// ExportResults.js - Handles PDF generation for assessment results

import { jsPDF } from 'jspdf';
// For jsPDF v3, we need to import autotable specifically and use it directly
import autoTable from 'jspdf-autotable';

export function generatePDF(results, category, schoolName = '') {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 255); // #0066FF
  doc.text('CRIBS School Assessment Results', 105, 20, { align: 'center' });
  
  // Add school name if provided
  if (schoolName) {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`School: ${schoolName}`, 105, 30, { align: 'center' });
  }
  
  // Add category
  const categoryNames = {
    'water-supply': 'Water Supply Issues',
    'water-demand': 'Water Demand Issues',
    'dust-impacts': 'Airborne Dust Impacts',
    'heat-impacts': 'Heat Impacts',
    'rainwater-entry': 'Rainwater Entry',
    'flood-management': 'Flood Management',
    'wildfire-impacts': 'Wildfire Impacts',
    'electricity-supply': 'Electricity Supply',
    'air-quality': 'Air Quality'
  };
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Assessment Category: ${categoryNames[category] || category}`, 105, schoolName ? 40 : 30, { align: 'center' });
  
  // Add date
  const today = new Date();
  const dateStr = today.toLocaleDateString();
  doc.setFontSize(12);
  doc.text(`Date: ${dateStr}`, 105, schoolName ? 50 : 40, { align: 'center' });
  
  // Add recommendations
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 255); // #0066FF
  doc.text('Recommended Interventions:', 20, schoolName ? 65 : 55);
  
  if (results.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('No issues were identified in this category. Your school is doing well in this area!', 20, schoolName ? 75 : 65);
  } else {
    // Create table for recommendations
    const tableData = results.map((result, index) => [
      `${index + 1}. ${result.icon || ''}`,
      result.text
    ]);
    
    // Use the imported autoTable function directly
    autoTable(doc, {
      startY: schoolName ? 70 : 60,
      head: [['', 'Recommendation']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 192, 77], // #FFC04D
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 'auto' }
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 5
      }
    });
  }
  
  // Add footer
  // The lastAutoTable property is added by the plugin but TypeScript doesn't know about it
  // Get the last Y position from either the last table or use a default
  let finalY = (schoolName ? 85 : 75);
  
  // Access the table position safely
  // @ts-ignore - Property is added by autotable plugin
  if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
    // @ts-ignore - Property is added by autotable plugin
    finalY = doc.lastAutoTable.finalY + 20;
  }
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Generated by School Climate Assessment Tool', 105, finalY, { align: 'center' });
  doc.text('Powered by AI-for-Education.org', 105, finalY + 14, { align: 'center' });
  
  // Return the PDF document
  return doc;
}

export function downloadPDF(results, category, schoolName = '') {
  const doc = generatePDF(results, category, schoolName);
  
  // Generate filename
  const categoryShort = {
    'water-supply': 'water',
    'water-demand': 'demand',
    'dust-impacts': 'dust',
    'heat-impacts': 'heat',
    'rainwater-entry': 'rain',
    'flood-management': 'flood',
    'wildfire-impacts': 'fire',
    'electricity-supply': 'elec',
    'air-quality': 'air'
  };
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const filename = `CRIBS_${categoryShort[category] || category}_${timestamp}.pdf`;
  
  // Download the PDF
  doc.save(filename);
  
  return filename;
}
