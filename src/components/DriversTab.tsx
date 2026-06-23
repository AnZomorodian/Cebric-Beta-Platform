import { motion } from 'motion/react';
import { User, Globe, Calendar, ExternalLink } from 'lucide-react';
import { DriverStanding } from '../types';
import { TEAM_HEX, TEAM_BG } from '../data/mockData';

interface DriversTabProps {
  driverStandings: DriverStanding[];
  isLoading: boolean;
  season: string;
}

export default function DriversTab({ driverStandings, isLoading, season }: DriversTabProps) {
  if (isLoading) {
    return (
      <div id="drivers-loading" className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400 font-mono tracking-widest">LOADING TEAM ROSTER...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      id="drivers-view"
      className="space-y-8"
    >
      <header className="space-y-1.5 select-none">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 font-mono uppercase">
          DRIVERS & TEAMS LINEUP
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-black">
          {season} Driver Roster
        </h1>
        <p className="text-sm text-gray-500 max-w-xl">
          Detailed profiles and race numbers of active Formula 1 drivers competing in the {season} Season. 
        </p>
      </header>

      {driverStandings.length === 0 ? (
        <div className="py-20 text-center text-gray-400 border border-dashed border-gray-150 rounded-2xl bg-gray-50/20">
          No driver details recovered for active year.
        </div>
      ) : (
        <div 
          id="drivers-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {driverStandings.map((standing) => {
            const driver = standing.Driver;
            const constructor = standing.Constructors?.[0];
            const teamId = constructor?.constructorId || 'unknown';
            const teamColor = TEAM_HEX[teamId] || '#cbd5e1';
            const teamBg = TEAM_BG[teamId] || 'bg-gray-100';

            return (
              <div
                key={driver.driverId}
                id={`driver-card-${driver.driverId}`}
                className="bg-white border border-gray-150 hover:border-gray-250 hover:shadow-md transition-all duration-300 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group h-[220px]"
              >
                {/* Large Background Driver Number */}
                {driver.permanentNumber && (
                  <span 
                    id={`driver-bg-num-${driver.driverId}`}
                    className="absolute right-3 top-3 text-7xl font-sans font-black outline-text text-black opacity-5 group-hover:opacity-[0.08] transition-opacity duration-300 font-mono pointer-events-none select-none tracking-tighter"
                  >
                    {driver.permanentNumber}
                  </span>
                )}

                {/* Main Content */}
                <div className="space-y-3">
                  {/* Team Tag Badge */}
                  <span
                    className={`inline-block text-[10px] font-extrabold tracking-wider font-mono uppercase px-2 py-0.5 rounded ${teamBg}`}
                    style={{ color: teamColor }}
                  >
                    {constructor?.name || 'Independent'}
                  </span>

                  <div>
                    <h3 className="text-xl font-extrabold text-black tracking-tight leading-tight">
                      {driver.givenName} {driver.familyName}
                    </h3>
                    {driver.code && (
                      <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
                        {driver.code}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub Metadata List */}
                <div className="space-y-2 text-xs text-gray-400 pt-3 border-t border-gray-100/60 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Globe size={12} className="text-gray-450" />
                    <span>Nationality: <strong className="text-gray-700 font-semibold">{driver.nationality}</strong></span>
                  </div>
                  {driver.dateOfBirth && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-450" />
                      <span>Born: <strong className="text-gray-700 font-semibold">{driver.dateOfBirth}</strong></span>
                    </div>
                  )}
                  {driver.url && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-dashed border-gray-100 mt-1">
                      <ExternalLink size={12} className="text-[#EF1A2D]" />
                      <a 
                        href={driver.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[#EF1A2D] hover:underline font-bold text-[10px] uppercase font-mono tracking-wider"
                        title={`${driver.givenName} Wikipedia BIO`}
                      >
                        Wiki Bio
                      </a>
                      {constructor?.url && (
                        <>
                          <span className="text-gray-300">•</span>
                          <a 
                            href={constructor.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-gray-500 hover:text-black hover:underline text-[10px] uppercase font-mono font-bold tracking-wider"
                            title={`${constructor.name} Team Wiki`}
                          >
                            team wiki
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </div>


              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
