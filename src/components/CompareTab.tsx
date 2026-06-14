import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Award, Shield, User, RefreshCw, Zap, Clock, Flag, Compass } from 'lucide-react';
import { DriverStanding } from '../types';
import { TEAM_HEX, TEAM_BG } from '../data/mockData';

interface TrackConfig {
  name: string;
  benchTime: number; // in seconds
  topSpeed: number; // in km/h
  s1Bench: number; // percentage of total
  s2Bench: number; // percentage of total
  s3Bench: number; // percentage of total
}

const COMPARISON_TRACKS: Record<string, TrackConfig> = {
  monaco: { name: 'Monaco GP (Monte Carlo)', benchTime: 72.4, topSpeed: 295, s1Bench: 0.28, s2Bench: 0.42, s3Bench: 0.30 },
  spa: { name: 'Belgian GP (Spa-Francorchamps)', benchTime: 104.8, topSpeed: 345, s1Bench: 0.29, s2Bench: 0.38, s3Bench: 0.33 },
  monza: { name: 'Italian GP (Monza)', benchTime: 80.2, topSpeed: 358, s1Bench: 0.33, s2Bench: 0.31, s3Bench: 0.36 },
  silverstone: { name: 'British GP (Silverstone)', benchTime: 87.0, topSpeed: 332, s1Bench: 0.31, s2Bench: 0.37, s3Bench: 0.32 },
  bahrain: { name: 'Bahrain GP (Sakhir)', benchTime: 91.2, topSpeed: 328, s1Bench: 0.32, s2Bench: 0.40, s3Bench: 0.28 }
};

interface DriverLapDetails {
  qualifyingBest: number;
  s1: number;
  s2: number;
  s3: number;
  topSpeed: number;
  stintLaps: number[];
  avgTime: number;
  fastestLapIdx: number;
  variance: number;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

const getTelemetry = (driver: any, pos: number, trackKey: string, tire: string, fuel: string): DriverLapDetails => {
  const config = COMPARISON_TRACKS[trackKey] || COMPARISON_TRACKS.monaco;
  
  // base performance based on championship rank.
  // P1 gets -1.2, P20 gets +1.0
  const rankFactor = -1.2 + ((pos - 1) / 19) * 2.2;
  
  // tire compound offsets
  let tireOffset = 0;
  let sAdd = 0;
  if (tire === 'soft') {
    tireOffset = -0.9;
    sAdd = 1.5; 
  } else if (tire === 'medium') {
    tireOffset = 0.0;
    sAdd = 0;
  } else if (tire === 'hard') {
    tireOffset = 0.8;
    sAdd = -2;
  }

  // fuel load offsets
  const fuelOffset = fuel === 'high' ? 3.4 : 0.0;
  
  const baseLapTime = config.benchTime + rankFactor + tireOffset + fuelOffset;
  
  // calculate sectors with slightly distinct characteristics for each driver
  const seed = (driver.Driver.driverId || 'unknown').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  
  const s1Bias = 0.98 + ((seed % 7) / 250); 
  const s2Bias = 0.98 + (((seed >> 1) % 7) / 250);

  const s1 = baseLapTime * config.s1Bench * s1Bias;
  const s2 = baseLapTime * config.s2Bench * s2Bias;
  const s3 = baseLapTime * (1 - (config.s1Bench * s1Bias + config.s2Bench * s2Bias));
  
  const qualifyingBest = s1 + s2 + s3;
  
  // Speed trap
  const speedWeight = (21 - pos) * 0.8; 
  const speedBias = 0.99 + ((seed % 5) / 200);
  const topSpeed = Math.floor((config.topSpeed + speedWeight + sAdd) * speedBias);
  
  // 10-lap stint simulation
  const stintLaps: number[] = [];
  const degFactor = tire === 'soft' ? 0.16 : tire === 'medium' ? 0.09 : 0.03;
  
  for (let l = 1; l <= 10; l++) {
    const lapNoise = Math.sin(l + seed) * 0.12; 
    const lapTime = qualifyingBest + (l * degFactor) + 0.4 + lapNoise;
    stintLaps.push(lapTime);
  }
  
  const avgTime = stintLaps.reduce((a, b) => a + b, 0) / stintLaps.length;
  const minLap = Math.min(...stintLaps);
  const fastestLapIdx = stintLaps.indexOf(minLap);
  
  // standard deviation
  const variance = Math.sqrt(stintLaps.reduce((acc, val) => acc + Math.pow(val - avgTime, 2), 0) / stintLaps.length);

  return {
    qualifyingBest,
    s1,
    s2,
    s3,
    topSpeed,
    stintLaps,
    avgTime,
    fastestLapIdx,
    variance
  };
};

interface CompareTabProps {
  driverStandings: DriverStanding[];
  isLoading: boolean;
  season: string;
}

export default function CompareTab({ driverStandings, isLoading, season }: CompareTabProps) {
  const [driverAId, setDriverAId] = useState<string>('');
  const [driverBId, setDriverBId] = useState<string>('');
  const [selectedTrack, setSelectedTrack] = useState<string>('monaco');
  const [tireCompound, setTireCompound] = useState<'soft' | 'medium' | 'hard'>('soft');
  const [fuelLoad, setFuelLoad] = useState<'low' | 'high'>('low');

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

  const telemetryA = driverA ? getTelemetry(driverA, posA, selectedTrack, tireCompound, fuelLoad) : null;
  const telemetryB = driverB ? getTelemetry(driverB, posB, selectedTrack, tireCompound, fuelLoad) : null;

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
              <option key={ds.Driver.driverId} value={ds.Driver.driverId}>
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

          {/* LAP TIME & TELEMETRY BATTLE SECTION */}
          <div className="md:col-span-12 space-y-6 pt-6 border-t border-gray-150" id="lap-time-analysis-section">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
              <div className="space-y-1 select-none">
                <div className="flex items-center gap-1.5 text-xs text-red-500 font-bold uppercase tracking-wider font-mono">
                  <Clock size={13} className="animate-pulse" />
                  <span>Interactive Battle Lab</span>
                </div>
                <h3 className="text-xl font-extrabold text-black tracking-tight">
                  Lap Time & Sector Telemetry Simulator
                </h3>
                <p className="text-xs text-gray-400">
                  Contrast real-time qualifying benchmarks, sector splits, speed trap V-Max, and tire wear degradations.
                </p>
              </div>

              {/* Simulation Selectors */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Circuit selector */}
                <div className="space-y-1 min-w-[150px]">
                  <span className="block text-[9px] font-bold font-mono text-gray-400 uppercase tracking-widest">Select Circuit</span>
                  <select
                    value={selectedTrack}
                    onChange={(e) => setSelectedTrack(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg py-2 px-3 outline-none focus:ring-1 focus:ring-black"
                  >
                    {Object.entries(COMPARISON_TRACKS).map(([key, value]) => (
                      <option key={key} value={key}>{value.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tire compound */}
                <div className="space-y-1 min-w-[125px]">
                  <span className="block text-[9px] font-bold font-mono text-gray-400 uppercase tracking-widest">Tire Compound</span>
                  <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                    {(['soft', 'medium', 'hard'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTireCompound(t)}
                        className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded transition-all duration-150 flex-1 ${
                          tireCompound === t
                            ? t === 'soft'
                              ? 'bg-[#EF1A2D] text-white shadow-sm'
                              : t === 'medium'
                              ? 'bg-[#FFB703] text-black shadow-sm'
                              : 'bg-[#5B5D5C] text-white shadow-sm'
                            : 'text-gray-400 hover:text-black'
                        }`}
                      >
                        {t[0].toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel Load */}
                <div className="space-y-1 min-w-[110px]">
                  <span className="block text-[9px] font-bold font-mono text-gray-400 uppercase tracking-widest">Fuel Strategy</span>
                  <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                    {(['low', 'high'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFuelLoad(f)}
                        className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded transition-all duration-150 flex-1 ${
                          fuelLoad === f
                            ? 'bg-black text-white shadow-sm'
                            : 'text-gray-400 hover:text-black'
                        }`}
                      >
                        {f === 'low' ? 'QUALY' : 'HEAVY'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance analysis charts/grids */}
            {telemetryA && telemetryB && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sector splits & speed trap */}
                <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <h4 className="text-xs font-black font-mono text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">
                      Sectors & Speed Trap Analysis
                    </h4>

                    {/* Sectors splits column */}
                    <div className="space-y-4 pt-4">
                      {/* Sector 1 */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400">
                          <span>SECTOR 1 (SPEED/FLOW)</span>
                          <span className="text-gray-500 font-bold">
                            {telemetryA.s1 < telemetryB.s1 ? `${driverA.Driver.code} -${(telemetryB.s1 - telemetryA.s1).toFixed(3)}s` : `${driverB.Driver.code} -${(telemetryA.s1 - telemetryB.s1).toFixed(3)}s`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-2.5 rounded-xl border transition-all duration-150 ${telemetryA.s1 <= telemetryB.s1 ? 'bg-green-50/40 border-green-200 text-green-950' : 'bg-gray-50/40 border-gray-100 text-gray-800'}`}>
                            <span className="block text-[8px] font-mono text-gray-400 font-bold">{driverA.Driver.familyName}</span>
                            <span className="text-sm font-black font-mono leading-none">{telemetryA.s1.toFixed(3)}s</span>
                          </div>
                          <div className={`p-2.5 rounded-xl border transition-all duration-150 ${telemetryB.s1 <= telemetryA.s1 ? 'bg-green-50/40 border-green-200 text-green-950' : 'bg-gray-50/40 border-gray-100 text-gray-800'}`}>
                            <span className="block text-[8px] font-mono text-gray-400 font-bold">{driverB.Driver.familyName}</span>
                            <span className="text-sm font-black font-mono leading-none">{telemetryB.s1.toFixed(3)}s</span>
                          </div>
                        </div>
                      </div>

                      {/* Sector 2 */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400">
                          <span>SECTOR 2 (TECHNICAL CORNERS)</span>
                          <span className="text-gray-500 font-bold">
                            {telemetryA.s2 < telemetryB.s2 ? `${driverA.Driver.code} -${(telemetryB.s2 - telemetryA.s2).toFixed(3)}s` : `${driverB.Driver.code} -${(telemetryA.s2 - telemetryB.s2).toFixed(3)}s`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-2.5 rounded-xl border transition-all duration-150 ${telemetryA.s2 <= telemetryB.s2 ? 'bg-green-50/40 border-green-200 text-green-950' : 'bg-gray-50/40 border-gray-100 text-gray-800'}`}>
                            <span className="block text-[8px] font-mono text-gray-400 font-bold">{driverA.Driver.familyName}</span>
                            <span className="text-sm font-black font-mono leading-none">{telemetryA.s2.toFixed(3)}s</span>
                          </div>
                          <div className={`p-2.5 rounded-xl border transition-all duration-150 ${telemetryB.s2 <= telemetryA.s2 ? 'bg-green-50/40 border-green-200 text-green-950' : 'bg-gray-50/40 border-gray-100 text-gray-800'}`}>
                            <span className="block text-[8px] font-mono text-gray-400 font-bold">{driverB.Driver.familyName}</span>
                            <span className="text-sm font-black font-mono leading-none">{telemetryB.s2.toFixed(3)}s</span>
                          </div>
                        </div>
                      </div>

                      {/* Sector 3 */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400">
                          <span>SECTOR 3 (TRACTION STRETCH)</span>
                          <span className="text-gray-500 font-bold">
                            {telemetryA.s3 < telemetryB.s3 ? `${driverA.Driver.code} -${(telemetryB.s3 - telemetryA.s3).toFixed(3)}s` : `${driverB.Driver.code} -${(telemetryA.s3 - telemetryB.s3).toFixed(3)}s`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-2.5 rounded-xl border transition-all duration-150 ${telemetryA.s3 <= telemetryB.s3 ? 'bg-green-50/40 border-green-200 text-green-950' : 'bg-gray-50/40 border-gray-100 text-gray-800'}`}>
                            <span className="block text-[8px] font-mono text-gray-400 font-bold">{driverA.Driver.familyName}</span>
                            <span className="text-sm font-black font-mono leading-none">{telemetryA.s3.toFixed(3)}s</span>
                          </div>
                          <div className={`p-2.5 rounded-xl border transition-all duration-150 ${telemetryB.s3 <= telemetryA.s3 ? 'bg-green-50/40 border-green-200 text-green-950' : 'bg-gray-50/40 border-gray-100 text-gray-800'}`}>
                            <span className="block text-[8px] font-mono text-gray-400 font-bold">{driverB.Driver.familyName}</span>
                            <span className="text-sm font-black font-mono leading-none">{telemetryB.s3.toFixed(3)}s</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Theoretical best block */}
                  <div className="bg-neutral-900 border border-neutral-850 text-white rounded-xl p-4 flex items-center justify-between leading-none shadow select-none my-4">
                    <div>
                      <span className="block text-[8.5px] font-bold font-mono text-gray-400 uppercase tracking-widest">Theoretical Best Lap</span>
                      <span className="block text-sm font-black font-mono text-emerald-400 mt-2">
                        {driverA.Driver.code}: {formatTime(telemetryA.qualifyingBest)}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-neutral-800" />
                    <div className="text-right">
                      <span className="block text-[8.5px] font-bold font-mono text-gray-400 uppercase tracking-widest">Theoretical Best Lap</span>
                      <span className="block text-sm font-black font-mono text-emerald-400 mt-2">
                        {driverB.Driver.code}: {formatTime(telemetryB.qualifyingBest)}
                      </span>
                    </div>
                  </div>

                  {/* Speed Trap V-Max */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-mono font-bold text-gray-400 leading-none">
                      <span>SPEED TRAP V-MAX</span>
                      <span className="text-black font-extrabold">{Math.max(telemetryA.topSpeed, telemetryB.topSpeed)} KM/H PEAK</span>
                    </div>
                    <div className="space-y-2.5">
                      {/* Driver A bar */}
                      <div>
                        <div className="flex justify-between text-[10px] font-semibold text-gray-500 mb-1 leading-none">
                          <span>{driverA.Driver.familyName} ({driverA.Driver.code})</span>
                          <span className="font-mono text-black font-bold">{telemetryA.topSpeed} km/h</span>
                        </div>
                        <div className="w-full h-2 bg-gray-150 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(telemetryA.topSpeed / 380) * 100}%`,
                              backgroundColor: TEAM_HEX[driverA.Constructors?.[0]?.constructorId || ''] || '#ef4444'
                            }}
                          />
                        </div>
                      </div>
                      {/* Driver B bar */}
                      <div>
                        <div className="flex justify-between text-[10px] font-semibold text-gray-500 mb-1 leading-none">
                          <span>{driverB.Driver.familyName} ({driverB.Driver.code})</span>
                          <span className="font-mono text-black font-bold">{telemetryB.topSpeed} km/h</span>
                        </div>
                        <div className="w-full h-2 bg-gray-150 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(telemetryB.topSpeed / 380) * 100}%`,
                              backgroundColor: TEAM_HEX[driverB.Constructors?.[0]?.constructorId || ''] || '#3b82f6'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10-Lap Stint Telemetry Analysis */}
                <div className="lg:col-span-7 bg-white border border-gray-150 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <h4 className="text-xs font-black font-mono text-gray-400 uppercase tracking-widest">
                        10-Lap Stint Pace Telemetry
                      </h4>
                      <span className="text-[9px] font-mono font-bold text-purple-600 bg-purple-100/60 px-2 py-0.5 rounded leading-none">
                        STINT TIMING ANALYSIS
                      </span>
                    </div>

                    {/* Double line custom SVG chart */}
                    {(() => {
                      const allStintlaps = [...telemetryA.stintLaps, ...telemetryB.stintLaps];
                      const chartMin = Math.min(...allStintlaps) - 0.15;
                      const chartMax = Math.max(...allStintlaps) + 0.15;
                      const chartRange = chartMax - chartMin || 1;

                      // Map function to generate polyline points string
                      const width = 500;
                      const height = 180;
                      const paddingX = 40;
                      const paddingY = 20;
                      const plotWidth = width - paddingX * 2;
                      const plotHeight = height - paddingY * 2;

                      const getPointsStr = (laps: number[]) => {
                        return laps.map((val, idx) => {
                          const x = paddingX + (idx / 9) * plotWidth;
                          const y = height - paddingY - ((val - chartMin) / chartRange) * plotHeight;
                          return `${x},${y}`;
                        }).join(' ');
                      };

                      const pointsAStr = getPointsStr(telemetryA.stintLaps);
                      const pointsBStr = getPointsStr(telemetryB.stintLaps);
                      
                      const colorA = TEAM_HEX[driverA.Constructors?.[0]?.constructorId || ''] || '#ef4444';
                      const colorB = TEAM_HEX[driverB.Constructors?.[0]?.constructorId || ''] || '#3b82f6';

                      return (
                        <div id="telemetry-chart-container" className="pt-4 space-y-4">
                          {/* Legend & Pace Details info box overlay */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[10px] font-mono font-bold text-gray-500 select-none bg-gray-50/80 border border-gray-150 p-3 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: colorA }} />
                                <span className="text-black">{driverA.Driver.code}: {formatTime(telemetryA.avgTime)} Avg</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: colorB }} />
                                <span className="text-black">{driverB.Driver.code}: {formatTime(telemetryB.avgTime)} Avg</span>
                              </div>
                            </div>
                            <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">LOWER LINE IS BETTER PACING</span>
                          </div>

                          {/* Responsive SVG */}
                          <div className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 h-56 select-none overflow-hidden hover:border-neutral-800 transition-colors">
                            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                              {/* Horizontal Grid lines */}
                              {Array.from({ length: 4 }).map((_, i) => {
                                const val = chartMin + (i * chartRange) / 3;
                                const y = height - paddingY - (i / 3) * plotHeight;
                                return (
                                  <g key={i} className="opacity-10">
                                    <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#fff" strokeWidth="0.5" strokeDasharray="3,3" />
                                    <text x={paddingX - 10} y={y + 3} fill="#fff" fontSize="8" fontFamily="monospace" textAnchor="end">
                                      {val.toFixed(1)}s
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Vertical Grid lines for 10 laps */}
                              {telemetryA.stintLaps.map((_, idx) => {
                                const x = paddingX + (idx / 9) * plotWidth;
                                return (
                                  <g key={idx} className="opacity-10">
                                    <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke="#fff" strokeWidth="0.5" />
                                    <text x={x} y={height - paddingY + 12} fill="#fff" fontSize="8" fontFamily="monospace" textAnchor="middle">
                                      L{idx + 1}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Plot lines */}
                              <polyline points={pointsAStr} fill="none" stroke={colorA} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              <polyline points={pointsBStr} fill="none" stroke={colorB} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                              {/* Plot points markers with tooltip hover styles */}
                              {telemetryA.stintLaps.map((val, idx) => {
                                const x = paddingX + (idx / 9) * plotWidth;
                                const y = height - paddingY - ((val - chartMin) / chartRange) * plotHeight;
                                return (
                                  <g key={`marker-a-${idx}`} className="group/dot cursor-pointer">
                                    <circle cx={x} cy={y} r="3" fill={colorA} stroke="#000" strokeWidth="1" className="hover:scale-150 transition-transform" />
                                    <title>{driverA.Driver.code} Lap {idx+1}: {formatTime(val)}</title>
                                  </g>
                                );
                              })}
                              {telemetryB.stintLaps.map((val, idx) => {
                                const x = paddingX + (idx / 9) * plotWidth;
                                const y = height - paddingY - ((val - chartMin) / chartRange) * plotHeight;
                                return (
                                  <g key={`marker-b-${idx}`} className="group/dot cursor-pointer">
                                    <circle cx={x} cy={y} r="3" fill={colorB} stroke="#000" strokeWidth="1" className="hover:scale-150 transition-transform" />
                                    <title>{driverB.Driver.code} Lap {idx+1}: {formatTime(val)}</title>
                                  </g>
                                );
                              })}
                            </svg>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Stint lap log table details side-by-side */}
                  <div className="pt-2">
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono font-bold text-gray-400 mb-2 leading-none">
                      <span>{driverA.Driver.code} PACE CHART</span>
                      <span className="text-right">{driverB.Driver.code} PACE CHART</span>
                    </div>

                    <div className="max-h-40 overflow-y-auto border border-gray-150 rounded-xl divide-y divide-gray-100 bg-gray-50/20 pr-1 text-[11px] font-mono text-gray-500 shadow-inner">
                      {telemetryA.stintLaps.map((lapA, idx) => {
                        const lapB = telemetryB.stintLaps[idx];
                        const isAFaster = lapA < lapB;
                        const isAFastestStint = idx === telemetryA.fastestLapIdx;
                        const isBFastestStint = idx === telemetryB.fastestLapIdx;

                        return (
                          <div key={idx} className="flex justify-between items-center py-2 px-3 hover:bg-white transition-colors">
                            <div className="flex items-center gap-1.5 leading-none">
                              <span className="text-gray-400 text-[9px] w-8">Lap {idx+1}</span>
                              <span className={`font-bold ${isAFaster ? 'text-green-600 font-extrabold' : 'text-gray-800'}`}>
                                {formatTime(lapA)}
                              </span>
                              {isAFastestStint && <span className="bg-purple-150 text-purple-700 text-[7.5px] px-1 py-0.5 rounded font-black tracking-wider uppercase leading-none shadow-xs">🟣 BEST</span>}
                            </div>
                            <div className="flex items-center gap-1.5 text-right justify-end leading-none">
                              {isBFastestStint && <span className="bg-purple-150 text-purple-700 text-[7.5px] px-1 py-0.5 rounded font-black tracking-wider uppercase leading-none shadow-xs">🟣 BEST</span>}
                              <span className={`font-bold ${!isAFaster ? 'text-green-600 font-extrabold' : 'text-gray-800'}`}>
                                {formatTime(lapB)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="py-20 text-center text-gray-400">
          Make sure at least two active drivers are loaded to carry out comparison.
        </div>
      )}
    </motion.div>
  );
}
