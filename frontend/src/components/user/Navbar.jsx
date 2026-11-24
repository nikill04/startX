// Top navigation bar of the startup dashboard (/home)
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navItems = [
  { id: 'details', name: 'Startup Details' },
  { id: 'eir', name: 'EIR Application' },
  { id: 'grant', name: 'Grants Application' },
  { id: 'messages', name: 'Messages' },
  { id: 'monthly', name: 'Monthly Progress' },
];

export default function Navbar({ activeComponent, setActiveComponent }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // only used on small screens

  const logout = () => {
    Cookies.remove('user');
    Cookies.remove('startup');
    navigate('/');
  };

  const openSection = (id) => {
    setActiveComponent(id);
    setIsMenuOpen(false);
  };

  const buttonClass = (id) =>
    `px-3 py-2 rounded-md text-sm font-medium text-left transition-colors duration-200 ${
      activeComponent === id ? 'bg-white/20' : 'hover:bg-white/10'
    }`;

  const links = (
    <>
      {navItems.map((item) => (
        <button key={item.id} className={buttonClass(item.id)} onClick={() => openSection(item.id)}>
          {item.name}
        </button>
      ))}
      <button
        className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors duration-200"
        onClick={logout}
      >
        Log Out
      </button>
    </>
  );

  return (
    <header className="bg-gray-900 text-white">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button className="text-3xl font-bold text-red-600" onClick={() => openSection('details')}>
          StartX
        </button>

        {/* Big screens: links in one row */}
        <div className="hidden lg:flex items-center gap-2">{links}</div>

        {/* Small screens: a menu button */}
        <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {isMenuOpen && <div className="lg:hidden flex flex-col gap-1 px-4 pb-4">{links}</div>}
    </header>
  );
}
