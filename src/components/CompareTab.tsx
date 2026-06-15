import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { DriverStanding } from '../types';
import { TEAM_HEX } from '../data/mockData';

interface CompareTabProps {
  driverStandings: DriverStanding[];
  isLoading: boolean;
  season: string;
}

export default function CompareTab({ driverStandings, isLoading, season }: CompareTabProps) {
  const [driverAId, setDriverAId] = useState<string>('');
  const [driverBId, setDriverBId] = useState<string>('');

  // Auto-select top two drivers on mount / standings change
  useEffect(() => {
    if (driverStandings.length >= 2) {
      setDriverAId(driverStandings[0].Driver.driverId);
      setDriverBId(driverStandings[1].Driver.driverId);
    }
  }, [driverStandings]);

  if (isLoading) {
    return (
      <div id="compare-loading" className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400 font-mono tracking-widest">LOADING HEAD TO HEAD ENGINE...</p>
      </div>
    );
  }

  const driverA = driverStandings.find(d => d.Driver.driverId === driverAId);
  const driverB = driverStandings.find(d => d.Driver.driverId === driverBId);

  const swapDrivers = () => {
    const temp = driverAId;
    setDriverAId(driverBId);
    setDriverBId(temp);
  };

  // Helper calculations
  const pointsA = driverA ? parseFloat(driverA.points) || 0 : 0;
  const pointsB = driverB ? parseFloat(driverB.points) || 0 : 0;
  const winsA = driverA ? parseInt(driverA.wins) || 0 : 0;
  const winsB = driverB ? parseInt(driverB.wins) || 0 : 0;
  const posA = driverA ? parseInt(driverA.position) || 99 : 99;
  const posB = driverB ? parseInt(driverB.position) || 99 : 99;

  const totalPoints = (pointsA + pointsB) || 1;
  const pctPointsA = (pointsA / totalPoints) * 100;
  const pctPointsB = (pointsB / totalPoints) * 100;

  const totalWins = (winsA + winsB) || 1;
  const pctWinsA = winsA + winsB === 0 ? 50 : (winsA / totalWins) * 100;
  const pctWinsB = winsA + winsB === 0 ? 50 : (winsB / totalWins) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      id="compare-view"
      className="space-y-8 pb-10"
    >
      <header className="space-y-1.5 select-none text-center md:text-left">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 font-mono uppercase">
          DRIVER VS DRIVER
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-black">
          Head to Head Compare
        </h1>
        <p className="text-sm text-gray-500 max-w-xl">
          Select any two drivers from the {season} roster to contrast their results, championship rank, and season metrics.
        </p>
      </header>

      {/* Selectors Bar */}
      <div 
        id="compare-selectors"
        className="bg-gray-50 border border-gray-150 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        {/* Driver A Dropdown */}
        <div className="w-full md:w-5/12 space-y-1">
          <label className="text-[10px] bg-red-50 text-red-600 font-mono font-bold tracking-wider px-2 py-0.5 rounded">DRIVER A</label>
          <select
            id="driver-a-dropdown"
            value={driverAId}
            onChange={(e) => setDriverAId(e.target.value)}
            className="w-full bg-white border border-gray-200 outline-none rounded-xl py-3 px-4 font-semibold text-sm focus:ring-1 focus:ring-black"
          >
            {driverStandings.map((ds) => (
              <option key={ds.Driver.driverId} value={ds.Driver.driverId} disabled={ds.Driver.driverId === driverBId}>
                {ds.position}. {ds.Driver.givenName} {ds.Driver.familyName} ({ds.Constructors?.[0]?.name || 'F1'})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          id="swap-drivers-btn"
          onClick={swapDrivers}
          className="p-3 bg-white hover:bg-black hover:text-white border border-gray-200 hover:border-black rounded-full transition-all duration-200 shadow-sm"
          title="Swap drivers"
        >
          <RefreshCw size={16} />
        </button>

        {/* Driver B Dropdown */}
        <div className="w-full md:w-5/12 space-y-1">
          <label className="text-[10px] bg-sky-50 text-sky-600 font-mono font-bold tracking-wider px-2 py-0.5 rounded">DRIVER B</label>
          <select
            id="driver-b-dropdown"
            value={driverBId}
            onChange={(e) => setDriverBId(e.target.value)}
            className="w-full bg-white border border-gray-200 outline-none rounded-xl py-3 px-4 font-semibold text-sm focus:ring-1 focus:ring-black"
          >
            {driverStandings.map((ds) => (
              <option key={ds.Driver.driverId} value={ds.Driver.driverId} disabled={ds.Driver.driverId === driverAId}>
                {ds.position}. {ds.Driver.givenName} {ds.Driver.familyName} ({ds.Constructors?.[0]?.name || 'F1'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {driverA && driverB ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8" id="comparison-dashboard">
          
          {/* DRIVER A CARD */}
          <div className="md:col-span-4 bg-white border border-gray-150 rounded-2xl p-6 space-y-6 flex flex-col justify-between" id="compare-card-a">
            <div className="space-y-4">
              <span className="text-4xl font-black font-mono text-gray-100 block">01</span>
              <div>
                <span className="text-[10px] font-extrabold tracking-wider font-mono uppercase bg-gray-50 border border-gray-150 text-gray-500 px-2 py-0.5 rounded">
                  {driverA.Constructors?.[0]?.name || 'Independent'}
                </span>
                <h3 className="text-2xl font-black tracking-tight text-black mt-2 leading-none">
                  {driverA.Driver.givenName} {driverA.Driver.familyName}
                </h3>
                {driverA.Driver.code && (
                  <span className="text-xs font-mono font-bold text-gray-400 block mt-1 uppercase">
                    CODE: {driverA.Driver.code}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-500">
              <div className="flex items-center justify-between">
                <span>Race Number</span>
                <span className="font-mono text-black text-sm font-bold">{driverA.Driver.permanentNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Nationality</span>
                <span className="text-black font-bold">{driverA.Driver.nationality}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Birth Date</span>
                <span className="text-black font-bold">{driverA.Driver.dateOfBirth || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* STATS BENTO VS COLUMN */}
          <div className="md:col-span-4 space-y-6 flex flex-col justify-center" id="compare-stats-column">
            
            {/* Championship Position Comparison */}
            <div className="bg-[#fcfcfc] border border-gray-150 p-5 rounded-xl space-y-3">
              <h4 className="text-[10px] font-bold font-mono text-gray-400 tracking-wider text-center uppercase">
                SEASON RANKING
              </h4>
              <div className="flex items-center justify-between px-2">
                <div className={`text-center py-1.5 px-3 rounded-lg ${posA < posB ? 'bg-amber-100/50 text-amber-900 border border-amber-200' : 'bg-gray-100 text-gray-600'}`}>
                  <span className="block text-[9px] font-mono leading-none">RANK</span>
                  <span className="text-xl font-bold font-mono">P{posA}</span>
                </div>
                <span className="text-xs font-bold font-mono text-gray-300">VS</span>
                <div className={`text-center py-1.5 px-3 rounded-lg ${posB < posA ? 'bg-amber-100/50 text-amber-900 border border-amber-200' : 'bg-gray-100 text-gray-600'}`}>
                  <span className="block text-[9px] font-mono leading-none">RANK</span>
                  <span className="text-xl font-bold font-mono">P{posB}</span>
                </div>
              </div>
              <div className="text-center text-xs text-gray-400 font-medium">
                {posA === posB ? 'Equal rank' : posA < posB ? `${driverA.Driver.familyName} leads championship` : `${driverB.Driver.familyName} leads championship`}
              </div>
            </div>

            {/* Points Proportions Bar */}
            <div className="bg-[#fcfcfc] border border-gray-150 p-5 rounded-xl space-y-3">
              <h4 className="text-[10px] font-bold font-mono text-gray-400 tracking-wider text-center uppercase">
                POINTS METRIC ({pointsA} vs {pointsB})
              </h4>
              
              {/* Double bar */}
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full rounded-l-full transition-all duration-300"
                  style={{ 
                    width: `${pctPointsA}%`, 
                    backgroundColor: TEAM_HEX[driverA.Constructors?.[0]?.constructorId || ''] || '#ef4444' 
                  }}
                />
                <div 
                  className="h-full rounded-r-full transition-all duration-300"
                  style={{ 
                    width: `${pctPointsB}%`, 
                    backgroundColor: TEAM_HEX[driverB.Constructors?.[0]?.constructorId || ''] || '#3b82f6' 
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono font-bold text-gray-400">
                <span>{pctPointsA.toFixed(0)}%</span>
                <span>PROPORTION</span>
                <span>{pctPointsB.toFixed(0)}%</span>
              </div>
            </div>

            {/* Wins comparison */}
            <div className="bg-[#fcfcfc] border border-gray-150 p-5 rounded-xl space-y-3">
              <h4 className="text-[10px] font-bold font-mono text-gray-400 tracking-wider text-center uppercase">
                GRAND PRIX WINS ({winsA} vs {winsB})
              </h4>
              
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full rounded-l-full transition-all duration-300"
                  style={{ 
                    width: `${pctWinsA}%`, 
                    backgroundColor: TEAM_HEX[driverA.Constructors?.[0]?.constructorId || ''] || '#ef4444' 
                  }}
                />
                <div 
                  className="h-full rounded-r-full transition-all duration-300"
                  style={{ 
                    width: `${pctWinsB}%`, 
                    backgroundColor: TEAM_HEX[driverB.Constructors?.[0]?.constructorId || ''] || '#3b82f6' 
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono font-bold text-gray-400">
                <span>{winsA} W</span>
                <span>GP WINS</span>
                <span>{winsB} W</span>
              </div>
            </div>

          </div>

          {/* DRIVER B CARD */}
          <div className="md:col-span-4 bg-white border border-gray-150 rounded-2xl p-6 space-y-6 flex flex-col justify-between" id="compare-card-b">
            <div className="space-y-4">
              <span className="text-4xl font-black font-mono text-gray-100 block">02</span>
              <div>
                <span className="text-[10px] font-extrabold tracking-wider font-mono uppercase bg-gray-50 border border-gray-150 text-gray-500 px-2 py-0.5 rounded">
                  {driverB.Constructors?.[0]?.name || 'Independent'}
                </span>
                <h3 className="text-2xl font-black tracking-tight text-black mt-2 leading-none">
                  {driverB.Driver.givenName} {driverB.Driver.familyName}
                </h3>
                {driverB.Driver.code && (
                  <span className="text-xs font-mono font-bold text-gray-400 block mt-1 uppercase">
                    CODE: {driverB.Driver.code}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-500">
              <div className="flex items-center justify-between">
                <span>Race Number</span>
                <span className="font-mono text-black text-sm font-bold">{driverB.Driver.permanentNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Nationality</span>
                <span className="text-black font-bold">{driverB.Driver.nationality}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Birth Date</span>
                <span className="text-black font-bold">{driverB.Driver.dateOfBirth || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        </>
      ) : (
        <div className="py-20 text-center text-gray-400">
          Make sure at least two active drivers are loaded to carry out comparison.
        </div>
      )}
    </motion.div>
  );
}
