// Admin tab "EIR Requests": see every EIR application, change its status, pick reviewers
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

export default function EIRRequests({ eirRequests, reload }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [openRequest, setOpenRequest] = useState(null); // id of the request whose details are open
  const [reviewsOpenFor, setReviewsOpenFor] = useState(null); // id of the request whose reviews popup is open

  // Hide the toast after 2 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Mark this EIR request as "${status}"?`)) return;
    setLoading(true);
    try {
      await api.post('/admin/eir/status', { id, status });
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
      <h1 className="text-3xl font-bold mb-6">EIR Requests</h1>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {eirRequests.length === 0 && <p className="text-gray-600">No EIR requests yet.</p>}

      {eirRequests.map((request) => {
        const status = request.status?.status || 'Submitted';
        const isDecided = status === 'Approved' || status === 'Rejected';

        return (
          <div key={request._id} className="border rounded-lg shadow-md mb-6 p-5 bg-white">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h2
                className="text-xl font-semibold cursor-pointer"
                onClick={() => setOpenRequest(openRequest === request._id ? null : request._id)}
              >
                {request.startup_name} - {request.entrepreneur?.name}
                <span className="ml-2">{openRequest === request._id ? '▲' : '▼'}</span>
              </h2>
              <p className="text-gray-500">
                Created on {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>

            {openRequest === request._id && (
              <div className="mt-4 bg-gray-100 p-4 rounded-lg space-y-1">
                <p><strong>Entrepreneur:</strong> {request.entrepreneur?.name}</p>
                <p><strong>Email:</strong> {request.entrepreneur?.email}</p>
                <p><strong>Background:</strong> {request.entrepreneur?.background || 'N/A'}</p>
                <p><strong>Industry Experience:</strong> {request.entrepreneur?.industry_experience || 'N/A'}</p>
                <p><strong>Previous Ventures:</strong> {request.entrepreneur?.previous_ventures?.join(', ') || 'N/A'}</p>
                <p><strong>Mentorship Startups:</strong> {request.objectives?.mentorship_startups?.join(', ') || 'N/A'}</p>
                <p><strong>Personal Goals:</strong> {request.objectives?.personal_goals || 'N/A'}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <span className={`px-3 py-1 rounded font-semibold ${getStatusColor(status)}`}>{status}</span>
                <button
                  className="text-lg font-semibold cursor-pointer flex items-center mt-4"
                  onClick={() => setReviewsOpenFor(request._id)}
                >
                  Reviews ({request.reviews.filter((r) => r.status === 'completed').length}/{request.reviews.length})
                  <span className="ml-2">
                    {reviewsOpenFor === request._id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </span>
                </button>
                {reviewsOpenFor === request._id && (
                  <ReviewsPopup reviews={request.reviews} onClose={() => setReviewsOpenFor(null)} />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className={`bg-blue-600 hover:bg-blue-700 ${buttonClass}`}
                  onClick={() => updateStatus(request._id, 'Approved')}
                  disabled={isDecided}
                >
                  Accept
                </button>
                <button
                  className={`bg-red-600 hover:bg-red-700 ${buttonClass}`}
                  onClick={() => updateStatus(request._id, 'Rejected')}
                  disabled={isDecided}
                >
                  Reject
                </button>
                <button
                  className={`bg-purple-600 hover:bg-purple-700 ${buttonClass}`}
                  onClick={() => updateStatus(request._id, 'Short Listed')}
                  disabled={isDecided || status === 'Short Listed'}
                >
                  Mark Shortlisted
                </button>
                {isDecided ? (
                  <button className={`bg-gray-600 ${buttonClass}`} disabled>Select Reviewers</button>
                ) : (
                  <Link to={`/selectreviewers/${request._id}`} className={`bg-gray-600 hover:bg-gray-700 ${buttonClass}`}>
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
