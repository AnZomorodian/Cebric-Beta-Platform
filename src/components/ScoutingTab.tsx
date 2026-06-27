import React, { useState } from 'react';
import { Search, UserCheck, Star, Crown, Target, Map } from 'lucide-react';

interface ScoutingTabProps {
  currentUser: any;
  clubRecord: any;
  onRefresh: () => void;
  setStatusMsg: (msg: string | null) => void;
}

export const ScoutingTab: React.FC<ScoutingTabProps> = ({ currentUser, clubRecord, onRefresh, setStatusMsg }) => {
  const [scouting, setScouting] = useState(false);

  const handleScout = async (type: string, slot: number) => {
    if (!clubRecord) {
      setStatusMsg("Please found a club first!");
      return;
    }
    setScouting(true);
    try {
      const res = await fetch('/api/club-manager/scout-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, slot, type })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message);
        onRefresh();
      } else {
        setStatusMsg(data.error);
      }
    } catch (err: any) {
      setStatusMsg(err.message);
    }
    setScouting(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-8">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
        <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
          <Search size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Young Driver Scouting</h2>
          <p className="text-sm text-gray-500">Discover the next generation of F1 stars and sign them to your academy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Local Scout */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Map size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Local Talent Scout</h3>
            <p className="text-xs text-gray-500 mt-2">Search regional feeder series. Drivers are between 16-21 years old with moderate potential.</p>
            <div className="mt-4 inline-block bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">$15,000 Fee</div>
          </div>
          <div className="space-y-2 pt-4">
            <button onClick={() => handleScout('local', 1)} disabled={scouting} className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all">Sign to Seat 1</button>
            <button onClick={() => handleScout('local', 2)} disabled={scouting} className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all">Sign to Seat 2</button>
            <button onClick={() => handleScout('local', 3)} disabled={scouting} className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all">Sign as Test Driver</button>
          </div>
        </div>

        {/* Global Academy */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center space-y-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Target size={20} />
            </div>
            <h3 className="text-lg font-bold text-indigo-900">Global Academy Search</h3>
            <p className="text-xs text-indigo-700/80 mt-2">Scout international F3/F4 champions. Drivers are 16-19 years old with high potential.</p>
            <div className="mt-4 inline-block bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">$50,000 Fee</div>
          </div>
          <div className="space-y-2 pt-4">
            <button onClick={() => handleScout('global', 1)} disabled={scouting} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all">Sign to Seat 1</button>
            <button onClick={() => handleScout('global', 2)} disabled={scouting} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all">Sign to Seat 2</button>
            <button onClick={() => handleScout('global', 3)} disabled={scouting} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all">Sign as Test Driver</button>
          </div>
        </div>

        {/* Poach Rival Academy */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <Crown size={20} />
            </div>
            <h3 className="text-lg font-bold text-amber-900">Poach Rival Academy</h3>
            <p className="text-xs text-amber-700/80 mt-2">Bypass the gamble and pay a premium to steal a guaranteed F2 wonderkid from a rival team.</p>
            <div className="mt-4 inline-block bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">$150,000 Fee</div>
          </div>
          <div className="space-y-2 pt-4">
            <button onClick={() => handleScout('poach', 1)} disabled={scouting} className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm">Sign to Seat 1</button>
            <button onClick={() => handleScout('poach', 2)} disabled={scouting} className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm">Sign to Seat 2</button>
            <button onClick={() => handleScout('poach', 3)} disabled={scouting} className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm">Sign as Test Driver</button>
          </div>
        </div>
      </div>
    </div>
  );
};
