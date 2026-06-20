import { useState, useEffect } from 'react';
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
import DriverProfilesTab from './components/DriverProfilesTab';
import CompareTab from './components/CompareTab';
import LapTimesTab from './components/LapTimesTab';
import PredictionsTab from './components/PredictionsTab';
import AuthTab from './components/AuthTab';
import PollsTab from './components/PollsTab';
import GlobalSearch from './components/GlobalSearch';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSeason, setSelectedSeason] = useState<string>('2026');
  const [seasons, setSeasons] = useState<string[]>([]);
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Instantly recover user session from cache on mount
  useEffect(() => {
    const cached = localStorage.getItem('f1_user_session');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
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
    <div id="app-root" className="min-h-screen bg-[#fafafa] flex text-black antialiased font-sans">
      
      {/* Sidebar Navigation (Left Rail pinned) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />

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

          {activeTab === 'driver-profiles' && (
            <DriverProfilesTab />
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
        <footer className="py-6 px-6 md:px-12 border-t border-gray-150 text-center text-xs text-gray-400 font-mono mt-auto">
          DeepInk Team - Cebric Beta
        </footer>
      </div>
    </div>
  );
}
