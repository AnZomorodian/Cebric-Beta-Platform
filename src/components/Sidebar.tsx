import { useState, useEffect } from 'react';
import { Home, Newspaper, Calendar, Trophy, BarChart3, MapPin, ArrowLeftRight, Timer, User, Sparkles, Users, Vote, X, Tv } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, currentUser, isOpenMobile, onCloseMobile }: SidebarProps) {
  const [visibilityConfig, setVisibilityConfig] = useState<Record<string, boolean>>(() => {
    if (currentUser) {
      try {
        const cached = localStorage.getItem(`sidebar_visibility_${currentUser.username}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return {};
  });

  useEffect(() => {
    const handleUpdate = () => {
      if (currentUser) {
        try {
          const cached = localStorage.getItem(`sidebar_visibility_${currentUser.username}`);
          if (cached) {
            setVisibilityConfig(JSON.parse(cached));
            return;
          }
        } catch (e) {}
      }
      setVisibilityConfig({});
    };

    handleUpdate();
    window.addEventListener('sidebar-customization-changed', handleUpdate);
    return () => {
      window.removeEventListener('sidebar-customization-changed', handleUpdate);
    };
  }, [currentUser]);

  const rawMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'news', label: 'News Feed', icon: Newspaper },
    { id: 'schedule', label: 'Race Schedule', icon: Calendar },
    { id: 'standings', label: 'Standings', icon: Trophy },
    { id: 'drivers', label: 'Drivers & Teams', icon: BarChart3 },
    { id: 'live-stream', label: 'Live Stream', icon: Tv },
    { id: 'circuits', label: 'Circuits', icon: MapPin },
    { id: 'compare', label: 'Head to Head', icon: ArrowLeftRight },
    { id: 'laps', label: 'Lap Telemetry', icon: Timer },
    { id: 'polls', label: 'Paddock Polls', icon: Vote },
    { id: 'predictions', label: 'F1 Prediction', icon: Sparkles },
    { id: 'auth', label: 'User Hub', icon: User },
  ];

  const menuItems = rawMenuItems.filter(item => {
    if (item.id === 'dashboard' || item.id === 'auth') {
      return true;
    }
    if (currentUser && visibilityConfig && visibilityConfig[item.id] === false) {
      return false;
    }
    if (!currentUser) {
      if (item.id === 'predictions' || item.id === 'compare' || item.id === 'laps' || item.id === 'live-stream') {
        return false;
      }
    }
    return true;
  });

  const handleItemClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay - Z-45 to be higher than components, below Sidebar at Z-50 */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-45 md:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      <aside 
        id="sidebar-nav"
        className={`fixed top-0 bottom-0 bg-[#111] border-r border-[#222] flex flex-col items-center py-6 z-50 text-white transition-all duration-300 md:w-16 md:left-0 md:translate-x-0 ${
          isOpenMobile ? 'left-0 w-64 translate-x-0' : '-translate-x-full md:translate-x-0 w-16'
        }`}
      >
        {/* Brand Logo/Emblem inside mobile side nav */}
        <div className="w-full flex items-center justify-between px-5 mb-6 md:mb-8 md:justify-center md:px-0 select-none">
          <div className="flex items-center gap-2 md:flex-col md:gap-0">
            <span className="text-xl font-black tracking-tighter text-red-500 font-mono">CB</span>
            <span className="text-[7px] font-semibold text-gray-400 font-mono tracking-widest leading-none mt-0.5 md:block hidden">BETA</span>
            {isOpenMobile && <span className="text-[10px] font-black text-gray-300 tracking-wider font-mono ml-1.5 md:hidden">PADDOCK HUB</span>}
          </div>
          {isOpenMobile && (
            <button 
              onClick={onCloseMobile}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg md:hidden outline-none cursor-pointer border-none bg-transparent"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-2 md:gap-4 w-full px-2 overflow-y-auto scrollbar-none" id="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => handleItemClick(item.id)}
                className={`relative group flex items-center w-full rounded-xl transition-all duration-200 outline-none p-3.5 md:justify-center md:h-12 md:p-0 ${
                  isActive 
                    ? 'bg-white text-black font-semibold md:scale-105 shadow-md shadow-black/40' 
                    : 'text-gray-400 hover:text-white hover:bg-[#222]'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3.5 md:gap-0">
                  <Icon size={18} className="stroke-[2.2px] shrink-0" />
                  <span className={`text-xs md:hidden font-bold tracking-wide ${isActive ? 'text-black font-black' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                </div>
                
                {/* Tooltip */}
                <div 
                  className="hidden md:block absolute left-16 px-3 py-1.5 bg-[#1e1e1e] text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-[#333] z-50"
                >
                  {item.label}
                </div>

                {/* Selection Dot */}
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#EF1A2D] rounded-l-full md:block hidden" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info Accent */}
        <div className="mt-auto pt-4 flex flex-col items-center gap-1.5 text-[10px] font-mono text-gray-400 tracking-tighter w-full">
          <span>V1.4</span>
        </div>
      </aside>
    </>
  );
}
