// The left side menu used by the Admin and Reviewer dashboards.
//
// Props:
//   title       - text at the top, e.g. "Admin Dashboard"
//   items       - [{ id: 'startups', name: 'Startups', icon: SomeIcon }, ...]
//   selectedTab - id of the item that is currently open
//   onSelect    - called with an item's id when it is clicked
//   onLogout    - called when "Logout" is clicked
//   colorClass  - Tailwind background classes for the menu
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

export default function Sidebar({ title, items, selectedTab, onSelect, onLogout, colorClass }) {
  // Start collapsed on small (phone) screens so the page content has room
  const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 768);

  const itemClass = 'w-full p-4 flex items-center gap-4 hover:bg-white/10 transition-colors';

  return (
    <aside
      className={`${isExpanded ? 'w-64' : 'w-20'} flex-shrink-0 h-screen sticky top-0 flex flex-col text-white shadow-lg transition-all duration-300 ${colorClass}`}
    >
      <div className="p-4 flex items-center justify-between gap-2">
        {isExpanded && <h1 className="text-xl font-bold">{title}</h1>}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          title={isExpanded ? 'Collapse menu' : 'Expand menu'}
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="mt-4 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            title={item.name}
            className={`${itemClass} ${selectedTab === item.id ? 'bg-white/20 font-semibold' : ''}`}
          >
            <item.icon size={24} className="flex-shrink-0" />
            {isExpanded && <span>{item.name}</span>}
          </button>
        ))}
      </nav>

      <button onClick={onLogout} title="Logout" className={`${itemClass} mb-4`}>
        <LogOut size={24} className="flex-shrink-0" />
        {isExpanded && <span>Logout</span>}
      </button>
    </aside>
  );
}
