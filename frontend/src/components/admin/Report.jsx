// Admin PDF report page: one button that downloads a PDF with one page per startup
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jsPDF } from 'jspdf';
import api from '../../api';

// jsPDF crashes on undefined text, so missing values become ''
const text = (value) => (value === undefined || value === null ? '' : String(value));
const date = (value) => (value ? new Date(value).toLocaleDateString() : '');

function downloadPdf(startups) {
  const doc = new jsPDF(); // A4 page, portrait, sizes in millimetres (210 x 297)

  startups.forEach((startup, index) => {
    const kyc = startup.kyc || {};
    const details = kyc.company_details || {};
    const contact = kyc.contact_person || {};
    const progress = startup.progress || [];

    // Light purple background on the whole page
    doc.setFillColor(240, 240, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // Company name as the heading (every startup starts at the top of its own page)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(75, 0, 130); // dark purple
    doc.text(`${text(kyc.company_name)} Details`, 10, 10);

    // Two columns of details
    const leftColumnX = 10;
    const rightColumnX = 110;

    // Slightly darker purple blocks behind the details
    doc.setFillColor(220, 220, 250);
    doc.rect(10, 15, 90, 50, 'F');
    doc.rect(110, 15, 90, 50, 'F');

    // Labels
    doc.setFontSize(12);
    doc.setTextColor(128, 0, 128); // purple
    doc.setFont('helvetica', 'bold');
    doc.text('Industry:', leftColumnX, 20);
    doc.text('Website:', leftColumnX, 30);
    doc.text('Contact Email:', leftColumnX, 40);
    doc.text('Created At:', leftColumnX, 50);

    doc.text('Incorporation Date:', rightColumnX, 20);
    doc.text('Contact Person:', rightColumnX, 30);
    doc.text('Contact Phone:', rightColumnX, 40);
    doc.text('Progress', rightColumnX, 50);

    // Values in normal black text
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    doc.text(text(details.industry), leftColumnX + 40, 20);
    doc.text(text(details.website), leftColumnX + 40, 30);
    doc.text(text(contact.email), leftColumnX + 40, 40);
    doc.text(kyc.created_at ? date(kyc.created_at) : 'N/A', leftColumnX + 40, 50);

    doc.text(date(details.incorporation_date), rightColumnX + 50, 20);
    doc.text(text(contact.name), rightColumnX + 50, 30);
    doc.text(text(contact.phone), rightColumnX + 50, 40);

    // Progress reports: 3 lines each, so each report moves down 15mm (no overlapping)
    progress.forEach((item, idx) => {
      const y = 60 + idx * 15;
      doc.text(`- Milestones: ${text(item.milestones)}`, leftColumnX, y);
      doc.text(`  Revenue: ${text(item.financials?.revenue)}`, leftColumnX, y + 5);
      doc.text(`  Expenses: ${text(item.financials?.expenses)}`, leftColumnX, y + 10);
    });

    if (index < startups.length - 1) {
      doc.addPage();
    }
  });

  doc.save('styled_startups_report.pdf');
}

export default function Temp() {
  const [startups, setStartups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!Cookies.get('admin')) {
      navigate('/admin/login');
      return;
    }
    api
      .get('/admin/startups')
      .then((response) => setStartups(response.data))
      .catch((error) => console.error('Error fetching startups:', error));
  }, [navigate]);

  return (
    <div>
      <button onClick={() => downloadPdf(startups)}>
        Download PDf
      </button>
    </div>
  );
}
