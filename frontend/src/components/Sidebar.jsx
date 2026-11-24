// The left side menu used by the Admin and Reviewer dashboards.
// It looks and animates exactly like the original AdminNavbar / reviewer Navbar.
//
// Props:
//   title       - text at the top, e.g. "Admin Dashboard"
//   items       - [{ id: 'startups', name: 'Startups', icon: SomeIcon }, ...]
//   selectedTab - id of the item that is currently open
//   onSelect    - called with an item's id when it is clicked
//   onLogout    - called when "Logout" is clicked
//   colorClass  - Tailwind background classes for the menu
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, LogOut } from 'lucide-react';

export default function Sidebar({ title, items, selectedTab, onSelect, onLogout, colorClass }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Logout is shown as the last item of the list
  const allItems = [...items, { id: 'logout', name: 'Logout', icon: LogOut }];

  return (
    <motion.div
      initial={{ width: 250 }}
      animate={{ width: isExpanded ? 250 : 80 }}
      transition={{ duration: 0.3 }}
      className={`h-screen ${colorClass} text-white shadow-lg`}
    >
      <div className="p-6">
        <motion.h1
          initial={{ opacity: 1 }}
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-2xl font-bold"
        >
          {isExpanded ? title : ''}
        </motion.h1>
      </div>
      <div className="flex justify-between p-4">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={24} className={!isExpanded ? '' : 'rotate-180'} />
        </motion.button>
      </div>
      <nav className="mt-8 flex-1">
        {allItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => (item.id === 'logout' ? onLogout() : onSelect(item.id))}
            className={`w-full text-left p-4 flex items-center space-x-4 hover:bg-white/10 transition-colors ${
              selectedTab === item.id ? 'bg-white/20' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <item.icon size={24} />
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? item.name : ''}
            </motion.span>
          </motion.button>
        ))}
      </nav>
    </motion.div>
  );
}
