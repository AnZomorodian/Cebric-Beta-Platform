import { useState, useEffect } from 'react';
import { Menu, Tv } from 'lucide-react';
import { fetchSeasonData, fetchSeasonsList } from './services/ergast';
import { SeasonData } from './types';

// Components
import Sidebar from './components/Sidebar';
import SeasonSelector from './components/SeasonSelector';
import DashboardTab from './components/DashboardTab';
import NewsTab from './components/NewsTab';
import ScheduleTab from './components/ScheduleTab';
import StandingsTab from './components/StandingsTab';
import DriversTab from './components/DriversTab';
import CircuitsTab from './components/CircuitsTab';
import LiveStreamTab from './components/LiveStreamTab';
import CompareTab from './components/CompareTab';
import LapTimesTab from './components/LapTimesTab';
import PredictionsTab from './components/PredictionsTab';
import AuthTab from './components/AuthTab';
import PollsTab from './components/PollsTab';
import GlobalSearch from './components/GlobalSearch';

// Dynamic Helper component for active notifications with countdown timers
const AlertBanner = ({ alert, onDismiss }: { alert: any, onDismiss: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!alert.expiresAt) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const diffMs = new Date(alert.expiresAt).getTime() - Date.now();
      if (diffMs <= 0) {
        onDismiss();
        return;
      }
      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    };

    updateTimer();
    const subInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(subInterval);
  }, [alert.id, alert.expiresAt, onDismiss]);

  return (
    <div className="bg-neutral-950 border-b border-red-500/30 text-white py-2.5 px-6 flex items-center justify-between text-[11px] font-mono select-none animate-pulse relative z-10 w-full" id="global-paddock-alert">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF1A2D]"></span>
        </span>
        <span className="text-[9px] bg-[#EF1A2D] text-white font-extrabold px-1.5 py-0.5 rounded tracking-widest uppercase shrink-0">
          PADDOCK BULLETIN: {alert.category || 'DIRECTIVE'}
        </span>
        <p className="font-bold truncate text-[11px] text-gray-200">
          <strong className="text-white uppercase">{alert.title}:</strong> {alert.content}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 font-bold ml-4">
        {timeLeft && (
          <span className="text-[9px] bg-neutral-900 border border-amber-500/40 text-amber-400 px-2.5 py-0.5 rounded flex items-center gap-1.5 shrink-0">
            ⏳ EXPIRES IN: <span className="font-mono text-white select-all">{timeLeft}</span>
          </span>
        )}
        <button 
          onClick={onDismiss}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs font-black p-1 hover:bg-neutral-850 rounded border-none bg-transparent"
          title="Dim Banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSeason, setSelectedSeason] = useState<string>('2026');
  const [seasons, setSeasons] = useState<string[]>([]);
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [activeAlert, setActiveAlert] = useState<any | null>(null);

  // Poll for active announcements
  const fetchActiveAlert = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const d = await res.json();
        if (d.success && Array.isArray(d.announcements) && d.announcements.length > 0) {
          const now = Date.now();
          const valid = d.announcements.find((a: any) => {
            if (a.expiresAt) {
              return new Date(a.expiresAt).getTime() > now;
            }
            return true;
          });
          setActiveAlert(valid || null);
        } else {
          setActiveAlert(null);
        }
      }
    } catch (e) {
      console.log('Announcements interface loaded, syncing changes...', e);
    }
  };

  useEffect(() => {
    // Delay first load by 1.5 seconds to give Vite/Express time to initialize gracefully
    const delayTimer = setTimeout(() => {
      fetchActiveAlert();
    }, 1500);

    const interval = setInterval(fetchActiveAlert, 10000);
    return () => {
      clearTimeout(delayTimer);
      clearInterval(interval);
    };
  }, []);

  // Instantly recover user session from cache on mount and sync latest status
  useEffect(() => {
    const cached = localStorage.getItem('f1_user_session');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setCurrentUser(parsed);

        // Fetch latest verification or ban status from the backend
        fetch(`/api/user-status?username=${encodeURIComponent(parsed.username)}`)
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error('Deferred session refresh');
          })
          .then((statusData) => {
            if (statusData.isBanned) {
              localStorage.removeItem('f1_user_session');
              setCurrentUser(null);
            } else {
              const updated = {
                ...parsed,
                isVerified: statusData.isVerified,
                verifyStyle: statusData.verifyStyle,
                isAdmin: statusData.isAdmin,
                isBanned: statusData.isBanned
              };
              localStorage.setItem('f1_user_session', JSON.stringify(updated));
              setCurrentUser(updated);
            }
          })
          .catch((err) => {
            console.warn('Session refresh deferred:', err);
          });
      } catch (e) {
        localStorage.removeItem('f1_user_session');
      }
    }
  }, []);

  // Fetch dynamic seasons list once on app start
  useEffect(() => {
    async function loadSeasons() {
      try {
        const list = await fetchSeasonsList();
        setSeasons(list);
      } catch (err) {
        console.error('Error fetching dynamic seasons', err);
      }
    }
    loadSeasons();
  }, []);

  // Fetch season statistics on selectedSeason change
  useEffect(() => {
    let active = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchSeasonData(selectedSeason);
        if (active) {
          setSeasonData(data);
        }
      } catch (err) {
        console.error('Error fetching season F1 statistics', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [selectedSeason]);

  // Handler to switch tabs easily
  const handleGoToTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Synchronous route guard for locked tabs on session expiration/logout
  useEffect(() => {
    if (!currentUser) {
      if (activeTab === 'predictions' || activeTab === 'compare' || activeTab === 'laps') {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser, activeTab]);

  return (
    <div id="app-root" className="min-h-screen bg-[#fafafa] flex text-black antialiased font-sans flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-[#111] border-b border-[#222] text-white select-none z-30">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-1.5 hover:bg-neutral-800 rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer outline-none border-none bg-transparent"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-base font-black tracking-tighter text-[#EF1A2D] font-mono">CB</span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-[#EF1A2D]/10 text-[#EF1A2D] border border-[#EF1A2D]/30 px-2.5 py-0.5 rounded-full">F1 Paddock</span>
        </div>
        <div 
          className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-mono font-extrabold text-[#EF1A2D] uppercase select-none cursor-pointer hover:bg-neutral-750 transition-colors" 
          onClick={() => {
            setActiveTab('auth');
            setIsMobileSidebarOpen(false);
          }}
        >
          {currentUser ? currentUser.username.substring(0, 2) : '??'}
        </div>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Panel Content Container (offsets Sidebar) */}
      <div className="flex-1 flex flex-col md:pl-16 min-w-0" id="main-content-lane">
        
        {/* Horizontal Scrollable Season Selector Pinned Top */}
        <SeasonSelector 
          selectedSeason={selectedSeason} 
          onSelectSeason={setSelectedSeason} 
          seasons={seasons}
        >
          <GlobalSearch 
            seasonData={seasonData} 
            onGoToTab={handleGoToTab} 
            selectedSeason={selectedSeason}
          />
        </SeasonSelector>

        {activeAlert && (
          <AlertBanner 
            alert={activeAlert} 
            onDismiss={() => setActiveAlert(null)} 
          />
        )}

        {/* Content Wrapper Container */}
        <main 
          id="tab-content-container" 
          className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-10"
        >
          {activeTab === 'dashboard' && seasonData && (
            <DashboardTab 
              data={seasonData} 
              isLoading={isLoading} 
              onGoToTab={handleGoToTab} 
            />
          )}

          {activeTab === 'news' && (
            <NewsTab />
          )}

          {activeTab === 'schedule' && seasonData && (
            <ScheduleTab 
              races={seasonData.races} 
              isLoading={isLoading} 
              season={selectedSeason} 
            />
          )}

          {activeTab === 'standings' && seasonData && (
            <StandingsTab 
              driverStandings={seasonData.driverStandings} 
              constructorStandings={seasonData.constructorStandings} 
              isLoading={isLoading} 
              season={selectedSeason} 
            />
          )}

          {activeTab === 'drivers' && seasonData && (
            <DriversTab 
              driverStandings={seasonData.driverStandings} 
              isLoading={isLoading} 
              season={selectedSeason} 
            />
          )}

          {activeTab === 'live-stream' && (
            currentUser ? (
              <LiveStreamTab />
            ) : (
              <div className="flex flex-col items-center justify-center p-16 bg-white border border-gray-150 rounded-3xl text-center shadow-xs">
                <Tv size={45} className="text-gray-300 mb-3" />
                <p className="text-gray-700 text-sm font-bold">Live Stream Reserved for Players</p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">Please log in or sign up under the <strong>User Hub</strong> tab to access live stream links and interactive paddock discussions.</p>
              </div>
            )
          )}

          {activeTab === 'circuits' && seasonData && (
            <CircuitsTab 
              races={seasonData.races} 
              isLoading={isLoading} 
              season={selectedSeason} 
            />
          )}

          {activeTab === 'compare' && seasonData && (
            <CompareTab 
              driverStandings={seasonData.driverStandings} 
              isLoading={isLoading} 
              season={selectedSeason} 
            />
          )}

          {activeTab === 'laps' && seasonData && (
            <LapTimesTab 
              data={seasonData} 
              isLoading={isLoading} 
            />
          )}

          {activeTab === 'polls' && (
            <PollsTab />
          )}

          {activeTab === 'predictions' && (
            <PredictionsTab seasonData={seasonData} />
          )}

          {activeTab === 'auth' && (
            <AuthTab onSessionUpdate={setCurrentUser} />
          )}
        </main>

        {/* Brand Attribution Footer */}
        <footer className="py-6 px-6 md:px-12 border-t border-gray-150 text-center text-xs text-gray-400 font-mono mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/40">
          <div>DeepInk Team - Cebric Beta</div>
          <div className="flex items-center gap-4">
            <a 
              href="https://t.me/CEBRICF1" 
              target="_blank" 
              rel="noreferrer noopener" 
              title="telegram"
              className="hover:text-[#EF1A2D] transition-colors text-gray-400"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.33-.26-1.98-.47-.8-.26-1.43-.4-1.38-.85.03-.24.36-.48.99-.74 3.89-1.69 6.48-2.8 7.78-3.33 3.69-1.54 4.46-1.81 4.96-1.82.11 0 .36.03.52.16.14.11.18.26.2.37z"/>
              </svg>
            </a>
            <a 
              href="https://discord.gg/mCBXUkfMaH" 
              target="_blank" 
              rel="noreferrer noopener" 
              title="discord"
              className="hover:text-[#EF1A2D] transition-colors text-gray-400"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
