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

// The button actions and the status each one sets
const ACTION_STATUS = { approve: 'Approved', reject: 'Rejected', shortlist: 'Short Listed' };
// Text of the success toast for each action
const ACTION_DONE = { approve: 'Approved', reject: 'Rejected', shortlist: 'Shortlisted' };

const EIRRequests = ({ eirRequests, reload }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [openRequest, setOpenRequest] = useState(null);
  // { requestId: { approve: true, ... } } -> buttons already clicked in this session
  const [disabledButtons, setDisabledButtons] = useState({});
  const [openSections, setOpenSections] = useState({}); // which request's reviews popup is open

  const toggleSection = (requestId) => {
    setOpenSections((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };

  // Hide the toast after 2 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const toggleRequestDetails = (id) => {
    setOpenRequest(openRequest === id ? null : id);
  };

  const handleRequestUpdate = async (actionType, requestId) => {
    setLoading(true);
    try {
      await api.post('/admin/eir/status', { id: requestId, status: ACTION_STATUS[actionType] });

      setDisabledButtons((prev) => ({
        ...prev,
        [requestId]: { ...prev[requestId], [actionType]: true },
      }));
      setToast({ type: 'success', message: `${ACTION_DONE[actionType]} successfully!` });
      await reload();
    } catch (error) {
      setToast({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {loading && <Loader />}
      <h1 className="text-3xl font-bold mb-6">EIR Requests</h1>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {eirRequests.map((request) => {
        const isDisabled = disabledButtons[request._id] || {};

        return (
          <div key={request._id} className="border rounded-lg shadow-md mb-6 p-5 bg-white">
            <div className="flex justify-between items-center">
              <h2
                className="text-xl font-semibold cursor-pointer"
                onClick={() => toggleRequestDetails(request._id)}
              >
                {request.entrepreneur?.name}'s Request
                <span className="ml-2">{openRequest === request._id ? '▲' : '▼'}</span>
              </h2>
              <p className="text-gray-500">
                Created on {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>

            {openRequest === request._id && (
              <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                <p><strong>Entrepreneur:</strong> {request.entrepreneur?.name || 'N/A'}</p>
                <p><strong>Business Idea:</strong> {request.business_idea || 'N/A'}</p>
                <p><strong>Summary:</strong> {request.summary || 'N/A'}</p>
                <p><strong>Mentorship Startups:</strong> {request.objectives?.mentorship_startups?.join(', ') || 'N/A'}</p>
                <p><strong>Personal Goals:</strong> {request.objectives?.personal_goals || 'N/A'}</p>
              </div>
            )}

            <div className="mt-4 flex items-center">
              <div className="flex-1">
                <span
                  className={`px-3 py-1 rounded font-semibold ${getStatusColor(request.status?.status)}`}
                >
                  {request.status?.status || 'N/A'}
                </span>
                <button
                  className="text-lg font-semibold cursor-pointer flex items-center mt-4"
                  onClick={() => toggleSection(request._id)}
                >
                  Reviews
                  <span className="ml-2">
                    {openSections[request._id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </span>
                </button>
                {openSections[request._id] && (
                  <ReviewsPopup reviews={request.reviews} onClose={() => toggleSection(request._id)} />
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow-md transition-colors ${
                    isDisabled.approve ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleRequestUpdate('approve', request._id)}
                  disabled={isDisabled.approve}
                >
                  Accept
                </button>

                <button
                  className={`bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded shadow-md transition-colors ${
                    isDisabled.reject ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleRequestUpdate('reject', request._id)}
                  disabled={isDisabled.reject}
                >
                  Reject
                </button>

                <button
                  className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded shadow-md transition-colors ${
                    isDisabled.shortlist ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleRequestUpdate('shortlist', request._id)}
                  disabled={isDisabled.shortlist}
                >
                  Mark Shortlisted
                </button>
                <Link to={`/selectreviewers/${request._id}`}>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded shadow-md transition-colors">
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
};

export default EIRRequests;
