// Admin dashboard (/admin). The sidebar decides which tab is shown.
import Cookie from 'js-cookie';
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, ChevronUp, Home, Users, FileText, User, Mail, Download } from 'lucide-react';
import { setStartups, setEirRequests, setGrantRequests, setVisibleDetails } from '../../redux/adminSlice';
import Sidebar from '../Sidebar';
import EIRRequests from './EirRequests';
import GrantApplicationComponent from './GrantRequests';
import StartupMessages from './Messages';
import Reviewers from './Reviewers';
import api from '../../api';

const tabs = [
  { id: 'startups', name: 'Startups', icon: Home },
  { id: 'eirrequests', name: 'EIR Requests', icon: Users },
  { id: 'grantsrequests', name: 'Grants Requests', icon: FileText },
  { id: 'reviewers', name: 'Reviewers', icon: User },
  { id: 'messages', name: 'Messages', icon: Mail },
];

export default function Admin() {
  const [selectedTab, setSelectedTab] = useState('startups');
  const isLoggedIn = Boolean(Cookie.get('admin'));

  const startups = useSelector((state) => state.admin.startups);
  const eirRequests = useSelector((state) => state.admin.eirRequests);
  const grantRequests = useSelector((state) => state.admin.grantRequests);
  const visibleDetails = useSelector((state) => state.admin.visibleDetails);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Loads all data shown on the dashboard. Tabs call it again after they change something.
  const reload = useCallback(async () => {
    try {
      const [startupsRes, eirRes, grantRes] = await Promise.all([
        api.get('/admin/startups'),
        api.get('/admin/eir-requests'),
        api.get('/admin/grant-requests'),
      ]);
      dispatch(setStartups(startupsRes.data));
      dispatch(setEirRequests([...eirRes.data].reverse()));     // newest first
      dispatch(setGrantRequests([...grantRes.data].reverse())); // newest first
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }
    reload();
  }, [isLoggedIn, navigate, reload]);

  const handleLogout = () => {
    Cookie.remove('admin');
    navigate('/');
  };

  const toggleDetails = (startupId) => {
    dispatch(setVisibleDetails(startupId));
  };

  if (!isLoggedIn) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        title="Admin Dashboard"
        items={tabs}
        selectedTab={selectedTab}
        onSelect={setSelectedTab}
        onLogout={handleLogout}
        colorClass="bg-gradient-to-b from-purple-700 via-purple-600 to-indigo-700"
      />

      <div className="flex-1 min-w-0 p-4 md:p-8 overflow-auto">
        {selectedTab === 'startups' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-3xl font-bold text-purple-800">Startups</h2>
              <Link
                to="/admin/report"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Download size={16} /> Download PDF Report
              </Link>
            </div>
            {startups.length === 0 && <p className="text-gray-600 mb-4">No startups have registered yet.</p>}
            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <th className="py-3 px-4 text-left">Company Name</th>
                    <th className="py-3 px-4 text-left">Industry</th>
                    <th className="py-3 px-4 text-left">Created At</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {startups.map((startup) => (
                    <React.Fragment key={startup._id}>
                      <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">{startup.kyc?.company_name || 'N/A'}</td>
                        <td className="py-3 px-4">{startup.kyc?.company_details?.industry || 'N/A'}</td>
                        <td className="py-3 px-4">{startup.kyc?.created_at ? new Date(startup.kyc.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-3 px-4">
                          <motion.button
                            onClick={() => toggleDetails(startup._id)}
                            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {visibleDetails === startup._id ? (
                              <>
                                Hide Details
                                <ChevronUp className="ml-2" size={16} />
                              </>
                            ) : (
                              <>
                                View Details
                                <ChevronDown className="ml-2" size={16} />
                              </>
                            )}
                          </motion.button>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {visibleDetails === startup._id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td colSpan={4}>
                              <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50">
                                <h3 className="text-xl font-semibold mb-4 text-purple-800">{startup.kyc?.company_name || 'N/A'} Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <DetailItem label="Industry" value={startup.kyc?.company_details?.industry} />
                                  <DetailItem label="Website" value={startup.kyc?.company_details?.website} />
                                  <DetailItem label="Contact Person" value={startup.kyc?.contact_person?.name} />
                                  <DetailItem label="Contact Email" value={startup.kyc?.contact_person?.email} />
                                  <DetailItem label="Contact Phone" value={startup.kyc?.contact_person?.phone} />
                                  <Link className="font-semibold text-purple-700 hover:underline" to={`/progress/${startup._id}`}>
                                    View Progress Charts →
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'eirrequests' && <EIRRequests eirRequests={eirRequests} reload={reload} />}
        {selectedTab === 'grantsrequests' && <GrantApplicationComponent grantSchemes={grantRequests} reload={reload} />}
        {selectedTab === 'reviewers' && <Reviewers />}
        {selectedTab === 'messages' && <StartupMessages />}
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="mb-2">
      <span className="font-semibold text-purple-700">{label}:</span>{' '}
      <span className="text-gray-800">{value || 'N/A'}</span>
    </div>
  );
}
