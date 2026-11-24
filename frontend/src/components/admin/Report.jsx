// /admin/report : downloads a PDF with one page per startup (company details + progress reports)
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jsPDF } from 'jspdf';
import api from '../../api';

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : 'N/A';
}

function createPdf(startups) {
  const doc = new jsPDF(); // A4 page, sizes in millimetres (210 x 297)

  startups.forEach((startup, index) => {
    if (index > 0) doc.addPage(); // every startup gets its own page
    const kyc = startup.kyc || {};
    const details = kyc.company_details || {};
    const contact = kyc.contact_person || {};

    // Light purple page background
    doc.setFillColor(240, 240, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // Heading
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(75, 0, 130);
    doc.text(`${kyc.company_name || 'Startup'} Details`, 10, 15);

    // Details as "label: value" rows
    const rows = [
      ['Industry', details.industry],
      ['Website', details.website],
      ['Incorporation Date', formatDate(details.incorporation_date)],
      ['Registered On', formatDate(kyc.created_at)],
      ['Contact Person', contact.name],
      ['Contact Email', contact.email],
      ['Contact Phone', contact.phone],
      ['Address', kyc.address],
    ];
    doc.setFontSize(12);
    let y = 30;
    rows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(128, 0, 128);
      doc.text(`${label}:`, 10, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(String(value || 'N/A'), 60, y);
      y += 8;
    });

    // Monthly progress reports
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 0, 130);
    doc.text('Monthly Progress', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    y += 8;

    if (startup.progress.length === 0) {
      doc.text('No reports submitted yet.', 10, y);
    }
    startup.progress.forEach((item) => {
      if (y > 270) return; // stop before running off the page
      doc.text(`${item.month || 'N/A'} - Milestones: ${item.milestones || ''}`, 10, y, { maxWidth: 190 });
      doc.text(`Revenue: Rs. ${item.financials?.revenue ?? 0}    Expenses: Rs. ${item.financials?.expenses ?? 0}`, 14, y + 6);
      y += 16;
    });
  });

  doc.save('startx_startups_report.pdf');
}

export default function Report() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!Cookies.get('admin')) {
      navigate('/admin/login');
      return;
    }
    api
      .get('/admin/startups')
      .then((response) => setStartups(response.data))
      .catch((error) => console.error('Error fetching startups:', error))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-purple-800">Startups PDF Report</h1>
        <p className="text-gray-600">
          {loading ? 'Loading startups...' : `${startups.length} startup(s) will be included, one per page.`}
        </p>
        <button
          onClick={() => createPdf(startups)}
          disabled={loading || startups.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          Download PDF
        </button>
        <Link to="/admin" className="block text-purple-700 hover:underline">← Back to Admin</Link>
      </div>
    </div>
  );
}
