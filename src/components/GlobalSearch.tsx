import { useState, useEffect, useRef } from 'react';
import { Search, X, User, Cpu, MapPin, ExternalLink, Trophy, Calendar, Sparkles, Clock } from 'lucide-react';
import { SeasonData, DriverStanding, ConstructorStanding, Race } from '../types';
import { TEAM_HEX, TEAM_BG } from '../data/mockData';

interface GlobalSearchProps {
  seasonData: SeasonData | null;
  onGoToTab: (tabId: string) => void;
  selectedSeason: string;
}

export default function GlobalSearch({ seasonData, onGoToTab, selectedSeason }: GlobalSearchProps) {
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<'driver' | 'team' | 'circuit' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close search results panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset selected quick-view when season or query changes
  useEffect(() => {
    setSelectedResult(null);
    setSelectedType(null);
  }, [selectedSeason, query]);

  if (!seasonData) return null;

  // Search execution
  const normalizedQuery = query.toLowerCase().trim();

  // 1. Matches Drivers
  const matchedDrivers = normalizedQuery
    ? seasonData.driverStandings.filter(ds => {
        const d = ds.Driver;
        const code = d.code?.toLowerCase() || '';
        const givenName = d.givenName.toLowerCase();
        const familyName = d.familyName.toLowerCase();
        const nationality = d.nationality.toLowerCase();
        const teamName = ds.Constructors?.[0]?.name?.toLowerCase() || '';
        return (
          givenName.includes(normalizedQuery) ||
          familyName.includes(normalizedQuery) ||
          code.includes(normalizedQuery) ||
          nationality.includes(normalizedQuery) ||
          teamName.includes(normalizedQuery)
        );
      }).slice(0, 5)
    : [];

  // 2. Matches Constructors / Teams
  const matchedTeams = normalizedQuery
    ? seasonData.constructorStandings.filter(cs => {
        const c = cs.Constructor;
        const name = c.name.toLowerCase();
        const nationality = c.nationality.toLowerCase();
        return name.includes(normalizedQuery) || nationality.includes(normalizedQuery);
      }).slice(0, 5)
    : [];

  // 3. Matches Circuits
  const matchedCircuits = normalizedQuery
    ? seasonData.races.filter(race => {
        const c = race.Circuit;
        const circuitName = c.circuitName.toLowerCase();
        const locality = c.Location.locality.toLowerCase();
        const country = c.Location.country.toLowerCase();
        const raceName = race.raceName.toLowerCase();
        return (
          circuitName.includes(normalizedQuery) ||
          locality.includes(normalizedQuery) ||
          country.includes(normalizedQuery) ||
          raceName.includes(normalizedQuery)
        );
      }).slice(0, 5)
    : [];

  const hasResults = matchedDrivers.length > 0 || matchedTeams.length > 0 || matchedCircuits.length > 0;

  const handleSelectItem = (item: any, type: 'driver' | 'team' | 'circuit') => {
    setSelectedResult(item);
    setSelectedType(type);
  };

  const handleApplyTabJump = () => {
    if (!selectedType) return;
    setIsOpen(false);
    setQuery('');
    if (selectedType === 'driver') {
      onGoToTab('drivers');
    } else if (selectedType === 'team') {
      onGoToTab('standings');
    } else if (selectedType === 'circuit') {
      onGoToTab('circuits');
    }
  };

  return (
    <div 
      ref={containerRef} 
      id="global-search-container" 
      className="relative w-80 md:w-96 select-none font-sans"
    >
      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search drivers, circuits, teams..."
          className="w-full bg-[#f4f4f5] text-black text-xs font-bold pl-9 pr-8 py-2 rounded-xl outline-none border border-transparent focus:border-black focus:bg-white transition-all placeholder:text-gray-400"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
        {query && (
          <button 
            onClick={() => {
              setQuery('');
              setSelectedResult(null);
              setSelectedType(null);
            }}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-black outline-none"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Floating Auto-complete Modal Panel */}
      {isOpen && query.length > 0 && (
        <div 
          id="global-search-popover" 
          className="absolute right-0 top-11 w-[550px] max-w-[92vw] bg-white border border-gray-150 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col md:flex-row h-[420px]"
        >
          {/* LEFT LIST SECTION */}
          <div className="flex-1 overflow-y-auto p-4 border-r border-gray-100 space-y-4">
            {!hasResults ? (
              <div className="text-center py-16 text-gray-400 space-y-1">
                <p className="text-sm font-bold font-mono uppercase tracking-widest text-neutral-300">No Records Found</p>
                <p className="text-xs">Try searching name, team, country or acronym.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* 1. Drivers Group */}
                {matchedDrivers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-extrabold text-[#e50914] bg-red-50 py-0.5 px-2 rounded tracking-widest uppercase">
                      DRIVERS ({selectedSeason})
                    </span>
                    <div className="space-y-0.5">
                      {matchedDrivers.map((ds) => {
                        const isItemSelected = selectedResult?.Driver?.driverId === ds.Driver.driverId;
                        const constructorId = ds.Constructors?.[0]?.constructorId || 'unknown';
                        const tColor = TEAM_HEX[constructorId] || '#3b82f6';
                        return (
                          <div
                            key={ds.Driver.driverId}
                            onClick={() => handleSelectItem(ds, 'driver')}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors text-xs font-bold ${
                              isItemSelected ? 'bg-neutral-100 text-black' : 'hover:bg-neutral-50 text-gray-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tColor }} />
                              {ds.Driver.givenName} {ds.Driver.familyName}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 uppercase">
                              {ds.Driver.code || 'DRV'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Teams Group */}
                {matchedTeams.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-extrabold text-blue-600 bg-blue-50 py-0.5 px-2 rounded tracking-widest uppercase">
                      CONSTRUCTORS / TEAMS
                    </span>
                    <div className="space-y-0.5">
                      {matchedTeams.map((cs) => {
                        const isItemSelected = selectedResult?.Constructor?.constructorId === cs.Constructor.constructorId;
                        const constructorId = cs.Constructor.constructorId;
                        const tColor = TEAM_HEX[constructorId] || '#10b981';
                        return (
                          <div
                            key={cs.Constructor.constructorId}
                            onClick={() => handleSelectItem(cs, 'team')}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors text-xs font-bold ${
                              isItemSelected ? 'bg-neutral-100 text-black' : 'hover:bg-neutral-50 text-gray-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Cpu size={12} style={{ color: tColor }} />
                              {cs.Constructor.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {cs.Constructor.nationality}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Circuits Group */}
                {matchedCircuits.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-extrabold text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded tracking-widest uppercase">
                      CIRCUITS & GRAN PRIX
                    </span>
                    <div className="space-y-0.5">
                      {matchedCircuits.map((race) => {
                        const isItemSelected = selectedResult?.Circuit?.circuitId === race.Circuit.circuitId;
                        return (
                          <div
                            key={race.Circuit.circuitId}
                            onClick={() => handleSelectItem(race, 'circuit')}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors text-xs font-bold ${
                              isItemSelected ? 'bg-neutral-100 text-black' : 'hover:bg-neutral-50 text-gray-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <MapPin size={12} className="text-gray-400" />
                              <span className="truncate max-w-[200px]">{race.Circuit.circuitName}</span>
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {race.Circuit.Location.country}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT DETAIL PREVIEW HUB (INTERACTIVE) */}
          <div className="w-full md:w-56 bg-neutral-50 p-4 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100">
            {selectedResult && selectedType ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Category Badge Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-extrabold uppercase text-gray-400 bg-gray-200 px-2.5 py-0.5 rounded tracking-tight">
                      {selectedType} Overview
                    </span>
                    <Sparkles className="text-yellow-500" size={13} />
                  </div>

                  {/* Driver Preview */}
                  {selectedType === 'driver' && (
                    <div className="space-y-3 pt-3">
                      <div>
                        <h4 className="text-sm font-black text-black leading-tight">
                          {selectedResult.Driver.givenName} {selectedResult.Driver.familyName}
                        </h4>
                        <span className="text-[10px] font-mono font-extrabold uppercase text-gray-400">
                          Car No: #{selectedResult.Driver.permanentNumber || 'N/A'} ({selectedResult.Driver.code || 'DRV'})
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-500 font-medium">
                        <p className="flex items-center gap-1.5">
                          <Trophy size={11} className="text-yellow-500 shrink-0" />
                          <span>Standings: <strong>P{selectedResult.position}</strong> ({selectedResult.points} pts)</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Cpu size={11} className="text-gray-400 shrink-0" />
                          <span>Team: <strong className="text-gray-800">{selectedResult.Constructors?.[0]?.name || 'Independent'}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-gray-400 shrink-0" />
                          <span>Born: <strong className="text-gray-800">{selectedResult.Driver.dateOfBirth}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <User size={11} className="text-gray-400 shrink-0" />
                          <span>Nationality: <strong className="text-gray-800">{selectedResult.Driver.nationality}</strong></span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Team Preview */}
                  {selectedType === 'team' && (
                    <div className="space-y-3 pt-3">
                      <div>
                        <h4 className="text-sm font-black text-black leading-tight">
                          {selectedResult.Constructor.name}
                        </h4>
                        <span className="text-[10px] font-mono font-extrabold uppercase text-gray-400">
                          {selectedResult.Constructor.nationality} Constructor
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-500 font-medium">
                        <p className="flex items-center gap-1.5">
                          <Trophy size={11} className="text-emerald-500 shrink-0" />
                          <span>Position: <strong>P{selectedResult.position}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Sparkles size={11} className="text-yellow-500 shrink-0" />
                          <span>Total Points: <strong>{selectedResult.points} pts</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-gray-400 shrink-0" />
                          <span>Wins logged: <strong>{selectedResult.wins} Wins</strong></span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Circuit Preview */}
                  {selectedType === 'circuit' && (
                    <div className="space-y-3 pt-3">
                      <div>
                        <h4 className="text-sm font-black text-black leading-tight">
                          {selectedResult.Circuit.circuitName}
                        </h4>
                        <span className="text-[10px] font-mono font-extrabold uppercase text-gray-400">
                          Round {selectedResult.round}: {selectedResult.raceName.replace(' Grand Prix', '')} GP
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-500 font-medium">
                        <p className="flex items-center gap-1.5">
                          <MapPin size={11} className="text-red-500 shrink-0" />
                          <span>Location: <strong className="text-gray-800">{selectedResult.Circuit.Location.locality}, {selectedResult.Circuit.Location.country}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-gray-400 shrink-0" />
                          <span>Race Date: <strong className="text-gray-800">{selectedResult.date}</strong></span>
                        </p>
                        {selectedResult.time && (
                          <p className="flex items-center gap-1.5">
                            <Clock size={11} className="text-gray-400 shrink-0" />
                            <span>Sprint Start: <strong className="text-gray-800">{selectedResult.time}</strong></span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTION DIRECT TABS JUMP BUTTON */}
                <button
                  onClick={handleApplyTabJump}
                  className="w-full bg-black text-white hover:bg-neutral-800 text-[11px] font-extrabold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 mt-4"
                >
                  <span>Go to Details view</span>
                  <ExternalLink size={11} />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-3 text-gray-450 space-y-1">
                <Sparkles size={20} className="text-amber-400 animate-pulse" />
                <h5 className="text-[11px] font-black text-gray-800 uppercase">Information Hub</h5>
                <p className="text-[10px] text-gray-400">Select any search result on the left to preview racing metrics instantly.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
