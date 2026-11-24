// Admin tab "Grants Requests": see every grant application, change its status, pick reviewers
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Loader from '../Loader';
import Toast from '../Toast';
import ReviewsPopup from './ReviewsPopup';
import api, { getErrorMessage } from '../../api';
import { getStatusColor } from '../../status';

const buttonClass = 'text-white px-4 py-1 rounded shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export default function GrantRequests({ grantSchemes, reload }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [openProject, setOpenProject] = useState(null);     // id whose project details are open
  const [openApplicant, setOpenApplicant] = useState(null); // id whose applicant details are open
  const [reviewsOpenFor, setReviewsOpenFor] = useState(null);

  // Hide the toast after 2 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Mark this grant as "${status}"?`)) return;
    setLoading(true);
    try {
      await api.post('/admin/grant/status', { id, status });
      setToast({ type: 'success', message: `Marked as ${status}` });
      await reload();
    } catch (error) {
      setToast({ type: 'error', message: getErrorMessage(error) });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-2 md:p-6 space-y-6">
      {loading && <Loader />}
      <h1 className="text-3xl font-bold mb-6">Grant Scheme Applications</h1>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {grantSchemes.length === 0 && <p className="text-gray-600">No grant applications yet.</p>}

      {grantSchemes.map((scheme) => {
        const status = scheme.grant_status?.status || 'Submitted';
        const isDecided = status === 'Approved' || status === 'Rejected';
        const budget = scheme.project_proposal.budget;

        return (
          <div key={scheme._id} className="border rounded-lg shadow-md mb-6 p-5 bg-white">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h2
                className="text-xl font-semibold cursor-pointer"
                onClick={() => setOpenProject(openProject === scheme._id ? null : scheme._id)}
              >
                {scheme.project_proposal.project_title}
                <span className="ml-2">{openProject === scheme._id ? '▲' : '▼'}</span>
              </h2>
              <p className="text-gray-500">
                Submitted by {scheme.applicant.name} on {new Date(scheme.created_at).toLocaleDateString()}
              </p>
            </div>

            {openProject === scheme._id && (
              <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Project Proposal</h3>
                <p><strong>Description:</strong> {scheme.project_proposal.description}</p>
                <p className="mt-4">
                  <strong>Total Funding Required:</strong> ₹{Number(budget.total_funding_required || 0).toLocaleString()}
                </p>
                <p><strong>Funding Breakdown:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  {budget.funding_breakdown.map((item) => (
                    <li key={item._id}>
                      {item.item}: ₹{Number(item.amount || 0).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 border-t pt-4">
              <button
                className="text-xl font-semibold w-full text-left"
                onClick={() => setOpenApplicant(openApplicant === scheme._id ? null : scheme._id)}
              >
                Applicant Details
                <span className="ml-2">{openApplicant === scheme._id ? '▲' : '▼'}</span>
              </button>

              {openApplicant === scheme._id && (
                <div className="mt-2 bg-gray-100 p-4 rounded-lg">
                  <p><strong>Name:</strong> {scheme.applicant.name}</p>
                  {scheme.applicant.organization && <p><strong>Organization:</strong> {scheme.applicant.organization}</p>}
                  <p><strong>Email:</strong> {scheme.applicant.contact_details.email}</p>
                  {scheme.applicant.contact_details.phone && <p><strong>Phone:</strong> {scheme.applicant.contact_details.phone}</p>}
                  {scheme.applicant.contact_details.address && <p><strong>Address:</strong> {scheme.applicant.contact_details.address}</p>}
                  {scheme.applicant.pan && <p><strong>PAN:</strong> {scheme.applicant.pan}</p>}
                  {scheme.applicant.aadhar_num && <p><strong>Aadhar:</strong> {scheme.applicant.aadhar_num}</p>}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <span className={`px-3 py-1 rounded font-semibold ${getStatusColor(status)}`}>{status}</span>
                <button
                  className="text-lg font-semibold cursor-pointer flex items-center mt-4"
                  onClick={() => setReviewsOpenFor(scheme._id)}
                >
                  Reviews ({scheme.reviews.filter((r) => r.status === 'completed').length}/{scheme.reviews.length})
                  <span className="ml-2">
                    {reviewsOpenFor === scheme._id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </span>
                </button>
                {reviewsOpenFor === scheme._id && (
                  <ReviewsPopup reviews={scheme.reviews} onClose={() => setReviewsOpenFor(null)} />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className={`bg-blue-600 hover:bg-blue-700 ${buttonClass}`}
                  onClick={() => updateStatus(scheme._id, 'Approved')}
                  disabled={isDecided}
                >
                  Accept
                </button>
                <button
                  className={`bg-red-600 hover:bg-red-700 ${buttonClass}`}
                  onClick={() => updateStatus(scheme._id, 'Rejected')}
                  disabled={isDecided}
                >
                  Reject
                </button>
                <button
                  className={`bg-yellow-600 hover:bg-yellow-700 ${buttonClass}`}
                  onClick={() => updateStatus(scheme._id, 'Short Listed')}
                  disabled={isDecided || status === 'Short Listed'}
                >
                  Mark Shortlisted
                </button>
                {isDecided ? (
                  <button className={`bg-gray-600 ${buttonClass}`} disabled>Select Reviewers</button>
                ) : (
                  <Link to={`/grants/selectreviewers/${scheme._id}`} className={`bg-gray-600 hover:bg-gray-700 ${buttonClass}`}>
                    Select Reviewers
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
