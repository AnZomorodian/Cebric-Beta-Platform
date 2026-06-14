import { useEffect, useRef } from 'react';
import { SEASONS_LIST } from '../services/ergast';

interface SeasonSelectorProps {
  selectedSeason: string;
  onSelectSeason: (season: string) => void;
  seasons?: string[];
}

export default function SeasonSelector({ selectedSeason, onSelectSeason, seasons = SEASONS_LIST }: SeasonSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected year into center view on mount/change
  useEffect(() => {
    if (containerRef.current) {
      const selectedButton = containerRef.current.querySelector(`[data-season="${selectedSeason}"]`);
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedSeason]);

  // Handle click & selection
  const handleSeasonSelect = (season: string) => {
    onSelectSeason(season);
  };

  const sortedSeasons = [...seasons].sort((a, b) => parseInt(a) - parseInt(b)); // Ascending scroll timeline (1950 to 2026)

  return (
    <div 
      id="season-selector-wrapper"
      className="flex items-center gap-6 py-4 px-6 bg-[#fcfcfc] border-b border-[#f0f0f0] w-full select-none"
    >
      <span className="text-[11px] font-bold tracking-widest text-[#999] font-mono mr-2">SEASON</span>
      
      <div 
        ref={containerRef}
        id="season-scroller"
        className="flex-1 flex gap-5 overflow-x-auto scrollbar-none scroll-smooth pr-10"
        style={{ scrollbarWidth: 'none' }}
      >
        {sortedSeasons.map((season) => {
          const isSelected = selectedSeason === season;
          return (
            <button
              key={season}
              data-season={season}
              id={`season-btn-${season}`}
              onClick={() => handleSeasonSelect(season)}
              className={`text-xs font-semibold tracking-tight transition-all duration-200 py-1.5 px-3 rounded-full outline-none shrink-0 ${
                isSelected 
                  ? 'bg-[#111] text-white' 
                  : 'text-gray-400 hover:text-black hover:bg-gray-150'
              }`}
            >
              {season}
            </button>
          );
        })}
      </div>
    </div>
  );
}
