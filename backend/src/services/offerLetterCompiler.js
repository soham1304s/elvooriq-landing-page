const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Renders a highly polished, legal-grade corporate offer letter into a PDF buffer.
 * @param {object} offer - The parsed offer letter specifications.
 * @param {object} candidate - The candidate user database record.
 * @returns {Promise<Buffer>} - Resolves to raw file buffer.
 */
const compileOfferPDF = (offer, candidate) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 54, bottom: 54, left: 54, right: 54 },
        bufferPages: true
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // 1. Set Font Styles (fallback to Helvetica standard)
      doc.registerFont('Bold', 'Helvetica-Bold');
      doc.registerFont('Regular', 'Helvetica');
      doc.registerFont('Oblique', 'Helvetica-Oblique');

      // 2. Render Header & Decorative Border Accent (ELVOORIQ Teal Accent)
      doc.rect(0, 0, doc.page.width, 8).fill('#199580');

      // Logo and Header Info
      doc.fillColor('#0b0d0e')
         .font('Bold')
         .fontSize(22)
         .text('ELVOORIQ CREATIVE AGENCY', 54, 40)
         .fontSize(9)
         .font('Regular')
         .fillColor('#64748b')
         .text('Enterprise Operations Portal | Global Talent Division', 54, 65)
         .text('Web: operations.elvooriq.com | Email: HR@elvooriq.com', 54, 77);

      // Horizontal Rule
      doc.moveTo(54, 94).lineTo(doc.page.width - 54, 94).strokeColor('#e2e8f0').lineWidth(1).stroke();

      // Document Metadata Section
      const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.font('Bold').fontSize(10).fillColor('#0f172a').text(`DATE: ${todayStr}`, 54, 115);
      const candidateIdStr = (offer.candidateId || candidate.id || 'EVQ').substring(0, 8).toUpperCase();
      doc.text(`REFERENCE ID: EVQ-OL-${candidateIdStr}`, doc.page.width - 250, 115, { align: 'right', width: 196 });

      const candidateDisplayName = candidate.fullName || candidate.name || 'Valued Candidate';

      // Candidate Coordinates
      doc.font('Regular').fontSize(11).fillColor('#334155').text('TO,', 54, 145);
      doc.font('Bold').fillColor('#0f172a').text(candidateDisplayName, 54, 160);
      doc.font('Regular').fillColor('#475569')
         .text(`Email Address: ${candidate.email}`, 54, 175)
         .text(`Phone/WhatsApp: ${candidate.whatsapp || 'Not Available'}`, 54, 190);

      // Title Section
      doc.moveDown(2);
      doc.font('Bold').fontSize(16).fillColor('#199580').text('LETTER OF APPOINTMENT OFFER', { align: 'center' });
      doc.moveDown(1.5);

      // Core Dynamic Opening Template Paragraph
      doc.font('Regular').fontSize(10.5).fillColor('#1e293b').lineGap(4);
      doc.text(`We are pleased to extend this formal offer of employment to join ELVOORIQ Creative Agency as a `, { continued: true });
      doc.font('Bold').fillColor('#0f172a').text(offer.jobTitle, { continued: true });
      doc.font('Regular').fillColor('#1e293b').text(`. Below are the core operational terms, schedules, and structural compensation clauses negotiated for your onboarding.`);

      // 3. Compensation Terms Grid based on Compensation Basis Template
      doc.moveDown(2);
      doc.font('Bold').fontSize(12).fillColor('#0f172a').text('1. Position and Compensation Structures', 54);
      doc.moveTo(54, doc.y + 4).lineTo(doc.page.width - 54, doc.y + 4).strokeColor('#f1f5f9').lineWidth(1).stroke();
      doc.moveDown(1);

      // Formulate Compensation Description
      let payLabel = '';
      let payDesc = '';
      const amountNum = parseFloat(offer.amount) || 0;
      const amountFormatted = amountNum.toLocaleString('en-US', { style: 'currency', currency: 'INR' });

      if (offer.compensationBasis === 'SALARY') {
        payLabel = 'Fixed Salary Basis';
        payDesc = `You will receive a monthly base salary of ${amountFormatted} paid via secure direct bank transfer. Payments are processed in full on the 1st of every calendar month, subject to appropriate local withholding tax deductions.`;
      } else if (offer.compensationBasis === 'STIPEND') {
        payLabel = 'Professional Stipend Basis';
        payDesc = `You will receive a fixed monthly internship stipend of ${amountFormatted}. This compensation is non-cumulative and calculated based on operational hour-logs logged within the employee workspace.`;
      } else {
        payLabel = 'Unpaid Training/Probation';
        payDesc = 'This position is categorized under a zero-compensation training and skills-advancement baseline. It qualifies as a probation period. Upon reaching milestone achievements, your operational performance will be evaluated by HR for transition to a paid salary tier.';
      }

      // Render Compensation Section in Table Layout
      const currentY = doc.y;
      doc.rect(54, currentY, doc.page.width - 108, 65).fill('#f8fafc');
      
      doc.fillColor('#0f172a').font('Bold').fontSize(10).text('Agreement Basis:', 64, currentY + 12);
      doc.fillColor('#199580').text(payLabel, 180, currentY + 12);

      doc.fillColor('#0f172a').font('Regular').text('Term Description:', 64, currentY + 30);
      doc.fillColor('#475569').fontSize(9.5).text(payDesc, 180, currentY + 30, { width: doc.page.width - 250, align: 'justify' });

      // 4. Contract Timeline Rules
      doc.y = currentY + 80;
      doc.font('Bold').fontSize(12).fillColor('#0f172a').text('2. Onboarding Timeline & Structural Period', 54);
      doc.moveTo(54, doc.y + 4).lineTo(doc.page.width - 54, doc.y + 4).strokeColor('#f1f5f9').lineWidth(1).stroke();
      doc.moveDown(1);

      const startStr = new Date(offer.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const endStr = offer.endDate ? new Date(offer.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Indefinite (Full-Time Permanent)';

      doc.font('Regular').fontSize(10.5).fillColor('#1e293b')
         .text('• Effective Start Date: ', { continued: true }).font('Bold').text(startStr)
         .font('Regular').text('• Scheduled End Date: ', { continued: true }).font('Bold').text(endStr);

      // 5. Signature and Verification Blocks
      doc.moveDown(2.5);
      const signatureY = doc.y;

      // HR Signature Area
      doc.moveTo(54, signatureY + 45).lineTo(220, signatureY + 45).strokeColor('#cbd5e1').stroke();
      doc.font('Bold').fontSize(9.5).fillColor('#0f172a').text('ELVOORIQ HR COMPLIANCE', 54, signatureY + 52);
      doc.font('Regular').fontSize(8.5).fillColor('#64748b').text('Authorized Signatory Stamp', 54, signatureY + 65);

      // Candidate Acceptance Sign-off Area
      doc.moveTo(doc.page.width - 220, signatureY + 45).lineTo(doc.page.width - 54, signatureY + 45).strokeColor('#cbd5e1').stroke();
      doc.font('Bold').fontSize(9.5).fillColor('#0f172a').text('CANDIDATE SIGN-OFF & ACCEPT', doc.page.width - 220, signatureY + 52);
      doc.font('Regular').fontSize(8.5).fillColor('#64748b').text('Digitally Signed Acceptance Hash', doc.page.width - 220, signatureY + 65);

      // 6. Multi-page Safety Footer
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#94a3b8').text(
          `Page ${i + 1} of ${pages.count} | Dynamic system ID: ${offer.candidateId} | Confirmed under regulatory corporate compliance bylaws`,
          54,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width - 108 }
        );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { compileOfferPDF };
