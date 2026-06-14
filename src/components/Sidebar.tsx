import { Home, Calendar, Trophy, BarChart3, MapPin, ArrowLeftRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'schedule', label: 'Race Schedule', icon: Calendar },
    { id: 'standings', label: 'Standings', icon: Trophy },
    { id: 'drivers', label: 'Drivers & Teams', icon: BarChart3 },
    { id: 'circuits', label: 'Circuits', icon: MapPin },
    { id: 'compare', label: 'Head to Head', icon: ArrowLeftRight },
  ];

  return (
    <aside 
      id="sidebar-nav"
      className="fixed left-0 top-0 bottom-0 w-16 bg-[#111] border-r border-[#222] flex flex-col items-center py-6 z-50 text-white"
    >
      {/* Brand Logo/Emblem */}
      <div className="mb-8 flex items-center justify-center">
        <span className="text-xl font-bold tracking-tighter text-red-500 font-mono">F1</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-2" id="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 outline-none ${
                isActive 
                  ? 'bg-white text-black font-semibold scale-105 shadow-md shadow-black/40' 
                  : 'text-gray-400 hover:text-white hover:bg-[#222]'
              }`}
              title={item.label}
            >
              <Icon size={20} className="stroke-[2px]" />
              
              {/* Tooltip */}
              <div 
                className="absolute left-16 px-3 py-1.5 bg-[#1e1e1e] text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-[#333]"
              >
                {item.label}
              </div>

              {/* Selection Dot */}
              {isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-red-500 rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Accent */}
      <div className="mt-auto flex flex-col items-center text-[10px] font-mono text-gray-400 tracking-tighter">
        <span>V1.0</span>
      </div>
    </aside>
  );
}
