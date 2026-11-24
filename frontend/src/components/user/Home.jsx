// The startup's dashboard (/home). The navbar decides which section is shown.
import React, { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Navbar';
import StartupDetails from './Startupdetails';
import EIRDetails from './EirDetails';
import GrantDetails from './GrantDetails';
import Messages from './Messages';
import MonthlyProgress from './MonthlyProgress';
import api from '../../api';
import { setUserData, setStartupData, setEirData, setGrantSchemeData } from '../../redux/startupSlice';

export default function StartupHomepage() {
  const [activeComponent, setActiveComponent] = useState('details');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = Cookies.get('user');
  const startup = Cookies.get('startup');

  const startupData = useSelector((state) => state.startup.startupData);
  const eirData = useSelector((state) => state.startup.eirData);
  const grantSchemeData = useSelector((state) => state.startup.grantSchemeData);

  // Loads everything for this startup. Sections call it again after submitting a form.
  const reload = useCallback(async () => {
    try {
      const { data } = await api.get(`/user/home/${user}/${startup}`);
      dispatch(setUserData(data.user));
      dispatch(setStartupData(data.startup));
      dispatch(setEirData(data.eirRecords));
      dispatch(setGrantSchemeData(data.grantRecords));
    } catch (error) {
      // The saved login is no longer valid (e.g. the database was reset): log in again
      Cookies.remove('user');
      Cookies.remove('startup');
      navigate('/login');
    }
  }, [user, startup, dispatch, navigate]);

  useEffect(() => {
    if (!user || !startup) {
      navigate('/login');
      return;
    }
    reload();
  }, [user, startup, navigate, reload]);

  // Only show the data once it is loaded and belongs to the logged-in startup
  const loaded = startupData && startupData._id === startup;

  return (
    <div className="flex bg-white flex-col min-h-screen">
      <Navbar setActiveComponent={setActiveComponent} />
      <main className="container mx-auto px-4 py-8 flex-grow text-gray-800">
        {activeComponent === 'details' && loaded && (
          <StartupDetails kyc={startupData.kyc} progress={startupData.progress} />
        )}
        {activeComponent === 'eir' && loaded && <EIRDetails eirList={eirData} reload={reload} />}
        {activeComponent === 'grant' && loaded && <GrantDetails grant={grantSchemeData} reload={reload} />}
        {activeComponent === 'messages' && <Messages />}
        {activeComponent === 'monthly' && loaded && (
          <MonthlyProgress progress={startupData.progress} reload={reload} />
        )}
      </main>
      <footer className="bg-gray-200 text-gray-800 py-4 text-center">
        StartX. . 
      </footer>
    </div>
  );
}
