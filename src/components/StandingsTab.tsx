import { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Shield, Award } from 'lucide-react';
import { DriverStanding, ConstructorStanding } from '../types';
import { TEAM_HEX, TEAM_BG } from '../data/mockData';

interface StandingsTabProps {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  isLoading: boolean;
  season: string;
}

export default function StandingsTab({
  driverStandings,
  constructorStandings,
  isLoading,
  season,
}: StandingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'drivers' | 'constructors'>('drivers');

  if (isLoading) {
    return (
      <div id="standings-loading" className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400 font-mono tracking-widest">LOADING STANDINGS...</p>
      </div>
    );
  }

  // Find max points for relative calculations
  const maxDriverPoints = driverStandings.length > 0 ? parseFloat(driverStandings[0].points) || 1 : 1;
  const maxConstructorPoints = constructorStandings.length > 0 ? parseFloat(constructorStandings[0].points) || 1 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      id="standings-view"
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
        <div className="space-y-1.5 select-none">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 font-mono uppercase">
            CHAMPIONSHIP STANDINGS
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-black">
            {season} Standings
          </h1>
          <p className="text-sm text-gray-500 max-w-md">
            Live driver rankings and constructor standings. Normalized progress bars visualize gaps to the lead.
          </p>
        </div>

        {/* Sub Tab Switcher */}
        <div id="standings-subtabs" className="flex bg-gray-100 p-1 rounded-xl shrink-0 self-start md:self-auto font-sans">
          <button
            id="driver-standings-subtab"
            onClick={() => setActiveSubTab('drivers')}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-all outline-none ${
              activeSubTab === 'drivers'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <Trophy size={14} /> DRIVERS
          </button>
          <button
            id="constructor-standings-subtab"
            onClick={() => setActiveSubTab('constructors')}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-all outline-none ${
              activeSubTab === 'constructors'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <Shield size={14} /> CONSTRUCTORS
          </button>
        </div>
      </header>

      {/* Drivers Standings Grid/Table */}
      {activeSubTab === 'drivers' ? (
        driverStandings.length === 0 ? (
          <div className="py-20 text-center text-gray-400 border border-dashed border-gray-150 rounded-2xl bg-gray-50/20">
            No driver standing statistics available for current season.
          </div>
        ) : (
          <div className="space-y-3" id="driver-standings-list">
            {driverStandings.map((standing, idx) => {
              const constructor = standing.Constructors?.[0];
              const teamId = constructor?.constructorId || 'unknown';
              const teamColor = TEAM_HEX[teamId] || '#9ca3af';
              const teamBg = TEAM_BG[teamId] || 'bg-gray-100';
              
              const pointsNum = parseFloat(standing.points) || 0;
              const ratio = Math.min(100, Math.max(3, (pointsNum / maxDriverPoints) * 100));

              return (
                <div
                  key={standing.Driver.driverId}
                  id={`driver-row-${standing.Driver.driverId}`}
                  className="bg-white border border-gray-150 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-250 transition-all duration-200 relative group cursor-pointer"
                >
                  {/* Left Metadata */}
                  <div className="flex items-center gap-4 min-w-[280px]">
                    {/* Rank Bullet */}
                    <div className="w-8 shrink-0 font-mono text-center">
                      {standing.position === '1' ? (
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200 text-amber-800 mx-auto">
                          <Award size={16} className="text-amber-600 fill-amber-300" />
                        </div>
                      ) : (
                        <span className="text-gray-400 font-bold text-sm">#{standing.position}</span>
                      )}
                    </div>

                    {/* Team Color Pillar */}
                    <div className="w-[4px] h-10 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />

                    {/* Name block */}
                    <div>
                      <h3 className="font-extrabold text-[#111] tracking-tight text-base leading-tight">
                        {standing.Driver.givenName} {standing.Driver.familyName}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-gray-400">
                        {standing.Driver.code && (
                          <span className="bg-gray-100 px-1.5 py-0.2 rounded font-mono text-gray-500 uppercase">
                            {standing.Driver.code}
                          </span>
                        )}
                        <span>{constructor?.name || 'Independent'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Relative Points Meter */}
                  <div className="flex-1 md:mx-6 flex flex-col justify-center min-w-[120px]">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${ratio}%`,
                          backgroundColor: teamColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Right stats indicators */}
                  <div className="flex items-center gap-8 justify-between md:justify-end shrink-0 select-none">
                    <div className="text-left md:text-right font-mono text-[10px] text-gray-405 font-semibold space-y-0.5">
                      <span className="block uppercase tracking-wider">WINS</span>
                      <span className="block text-sm font-bold text-black">{standing.wins}</span>
                    </div>

                    <div className="text-right font-mono space-y-0.5">
                      <span className="block text-[10px] text-gray-405 font-semibold uppercase tracking-wider">POINTS</span>
                      <span className="block text-2xl font-black text-black leading-none">{standing.points}</span>
                    </div>
                  </div>

                  {/* Interactive Floating Tooltip (Hover) */}
                  <div className="absolute left-1/2 bottom-[105%] -translate-x-1/2 w-72 bg-neutral-950 border border-neutral-800 rounded-xl p-4 shadow-xl text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 space-y-3 mb-2">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-red-600 font-mono text-[10px] font-bold text-white px-1.5 py-0.5 rounded leading-none">
                          {standing.Driver.code || 'DRV'}
                        </span>
                        <span className="text-xs font-mono text-gray-400 font-bold">#{standing.Driver.permanentNumber || 'N/A'}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase font-bold">DRIVER DEEP STATS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-1.5 text-xs font-medium">
                      <div>
                        <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider font-bold">Nationality</span>
                        <span className="text-gray-200">{standing.Driver.nationality}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-gray-550 uppercase tracking-wider font-bold">Date of Birth</span>
                        <span className="text-gray-200 font-mono">{standing.Driver.dateOfBirth || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-gray-550 uppercase tracking-wider font-bold">Championship Gap</span>
                        <span className="text-red-400 font-mono font-bold">
                          {idx === 0 ? 'Leader (P1)' : `-${maxDriverPoints - parseFloat(standing.points)} pts`}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-gray-550 uppercase tracking-wider font-bold">Wins Ratio</span>
                        <span className="text-amber-400 font-bold font-mono">
                          {standing.wins} wins
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-neutral-800 pt-2 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>Click to visit Wiki Biography</span>
                      <a 
                        href={standing.Driver.url || '#'}
                        target="_blank"
                        rel="noreferrer referrerPolicy"
                        className="text-red-400 hover:text-red-300 font-bold uppercase text-[9px] flex items-center gap-0.5"
                      >
                        WIKI &#10142;
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Constructors Standings List */
        constructorStandings.length === 0 ? (
          <div className="py-20 text-center text-gray-400 border border-dashed border-gray-150 rounded-2xl bg-gray-50/20">
            No constructor standing statistics available for current season.
          </div>
        ) : (
          <div className="space-y-3" id="constructor-standings-list">
            {constructorStandings.map((standing, idx) => {
              const teamId = standing.Constructor.constructorId || 'unknown';
              const teamColor = TEAM_HEX[teamId] || '#9ca3af';
              const pointsNum = parseFloat(standing.points) || 0;
              const ratio = Math.min(100, Math.max(3, (pointsNum / maxConstructorPoints) * 100));

              return (
                <div
                  key={standing.Constructor.constructorId}
                  id={`constructor-row-${standing.Constructor.constructorId}`}
                  className="bg-white border border-gray-150 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-250 transition-all duration-200 relative group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-[280px]">
                    {/* Rank */}
                    <div className="w-8 shrink-0 font-mono text-center">
                      {standing.position === '1' ? (
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200 text-amber-800 mx-auto">
                          <Award size={16} className="text-amber-600 fill-amber-300" />
                        </div>
                      ) : (
                        <span className="text-gray-400 font-bold text-sm">#{standing.position}</span>
                      )}
                    </div>

                    <div className="w-[4px] h-10 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />

                    <div>
                      <h3 className="font-extrabold text-[#111] tracking-tight text-base leading-tight">
                        {standing.Constructor.name}
                      </h3>
                      <span className="text-xs text-gray-400 font-semibold uppercase font-mono mt-0.5 block">
                        {standing.Constructor.nationality}
                      </span>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="flex-1 md:mx-6 flex flex-col justify-center min-w-[120px]">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${ratio}%`,
                          backgroundColor: teamColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats Indicators */}
                  <div className="flex items-center gap-8 justify-between md:justify-end shrink-0 select-none">
                    <div className="text-left md:text-right font-mono text-[10px] text-gray-400 font-semibold space-y-0.5">
                      <span className="block uppercase tracking-wider">WINS</span>
                      <span className="block text-sm font-bold text-black">{standing.wins}</span>
                    </div>

                    <div className="text-right font-mono space-y-0.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">POINTS</span>
                      <span className="block text-2xl font-black text-black leading-none">{standing.points}</span>
                    </div>
                  </div>

                  {/* Interactive Floating Tooltip (Hover) */}
                  <div className="absolute left-1/2 bottom-[105%] -translate-x-1/2 w-64 bg-neutral-950 border border-neutral-800 rounded-xl p-4 shadow-xl text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 space-y-3 mb-2">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <span className="text-xs font-bold text-gray-200">{standing.Constructor.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase font-bold text-red-500">TEAM INFO</span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-1.5 text-xs font-medium">
                      <div>
                        <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider font-bold">Base Country</span>
                        <span className="text-gray-200">{standing.Constructor.nationality}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-gray-550 uppercase tracking-wider font-bold">Championship Gap</span>
                        <span className="text-red-400 font-mono font-bold">
                          {idx === 0 ? 'Leader (P1)' : `-${maxConstructorPoints - parseFloat(standing.points)} pts`}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-gray-550 uppercase tracking-wider font-bold">Constructor Wins</span>
                        <span className="text-amber-400 font-bold font-mono">{standing.wins} wins</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-gray-550 uppercase tracking-wider font-bold font-bold">Total Points</span>
                        <span className="text-gray-200 font-mono">{standing.points} pts</span>
                      </div>
                    </div>

                    <div className="border-t border-neutral-800 pt-2 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>Brand Signature Color</span>
                      <span className="font-bold font-mono text-xs" style={{ color: teamColor }}>{teamColor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </motion.div>
  );
}
