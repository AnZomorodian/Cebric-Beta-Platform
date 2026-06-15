import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, ChevronDown, ChevronUp, Clock, Info, FileText, ExternalLink } from 'lucide-react';
import { Race, RaceResult } from '../types';
import { TEAM_HEX } from '../data/mockData';

interface ScheduleTabProps {
  races: Race[];
  isLoading: boolean;
  season: string;
}

export default function ScheduleTab({ races, isLoading, season }: ScheduleTabProps) {
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  const [roundResults, setRoundResults] = useState<Record<string, RaceResult[]>>({});
  const [resultsLoading, setResultsLoading] = useState<Record<string, boolean>>({});
  const [fiaDocs, setFiaDocs] = useState<Record<string, any[]>>({});
  const [fiaDocsLoading, setFiaDocsLoading] = useState<Record<string, boolean>>({});
  const [activePane, setActivePane] = useState<Record<string, 'classification' | 'fia_docs'>>({});

  const now = new Date();

  const fetchFiaDocsForRound = async (round: string, raceName: string) => {
    if (fiaDocs[round]) {
      return;
    }
    setFiaDocsLoading(prev => ({ ...prev, [round]: true }));
    try {
      const simplifiedName = raceName.replace("Grand Prix", "").replace("GP", "").trim();
      const response = await fetch(`/api/fia-documents?race=${encodeURIComponent(simplifiedName)}`);
      if (response.ok) {
        const docs = await response.json();
        setFiaDocs(prev => ({ ...prev, [round]: docs }));
      }
    } catch (e) {
      console.error('Failed to fetch FIA documents', e);
    } finally {
      setFiaDocsLoading(prev => ({ ...prev, [round]: false }));
    }
  };

  const fetchResultsForRound = async (round: string, raceName: string) => {
    // If we already have results in state, toggle
    if (roundResults[round]) {
      if (expandedRound === round) {
        setExpandedRound(null);
      } else {
        setExpandedRound(round);
        fetchFiaDocsForRound(round, raceName);
      }
      return;
    }

    setExpandedRound(round);
    setResultsLoading(prev => ({ ...prev, [round]: true }));
    setActivePane(prev => ({ ...prev, [round]: 'classification' }));

    // Fetch both in parallel
    fetchFiaDocsForRound(round, raceName);

    try {
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/${season}/${round}/results.json`);
      if (response.ok) {
        const json = await response.json();
        const results = json?.MRData?.RaceTable?.Races?.[0]?.Results || 
                        json?.MRData?.RaceTable?.Races?.[0]?.results || [];
        setRoundResults(prev => ({ ...prev, [round]: results }));
      }
    } catch (e) {
      console.error('Failed to fetch race results for schedule details', e);
    } finally {
      setResultsLoading(prev => ({ ...prev, [round]: false }));
    }
  };

  const handleToggleUpcomingExpansion = (round: string, raceName: string) => {
    if (expandedRound === round) {
      setExpandedRound(null);
    } else {
      setExpandedRound(round);
      setActivePane(prev => ({ ...prev, [round]: 'fia_docs' }));
      fetchFiaDocsForRound(round, raceName);
    }
  };

  if (isLoading) {
    return (
      <div id="schedule-loading" className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400 font-mono tracking-widest">LOADING race SCHEDULE...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      id="schedule-view"
      className="space-y-8"
    >
      <header className="space-y-1.5 select-none">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 font-mono uppercase">
          CALENDAR & SCHEDULE
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-black">
          {season} Race Calendar
        </h1>
        <p className="text-sm text-gray-500 max-w-xl">
          Complete season list of upcoming and finalized Grand Prix races. Click on any completed race row to view exact results and session metrics.
        </p>
      </header>

      {races.length === 0 ? (
        <div className="py-20 text-center text-gray-400 border border-dashed border-gray-150 rounded-2xl bg-gray-50/20">
          No calendar events discovered for active season.
        </div>
      ) : (
        <div className="space-y-3.5" id="schedule-list">
          {races.map((race) => {
            const raceDate = new Date(race.date);
            const isCompleted = raceDate < now;
            const isNext = !isCompleted && races.filter(r => new Date(r.date) >= now)[0]?.round === race.round;
            const isExpanded = expandedRound === race.round;

            return (
              <div
                key={race.round}
                id={`schedule-row-${race.round}`}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  isExpanded 
                    ? 'border-gray-200 shadow-md ring-1 ring-black/[0.02]' 
                    : 'border-gray-150 hover:border-gray-300 hover:shadow-sm'
                } bg-white`}
              >
                {/* Main Row */}
                <div
                  id={`schedule-click-${race.round}`}
                  onClick={() => isCompleted ? fetchResultsForRound(race.round, race.raceName) : handleToggleUpcomingExpansion(race.round, race.raceName)}
                  className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4 select-none cursor-pointer"
                >
                  <div className="flex items-start md:items-center gap-4">
                    {/* Round Bubble */}
                    <div className="w-11 h-11 bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-gray-100 shrink-0 font-mono">
                      <span className="text-[9px] font-bold text-gray-400 leading-none">RND</span>
                      <span className="text-base font-bold text-black leading-tight">{race.round}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-base text-black tracking-tight">
                          {race.raceName}
                        </h3>

                        {/* Status Badges */}
                        {isCompleted ? (
                          <span className="text-[9px] font-bold tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-150 py-0.5 px-2 rounded-full font-mono uppercase">
                            Completed
                          </span>
                        ) : isNext ? (
                          <span className="text-[9px] font-bold tracking-widest bg-red-100 text-red-700 border border-red-200 py-0.5 px-2 rounded-full font-mono uppercase animate-pulse">
                            Next UP
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold tracking-widest bg-gray-50 text-gray-400 border border-gray-150 py-0.5 px-2 rounded-full font-mono uppercase">
                            Upcoming
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-gray-400" />
                          {race.Circuit.circuitName}, {race.Circuit.Location.locality}, {race.Circuit.Location.country}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-gray-400" />
                          {raceDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Accords Controls */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 self-end md:self-auto hover:text-black transition-colors">
                    <span className="font-mono text-[10px]">{isCompleted ? "DETAILS" : "FIA DOCS"}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Drawer (Results & FIA Documents) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      id={`schedule-expand-${race.round}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-gray-150 bg-gray-50/50"
                    >
                      <div className="p-6">
                        {/* If completed, show sub-tab switcher */}
                        {isCompleted && (
                          <div id={`tab-switcher-${race.round}`} className="flex bg-gray-200/60 p-1 rounded-xl w-fit mb-5 select-none font-sans text-xs font-bold gap-1">
                            <button
                              id={`tab-classification-${race.round}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePane(prev => ({ ...prev, [race.round]: 'classification' }));
                              }}
                              className={`px-3 py-2 rounded-lg transition-all outline-none ${
                                activePane[race.round] === 'classification' || !activePane[race.round]
                                  ? 'bg-white text-black shadow-xs'
                                  : 'text-gray-500 hover:text-black'
                              }`}
                            >
                              CHAMPIONSHIP CLASSIFICATION
                            </button>
                            <button
                              id={`tab-fiadocs-${race.round}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePane(prev => ({ ...prev, [race.round]: 'fia_docs' }));
                                fetchFiaDocsForRound(race.round, race.raceName);
                              }}
                              className={`px-3 py-2 rounded-lg transition-all outline-none ${
                                activePane[race.round] === 'fia_docs'
                                  ? 'bg-white text-black shadow-xs'
                                  : 'text-gray-500 hover:text-black'
                              }`}
                            >
                              FIA OFFICIAL DOCUMENTS
                            </button>
                          </div>
                        )}

                        {/* Pane Render content */}
                        {(!isCompleted || activePane[race.round] === 'fia_docs') ? (
                          // Render FIA Docs Section
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                              <div>
                                <h4 className="text-sm font-extrabold text-black font-sans flex items-center gap-1.5">
                                  <FileText size={16} className="text-[#EF1A2D]" />
                                  FIA Information & Official Documents Hub
                                </h4>
                                <p className="text-[11px] text-gray-500 font-medium">
                                  Real-time official announcements, stewards rulings, safety notices, and briefing instructions.
                                </p>
                              </div>
                              <span className="text-[9px] font-bold tracking-widest bg-red-600 text-white py-0.5 px-2 rounded-full font-mono uppercase">
                                LIVE PULSE
                              </span>
                            </div>

                            {fiaDocsLoading[race.round] ? (
                              <div className="flex items-center justify-center py-10 gap-2">
                                <div className="w-5 h-5 border-2 border-[#EF1A2D] border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-mono text-gray-450 tracking-wider">SYNCHRONIZING FIA FEED...</span>
                              </div>
                            ) : fiaDocs[race.round] && fiaDocs[race.round].length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5" id={`fia-docs-grid-${race.round}`}>
                                {fiaDocs[race.round].map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="bg-white border border-gray-150 p-4 rounded-xl flex flex-col justify-between hover:border-black/20 hover:shadow-xs transition-all duration-200"
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold tracking-wider font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">
                                          {doc.category || "Stewards Decision"}
                                        </span>
                                        <span className="text-[9px] font-medium font-mono text-gray-400">
                                          {doc.date}
                                        </span>
                                      </div>
                                      <h5 className="text-xs font-bold text-[#111] font-sans line-clamp-2 leading-snug">
                                        {doc.title}
                                      </h5>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-3">
                                      <span className="text-[10px] font-mono font-bold text-[#EF1A2D]">
                                        DOC {doc.documentId || "PDF"}
                                      </span>
                                      <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noreferrer referrerPolicy"
                                        className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 transition-colors"
                                      >
                                        View PDF
                                        <ExternalLink size={11} className="text-gray-450 group-hover:text-black" />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2 py-8 text-xs font-mono text-gray-400">
                                <Info size={14} />
                                No FIA Event Documents recorded yet for this round.
                              </div>
                            )}
                          </div>
                        ) : (
                          // Render Classification Table
                          <div className="overflow-x-auto">
                            {resultsLoading[race.round] ? (
                              <div className="flex items-center justify-center py-6 gap-2">
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-mono text-gray-450 tracking-wider">RETRIEVING LAP TIMES...</span>
                              </div>
                            ) : roundResults[race.round]?.length > 0 ? (
                              <table className="w-full text-left font-sans text-xs" id={`round-results-table-${race.round}`}>
                                <thead>
                                  <tr className="border-b border-gray-200 text-gray-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                                    <th className="pb-2.5 w-10">POS</th>
                                    <th className="pb-2.5 w-10">NO</th>
                                    <th className="pb-2.5">DRIVER</th>
                                    <th className="pb-2.5">TEAM</th>
                                    <th className="pb-2.5 text-center">GRID</th>
                                    <th className="pb-2.5 text-center">LAPS</th>
                                    <th className="pb-2.5 text-right">TIME/STATUS</th>
                                    <th className="pb-2.5 text-right w-16">PTS</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                  {roundResults[race.round].map((res) => {
                                    const construct = res.Constructor;
                                    const teamId = construct?.constructorId || 'unknown';
                                    const teamColor = TEAM_HEX[teamId] || '#94a3b8';

                                    return (
                                      <tr key={res.Driver.driverId} className="hover:bg-gray-100/50 py-2.5">
                                        <td className="py-3 font-mono font-bold text-black">{res.position}</td>
                                        <td className="py-3 font-mono text-gray-400">{res.number}</td>
                                        <td className="py-3">
                                          <div className="flex items-center gap-2">
                                            <div className="w-[3px] h-3.5 rounded-full" style={{ backgroundColor: teamColor }} />
                                            <span className="font-bold text-black">
                                              {res.Driver.givenName} {res.Driver.familyName}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="py-3 text-gray-500 font-medium">{construct?.name}</td>
                                        <td className="py-3 text-center font-mono text-gray-500">{res.grid}</td>
                                        <td className="py-3 text-center font-mono text-gray-500">{res.laps}</td>
                                        <td className="py-3 text-right font-mono text-gray-650">{res.Time?.time || res.status}</td>
                                        <td className="py-3 text-right font-mono font-bold text-black">+{res.points}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            ) : (
                              <div className="flex items-center justify-center gap-2 py-4 text-xs font-mono text-gray-400">
                                <Info size={14} />
                                No detailed result table available for this historical season.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
