// Reviewer tab "EIR Requests": EIR applications assigned to this reviewer
import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import Toast from '../Toast';
import Loader from '../Loader';
import ReviewForm from './ReviewForm';
import api from '../../api';

const getStatusStyle = (status) => {
  return status === 'pending'
    ? 'bg-yellow-200 text-yellow-800'
    : 'bg-green-200 text-green-800';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function EIRApplications() {
  const [expandedApp, setExpandedApp] = useState(null);
  const reviewer = Cookies.get('reviewer');
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  // This reviewer's own review inside an application
  const myReview = (app) => app.reviews?.find((r) => r.reviewer_id === reviewer);

  const fetchEIRs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/review/${reviewer}/reviews`);
      setApplications(response.data);
    } catch (error) {
      console.error(error);
      setToast({ message: 'Failed to load applications.', type: 'error' });
    }
    setIsLoading(false);
  }, [reviewer]);

  useEffect(() => {
    fetchEIRs();
  }, [fetchEIRs]);

  // Hide the toast after 2 seconds (it used to stay on screen forever)
  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => setToast({ message: '', type: '' }), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Returns true when the review was saved
  const handleSubmitReview = async (appId, rating, comment) => {
    setIsLoading(true);
    let saved = false;
    try {
      await api.post(`/review/eir/${appId}/${reviewer}`, { rating, comment });
      setToast({ message: 'Review submitted successfully!', type: 'success' });
      saved = true;
      await fetchEIRs();
    } catch (error) {
      console.error('Error submitting review:', error);
      setToast({ message: 'Failed to submit review. Please try again.', type: 'error' });
    }
    setIsLoading(false);
    return saved;
  };

  return (
    <div className="max-w-screen-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-purple-800">EIR Applications</h1>
      {isLoading && <Loader />}
      {toast.message && <Toast message={toast.message} type={toast.type} />}

      {applications.map((app) => {
        const reviewStatus = myReview(app)?.status || 'N/A';
        const isPending = reviewStatus === 'pending';

        return (
          <div key={app._id} className="bg-white shadow-lg rounded-lg mb-6">
            <div
              className="bg-gray-100 p-4 cursor-pointer flex justify-between items-center"
              onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
            >
              <span className="text-xl font-semibold">{app.startup_name}</span>
              <span className={`py-1 px-3 rounded-full text-sm ${getStatusStyle(reviewStatus)}`}>
                {reviewStatus}
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
                    <p><strong>Industry Experience:</strong> {app.entrepreneur.industry_experience}</p>
                    <p><strong>Previous Ventures:</strong> {app.entrepreneur.previous_ventures?.join(', ')}</p>

                    <h2 className="text-lg font-semibold text-purple-700 mt-4">Objectives</h2>
                    <p><strong>Mentorship Startups:</strong> {app.objectives?.mentorship_startups?.join(', ')}</p>
                    <p><strong>Personal Goals:</strong> {app.objectives?.personal_goals}</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-purple-700 mt-4">Application Details</h2>
                    <p><strong>Startup ID:</strong> {app.startup_id}</p>
                    <p><strong>Created At:</strong> {formatDate(app.created_at)}</p>
                    {app.status?.decision_date && (
                      <p><strong>Decision Date:</strong> {formatDate(app.status.decision_date)}</p>
                    )}
                  </div>
                </div>

                {/* Locked once my review is done; shows what I submitted */}
                <ReviewForm
                  myReview={myReview(app)}
                  disabled={!isPending}
                  onSubmit={(rating, comment) => handleSubmitReview(app._id, rating, comment)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
