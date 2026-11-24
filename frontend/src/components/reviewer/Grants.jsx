// Reviewer tab "Grant Requests": grant applications assigned to this reviewer
import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import Toast from '../Toast';
import Loader from '../Loader';
import ReviewForm from './ReviewForm';
import api, { getErrorMessage } from '../../api';

export default function Grants() {
  const reviewer = Cookies.get('reviewer');
  const [applications, setApplications] = useState([]);
  const [expandedApp, setExpandedApp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // This reviewer's own review inside an application
  const myReview = (app) => app.reviews.find((review) => review.reviewer_id === reviewer);

  const fetchGrants = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/review/${reviewer}/grantreviews`);
      // Applications still waiting for my review come first
      const isPending = (app) => app.reviews.find((r) => r.reviewer_id === reviewer)?.status === 'pending';
      setApplications(response.data.sort((a, b) => isPending(b) - isPending(a)));
    } catch (error) {
      setToast({ message: getErrorMessage(error), type: 'error' });
    }
    setIsLoading(false);
  }, [reviewer]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  // Hide the toast after 2 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const submitReview = async (appId, rating, comment) => {
    setIsLoading(true);
    try {
      await api.post(`/review/grants/${appId}/${reviewer}`, { rating, comment });
      setToast({ message: 'Review submitted successfully!', type: 'success' });
      await fetchGrants();
    } catch (error) {
      setToast({ message: getErrorMessage(error), type: 'error' });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-screen-xl mx-auto p-2 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-purple-800">Grant Applications</h1>
      {isLoading && <Loader />}
      {toast && <Toast message={toast.message} type={toast.type} />}
      {!isLoading && applications.length === 0 && (
        <p className="text-gray-600">No grant applications have been assigned to you yet.</p>
      )}

      {applications.map((app) => {
        const status = myReview(app)?.status || 'pending';
        const { applicant, project_proposal: project } = app;
        return (
          <div key={app._id} className="bg-white shadow-lg rounded-lg mb-6">
            <div
              className="bg-gray-100 p-4 cursor-pointer flex justify-between items-center gap-2"
              onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
            >
              <span className="text-xl font-semibold">{project.project_title}</span>
              <span className={`py-1 px-3 rounded-full text-sm ${status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                {status === 'pending' ? 'Review pending' : 'Reviewed'}
              </span>
            </div>
            {expandedApp === app._id && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-purple-700 mt-4">Applicant Details</h2>
                    <p><strong>Name:</strong> {applicant.name}</p>
                    <p><strong>Email:</strong> {applicant.contact_details.email}</p>
                    <p><strong>Phone:</strong> {applicant.contact_details.phone || 'N/A'}</p>
                    <p><strong>Address:</strong> {applicant.contact_details.address || 'N/A'}</p>
                    <p><strong>Organization:</strong> {applicant.organization || 'N/A'}</p>
                    <p><strong>PAN:</strong> {applicant.pan || 'N/A'}</p>
                    <p><strong>Aadhar Number:</strong> {applicant.aadhar_num || 'N/A'}</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-purple-700 mt-4">Project Proposal</h2>
                    <p><strong>Title:</strong> {project.project_title}</p>
                    <p><strong>Description:</strong> {project.description}</p>
                    <p><strong>Total Funding Required:</strong> ₹{project.budget.total_funding_required}</p>
                    <h3 className="text-md font-semibold text-purple-700 mt-2">Funding Breakdown</h3>
                    {project.budget.funding_breakdown.map((item) => (
                      <p key={item._id}>
                        <strong>{item.item}:</strong> ₹{item.amount}
                      </p>
                    ))}
                    <p className="mt-2"><strong>Application Status:</strong> {app.grant_status.status}</p>
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
