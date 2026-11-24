// Reviewer tab "EIR Requests": EIR applications assigned to this reviewer
import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import Toast from '../Toast';
import Loader from '../Loader';
import ReviewForm from './ReviewForm';
import api, { getErrorMessage } from '../../api';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export default function EIRApplications() {
  const reviewer = Cookies.get('reviewer');
  const [applications, setApplications] = useState([]);
  const [expandedApp, setExpandedApp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // This reviewer's own review inside an application
  const myReview = (app) => app.reviews.find((review) => review.reviewer_id === reviewer);

  const fetchEIRs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/review/${reviewer}/reviews`);
      // Applications still waiting for my review come first
      const isPending = (app) => app.reviews.find((r) => r.reviewer_id === reviewer)?.status === 'pending';
      setApplications(response.data.sort((a, b) => isPending(b) - isPending(a)));
    } catch (error) {
      setToast({ message: getErrorMessage(error), type: 'error' });
    }
    setIsLoading(false);
  }, [reviewer]);

  useEffect(() => {
    fetchEIRs();
  }, [fetchEIRs]);

  // Hide the toast after 2 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const submitReview = async (appId, rating, comment) => {
    setIsLoading(true);
    try {
      await api.post(`/review/eir/${appId}/${reviewer}`, { rating, comment });
      setToast({ message: 'Review submitted successfully!', type: 'success' });
      await fetchEIRs();
    } catch (error) {
      setToast({ message: getErrorMessage(error), type: 'error' });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-screen-xl mx-auto p-2 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-purple-800">EIR Applications</h1>
      {isLoading && <Loader />}
      {toast && <Toast message={toast.message} type={toast.type} />}
      {!isLoading && applications.length === 0 && (
        <p className="text-gray-600">No EIR applications have been assigned to you yet.</p>
      )}

      {applications.map((app) => {
        const status = myReview(app)?.status || 'pending';
        return (
          <div key={app._id} className="bg-white shadow-lg rounded-lg mb-6">
            <div
              className="bg-gray-100 p-4 cursor-pointer flex justify-between items-center gap-2"
              onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
            >
              <span className="text-xl font-semibold">{app.startup_name}</span>
              <span className={`py-1 px-3 rounded-full text-sm ${status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                {status === 'pending' ? 'Review pending' : 'Reviewed'}
              </span>
            </div>
            {expandedApp === app._id && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-purple-700 mt-4">Entrepreneur Details</h2>
                    <p><strong>Name:</strong> {app.entrepreneur.name}</p>
                    <p><strong>Email:</strong> {app.entrepreneur.email}</p>
                    <p><strong>Background:</strong> {app.entrepreneur.background}</p>
                    <p><strong>Industry Experience:</strong> {app.entrepreneur.industry_experience || 'N/A'}</p>
                    <p><strong>Previous Ventures:</strong> {app.entrepreneur.previous_ventures.join(', ') || 'N/A'}</p>

                    <h2 className="text-lg font-semibold text-purple-700 mt-4">Objectives</h2>
                    <p><strong>Mentorship Startups:</strong> {app.objectives?.mentorship_startups?.join(', ') || 'N/A'}</p>
                    <p><strong>Personal Goals:</strong> {app.objectives?.personal_goals || 'N/A'}</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-purple-700 mt-4">Application Details</h2>
                    <p><strong>Application Status:</strong> {app.status.status}</p>
                    <p><strong>Created At:</strong> {formatDate(app.created_at)}</p>
                  </div>
                </div>
                <ReviewForm myReview={myReview(app)} onSubmit={(rating, comment) => submitReview(app._id, rating, comment)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
