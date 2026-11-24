// Page where the admin picks reviewers for one application.
// Used for both kinds of applications:
//   /selectreviewers/:id         -> type="eir"
//   /grants/selectreviewers/:id  -> type="grant"
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Check, Search } from 'lucide-react';
import Toast from '../Toast';
import Loader from '../Loader';
import api, { getErrorMessage } from '../../api';

export default function SelectReviewers({ type }) {
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
      setToast({ type: 'success', message: 'Reviewers assigned successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: getErrorMessage(error) });
    }
    setLoading(false);
  };

  const search = searchTerm.toLowerCase();
  const filteredReviewers = reviewers.filter((reviewer) =>
    [reviewer.name, reviewer.email, reviewer.organization, reviewer.about]
      .some((text) => (text || '').toLowerCase().includes(search))
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <nav className="bg-indigo-600 text-white py-4 px-6 shadow-md flex flex-wrap gap-2 items-center justify-between">
        <h1 className="text-2xl font-bold">{type === 'eir' ? 'EIR' : 'Grants'} Reviewer Selection</h1>
        <Link to="/admin" className="text-teal-200 hover:underline">← Back to Admin</Link>
      </nav>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
      {loading && <Loader />}

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mt-4">
        <div className="flex flex-col md:flex-row">
          {/* Left column: details of the application */}
          <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-200 space-y-4">
            {application && type === 'eir' && <EirSummary eir={application} />}
            {application && type === 'grant' && <GrantSummary grant={application} />}
          </div>

          {/* Right column: reviewer checklist */}
          <div className="md:w-2/3 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <h2 className="text-2xl font-semibold text-indigo-700">Select Reviewers</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search reviewers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <button
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                  onClick={toggleAllReviewers}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {reviewers.length === 0 && !loading && (
              <p className="text-gray-600">No reviewers yet. Add some in the admin "Reviewers" tab.</p>
            )}

            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredReviewers.map((reviewer) => {
                const isSelected = selectedReviewers.includes(reviewer._id);
                return (
                  <div
                    key={reviewer._id}
                    className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer border ${isSelected ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-transparent'}`}
                    onClick={() => toggleReviewer(reviewer._id)}
                  >
                    <div
                      className={`w-6 h-6 flex-shrink-0 border-2 rounded-md flex items-center justify-center transition-colors duration-200 ${
                        isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="text-white" size={16} />}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold">{reviewer.name}</h3>
                      <p className="text-sm text-gray-600">{reviewer.email}</p>
                      {reviewer.organization && (
                        <p className="text-sm mt-1">
                          <Briefcase className="inline-block h-4 w-4 mr-1 text-purple-600" />
                          {reviewer.organization}
                        </p>
                      )}
                      {reviewer.about && <p className="text-sm mt-1">{reviewer.about}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-center">
          <motion.button
            className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveReviewers}
          >
            Assign Selected Reviewers ({selectedReviewers.length})
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function EirSummary({ eir }) {
  return (
    <>
      <h2 className="text-2xl font-semibold text-indigo-700">{eir.startup_name}</h2>
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
        <p>{eir.entrepreneur.previous_ventures.join(', ') || 'N/A'}</p>
      </div>
      <div>
        <p className="font-semibold">Industry Experience:</p>
        <p>{eir.entrepreneur.industry_experience || 'N/A'}</p>
      </div>
      <p className="font-semibold">Status: <span className="text-indigo-600">{eir.status.status}</span></p>
    </>
  );
}

function GrantSummary({ grant }) {
  const { applicant, project_proposal: project } = grant;
  return (
    <>
      <h2 className="text-2xl font-semibold text-indigo-700">Applicant Information</h2>
      <div>
        <p><strong>Name:</strong> {applicant.name}</p>
        <p><strong>Organization:</strong> {applicant.organization || 'N/A'}</p>
        <p><strong>Phone:</strong> {applicant.contact_details.phone || 'N/A'}</p>
        <p><strong>Email:</strong> {applicant.contact_details.email}</p>
        <p><strong>Address:</strong> {applicant.contact_details.address || 'N/A'}</p>
      </div>
      <h2 className="text-2xl font-semibold text-indigo-700">Project Proposal</h2>
      <div>
        <p><strong>Title:</strong> {project.project_title}</p>
        <p><strong>Description:</strong> {project.description}</p>
        <p><strong>Funding Required:</strong> ₹{project.budget.total_funding_required}</p>
        <ul className="list-disc list-inside">
          {project.budget.funding_breakdown.map((item) => (
            <li key={item._id}>{item.item}: ₹{item.amount}</li>
          ))}
        </ul>
        <p><strong>Status:</strong> {grant.grant_status.status}</p>
      </div>
    </>
  );
}
