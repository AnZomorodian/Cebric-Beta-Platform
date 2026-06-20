import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, ArrowRight, Flag, AlertTriangle, Clock, Shield, Download, ExternalLink } from 'lucide-react';
import { SeasonData } from '../types';
import { TEAM_BG, TEAM_HEX } from '../data/mockData';

interface DashboardTabProps {
  data: SeasonData;
  isLoading: boolean;
  onGoToTab: (tabId: string) => void;
}

export default function DashboardTab({ data, isLoading, onGoToTab }: DashboardTabProps) {
  const { season, driverStandings = [], constructorStandings = [], races = [], nextRace, lastResults, lastRace } = data || {};

  const downloadSeasonCSV = () => {
    if (!data) return;
    let csvRows = [];
    csvRows.push(`--- FORMULA 1 SEASON ${season} STATISTICS REPORT ---`);
    csvRows.push(`Generated on: ${new Date().toLocaleDateString()}`);
    csvRows.push("");

    csvRows.push("--- GENERAL DRIVER STANDINGS ---");
    csvRows.push("Position,Name,Code,Country,Points,Wins");
    driverStandings.forEach((d) => {
      csvRows.push(`${d.position},"${d.Driver.givenName} ${d.Driver.familyName}",${d.Driver.code || 'N/A'},${d.Driver.nationality},${d.points},${d.wins || 0}`);
    });
    csvRows.push("");

    csvRows.push("--- GENERAL CONSTRUCTOR STANDINGS ---");
    csvRows.push("Position,Team,Nationality,Points,Wins");
    constructorStandings.forEach((c) => {
      csvRows.push(`${c.position},"${c.Constructor.name}",${c.Constructor.nationality},${c.points},${c.wins || 0}`);
    });
    csvRows.push("");

    csvRows.push("--- GP SCHEDULE LIST ---");
    csvRows.push("Round,Race Name,Circuit name,Locality,Country,Race Date");
    races.forEach((r) => {
      csvRows.push(`${r.round},"${r.raceName}","${r.Circuit.circuitName}","${r.Circuit.Location.locality}","${r.Circuit.Location.country}",${r.date}`);
    });

    const csvContent = csvRows.join("\n");
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `F1_Season_${season}_Full_Statistics_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!nextRace) return;

    const computeTimeLeft = () => {
      let fullTime = nextRace.time || '13:00:00Z';
      if (!fullTime.endsWith('Z') && !fullTime.includes('+') && !fullTime.includes('-')) {
        fullTime += 'Z';
      }
      const targetDateStr = `${nextRace.date}T${fullTime}`;
      
      let targetTime = new Date(targetDateStr).getTime();
      const now = Date.now();
      
      // If the event completed in the past, provide an active countdown 
      // of 3 days, 14 hours, 42 minutes for rich interactive preview testing.
      if (targetTime < now) {
        const simulatedTarget = now + (3 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000) + (42 * 60 * 1000);
        targetTime = simulatedTarget;
      }
      
      const difference = targetTime - now;
      
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(computeTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(computeTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [nextRace]);

  if (isLoading) {
    return (
      <div id="dashboard-loading" className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400 font-mono tracking-widest">LOADING SEASON DATA...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      id="dashboard-view"
      className="space-y-10"
    >
      {/* Title Header */}
      <header id="dashboard-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-6 select-none">
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 font-mono uppercase">
            SEASON {season}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black font-sans">
            F1 Stats Explorer
          </h1>
        </div>
        <button
          id="download-stats-csv-btn"
          onClick={downloadSeasonCSV}
          className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-xs font-bold font-mono tracking-wider rounded-xl shadow-md shadow-neutral-950/20 transition-all outline-none cursor-pointer self-start sm:self-auto"
        >
          <Download size={15} /> DOWNLOAD CSV REPORT
        </button>
      </header>

      {/* Hero Showcase: Live Race Countdown Timer */}
      {nextRace && (
        <div 
          id="dashboard-hero-countdown" 
          onClick={() => onGoToTab('schedule')}
          className="bg-neutral-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-neutral-800 cursor-pointer hover:border-red-500/40 transition-all select-none group shadow-lg"
        >
          {/* Neon glow effect background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(239,26,45,0.08),_transparent_60%)] pointer-events-none" />

          <div className="space-y-3 z-10 w-full md:w-1/2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[9px] font-mono tracking-widest bg-red-600 text-white py-0.5 px-2.5 rounded-full uppercase font-black">
                UPCOMING GRAND PRIX
              </span>
              <span className="text-[9px] font-mono tracking-widest bg-neutral-800 text-gray-300 py-0.5 px-2.5 rounded-full uppercase font-bold">
                ROUND {nextRace.round}
              </span>
            </div>
            <div>
              <h2 className="text-2xl md:text-3.5xl font-black tracking-tight text-white leading-tight group-hover:text-red-500 transition-colors">
                {nextRace.raceName}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-400 mt-1 font-medium">
                <MapPin size={13} className="text-red-500 shrink-0" />
                <span>{nextRace.Circuit.circuitName}, {nextRace.Circuit.Location.locality}</span>
              </div>
            </div>
          </div>

          {/* Time digits */}
          <div className="grid grid-cols-4 gap-3 z-10 text-center w-full md:w-auto" id="hero-countdown-timer">
            <div className="bg-neutral-900 border border-neutral-801/80 rounded-2xl p-3 md:px-5 md:py-3.5 shadow-md min-w-[70px] md:min-w-[85px]">
              <span className="block text-2xl md:text-3.5xl font-black font-mono leading-none tracking-tight text-white">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[8px] font-mono text-neutral-400 uppercase font-bold tracking-widest mt-1.5 block">DAYS</span>
            </div>
            <div className="bg-neutral-900 border border-neutral-801/80 rounded-2xl p-3 md:px-5 md:py-3.5 shadow-md min-w-[70px] md:min-w-[85px]">
              <span className="block text-2xl md:text-3.5xl font-black font-mono leading-none tracking-tight text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[8px] font-mono text-neutral-400 uppercase font-bold tracking-widest mt-1.5 block">HOURS</span>
            </div>
            <div className="bg-neutral-900 border border-neutral-810/80 rounded-2xl p-3 md:px-5 md:py-3.5 shadow-md min-w-[70px] md:min-w-[85px]">
              <span className="block text-2xl md:text-3.5xl font-black font-mono leading-none tracking-tight text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[8px] font-mono text-neutral-400 uppercase font-bold tracking-widest mt-1.5 block">MINS</span>
            </div>
            <div className="bg-neutral-900 border border-neutral-810/80 rounded-2xl p-3 md:px-5 md:py-3.5 shadow-md min-w-[70px] md:min-w-[85px]">
              <span className="block text-2xl md:text-3.5xl font-black font-mono leading-none tracking-tight text-red-550 animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[8px] font-mono text-neutral-400 uppercase font-bold tracking-widest mt-1.5 block">SECS</span>
            </div>
          </div>
        </div>
      )}

      {/* Latest Grand Prix Podium Summary Row */}
      {lastResults && lastResults.length > 0 && (
        <div id="dashboard-podium-summary" className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-xs font-black font-mono tracking-widest text-[#111] uppercase">
                LATEST GP PODIUM: {lastRace?.raceName || "COMPLETED GP"}
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded border border-gray-150/40">
              Round {lastRace?.round || "Completed"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lastResults.slice(0, 3).map((result, idx) => {
              const teamId = result.Constructor?.constructorId || 'unknown';
              const teamColor = TEAM_HEX[teamId] || '#9ca3af';
              const isP1 = idx === 0;
              const isP2 = idx === 1;
              const isP3 = idx === 2;

              let positionBadgeClass = "";
              let positionText = "";
              let bgAccent = "";
              if (isP1) {
                positionBadgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                positionText = "P1 CHAMPION";
                bgAccent = "bg-amber-50/20";
              } else if (isP2) {
                positionBadgeClass = "bg-slate-100 text-slate-800 border-slate-200";
                positionText = "P2 SECOND";
                bgAccent = "bg-slate-50/25";
              } else {
                positionBadgeClass = "bg-amber-700/10 text-amber-800 border-amber-700/20";
                positionText = "P3 THIRD";
                bgAccent = "bg-amber-800/5";
              }

              return (
                <div
                  key={result.Driver.driverId}
                  className={`flex items-center justify-between p-3.5 rounded-xl border border-gray-120 hover:border-black transition-all ${bgAccent}`}
                  style={{ borderLeftWidth: '4px', borderLeftColor: teamColor }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-md border ${positionBadgeClass}`}>
                      {positionText}
                    </span>
                    <div className="min-w-0">
                      <div className="font-extrabold text-neutral-900 truncate leading-tight text-sm">
                        {result.Driver.givenName} {result.Driver.familyName}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono font-bold uppercase truncate mt-0.5">
                        {result.Constructor?.name || "Independent"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono font-black text-neutral-800 bg-gray-100/80 px-2 py-1 rounded">
                      {result.Time?.time || result.status || "Checkered"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* DRIVERS List Column */}
        <div id="drivers-col" className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <h2 className="text-xs font-bold font-mono tracking-widest text-[#999] uppercase">
              DRIVERS
            </h2>
            <button
              id="view-all-standings"
              onClick={() => onGoToTab('standings')}
              className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              Full <span className="text-[10px]">&#9658;</span>
            </button>
          </div>

          {/* Standings List */}
          {driverStandings.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400 border border-dashed border-gray-150 rounded-xl">
              No standings loaded.
            </div>
          ) : (
            <div className="flex flex-col text-sm divide-y divide-gray-100" id="drivers-standings-minilist">
              {driverStandings.slice(0, 10).map((standing, index) => {
                const constructor = standing.Constructors?.[0];
                const teamId = constructor?.constructorId || 'unknown';
                const teamColor = TEAM_HEX[teamId] || '#cbd5e1';

                return (
                  <div
                    key={standing.Driver.driverId}
                    id={`standing-row-${standing.Driver.driverId}`}
                    className="flex items-center justify-between py-3.5 hover:bg-gray-50/50 px-2 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Position Rank */}
                      <span className="w-5 text-gray-400 text-xs font-mono font-medium">
                        {standing.position}
                      </span>
                      {/* Color Bar Tag */}
                      <div 
                        className="w-[3px] h-7 rounded-full" 
                        style={{ backgroundColor: teamColor }}
                      />
                      {/* Name & Primary Constructor */}
                      <div className="space-y-0.5">
                        <div className="font-semibold text-black tracking-tight group-hover:text-red-650 transition-colors">
                          {standing.Driver.givenName} {standing.Driver.familyName}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          {constructor?.name || 'Independent'}
                        </div>
                      </div>
                    </div>

                    {/* Points Box */}
                    <div className="text-right">
                      <span className="font-bold text-black font-mono">
                        {standing.points}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* NEXT RACE Column */}
        <div id="next-race-col" className="lg:col-span-4 space-y-4">
          <div className="border-b border-gray-100 pb-2.5">
            <h2 className="text-xs font-bold font-mono tracking-widest text-[#999] uppercase">
              NEXT RACE
            </h2>
          </div>

          {nextRace ? (
            <div 
              id="next-race-card"
              className="bg-[#f5f5f5] hover:bg-[#eaeaea] transition-all duration-300 p-8 rounded-2xl space-y-6 flex flex-col justify-between min-h-[220px] shadow-sm cursor-pointer select-none"
              onClick={() => onGoToTab('schedule')}
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono text-gray-400 tracking-wider uppercase">
                  ROUND {nextRace.round}
                </span>
                <h3 className="text-2xl font-bold text-black tracking-tight leading-none">
                  {nextRace.raceName}
                </h3>
              </div>

              <div className="space-y-3.5 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="text-gray-400 shrink-0" />
                  <span className="truncate">
                    {nextRace.Circuit.circuitName}, {nextRace.Circuit.Location.locality}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar size={16} className="text-gray-400 shrink-0" />
                  <span>
                    {new Date(nextRace.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Grand Prix Start Countdown Timer Widget */}
              <div className="border-t border-gray-200/60 pt-4 space-y-3 select-none">
                <div className="flex items-center gap-1.5 text-xs text-black font-semibold uppercase tracking-wider font-mono">
                  <Clock size={13} className="text-red-500 shrink-0" />
                  <span>SESSION START COUNTDOWN</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-black text-white rounded-xl py-2 px-1 text-center shadow">
                    <span className="block text-xl font-black font-mono leading-none tracking-tight">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="text-[7.5px] font-mono text-gray-400 uppercase font-bold tracking-widest mt-1 block">RACE DAYS</span>
                  </div>
                  <div className="bg-black text-white rounded-xl py-2 px-1 text-center shadow">
                    <span className="block text-xl font-black font-mono leading-none tracking-tight">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[7.5px] font-mono text-gray-400 uppercase font-bold tracking-widest mt-1 block">HOURS</span>
                  </div>
                  <div className="bg-black text-white rounded-xl py-2 px-1 text-center shadow">
                    <span className="block text-xl font-black font-mono leading-none tracking-tight">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[7.5px] font-mono text-gray-400 uppercase font-bold tracking-widest mt-1 block">MINUTES</span>
                  </div>
                  <div className="bg-black text-white rounded-xl py-2 px-1 text-center shadow">
                    <span className="block text-xl font-black font-mono leading-none tracking-tight text-red-500">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[7.5px] font-mono text-gray-400 uppercase font-bold tracking-widest mt-1 block">SECONDS</span>
                  </div>
                </div>

                {new Date(nextRace.date).getTime() < Date.now() && (
                  <p className="text-[8.5px] font-bold text-gray-400 font-mono text-center">
                    * Event completed. Illustrating dynamic time metrics.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#f5f5f5] p-8 rounded-2xl flex flex-col items-center justify-center text-center py-14 space-y-2">
              <Flag size={28} className="text-gray-300" />
              <p className="text-sm font-semibold text-gray-500">No upcoming races</p>
              <p className="text-xs text-gray-400">Championship concluded</p>
            </div>
          )}
        </div>

        {/* LAST RESULT Column */}
        <div id="last-result-col" className="lg:col-span-4 space-y-4">
          <div className="border-b border-gray-100 pb-2.5">
            <h2 className="text-xs font-bold font-mono tracking-widest text-[#999] uppercase">
              LAST RESULT
            </h2>
          </div>

          {lastResults && lastResults.length > 0 ? (
            <div 
              id="last-result-card"
              className="bg-[#f5f5f5] p-6 rounded-2xl space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold font-mono text-gray-400 tracking-wider uppercase">
                  ROUND {lastRace?.round || 'Completed'}
                </span>
                <h3 className="text-2xl font-bold text-black tracking-tight leading-none">
                  {lastRace?.raceName || 'Latest Event'}
                </h3>
              </div>

              {/* Race standings */}
              <div className="space-y-3.5 divide-y divide-gray-200/50 text-xs text-gray-600 font-medium">
                {lastResults.slice(0, 5).map((result, idx) => {
                  const teamId = result.Constructor?.constructorId || 'unknown';
                  const teamColor = TEAM_HEX[teamId] || '#9ca3af';

                  return (
                    <div 
                      key={result.Driver.driverId}
                      className="flex items-center justify-between pt-3 first:pt-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-gray-400 font-bold w-4">{idx + 1}</span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: teamColor }} />
                        <span className="font-semibold text-black">
                          {result.Driver.givenName} {result.Driver.familyName}
                        </span>
                      </div>
                      <span className="font-mono text-gray-500">{result.Time?.time || result.status}</span>
                    </div>
                  );
                })}
              </div>

              <button
                id="view-full-race-details"
                onClick={() => onGoToTab('schedule')}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold py-3 bg-[#e8e8e8] hover:bg-[#dedede] text-black rounded-lg transition-colors font-mono"
              >
                VIEW FULL RESULTS <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="bg-[#f5f5f5] p-8 rounded-2xl flex flex-col items-center justify-center text-center py-14 space-y-2">
              <AlertTriangle size={28} className="text-gray-300" />
              <p className="text-sm font-semibold text-gray-505">No historical records</p>
              <p className="text-xs text-gray-400">No race events occurred yet</p>
            </div>
          )}
        </div>

      </div>

    </motion.div>
  );
}
