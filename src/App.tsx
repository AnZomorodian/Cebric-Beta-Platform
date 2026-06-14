import { useState, useEffect } from 'react';
import { fetchSeasonData } from './services/ergast';
import { SeasonData } from './types';

// Components
import Sidebar from './components/Sidebar';
import SeasonSelector from './components/SeasonSelector';
import DashboardTab from './components/DashboardTab';
import ScheduleTab from './components/ScheduleTab';
import StandingsTab from './components/StandingsTab';
import DriversTab from './components/DriversTab';
import CircuitsTab from './components/CircuitsTab';
import CompareTab from './components/CompareTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSeason, setSelectedSeason] = useState<string>('2026');
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  return (
    <div id="app-root" className="min-h-screen bg-[#fafafa] flex text-black antialiased font-sans">
      
      {/* Sidebar Navigation (Left Rail pinned) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Content Container (offsets Sidebar) */}
      <div className="flex-1 flex flex-col md:pl-16 min-w-0" id="main-content-lane">
        
        {/* Horizontal Scrollable Season Selector Pinned Top */}
        <SeasonSelector 
          selectedSeason={selectedSeason} 
          onSelectSeason={setSelectedSeason} 
        />

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
        </main>
      </div>
    </div>
  );
}
