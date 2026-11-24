// Reviewer dashboard (/reviewer). The sidebar decides which tab is shown.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';
import { Users, FileText } from 'lucide-react';
import Sidebar from '../Sidebar';
import EIRApplications from './Eir';
import Grants from './Grants';

const tabs = [
  { id: 'eirrequests', name: 'EIR Requests', icon: Users },
  { id: 'grantrequests', name: 'grantrequests', icon: FileText },
];

export default function ReviewerDashboard() {
  const [selectedTab, setSelectedTab] = useState('eirrequests');
  const isLoggedIn = Boolean(Cookie.get('reviewer'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) navigate('/reviewer/login');
  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    Cookie.remove('reviewer');
    navigate('/');
  };

  // Don't load the tabs (and their requests) while redirecting to login
  if (!isLoggedIn) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        title="Reviewer Dashboard"
        items={tabs}
        selectedTab={selectedTab}
        onSelect={setSelectedTab}
        onLogout={handleLogout}
        colorClass="bg-gradient-to-b from-teal-600 via-teal-500 to-green-500"
      />

      <div className="flex-1 p-8 overflow-auto">
        {selectedTab === 'eirrequests' && <EIRApplications />}
        {selectedTab === 'grantrequests' && <Grants />}
      </div>
    </div>
  );
}
