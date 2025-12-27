import { Injectable } from '@angular/core';
import { Borrower } from './data.service';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class PdfService {

  generateDemandLetter(borrower: Borrower, type: '1ST' | '2ND') {
    if (!window.jspdf) {
      console.error('jsPDF library not loaded');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Styling constants
    const margin = 20;
    let y = 30;

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ISABEL FINANCIAL SERVICES', margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Corporate Blvd, Finance City, NY 10001', margin, y);
    y += 20;

    // Recipient
    doc.setFontSize(12);
    doc.text(date, margin, y);
    y += 10;
    doc.text(`ATTN: ${borrower.full_name}`, margin, y);
    doc.text(borrower.address, margin, y + 5);
    doc.text(borrower.phone, margin, y + 10);
    y += 30;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const title = type === '1ST' ? 'NOTICE OF OUTSTANDING DEBT' : 'FINAL DEMAND BEFORE LEGAL ACTION';
    doc.text(title, margin, y);
    y += 20;

    // Body
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const bodyText1 = `Dear ${borrower.full_name},`;
    
    let bodyText2 = '';
    if (type === '1ST') {
      bodyText2 = `This letter serves as a formal reminder regarding your outstanding balance of ₱${borrower.outstanding_balance.toLocaleString()} for Loan ID #${borrower.loan_id}. Our records indicate that we have not received payment recently. Please remit payment immediately to avoid escalation.`;
    } else {
      bodyText2 = `This is your FINAL NOTICE regarding the debt of ₱${borrower.outstanding_balance.toLocaleString()} associated with Loan ID #${borrower.loan_id}. Despite our previous attempts to contact you, this matter remains unresolved. Unless payment is made within 15 days, we will proceed with filing a claim in Small Claims Court.`;
    }

    doc.text(bodyText1, margin, y);
    y += 10;
    
    const splitText = doc.splitTextToSize(bodyText2, 170);
    doc.text(splitText, margin, y);
    y += splitText.length * 7 + 10;

    // Call to Action
    doc.setFont('helvetica', 'bold');
    doc.text('PLEASE CONTACT US IMMEDIATELY: (800) 555-0199', margin, y);
    y += 20;

    doc.setFont('helvetica', 'normal');
    doc.text('Sincerely,', margin, y);
    y += 10;
    doc.text('Collections Department', margin, y);
    doc.text('Isabel Financial Services', margin, y + 5);

    // Save
    doc.save(`${borrower.full_name.replace(' ', '_')}_${type}_Demand.pdf`);
  }
}