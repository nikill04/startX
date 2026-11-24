// Admin tab "Grants Requests": see every grant application, change its status, pick reviewers
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReviewsPopup from './ReviewsPopup';
import api from '../../api';
import { getStatusColor } from '../../status';

// Grants still waiting for a decision come first, then shortlisted, approved and rejected ones
const SORT_ORDER = { 'Short Listed': 1, Approved: 2, Rejected: 3 };
const sortSchemes = (schemes) =>
  [...schemes].sort((a, b) => (SORT_ORDER[a.grant_status?.status] || 0) - (SORT_ORDER[b.grant_status?.status] || 0));

export default function GrantApplicationComponent({ grantSchemes, reload }) {
  const [openApplicant, setOpenApplicant] = useState(null);
  const [openProject, setOpenProject] = useState(null);
  const [openSections, setOpenSections] = useState({}); // which grant's reviews popup is open

  const toggleSection = (requestId) => {
    setOpenSections((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };

  const toggleProjectDropdown = (id) => {
    setOpenProject(openProject === id ? null : id);
  };

  const toggleApplicantDropdown = (id) => {
    setOpenApplicant(openApplicant === id ? null : id);
  };

  const updateGrantStatus = async (id, status) => {
    const isConfirmed = window.confirm(`Are you sure you want to mark this grant as ${status}?`);
    if (!isConfirmed) return;
    try {
      await api.post('/admin/grant/status', { id, status });
      await reload();
    } catch (error) {
      console.error(`Failed to mark the grant request as ${status}:`, error);
    }
  };

  const handleReject = (id) => updateGrantStatus(id, 'Rejected');
  const handleAccept = (id) => updateGrantStatus(id, 'Approved');
  const handleShortList = (id) => updateGrantStatus(id, 'Short Listed');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Grant Scheme Applications</h1>

      {sortSchemes(grantSchemes).map((scheme) => {
        const status = scheme.grant_status?.status;
        const isDecided = status === 'Approved' || status === 'Rejected';
        // Shortlisting and picking reviewers are closed once shortlisted or decided
        const isLocked = isDecided || status === 'Short Listed';

        return (
          <div key={scheme._id} className="border rounded-lg shadow-md mb-6 p-5 bg-white">
            <div className="flex justify-between items-center">
              <h2
                className="text-xl font-semibold cursor-pointer"
                onClick={() => toggleProjectDropdown(scheme._id)}
              >
                {scheme.project_proposal.project_title}
                <span className="ml-2">{openProject === scheme._id ? '▲' : '▼'}</span>
              </h2>
              <p className="text-gray-500">
                Submitted by {scheme.applicant.name} on{' '}
                {new Date(scheme.created_at).toLocaleDateString()}
              </p>
            </div>

            {openProject === scheme._id && (
              <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Project Proposal</h3>
                <p>
                  <strong>Description:</strong> {scheme.project_proposal.description}
                </p>
                <p>
                  <strong>Objectives:</strong>
                </p>
                <ul className="list-disc list-inside ml-4">
                  {(scheme.project_proposal.objectives || []).map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
                <p className="mt-4">
                  <strong>Total Funding Required:</strong> ${Number(scheme.project_proposal.budget.total_funding_required || 0).toLocaleString()}
                </p>
                <p>
                  <strong>Funding Breakdown:</strong>
                </p>
                <ul className="list-disc list-inside ml-4">
                  {scheme.project_proposal.budget.funding_breakdown.map((item, index) => (
                    <li key={item._id || index}>
                      {item.item}: ${Number(item.amount || 0).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 border-t pt-4">
              <button
                className="text-xl font-semibold w-full text-left"
                onClick={() => toggleApplicantDropdown(scheme._id)}
              >
                Applicant Details
                <span className="ml-2">{openApplicant === scheme._id ? '▲' : '▼'}</span>
              </button>

              {openApplicant === scheme._id && (
                <div className="mt-2 bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Applicant Details</h3>
                  <p>
                    <strong>Name:</strong> {scheme.applicant.name}
                  </p>
                  {scheme.applicant.organization && (
                    <p>
                      <strong>Organization:</strong> {scheme.applicant.organization}
                    </p>
                  )}
                  <p>
                    <strong>Email:</strong> {scheme.applicant.contact_details.email}
                  </p>
                  {scheme.applicant.contact_details.phone && (
                    <p>
                      <strong>Phone:</strong> {scheme.applicant.contact_details.phone}
                    </p>
                  )}
                  {scheme.applicant.contact_details.address && (
                    <p>
                      <strong>Address:</strong> {scheme.applicant.contact_details.address}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center">
              <div className="flex-1">
                <span className={`px-3 py-1 rounded font-semibold ${getStatusColor(status)}`}>
                  {status || 'N/A'}
                </span>
                <button
                  className="text-lg font-semibold cursor-pointer flex items-center mt-4"
                  onClick={() => toggleSection(scheme._id)}
                >
                  Reviews
                  <span className="ml-2">
                    {openSections[scheme._id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </span>
                </button>
                {openSections[scheme._id] && (
                  <ReviewsPopup reviews={scheme.reviews} onClose={() => toggleSection(scheme._id)} />
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  className={`bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded shadow-md transition-colors ${
                    isDecided ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleReject(scheme._id)}
                  disabled={isDecided}
                >
                  Reject
                </button>

                <button
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow-md transition-colors ${
                    isDecided ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleAccept(scheme._id)}
                  disabled={isDecided}
                >
                  Accept
                </button>

                <button
                  className={`bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1 rounded shadow-md transition-colors ${
                    isLocked ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleShortList(scheme._id)}
                  disabled={isLocked}
                >
                  Mark as ShortListed
                </button>
                {/* The link must not open the page while the button is disabled */}
                <Link
                  to={`/grants/selectreviewers/${scheme._id}`}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  <button
                    className={`bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded shadow-md transition-colors ${
                      isLocked ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isLocked}
                  >
                    Select Reviewers
                  </button>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
