// Reviewer tab "grantrequests": grant applications assigned to this reviewer
import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import ReviewForm from './ReviewForm';
import api from '../../api';

const getStatusStyle = (status) => {
  return status === 'Under Review'
    ? 'bg-yellow-200 text-yellow-800'
    : 'bg-green-200 text-green-800';
};

export default function Grants() {
  const [expandedApp, setExpandedApp] = useState(null);
  const reviewer = Cookies.get('reviewer');
  const [applications, setApplications] = useState([]);

  const fetchGrants = useCallback(async () => {
    try {
      const response = await api.get(`/review/${reviewer}/grantreviews`);
      // Applications that are 'Under Review' come first
      const sortedApplications = response.data.sort((a, b) => {
        if (a.grant_status.status === 'Under Review' && b.grant_status.status !== 'Under Review') return -1;
        if (a.grant_status.status !== 'Under Review' && b.grant_status.status === 'Under Review') return 1;
        return 0;
      });
      setApplications(sortedApplications);
    } catch (error) {
      console.error(error);
    }
  }, [reviewer]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  // Returns true when the review was saved
  const handleSubmitReview = async (appId, rating, comment) => {
    try {
      await api.post(`/review/grants/${appId}/${reviewer}`, { rating, comment });
      alert('Review submitted successfully!');
      fetchGrants(); // Refresh the data
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
      return false;
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-purple-800">Grants Applications</h1>
      {applications.map((app) => {
        const isPending = app.grant_status.status === 'Under Review';
        return (
          <div key={app._id} className="bg-white shadow-lg rounded-lg mb-6">
            <div
              className="bg-gray-100 p-4 cursor-pointer flex justify-between items-center"
              onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
            >
              <span className="text-xl font-semibold">{app.project_proposal.project_title}</span>
              <span className={`py-1 px-3 rounded-full text-sm ${getStatusStyle(app.grant_status.status)}`}>
                {app.grant_status.status}
              </span>
            </div>
            {expandedApp === app._id && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-purple-700 mt-4">Applicant Details</h2>
                    <p><strong>Name:</strong> {app.applicant.name}</p>
                    <p><strong>Email:</strong> {app.applicant.contact_details.email}</p>
                    <p><strong>Phone:</strong> {app.applicant.contact_details.phone}</p>
                    <p><strong>Address:</strong> {app.applicant.contact_details.address}</p>
                    <p><strong>Organization:</strong> {app.applicant.organization}</p>
                    <p><strong>PAN:</strong> {app.applicant.pan}</p>
                    <p><strong>Aadhar Number:</strong> {app.applicant.aadhar_num}</p>

                    <h2 className="text-lg font-semibold text-purple-700 mt-4">Project Proposal</h2>
                    <p><strong>Title:</strong> {app.project_proposal.project_title}</p>
                    <p><strong>Description:</strong> {app.project_proposal.description}</p>
                    <p><strong>Objectives:</strong> {app.project_proposal.objectives?.join(', ') || 'N/A'}</p>
                    <p><strong>Total Funding Required:</strong> ₹{app.project_proposal.budget.total_funding_required}</p>
                    <h3 className="text-md font-semibold text-purple-700 mt-2">Funding Breakdown</h3>
                    {app.project_proposal.budget.funding_breakdown.map((item) => (
                      <p key={item._id}>
                        <strong>{item.item}:</strong> ₹{item.amount}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Reviews are taken while the admin keeps the grant 'Under Review' */}
                {isPending && (
                  <ReviewForm
                    clearAfterSubmit
                    onSubmit={(rating, comment) => handleSubmitReview(app._id, rating, comment)}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
