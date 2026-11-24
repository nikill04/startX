// Page where the admin picks reviewers for one application.
// Used for both kinds of applications:
//   /selectreviewers/:id         -> type="eir"
//   /grants/selectreviewers/:id  -> type="grant"
// The two pages look slightly different (as they always did), so some classes depend on "isEir".
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { Briefcase, Check, Search } from 'lucide-react';
import Toast from '../Toast';
import Loader from '../Loader';
import api, { getErrorMessage } from '../../api';

export default function SelectReviewers({ type }) {
  const isEir = type === 'eir';
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]); // list of reviewer ids
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Load the application and the list of all reviewers
  useEffect(() => {
    if (!Cookies.get('admin')) {
      navigate('/admin/login');
      return;
    }
    const loadData = async () => {
      try {
        const [applicationRes, reviewersRes] = await Promise.all([
          api.get(`/admin/${type}/${id}`),
          api.get('/review/reviewers'),
        ]);
        setApplication(applicationRes.data);
        setSelectedReviewers(applicationRes.data.reviews.map((review) => review.reviewer_id));
        setReviewers(reviewersRes.data);
      } catch (error) {
        setToast({ type: 'error', message: getErrorMessage(error) });
      }
      setLoading(false);
    };
    loadData();
  }, [type, id, navigate]);

  // Hide the toast after 2 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const toggleReviewer = (reviewerId) => {
    if (selectedReviewers.includes(reviewerId)) {
      setSelectedReviewers(selectedReviewers.filter((selectedId) => selectedId !== reviewerId));
    } else {
      setSelectedReviewers([...selectedReviewers, reviewerId]);
    }
  };

  const allSelected = reviewers.length > 0 && selectedReviewers.length === reviewers.length;
  const toggleAllReviewers = () => {
    setSelectedReviewers(allSelected ? [] : reviewers.map((reviewer) => reviewer._id));
  };

  const saveReviewers = async () => {
    setLoading(true);
    try {
      await api.post(`/admin/${type}/selectreviewer/${id}`, selectedReviewers);
      setToast({ type: 'success', message: 'Reviewer selected successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: getErrorMessage(error) });
    }
    setLoading(false);
  };

  const search = searchTerm.toLowerCase();
  const filteredReviewers = reviewers.filter((reviewer) =>
    [reviewer.name, reviewer.organization, reviewer.about]
      .some((text) => (text || '').toLowerCase().includes(search))
  );

  const searchInput = (
    <input
      type="text"
      placeholder="Search reviewers..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className={isEir
        ? 'pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        : 'pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500'}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <nav className="bg-indigo-600 text-white py-4 px-6 shadow-md flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEir ? 'EIR' : 'Grants'} Reviewer Selection</h1>
        <Link to="/admin" className="text-teal-200 hover:underline">Back to Admin</Link>
      </nav>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mt-4">
        {loading ? (
          <Loader />
        ) : (
          <div className="flex flex-col md:flex-row">
            {/* Left column: details of the application */}
            {isEir ? <EirSummary eir={application} /> : <GrantSummary grant={application} />}

            {/* Right column: reviewer checklist */}
            <div className="md:w-2/3 p-6">
              <div
                className={isEir
                  ? 'flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0'
                  : 'flex justify-between items-center mb-4'}
              >
                <h2 className="text-2xl font-semibold text-indigo-700">Select Reviewers</h2>
                <div className="flex items-center space-x-2">
                  {isEir ? (
                    <div className="relative">
                      {searchInput}
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  ) : (
                    searchInput
                  )}
                  <button
                    className={isEir
                      ? 'bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors'
                      : 'bg-teal-500 text-white px-4 py-2 rounded-lg'}
                    onClick={toggleAllReviewers}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredReviewers.map((reviewer) => {
                  const isSelected = selectedReviewers.includes(reviewer._id);
                  return isEir ? (
                    <div
                      key={reviewer._id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => toggleReviewer(reviewer._id)}
                    >
                      <div
                        className={`w-6 h-6 border-2 rounded-md ${
                          isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                        } flex items-center justify-center transition-colors duration-200`}
                      >
                        {isSelected && <Check className="text-white" size={16} />}
                      </div>
                      <div className="flex-grow cursor-pointer">
                        <h3 className="text-lg font-semibold">{reviewer.name}</h3>
                        <p className="text-sm text-gray-600">{reviewer.email}</p>
                        <p className="text-sm mt-1">
                          <Briefcase className="inline-block h-4 w-4 mr-1 text-purple-600" />
                          {reviewer.organization}
                        </p>
                        <p className="text-sm mt-1">{reviewer.about}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={reviewer._id}
                      className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => toggleReviewer(reviewer._id)}
                    >
                      <div
                        className={`w-6 h-6 border-2 rounded-md ${
                          isSelected ? 'bg-purple-600' : 'border-gray-300'
                        } flex items-center justify-center`}
                      >
                        {isSelected && <Check className="text-white" size={16} />}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold">{reviewer.name}</h3>
                        <p className="text-sm">{reviewer.email}</p>
                        <p className="text-sm">{reviewer.organization}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div className={isEir ? 'p-6 bg-gray-50 border-t border-gray-200' : 'p-6 bg-gray-50 border-t'}>
          <motion.button
            className={isEir
              ? 'w-full max-w-sm mx-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300'
              : 'w-full bg-indigo-600 text-white font-bold py-2 rounded-lg'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveReviewers}
          >
            Assign Selected Reviewers
          </motion.button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

// Left column of the EIR page
function EirSummary({ eir }) {
  return (
    <div className="md:w-1/3 p-6 border-r border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-700">{eir?.startup_name}</h2>
      {eir && (
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Entrepreneur:</p>
            <p>{eir.entrepreneur.name}</p>
            <p className="text-indigo-600">{eir.entrepreneur.email}</p>
          </div>
          <div>
            <p className="font-semibold">Background:</p>
            <p>{eir.entrepreneur.background}</p>
          </div>
          <div>
            <p className="font-semibold">Previous Ventures:</p>
            <p>{eir.entrepreneur.previous_ventures?.join(', ')}</p>
          </div>
          <div>
            <p className="font-semibold">Industry Experience:</p>
            <p>{eir.entrepreneur.industry_experience}</p>
          </div>
          <div>
            <p className="font-semibold">Status: <span className="text-indigo-600">{eir.status?.status}</span></p>
            {/* No decision yet -> leave the date empty instead of showing "Invalid Date" */}
            <p>Decision Date: {eir.status?.decision_date ? new Date(eir.status.decision_date).toLocaleDateString() : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Left column of the grant page
function GrantSummary({ grant }) {
  return (
    <div className="md:w-1/3 p-6 border-r border-gray-200 space-y-4">
      <h2 className="text-2xl font-semibold text-indigo-700">Applicant Information</h2>
      {grant && (
        <div>
          <p><strong>Name:</strong> {grant.applicant.name}</p>
          <p><strong>Organization:</strong> {grant.applicant.organization}</p>
          <p><strong>Contact:</strong> {grant.applicant.contact_details.phone}</p>
          <p><strong>Email:</strong> {grant.applicant.contact_details.email}</p>
          <p><strong>Address:</strong> {grant.applicant.contact_details.address}</p>
          <p><strong>PAN:</strong> {grant.applicant.pan}</p>
          <p><strong>Aadhar:</strong> {grant.applicant.aadhar_num}</p>
        </div>
      )}

      <h2 className="text-2xl font-semibold text-indigo-700 mt-6">Project Proposal Details</h2>
      {grant && (
        <div>
          <p><strong>Title:</strong> {grant.project_proposal.project_title}</p>
          <p><strong>Description:</strong> {grant.project_proposal.description}</p>
          <p><strong>Funding Required:</strong> ₹{grant.project_proposal.budget.total_funding_required}</p>
          <ul>
            {grant.project_proposal.budget.funding_breakdown.map((item, index) => (
              <li key={item._id || index}><strong>{item.item}:</strong> ₹{item.amount}</li>
            ))}
          </ul>
          <p><strong>Status:</strong> {grant.grant_status?.status}</p>
        </div>
      )}
    </div>
  );
}
